import { useState } from 'react';
import { Play, Square, Volume2, VolumeX, Hand } from 'lucide-react';
import { usePractice } from './practice-context';
import { MIN_BPM, MAX_BPM, SUBDIVISIONS } from './scheduler';
import CountDisplay from './CountDisplay';

const SUBDIVISION_LABELS = {
    1: 'Counts',
    2: 'And',
    4: '16ths'
};

export default function PracticePanel() {
    const {
        isRunning, bpm, subdivision, muted,
        toggle, setBpm, setSubdivision, setMuted, tapTempo
    } = usePractice();
    const [tapHint, setTapHint] = useState(null);

    const handleTap = () => {
        const next = tapTempo();
        setTapHint(next ? `${next} bpm` : 'keep tapping…');
    };

    return (
        <div className="content-box practice-panel">
            <h4 className="music-selector-title">
                <Hand size={20} /> Count &amp; Tempo
            </h4>

            <CountDisplay />

            <div className="practice-controls">
                <button
                    type="button"
                    className={`btn ${isRunning ? 'btn-clear' : 'btn-spin'}`}
                    onClick={toggle}
                    aria-pressed={isRunning}
                >
                    {isRunning ? <><Square size={18} /> Stop</> : <><Play size={18} /> Start</>}
                </button>

                <button
                    type="button"
                    className="btn btn-toggle"
                    onClick={handleTap}
                    title="Tap four times to set the tempo"
                >
                    <Hand size={16} /> Tap {tapHint && <span className="tap-hint">{tapHint}</span>}
                </button>

                <button
                    type="button"
                    className="btn btn-toggle"
                    onClick={() => setMuted(!muted)}
                    aria-pressed={muted}
                    title={muted ? 'Sound off — counts still show' : 'Sound on'}
                >
                    {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    {muted ? ' Silent' : ' Sound'}
                </button>
            </div>

            <label className="bpm-row">
                <span className="bpm-value">{bpm}<small> bpm</small></span>
                <input
                    type="range"
                    min={MIN_BPM}
                    max={MAX_BPM}
                    value={bpm}
                    onChange={(e) => setBpm(Number(e.target.value))}
                    aria-label="Tempo in beats per minute"
                />
            </label>

            <div className="genre-chips subdivision-chips">
                {SUBDIVISIONS.map((s) => {
                    const active = subdivision === s;
                    return (
                        <button
                            type="button"
                            key={s}
                            className={`genre-chip ${active ? 'active' : ''}`}
                            aria-pressed={active}
                            onClick={() => setSubdivision(s)}
                            style={{
                                backgroundColor: active ? '#4ECDC4' : 'rgba(255,255,255,0.1)',
                                borderColor: '#4ECDC4',
                                color: active ? '#222' : undefined
                            }}
                        >
                            {SUBDIVISION_LABELS[s]}
                        </button>
                    );
                })}
            </div>

            {muted && (
                <p className="practice-note">
                    Silent mode — the counts still run, for a loud room.
                </p>
            )}
        </div>
    );
}
