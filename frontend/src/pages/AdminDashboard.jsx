import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    getMembers, 
    getAnnouncements, 
    getEvents, 
    getSermons, 
    deleteMember,
    createAnnouncement,
    deleteAnnouncement,
    createEvent,
    deleteEvent,
    createSermon,
    deleteSermon,
    uploadSermon
} from '../services/api';
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
    faSignOutAlt,
    faHome
} from '@fortawesome/free-solid-svg-icons';

export default function AdminDashboard({ activeTab, setActiveTab }) {
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
    const [newSermon, setNewSermon] = useState({ title: '', description: '', speaker: '', sermonDate: '', fileType: 'mp3', mediaMode: 'none', file: null, customUrl: '' });
    const [counts, setCounts] = useState({ members: 0, events: 0, announcements: 0, sermons: 0 });
    const [selectedItem, setSelectedItem] = useState(null);
    const [modalType, setModalType] = useState(null);

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
        sessionStorage.clear();
        navigate('/login');
    };
    useEffect(() => {
        const userType = sessionStorage.getItem('userType');
        if (userType !== 'admin') {
            navigate('/login');
        }
        fetchAllData();
    }, [navigate]);

    const fetchAllData = async () => {
        setLoading(true);
        setError('');
        try {
            const [membersRes, announcementsRes, eventsRes, sermonsRes, summaryRes] = await Promise.all([
                getMembers(),
                getAnnouncements(),
                getEvents(),
                getSermons(),
                axios.get('/api/summary/counts')
            ]);
            setMembers(membersRes.data?.data || []);
            setAnnouncements(announcementsRes.data?.data || []);
            setEvents(eventsRes.data?.data || []);
            setSermons(sermonsRes.data?.data || []);
            setCounts(summaryRes.data?.data || { members: 0, events: 0, announcements: 0, sermons: 0 });
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
            setLoading(true);

            let audioUrl = '';
            let videoUrl = '';

            // Handle File Upload
            if (newSermon.mediaMode === 'upload' && newSermon.file) {
                const formData = new FormData();
                formData.append('file', newSermon.file);
                formData.append('title', newSermon.title);
                formData.append('adminId', adminId);

                const uploadRes = await uploadSermon(formData);
                if (uploadRes.data?.success && uploadRes.data?.fileUrl) {
                    if (newSermon.fileType === 'mp3') {
                        audioUrl = uploadRes.data.fileUrl;
                    } else {
                        videoUrl = uploadRes.data.fileUrl;
                    }
                } else {
                    setLoading(false);
                    setAlertDialog({ title: 'Error', message: 'Failed to upload media file: ' + (uploadRes.data?.message || ''), isError: true });
                    return;
                }
            } 
            // Handle Direct URL
            else if (newSermon.mediaMode === 'url' && newSermon.customUrl.trim() !== '') {
                if (newSermon.fileType === 'mp3') {
                    audioUrl = newSermon.customUrl.trim();
                } else {
                    videoUrl = newSermon.customUrl.trim();
                }
            }

            let sermonData = { 
                title: newSermon.title.trim(),
                description: newSermon.description.trim(),
                speaker: newSermon.speaker.trim(),
                sermonDate: newSermon.sermonDate.includes('T') ? newSermon.sermonDate : newSermon.sermonDate + 'T00:00:00',
                fileType: newSermon.fileType,
                audioUrl: audioUrl,
                videoUrl: videoUrl,
                createdBy: adminId
            };
            
            console.log('AdminId:', adminId, 'Type:', typeof adminId);
            console.log('Creating sermon with data:', sermonData);
            const response = await createSermon(sermonData);
            console.log('Sermon response:', response);
            
            if (response.data?.success || response.data?.data?.id) {
                setNewSermon({ title: '', description: '', speaker: '', sermonDate: '', fileType: 'mp3', mediaMode: 'none', file: null, customUrl: '' });
                setAlertDialog({ title: 'Success', message: 'Sermon created successfully!' });
                await fetchAllData();
            } else {
                setAlertDialog({ title: 'Error', message: 'Error creating sermon: ' + (response.data?.message || 'Unknown error'), isError: true });
            }
        } catch (error) {
            console.error('Error adding sermon:', error);
            setAlertDialog({ title: 'Error', message: 'Error creating sermon: ' + error.message, isError: true });
        } finally {
            setLoading(false);
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
            )}            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 px-4 md:px-0">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black text-mdOnSurface tracking-tighter mb-2">
                        Admin Dashboard
                    </h1>
                    <p className="text-mdOnSurfaceVariant font-medium text-lg">
                        Welcome back, <span className="text-mdPrimary font-bold">{adminName}</span>. Managing your community.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleLogout}
                        className="bg-mdSurface hover:bg-mdSurfaceVariant text-mdError px-6 py-3 rounded-full shadow-sm transition-all duration-200 font-bold border border-mdError/20 flex items-center gap-2"
                    >
                        <FontAwesomeIcon icon={faSignOutAlt} />
                        Logout
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-7xl mx-auto">
                {/* Summary Cards - Only show on Home or at the top of other tabs if preferred, but user wants them to link to tabs */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                    {[
                        { id: 'members', label: 'Members', count: counts.members, icon: faUsers, color: 'bg-mdPrimaryContainer text-mdOnPrimaryContainer' },
                        { id: 'announcements', label: 'Announcements', count: counts.announcements, icon: faBullhorn, color: 'bg-mdSecondaryContainer text-mdOnSecondaryContainer' },
                        { id: 'events', label: 'Events', count: counts.events, icon: faCalendarAlt, color: 'bg-mdPrimaryContainer/60 text-mdOnPrimaryContainer' },
                        { id: 'sermons', label: 'Sermons', count: counts.sermons, icon: faMicrophone, color: 'bg-mdSecondaryContainer/60 text-mdOnSecondaryContainer' },
                    ].map((stat) => (
                        <button
                            key={stat.id}
                            onClick={() => {
                                setActiveTab(stat.id);
                            }}
                            className={`flex flex-col items-center justify-center p-6 rounded-[2.5rem] border-2 transition-all duration-300 group shadow-sm hover:shadow-md2 hover:-translate-y-1 ${
                                activeTab === stat.id ? 'bg-white border-mdPrimary' : 'bg-white/50 border-transparent'
                            }`}
                        >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 shadow-sm ${stat.color}`}>
                                <FontAwesomeIcon icon={stat.icon} className="text-xl" />
                            </div>
                            <span className="text-4xl font-black text-mdOnSurface leading-none mb-1">{stat.count}</span>
                            <span className="text-xs font-bold uppercase tracking-widest text-mdOnSurfaceVariant">{stat.label}</span>
                        </button>
                    ))}
                </div>

                {/* Home View Placeholder / Welcome */}
                {activeTab === 'home' && !loading && (
                    <div className="bg-mdSurface rounded-[3rem] p-12 text-center border-2 border-dashed border-mdOutline/10 animate-fade-in py-20">
                         <div className="w-24 h-24 bg-mdPrimaryContainer rounded-full flex items-center justify-center text-mdPrimary text-4xl mx-auto mb-8 shadow-sm">
                            <FontAwesomeIcon icon={faUsers} />
                         </div>
                         <h2 className="text-4xl font-black text-mdOnSurface mb-4">Welcome, Admin</h2>
                         <p className="text-xl text-mdOnSurfaceVariant max-w-lg mx-auto font-medium">
                            Select a category above or use the navigation tabs to manage your church community.
                         </p>
                    </div>
                )}

                {error && (
                    <div className="bg-mdErrorContainer text-mdError px-6 py-4 rounded-3xl shadow-sm text-sm sm:text-base animate-pulse font-medium mb-6">
                        <p className="font-bold mb-1">Error</p>
                        <p>{error}</p>
                    </div>
                )}

            {/* Detail View Modal */}
            {selectedItem && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-[2.5rem] shadow-premium max-w-2xl w-full mx-auto relative overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Modal Header/Decorative */}
                        <div className={`h-32 w-full shrink-0 relative ${
                            modalType === 'event' ? 'bg-gradient-to-r from-mdPrimary to-mdPrimaryContainer' : 
                            modalType === 'announcement' ? 'bg-gradient-to-r from-mdSecondary to-mdSecondaryContainer' : 
                            'bg-gradient-to-r from-mdPrimary to-mdPrimaryContainer'
                        }`}>
                            <button 
                                onClick={() => setSelectedItem(null)}
                                className="absolute top-6 right-6 bg-white/20 hover:bg-white/40 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors z-10"
                            >
                                <span className="text-2xl">&times;</span>
                            </button>
                            <div className="absolute -bottom-10 left-10 w-20 h-20 rounded-3xl bg-white shadow-lifted flex items-center justify-center text-3xl">
                                <FontAwesomeIcon 
                                    icon={modalType === 'event' ? faCalendarAlt : modalType === 'announcement' ? faBullhorn : faMicrophone} 
                                    className={modalType === 'event' ? 'text-mdPrimary' : modalType === 'announcement' ? 'text-mdSecondary' : 'text-mdPrimary'}
                                />
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-10 pt-16 overflow-y-auto">
                            <h3 className="text-3xl font-black text-onSurface mb-4 leading-tight">
                                {selectedItem.title}
                            </h3>
                            
                            <div className="flex flex-wrap gap-4 mb-8">
                                {modalType === 'event' && selectedItem.eventDate && (
                                    <div className="flex items-center gap-2 bg-mdPrimaryContainer text-mdOnPrimaryContainer px-4 py-2 rounded-full font-bold text-sm">
                                        <FontAwesomeIcon icon={faClock} />
                                        {new Date(selectedItem.eventDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </div>
                                )}
                                {selectedItem.location && (
                                    <div className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-full font-bold text-sm">
                                        <FontAwesomeIcon icon={faMapMarkerAlt} />
                                        {selectedItem.location}
                                    </div>
                                )}
                                {selectedItem.speaker && (
                                    <div className="flex items-center gap-2 bg-mdPrimaryContainer text-mdOnPrimaryContainer px-4 py-2 rounded-full font-bold text-sm">
                                        <FontAwesomeIcon icon={faUser} />
                                        {selectedItem.speaker}
                                    </div>
                                )}
                                {selectedItem.sermonDate && (
                                    <div className="flex items-center gap-2 bg-mdPrimaryContainer text-mdOnPrimaryContainer px-4 py-2 rounded-full font-bold text-sm">
                                        <FontAwesomeIcon icon={faCalendarAlt} />
                                        {new Date(selectedItem.sermonDate).toLocaleDateString()}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                <p className="text-mdOnSurfaceVariant text-lg leading-relaxed whitespace-pre-line">
                                    {selectedItem.description || selectedItem.message}
                                </p>
                            </div>
                        </div>
                        
                        <div className="p-8 border-t border-mdSurfaceVariant bg-mdSurface shrink-0">
                            <button 
                                onClick={() => setSelectedItem(null)}
                                className="w-full bg-mdPrimary hover:bg-mdSecondary text-mdOnPrimary py-4 rounded-full font-bold shadow-premium hover:shadow-lifted transition-all"
                            >
                                Close Detail
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {loading && <div className="flex justify-center p-12"><p className="text-mdOnSurfaceVariant text-lg font-bold animate-pulse">Loading data...</p></div>}

                {/* Members Tab */}
                {activeTab === 'members' && !loading && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Summary Cards were already shown at top, so maybe just show management part */}
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
                                <FontAwesomeIcon icon={faPlus} className="mr-2" /> Export to Excel
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
                    </div>
                </div>
            )}

            {/* Announcements Tab */}
            {activeTab === 'announcements' && !loading && (
                <div className="space-y-8 animate-fade-in">
                    <div className="bg-mdSurface rounded-[2rem] shadow-sm border border-mdSurfaceVariant p-6 sm:p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="bg-mdPrimaryContainer p-4 rounded-2xl">
                                <FontAwesomeIcon icon={faBullhorn} className="text-2xl text-mdPrimary" />
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
                                <div 
                                    key={ann.id} 
                                    onClick={() => { setSelectedItem(ann); setModalType('announcement'); }}
                                    className="bg-mdSurface p-6 rounded-3xl shadow-sm border border-mdSurfaceVariant hover:shadow-md2 transition-all duration-300 cursor-pointer group"
                                >
                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-extrabold text-xl text-mdOnSurface mb-2 group-hover:text-mdPrimary transition-colors">{ann.title}</h3>
                                            <p className="text-mdOnSurfaceVariant text-base leading-relaxed line-clamp-2">{ann.message}</p>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteAnnouncement(ann.id); }}
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
                                <div 
                                    key={event.id} 
                                    onClick={() => { setSelectedItem(event); setModalType('event'); }}
                                    className="bg-mdSurface p-6 rounded-3xl shadow-sm border border-mdSurfaceVariant hover:shadow-md2 transition-all duration-300 flex flex-col cursor-pointer group"
                                >
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="font-extrabold text-xl text-mdOnSurface group-hover:text-mdSecondary transition-colors">{event.title}</h3>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteEvent(event.id); }}
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
                                <FontAwesomeIcon icon={faMicrophone} className="text-2xl text-mdPrimary" />
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
                            
                            <div className="bg-mdSurfaceVariant/30 p-6 rounded-2xl border border-mdOutline/20 space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-mdOnSurfaceVariant mb-4 ml-1">Attach Media (Optional)</label>
                                    <div className="flex flex-wrap gap-4 mb-6">
                                        <label className="flex items-center gap-2 cursor-pointer bg-mdSurface p-3 rounded-xl border border-mdOutline/30 hover:bg-mdSurfaceVariant/50 transition-colors">
                                            <input 
                                                type="radio" 
                                                name="mediaMode" 
                                                value="none" 
                                                checked={newSermon.mediaMode === 'none'}
                                                onChange={(e) => setNewSermon({ ...newSermon, mediaMode: e.target.value })}
                                                className="w-4 h-4 text-mdPrimary"
                                            />
                                            <span className="font-medium text-mdOnSurface">No Media</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer bg-mdSurface p-3 rounded-xl border border-mdOutline/30 hover:bg-mdSurfaceVariant/50 transition-colors">
                                            <input 
                                                type="radio" 
                                                name="mediaMode" 
                                                value="upload" 
                                                checked={newSermon.mediaMode === 'upload'}
                                                onChange={(e) => setNewSermon({ ...newSermon, mediaMode: e.target.value })}
                                                className="w-4 h-4 text-mdPrimary"
                                            />
                                            <span className="font-medium text-mdOnSurface">Upload File</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer bg-mdSurface p-3 rounded-xl border border-mdOutline/30 hover:bg-mdSurfaceVariant/50 transition-colors">
                                            <input 
                                                type="radio" 
                                                name="mediaMode" 
                                                value="url" 
                                                checked={newSermon.mediaMode === 'url'}
                                                onChange={(e) => setNewSermon({ ...newSermon, mediaMode: e.target.value })}
                                                className="w-4 h-4 text-mdPrimary"
                                            />
                                            <span className="font-medium text-mdOnSurface">External URL</span>
                                        </label>
                                    </div>

                                    {newSermon.mediaMode === 'upload' && (
                                        <div className="animate-fade-in">
                                            <input
                                                type="file"
                                                accept={newSermon.fileType === 'mp3' ? 'audio/mpeg,audio/mp3' : 'video/mp4'}
                                                onChange={(e) => setNewSermon({ ...newSermon, file: e.target.files[0] })}
                                                className="w-full px-5 py-4 border border-mdOutline/30 rounded-2xl bg-mdSurface focus:outline-none focus:ring-2 focus:ring-mdPrimary focus:border-transparent transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-mdPrimary/10 file:text-mdPrimary hover:file:bg-mdPrimary/20"
                                            />
                                            <p className="text-xs text-mdOnSurfaceVariant mt-2 ml-1">Maximum file size: 500MB</p>
                                        </div>
                                    )}

                                    {newSermon.mediaMode === 'url' && (
                                        <div className="animate-fade-in">
                                            <input
                                                type="url"
                                                placeholder={newSermon.fileType === 'mp3' ? "e.g. https://example.com/audio.mp3" : "e.g. https://example.com/video.mp4"}
                                                value={newSermon.customUrl}
                                                onChange={(e) => setNewSermon({ ...newSermon, customUrl: e.target.value })}
                                                className="w-full px-5 py-4 border border-mdOutline/30 rounded-2xl bg-mdSurface focus:outline-none focus:ring-2 focus:ring-mdPrimary focus:border-transparent transition-all duration-200"
                                            />
                                        </div>
                                    )}
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
                                <div 
                                    key={sermon.id} 
                                    onClick={() => { setSelectedItem(sermon); setModalType('sermon'); }}
                                    className="bg-mdSurface p-6 rounded-3xl shadow-sm border border-mdSurfaceVariant hover:shadow-md2 transition-all duration-300 flex flex-col sm:flex-row gap-6 cursor-pointer group"
                                >
                                    <div className="flex-1 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className={`px-2.5 py-1 text-xs font-bold uppercase rounded-md tracking-wider ${sermon.fileType === 'mp4' ? 'bg-mdSecondaryContainer text-mdSecondary' : 'bg-mdPrimaryContainer/50 text-mdPrimary'} flex items-center gap-1.5`}>
                                                        <FontAwesomeIcon icon={sermon.fileType === 'mp4' ? faVideo : faMicrophone} />
                                                        {sermon.fileType === 'mp4' ? 'Video' : 'Audio'}
                                                    </span>
                                                    <h3 className="font-extrabold text-xl text-mdOnSurface leading-tight group-hover:text-mdPrimary transition-colors">{sermon.title}</h3>
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
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteSermon(sermon.id); }}
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

