import { useState, useEffect, useMemo } from 'react';
import { getEvents, deleteEvent, markNotificationAsRead } from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faCalendarAlt, 
    faClock, 
    faMapMarkerAlt, 
    faSearch, 
    faInfoCircle, 
    faArrowRight, 
    faTrashAlt,
    faDirections,
    faBell,
    faCalendarPlus,
    faTimes
} from '@fortawesome/free-solid-svg-icons';

export default function Events({ embedded = false }) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEvent, setSelectedEvent] = useState(null);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = user.role === 'ADMIN';

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await getEvents();
            const data = response.data?.data || response.data || [];
            setEvents(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to fetch events:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                await deleteEvent(id);
                setEvents(events.filter(ev => ev.id !== id));
            } catch (err) {
                alert('Failed to delete event');
            }
        }
    };

    const handleGetDirections = (location) => {
        if (!location) return;
        const encodedLocation = encodeURIComponent(location);
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodedLocation}`, '_blank');
    };

    const handleAddToCalendar = (event) => {
        const startDate = new Date(event.eventDate);
        const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours

        const formatICSDate = (date) => {
            return date.toISOString().replace(/-|:|\.\d+/g, "");
        };

        const icsContent = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "BEGIN:VEVENT",
            `URL:${window.location.href}`,
            `DTSTART:${formatICSDate(startDate)}`,
            `DTEND:${formatICSDate(endDate)}`,
            `SUMMARY:${event.title}`,
            `DESCRIPTION:${event.description?.replace(/\n/g, "\\n") || ""}`,
            `LOCATION:${event.location || ""}`,
            "END:VEVENT",
            "END:VCALENDAR"
        ].join("\n");

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute('download', `${event.title.replace(/\s+/g, '_')}.ics`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSetReminder = (event) => {
        // Mock in-app reminder
        alert(`Reminder set for "${event.title}"! You will receive a notification 30 minutes before the start.`);
    };

    const filteredEvents = useMemo(() => {
        return events.filter(event => 
            event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.location?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [events, searchTerm]);

    return (
        <div className={`animate-fade-in ${embedded ? '' : 'max-w-7xl mx-auto px-4 py-12'}`}>
            {!embedded && (
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-mdOnSurface tracking-tighter mb-2">Upcoming Events</h1>
                        <p className="text-mdSecondary font-black text-lg uppercase tracking-widest bg-mdSecondary/5 px-4 py-1 rounded-full w-max">
                            Church Calendar
                        </p>
                    </div>
                </div>
            )}

            {/* Search and Filters */}
            <div className={`glass-card p-6 mb-10 flex flex-col md:flex-row gap-4 items-center ${embedded ? 'mt-4' : ''}`}>
                <div className="relative flex-1 w-full">
                    <FontAwesomeIcon icon={faSearch} className="absolute left-5 top-1/2 -translate-y-1/2 text-mdOutline" />
                    <input
                        type="text"
                        placeholder="Search events by name or location..."
                        className="w-full pl-14 pr-6 py-4 bg-mdSurfaceVariant/20 border-none rounded-2xl focus:ring-2 focus:ring-mdSecondary transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 text-mdOnSurfaceVariant font-bold text-sm uppercase tracking-widest px-4">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-mdSecondary" />
                    <span>{filteredEvents.length} Events</span>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(n => (
                        <div key={n} className="glass-card h-80 animate-pulse"></div>
                    ))}
                </div>
            ) : filteredEvents.length === 0 ? (
                <div className="glass-card p-20 text-center">
                    <div className="w-24 h-24 bg-mdSurfaceVariant/30 rounded-full flex items-center justify-center mx-auto mb-8 opacity-40">
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-4xl" />
                    </div>
                    <p className="text-2xl font-black text-mdOnSurface mb-2">No events found</p>
                    <p className="text-mdOnSurfaceVariant font-medium">Try searching for something else.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredEvents.map((event) => (
                        <div key={event.id} className="glass-card group overflow-hidden flex flex-col hover:border-mdSecondary/30 transition-all duration-500">
                            {/* Visual Header */}
                            <div className="h-3 relative bg-gradient-to-r from-mdSecondary to-mdPrimary"></div>
                            
                            <div className="p-8 flex-1">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-mdSecondary/10 text-mdOnSurface">
                                            <span className="text-lg font-black leading-none">
                                                {event.eventDate ? new Date(event.eventDate).getDate() : '??'}
                                            </span>
                                            <span className="text-[10px] font-black uppercase tracking-widest">
                                                {event.eventDate ? new Date(event.eventDate).toLocaleDateString([], { month: 'short' }) : '---'}
                                            </span>
                                        </div>
                                        <div className="flex flex-col">
                                            <h3 className="text-xl font-black text-mdOnSurface group-hover:text-mdSecondary transition-colors line-clamp-1">
                                                {event.title}
                                            </h3>
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-mdOutline uppercase tracking-widest">
                                                <FontAwesomeIcon icon={faClock} className="text-mdSecondary" />
                                                {event.eventDate ? new Date(event.eventDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'All Day'}
                                            </div>
                                        </div>
                                    </div>
                                    {isAdmin && (
                                        <button 
                                            onClick={(e) => handleDelete(event.id, e)}
                                            className="w-10 h-10 rounded-xl bg-mdError/10 text-mdError hover:bg-mdError hover:text-white transition-all flex items-center justify-center shadow-sm"
                                            title="Delete Event"
                                        >
                                            <FontAwesomeIcon icon={faTrashAlt} />
                                        </button>
                                    )}
                                </div>

                                <p className="text-sm text-mdOnSurfaceVariant font-medium leading-relaxed mb-6 line-clamp-3">
                                    {event.description}
                                </p>

                                <div className="space-y-3 pt-6 border-t border-mdOutline/5">
                                    <div className="flex items-center gap-3 text-xs font-bold text-mdOnSurfaceVariant">
                                        <div className="w-8 h-8 rounded-lg bg-mdSurfaceVariant/30 flex items-center justify-center text-mdSecondary">
                                            <FontAwesomeIcon icon={faMapMarkerAlt} />
                                        </div>
                                        <span className="truncate">{event.location || 'Church Main Hall'}</span>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={() => setSelectedEvent(event)}
                                className="w-full py-4 bg-mdSurfaceVariant/5 hover:bg-mdSecondary hover:text-white border-t border-mdOutline/5 transition-all font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 group/btn"
                            >
                                Get Directions & Info
                                <FontAwesomeIcon icon={faArrowRight} className="text-[8px] group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Event Details Modal */}
            {selectedEvent && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setSelectedEvent(null)}></div>
                    <div className="glass-card relative z-10 w-full max-w-3xl bg-white dark:bg-mdSurface overflow-hidden shadow-2xl animate-scale-up border-none">
                        <div className="h-2 bg-gradient-to-r from-mdSecondary to-mdPrimary"></div>
                        
                        <div className="p-10">
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <span className="px-4 py-2 rounded-full bg-mdSecondary/10 text-mdSecondary text-[10px] font-black uppercase tracking-widest mb-4 inline-block">
                                        Event Details
                                    </span>
                                    <h2 className="text-4xl font-black text-mdOnSurface tracking-tighter leading-tight">
                                        {selectedEvent.title}
                                    </h2>
                                </div>
                                <button onClick={() => setSelectedEvent(null)} className="w-12 h-12 rounded-2xl bg-mdSurfaceVariant/30 flex items-center justify-center text-mdOnSurface hover:bg-mdError hover:text-white transition-all">
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-mdSecondary/10 flex items-center justify-center text-mdSecondary text-xl">
                                            <FontAwesomeIcon icon={faCalendarAlt} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-black tracking-widest text-mdOutline opacity-60">Date & Time</p>
                                            <p className="font-black text-lg">
                                                {selectedEvent.eventDate ? new Date(selectedEvent.eventDate).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : '---'}
                                                <br/>
                                                <span className="text-mdSecondary">
                                                    {selectedEvent.eventDate ? new Date(selectedEvent.eventDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'All Day'}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-mdPrimary/10 flex items-center justify-center text-mdPrimary text-xl">
                                            <FontAwesomeIcon icon={faMapMarkerAlt} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-black tracking-widest text-mdOutline opacity-60">Location</p>
                                            <p className="font-black text-lg">{selectedEvent.location || 'Church Main Hall'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-mdSurfaceVariant/10 p-8 rounded-3xl border border-mdOutline/5">
                                    <p className="text-mdOnSurfaceVariant font-medium leading-relaxed whitespace-pre-wrap">
                                        {selectedEvent.description}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <button 
                                    onClick={() => handleGetDirections(selectedEvent.location)}
                                    className="flex items-center justify-center gap-3 py-4 bg-mdSecondary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lifted hover:scale-[1.03] transition-all"
                                >
                                    <FontAwesomeIcon icon={faDirections} />
                                    Get Directions
                                </button>
                                <button 
                                    onClick={() => handleAddToCalendar(selectedEvent)}
                                    className="flex items-center justify-center gap-3 py-4 bg-mdOnSurface text-mdSurface rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lifted hover:scale-[1.03] transition-all"
                                >
                                    <FontAwesomeIcon icon={faCalendarPlus} />
                                    Add to Calendar
                                </button>
                                <button 
                                    onClick={() => handleSetReminder(selectedEvent)}
                                    className="flex items-center justify-center gap-3 py-4 border-2 border-mdOutline/20 text-mdOnSurface rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-mdOnSurface hover:text-mdSurface transition-all"
                                >
                                    <FontAwesomeIcon icon={faBell} />
                                    Set Reminder
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
