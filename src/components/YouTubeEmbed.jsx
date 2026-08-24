import { useState } from 'react';
import { extractYouTubeId } from '../youtube';

export default function YouTubeEmbed({ videoId, url, title }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const extractedVideoId = videoId || extractYouTubeId(url);

    if (!extractedVideoId) {
        return (
            <div style={{ color: '#721c24', padding: '1rem', backgroundColor: '#f8d7da', borderRadius: '8px' }}>
                Invalid YouTube URL
            </div>
        );
    }

    return (
        // 56.25% padding keeps a 16:9 box that scales with the container.
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '12px', marginBottom: '1rem' }}>
            {loading && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    Loading video...
                </div>
            )}
            <iframe
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none'
                }}
                src={`https://www.youtube.com/embed/${extractedVideoId}`}
                title={title || 'YouTube video'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={() => setLoading(false)}
                onError={() => {
                    setLoading(false);
                    setError(true);
                }}
            />
            {error && (
                <div style={{ color: '#721c24', padding: '0.5rem', backgroundColor: '#f8d7da', borderRadius: '8px', marginTop: '0.5rem' }}>
                    Failed to load video
                </div>
            )}
        </div>
    );
}
