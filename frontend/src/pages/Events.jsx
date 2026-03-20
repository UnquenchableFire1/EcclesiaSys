import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getEvents } from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faMapMarkerAlt, faClock, faDownload } from '@fortawesome/free-solid-svg-icons';

export default function Events() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        getEvents().then(response => {
            const data = response.data;
            const fetchedEvents = data.data || data || [];
            setEvents(Array.isArray(fetchedEvents) ? fetchedEvents : []);
            setLoading(false);

            // Check for id in query params
            const params = new URLSearchParams(location.search);
            const eventId = params.get('id');
            if (eventId) {
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
        });
    }, []);

    if (loading) return (
        <div className="flex justify-center flex-col items-center min-h-[50vh] animate-fade-in">
            <div className="w-12 h-12 border-4 border-mdSecondary/30 border-t-mdSecondary rounded-full animate-spin mb-4"></div>
            <div className="text-mdOnSurfaceVariant font-bold tracking-wide">Loading events...</div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 animate-fade-in">
                <div className="mb-10 sm:mb-14">
                    <button 
                        onClick={() => navigate(sessionStorage.getItem('userType') === 'admin' ? '/admin' : '/member-dashboard')}
                        className="w-max flex items-center gap-2 text-mdSecondary font-bold hover:underline mb-6 transition-all"
                    >
                        <FontAwesomeIcon icon={faClock} className="rotate-90" />
                        Back to Dashboard
                    </button>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-mdSecondaryContainer p-3 sm:p-4 rounded-2xl">
                            <FontAwesomeIcon icon={faCalendarAlt} className="text-3xl sm:text-4xl text-mdSecondary" />
                        </div>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-mdOnSurface tracking-tight">
                            Events
                        </h1>
                    </div>
                    <p className="text-mdOnSurfaceVariant text-xl font-medium max-w-2xl">
                        Stay connected with our upcoming church activities and gatherings
                    </p>
                </div>
                
                {events.length === 0 ? (
                    <div className="bg-mdSurfaceVariant/30 border border-mdOutline/20 p-10 rounded-3xl text-center">
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-5xl mb-4 text-mdOutline" />
                        <h3 className="text-xl font-bold text-mdOnSurface mb-2">No events scheduled yet</h3>
                        <p className="text-mdOnSurfaceVariant">Subscribe to our newsletter to be notified of upcoming events!</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
                        {events.map((event, index) => (
                            <div key={event.id || index} id={`event-${event.id}`} className="bg-mdSurface p-6 sm:p-8 rounded-3xl border border-mdSurfaceVariant shadow-sm hover:shadow-md2 transition-all duration-300 flex flex-col group">
                                <h3 className="text-2xl font-extrabold text-mdOnSurface group-hover:text-mdSecondary transition-colors mb-6">{event.title}</h3>
                                
                                <div className="space-y-4 mb-6 flex-grow">
                                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-mdSurfaceVariant/30">
                                        <div className="bg-mdSecondaryContainer/50 p-2 rounded-xl text-mdSecondary text-xl mt-0.5">
                                            <FontAwesomeIcon icon={faCalendarAlt} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-mdOnSurfaceVariant uppercase tracking-wider mb-1">Date & Time</p>
                                            <p className="text-mdOnSurface font-bold">{event.eventDate ? new Date(event.eventDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'TBA'}</p>
                                            <p className="text-mdOnSurfaceVariant text-sm font-medium">{event.eventDate ? new Date(event.eventDate).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : ''}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-mdSurfaceVariant/30">
                                        <div className="bg-mdPrimaryContainer/50 p-2 rounded-xl text-mdPrimary text-xl mt-0.5">
                                            <FontAwesomeIcon icon={faMapMarkerAlt} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-mdOnSurfaceVariant uppercase tracking-wider mb-1">Location</p>
                                            <p className="text-mdOnSurface font-bold">{event.location || 'TBA'}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <p className="text-mdOnSurfaceVariant leading-relaxed mb-6 whitespace-pre-line">{event.description}</p>
                                
                                {event.documentUrl && (
                                    <div className="pt-4 border-t border-mdSurfaceVariant/50 mt-auto">
                                        <a
                                            href={event.documentUrl}
                                            className="inline-flex items-center gap-2 bg-mdSecondaryContainer/50 hover:bg-mdSecondary text-mdSecondary hover:text-mdOnSecondary px-5 py-2.5 rounded-full font-bold transition-all duration-300"
                                        >
                                            <FontAwesomeIcon icon={faDownload} /> Download Info
                                        </a>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
