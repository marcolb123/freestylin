import { useEffect, useMemo, useState } from 'react';
import { Radio, WifiOff, Check, X, Pencil } from 'lucide-react';
import { styleMix } from '../../styles.js';
import { parseMusicUrl, SUPPORTED_PROVIDERS } from '../music';

// Per style, so a dancer can keep different music for krump and house.
const storageKey = (style) => `freestylin:mix:${style || 'all'}`;

const readCustom = (style) => {
    try {
        return localStorage.getItem(storageKey(style)) || '';
    } catch {
        return '';   // private mode / storage disabled
    }
};

/**
 * Music for the selected style.
 *
 * Unlike the metronome this needs the network — it embeds a third-party
 * player — so it says so plainly when offline rather than showing an empty
 * box. The metronome is the part that keeps working in a basement studio.
 */
export default function MusicPanel({ style }) {
    const [custom, setCustom] = useState(() => readCustom(style));
    const [draft, setDraft] = useState('');
    const [editing, setEditing] = useState(false);
    const [error, setError] = useState(null);
    const [online, setOnline] = useState(() => navigator.onLine !== false);

    // Reload the saved link when the dancer switches style.
    useEffect(() => {
        setCustom(readCustom(style));
        setEditing(false);
        setError(null);
    }, [style]);

    useEffect(() => {
        const up = () => setOnline(true);
        const down = () => setOnline(false);
        window.addEventListener('online', up);
        window.addEventListener('offline', down);
        return () => {
            window.removeEventListener('online', up);
            window.removeEventListener('offline', down);
        };
    }, []);

    const fallback = styleMix(style);
    const activeUrl = custom || fallback?.url || null;
    const embed = useMemo(() => parseMusicUrl(activeUrl), [activeUrl]);

    const save = () => {
        const parsed = parseMusicUrl(draft);
        if (!parsed) {
            setError(`That link isn't one we can play. Try ${SUPPORTED_PROVIDERS.join(', ')}.`);
            return;
        }
        try {
            localStorage.setItem(storageKey(style), draft.trim());
        } catch {
            // Saving is best-effort; the link still plays this session.
        }
        setCustom(draft.trim());
        setDraft('');
        setEditing(false);
        setError(null);
    };

    const clear = () => {
        try {
            localStorage.removeItem(storageKey(style));
        } catch {
            // ignore
        }
        setCustom('');
        setDraft('');
        setEditing(false);
        setError(null);
    };

    return (
        <div className="content-box music-box">
            <h4 className="music-selector-title">
                <Radio size={20} /> Music
                {embed && <span className="music-provider">{custom ? 'your link' : embed.provider}</span>}
            </h4>

            {!online && (
                <p className="music-offline">
                    <WifiOff size={16} /> You're offline, so the player can't load. The count and tempo above still work.
                </p>
            )}

            {online && embed && (
                <div className="soundcloud-container">
                    <iframe
                        title={custom ? 'Your music' : (fallback?.title || 'Practice music')}
                        width="100%"
                        height={embed.height}
                        frameBorder="no"
                        scrolling="no"
                        allow="autoplay; encrypted-media; clipboard-write; picture-in-picture"
                        loading="lazy"
                        src={embed.embedUrl}
                    />
                </div>
            )}

            {online && !embed && !editing && (
                <p className="music-empty">
                    {style
                        ? `No default mix for ${style} yet — add one you like.`
                        : 'Pick a style for a suggested mix, or add your own.'}
                </p>
            )}

            {editing ? (
                <div className="music-edit">
                    <input
                        type="url"
                        inputMode="url"
                        placeholder="Paste a SoundCloud, YouTube or Spotify link"
                        value={draft}
                        onChange={(e) => { setDraft(e.target.value); setError(null); }}
                        onKeyDown={(e) => { if (e.key === 'Enter') save(); }}
                        aria-label="Music link"
                    />
                    <div className="music-edit-actions">
                        <button type="button" className="btn btn-spin" onClick={save}>
                            <Check size={16} /> Use it
                        </button>
                        <button type="button" className="btn btn-toggle" onClick={() => { setEditing(false); setError(null); }}>
                            <X size={16} /> Cancel
                        </button>
                    </div>
                    {error && <p className="music-error">{error}</p>}
                </div>
            ) : (
                <div className="music-edit-actions">
                    <button type="button" className="btn btn-toggle" onClick={() => { setEditing(true); setDraft(custom); }}>
                        <Pencil size={16} /> {custom ? 'Change link' : 'Use your own'}
                    </button>
                    {custom && (
                        <button type="button" className="btn btn-clear" onClick={clear}>
                            <X size={16} /> Reset
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
