import { LAB_MODES, MODE_PROMPTS, MOVES } from "./data";

export function buildLabPrompt(mode, ids, variation = 0) {
  const definition = LAB_MODES.find((item) => item.id === mode);
  if (!definition) throw new Error("Choose a lab format.");
  const selected = [...new Set(ids)]
    .map((id) => MOVES.find((move) => move.id === id))
    .filter(Boolean);
  if (selected.length < definition.minMoves)
    throw new Error(
      `Choose at least ${definition.minMoves} movement${definition.minMoves === 1 ? "" : "s"} from the dictionary.`,
    );
  return {
    mode,
    title: definition.title,
    movementNames: selected.map((move) => move.name),
    prompt: MODE_PROMPTS[mode][variation % MODE_PROMPTS[mode].length],
  };
}
export function totalSessionSeconds({ rounds, roundSeconds, restSeconds }) {
  return rounds * roundSeconds + Math.max(0, rounds - 1) * restSeconds;
}
export function sessionPhase(config, elapsedMs) {
  const elapsed = Math.max(0, Math.floor(elapsedMs / 1000));
  const total = totalSessionSeconds(config);
  if (elapsed >= total)
    return {
      name: "Complete",
      round: config.rounds,
      remaining: 0,
      complete: true,
      progress: 1,
    };
  const block = config.roundSeconds + config.restSeconds;
  const index = Math.floor(elapsed / block);
  const position = elapsed % block;
  const resting = position >= config.roundSeconds;
  return {
    name: resting ? "Rest" : "Explore",
    round: index + 1,
    remaining: resting ? block - position : config.roundSeconds - position,
    complete: false,
    progress: elapsed / total,
  };
}
export function formatTimer(seconds) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}
export function sessionDraft(session, elapsedMs, bpm) {
  return {
    notes: [
      `Hip-Hop · ${session.title}`,
      `Movements: ${session.movementNames.join(", ") || "Open freestyle"}`,
      `Exploration: ${session.prompt}`,
      `Plan: ${session.rounds} × ${session.roundSeconds}s, ${session.restSeconds}s rests. Metronome setting: ${bpm} BPM.`,
      "",
      "What did you discover?",
      "What will you revisit?",
    ].join("\n"),
    durationMinutes: Math.min(
      1440,
      Math.round(Math.min(elapsedMs / 1000, totalSessionSeconds(session)) / 60),
    ),
    moves: session.movementNames,
  };
}
export function journalStats(entries, today) {
  const dates = new Set(entries.map((item) => item.date));
  const cursor = new Date(`${today}T12:00:00`);
  const iso = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  if (!dates.has(iso(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (dates.has(iso(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return {
    sessions: entries.length,
    minutes: entries.reduce(
      (sum, item) => sum + Number(item.durationMinutes || 0),
      0,
    ),
    streak,
  };
}
export function mergeJournalDraft(existing, draft) {
  return {
    prompts: existing?.prompts || [],
    notes: [existing?.notes, draft?.notes].filter(Boolean).join("\n\n"),
    durationMinutes: Math.min(
      1440,
      Number(existing?.durationMinutes || 0) +
        Number(draft?.durationMinutes || 0),
    ),
    energy: existing?.energy ?? null,
    moves: [...new Set([...(existing?.moves || []), ...(draft?.moves || [])])],
  };
}
