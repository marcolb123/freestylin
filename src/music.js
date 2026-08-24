// ═══════════════════════════════════════════════════════════
// 🎧 MUSIC EMBEDS
// ═══════════════════════════════════════════════════════════
// Turns a link a dancer pastes into something embeddable.
//
// The host allowlist is a security boundary, not a convenience. This value
// ends up as an iframe `src`, so accepting arbitrary input would let a pasted
// `javascript:` URL or a hostile page run in the page's frame. Anything not
// matching a known provider is rejected outright.

const SOUNDCLOUD_HOSTS = ['soundcloud.com', 'www.soundcloud.com', 'm.soundcloud.com', 'on.soundcloud.com'];
const YOUTUBE_HOSTS = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com'];
const YOUTUBE_SHORT_HOSTS = ['youtu.be', 'www.youtu.be'];
const SPOTIFY_HOSTS = ['open.spotify.com'];

const SPOTIFY_TYPES = ['track', 'album', 'playlist', 'artist', 'show', 'episode'];

const soundcloudEmbed = (url) =>
    `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}` +
    '&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false' +
    '&show_user=true&show_reposts=false&show_teaser=false';

/**
 * Parse a music link into an embed descriptor.
 *
 * @returns {{provider: string, embedUrl: string, height: number, label: string}|null}
 *          null for anything unrecognised — callers should treat that as
 *          "not a supported link", never as "embed it anyway".
 */
export function parseMusicUrl(raw) {
    if (typeof raw !== 'string' || !raw.trim()) return null;

    let url;
    try {
        url = new URL(raw.trim());
    } catch {
        return null;
    }

    // Only ever http(s). Blocks javascript:, data:, blob: and friends.
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;

    const host = url.hostname.toLowerCase();

    if (SOUNDCLOUD_HOSTS.includes(host)) {
        // A bare profile URL has no track to play.
        const segments = url.pathname.split('/').filter(Boolean);
        if (segments.length < 2) return null;
        const isSet = segments[1] === 'sets';
        return {
            provider: 'SoundCloud',
            embedUrl: soundcloudEmbed(url.toString()),
            height: isSet ? 300 : 166,
            label: decodeURIComponent(segments[segments.length - 1]).replace(/-/g, ' ')
        };
    }

    if (YOUTUBE_SHORT_HOSTS.includes(host)) {
        const id = url.pathname.split('/').filter(Boolean)[0];
        if (!id) return null;
        return { provider: 'YouTube', embedUrl: `https://www.youtube.com/embed/${id}`, height: 220, label: 'YouTube' };
    }

    if (YOUTUBE_HOSTS.includes(host)) {
        const list = url.searchParams.get('list');
        const videoId = url.searchParams.get('v');

        if (url.pathname === '/playlist' && list) {
            return {
                provider: 'YouTube',
                embedUrl: `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(list)}`,
                height: 220,
                label: 'YouTube playlist'
            };
        }
        if (videoId) {
            const suffix = list ? `?list=${encodeURIComponent(list)}` : '';
            return {
                provider: 'YouTube',
                embedUrl: `https://www.youtube.com/embed/${videoId}${suffix}`,
                height: 220,
                label: 'YouTube'
            };
        }
        // /embed/ID pasted directly
        const embedMatch = url.pathname.match(/^\/embed\/([^/]+)$/);
        if (embedMatch) {
            return { provider: 'YouTube', embedUrl: `https://www.youtube.com/embed/${embedMatch[1]}`, height: 220, label: 'YouTube' };
        }
        return null;
    }

    if (SPOTIFY_HOSTS.includes(host)) {
        // Locale-prefixed links look like /intl-de/playlist/<id>.
        const segments = url.pathname.split('/').filter(Boolean)
            .filter(s => !s.startsWith('intl-') && s !== 'embed');
        const [type, id] = segments;
        if (!SPOTIFY_TYPES.includes(type) || !id) return null;
        return {
            provider: 'Spotify',
            embedUrl: `https://open.spotify.com/embed/${type}/${id}`,
            // Spotify's own compact player height; playlists get the taller one.
            height: type === 'playlist' || type === 'album' ? 352 : 152,
            label: `Spotify ${type}`
        };
    }

    return null;
}

/** Providers a dancer can paste, for the hint text under the input. */
export const SUPPORTED_PROVIDERS = ['SoundCloud', 'YouTube', 'Spotify'];
