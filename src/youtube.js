const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com']);
const SHORT_HOSTS = new Set(['youtu.be', 'www.youtu.be']);

export function extractYouTubeId(value) {
    if (typeof value !== 'string') return null;
    let url;
    try {
        url = new URL(value);
    } catch {
        return null;
    }

    if (!['http:', 'https:'].includes(url.protocol)) return null;
    let id;
    if (SHORT_HOSTS.has(url.hostname)) {
        id = url.pathname.split('/')[1];
    } else if (YOUTUBE_HOSTS.has(url.hostname)) {
        id = url.pathname === '/watch'
            ? url.searchParams.get('v')
            : url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)\/?$/)?.[1];
    }
    return typeof id === 'string' && /^[\w-]{11}$/.test(id) ? id : null;
}
