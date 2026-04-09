import { useState, useEffect, useMemo } from 'react';
import { getEvents, deleteEvent } from '../services/api';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import Hero from '../components/Hero';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faCalendarAlt, 
    faClock, 
    faMapMarkerAlt, 
    faSearch, 
    faArrowRight, 
    faTrashAlt,
    faBell,
    faCalendarPlus,
    faTimes 
} from '@fortawesome/free-solid-svg-icons';
import MediaPreview from '../components/MediaPreview';

export default function Events({ embedded = false, branchId = null }) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        onConfirm: () => {}
    });
    
    const userType = sessionStorage.getItem('userType');
    const isAdmin = userType === 'admin';

    useEffect(() => {
        fetchEvents();
    }, [branchId]);

    const { showToast } = useToast();

    const fetchEvents = async () => {
        try {
            const response = await getEvents(branchId);
            const data = response.data?.data || response.data || [];
            setEvents(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to fetch events:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id, e) => {
        e.stopPropagation();
        setConfirmModal({
            isOpen: true,
            onConfirm: async () => {
                try {
                    await deleteEvent(id);
                    setEvents(events.filter(ev => ev.id !== id));
                } catch (err) {
                    console.error('Failed to delete event');
                }
            }
        });
    };

    const handleAddToCalendar = (event) => {
        const startDate = new Date(event.eventDate);
        const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

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
        showToast(`Reminder set for "${event.title}"! You will receive a notification 30 minutes before the start.`, 'success');
    };

    const filteredEvents = useMemo(() => {
        return events.filter(event => 
            event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.location?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [events, searchTerm]);

    return (
        <div className={`animate-fade-in pb-20 ${embedded ? '' : 'max-w-7xl mx-auto px-4'}`}>
            {!embedded && (
                <div className="mb-12">
                    <Hero 
                        title="Sacred Gatherings"
                        subtitle="Join our vibrant community as we fellowship together, grow in grace, and manifest the assembly's vision in our world."
                        small={true}
                    />
                </div>
            )}

            {/* Search and Filters */}
            <div className={`glass-card p-8 mb-12 flex flex-col md:flex-row gap-6 items-center ${embedded ? 'mt-4' : ''} rounded-[2.5rem] shadow-premium bg-white/50 backdrop-blur-xl border-white/20`}>
                <div className="relative flex-1 w-full">
                    <FontAwesomeIcon icon={faSearch} className="absolute left-6 top-1/2 -translate-y-1/2 text-mdSecondary opacity-50 text-xl" />
                    <input
                        type="text"
                        placeholder="Search for an upcoming gathering or location..."
                        className="w-full pl-16 pr-8 py-5 bg-mdSurfaceVariant/30 border-none rounded-3xl focus:ring-4 focus:ring-mdSecondary/20 transition-all font-bold text-lg placeholder:text-mdOnSurfaceVariant/40"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-4 bg-mdSecondary/10 px-8 py-4 rounded-3xl text-mdSecondary font-black text-xs uppercase tracking-widest border border-mdSecondary/5 shadow-sm whitespace-nowrap">
                    <FontAwesomeIcon icon={faCalendarAlt} className="animate-pulse" />
                    <span>{filteredEvents.length} Upcoming Events</span>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {[1, 2, 3].map(n => (
                        <div key={n} className="img-card h-[500px] animate-pulse rounded-[2.5rem] opacity-50"></div>
                    ))}
                </div>
            ) : filteredEvents.length === 0 ? (
                <div className="bg-mdSurfaceVariant/20 p-24 text-center rounded-[4rem] border-4 border-dashed border-mdOutline/10">
                    <div className="w-32 h-32 bg-mdSurfaceVariant/30 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 opacity-30 shadow-inner">
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-5xl" />
                    </div>
                    <h3 className="text-3xl font-black text-mdOnSurface mb-4">The Calendar is Clear</h3>
                    <p className="text-xl text-mdOnSurfaceVariant font-medium max-w-md mx-auto leading-relaxed">No gatherings have been scheduled in this season. Check back soon for new opportunities to connect.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {filteredEvents.map((event, idx) => (
                        <div key={event.id} className="img-card group min-h-[550px] rounded-[3rem] hover:shadow-premium transition-all duration-700 flex flex-col bg-gradient-to-br from-mdSecondaryContainer to-mdSecondary">
                             <div className="absolute inset-0 bg-black/10 group-hover:bg-mdSecondary/40 transition-all duration-700"></div>
                             
                             {isAdmin && (
                                <div className="absolute top-8 right-8 z-20">
                                    <button 
                                        onClick={(e) => handleDelete(event.id, e)}
                                        className="w-12 h-12 rounded-2xl bg-black/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-mdError hover:shadow-premium transition-all shadow-md active:scale-90"
                                    >
                                        <FontAwesomeIcon icon={faTrashAlt} />
                                    </button>
                                </div>
                             )}

                             <div className="absolute inset-0 z-10 p-10 flex flex-col justify-end text-white">
                                <div className="flex items-center gap-6 mb-8 group/date">
                                    <div className="flex flex-col items-center justify-center w-20 h-20 rounded-[1.5rem] bg-white text-mdPrimary shadow-premium group-hover/date:scale-110 transition-transform">
                                        <span className="text-3xl font-black leading-none">
                                            {event.eventDate ? new Date(event.eventDate).getDate() : '??'}
                                        </span>
                                        <span className="text-[11px] font-black uppercase tracking-widest text-mdOnSurface/40">
                                            {event.eventDate ? new Date(event.eventDate).toLocaleDateString([], { month: 'short' }) : '---'}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-mdSecondary">Upcoming</span>
                                            {!event.branchId && (
                                                <span className="text-[8px] font-black uppercase tracking-widest bg-purple-500 text-white px-2 py-0.5 rounded-full">Global</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm font-black text-white/90">
                                            <FontAwesomeIcon icon={faClock} className="text-mdSecondary" />
                                            {event.eventDate ? new Date(event.eventDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'All Day'}
                                        </div>
                                    </div>
                                </div>

                                <h3 className="text-3xl font-black mb-4 leading-tight tracking-tighter line-clamp-2">
                                    {event.title}
                                </h3>

                                <p className="text-white/80 text-lg leading-relaxed font-medium mb-10 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                    {event.description}
                                </p>

                                <div className="pt-8 border-t border-white/10 flex items-center justify-between">
                                    <div className="flex items-center gap-3 text-xs font-black text-white uppercase tracking-widest">
                                        <div className="w-10 h-10 rounded-xl bg-white/10 shadow-inner flex items-center justify-center text-mdSecondary">
                                            <FontAwesomeIcon icon={faMapMarkerAlt} />
                                        </div>
                                        <span className="truncate max-w-[150px]">{event.location || 'Assembly'}</span>
                                    </div>
                                    <button 
                                        onClick={() => setSelectedEvent(event)}
                                        className="w-12 h-12 rounded-2xl bg-mdSecondary text-white flex items-center justify-center shadow-premium hover:scale-110 active:scale-90 transition-all"
                                    >
                                        <FontAwesomeIcon icon={faArrowRight} />
                                    </button>
                                </div>
                             </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Event Details Modal */}
            {selectedEvent && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl" onClick={() => setSelectedEvent(null)}></div>
                    <div className="relative z-10 w-full max-w-4xl bg-white overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] animate-slide-up border-none rounded-[4rem] flex flex-col md:flex-row min-h-[600px]">
                        <button 
                            onClick={() => setSelectedEvent(null)} 
                            className="absolute top-8 right-8 z-30 w-14 h-14 rounded-[2rem] bg-white/10 hover:bg-mdError text-white backdrop-blur-md transition-all flex items-center justify-center text-xl shadow-premium"
                        >
                            <FontAwesomeIcon icon={faTimes} /> 
                        </button>

                        {/* Visual Header */}
                        <div className="w-full md:w-5/12 relative min-h-[300px] md:min-h-full bg-gradient-to-br from-mdSecondaryContainer to-mdSecondary">
                            <div className="absolute inset-0 bg-black/40"></div>
                            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-12 text-white">
                                <div className="w-24 h-24 rounded-[2rem] bg-mdPrimary flex items-center justify-center mb-8 shadow-premium animate-float ring-8 ring-white/5">
                                    <FontAwesomeIcon icon={faCalendarAlt} className="text-4xl" />
                                </div>
                                <span className="text-white/40 font-black uppercase tracking-[0.4em] text-[10px] mb-4">
                                    Church Gathering {!selectedEvent.branchId && " • Assembly Wide"}
                                </span>
                                <h3 className="text-4xl font-black tracking-tighter leading-none italic">Fellowship<br/>Calendar</h3>
                            </div>
                        </div>
                        
                        <div className="w-full md:w-7/12 p-16 flex flex-col justify-between bg-white relative overflow-y-auto max-h-[90vh] md:max-h-none">
                            <div className="absolute top-0 right-0 p-10 text-mdSecondary/5 text-9xl">
                                <FontAwesomeIcon icon={faCalendarPlus} />
                            </div>

                            <div className="relative z-10">
                                <span className="px-6 py-2 rounded-full bg-mdSecondary/10 text-mdSecondary text-[10px] font-black uppercase tracking-[0.3em] mb-10 inline-block border border-mdSecondary/10">
                                    Assembly Event
                                </span>
                                <h2 className="text-4xl md:text-5xl font-black text-mdOnSurface mb-12 leading-[1.1] tracking-tighter">
                                    {selectedEvent.title}
                                </h2>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-16">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 rounded-3xl bg-mdPrimary/5 flex items-center justify-center text-mdPrimary shadow-inner text-xl">
                                            <FontAwesomeIcon icon={faCalendarAlt} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-black tracking-[0.2em] text-mdOutline opacity-60 mb-1">Gathering Date</p>
                                            <p className="font-black text-lg text-mdOnSurface">
                                                {selectedEvent.eventDate ? new Date(selectedEvent.eventDate).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }) : '---'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 rounded-3xl bg-mdSecondary/5 flex items-center justify-center text-mdSecondary shadow-inner text-xl text-center">
                                            <FontAwesomeIcon icon={faClock} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-black tracking-[0.2em] text-mdOutline opacity-60 mb-1">Start Time</p>
                                            <p className="font-black text-lg text-mdOnSurface">
                                                {selectedEvent.eventDate ? new Date(selectedEvent.eventDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'All Day'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-5 sm:col-span-2">
                                        <div className="w-16 h-16 rounded-3xl bg-mdSurfaceVariant/30 flex items-center justify-center text-mdOnSurfaceVariant shadow-inner text-center">
                                            <FontAwesomeIcon icon={faMapMarkerAlt} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-black tracking-[0.2em] text-mdOutline opacity-60 mb-1">Assembly Location</p>
                                            <p className="font-black text-lg text-mdOnSurface">{selectedEvent.location || 'Church Main Hall'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-12 border-t border-mdOutline/5">
                                    <p className="text-[11px] uppercase font-black tracking-[0.3em] text-mdOutline opacity-60 mb-6">Gathering Purpose</p>
                                    <p className="text-xl text-mdOnSurfaceVariant font-medium leading-relaxed italic opacity-80 mb-8">
                                        "{selectedEvent.description}"
                                    </p>
                                    {selectedEvent.documentFileUrl && (
                                        <div className="mt-8 pt-8 border-t border-mdOutline/10">
                                            <p className="text-[10px] uppercase font-black tracking-[0.3em] text-mdOutline opacity-60 mb-4">Event Resources</p>
                                            <MediaPreview url={selectedEvent.documentFileUrl} title={selectedEvent.title} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-16 relative z-10">
                                <button 
                                    onClick={() => handleAddToCalendar(selectedEvent)}
                                    className="flex items-center justify-center gap-4 py-6 bg-mdPrimary text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-premium hover:shadow-lifted hover:scale-[1.02] transition-all"
                                >
                                    <FontAwesomeIcon icon={faCalendarPlus} className="text-lg" />
                                    Add to Calendar
                                </button>
                                <button 
                                    onClick={() => handleSetReminder(selectedEvent)}
                                    className="flex items-center justify-center gap-4 py-6 bg-mdSecondary text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-premium hover:shadow-lifted hover:scale-[1.02] transition-all"
                                >
                                    <FontAwesomeIcon icon={faBell} className="text-lg" />
                                    Set Reminder
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal 
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title="Cancel Gathering?"
                message="This will permanently remove the event from the assembly calendar. Proceed?"
                type="danger"
            />
        </div>
    );
}
