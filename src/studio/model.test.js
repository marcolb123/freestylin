import { describe, it, expect } from "vitest";
import {
  buildLabPrompt,
  sessionPhase,
  totalSessionSeconds,
  sessionDraft,
  journalStats,
  mergeJournalDraft,
} from "./model";
import { readStored, validEntries, validPlaylists } from "./storage";

describe("dictionary to lab", () => {
  it("requires real movements for connections, including after duplicate IDs are removed", () => {
    expect(() =>
      buildLabPrompt("connections", ["two-step", "two-step", "unknown"]),
    ).toThrow("at least 2");
    expect(
      buildLabPrompt("connections", ["two-step", "smurf"]).movementNames,
    ).toEqual(["Two Step", "Smurf"]);
  });
  it("allows an open freestyle constraint and rejects an empty variation plan", () => {
    expect(buildLabPrompt("constraints", []).movementNames).toEqual([]);
    expect(() => buildLabPrompt("variation", [])).toThrow("at least 1");
  });
});
const config = { rounds: 3, roundSeconds: 60, restSeconds: 15 };
describe("round timing", () => {
  it("adds rests only between rounds", () => {
    expect(totalSessionSeconds(config)).toBe(210);
    expect(totalSessionSeconds({ ...config, rounds: 1 })).toBe(60);
  });
  it("changes to rest and then the next round at exact boundaries", () => {
    expect(sessionPhase(config, 59999)).toMatchObject({
      name: "Explore",
      round: 1,
      remaining: 1,
    });
    expect(sessionPhase(config, 60000)).toMatchObject({
      name: "Rest",
      round: 1,
      remaining: 15,
    });
    expect(sessionPhase(config, 75000)).toMatchObject({
      name: "Explore",
      round: 2,
      remaining: 60,
    });
    expect(sessionPhase(config, 210000)).toMatchObject({
      name: "Complete",
      remaining: 0,
      complete: true,
    });
  });
  it("handles zero-rest rounds and a browser waking after the session has finished", () => {
    expect(sessionPhase({ ...config, restSeconds: 0 }, 60000)).toMatchObject({
      name: "Explore",
      round: 2,
    });
    expect(sessionPhase(config, 999999)).toMatchObject({
      complete: true,
      progress: 1,
    });
  });
  it("logs actual elapsed time, capped to the planned session duration", () => {
    const plan = { ...config, ...buildLabPrompt("variation", ["two-step"]) };
    expect(sessionDraft(plan, 30000, 90).durationMinutes).toBe(1);
    expect(sessionDraft(plan, 0, 90).durationMinutes).toBe(0);
    expect(sessionDraft(plan, 900000, 90).durationMinutes).toBe(4);
    expect(sessionDraft(plan, 30000, 90).notes).toContain("Two Step");
  });
});
describe("journal continuity", () => {
  it("appends a lab draft to an existing daily log without losing prior prompts, notes or energy", () => {
    const old = {
      prompts: ["mongo-prompt-id"],
      notes: "Earlier practice",
      durationMinutes: 25,
      energy: 4,
      moves: ["Smurf"],
    };
    const next = mergeJournalDraft(old, {
      notes: "New lab",
      durationMinutes: 10,
      moves: ["Smurf", "Two Step"],
    });
    expect(next).toEqual({
      prompts: ["mongo-prompt-id"],
      notes: "Earlier practice\n\nNew lab",
      durationMinutes: 35,
      energy: 4,
      moves: ["Smurf", "Two Step"],
    });
  });
  it("counts consecutive local calendar days across a month boundary and permits a streak ending yesterday", () => {
    const entries = ["2026-10-31", "2026-11-01", "2026-11-02"].map((date) => ({
      date,
      durationMinutes: 20,
    }));
    expect(journalStats(entries, "2026-11-03")).toEqual({
      sessions: 3,
      minutes: 60,
      streak: 3,
    });
    expect(journalStats(entries, "2026-11-04").streak).toBe(0);
  });
  it("does not count duplicate dates twice in a streak", () => {
    expect(
      journalStats(
        [{ date: "2026-11-06" }, { date: "2026-11-06" }],
        "2026-11-06",
      ).streak,
    ).toBe(1);
  });
});
describe("browser persistence recovery", () => {
  it("recovers safely from unavailable storage and malformed JSON", () => {
    expect(
      readStored(
        {
          getItem() {
            throw new Error("disabled");
          },
        },
        "x",
        [],
      ),
    ).toEqual([]);
    expect(
      readStored(
        {
          getItem() {
            return "{broken";
          },
        },
        "x",
        [],
      ),
    ).toEqual([]);
  });
  it("rejects malformed playlist and journal data before rendering", () => {
    expect(
      validPlaylists([{ id: "1", name: "Practice", trackIds: null }]),
    ).toBe(false);
    expect(
      validEntries([
        { date: "2026-11-06", notes: "Hi", durationMinutes: "fifty" },
      ]),
    ).toBe(false);
    expect(
      readStored(
        {
          getItem() {
            return '{"wrong":true}';
          },
        },
        "x",
        [],
        validPlaylists,
      ),
    ).toEqual([]);
  });
});
