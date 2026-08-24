// ═══════════════════════════════════════════════════════════
// 🕺 STREET & CLUB STYLES — single source of truth
// ═══════════════════════════════════════════════════════════
// Imported by the server (schema enum + API validation), the seed scripts,
// and the frontend (filter chips + badges). This list previously existed in
// three places — server.js, seed.js and prompts-data.js — which is exactly
// how a style list drifts out of sync with the enum that validates it.
//
// Lives at the repo root rather than under src/ because the backend needs it
// too; Vite resolves `../styles.js` from src/ without any config.
//
// 'Foundation' holds cross-style fundamentals (bounce, waves, musicality)
// that aren't owned by any single dance.

// `bpm` seeds the practice metronome when a style is picked. These are
// sensible starting points rather than settled fact — sub-genres vary and
// dancers have their own preferences, which is why the tempo stays adjustable.
//
// `mix` is the default track for a style. Only the four that were already
// hardcoded in the app carry one; the rest are deliberately null rather than
// filled with invented links, and the UI offers "use your own" instead.
// Anything here can be replaced by a dancer's own link at runtime.
export const STYLE_META = [
  {
    name: 'Hip-Hop', color: '#FFE66D',
    bpm: { min: 85, max: 100, default: 92 },
    mix: { title: 'Old School Vibes Vol. 2', url: 'https://soundcloud.com/kaisalart/old-school-vibes-vol-2-hip-hop-mix' }
  },
  {
    name: 'Popping', color: '#4ECDC4',
    bpm: { min: 90, max: 110, default: 100 },
    mix: { title: 'Get The Tapes Vol. 22', url: 'https://soundcloud.com/dj-dbon1-314759770/get-the-tapes-vol-22-hip-hop' }
  },
  {
    name: 'Krump', color: '#FF6B6B',
    bpm: { min: 70, max: 100, default: 85 },
    mix: { title: 'Krump Mix', url: 'https://soundcloud.com/merciiful1/krump-mix' }
  },
  {
    name: 'House', color: '#95E1D3',
    bpm: { min: 120, max: 130, default: 125 },
    mix: { title: 'Housupa Afro Tribal House Mix', url: 'https://soundcloud.com/djsupad/housupa-afro-tribal-house-mix' }
  },
  { name: 'Waacking', color: '#C77DFF', bpm: { min: 110, max: 130, default: 120 }, mix: null },
  { name: 'Breaking', color: '#FFA36C', bpm: { min: 110, max: 130, default: 115 }, mix: null },
  // Foundation spans every style, so it gets no characteristic tempo or track.
  { name: 'Foundation', color: '#A0A0A0', bpm: { min: 60, max: 180, default: 100 }, mix: null },
];

/** Style names, in display order. Used as the Mongoose enum and API validation. */
export const STYLES = STYLE_META.map(s => s.name);

export const DEFAULT_STYLE = 'Foundation';

const FALLBACK_COLOR = '#A0A0A0';

/** Chip/badge colour for a style, falling back for unknown or missing values. */
export const styleColor = (style) =>
  STYLE_META.find(s => s.name === style)?.color || FALLBACK_COLOR;

/** Tempo range for a style, for seeding the practice metronome. */
export const styleTempo = (style) =>
  STYLE_META.find(s => s.name === style)?.bpm
  || STYLE_META.find(s => s.name === DEFAULT_STYLE).bpm;

/** Default mix for a style, or null when there isn't one. */
export const styleMix = (style) =>
  STYLE_META.find(s => s.name === style)?.mix || null;
