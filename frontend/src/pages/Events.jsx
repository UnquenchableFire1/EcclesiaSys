import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getEvents } from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faMapMarkerAlt, faClock, faDownload } from '@fortawesome/free-solid-svg-icons';

export default function Events() {
    const [expandedEvent, setExpandedEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState([]);

    useEffect(() => {
        // Watchdog timeout to prevent indefinite loading
        const timer = setTimeout(() => {
            if (loading) {
                setLoading(false);
                if (events.length === 0) {
                    console.warn("Loading timed out for events.");
                }
            }
        }, 10000);

        getEvents().then(response => {
            const data = response.data;
            const fetchedEvents = data.data || data || [];
            setEvents(Array.isArray(fetchedEvents) ? fetchedEvents : []);
            setLoading(false);
            clearTimeout(timer);

            // Check for id in query params
            const params = new URLSearchParams(location.search);
            const eventId = params.get('id');
            if (eventId) {
                setExpandedEvent(parseInt(eventId));
                // Scroll to the event after a short delay
                setTimeout(() => {
                    const element = document.getElementById(`event-${eventId}`);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        // Add a temporary highlight class
                        element.classList.add('ring-4', 'ring-mdSecondary', 'transition-all', 'duration-1000');
                        setTimeout(() => {
                            element.classList.remove('ring-4', 'ring-mdSecondary');
                        }, 3000);
                    }
                }, 500);
            }
        }).catch(err => {
            console.error('Error fetching events:', err);
            setLoading(false);
            clearTimeout(timer);
        });

        return () => clearTimeout(timer);
    }, []);

    if (loading) return (
        <div className="flex justify-center flex-col items-center min-h-[50vh] animate-fade-in">
            <div className="w-12 h-12 border-4 border-mdSecondary/30 border-t-mdSecondary rounded-full animate-spin mb-4"></div>
            <div className="text-mdOnSurfaceVariant font-bold tracking-wide text-center">
                Loading events...<br/>
                <span className="text-xs opacity-50 font-medium uppercase tracking-widest leading-none">Preparing the grand celebration</span>
            </div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 animate-fade-in pb-24">
                <div className="mb-10 sm:mb-14">
                    <button 
                        onClick={() => navigate(sessionStorage.getItem('userType') === 'admin' ? '/admin' : '/member-dashboard')}
                        className="w-max flex items-center gap-2 text-mdSecondary font-black hover:bg-mdSecondary/10 px-4 py-2 rounded-xl transition-all mb-6"
                    >
                        <FontAwesomeIcon icon={faClock} className="rotate-90" />
                        Back to Dashboard
                    </button>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-mdSecondaryContainer p-3 sm:p-4 rounded-3xl shadow-sm">
                            <FontAwesomeIcon icon={faCalendarAlt} className="text-3xl sm:text-4xl text-mdSecondary" />
                        </div>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-mdOnSurface tracking-tight">
                            Events
                        </h1>
                    </div>
                </div>
                
                {events.length === 0 ? (
                    <div className="bg-mdSurfaceVariant/20 border-2 border-dashed border-mdOutline/20 p-20 rounded-[3rem] text-center">
                        <div className="w-20 h-20 bg-mdSurfaceVariant/50 rounded-full flex items-center justify-center mx-auto mb-6 text-mdOutline">
                            <FontAwesomeIcon icon={faCalendarAlt} className="text-3xl opacity-40" />
                        </div>
                        <h3 className="text-2xl font-black text-mdOnSurface mb-2">No events scheduled</h3>
                        <p className="text-mdOnSurfaceVariant text-lg">We're' planning' exciting' things'. Stay' tuned' for' updates'!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:gap-8">
                        {events.map((event, index) => (
                            <div 
                                key={event.id || index} 
                                id={`event-${event.id}`} 
                                onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
                                className={`bg-mdSurface p-6 sm:p-8 rounded-[2.5rem] border transition-all duration-500 flex flex-col group cursor-pointer relative overflow-hidden ${
                                    expandedEvent === event.id 
                                    ? 'border-mdSecondary shadow-premium ring-1 ring-mdSecondary/20 translate-x-2' 
                                    : 'border-mdSurfaceVariant shadow-sm hover:shadow-md1 hover:border-mdSecondary/30'
                                }`}
                            >
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-mdSecondary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[10px] font-black text-mdSecondary uppercase tracking-[0.2em] bg-mdSecondary/10 px-2 py-0.5 rounded-md">Upcoming</span>
                                            <span className="text-[10px] font-bold text-mdOnSurfaceVariant uppercase tracking-widest">{event.location || 'Church Main Hall'}</span>
                                        </div>
                                        <h3 className={`text-2xl sm:text-4xl font-black transition-colors duration-300 ${expandedEvent === event.id ? 'text-mdSecondary' : 'text-mdOnSurface'}`}>
                                            {event.title}
                                        </h3>
                                    </div>
                                    <div className={`shrink-0 flex items-center gap-3 p-2 rounded-2xl bg-mdSurfaceVariant/20 ${expandedEvent === event.id ? 'bg-mdSecondaryContainer/30 ring-1 ring-mdSecondary/10' : ''}`}>
                                        <div className="flex flex-col items-center justify-center w-14 h-14 bg-mdSecondary rounded-xl text-white shadow-sm">
                                            <span className="text-[10px] font-black uppercase leading-none mb-1">{event.eventDate ? new Date(event.eventDate).toLocaleDateString('en-US', { month: 'short' }) : '---'}</span>
                                            <span className="text-xl font-black leading-none">{event.eventDate ? new Date(event.eventDate).getDate() : '--'}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                                    <div className="flex items-start gap-4 p-4 rounded-3xl bg-mdSurfaceVariant/20 border border-mdOutline/5">
                                        <div className="bg-mdSecondaryContainer/50 p-2 rounded-xl text-mdSecondary text-xl mt-0.5">
                                            <FontAwesomeIcon icon={faClock} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-mdOnSurfaceVariant uppercase tracking-widest mb-1">Schedule</p>
                                            <p className="text-mdOnSurface font-black">{event.eventDate ? new Date(event.eventDate).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true }) : 'TBA'}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start gap-4 p-4 rounded-3xl bg-mdSurfaceVariant/20 border border-mdOutline/5">
                                        <div className="bg-mdPrimaryContainer/50 p-2 rounded-xl text-mdPrimary text-xl mt-0.5">
                                            <FontAwesomeIcon icon={faMapMarkerAlt} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-mdOnSurfaceVariant uppercase tracking-widest mb-1">Venue</p>
                                            <p className="text-mdOnSurface font-black truncate max-w-[150px]">{event.location || 'EcclesiaSys Plaza'}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${expandedEvent === event.id ? 'max-h-[1000px] opacity-100' : 'max-h-24 opacity-80'}`}>
                                    <p className={`text-mdOnSurfaceVariant text-lg leading-relaxed whitespace-pre-line ${expandedEvent === event.id ? '' : 'line-clamp-2'}`}>
                                        {event.description}
                                    </p>
                                    
                                    {expandedEvent === event.id && (
                                        <div className="mt-8 animate-fade-in">
                                            {event.documentUrl && (
                                                <div className="pt-6 border-t border-mdOutline/10">
                                                    <a
                                                        href={event.documentUrl}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="inline-flex items-center gap-3 bg-mdSecondary text-mdOnSecondary px-8 py-3.5 rounded-2xl font-black shadow-md1 hover:shadow-md2 hover:scale-[1.02] transition-all duration-300"
                                                    >
                                                        <FontAwesomeIcon icon={faDownload} /> Download Info Guide
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {expandedEvent !== event.id && (
                                    <div className="mt-6 flex items-center gap-2 text-mdSecondary font-black text-xs uppercase tracking-widest group-hover:gap-4 transition-all">
                                        Explore Details <FontAwesomeIcon icon={faCalendarAlt} className="text-[10px]" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
    );
}
