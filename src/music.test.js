import { describe, it, expect } from 'vitest';
import { parseMusicUrl } from './music';

describe('parseMusicUrl — rejection', () => {
    it('rejects empty and non-string input', () => {
        expect(parseMusicUrl('')).toBeNull();
        expect(parseMusicUrl('   ')).toBeNull();
        expect(parseMusicUrl(null)).toBeNull();
        expect(parseMusicUrl(42)).toBeNull();
    });

    it('rejects anything that is not a URL', () => {
        expect(parseMusicUrl('just some words')).toBeNull();
        expect(parseMusicUrl('soundcloud.com/foo/bar')).toBeNull(); // no protocol
    });

    // This value becomes an iframe src, so the allowlist is a security
    // boundary rather than a convenience.
    it('rejects dangerous protocols', () => {
        expect(parseMusicUrl('javascript:alert(1)')).toBeNull();
        expect(parseMusicUrl('data:text/html,<script>alert(1)</script>')).toBeNull();
        expect(parseMusicUrl('blob:https://soundcloud.com/abc')).toBeNull();
    });

    it('rejects unknown hosts, including lookalikes', () => {
        expect(parseMusicUrl('https://evil.com/track')).toBeNull();
        expect(parseMusicUrl('https://soundcloud.com.evil.com/a/b')).toBeNull();
        expect(parseMusicUrl('https://notsoundcloud.com/a/b')).toBeNull();
        expect(parseMusicUrl('https://open.spotify.com.evil.com/playlist/1')).toBeNull();
    });

    it('rejects a bare SoundCloud profile with no track', () => {
        expect(parseMusicUrl('https://soundcloud.com/djsupad')).toBeNull();
    });

    it('rejects a YouTube URL with no video or list', () => {
        expect(parseMusicUrl('https://www.youtube.com/feed/subscriptions')).toBeNull();
    });

    it('rejects an unknown Spotify entity type', () => {
        expect(parseMusicUrl('https://open.spotify.com/nonsense/abc123')).toBeNull();
    });
});

describe('parseMusicUrl — SoundCloud', () => {
    it('embeds a track', () => {
        const r = parseMusicUrl('https://soundcloud.com/djsupad/housupa-afro-tribal-house-mix');
        expect(r.provider).toBe('SoundCloud');
        expect(r.embedUrl).toContain('w.soundcloud.com/player/');
        expect(r.embedUrl).toContain(encodeURIComponent('https://soundcloud.com/djsupad/housupa-afro-tribal-house-mix'));
        expect(r.height).toBe(166);
    });

    it('gives a set more room', () => {
        const r = parseMusicUrl('https://soundcloud.com/someone/sets/my-practice-mix');
        expect(r.height).toBe(300);
    });

    it('derives a readable label from the slug', () => {
        const r = parseMusicUrl('https://soundcloud.com/merciiful1/krump-mix');
        expect(r.label).toBe('krump mix');
    });

    it('accepts the mobile host', () => {
        expect(parseMusicUrl('https://m.soundcloud.com/a/b').provider).toBe('SoundCloud');
    });
});

describe('parseMusicUrl — YouTube', () => {
    it('embeds a watch link', () => {
        const r = parseMusicUrl('https://www.youtube.com/watch?v=lRbEjAar9yQ');
        expect(r.provider).toBe('YouTube');
        expect(r.embedUrl).toBe('https://www.youtube.com/embed/lRbEjAar9yQ');
    });

    it('embeds a short link', () => {
        expect(parseMusicUrl('https://youtu.be/lRbEjAar9yQ').embedUrl)
            .toBe('https://www.youtube.com/embed/lRbEjAar9yQ');
    });

    it('embeds a playlist', () => {
        const r = parseMusicUrl('https://www.youtube.com/playlist?list=PL1234567890');
        expect(r.embedUrl).toBe('https://www.youtube.com/embed/videoseries?list=PL1234567890');
    });

    it('keeps the list when a video is played inside one', () => {
        const r = parseMusicUrl('https://www.youtube.com/watch?v=abc123&list=PL999');
        expect(r.embedUrl).toBe('https://www.youtube.com/embed/abc123?list=PL999');
    });

    it('accepts an already-embed link', () => {
        expect(parseMusicUrl('https://www.youtube.com/embed/abc123').embedUrl)
            .toBe('https://www.youtube.com/embed/abc123');
    });
});

describe('parseMusicUrl — Spotify', () => {
    it('embeds a playlist', () => {
        const r = parseMusicUrl('https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M');
        expect(r.provider).toBe('Spotify');
        expect(r.embedUrl).toBe('https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M');
        expect(r.height).toBe(352);
    });

    it('embeds a track more compactly', () => {
        const r = parseMusicUrl('https://open.spotify.com/track/abc123');
        expect(r.embedUrl).toBe('https://open.spotify.com/embed/track/abc123');
        expect(r.height).toBe(152);
    });

    it('strips a locale prefix', () => {
        const r = parseMusicUrl('https://open.spotify.com/intl-de/playlist/xyz789');
        expect(r.embedUrl).toBe('https://open.spotify.com/embed/playlist/xyz789');
    });

    it('ignores query params like ?si=', () => {
        const r = parseMusicUrl('https://open.spotify.com/playlist/abc?si=1a2b3c');
        expect(r.embedUrl).toBe('https://open.spotify.com/embed/playlist/abc');
    });
});
