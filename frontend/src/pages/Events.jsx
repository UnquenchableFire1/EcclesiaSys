import { getEvents, deleteEvent } from '../services/api';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
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

export default function Events({ embedded = false, branchId = null }) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        onConfirm: () => {}
    });
    
    // Use session storage for consistent auth checks
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
        <div className={`animate-fade-in ${embedded ? '' : 'max-w-7xl mx-auto px-4 py-6'}`}>
            {!embedded && (
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-mdOnSurface tracking-tighter mb-2 italic">Sanctuary Calendar</h1>
                        <p className="text-mdSecondary font-black text-lg uppercase tracking-widest bg-mdSecondary/5 px-4 py-1 rounded-full w-max border border-mdSecondary/20 shadow-sm">
                            Upcoming Fellowships
                        </p>
                    </div>
                </div>
            )}

            {/* Search and Filters */}
            <div className={`glass-card p-6 mb-10 flex flex-col md:flex-row gap-4 items-center ${embedded ? 'mt-4' : ''} rounded-[2rem]`}>
                <div className="relative flex-1 w-full">
                    <FontAwesomeIcon icon={faSearch} className="absolute left-6 top-1/2 -translate-y-1/2 text-mdOutline opacity-50" />
                    <input
                        type="text"
                        placeholder="Search events by name or location..."
                        className="w-full pl-14 pr-6 py-4 bg-mdSurfaceVariant/30 border-none rounded-2xl focus:ring-2 focus:ring-mdSecondary transition-all font-medium text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 text-mdOnSurfaceVariant font-black text-[10px] uppercase tracking-widest px-4">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-mdSecondary" />
                    <span>{filteredEvents.length} Gatherings</span>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(n => (
                        <div key={n} className="glass-card h-80 animate-pulse rounded-[2rem]"></div>
                    ))}
                </div>
            ) : filteredEvents.length === 0 ? (
                <div className="glass-card p-20 text-center rounded-[3rem]">
                    <div className="w-24 h-24 bg-mdSurfaceVariant/30 rounded-full flex items-center justify-center mx-auto mb-8 opacity-40">
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-4xl" />
                    </div>
                    <p className="text-2xl font-black text-mdOnSurface mb-2">The Calendar is Clear</p>
                    <p className="text-mdOnSurfaceVariant font-medium">No gatherings scheduled yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredEvents.map((event) => (
                        <div key={event.id} className="glass-card group overflow-hidden flex flex-col hover:border-mdSecondary/30 transition-all duration-500 rounded-[2.5rem] shadow-premium bg-white">
                            {/* Visual Header */}
                            <div className="h-3 relative bg-mdPrimary"></div>
                            
                            <div className="p-8 flex-1">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col items-center justify-center w-16 h-16 rounded-[1.25rem] bg-mdPrimary text-white shadow-lifted">
                                            <span className="text-xl font-black leading-none">
                                                {event.eventDate ? new Date(event.eventDate).getDate() : '??'}
                                            </span>
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-80">
                                                {event.eventDate ? new Date(event.eventDate).toLocaleDateString([], { month: 'short' }) : '---'}
                                            </span>
                                        </div>
                                        <div className="flex flex-col">
                                            <h3 className="text-xl font-black text-mdOnSurface group-hover:text-mdPrimary transition-colors line-clamp-1 leading-tight tracking-tight">
                                                {event.title}
                                            </h3>
                                            <div className="flex items-center gap-2 text-[10px] font-black text-mdSecondary uppercase tracking-widest mt-1">
                                                <FontAwesomeIcon icon={faClock} className="opacity-70" />
                                                {event.eventDate ? new Date(event.eventDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'All Day'}
                                            </div>
                                        </div>
                                    </div>
                                    {isAdmin && (
                                        <button 
                                            onClick={(e) => handleDelete(event.id, e)}
                                            className="w-11 h-11 rounded-xl bg-mdError/5 text-mdError hover:bg-mdError hover:text-white transition-all flex items-center justify-center shadow-sm"
                                            title="Remove Event from Sanctuary"
                                        >
                                            <FontAwesomeIcon icon={faTrashAlt} />
                                        </button>
                                    )}
                                </div>

                                <p className="text-sm text-mdOnSurfaceVariant font-medium leading-relaxed mb-6 line-clamp-3">
                                    {event.description}
                                </p>

                                <div className="pt-6 border-t border-mdOutline/5">
                                    <div className="flex items-center gap-3 text-xs font-black text-mdOnSurface uppercase tracking-widest">
                                        <div className="w-10 h-10 rounded-xl bg-mdSecondary/10 flex items-center justify-center text-mdSecondary shadow-inner">
                                            <FontAwesomeIcon icon={faMapMarkerAlt} />
                                        </div>
                                        <span className="truncate">{event.location || 'Church Main Hall'}</span>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={() => setSelectedEvent(event)}
                                className="w-full py-5 bg-mdSurfaceVariant/30 hover:bg-mdPrimary hover:text-white border-t border-mdOutline/5 transition-all font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 group/btn"
                            >
                                Prayer & Gathering Info
                                <FontAwesomeIcon icon={faArrowRight} className="text-[8px] group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Event Details Modal */}
            {selectedEvent && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={() => setSelectedEvent(null)}></div>
                    <div className="glass-card relative z-10 w-full max-w-3xl bg-white overflow-hidden shadow-premium animate-slide-up border-none rounded-[3rem]">
                        <div className="h-2 bg-mdPrimary"></div>
                        
                        <div className="p-10">
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <span className="px-5 py-2 rounded-full bg-mdPrimary/5 text-mdPrimary text-[10px] font-black uppercase tracking-[0.2em] mb-4 inline-block border border-mdPrimary/10">
                                        Gathering Details
                                    </span>
                                    <h2 className="text-4xl font-black text-mdOnSurface tracking-tighter leading-tight mt-2">
                                        {selectedEvent.title}
                                    </h2>
                                </div>
                                <button onClick={() => setSelectedEvent(null)} className="w-12 h-12 rounded-2xl bg-mdSurfaceVariant/30 flex items-center justify-center text-mdOnSurface hover:bg-mdError hover:text-white transition-all shadow-sm">
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-mdPrimary/5 flex items-center justify-center text-mdPrimary text-xl shadow-inner">
                                            <FontAwesomeIcon icon={faCalendarAlt} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-black tracking-widest text-mdOutline opacity-60 mb-0.5">Date & Time</p>
                                            <p className="font-black text-lg text-mdOnSurface">
                                                {selectedEvent.eventDate ? new Date(selectedEvent.eventDate).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : '---'}
                                                <br/>
                                                <span className="text-mdSecondary">
                                                    {selectedEvent.eventDate ? new Date(selectedEvent.eventDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'All Day'}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-mdSecondary/5 flex items-center justify-center text-mdSecondary text-xl shadow-inner">
                                            <FontAwesomeIcon icon={faMapMarkerAlt} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-black tracking-widest text-mdOutline opacity-60 mb-0.5">Location</p>
                                            <p className="font-black text-lg text-mdOnSurface">{selectedEvent.location || 'Church Main Hall'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-mdSurfaceVariant/10 p-8 rounded-[2rem] border border-mdOutline/5 shadow-inner">
                                    <p className="text-mdOnSurfaceVariant font-medium leading-relaxed whitespace-pre-wrap text-sm italic">
                                        "{selectedEvent.description}"
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button 
                                    onClick={() => handleAddToCalendar(selectedEvent)}
                                    className="flex items-center justify-center gap-3 py-5 bg-mdPrimary text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-premium hover:scale-[1.03] transition-all"
                                >
                                    <FontAwesomeIcon icon={faCalendarPlus} className="text-lg" />
                                    Add to Calendar
                                </button>
                                <button 
                                    onClick={() => handleSetReminder(selectedEvent)}
                                    className="flex items-center justify-center gap-3 py-5 bg-mdSecondary text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-premium hover:scale-[1.03] transition-all"
                                >
                                    <FontAwesomeIcon icon={faBell} className="text-lg" />
                                    Set Reminder
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Deletion Confirmation Modal */}
            <ConfirmModal 
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title="Cancel Gathering?"
                message="This will permanently remove the event from the sanctuary calendar. Proceed?"
                type="danger"
            />
        </div>
    );
}
