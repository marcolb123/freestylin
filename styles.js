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

export const STYLE_META = [
  { name: 'Hip-Hop',    color: '#FFE66D' },
  { name: 'Popping',    color: '#4ECDC4' },
  { name: 'Krump',      color: '#FF6B6B' },
  { name: 'House',      color: '#95E1D3' },
  { name: 'Waacking',   color: '#C77DFF' },
  { name: 'Breaking',   color: '#FFA36C' },
  { name: 'Foundation', color: '#A0A0A0' },
];

/** Style names, in display order. Used as the Mongoose enum and API validation. */
export const STYLES = STYLE_META.map(s => s.name);

export const DEFAULT_STYLE = 'Foundation';

const FALLBACK_COLOR = '#A0A0A0';

/** Chip/badge colour for a style, falling back for unknown or missing values. */
export const styleColor = (style) =>
  STYLE_META.find(s => s.name === style)?.color || FALLBACK_COLOR;
