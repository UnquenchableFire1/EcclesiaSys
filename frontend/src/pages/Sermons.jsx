import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getSermons } from '../services/api';
import analytics from '../services/analyticsTracker';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faVideo, faCalendarAlt, faUser, faPlay, faDownload, faFilter, faSearch, faChevronDown, faShareAlt, faHeart } from '@fortawesome/free-solid-svg-icons';

export default function Sermons() {
    const [expandedSermon, setExpandedSermon] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sermons, setSermons] = useState([]);
    const [filterSpeaker, setFilterSpeaker] = useState('');
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        analytics.trackPageView('Sermons Library');
        
        // Watchdog timeout to prevent indefinite loading
        const timer = setTimeout(() => {
            if (loading) {
                setLoading(false);
                if (sermons.length === 0) {
                    console.warn("Loading timed out for sermons.");
                }
            }
        }, 10000);

        getSermons().then(response => {
            const data = response.data;
            const fetchedSermons = data.data || data || [];
            if (Array.isArray(fetchedSermons)) {
                setSermons(fetchedSermons);
            } else {
                setSermons([]);
            }
            setLoading(false);
            clearTimeout(timer);

            // Check for id in query params
            const params = new URLSearchParams(location.search);
            const sermonId = params.get('id');
            if (sermonId) {
                setExpandedSermon(parseInt(sermonId));
                // Scroll to the sermon after a short delay
                setTimeout(() => {
                    const element = document.getElementById(`sermon-${sermonId}`);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 500);
            }
        }).catch(err => {
            console.error('Error fetching sermons:', err);
            analytics.trackError('Failed to load sermons', 'API_ERROR');
            setLoading(false);
            clearTimeout(timer);
        });

        return () => clearTimeout(timer);
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

    if (loading) return (
        <div className="flex justify-center flex-col items-center min-h-[50vh] animate-fade-in">
            <div className="w-12 h-12 border-4 border-mdPrimary/30 border-t-mdPrimary rounded-full animate-spin mb-4"></div>
            <div className="text-mdOnSurfaceVariant font-bold tracking-wide">Loading sermons...</div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 animate-fade-in">
                {/* Header Section */}
                <div className="mb-10 sm:mb-14">
                        <div className="flex flex-col gap-4 mb-4">
                            <button 
                                onClick={() => navigate(sessionStorage.getItem('userType') === 'admin' ? '/admin' : '/member-dashboard')}
                                className="w-max flex items-center gap-2 text-mdPrimary font-bold hover:underline mb-2 transition-all"
                            >
                                <FontAwesomeIcon icon={faChevronDown} className="rotate-90" />
                                Back to Dashboard
                            </button>
                            <div className="flex items-center gap-4">
                                <div className="bg-mdPrimaryContainer p-3 sm:p-4 rounded-2xl">
                                    <FontAwesomeIcon icon={faMicrophone} className="text-3xl sm:text-4xl text-mdPrimary" />
                                </div>
                                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-mdOnSurface tracking-tight">
                                    Sermons
                                </h1>
                            </div>
                        </div>
                    <p className="text-mdOnSurfaceVariant text-xl font-medium max-w-2xl">
                        Watch and listen to inspiring messages from our pastoral team
                    </p>
                </div>

                {sermons.length === 0 ? (
                    <div className="bg-mdSurfaceVariant/30 border border-mdOutline/20 p-12 rounded-[2.5rem] text-center shadow-sm">
                        <FontAwesomeIcon icon={faMicrophone} className="text-6xl mb-6 text-mdOutline" />
                        <h3 className="text-2xl font-bold text-mdOnSurface mb-3">No sermons available yet</h3>
                        <p className="text-mdOnSurfaceVariant text-lg">New sermons will be added soon. Check back later!</p>
                    </div>
                ) : (
                    <div>
                        {/* Filter Section */}
                        {uniqueSpeakers.length > 1 && (
                            <div className="mb-10 bg-mdSurface p-6 sm:p-8 rounded-3xl border border-mdSurfaceVariant shadow-sm">
                                    <FontAwesomeIcon icon={faFilter} className="text-mdPrimary mr-2" /> Filter by Speaker
                                <div className="flex flex-wrap gap-3">
                                    <button
                                        onClick={() => setFilterSpeaker('')}
                                        className={`px-6 py-2.5 rounded-full font-bold transition-all duration-300 ${
                                            filterSpeaker === ''
                                                ? 'bg-mdPrimary text-mdOnPrimary shadow-md1 transform -translate-y-0.5'
                                                : 'bg-mdSurfaceVariant/50 text-mdOnSurfaceVariant hover:bg-mdSurfaceVariant hover:text-mdOnSurface'
                                        }`}
                                    >
                                        All Speakers
                                    </button>
                                    {uniqueSpeakers.map(speaker => (
                                        <button
                                            key={speaker}
                                            onClick={() => setFilterSpeaker(speaker)}
                                            className={`px-6 py-2.5 rounded-full font-bold transition-all duration-300 ${
                                                filterSpeaker === speaker
                                                    ? 'bg-mdPrimary text-mdOnPrimary shadow-md1 transform -translate-y-0.5'
                                                    : 'bg-mdSurfaceVariant/50 text-mdOnSurfaceVariant hover:bg-mdSurfaceVariant hover:text-mdOnSurface'
                                            }`}
                                        >
                                            {speaker}
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-5 pt-5 border-t border-mdSurfaceVariant/50 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-mdPrimary animate-pulse"></span>
                                    <p className="text-sm font-semibold text-mdOnSurfaceVariant uppercase tracking-wider">
                                        Showing <span className="text-mdPrimary">{filteredSermons.length}</span> sermon{filteredSermons.length !== 1 ? 's' : ''} {filterSpeaker && `by ${filterSpeaker}`}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Sermons List */}
                        <div className="space-y-6">
                            {filteredSermons.map((sermon, index) => (
                                <div 
                                    key={sermon.id || index} 
                                    id={`sermon-${sermon.id}`}
                                    className={`bg-mdSurface p-6 sm:p-8 rounded-[2rem] border transition-all duration-500 overflow-hidden ${
                                        expandedSermon === sermon.id 
                                        ? 'border-mdPrimary shadow-md2 bg-mdPrimaryContainer/5' 
                                        : 'border-mdSurfaceVariant shadow-sm hover:shadow-md1 hover:border-mdOutline/30'
                                    }`}
                                >
                                    {/* Header Info - Clickable */}
                                    <div 
                                        className="flex items-start justify-between gap-4 cursor-pointer group"
                                        onClick={() => {
                                            setExpandedSermon(expandedSermon === sermon.id ? null : sermon.id);
                                            // Only track expand, not collapse
                                            if (expandedSermon !== sermon.id) {
                                                analytics.trackUserAction('SERMON_TOGGLE_EXPAND', { sermon: sermon.title });
                                            }
                                        }}
                                    >
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-3 mb-3">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mdSecondaryContainer text-mdSecondary text-sm font-bold">
                                                    <FontAwesomeIcon icon={faCalendarAlt} /> {new Date(sermon.sermonDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </span>
                                                {sermon.audioUrl && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mdPrimaryContainer text-mdPrimary text-sm font-bold"><FontAwesomeIcon icon={faMicrophone} /> Audio</span>}
                                                {sermon.videoUrl && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFDAB9]/30 text-[#D2691E] text-sm font-bold"><FontAwesomeIcon icon={faVideo} /> Video</span>}
                                            </div>
                                            
                                            <h3 className={`text-2xl sm:text-3xl font-extrabold mb-2 transition-colors duration-300 ${expandedSermon === sermon.id ? 'text-mdPrimary' : 'text-mdOnSurface group-hover:text-mdPrimary/80'}`}>
                                                {sermon.title}
                                            </h3>
                                            
                                            <p className="text-mdOnSurface text-lg font-medium mb-3 flex items-center gap-2">
                                                <FontAwesomeIcon icon={faUser} className="text-mdOnSurfaceVariant text-sm" /> <span className="text-mdOnSurfaceVariant">by</span> {sermon.speaker}
                                            </p>
                                            
                                            {sermon.description && (
                                                <p className={`text-mdOnSurfaceVariant transition-all duration-300 ${expandedSermon === sermon.id ? 'line-clamp-none mb-6' : 'line-clamp-2'}`}>
                                                    {sermon.description}
                                                </p>
                                            )}
                                        </div>
                                        
                                        <div className={`flex items-center justify-center w-12 h-12 rounded-full bg-mdSurfaceVariant/30 text-mdOnSurface transition-all duration-500 shrink-0 ${expandedSermon === sermon.id ? 'bg-mdPrimaryContainer text-mdPrimary rotate-180' : 'group-hover:bg-mdSurfaceVariant'}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Expandable Media Section */}
                                    <div 
                                        className={`transition-all duration-500 ease-in-out ${
                                            expandedSermon === sermon.id 
                                            ? 'opacity-100 max-h-[1000px] mt-6 pt-6 border-t border-mdSurfaceVariant/70' 
                                            : 'opacity-0 max-h-0 overflow-hidden'
                                        }`}
                                    >
                                        {/* Audio Player */}
                                        {sermon.audioUrl && (
                                            <div className="mb-8 bg-mdSurfaceVariant/20 p-5 rounded-3xl border border-mdSurfaceVariant/50">
                                                <h4 className="text-mdOnSurface font-bold mb-4 flex items-center gap-2">
                                                    <div className="bg-mdPrimaryContainer text-mdPrimary p-1.5 rounded-lg">
                                                        <FontAwesomeIcon icon={faMicrophone} />
                                                    </div> Listen to Audio
                                                </h4>
                                                <audio 
                                                    controls 
                                                    className="w-full mb-4 rounded-full" 
                                                    onPlay={() => handleMediaPlay(sermon, 'AUDIO')}
                                                >
                                                    <source src={sermon.audioUrl} type="audio/mpeg" />
                                                    Your browser does not support the audio element.
                                                </audio>
                                                <a
                                                    href={sermon.audioUrl}
                                                    download
                                                    onClick={() => handleDownload(sermon, 'AUDIO')}
                                                    className="inline-flex items-center gap-2 bg-mdPrimary hover:bg-mdPrimary/90 text-mdOnPrimary px-6 py-2.5 rounded-full font-bold transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                                                >
                                                    <FontAwesomeIcon icon={faDownload} /> Download Audio
                                                </a>
                                            </div>
                                        )}

                                        {/* Video Player */}
                                        {sermon.videoUrl && (
                                            <div className="mb-8 bg-mdSurfaceVariant/20 p-5 rounded-3xl border border-mdSurfaceVariant/50">
                                                <h4 className="text-mdOnSurface font-bold mb-4 flex items-center gap-2">
                                                    <div className="bg-[#FFDAB9]/30 text-[#D2691E] p-1.5 rounded-lg">
                                                        <FontAwesomeIcon icon={faVideo} />
                                                    </div> Watch Video
                                                </h4>
                                                <div className="rounded-2xl overflow-hidden shadow-sm mb-4 border border-mdOutline/20 bg-black aspect-video flex items-center justify-center">
                                                    <video 
                                                        controls 
                                                        className="w-full max-h-[500px]"
                                                        onPlay={() => handleMediaPlay(sermon, 'VIDEO')}
                                                    >
                                                        <source src={sermon.videoUrl} type="video/mp4" />
                                                        Your browser does not support the video element.
                                                    </video>
                                                </div>
                                                <a
                                                    href={sermon.videoUrl}
                                                    download
                                                    onClick={() => handleDownload(sermon, 'VIDEO')}
                                                    className="inline-flex items-center gap-2 bg-[#D2691E] hover:bg-[#D2691E]/90 text-white px-6 py-2.5 rounded-full font-bold transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                                                >
                                                    <FontAwesomeIcon icon={faDownload} /> Download Video
                                                </a>
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="flex flex-wrap gap-3 pt-6 border-t border-mdSurfaceVariant/50">
                                            <button 
                                                onClick={() => analytics.trackUserAction('SHARE_SERMON', { sermon: sermon.title })}
                                                className="inline-flex items-center gap-2 bg-mdSurfaceVariant/50 hover:bg-mdSurfaceVariant text-mdOnSurfaceVariant hover:text-mdOnSurface px-5 py-2 rounded-full font-bold transition-all"
                                            >
                                                <FontAwesomeIcon icon={faShareAlt} /> Share
                                            </button>
                                            <button 
                                                onClick={() => analytics.trackUserAction('ADD_TO_PLAYLIST', { sermon: sermon.title })}
                                                className="inline-flex items-center gap-2 bg-mdSurfaceVariant/50 hover:bg-mdSurfaceVariant text-mdOnSurfaceVariant hover:text-mdOnSurface px-5 py-2 rounded-full font-bold transition-all"
                                            >
                                                <FontAwesomeIcon icon={faHeart} /> Add to Favorites
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filteredSermons.length === 0 && filterSpeaker && (
                            <div className="text-center py-16 bg-mdSurfaceVariant/20 rounded-3xl border border-mdOutline/10 mt-6">
                                <FontAwesomeIcon icon={faSearch} className="text-4xl mb-4 text-mdOutline" />
                                <h3 className="text-xl font-bold text-mdOnSurface mb-1">No matches found</h3>
                                <p className="text-mdOnSurfaceVariant">No sermons found by {filterSpeaker}</p>
                                <button 
                                    onClick={() => setFilterSpeaker('')}
                                    className="mt-6 px-6 py-2 bg-mdPrimaryContainer text-mdPrimary rounded-full font-bold hover:bg-mdPrimary hover:text-mdOnPrimary transition-colors"
                                >
                                    Clear Filter
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
    );
}
