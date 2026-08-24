// ═══════════════════════════════════════════════════════════
// 🥁 PRACTICE ENGINE — timing maths
// ═══════════════════════════════════════════════════════════
// Pure functions only: no AudioContext, no React, no DOM. Everything here is
// a deterministic function of its arguments, which means the part of the
// metronome most likely to break silently — drift, and recovery after the tab
// is throttled — is the part that can actually be tested.
//
// The audio layer (usePracticeEngine) owns the AudioContext and calls into
// this module; it never does timing arithmetic itself.

export const MIN_BPM = 40;
export const MAX_BPM = 240;
export const DEFAULT_BPM = 100;

/** Street dance counts in 8s, so a cycle is 8 counts rather than a bar. */
export const COUNTS_PER_CYCLE = 8;

/** Quarter notes (the count), eighths (the "and"s), sixteenths. */
export const SUBDIVISIONS = [1, 2, 4];

export function normaliseSubdivision(subdivision) {
    return SUBDIVISIONS.includes(subdivision) ? subdivision : 1;
}

export function clampBpm(bpm) {
    if (!Number.isFinite(bpm)) return DEFAULT_BPM;
    return Math.min(MAX_BPM, Math.max(MIN_BPM, Math.round(bpm)));
}

export function secondsPerBeat(bpm) {
    return 60 / clampBpm(bpm);
}

/** Seconds between consecutive ticks, where a tick may be a subdivision. */
export function secondsPerTick(bpm, subdivision) {
    return secondsPerBeat(bpm) / normaliseSubdivision(subdivision);
}

export function ticksPerCycle(subdivision) {
    return COUNTS_PER_CYCLE * normaliseSubdivision(subdivision);
}

export function advanceTick(tick, subdivision) {
    return (tick + 1) % ticksPerCycle(subdivision);
}

/** The 1 — accented louder and higher than the rest. */
export function isDownbeat(tick) {
    return tick === 0;
}

/** True on a numbered count, false on the "and"s between them. */
export function isCount(tick, subdivision) {
    return tick % normaliseSubdivision(subdivision) === 0;
}

/** 1–8: the number a dancer would actually call out. */
export function countNumber(tick, subdivision) {
    return Math.floor(tick / normaliseSubdivision(subdivision)) + 1;
}

/**
 * Every tick due strictly before `until`, plus the advanced cursor.
 *
 * This is what the scheduling loop calls on each worker tick: it queues the
 * short runway of notes ahead of the audio clock and then goes back to sleep.
 *
 * `maxNotes` is a guard, not a tuning knob. If `until` is ever far in the
 * future — a suspended device, a bad caller — an unbounded loop would either
 * hang or allocate thousands of notes. Hitting the cap means something is
 * wrong upstream; resyncIfBehind is what should have prevented it.
 */
export function collectDue({ nextTime, tick, bpm, subdivision, until, maxNotes = 128 }) {
    const step = secondsPerTick(bpm, subdivision);
    const sub = normaliseSubdivision(subdivision);
    const notes = [];

    let time = nextTime;
    let current = tick;

    while (time < until && notes.length < maxNotes) {
        notes.push({
            tick: current,
            time,
            downbeat: isDownbeat(current),
            onCount: isCount(current, sub),
            count: countNumber(current, sub)
        });
        time += step;
        current = advanceTick(current, sub);
    }

    return { notes, nextTime: time, tick: current, cappedOut: notes.length >= maxNotes };
}

/**
 * Skip the cursor forward when it has fallen behind the audio clock.
 *
 * Browsers throttle timers hard in hidden tabs — a 20ms timeout measured at
 * 525ms in testing — and a sleeping device stops them entirely. On return,
 * `nextTime` can be seconds behind `now`. Scheduling every missed tick would
 * fire a burst of clicks all timestamped in the past, which the audio layer
 * plays immediately as one ugly cluster.
 *
 * Jumping forward by whole ticks keeps the position within the 8-count, so the
 * dancer comes back on the right number rather than an arbitrary one.
 */
export function resyncIfBehind({ nextTime, tick, bpm, subdivision, now, toleranceSeconds = 0.25 }) {
    if (nextTime >= now - toleranceSeconds) {
        return { nextTime, tick, resynced: false, skipped: 0 };
    }

    const step = secondsPerTick(bpm, subdivision);
    const skipped = Math.ceil((now - nextTime) / step);

    return {
        nextTime: nextTime + skipped * step,
        tick: (tick + skipped) % ticksPerCycle(subdivision),
        resynced: true,
        skipped
    };
}

/**
 * BPM from a run of tap timestamps (ms), or null if there isn't enough to go on.
 *
 * Reads backwards from the most recent tap and stops at the first gap longer
 * than `maxGapMs` — a long pause means the dancer restarted tapping rather
 * than kept a very slow tempo, and averaging across it would be nonsense.
 */
export function bpmFromTaps(timestampsMs, { maxGapMs = 2000 } = {}) {
    if (!Array.isArray(timestampsMs) || timestampsMs.length < 2) return null;

    const gaps = [];
    for (let i = timestampsMs.length - 1; i > 0; i--) {
        const gap = timestampsMs[i] - timestampsMs[i - 1];
        if (!Number.isFinite(gap) || gap <= 0 || gap > maxGapMs) break;
        gaps.unshift(gap);
    }
    if (gaps.length === 0) return null;

    const meanGap = gaps.reduce((sum, g) => sum + g, 0) / gaps.length;
    return clampBpm(60000 / meanGap);
}
