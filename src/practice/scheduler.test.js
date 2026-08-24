import { describe, it, expect } from 'vitest';
import {
    MIN_BPM, MAX_BPM, DEFAULT_BPM, COUNTS_PER_CYCLE,
    clampBpm, secondsPerBeat, secondsPerTick, normaliseSubdivision,
    ticksPerCycle, advanceTick, isDownbeat, isCount, countNumber,
    collectDue, resyncIfBehind, bpmFromTaps
} from './scheduler';

describe('clampBpm', () => {
    it('keeps a sane tempo untouched', () => {
        expect(clampBpm(120)).toBe(120);
    });

    it('clamps to the supported range', () => {
        expect(clampBpm(5)).toBe(MIN_BPM);
        expect(clampBpm(9000)).toBe(MAX_BPM);
    });

    it('rounds fractional tempos', () => {
        expect(clampBpm(119.6)).toBe(120);
    });

    it('falls back for values that are not usable numbers', () => {
        expect(clampBpm(NaN)).toBe(DEFAULT_BPM);
        expect(clampBpm(undefined)).toBe(DEFAULT_BPM);
        // Infinity is not a tempo. Falling back to the default is safer than
        // silently pinning the dancer to 240.
        expect(clampBpm(Infinity)).toBe(DEFAULT_BPM);
        expect(clampBpm(-Infinity)).toBe(DEFAULT_BPM);
    });
});

describe('tempo maths', () => {
    it('converts bpm to seconds per beat', () => {
        expect(secondsPerBeat(120)).toBeCloseTo(0.5, 10);
        expect(secondsPerBeat(60)).toBeCloseTo(1, 10);
    });

    it('divides the beat by the subdivision', () => {
        expect(secondsPerTick(120, 1)).toBeCloseTo(0.5, 10);
        expect(secondsPerTick(120, 2)).toBeCloseTo(0.25, 10);
        expect(secondsPerTick(120, 4)).toBeCloseTo(0.125, 10);
    });

    it('treats an unsupported subdivision as quarters', () => {
        expect(normaliseSubdivision(3)).toBe(1);
        expect(normaliseSubdivision(undefined)).toBe(1);
        expect(secondsPerTick(120, 3)).toBeCloseTo(0.5, 10);
    });
});

describe('the 8-count cycle', () => {
    it('cycles over 8 counts at quarters', () => {
        expect(ticksPerCycle(1)).toBe(COUNTS_PER_CYCLE);
        let tick = 0;
        for (let i = 0; i < 7; i++) tick = advanceTick(tick, 1);
        expect(tick).toBe(7);
        expect(advanceTick(tick, 1)).toBe(0); // wraps back to the 1
    });

    it('cycles over 16 ticks at eighths', () => {
        expect(ticksPerCycle(2)).toBe(16);
        expect(advanceTick(15, 2)).toBe(0);
    });

    it('accents only the 1', () => {
        expect(isDownbeat(0)).toBe(true);
        expect(isDownbeat(1)).toBe(false);
    });

    it('separates counts from the "and"s between them', () => {
        // At eighths, even ticks are the numbers and odd ticks are the "and"s.
        expect(isCount(0, 2)).toBe(true);
        expect(isCount(1, 2)).toBe(false);
        expect(isCount(2, 2)).toBe(true);
    });

    it('reports the number a dancer would call out', () => {
        expect(countNumber(0, 1)).toBe(1);
        expect(countNumber(7, 1)).toBe(8);
        // "3 and" is still count 3
        expect(countNumber(4, 2)).toBe(3);
        expect(countNumber(5, 2)).toBe(3);
    });
});

describe('collectDue', () => {
    it('queues only the notes inside the runway', () => {
        // 120bpm = 0.5s per beat; a 0.1s window from t=0 holds just the first.
        const { notes, nextTime, tick } = collectDue({
            nextTime: 0, tick: 0, bpm: 120, subdivision: 1, until: 0.1
        });
        expect(notes).toHaveLength(1);
        expect(notes[0]).toMatchObject({ tick: 0, time: 0, downbeat: true, count: 1 });
        expect(nextTime).toBeCloseTo(0.5, 10);
        expect(tick).toBe(1);
    });

    it('queues several when the window spans them', () => {
        const { notes } = collectDue({
            nextTime: 0, tick: 0, bpm: 120, subdivision: 1, until: 1.6
        });
        expect(notes.map(n => n.time)).toEqual([0, 0.5, 1, 1.5]);
        expect(notes.map(n => n.count)).toEqual([1, 2, 3, 4]);
    });

    it('is exclusive of the window end', () => {
        const { notes } = collectDue({
            nextTime: 0, tick: 0, bpm: 120, subdivision: 1, until: 0.5
        });
        expect(notes).toHaveLength(1); // the note exactly at 0.5 belongs to the next window
    });

    it('resumes from a mid-cycle cursor', () => {
        const { notes, tick } = collectDue({
            nextTime: 10, tick: 6, bpm: 120, subdivision: 1, until: 11.1
        });
        expect(notes.map(n => n.tick)).toEqual([6, 7, 0]); // wraps through the 8
        expect(notes.map(n => n.downbeat)).toEqual([false, false, true]);
        expect(tick).toBe(1);
    });

    it('caps runaway windows instead of hanging', () => {
        const { notes, cappedOut } = collectDue({
            nextTime: 0, tick: 0, bpm: 240, subdivision: 4, until: 10_000, maxNotes: 64
        });
        expect(notes).toHaveLength(64);
        expect(cappedOut).toBe(true);
    });
});

describe('drift', () => {
    // The test that would catch a regression to naive setInterval timing:
    // schedule a full minute in realistic 100ms chunks and check the last
    // beat still lands where the maths says it should.
    // Drive the scheduler the way the real loop does: 100ms windows, cursor
    // carried between them. Window bounds are derived from an integer index
    // rather than accumulated — adding 0.1 repeatedly drifts, which would put
    // the float bug in the harness instead of the code under test.
    const runMinute = (bpm, subdivision) => {
        const WINDOWS = 600;                 // 600 x 100ms = 60s exactly
        let cursor = { nextTime: 0, tick: 0 };
        const all = [];
        for (let i = 0; i < WINDOWS; i++) {
            const res = collectDue({ ...cursor, bpm, subdivision, until: (i + 1) / 10 });
            all.push(...res.notes);
            cursor = { nextTime: res.nextTime, tick: res.tick };
        }
        return all;
    };

    it('stays sample-accurate across a minute at 120bpm', () => {
        const all = runMinute(120, 1);

        // 120bpm for 60s = 120 beats at 0.5s apart, t=0 through t=59.5.
        expect(all).toHaveLength(120);
        expect(all[0].time).toBe(0);
        expect(all[119].time).toBeCloseTo(59.5, 6);

        // Every gap is exactly one beat — no accumulated error.
        for (let i = 1; i < all.length; i++) {
            expect(all[i].time - all[i - 1].time).toBeCloseTo(0.5, 9);
        }
    });

    it('keeps the 8-count phase across the minute', () => {
        const all = runMinute(120, 1);
        // 120 beats / 8 = exactly 15 downbeats.
        expect(all.filter(n => n.downbeat)).toHaveLength(15);
        expect(all[8].downbeat).toBe(true);
        expect(all[8].count).toBe(1);
    });

    it('holds at an awkward tempo and subdivision', () => {
        // 93bpm in eighths divides into nothing neatly — the case where a
        // sloppier implementation would visibly drift.
        const all = runMinute(93, 2);
        const step = 60 / 93 / 2;
        expect(all[all.length - 1].time).toBeCloseTo((all.length - 1) * step, 6);
    });
});

describe('resyncIfBehind', () => {
    it('does nothing when the cursor is on time', () => {
        const res = resyncIfBehind({
            nextTime: 10.4, tick: 3, bpm: 120, subdivision: 1, now: 10.3
        });
        expect(res.resynced).toBe(false);
        expect(res.nextTime).toBe(10.4);
        expect(res.tick).toBe(3);
    });

    it('tolerates being a little late without skipping', () => {
        const res = resyncIfBehind({
            nextTime: 10.0, tick: 3, bpm: 120, subdivision: 1, now: 10.2
        });
        expect(res.resynced).toBe(false);
    });

    it('skips forward when the tab was throttled', () => {
        // 30s behind at 120bpm is 60 missed beats.
        const res = resyncIfBehind({
            nextTime: 0, tick: 0, bpm: 120, subdivision: 1, now: 30
        });
        expect(res.resynced).toBe(true);
        expect(res.skipped).toBe(60);
        expect(res.nextTime).toBeCloseTo(30, 9);
    });

    it('lands back on the correct number in the 8-count', () => {
        // 60 beats skipped from tick 0: 60 % 8 = 4.
        const res = resyncIfBehind({
            nextTime: 0, tick: 0, bpm: 120, subdivision: 1, now: 30
        });
        expect(res.tick).toBe(4);
    });

    it('never leaves the cursor in the past', () => {
        const now = 47.3;
        const res = resyncIfBehind({
            nextTime: 1.25, tick: 2, bpm: 93, subdivision: 2, now
        });
        expect(res.nextTime).toBeGreaterThanOrEqual(now);
    });
});

describe('bpmFromTaps', () => {
    it('needs at least two taps', () => {
        expect(bpmFromTaps([])).toBeNull();
        expect(bpmFromTaps([1000])).toBeNull();
        expect(bpmFromTaps(null)).toBeNull();
    });

    it('averages an even run of taps', () => {
        // 500ms apart = 120bpm
        expect(bpmFromTaps([0, 500, 1000, 1500])).toBe(120);
    });

    it('ignores taps before a long pause', () => {
        // The first two are a stale attempt; only the last three count.
        const taps = [0, 5000, 10000, 10500, 11000];
        expect(bpmFromTaps(taps)).toBe(120);
    });

    it('clamps an implausibly fast tap run', () => {
        expect(bpmFromTaps([0, 10, 20, 30])).toBe(MAX_BPM);
    });
});
