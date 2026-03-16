import { downloadMembersAsExcel } from '../services/excelExport';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faUsers, 
    faBullhorn, 
    faCalendarAlt, 
    faMicrophone, 
    faFileExcel, 
    faTrash, 
    faPhone, 
    faEnvelope,
    faMapMarkerAlt,
    faVideo,
    faPlus,
    faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState(() => localStorage.getItem('adminActiveTab') || 'members');
    const [members, setMembers] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [events, setEvents] = useState([]);
    const [sermons, setSermons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [adminId] = useState(parseInt(localStorage.getItem('userId')));
    const [adminName] = useState(localStorage.getItem('userName'));
    const navigate = useNavigate();

    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState(null);
    const [alertDialog, setAlertDialog] = useState(null);
    const [newAnnouncement, setNewAnnouncement] = useState({ title: '', message: '', file: null });
    const [newEvent, setNewEvent] = useState({ title: '', description: '', eventDate: '', location: '', documentFile: null });
    const [newSermon, setNewSermon] = useState({ title: '', description: '', speaker: '', sermonDate: '', file: null, fileType: 'mp3' });

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < 768;

    const handleLogout = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        localStorage.clear();
        navigate('/login');
    };
    useEffect(() => {
        const userType = localStorage.getItem('userType');
        if (userType !== 'admin') {
            navigate('/login');
        }
        fetchAllData();
    }, [navigate]);

    const fetchAllData = async () => {
        setLoading(true);
        setError('');
        try {
            const [membersRes, announcementsRes, eventsRes, sermonsRes] = await Promise.all([
                getMembers(),
                getAnnouncements(),
                getEvents(),
                getSermons()
            ]);
            setMembers(membersRes.data?.data || []);
            setAnnouncements(announcementsRes.data?.data || []);
            setEvents(eventsRes.data?.data || []);
            setSermons(sermonsRes.data?.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to load data: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    // Member Management
    const handleDeleteMember = async (id) => {
        setConfirmDialog({
            title: 'Delete Member',
            message: 'Are you sure you want to delete this member?',
            onConfirm: async () => {
                try {
                    await deleteMember(id);
                    setMembers(members.filter(m => m.id !== id));
                } catch (error) {
                    console.error('Error deleting member:', error);
                }
            }
        });
    };

    // Announcement Management
    const handleAddAnnouncement = async () => {
        try {
            let announcementData = { ...newAnnouncement, createdBy: adminId };
            
            await createAnnouncement(announcementData);
            setNewAnnouncement({ title: '', message: '' });
            await fetchAllData();
        } catch (error) {
            console.error('Error adding announcement:', error);
            setAlertDialog({ title: 'Error', message: 'Error creating announcement: ' + error.message, isError: true });
        }
    };

    const handleDeleteAnnouncement = async (id) => {
        setConfirmDialog({
            title: 'Delete Announcement',
            message: 'Are you sure you want to delete this announcement?',
            onConfirm: async () => {
                try {
                    await deleteAnnouncement(id);
                    await fetchAllData();
                } catch (error) {
                    console.error('Error deleting announcement:', error);
                }
            }
        });
    };

    // Event Management
    const handleAddEvent = async () => {
        try {
            let eventData = { ...newEvent, createdBy: adminId, documentUrl: null };
            
            await createEvent(eventData);
            setNewEvent({ title: '', description: '', eventDate: '', location: '' });
            await fetchAllData();
        } catch (error) {
            console.error('Error adding event:', error);
            setAlertDialog({ title: 'Error', message: 'Error creating event: ' + error.message, isError: true });
        }
    };

    const handleDeleteEvent = async (id) => {
        setConfirmDialog({
            title: 'Delete Event',
            message: 'Are you sure you want to delete this event?',
            onConfirm: async () => {
                try {
                    await deleteEvent(id);
                    await fetchAllData();
                } catch (error) {
                    console.error('Error deleting event:', error);
                }
            }
        });
    };

    // Sermon Management
    const handleAddSermon = async () => {
        // Validate required fields
        if (!newSermon.title.trim() || !newSermon.speaker.trim() || !newSermon.sermonDate.trim()) {
            setAlertDialog({ title: 'Missing Info', message: 'Please fill in Title, Speaker, and Date fields', isError: true });
            return;
        }

        // Validate adminId is valid
        if (!adminId || adminId === 0 || isNaN(adminId)) {
            setAlertDialog({ title: 'Error', message: 'Error: Admin ID not found. Please log in again.', isError: true });
            console.error('Invalid adminId:', adminId, 'Type:', typeof adminId);
            return;
        }

        try {
            let sermonData = { 
                title: newSermon.title.trim(),
                description: newSermon.description.trim(),
                speaker: newSermon.speaker.trim(),
                sermonDate: newSermon.sermonDate.includes('T') ? newSermon.sermonDate : newSermon.sermonDate + 'T00:00:00',
                fileType: newSermon.fileType,
                createdBy: adminId
            };
            
            console.log('AdminId:', adminId, 'Type:', typeof adminId);
            console.log('Creating sermon with data:', sermonData);
            const response = await createSermon(sermonData);
            console.log('Sermon response:', response);
            
            if (response.data?.success || response.data?.data?.id) {
                setNewSermon({ title: '', description: '', speaker: '', sermonDate: '', fileType: 'mp3' });
                setAlertDialog({ title: 'Success', message: 'Sermon created successfully!' });
                await fetchAllData();
            } else {
                setAlertDialog({ title: 'Error', message: 'Error creating sermon: ' + (response.data?.message || 'Unknown error'), isError: true });
            }
        } catch (error) {
            console.error('Error adding sermon:', error);
            setAlertDialog({ title: 'Error', message: 'Error creating sermon: ' + error.message, isError: true });
        }
    };

    const handleDeleteSermon = async (id) => {
        setConfirmDialog({
            title: 'Delete Sermon',
            message: 'Are you sure you want to delete this sermon?',
            onConfirm: async () => {
                try {
                    await deleteSermon(id);
                    await fetchAllData();
                } catch (error) {
                    console.error('Error deleting sermon:', error);
                }
            }
        });
    };

    const TabButton = ({ tab, label, icon }) => (
        <button
            onClick={() => {
                setActiveTab(tab);
                localStorage.setItem('adminActiveTab', tab);
                setMobileMenuOpen(false);
            }}
            className={`px-4 py-3 sm:px-6 sm:py-4 text-sm sm:text-base font-bold transition-all duration-300 whitespace-nowrap rounded-t-2xl ${
                activeTab === tab
                    ? 'bg-mdSurface text-mdSecondary border-b-4 border-mdSecondary'
                    : 'text-mdOnSecondary hover:bg-white/10'
            }`}
        >
            <span className="hidden sm:inline mr-2">{icon}</span>
            {label}
        </button>
    );

    return (
        <div className="min-h-[80vh] bg-mdSurface outline-none animate-fade-in relative z-10 transition-colors duration-300 py-4">
            {/* Custom Dialogs */}
            
            {/* Confirm Dialog */}
            {confirmDialog && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-mdSurface rounded-3xl shadow-md3 p-8 max-w-sm w-full mx-auto animate-fade-in relative">
                        <div className="absolute top-4 right-4 text-4xl leading-none text-mdError opacity-20 hover:opacity-100 cursor-pointer transition-opacity" onClick={() => setConfirmDialog(null)}>×</div>
                        <h3 className="text-2xl font-bold text-mdOnSurface mb-4">{confirmDialog.title}</h3>
                        <p className="text-mdOnSurfaceVariant mb-8 text-lg">{confirmDialog.message}</p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setConfirmDialog(null)}
                                className="flex-1 bg-mdSurfaceVariant hover:bg-mdOutline/20 text-mdOnSurfaceVariant font-bold py-3 rounded-full transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (confirmDialog.onConfirm) confirmDialog.onConfirm();
                                    setConfirmDialog(null);
                                }}
                                className="flex-1 bg-mdError hover:bg-red-700 text-mdOnError font-bold py-3 rounded-full shadow-md1 transition-all duration-200"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Alert Dialog */}
            {alertDialog && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-mdSurface rounded-3xl shadow-md3 p-8 max-w-sm w-full mx-auto animate-fade-in text-center relative">
                        <div className={`mx-auto flex items-center justify-center p-4 rounded-full mb-4 w-16 h-16 ${alertDialog.isError ? 'bg-mdError/20 text-mdError' : 'bg-mdPrimaryContainer text-mdPrimary'}`}>
                            {alertDialog.isError ? (
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            ) : (
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                            )}
                        </div>
                        <h3 className="text-2xl font-bold text-mdOnSurface mb-2">{alertDialog.title}</h3>
                        <p className="text-mdOnSurfaceVariant mb-8 text-base">{alertDialog.message}</p>
                        <button
                            onClick={() => setAlertDialog(null)}
                            className="w-full bg-mdSurfaceVariant hover:bg-mdOutline/20 text-mdOnSurface font-bold py-3 rounded-full transition-colors duration-200"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            )}

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-mdSurface rounded-3xl shadow-md3 p-8 max-w-sm w-full mx-auto">
                        <h3 className="text-2xl font-bold text-mdOnSurface mb-4">Confirm Logout</h3>
                        <p className="text-mdOnSurfaceVariant mb-8 text-lg">Are you sure you want to logout?</p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="flex-1 bg-mdSurfaceVariant hover:bg-mdOutline/20 text-mdOnSurfaceVariant font-bold py-3 rounded-full transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmLogout}
                                className="flex-1 bg-mdError hover:bg-red-700 text-mdOnError font-bold py-3 rounded-full shadow-md1 transition-all duration-200"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Navigation Bar */}
            <div className="bg-mdSecondary text-mdOnSecondary rounded-3xl shadow-md2 mx-4 md:mx-6 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    {/* Top row with title, menu button, and logout */}
                    <div className="flex justify-between items-center py-4 gap-4">
                        <h1 className="text-xl md:text-2xl font-extrabold flex-1 tracking-tight">
                            Admin Dashboard
                        </h1>
                        
                        {/* Hamburger Menu Button - Mobile Only */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full transition-colors"
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? '✕' : '☰'}
                        </button>

                        <button
                            onClick={handleLogout}
                            className="bg-mdSurface hover:bg-mdSurfaceVariant text-mdSecondary px-4 py-2 sm:px-6 sm:py-2 text-sm md:text-base rounded-full shadow-md1 transition-all duration-200 font-bold flex-shrink-0"
                        >
                            {isMobile ? 'Logout' : `Logout (${adminName})`}
                        </button>
                    </div>

                    {/* Tabs row */}
                    <div className={`${mobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row gap-2 pb-2 md:pb-0 pt-2`}>
                        <TabButton tab="members" label="Members" icon={<FontAwesomeIcon icon={faUsers} />} />
                        <TabButton tab="announcements" label="Announcements" icon={<FontAwesomeIcon icon={faBullhorn} />} />
                        <TabButton tab="events" label="Events" icon={<FontAwesomeIcon icon={faCalendarAlt} />} />
                        <TabButton tab="sermons" label="Sermons" icon={<FontAwesomeIcon icon={faMicrophone} />} />
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {error && (
                    <div className="bg-mdErrorContainer text-mdError px-6 py-4 rounded-3xl shadow-sm text-sm sm:text-base animate-pulse font-medium mb-6">
                        <p className="font-bold mb-1">Error</p>
                        <p>{error}</p>
                    </div>
                )}

            {/* Loading State */}
            {loading && <div className="flex justify-center p-12"><p className="text-mdOnSurfaceVariant text-lg font-bold animate-pulse">Loading data...</p></div>}

            {/* Members Tab */}
            {activeTab === 'members' && !loading && (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="bg-mdSecondaryContainer/50 p-4 rounded-2xl">
                                <FontAwesomeIcon icon={faUsers} className="text-2xl text-mdSecondary" />
                            </div>
                            <h2 className="text-3xl font-extrabold text-mdSecondary tracking-tight">Members</h2>
                        </div>
                        <button
                            onClick={() => downloadMembersAsExcel(members)}
                            className="bg-mdPrimary text-mdOnPrimary hover:bg-mdSecondary px-6 py-3 rounded-full font-bold shadow-md1 hover:shadow-md2 transition-all duration-300 text-sm sm:text-base whitespace-nowrap"
                        >
                            📥 Export to Excel
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {members.map((member) => {
                            const firstName = member.firstName || member.name?.split(' ')[0] || 'Unknown';
                            const lastName = member.lastName || member.name?.split(' ').slice(1).join(' ') || '';
                            const initial = firstName.charAt(0).toUpperCase();

                            return (
                                <div key={member.id} className="bg-mdSurface p-6 rounded-[2rem] border border-mdSurfaceVariant shadow-sm hover:shadow-md2 transition-all duration-300 flex flex-col items-center text-center group relative overflow-hidden">
                                    <button
                                        onClick={() => handleDeleteMember(member.id)}
                                        className="absolute top-4 right-4 bg-mdError/10 text-mdError hover:bg-mdError hover:text-mdOnError w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 md:opacity-0 md:group-hover:opacity-100 shadow-sm z-10"
                                        title="Delete Member"
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                    
                                    <div className="w-28 h-28 mb-4 rounded-full bg-mdSurfaceVariant overflow-hidden border-4 border-mdSurface shadow-md relative group-hover:scale-105 transition-transform duration-300">
                                        {member.profilePictureUrl ? (
                                            <img src={member.profilePictureUrl} alt={`${firstName} ${lastName}`} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-4xl font-black text-mdPrimary bg-mdPrimaryContainer">
                                                {initial}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <h3 className="text-xl font-extrabold text-mdOnSurface mb-1">
                                        {firstName} {lastName}
                                    </h3>
                                    <p className="text-mdOnSurfaceVariant font-bold text-[10px] uppercase tracking-wider mb-5">
                                        Joined {member.joinedDate ? new Date(member.joinedDate).toLocaleDateString() : (member.createdAt ? new Date(member.createdAt).toLocaleDateString() : 'Unknown')}
                                    </p>
                                    
                                    <div className="w-full space-y-2 text-left bg-mdSurfaceVariant/30 p-4 rounded-2xl flex-grow flex flex-col justify-center">
                                        <div className="flex items-center gap-3 p-2 hover:bg-mdSurface hover:shadow-sm rounded-xl transition-all">
                                            <div className="bg-mdSecondaryContainer/50 p-2 rounded-lg text-mdSecondary text-sm">
                                                <FontAwesomeIcon icon={faPhone} />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-[10px] font-bold text-mdOnSurfaceVariant uppercase tracking-wider">Phone</p>
                                                <p className="text-sm font-bold text-mdOnSurface truncate">{member.phoneNumber || 'Not provided'}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-3 p-2 hover:bg-mdSurface hover:shadow-sm rounded-xl transition-all">
                                            <div className="bg-mdPrimaryContainer/50 p-2 rounded-lg text-mdPrimary text-sm">
                                                <FontAwesomeIcon icon={faEnvelope} />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-[10px] font-bold text-mdOnSurfaceVariant uppercase tracking-wider">System Email</p>
                                                <p className="text-sm font-bold text-mdOnSurface truncate" title={member.email || ''}>{member.email || 'Not provided'}</p>
                                            </div>
                                        </div>

                                        {(member.actualEmail && member.actualEmail !== member.email) && (
                                            <div className="flex items-center gap-3 p-2 hover:bg-mdSurface hover:shadow-sm rounded-xl transition-all mt-auto">
                                                <div className="bg-mdSecondaryContainer/50 p-2 rounded-lg text-mdSecondary text-sm">
                                                    <FontAwesomeIcon icon={faEnvelope} />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="text-[10px] font-bold text-mdOnSurfaceVariant uppercase tracking-wider">Personal Email</p>
                                                    <p className="text-sm font-bold text-mdOnSurface truncate" title={member.actualEmail}>{member.actualEmail}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        
                        {members.length === 0 && (
                            <div className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 text-center py-20 bg-mdSurfaceVariant/30 rounded-[2rem] border border-mdOutline/20">
                                <span className="text-5xl mb-4 block animate-bounce"></span>
                                <h3 className="text-xl font-bold text-mdOnSurface mb-2">No members found</h3>
                                <p className="text-mdOnSurfaceVariant">There are currently no registered members.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Announcements Tab */}
            {activeTab === 'announcements' && !loading && (
                <div className="space-y-8 animate-fade-in">
                    <div className="bg-mdSurface rounded-[2rem] shadow-sm border border-mdSurfaceVariant p-6 sm:p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="bg-mdPrimaryContainer p-4 rounded-2xl">
                                <span className="text-2xl"></span>
                            </div>
                            <h2 className="text-2xl font-extrabold text-mdPrimary tracking-tight">Create Announcement</h2>
                        </div>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-mdOnSurfaceVariant mb-2 ml-1">Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Sunday Service Time Change"
                                    value={newAnnouncement.title}
                                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                                    className="w-full px-5 py-4 border border-mdOutline/30 rounded-2xl bg-mdSurface focus:outline-none focus:ring-2 focus:ring-mdPrimary focus:border-transparent transition-all duration-200"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-mdOnSurfaceVariant mb-2 ml-1">Message</label>
                                <textarea
                                    placeholder="Enter the details of the announcement..."
                                    value={newAnnouncement.message}
                                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
                                    className="w-full px-5 py-4 border border-mdOutline/30 rounded-2xl bg-mdSurface focus:outline-none focus:ring-2 focus:ring-mdPrimary focus:border-transparent transition-all duration-200 min-h-[160px]"
                                />
                            </div>

                            <button
                                onClick={handleAddAnnouncement}
                                className="w-full sm:w-auto bg-mdPrimary hover:bg-mdSecondary text-mdOnPrimary font-bold py-4 px-8 rounded-full shadow-md1 hover:shadow-md2 transition-all duration-300 transform hover:-translate-y-0.5"
                            >
                                Post Announcement
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6 pt-4">
                        <h2 className="text-2xl font-extrabold text-mdOnSurface tracking-tight">Manage Announcements</h2>
                        <div className="grid gap-6">
                            {announcements.map(ann => (
                                <div key={ann.id} className="bg-mdSurface p-6 rounded-3xl shadow-sm border border-mdSurfaceVariant hover:shadow-md2 transition-all duration-300">
                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-extrabold text-xl text-mdOnSurface mb-2">{ann.title}</h3>
                                            <p className="text-mdOnSurfaceVariant text-base leading-relaxed whitespace-pre-line">{ann.message}</p>
                                            

                                        </div>
                                        <button
                                            onClick={() => handleDeleteAnnouncement(ann.id)}
                                            className="bg-mdError/10 text-mdError hover:bg-mdError hover:text-mdOnError px-4 py-2 text-sm rounded-full transition-colors font-bold flex-shrink-0"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {announcements.length === 0 && (
                                <p className="text-mdOnSurfaceVariant py-8 text-center text-lg font-medium">No announcements posted yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Events Tab */}
            {activeTab === 'events' && !loading && (
                <div className="space-y-8 animate-fade-in">
                    <div className="bg-mdSurface rounded-[2rem] shadow-sm border border-mdSurfaceVariant p-6 sm:p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="bg-mdSecondaryContainer p-4 rounded-2xl">
                                <FontAwesomeIcon icon={faCalendarAlt} className="text-2xl text-mdSecondary" />
                            </div>
                            <h2 className="text-2xl font-extrabold text-mdSecondary tracking-tight">Create Event</h2>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-mdOnSurfaceVariant mb-2 ml-1">Event Title</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Youth Camp 2026"
                                        value={newEvent.title}
                                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                        className="w-full px-5 py-4 border border-mdOutline/30 rounded-2xl bg-mdSurface focus:outline-none focus:ring-2 focus:ring-mdSecondary focus:border-transparent transition-all duration-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-mdOnSurfaceVariant mb-2 ml-1">Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        value={newEvent.eventDate}
                                        onChange={(e) => setNewEvent({ ...newEvent, eventDate: e.target.value })}
                                        className="w-full px-5 py-4 border border-mdOutline/30 rounded-2xl bg-mdSurface focus:outline-none focus:ring-2 focus:ring-mdSecondary focus:border-transparent transition-all duration-200"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-mdOnSurfaceVariant mb-2 ml-1">Event Description</label>
                                <textarea
                                    placeholder="Details about the event..."
                                    value={newEvent.description}
                                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                    className="w-full px-5 py-4 border border-mdOutline/30 rounded-2xl bg-mdSurface focus:outline-none focus:ring-2 focus:ring-mdSecondary focus:border-transparent transition-all duration-200 min-h-[120px]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-mdOnSurfaceVariant mb-2 ml-1">Location</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Main Auditorium"
                                    value={newEvent.location}
                                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                                    className="w-full px-5 py-4 border border-mdOutline/30 rounded-2xl bg-mdSurface focus:outline-none focus:ring-2 focus:ring-mdSecondary focus:border-transparent transition-all duration-200"
                                />
                            </div>
                            

                            
                            <button
                                onClick={handleAddEvent}
                                className="w-full sm:w-auto bg-mdSecondary hover:bg-mdPrimary text-mdOnSecondary font-bold py-4 px-8 rounded-full shadow-md1 hover:shadow-md2 transition-all duration-300 transform hover:-translate-y-0.5"
                            >
                                Publish Event
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6 pt-4">
                        <h2 className="text-2xl font-extrabold text-mdOnSurface tracking-tight">Manage Events</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            {events.map(event => (
                                <div key={event.id} className="bg-mdSurface p-6 rounded-3xl shadow-sm border border-mdSurfaceVariant hover:shadow-md2 transition-all duration-300 flex flex-col">
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="font-extrabold text-xl text-mdOnSurface">{event.title}</h3>
                                            <button
                                                onClick={() => handleDeleteEvent(event.id)}
                                                className="bg-mdError/10 text-mdError hover:bg-mdError hover:text-mdOnError px-3 py-1.5 text-xs rounded-full transition-colors font-bold ml-4 shrink-0"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                        
                                        <div className="space-y-3 mb-6">
                                            {event.eventDate && (
                                                <div className="inline-flex items-center gap-2 bg-mdSecondaryContainer/50 text-mdSecondary px-3 py-1.5 rounded-lg font-bold text-sm">
                                                    <FontAwesomeIcon icon={faCalendarAlt} />
                                                    {new Date(event.eventDate).toLocaleString(undefined, {
                                                        weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </div>
                                            )}
                                            
                                            {event.location && (
                                                <p className="flex items-start gap-2 text-mdOnSurfaceVariant text-sm font-medium">
                                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="mt-0.5" />
                                                    {event.location}
                                                </p>
                                            )}
                                        </div>
                                        
                                        <p className="text-mdOnSurfaceVariant text-sm leading-relaxed whitespace-pre-line border-t border-mdSurfaceVariant/50 pt-4">
                                            {event.description}
                                        </p>
                                    </div>
                                    

                                </div>
                            ))}
                            {events.length === 0 && (
                                <p className="text-mdOnSurfaceVariant py-8 col-span-full text-center text-lg font-medium">No events scheduled.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Sermons Tab */}
            {activeTab === 'sermons' && !loading && (
                <div className="space-y-8 animate-fade-in">
                    <div className="bg-mdSurface rounded-[2rem] shadow-sm border border-mdSurfaceVariant p-6 sm:p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="bg-mdPrimaryContainer p-4 rounded-2xl">
                                <span className="text-2xl"></span>
                            </div>
                            <h2 className="text-2xl font-extrabold text-mdPrimary tracking-tight">Upload Sermon</h2>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-mdOnSurfaceVariant mb-2 ml-1">Title</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Faith that Moves Mountains"
                                        value={newSermon.title}
                                        onChange={(e) => setNewSermon({ ...newSermon, title: e.target.value })}
                                        className="w-full px-5 py-4 border border-mdOutline/30 rounded-2xl bg-mdSurface focus:outline-none focus:ring-2 focus:ring-mdPrimary focus:border-transparent transition-all duration-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-mdOnSurfaceVariant mb-2 ml-1">Speaker</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Pastor John Doe"
                                        value={newSermon.speaker}
                                        onChange={(e) => setNewSermon({ ...newSermon, speaker: e.target.value })}
                                        className="w-full px-5 py-4 border border-mdOutline/30 rounded-2xl bg-mdSurface focus:outline-none focus:ring-2 focus:ring-mdPrimary focus:border-transparent transition-all duration-200"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-mdOnSurfaceVariant mb-2 ml-1">Description (Optional)</label>
                                <textarea
                                    placeholder="Brief summary of the sermon..."
                                    value={newSermon.description}
                                    onChange={(e) => setNewSermon({ ...newSermon, description: e.target.value })}
                                    className="w-full px-5 py-4 border border-mdOutline/30 rounded-2xl bg-mdSurface focus:outline-none focus:ring-2 focus:ring-mdPrimary focus:border-transparent transition-all duration-200 min-h-[100px]"
                                />
                            </div>

                            <div className="grid sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-mdOnSurfaceVariant mb-2 ml-1">Date Preached</label>
                                    <input
                                        type="date"
                                        value={newSermon.sermonDate}
                                        onChange={(e) => setNewSermon({ ...newSermon, sermonDate: e.target.value })}
                                        className="w-full px-5 py-4 border border-mdOutline/30 rounded-2xl bg-mdSurface focus:outline-none focus:ring-2 focus:ring-mdPrimary focus:border-transparent transition-all duration-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-mdOnSurfaceVariant mb-2 ml-1">Media Type</label>
                                    <select
                                        value={newSermon.fileType}
                                        onChange={(e) => setNewSermon({ ...newSermon, fileType: e.target.value })}
                                        className="w-full px-5 py-4 border border-mdOutline/30 rounded-2xl bg-mdSurface focus:outline-none focus:ring-2 focus:ring-mdPrimary focus:border-transparent transition-all duration-200 appearance-none"
                                    >
                                        <option value="mp3" className="text-mdOnSurface">Audio (MP3)</option>
                                        <option value="mp4" className="text-mdOnSurface">Video (MP4)</option>
                                    </select>
                                </div>
                            </div>
                            

                            
                            <button
                                onClick={handleAddSermon}
                                className="w-full sm:w-auto bg-mdPrimary hover:bg-mdSecondary text-mdOnPrimary font-bold py-4 px-8 rounded-full shadow-md1 hover:shadow-md2 transition-all duration-300 transform hover:-translate-y-0.5"
                            >
                                Publish Sermon
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6 pt-4">
                        <h2 className="text-2xl font-extrabold text-mdOnSurface tracking-tight">Manage Sermons</h2>
                        <div className="grid lg:grid-cols-2 gap-6">
                            {sermons.map(sermon => (
                                <div key={sermon.id} className="bg-mdSurface p-6 rounded-3xl shadow-sm border border-mdSurfaceVariant hover:shadow-md2 transition-all duration-300 flex flex-col sm:flex-row gap-6">
                                    <div className="flex-1 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className={`px-2.5 py-1 text-xs font-bold uppercase rounded-md tracking-wider ${sermon.fileType === 'mp4' ? 'bg-mdSecondaryContainer text-mdSecondary' : 'bg-mdPrimaryContainer/50 text-mdPrimary'} flex items-center gap-1.5`}>
                                                        <FontAwesomeIcon icon={sermon.fileType === 'mp4' ? faVideo : faMicrophone} />
                                                        {sermon.fileType === 'mp4' ? 'Video' : 'Audio'}
                                                    </span>
                                                    <h3 className="font-extrabold text-xl text-mdOnSurface leading-tight">{sermon.title}</h3>
                                                </div>
                                                <p className="text-mdOnSurfaceVariant font-medium text-sm">by {sermon.speaker}</p>
                                            </div>
                                        </div>
                                        
                                        {sermon.description && (
                                            <p className="text-mdOnSurfaceVariant text-sm leading-relaxed line-clamp-2">{sermon.description}</p>
                                        )}
                                        
                                        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-mdSurfaceVariant/50">
                                            <p className="text-mdOnSurfaceVariant text-xs font-semibold">
                                                Added {new Date(sermon.createdAt || sermon.sermonDate).toLocaleDateString()}
                                            </p>
                                            
                                            <div className="flex gap-2 ml-auto">
                                                {sermon.audioUrl && (
                                                    <a 
                                                        href={sermon.audioUrl} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="px-3 py-1.5 bg-mdPrimaryContainer/30 text-mdPrimary rounded-full text-xs font-bold hover:bg-mdPrimary hover:text-mdOnPrimary transition-colors"
                                                    >
                                                        Listen
                                                    </a>
                                                )}
                                                {sermon.videoUrl && (
                                                    <a 
                                                        href={sermon.videoUrl} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="px-3 py-1.5 bg-mdSecondaryContainer/30 text-mdSecondary rounded-full text-xs font-bold hover:bg-mdSecondary hover:text-mdOnSecondary transition-colors"
                                                    >
                                                        Watch
                                                    </a>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteSermon(sermon.id)}
                                                    className="bg-mdError/10 text-mdError hover:bg-mdError hover:text-mdOnError px-3 py-1.5 text-xs rounded-full transition-colors font-bold ml-2"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {sermons.length === 0 && (
                                <p className="text-mdOnSurfaceVariant py-8 col-span-full text-center text-lg font-medium">No sermons uploaded yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
}

