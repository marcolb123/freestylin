import { useCallback, useEffect, useRef, useState } from 'react';
import {
    DEFAULT_BPM, clampBpm, normaliseSubdivision,
    collectDue, resyncIfBehind, bpmFromTaps
} from './scheduler';

/** How far ahead of the audio clock the scheduler keeps notes queued. */
const SCHEDULE_AHEAD = 0.1;

/** How often the worker wakes the scheduler. Comfortably inside the runway. */
const LOOKAHEAD_MS = 25;

/**
 * Ceiling on the pending-display queue.
 *
 * The queue is drained on animation frames, and requestAnimationFrame does not
 * run at all while the tab is hidden — measured at exactly one call across a
 * three-second backgrounded run, while the worker kept scheduling normally.
 * Without a cap the queue grows for as long as the dancer's screen is off.
 * The display only ever shows the most recent due entry, so dropping the
 * oldest costs nothing.
 */
const MAX_VISUAL_QUEUE = 64;

/**
 * One click: an oscillator with a short gain envelope. No audio files, which
 * is what lets the whole engine work offline once the service worker lands.
 */
function playClick(ctx, destination, note) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(destination);

    // The 1 is highest and loudest, numbered counts next, "and"s quietest.
    osc.frequency.value = note.downbeat ? 1000 : note.onCount ? 800 : 600;
    const peak = note.downbeat ? 1 : note.onCount ? 0.7 : 0.3;

    // 1ms attack from near-silence avoids a click at onset, and the release
    // ramps to 0.001 rather than 0 — exponentialRampToValueAtTime(0) is
    // invalid, and cutting the gain dead makes a click of its own.
    gain.gain.setValueAtTime(0.0001, note.time);
    gain.gain.exponentialRampToValueAtTime(peak, note.time + 0.001);
    gain.gain.exponentialRampToValueAtTime(0.001, note.time + 0.05);

    osc.start(note.time);
    osc.stop(note.time + 0.06);
}

export function usePracticeEngine() {
    const [isRunning, setIsRunning] = useState(false);
    const [bpm, setBpmState] = useState(DEFAULT_BPM);
    const [subdivision, setSubdivisionState] = useState(1);
    const [muted, setMutedState] = useState(false);
    const [displayTick, setDisplayTick] = useState(null);

    const ctxRef = useRef(null);
    const masterRef = useRef(null);
    const workerRef = useRef(null);
    const rafRef = useRef(null);

    // Cursor and queue live in refs: the scheduler runs on worker messages and
    // animation frames, outside React's render cycle, so it must not read
    // state through a closure that could be stale.
    const cursorRef = useRef({ nextTime: 0, tick: 0 });
    const queueRef = useRef([]);
    const bpmRef = useRef(bpm);
    const subRef = useRef(subdivision);
    const mutedRef = useRef(muted);
    const tapsRef = useRef([]);

    const setBpm = useCallback((next) => {
        const value = clampBpm(next);
        bpmRef.current = value;
        setBpmState(value);
    }, []);

    const setSubdivision = useCallback((next) => {
        const value = normaliseSubdivision(next);
        subRef.current = value;
        setSubdivisionState(value);
        // The tick index counts subdivisions, so it means something different
        // after this changes. Restart the cycle rather than land mid-count.
        cursorRef.current = { ...cursorRef.current, tick: 0 };
    }, []);

    const setMuted = useCallback((next) => {
        mutedRef.current = next;
        setMutedState(next);
    }, []);

    /** Four taps set the tempo from the average interval. */
    const tapTempo = useCallback(() => {
        const now = Date.now();
        tapsRef.current = [...tapsRef.current, now].slice(-8);
        const next = bpmFromTaps(tapsRef.current);
        if (next) setBpm(next);
        return next;
    }, [setBpm]);

    // ── the scheduling loop ────────────────────────────────────────────
    const onTick = useCallback(() => {
        const ctx = ctxRef.current;
        if (!ctx) return;

        const now = ctx.currentTime;

        // If the tab was throttled or the device slept, the cursor can be
        // seconds behind. Skip forward by whole ticks instead of firing every
        // missed click at once.
        const synced = resyncIfBehind({
            ...cursorRef.current, bpm: bpmRef.current, subdivision: subRef.current, now
        });
        if (synced.resynced) {
            cursorRef.current = { nextTime: synced.nextTime, tick: synced.tick };
            queueRef.current = [];
        }

        const { notes, nextTime, tick } = collectDue({
            ...cursorRef.current,
            bpm: bpmRef.current,
            subdivision: subRef.current,
            until: now + SCHEDULE_AHEAD
        });

        for (const note of notes) {
            if (!mutedRef.current) playClick(ctx, masterRef.current, note);
            queueRef.current.push(note);
        }

        // Bounded so a backgrounded tab, where nothing drains this, cannot
        // grow it indefinitely.
        if (queueRef.current.length > MAX_VISUAL_QUEUE) {
            queueRef.current.splice(0, queueRef.current.length - MAX_VISUAL_QUEUE);
        }

        cursorRef.current = { nextTime, tick };
    }, []);

    // ── the display loop ───────────────────────────────────────────────
    // Counts light up only once the audio clock has actually reached them.
    // Painting inside onTick would light each count up to SCHEDULE_AHEAD early.
    const draw = useCallback(() => {
        const ctx = ctxRef.current;
        if (ctx) {
            const now = ctx.currentTime;
            let latest = null;
            while (queueRef.current.length && queueRef.current[0].time <= now) {
                latest = queueRef.current.shift();
            }
            if (latest) setDisplayTick(latest.tick);
        }
        rafRef.current = requestAnimationFrame(draw);
    }, []);

    const stop = useCallback(() => {
        workerRef.current?.postMessage({ command: 'stop' });
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        queueRef.current = [];
        setDisplayTick(null);
        setIsRunning(false);
    }, []);

    const start = useCallback(async () => {
        // Everything here must stay inside the user gesture that called it.
        // iOS creates an AudioContext suspended and only a gesture can resume
        // it — resuming from an effect leaves the engine silent on iPhone
        // while working perfectly on desktop.
        if (!ctxRef.current) {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx) return false;
            const ctx = new Ctx();
            const master = ctx.createGain();
            master.gain.value = 0.9;
            master.connect(ctx.destination);
            ctxRef.current = ctx;
            masterRef.current = master;
        }

        await ctxRef.current.resume();

        // A little runway so the first click isn't scheduled in the past.
        cursorRef.current = { nextTime: ctxRef.current.currentTime + 0.12, tick: 0 };
        queueRef.current = [];
        setDisplayTick(null);

        workerRef.current?.postMessage({ command: 'start', interval: LOOKAHEAD_MS });
        rafRef.current = requestAnimationFrame(draw);
        setIsRunning(true);
        return true;
    }, [draw]);

    const toggle = useCallback(() => (isRunning ? stop() : start()), [isRunning, start, stop]);

    // Worker lives for the life of the hook; it is idle until told to start.
    useEffect(() => {
        const worker = new Worker(new URL('./tick-worker.js', import.meta.url), { type: 'module' });
        worker.onmessage = onTick;
        workerRef.current = worker;

        return () => {
            worker.postMessage({ command: 'stop' });
            worker.terminate();
            workerRef.current = null;
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            ctxRef.current?.close();
            ctxRef.current = null;
        };
    }, [onTick]);

    return {
        isRunning, bpm, subdivision, muted, displayTick,
        start, stop, toggle, setBpm, setSubdivision, setMuted, tapTempo
    };
}
