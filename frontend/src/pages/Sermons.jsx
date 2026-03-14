import { useEffect, useState } from 'react';
import { getSermons } from '../services/api';
import Layout from '../layouts/Layout';
import analytics from '../services/analyticsTracker';

export default function Sermons() {
    const [sermons, setSermons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedSermon, setExpandedSermon] = useState(null);
    const [filterSpeaker, setFilterSpeaker] = useState('');

    useEffect(() => {
        analytics.trackPageView('Sermons Library');
        
        getSermons().then(response => {
            setSermons(response.data || []);
            setLoading(false);
        }).catch(err => {
            console.error('Error fetching sermons:', err);
            analytics.trackError('Failed to load sermons', 'API_ERROR');
            setLoading(false);
        });
    }, []);

    const handleMediaPlay = (sermon, mediaType) => {
        analytics.trackResourceAccess('SERMON', sermon.id, sermon.title);
        analytics.trackMediaEngagement(mediaType, sermon.id, sermon.title, 0);
        analytics.trackUserAction(`MEDIA_PLAY_${mediaType}`, { sermonTitle: sermon.title });
    };

    const handleDownload = (sermon, mediaType) => {
        analytics.trackUserAction('DOWNLOAD', { 
            type: mediaType, 
            sermon: sermon.title 
        });
    };

    const filteredSermons = filterSpeaker 
        ? sermons.filter(s => s.speaker?.toLowerCase().includes(filterSpeaker.toLowerCase()))
        : sermons;

    const uniqueSpeakers = [...new Set(sermons.map(s => s.speaker).filter(Boolean))];

    if (loading) return <Layout><div className="text-center py-8 text-lemon font-semibold">Loading...</div></Layout>;

    return (
        <Layout>
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header Section */}
                <div className="mb-12">
                    <h1 className="text-5xl font-bold mb-3 text-white">
                        <span className="text-lemon">🎤</span> Sermon Library
                    </h1>
                    <p className="text-xl text-gray-300">
                        Watch and listen to inspiring messages from our pastoral team
                    </p>
                </div>

                {sermons.length === 0 ? (
                    <div className="bg-gradient-to-r from-teal-700 to-teal-900 border-l-4 border-lemon p-12 rounded-lg text-center shadow-lg">
                        <p className="text-white text-xl mb-2">📚 No sermons available yet</p>
                        <p className="text-gray-300">New sermons will be added soon. Check back soon!</p>
                    </div>
                ) : (
                    <div>
                        {/* Filter Section */}
                        {uniqueSpeakers.length > 1 && (
                            <div className="mb-8 bg-teal-800 p-6 rounded-lg">
                                <h3 className="text-white font-semibold mb-4">Filter by Speaker</h3>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setFilterSpeaker('')}
                                        className={`px-4 py-2 rounded-lg font-semibold transition ${
                                            filterSpeaker === ''
                                                ? 'bg-lemon text-tealDeep'
                                                : 'bg-teal-700 text-gray-300 hover:bg-teal-600'
                                        }`}
                                    >
                                        All Speakers
                                    </button>
                                    {uniqueSpeakers.map(speaker => (
                                        <button
                                            key={speaker}
                                            onClick={() => setFilterSpeaker(speaker)}
                                            className={`px-4 py-2 rounded-lg font-semibold transition ${
                                                filterSpeaker === speaker
                                                    ? 'bg-lemon text-tealDeep'
                                                    : 'bg-teal-700 text-gray-300 hover:bg-teal-600'
                                            }`}
                                        >
                                            {speaker}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-sm text-gray-300 mt-4">
                                    Showing {filteredSermons.length} sermon{filteredSermons.length !== 1 ? 's' : ''} {filterSpeaker && `by ${filterSpeaker}`}
                                </p>
                            </div>
                        )}

                        {/* Sermons Grid */}
                        <div className="grid grid-cols-1 gap-6">
                            {filteredSermons.map((sermon, index) => (
                                <div 
                                    key={sermon.id || index} 
                                    className="bg-gradient-to-br from-teal-800 to-teal-900 p-8 rounded-lg border-l-4 border-lemon shadow-md hover:shadow-xl transition cursor-pointer"
                                    onClick={() => {
                                        setExpandedSermon(expandedSermon === sermon.id ? null : sermon.id);
                                        analytics.trackUserAction('SERMON_TOGGLE_EXPAND', { sermon: sermon.title });
                                    }}
                                >
                                    {/* Header Info */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-3xl font-bold text-lemon mb-2">{sermon.title}</h3>
                                            <p className="text-gray-400 mb-2">{sermon.description}</p>
                                            <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                                                <span>
                                                    <span className="font-semibold text-lemon">🎤</span> {sermon.speaker}
                                                </span>
                                                <span>
                                                    <span className="font-semibold text-lemon">📅</span> {new Date(sermon.sermonDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                </span>
                                                {sermon.audioUrl && <span className="text-lemon">🎧 Audio Available</span>}
                                                {sermon.videoUrl && <span className="text-lemon">🎬 Video Available</span>}
                                            </div>
                                        </div>
                                        <span className="text-2xl ml-4">{expandedSermon === sermon.id ? '▼' : '▶'}</span>
                                    </div>

                                    {/* Expandable Media Section */}
                                    {expandedSermon === sermon.id && (
                                        <div className="mt-6 pt-6 border-t border-teal-600">
                                            {/* Audio Player */}
                                            {sermon.audioUrl && (
                                                <div className="mb-6">
                                                    <h4 className="text-lemon font-semibold mb-3 flex items-center">
                                                        <span className="mr-2">🎧</span> Audio Message
                                                    </h4>
                                                    <audio 
                                                        controls 
                                                        className="w-full mb-3" 
                                                        style={{accentColor: '#FDE047'}}
                                                        onPlay={() => handleMediaPlay(sermon, 'AUDIO')}
                                                    >
                                                        <source src={sermon.audioUrl} type="audio/mpeg" />
                                                        Your browser does not support the audio element.
                                                    </audio>
                                                    <a
                                                        href={sermon.audioUrl}
                                                        download
                                                        onClick={() => handleDownload(sermon, 'AUDIO')}
                                                        className="inline-flex items-center bg-lemon hover:bg-yellow-300 text-tealDeep px-4 py-2 rounded-lg font-semibold transition text-sm"
                                                    >
                                                        📥 Download Audio
                                                    </a>
                                                </div>
                                            )}

                                            {/* Video Player */}
                                            {sermon.videoUrl && (
                                                <div className="mb-6">
                                                    <h4 className="text-lemon font-semibold mb-3 flex items-center">
                                                        <span className="mr-2">🎬</span> Video Message
                                                    </h4>
                                                    <video 
                                                        controls 
                                                        className="w-full max-h-96 rounded-lg mb-3"
                                                        onPlay={() => handleMediaPlay(sermon, 'VIDEO')}
                                                    >
                                                        <source src={sermon.videoUrl} type="video/mp4" />
                                                        Your browser does not support the video element.
                                                    </video>
                                                    <a
                                                        href={sermon.videoUrl}
                                                        download
                                                        onClick={() => handleDownload(sermon, 'VIDEO')}
                                                        className="inline-flex items-center bg-lemon hover:bg-yellow-300 text-tealDeep px-4 py-2 rounded-lg font-semibold transition text-sm"
                                                    >
                                                        📥 Download Video
                                                    </a>
                                                </div>
                                            )}

                                            {/* Action Buttons */}
                                            <div className="flex flex-wrap gap-3 border-t border-teal-600 pt-4">
                                                <button 
                                                    onClick={() => analytics.trackUserAction('SHARE_SERMON', { sermon: sermon.title })}
                                                    className="bg-teal-700 hover:bg-teal-600 text-white px-4 py-2 rounded-lg font-semibold transition text-sm"
                                                >
                                                    🔗 Share
                                                </button>
                                                <button 
                                                    onClick={() => analytics.trackUserAction('ADD_TO_PLAYLIST', { sermon: sermon.title })}
                                                    className="bg-teal-700 hover:bg-teal-600 text-white px-4 py-2 rounded-lg font-semibold transition text-sm"
                                                >
                                                    ⭐ Add to Favorites
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {filteredSermons.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-300 text-lg">No sermons found by {filterSpeaker}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
}

