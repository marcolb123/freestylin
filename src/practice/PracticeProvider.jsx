import { useMemo } from 'react';
import { usePracticeEngine } from './usePracticeEngine';
import { PracticeContext, PracticeBeatContext } from './practice-context';

/**
 * Mounted above <Routes> so the engine survives navigation.
 *
 * If this lived inside PromptCard the metronome would die the moment the
 * dancer spun a new prompt or opened the journal to log the session they
 * just did — both things they do while it is running.
 */
export default function PracticeProvider({ children }) {
    const {
        isRunning, bpm, subdivision, muted, displayTick,
        start, stop, toggle, setBpm, setSubdivision, setMuted, tapTempo
    } = usePracticeEngine();

    // Deliberately excludes displayTick, so changing the beat does not
    // invalidate this value and re-render every control consumer.
    const controls = useMemo(() => ({
        isRunning, bpm, subdivision, muted,
        start, stop, toggle, setBpm, setSubdivision, setMuted, tapTempo
    }), [isRunning, bpm, subdivision, muted, start, stop, toggle, setBpm, setSubdivision, setMuted, tapTempo]);

    return (
        <PracticeContext.Provider value={controls}>
            <PracticeBeatContext.Provider value={displayTick}>
                {children}
            </PracticeBeatContext.Provider>
        </PracticeContext.Provider>
    );
}
