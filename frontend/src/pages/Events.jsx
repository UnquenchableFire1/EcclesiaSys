import { useState, useEffect, useMemo } from 'react';
import { getEvents } from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faClock, faMapMarkerAlt, faSearch, faInfoCircle, faArrowRight } from '@fortawesome/free-solid-svg-icons';

export default function Events({ embedded = false }) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
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
        fetchEvents();
    }, []);

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
                        <div key={event.id} className="glass-card group overflow-hidden flex flex-col hover:border-mdSecondary/30">
                            {/* Visual Header */}
                            <div className="h-3 relative bg-gradient-to-r from-mdSecondary to-mdPrimary"></div>
                            
                            <div className="p-8 flex-1">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-mdSecondary/10 text-mdOnSurface">
                                        <span className="text-lg font-black leading-none">
                                            {new Date(event.startDate).getDate()}
                                        </span>
                                        <span className="text-[10px] font-black uppercase tracking-widest">
                                            {new Date(event.startDate).toLocaleDateString([], { month: 'short' })}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="text-xl font-black text-mdOnSurface group-hover:text-mdSecondary transition-colors line-clamp-1">
                                            {event.title}
                                        </h3>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-mdOutline uppercase tracking-widest">
                                            <FontAwesomeIcon icon={faClock} className="text-mdSecondary" />
                                            {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
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

                            <button className="w-full py-4 bg-mdSurfaceVariant/5 hover:bg-mdSecondary hover:text-white border-t border-mdOutline/5 transition-all font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3">
                                Get Directions / Info
                                <FontAwesomeIcon icon={faArrowRight} className="text-[8px]" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
