import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    BookOpen, Flame, Clock, CalendarDays, Trash2, Save, Pencil, X, Music, Target
} from "lucide-react";
import { apiFetch, toLocalISODate, formatISODate } from "./api";

const EMPTY_FORM = { date: toLocalISODate(), prompts: [], notes: "", durationMinutes: "", energy: null };

const ENERGY_LABELS = ["Drained", "Low", "Steady", "Good", "On fire"];

export default function JournalPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const [entries, setEntries] = useState([]);
    const [stats, setStats] = useState(null);
    const [prompts, setPrompts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);

    // A prompt id can be handed over from the "Log this session" button on the
    // main page, so the dancer lands here with what they just trained selected.
    const [form, setForm] = useState(() => ({
        ...EMPTY_FORM,
        prompts: location.state?.promptId ? [location.state.promptId] : []
    }));

    const load = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const [entryData, statData, promptData] = await Promise.all([
                apiFetch("/api/journal"),
                apiFetch(`/api/journal/stats?today=${toLocalISODate()}`),
                apiFetch("/api/prompts")
            ]);
            setEntries(entryData);
            setStats(statData);
            setPrompts(promptData);
        } catch (err) {
            setError(err.message || "Could not load your journal.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const togglePrompt = (id) => {
        setForm(f => ({
            ...f,
            prompts: f.prompts.includes(id)
                ? f.prompts.filter(p => p !== id)
                : [...f.prompts, id]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setError(null);

        if (!form.notes.trim() && form.prompts.length === 0) {
            setError("Add a note or pick at least one prompt you trained.");
            return;
        }

        // Captured before the reload, since `entries` is what decides whether
        // this save created a new entry or overwrote an existing day.
        const wasUpdate = editingExisting;

        try {
            setSaving(true);
            await apiFetch("/api/journal", {
                body: {
                    date: form.date,
                    prompts: form.prompts,
                    notes: form.notes,
                    durationMinutes: form.durationMinutes === "" ? 0 : Number(form.durationMinutes),
                    energy: form.energy
                }
            });
            setForm({ ...EMPTY_FORM, date: toLocalISODate() });
            setMessage(wasUpdate ? "Entry updated!" : "Session logged!");
            await load();
        } catch (err) {
            setError(err.message || "Could not save that entry.");
        } finally {
            setSaving(false);
        }
    };

    const startEdit = (entry) => {
        setForm({
            date: entry.date,
            prompts: entry.prompts.map(p => p._id),
            notes: entry.notes || "",
            durationMinutes: entry.durationMinutes || "",
            energy: entry.energy ?? null
        });
        setMessage(null);
        setError(null);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (id) => {
        try {
            await apiFetch(`/api/journal/${id}`, { method: "DELETE" });
            setConfirmDelete(null);
            setMessage("Entry deleted.");
            await load();
        } catch (err) {
            setError(err.message || "Could not delete that entry.");
        }
    };

    const editingExisting = entries.some(e => e.date === form.date);

    return (
        <div className="app-container">
            <div className="app-header">
                <h1 className="app-title">
                    <BookOpen className="title-icon" size={48} /> Training Journal
                </h1>
                <p className="app-subtitle">Log what you trained, and keep the streak alive</p>
                <button onClick={() => navigate("/")} className="btn btn-nav">← Back to Home</button>
            </div>

            <div className="app-content" style={{ padding: "2rem" }}>
                {/* ─────── STATS ─────── */}
                {stats && (
                    <div className="stats-grid" style={{ marginBottom: "2rem" }}>
                        <div className="stat-card">
                            <Flame size={28} style={{ color: stats.currentStreak > 0 ? "#ff6b6b" : "#888" }} />
                            <h3>{stats.currentStreak}</h3>
                            <p>day streak</p>
                        </div>
                        <div className="stat-card">
                            <CalendarDays size={28} style={{ color: "#4ECDC4" }} />
                            <h3>{stats.totalSessions}</h3>
                            <p>session{stats.totalSessions !== 1 ? "s" : ""} logged</p>
                        </div>
                        <div className="stat-card">
                            <Clock size={28} style={{ color: "#FFE66D" }} />
                            <h3>{Math.floor(stats.totalMinutes / 60)}h {stats.totalMinutes % 60}m</h3>
                            <p>total training</p>
                        </div>
                        <div className="stat-card">
                            <Target size={28} style={{ color: "#95E1D3" }} />
                            <h3 style={{ fontSize: "1.2rem" }}>{stats.mostTrained?.label || "—"}</h3>
                            <p>{stats.mostTrained ? `trained ${stats.mostTrained.count}×` : "most trained"}</p>
                        </div>
                    </div>
                )}

                {/* ─────── LOG FORM ─────── */}
                <form onSubmit={handleSubmit} className="prompt-card" style={{ marginBottom: "2rem" }}>
                    <div className="card-header">
                        <h2 className="prompt-title" style={{ fontSize: "1.5rem" }}>
                            {editingExisting ? "Update this day's session" : "Log a session"}
                        </h2>
                        {editingExisting && (
                            <p className="prompt-subtitle">
                                You already logged {formatISODate(form.date)} — saving will update it.
                            </p>
                        )}
                    </div>

                    <div style={{ display: "grid", gap: "1.25rem", marginTop: "1rem" }}>
                        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                            <label style={{ flex: "1 1 200px" }}>
                                <span style={{ display: "block", marginBottom: "0.4rem" }}>Date</span>
                                <input
                                    type="date"
                                    value={form.date}
                                    max={toLocalISODate()}
                                    onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
                                    required
                                    style={inputStyle}
                                />
                            </label>
                            <label style={{ flex: "1 1 200px" }}>
                                <span style={{ display: "block", marginBottom: "0.4rem" }}>Minutes trained</span>
                                <input
                                    type="number"
                                    min="0"
                                    max="1440"
                                    placeholder="e.g. 45"
                                    value={form.durationMinutes}
                                    onChange={(e) => setForm(f => ({ ...f, durationMinutes: e.target.value }))}
                                    style={inputStyle}
                                />
                            </label>
                        </div>

                        <div>
                            <span style={{ display: "block", marginBottom: "0.5rem" }}>What did you train?</span>
                            <div className="genre-chips">
                                {prompts.map(p => {
                                    const selected = form.prompts.includes(p._id);
                                    return (
                                        <button
                                            type="button"
                                            key={p._id}
                                            className={`genre-chip ${selected ? "active" : ""}`}
                                            onClick={() => togglePrompt(p._id)}
                                            aria-pressed={selected}
                                            style={{
                                                backgroundColor: selected ? "#4ECDC4" : "rgba(255,255,255,0.1)",
                                                borderColor: "#4ECDC4"
                                            }}
                                        >
                                            <Music size={14} /> {p.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <span style={{ display: "block", marginBottom: "0.5rem" }}>How did it feel?</span>
                            <div className="genre-chips">
                                {ENERGY_LABELS.map((label, i) => {
                                    const value = i + 1;
                                    const selected = form.energy === value;
                                    return (
                                        <button
                                            type="button"
                                            key={label}
                                            className={`genre-chip ${selected ? "active" : ""}`}
                                            aria-pressed={selected}
                                            onClick={() => setForm(f => ({ ...f, energy: selected ? null : value }))}
                                            style={{
                                                backgroundColor: selected ? "#FFE66D" : "rgba(255,255,255,0.1)",
                                                borderColor: "#FFE66D",
                                                color: selected ? "#222" : undefined
                                            }}
                                        >
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <label>
                            <span style={{ display: "block", marginBottom: "0.4rem" }}>Notes</span>
                            <textarea
                                rows={4}
                                maxLength={5000}
                                placeholder="What clicked? What felt awkward? What do you want to come back to?"
                                value={form.notes}
                                onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                                style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
                            />
                        </label>

                        {error && <p style={errorStyle}>{error}</p>}
                        {message && <p style={successStyle}>{message}</p>}

                        <div className="button-group">
                            <button type="submit" className="btn btn-spin" disabled={saving}>
                                <Save size={18} /> {saving ? "Saving…" : editingExisting ? "Update entry" : "Log session"}
                            </button>
                            <button
                                type="button"
                                className="btn btn-clear"
                                onClick={() => { setForm({ ...EMPTY_FORM, date: toLocalISODate() }); setError(null); setMessage(null); }}
                            >
                                <X size={18} /> Clear
                            </button>
                        </div>
                    </div>
                </form>

                {/* ─────── PAST ENTRIES ─────── */}
                <h2 style={{ color: "#fff", marginBottom: "1rem" }}>Past sessions</h2>

                {loading ? (
                    <p style={{ color: "#fff" }}>Loading your journal…</p>
                ) : entries.length === 0 ? (
                    <div className="prompt-card" style={{ textAlign: "center", padding: "3rem" }}>
                        <BookOpen size={64} stroke="#ccc" style={{ marginBottom: "1rem" }} />
                        <h3>No sessions logged yet</h3>
                        <p style={{ color: "#aaa" }}>
                            Log your first session above and your streak starts today.
                        </p>
                    </div>
                ) : (
                    <div style={{ display: "grid", gap: "1rem" }}>
                        {entries.map(entry => (
                            <div key={entry._id} className="prompt-card">
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
                                    <div>
                                        <h3 style={{ margin: 0 }}>{formatISODate(entry.date)}</h3>
                                        <p style={{ margin: "0.25rem 0 0", color: "#aaa", fontSize: "0.9rem" }}>
                                            {entry.durationMinutes > 0 && <>{entry.durationMinutes} min</>}
                                            {entry.durationMinutes > 0 && entry.energy ? " · " : ""}
                                            {entry.energy ? ENERGY_LABELS[entry.energy - 1] : ""}
                                        </p>
                                    </div>
                                    <div style={{ display: "flex", gap: "0.5rem" }}>
                                        <button onClick={() => startEdit(entry)} className="btn btn-nav" aria-label="Edit entry">
                                            <Pencil size={16} /> Edit
                                        </button>
                                        <button onClick={() => setConfirmDelete(entry._id)} className="btn btn-clear" aria-label="Delete entry">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                {entry.prompts.length > 0 && (
                                    <div className="genre-chips" style={{ marginTop: "0.75rem" }}>
                                        {entry.prompts.map(p => (
                                            <span key={p._id} className="genre-chip" style={{ borderColor: "#4ECDC4", cursor: "default" }}>
                                                {p.label}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {entry.notes && (
                                    <p style={{ marginTop: "0.75rem", whiteSpace: "pre-wrap" }}>{entry.notes}</p>
                                )}

                                {confirmDelete === entry._id && (
                                    <div style={{ marginTop: "1rem", padding: "1rem", background: "rgba(255,107,107,0.15)", borderRadius: "8px" }}>
                                        <p style={{ margin: "0 0 0.75rem" }}>Delete this entry? This can't be undone.</p>
                                        <div className="button-group">
                                            <button onClick={() => handleDelete(entry._id)} className="btn btn-clear">Yes, delete</button>
                                            <button onClick={() => setConfirmDelete(null)} className="btn btn-nav">Cancel</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

const inputStyle = {
    width: "100%",
    padding: "0.65rem",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.25)",
    background: "rgba(255,255,255,0.08)",
    color: "#fff",
    fontSize: "1rem"
};

const errorStyle = {
    color: "#721c24", background: "#f8d7da", padding: "0.75rem", borderRadius: "8px", margin: 0
};

const successStyle = {
    color: "#155724", background: "#d4edda", padding: "0.75rem", borderRadius: "8px", margin: 0
};
