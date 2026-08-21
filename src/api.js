import { API_URL } from './config';

/**
 * Fetch wrapper that attaches the stored bearer token, parses the JSON body,
 * and turns a non-2xx response into a thrown Error carrying the server's own
 * message — so callers can just try/catch instead of re-checking res.ok and
 * re-reading the token everywhere.
 */
export async function apiFetch(path, { body, method, ...options } = {}) {
    const token = localStorage.getItem('token');
    const headers = { ...options.headers };

    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_URL}${path}`, {
        ...options,
        method: method || (body !== undefined ? 'POST' : 'GET'),
        headers,
        ...(body !== undefined ? { body: JSON.stringify(body) } : {})
    });

    // 204s and empty bodies are valid responses but not valid JSON.
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    if (!res.ok) {
        const err = new Error(data?.error || `Request failed (${res.status})`);
        err.status = res.status;
        throw err;
    }
    return data;
}

/**
 * Today's date as YYYY-MM-DD in the *viewer's own* timezone.
 *
 * Deliberately not `toISOString().slice(0, 10)`: that converts to UTC first, so
 * an evening session anywhere west of Greenwich would get filed under tomorrow
 * and silently break the training streak.
 */
export function toLocalISODate(date = new Date()) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** '2026-08-21' -> 'Fri, 21 Aug 2026', parsed as a local date rather than UTC. */
export function formatISODate(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(undefined, {
        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
    });
}
