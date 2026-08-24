const YOUTUBE_ID_PATTERNS = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/
];

/**
 * Pull the video id out of any of the YouTube URL shapes.
 *
 * Mirrors extractYouTubeVideoId in server.js, which stores `videoId` on links
 * at submission time — this is the fallback for links saved before that field
 * existed, or entered by hand.
 *
 * Kept in a component-free module so YouTubeEmbed.jsx exports only a
 * component and React Fast Refresh keeps working.
 */
export function extractYouTubeId(url) {
    if (!url) return null;
    for (const pattern of YOUTUBE_ID_PATTERNS) {
        const match = url.match(pattern);
        if (match && match[1]) return match[1];
    }
    return null;
}
