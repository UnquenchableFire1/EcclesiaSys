import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
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
    uploadSermon,
    getPrayerRequests,
    updatePrayerRequestStatus,
    deletePrayerRequest,
    getAdmins,
    promoteMemberToAdmin,
    createAdmin,
    getNotifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead,
    changePassword,
    getAdminProfile,
    default as api
} from '../services/api';
import ChangePassword from '../components/ChangePassword';
import AdminProfile from './AdminProfile';
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
    faHome,
    faPrayingHands,
    faCheckCircle,
    faUserShield,
    faUser,
    faSearch,
    faUserPlus,
    faBell,
    faCheck,
    faCheckDouble
} from '@fortawesome/free-solid-svg-icons';

export default function AdminDashboard() {
    const [activeTab, setActiveTabInternal] = useState(() => {
        return sessionStorage.getItem('adminActiveTab') || 'home';
    });

    const setActiveTab = (tab) => {
        setActiveTabInternal(tab);
        sessionStorage.setItem('adminActiveTab', tab);
    };

    // Listen for tab changes from the global Layout sidebar
    useEffect(() => {
        const handleTabChange = (e) => {
            if (e.detail) setActiveTab(e.detail);
        };
        window.addEventListener('setActiveTab', handleTabChange);
        return () => window.removeEventListener('setActiveTab', handleTabChange);
    }, []);
    const [members, setMembers] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [events, setEvents] = useState([]);
    const [sermons, setSermons] = useState([]);
    const [prayerRequests, setPrayerRequests] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [adminId] = useState(parseInt(sessionStorage.getItem('userId')));
    const [adminName] = useState(sessionStorage.getItem('userName'));
    const adminEmail = sessionStorage.getItem('userEmail');
    const isSuperAdmin = adminEmail === 'benjamin@ecclesiasys.com';
    const [memberSearchQuery, setMemberSearchQuery] = useState('');
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [newAdminName, setNewAdminName] = useState('');
    const [newAdminPassword, setNewAdminPassword] = useState('');
    const navigate = useNavigate();

    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState(null);
    const [alertDialog, setAlertDialog] = useState(null);
    const [newAnnouncement, setNewAnnouncement] = useState({ title: '', message: '', file: null });
    const [newEvent, setNewEvent] = useState({ title: '', description: '', eventDate: '', location: '', documentFile: null });
    const [newSermon, setNewSermon] = useState({ title: '', description: '', speaker: '', sermonDate: '', fileType: 'mp3', mediaMode: 'none', file: null, customUrl: '' });
    const [counts, setCounts] = useState({ members: 0, events: 0, announcements: 0, sermons: 0, prayerRequests: 0 });
    const [selectedItem, setSelectedItem] = useState(null);
    const [modalType, setModalType] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [adminProfile, setAdminProfile] = useState(null);
    const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
    const [isPostingAnnouncement, setIsPostingAnnouncement] = useState(false);
    const [isPublishingEvent, setIsPublishingEvent] = useState(false);
    const { theme, toggleTheme } = useTheme();


    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < 768;

    const handleLogout = () => {
        sessionStorage.clear();
        localStorage.clear();
        navigate('/login');
    };

    const fetchUserNotifications = async () => {
        const userId = sessionStorage.getItem('userId');
        if (!userId) return;
        try {
            const response = await getNotifications(userId);
            const data = response.data?.data || response.data || [];
            setNotifications(Array.isArray(data) ? data : []);
            setUnreadCount(Array.isArray(data) ? data.filter(n => !n.read).length : 0);
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
        }
    };

    useEffect(() => {
        fetchUserNotifications();
        const interval = setInterval(fetchUserNotifications, 30000); // Check every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const handleMarkAsRead = async (notifId) => {
        const userId = sessionStorage.getItem('userId');
        try {
            await markNotificationAsRead(notifId, userId);
            fetchUserNotifications();
        } catch (err) {
            console.error("Failed to mark as read:", err);
        }
    };

    const handleMarkAllAsRead = async () => {
        const userId = sessionStorage.getItem('userId');
        try {
            await markAllNotificationsAsRead(userId);
            fetchUserNotifications();
            setIsNotificationOpen(false);
        } catch (err) {
            console.error("Failed to mark all as read:", err);
        }
    };

    useEffect(() => {
        const userType = sessionStorage.getItem('userType');
        if (!adminId) {
            navigate('/login');
            return;
        }
        if (userType !== 'admin') {
            navigate('/login');
        }
        fetchAllData();
    }, [adminId, navigate]);

    const fetchAllData = async () => {
        setLoading(true);
        setError('');
        try {
            const promises = [
                getMembers(),
                getAnnouncements(),
                getEvents(),
                getSermons(),
                getPrayerRequests(),
                api.get('/summary/counts'),
                getAdminProfile(adminId)
            ];

            if (isSuperAdmin) {
                promises.push(getAdmins());
            }

            const results = await Promise.all(promises);
            const membersRes = results[0];
            const announcementsRes = results[1];
            const eventsRes = results[2];
            const sermonsRes = results[3];
            const prayerRequestsRes = results[4];
            const summaryRes = results[5];
            const adminProfileRes = results[6];
            const adminsRes = isSuperAdmin ? results[7] : null;

            setMembers(membersRes.data?.data || []);
            setAnnouncements(announcementsRes.data?.data || []);
            setEvents(eventsRes.data?.data || []);
            setSermons(sermonsRes.data?.data || []);
            setPrayerRequests(prayerRequestsRes.data?.data || []);
            setCounts(summaryRes.data?.data || { members: 0, events: 0, announcements: 0, sermons: 0, prayerRequests: 0 });
            
            if (adminProfileRes.data?.success) {
                setAdminProfile(adminProfileRes.data.data);
            }
            if (isSuperAdmin && adminsRes) {
                setAdmins(adminsRes.data?.data || []);
            }
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

    const handlePromoteMember = async (memberId) => {
        setConfirmDialog({
            title: 'Promote to Admin',
            message: 'Are you sure you want to promote this member to Admin?',
            onConfirm: async () => {
                try {
                    await promoteMemberToAdmin(memberId, { createdBy: adminId });
                    setAlertDialog({ title: 'Success', message: 'Member successfully promoted to Admin.' });
                    fetchAllData();
                } catch (error) {
                    console.error('Error promoting member:', error);
                    setAlertDialog({ title: 'Error', message: 'Failed to promote member.', isError: true });
                }
            }
        });
    };

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        setIsCreatingAdmin(true);
        try {
            await createAdmin({ name: newAdminName, email: newAdminEmail, password: newAdminPassword, createdBy: adminId });
            setNewAdminName('');
            setNewAdminEmail('');
            setNewAdminPassword('');
            setAlertDialog({ title: 'Success', message: 'New Admin created successfully.' });
            fetchAllData();
        } catch (error) {
            console.error('Error creating admin:', error);
            setAlertDialog({ title: 'Error', message: 'Failed to create admin.', isError: true });
        } finally {
            setIsCreatingAdmin(false);
        }
    };


    // Announcement Management
    const handleAddAnnouncement = async () => {
        setIsPostingAnnouncement(true);
        try {
            let announcementData = { ...newAnnouncement, createdBy: adminId };
            
            await createAnnouncement(announcementData);
            setNewAnnouncement({ title: '', message: '' });
            await fetchAllData();
        } catch (error) {
            console.error('Error adding announcement:', error);
            setAlertDialog({ title: 'Error', message: 'Error creating announcement: ' + error.message, isError: true });
        } finally {
            setIsPostingAnnouncement(false);
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
        setIsPublishingEvent(true);
        try {
            let eventData = { ...newEvent, createdBy: adminId, documentUrl: null };
            
            await createEvent(eventData);
            setNewEvent({ title: '', description: '', eventDate: '', location: '' });
            await fetchAllData();
        } catch (error) {
            console.error('Error adding event:', error);
            setAlertDialog({ title: 'Error', message: 'Error creating event: ' + error.message, isError: true });
        } finally {
            setIsPublishingEvent(false);
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

            let audioUrl = null;
            let videoUrl = null;

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

    const dashboardTabs = [
        { id: 'home', label: 'Overview', icon: faHome },
        { id: 'members', label: 'Members', icon: faUsers },
        { id: 'admins', label: 'Admins', icon: faUserShield, hidden: !isSuperAdmin },
        { id: 'announcements', label: 'Announcements', icon: faBullhorn },
        { id: 'events', label: 'Events', icon: faCalendarAlt },
        { id: 'sermons', label: 'Sermons', icon: faMicrophone },
        { id: 'prayer-requests', label: 'Prayer Requests', icon: faPrayingHands },
        { id: 'profile', label: 'Profile', icon: faUser },
    ].filter(t => !t.hidden);

    return (
        <div className="animate-fade-in pb-20">
            <div className="max-w-7xl mx-auto px-4 md:px-0">
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


            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 px-4 md:px-0">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black text-mdOnSurface tracking-tighter mb-2">
                        Admin Dashboard
                    </h1>
                    <p className="text-mdOnSurfaceVariant font-medium text-lg">
                        Welcome back, <span className="text-mdPrimary font-bold">{adminName}</span>. Managing your community.
                    </p>
                </div>

                <div className="relative">
                    <button 
                        onClick={() => setIsNotificationOpen(!isNotificationOpen)} 
                        className="relative p-4 rounded-2xl bg-mdPrimary text-white shadow-md1 hover:shadow-md2 hover:-translate-y-0.5 transition-all duration-200"
                        aria-label="Notifications"
                    >
                        <FontAwesomeIcon icon={faBell} className="text-xl" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 inline-flex items-center justify-center px-2 py-1 text-[10px] font-black leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-mdSecondary rounded-full shadow-sm ring-2 ring-white">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {isNotificationOpen && (
                        <>
                            <div className="fixed inset-0 z-[100]" onClick={() => setIsNotificationOpen(false)}></div>
                            <div className="absolute right-0 mt-4 w-80 sm:w-96 bg-white dark:bg-mdSurface text-mdOnSurface rounded-[2.5rem] shadow-premium border border-mdOutline/10 overflow-hidden z-[101] animate-fade-in-up">
                                <div className="p-6 border-b border-mdOutline/10 flex justify-between items-center bg-mdSurfaceVariant/20">
                                    <h3 className="font-black text-xl">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <button 
                                            onClick={handleMarkAllAsRead}
                                            className="text-xs font-black text-mdPrimary hover:underline uppercase tracking-widest"
                                        >
                                            Mark all read
                                        </button>
                                    )}
                                </div>
                                <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                                    {!Array.isArray(notifications) || notifications.length === 0 ? (
                                        <div className="p-12 text-center">
                                            <div className="w-20 h-20 bg-mdSurfaceVariant/50 rounded-full flex items-center justify-center mx-auto mb-6 opacity-40">
                                                <FontAwesomeIcon icon={faBell} className="text-3xl" />
                                            </div>
                                            <p className="text-mdOnSurfaceVariant font-black text-lg">No notifications yet</p>
                                            <p className="text-xs text-mdOnSurfaceVariant/60 mt-2 uppercase tracking-[0.2em] font-bold">Watching over the flock</p>
                                        </div>
                                    ) : (
                                        notifications.map((notif) => (
                                            <div 
                                                key={notif.id} 
                                                className={`p-6 border-b border-mdOutline/5 transition-colors duration-200 relative group ${!notif.read ? 'bg-mdPrimaryContainer/10 border-l-4 border-l-mdPrimary' : 'hover:bg-mdSurfaceVariant/10'}`}
                                            >
                                                <div className="flex justify-between items-start gap-3 mb-2">
                                                    <h4 className={`font-black text-base leading-tight ${!notif.read ? 'text-mdPrimary' : 'text-mdOnSurface'}`}>
                                                        {notif.title}
                                                    </h4>
                                                    {!notif.read && (
                                                        <button 
                                                            onClick={() => handleMarkAsRead(notif.id)}
                                                            className="p-2 text-mdPrimary hover:bg-mdPrimary/10 rounded-xl transition-colors"
                                                            title="Mark as read"
                                                        >
                                                            <FontAwesomeIcon icon={faCheck} className="text-xs" />
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-sm text-mdOnSurfaceVariant font-medium leading-relaxed mb-4">
                                                    {notif.message}
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-bold text-mdOutline uppercase tracking-widest">
                                                        {new Date(notif.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    {notif.read && (
                                                        <span className="text-mdPrimary/40">
                                                            <FontAwesomeIcon icon={faCheckDouble} className="text-[10px]" />
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            </div>

            {/* Change Password Tab */}
            {activeTab === 'password' && !loading && (
                <ChangePassword userType="admin" userId={adminId} />
            )}

            <div className="max-w-[1600px] mx-auto w-full">
                {/* Home View Placeholder / Welcome */}
                {activeTab === 'home' && !loading && (
                    <div className="bg-mdSurface rounded-[3rem] p-12 text-center border-2 border-dashed border-mdOutline/10 animate-fade-in py-20">
                         <div className="w-24 h-24 bg-mdPrimaryContainer rounded-full flex items-center justify-center text-mdPrimary text-4xl mx-auto mb-8 shadow-sm">
                            <FontAwesomeIcon icon={faUsers} />
                         </div>
                         <h2 className="text-4xl font-black text-mdOnSurface mb-4">Welcome, Admin</h2>
                         <p className="text-xl text-mdOnSurfaceVariant max-w-lg mx-auto font-medium">
                            Explore the sidebar navigation to manage your church community.
                         </p>
                    </div>
                )}

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
                        {/* Summary Cards were already shown at top, so maybe just show management part */}
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="bg-mdSecondaryContainer/50 p-4 rounded-2xl">
                                    <FontAwesomeIcon icon={faUsers} className="text-2xl text-mdSecondary" />
                                </div>
                                <h2 className="text-3xl font-extrabold text-mdSecondary tracking-tight">Members</h2>
                            </div>
                            
                            <div className="flex-1 max-w-sm mx-4">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-mdOnSurfaceVariant">
                                        <FontAwesomeIcon icon={faSearch} />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search members..."
                                        value={memberSearchQuery}
                                        onChange={(e) => setMemberSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-mdOutline/30 rounded-2xl bg-mdSurface focus:outline-none focus:ring-2 focus:ring-mdPrimary focus:border-transparent transition-all duration-200"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={() => downloadMembersAsExcel(members)}
                                className="bg-mdPrimary text-mdOnPrimary hover:bg-mdSecondary px-6 py-3 rounded-full font-bold shadow-md1 hover:shadow-md2 transition-all duration-300 text-sm sm:text-base whitespace-nowrap"
                            >
                                <FontAwesomeIcon icon={faPlus} className="mr-2" /> Export to Excel
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {members.filter(member => 
                                (member.name && member.name.toLowerCase().includes(memberSearchQuery.toLowerCase())) ||
                                (member.firstName && member.firstName.toLowerCase().includes(memberSearchQuery.toLowerCase())) ||
                                (member.lastName && member.lastName.toLowerCase().includes(memberSearchQuery.toLowerCase())) ||
                                (member.email && member.email.toLowerCase().includes(memberSearchQuery.toLowerCase()))
                            ).map((member) => {
                                const firstName = member.firstName || member.name?.split(' ')[0] || 'Unknown';
                                const lastName = member.lastName || member.name?.split(' ').slice(1).join(' ') || '';
                                const initial = firstName.charAt(0).toUpperCase();

                                return (
                                    <div key={member.id} className="bg-mdSurface p-6 rounded-[2rem] border border-mdSurfaceVariant shadow-sm hover:shadow-md2 transition-all duration-300 flex flex-col items-center text-center group relative overflow-hidden">
                                        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                            {isSuperAdmin && (
                                                <button
                                                    onClick={() => handlePromoteMember(member.id)}
                                                    className="bg-mdPrimary/10 text-mdPrimary hover:bg-mdPrimary hover:text-mdOnPrimary w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 shadow-sm"
                                                    title="Make Admin"
                                                >
                                                    <FontAwesomeIcon icon={faUserShield} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDeleteMember(member.id)}
                                                className="bg-mdError/10 text-mdError hover:bg-mdError hover:text-mdOnError w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 shadow-sm"
                                                title="Delete Member"
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </div>
                                        
                                        <div className="w-28 h-28 mb-4 rounded-full bg-mdSurfaceVariant overflow-hidden border-4 border-mdSurface shadow-md relative group-hover:scale-105 transition-transform duration-300">
                                            <div className="w-full h-full flex items-center justify-center text-4xl font-black text-mdPrimary bg-mdPrimaryContainer">
                                                {initial}
                                            </div>
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
                                                    <p className="text-[10px] font-bold text-mdOnSurfaceVariant uppercase tracking-wider">Email</p>
                                                    <p className="text-sm font-bold text-mdOnSurface truncate" title={member.email || ''}>{member.email || 'Not provided'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            )}

            {/* Admins Tab */}
            {activeTab === 'admins' && isSuperAdmin && !loading && (
                <div className="space-y-8 animate-fade-in">
                    <div className="bg-mdSurface rounded-[2rem] shadow-sm border border-mdSurfaceVariant p-6 sm:p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="bg-mdPrimaryContainer p-4 rounded-2xl">
                                <FontAwesomeIcon icon={faUserPlus} className="text-2xl text-mdPrimary" />
                            </div>
                            <h2 className="text-2xl font-extrabold text-mdPrimary tracking-tight">Create Administrator</h2>
                        </div>
                        
                        <form onSubmit={handleCreateAdmin} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-mdOnSurfaceVariant mb-2 ml-1">Admin Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Full Name"
                                    value={newAdminName}
                                    onChange={(e) => setNewAdminName(e.target.value)}
                                    className="w-full px-5 py-4 border border-mdOutline/30 rounded-2xl bg-mdSurface focus:outline-none focus:ring-2 focus:ring-mdPrimary focus:border-transparent transition-all duration-200"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-mdOnSurfaceVariant mb-2 ml-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="admin@ecclesiasys.com"
                                    value={newAdminEmail}
                                    onChange={(e) => setNewAdminEmail(e.target.value)}
                                    className="w-full px-5 py-4 border border-mdOutline/30 rounded-2xl bg-mdSurface focus:outline-none focus:ring-2 focus:ring-mdPrimary focus:border-transparent transition-all duration-200"
                                />
                            </div>
                            <div className="flex flex-col justify-end">
                                <label className="block text-sm font-semibold text-mdOnSurfaceVariant mb-2 ml-1">Password</label>
                                <div className="flex gap-4">
                                    <input
                                        type="text"
                                        required
                                        placeholder="Secure password"
                                        value={newAdminPassword}
                                        onChange={(e) => setNewAdminPassword(e.target.value)}
                                        className="flex-1 px-5 py-4 border border-mdOutline/30 rounded-2xl bg-mdSurface focus:outline-none focus:ring-2 focus:ring-mdPrimary focus:border-transparent transition-all duration-200"
                                    />
                                 <button
                                    type="submit"
                                    disabled={isCreatingAdmin}
                                    className="w-full bg-mdPrimary text-mdOnPrimary hover:bg-mdSecondary px-6 py-4 rounded-2xl font-black shadow-md1 hover:shadow-md2 transition-all duration-300 flex items-center justify-center gap-2 group-hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isCreatingAdmin ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <FontAwesomeIcon icon={faPlus} />
                                            Create Admin Account
                                        </>
                                    )}
                                </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="bg-mdSurface rounded-[2rem] shadow-sm border border-mdSurfaceVariant overflow-hidden">
                        <div className="px-6 py-6 border-b border-mdSurfaceVariant bg-mdSurfaceVariant/30 flex justify-between items-center">
                            <h3 className="text-xl font-extrabold text-mdOnSurface">Current Administrators</h3>
                            <span className="bg-mdPrimary text-mdOnPrimary px-3 py-1 rounded-full text-sm font-bold">{admins.length} Total</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-mdSurface">
                                        <th className="py-4 px-6 font-bold text-mdOnSurfaceVariant uppercase tracking-wider text-sm border-b border-mdSurfaceVariant">Admin Name</th>
                                        <th className="py-4 px-6 font-bold text-mdOnSurfaceVariant uppercase tracking-wider text-sm border-b border-mdSurfaceVariant">Email Address</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {admins.map((admin) => (
                                        <tr key={admin.id} className="border-b border-mdSurfaceVariant hover:bg-mdSurfaceVariant/40 transition-colors">
                                            <td className="py-5 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-mdPrimaryContainer text-mdPrimary flex items-center justify-center font-bold">
                                                        {admin.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-mdOnSurface">{admin.name}</p>
                                                        {admin.email === 'benjamin@ecclesiasys.com' && (
                                                            <span className="text-xs bg-accent text-mdOnSurface px-2 py-0.5 rounded-full font-bold ml-2">Super Admin</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-5 px-6 font-medium text-mdOnSurfaceVariant">
                                                {admin.email}
                                            </td>
                                        </tr>
                                    ))}
                                    {admins.length === 0 && (
                                        <tr>
                                            <td colSpan="2" className="py-8 text-center text-mdOnSurfaceVariant font-medium">
                                                No secondary administrators found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
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
                            </div>                            <button
                                onClick={handleAddAnnouncement}
                                disabled={isPostingAnnouncement}
                                className="w-full bg-mdPrimary text-mdOnPrimary hover:bg-mdSecondary px-6 py-4 rounded-2xl font-black shadow-md1 hover:shadow-md2 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isPostingAnnouncement ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Posting...
                                    </>
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faPlus} />
                                        Post Announcement
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6 pt-4">
                        <h2 className="text-2xl font-extrabold text-mdOnSurface tracking-tight">Manage Announcements</h2>
                        <div className="grid gap-6">
                            {announcements.map(ann => (
                                <div 
                                    key={ann.id} 
                                    onClick={() => navigate(`/announcements?id=${ann.id}`)}
                                    className="bg-mdSurface p-6 rounded-3xl shadow-sm border border-mdSurfaceVariant hover:shadow-md2 transition-all duration-300 group cursor-pointer"
                                >
                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-extrabold text-xl text-mdOnSurface mb-2 group-hover:text-mdPrimary transition-colors">{ann.title}</h3>
                                            <p className="text-mdOnSurfaceVariant text-base leading-relaxed line-clamp-2">{ann.message}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => navigate(`/announcements?id=${ann.id}`)}
                                                className="bg-mdPrimary/10 text-mdPrimary hover:bg-mdPrimary hover:text-mdOnPrimary px-4 py-2 text-xs rounded-full transition-colors font-bold"
                                            >
                                                View
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteAnnouncement(ann.id); }}
                                                className="bg-mdError/10 text-mdError hover:bg-mdError hover:text-mdOnError px-4 py-2 text-xs rounded-full transition-colors font-bold flex-shrink-0"
                                            >
                                                Delete
                                            </button>
                                        </div>
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
                                disabled={isPublishingEvent}
                                className="w-full bg-mdPrimary text-mdOnPrimary hover:bg-mdSecondary px-6 py-4 rounded-2xl font-black shadow-md1 hover:shadow-md2 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isPublishingEvent ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Publishing...
                                    </>
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faPlus} />
                                        Publish Event
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6 pt-4">
                        <h2 className="text-2xl font-extrabold text-mdOnSurface tracking-tight">Manage Events</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            {events.map(event => (
                                <div 
                                    key={event.id} 
                                    onClick={() => navigate(`/events?id=${event.id}`)}
                                    className="bg-mdSurface p-6 rounded-3xl shadow-sm border border-mdSurfaceVariant hover:shadow-md2 transition-all duration-300 flex flex-col group cursor-pointer"
                                >
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="font-extrabold text-xl text-mdOnSurface group-hover:text-mdSecondary transition-colors">{event.title}</h3>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => navigate(`/events?id=${event.id}`)}
                                                    className="bg-mdSecondary/10 text-mdSecondary hover:bg-mdSecondary hover:text-mdOnSecondary px-3 py-1.5 text-xs rounded-full transition-colors font-bold"
                                                >
                                                    View
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteEvent(event.id); }}
                                                    className="bg-mdError/10 text-mdError hover:bg-mdError hover:text-mdOnError px-3 py-1.5 text-xs rounded-full transition-colors font-bold ml-4 shrink-0"
                                                >
                                                    Delete
                                                </button>
                                            </div>
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
                                disabled={loading}
                                className="w-full bg-mdPrimary text-mdOnPrimary hover:bg-mdSecondary px-6 py-4 rounded-2xl font-black shadow-md1 hover:shadow-md2 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faPlus} />
                                        Publish Sermon
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6 pt-4">
                        <h2 className="text-2xl font-extrabold text-mdOnSurface tracking-tight">Manage Sermons</h2>
                        <div className="grid lg:grid-cols-2 gap-6">
                            {sermons.map(sermon => (
                                <div 
                                    key={sermon.id} 
                                    className="bg-mdSurface p-6 rounded-3xl shadow-sm border border-mdSurfaceVariant hover:shadow-md2 transition-all duration-300 flex flex-col sm:flex-row gap-6 group"
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
                                                Added {new Date(sermon.uploadedDate || sermon.sermonDate).toLocaleDateString()}
                                            </p>
                                            
                                            <div className="flex gap-2 ml-auto">
                                                {sermon.audioUrl && (
                                                    <a 
                                                        href={sermon.audioUrl} 
                                                        className="px-3 py-1.5 bg-mdPrimaryContainer/30 text-mdPrimary rounded-full text-xs font-bold hover:bg-mdPrimary hover:text-mdOnPrimary transition-colors"
                                                    >
                                                        Listen
                                                    </a>
                                                )}
                                                {sermon.videoUrl && (
                                                    <a 
                                                        href={sermon.videoUrl} 
                                                        className="px-3 py-1.5 bg-mdSecondaryContainer/30 text-mdSecondary rounded-full text-xs font-bold hover:bg-mdSecondary hover:text-mdOnSecondary transition-colors"
                                                    >
                                                        Watch
                                                    </a>
                                                )}
                                                <button
                                                    onClick={() => navigate(`/sermons?id=${sermon.id}`)}
                                                    className="bg-mdPrimary/10 text-mdPrimary hover:bg-mdPrimary hover:text-mdOnPrimary px-3 py-1.5 text-xs rounded-full transition-colors font-bold"
                                                >
                                                    View
                                                </button>
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

            {/* Profile Tab */}
            {activeTab === 'profile' && !loading && (
                <div className="space-y-6 animate-fade-in mb-12">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="bg-mdPrimaryContainer p-4 rounded-2xl">
                            <FontAwesomeIcon icon={faUser} className="text-2xl text-mdPrimary" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-mdPrimary tracking-tight">Profile Management</h2>
                    </div>
                    <AdminProfile />
                </div>
            )}

            {/* Prayer Requests Tab */}
                {activeTab === 'prayer-requests' && !loading && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="bg-mdPrimaryContainer p-4 rounded-2xl">
                                <FontAwesomeIcon icon={faPrayingHands} className="text-2xl text-mdPrimary" />
                            </div>
                            <h2 className="text-3xl font-extrabold text-mdPrimary tracking-tight">Prayer Requests</h2>
                        </div>
                        
                        <div className="grid gap-6">
                            {prayerRequests.length > 0 ? (
                                prayerRequests.map((request) => (
                                    <div key={request.id} className="bg-mdSurface p-8 rounded-[2rem] border border-mdSurfaceVariant shadow-sm hover:shadow-md2 transition-all duration-300">
                                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-black text-2xl text-mdOnSurface">
                                                        {request.isAnonymous ? 'Anonymous Request' : request.requesterName}
                                                    </h3>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                                                        request.status === 'Answered' ? 'bg-green-100 text-green-700' : 
                                                        request.status === 'Prayed For' ? 'bg-blue-100 text-blue-700' : 
                                                        'bg-amber-100 text-amber-700'
                                                    }`}>
                                                        {request.status}
                                                    </span>
                                                </div>
                                                <p className="text-mdOnSurfaceVariant font-bold text-sm">
                                                    Submitted {new Date(request.createdAt).toLocaleDateString()}
                                                    {!request.isAnonymous && request.requesterEmail && ` • ${request.requesterEmail}`}
                                                </p>
                                            </div>
                                            
                                            <div className="flex flex-wrap gap-2">
                                                {request.status !== 'Prayed For' && request.status !== 'Answered' && (
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                await updatePrayerRequestStatus(request.id, 'Prayed For');
                                                                await fetchAllData();
                                                            } catch (err) {
                                                                console.error('Error updating status:', err);
                                                            }
                                                        }}
                                                        className="bg-mdPrimaryContainer text-mdPrimary hover:bg-mdPrimary hover:text-mdOnPrimary px-4 py-2 rounded-full text-sm font-bold transition-all"
                                                    >
                                                        Mark as Prayed For
                                                    </button>
                                                )}
                                                {request.status !== 'Answered' && (
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                await updatePrayerRequestStatus(request.id, 'Answered');
                                                                await fetchAllData();
                                                            } catch (err) {
                                                                console.error('Error updating status:', err);
                                                            }
                                                        }}
                                                        className="bg-green-100 text-green-700 hover:bg-green-600 hover:text-white px-4 py-2 rounded-full text-sm font-bold transition-all"
                                                    >
                                                        Mark as Answered
                                                    </button>
                                                )}
                                                {(request.status === 'Answered' || request.status === 'Prayed For') && (
                                                    <button
                                                        onClick={async () => {
                                                            setConfirmDialog({
                                                                title: 'Delete Prayer Request',
                                                                message: 'Are you sure you want to delete this completed prayer request?',
                                                                onConfirm: async () => {
                                                                    try {
                                                                        await deletePrayerRequest(request.id);
                                                                        await fetchAllData();
                                                                    } catch (err) {
                                                                        console.error('Error deleting request:', err);
                                                                    }
                                                                }
                                                            });
                                                        }}
                                                        className="bg-red-100 text-red-700 hover:bg-red-600 hover:text-white px-4 py-2 rounded-full text-sm font-bold transition-all"
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} className="mr-2" /> Delete
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="bg-mdSurfaceVariant/20 p-6 rounded-2xl border border-mdSurfaceVariant/50">
                                            <p className="text-mdOnSurfaceVariant text-lg leading-relaxed italic ">
                                                "{request.requestText}"
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="bg-mdSurface Variant/10 border border-dashed border-mdOutline/20 rounded-[2rem] p-16 text-center">
                                    <p className="text-mdOnSurfaceVariant text-lg font-medium">No prayer requests at this time.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                </div>
            </div>
    );
}

