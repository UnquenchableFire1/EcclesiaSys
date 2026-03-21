import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUsers, faBullhorn, faCalendarAlt, faMicrophone, faFileExcel, 
    faTrash, faPhone, faEnvelope, faMapMarkerAlt, faVideo, 
    faPlus, faHome, faPrayingHands, faCheckCircle, faUserShield, 
    faUser, faSearch, faUserPlus, faBell, faCheck, faCheckDouble,
    faTimes, faChevronRight, faClock, faChartBar, faComments,
    faExclamationTriangle, faSignOutAlt, faBuilding
} from '@fortawesome/free-solid-svg-icons';

import { 
    getAdminProfile, getCounts, toggleMemberStatus, deleteAdmin,
    getBranches, createBranch, getMembers, getAnnouncements,
    getEvents, getSermons, getAdmins, getNotifications,
    getPrayerRequests, updatePrayerRequestStatus, deletePrayerRequest,
    deleteMember, createAnnouncement, createEvent, createSermon,
    createAdmin, promoteMemberToAdmin
} from '../services/api';

import Announcements from './Announcements';
import Events from './Events';
import Sermons from './Sermons';
import AdminProfile from './AdminProfile';
import ChangePassword from '../components/ChangePassword';
import Chat from './Chat';
import { downloadMembersAsExcel } from '../services/excelExport';
import ConfirmModal from '../components/ConfirmModal';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { theme } = useTheme();

    // -- State --
    const [activeTab, setActiveTabInternal] = useState(() => sessionStorage.getItem('adminActiveTab') || 'home');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Auth & Identity
    const [adminId] = useState(parseInt(sessionStorage.getItem('userId')));
    const [adminName] = useState(sessionStorage.getItem('userName'));
    const adminEmail = sessionStorage.getItem('userEmail');
    const isSuperAdmin = adminEmail === 'benjaminbuckmanjunior@gmail.com';

    // Data
    const [members, setMembers] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [events, setEvents] = useState([]);
    const [sermons, setSermons] = useState([]);
    const [prayerRequests, setPrayerRequests] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [branches, setBranches] = useState([]);
    const [selectedBranchId, setSelectedBranchId] = useState(null);
    const [counts, setCounts] = useState({ members: 0, events: 0, announcements: 0, sermons: 0, prayerRequests: 0 });
    
    // UI State
    const [memberSearchQuery, setMemberSearchQuery] = useState('');
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState(null);
    const [alertDialog, setAlertDialog] = useState(null);
    const [adminData, setAdminData] = useState(null);

    // Form States
    const [showAnnForm, setShowAnnForm] = useState(false);
    const [annForm, setAnnForm] = useState({ title: '', message: '' });
    const [showEventForm, setShowEventForm] = useState(false);
    const [eventForm, setEventForm] = useState({ title: '', description: '', startDate: '', endDate: '', location: '' });
    const [showSermonForm, setShowSermonForm] = useState(false);
    const [sermonForm, setSermonForm] = useState({ title: '', preacherName: '', description: '' });
    const [showAdminForm, setShowAdminForm] = useState(false);
    const [adminForm, setAdminForm] = useState({ name: '', email: '', password: '' });
    const [formLoading, setFormLoading] = useState(false);

    // -- Handlers --
    const setActiveTab = (tab) => {
        setActiveTabInternal(tab);
        sessionStorage.setItem('adminActiveTab', tab);
    };

    // Listen for tab changes from Sidebar
    useEffect(() => {
        const handleTabChange = (e) => { if (e.detail) setActiveTab(e.detail); };
        window.addEventListener('setActiveTab', handleTabChange);
        return () => window.removeEventListener('setActiveTab', handleTabChange);
    }, []);

    // -- Deletion Confirmation State --
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
        type: 'danger'
    });

    const openConfirm = (title, message, onConfirm, type = 'danger') => {
        setConfirmModal({
            isOpen: true,
            title,
            message,
            onConfirm,
            type
        });
    };

    const closeConfirm = () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
    };

    const fetchAllData = useCallback(async () => {
        setLoading(true);
        try {
            const [mem, ann, eve, ser, pra, cou, adm, bra] = await Promise.all([
                getMembers(selectedBranchId), 
                getAnnouncements(selectedBranchId), 
                getEvents(selectedBranchId), 
                getSermons(selectedBranchId), 
                getPrayerRequests(), 
                getCounts(), 
                getAdmins(),
                getBranches()
            ]);
            setMembers(Array.isArray(mem.data.data) ? mem.data.data : (Array.isArray(mem.data) ? mem.data : []));
            setAnnouncements(Array.isArray(ann.data.data) ? ann.data.data : (Array.isArray(ann.data) ? ann.data : []));
            setEvents(Array.isArray(eve.data.data) ? eve.data.data : (Array.isArray(eve.data) ? eve.data : []));
            setSermons(Array.isArray(ser.data.data) ? ser.data.data : (Array.isArray(ser.data) ? ser.data : []));
            setPrayerRequests(Array.isArray(pra.data.data) ? pra.data.data : (Array.isArray(pra.data) ? pra.data : []));
            setCounts(cou.data || { members: 0, announcements: 0, events: 0, sermons: 0, prayerRequests: 0 });
            setAdmins(Array.isArray(adm.data.data) ? adm.data.data : (Array.isArray(adm.data) ? adm.data : []));
            setBranches(Array.isArray(bra.data) ? bra.data : []);
        } catch (err) {
            console.error("Data Load Error:", err);
        } finally {
            setLoading(false);
        }
    }, [selectedBranchId]);

    const fetchNotifications = async () => {
        try {
            const res = await getNotifications(adminId);
            const data = res.data?.data || [];
            if (Array.isArray(data)) {
                setNotifications(data);
                setUnreadCount(data.filter(n => !n.read).length);
            }
        } catch (err) { console.error("Notification Error:", err); }
    };

    const fetchProfile = useCallback(async () => {
        try {
            const res = await getAdminProfile(adminId);
            if (res.data) {
                const profile = res.data.data || res.data;
                setAdminData(profile);
                // If not super admin, lock to their branch
                const isSuper = profile.role === 'SUPER_ADMIN' || profile.email === 'benjaminbuckmanjunior@gmail.com';
                if (!isSuper && profile.branchId) {
                    setSelectedBranchId(profile.branchId);
                }
            }
        } catch (err) {
            console.error("Profile Fetch Error:", err);
        }
    }, [adminId]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    useEffect(() => {
        if (!adminId) { navigate('/login'); return; }
        fetchAllData();
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [adminId, fetchAllData, navigate]);

    // Management Handlers
    const handleAnnouncementSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            await createAnnouncement({ ...annForm, createdBy: adminId });
            setAlertDialog({ title: 'Broadcast Live', message: 'Your announcement is now visible to all members.' });
            setAnnForm({ title: '', message: '' });
            setShowAnnForm(false);
            fetchAllData();
        } catch (err) { setAlertDialog({ title: 'Error', message: 'Broadcast failed.', isError: true }); }
        finally { setFormLoading(false); }
    };

    const handleEventSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            await createEvent({ 
                ...eventForm, 
                eventDate: eventForm.startDate,
                createdBy: adminId 
            });
            setAlertDialog({ title: 'Event Scheduled', message: 'The event has been added to the calendar.' });
            setEventForm({ title: '', description: '', startDate: '', endDate: '', location: '' });
            setShowEventForm(false);
            fetchAllData();
        } catch (err) { setAlertDialog({ title: 'Error', message: 'Scheduling failed.', isError: true }); }
        finally { setFormLoading(false); }
    };

    const handleSermonSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            await createSermon({
                ...sermonForm,
                speaker: sermonForm.preacherName,
                sermonDate: new Date().toISOString(),
                createdBy: adminId
            });
            setAlertDialog({ title: 'Word Published', message: 'Sermon is now available in the library.' });
            setSermonForm({ title: '', preacherName: '', description: '' });
            setShowSermonForm(false);
            fetchAllData();
        } catch (err) { setAlertDialog({ title: 'Error', message: 'Upload failed.', isError: true }); }
        finally { setFormLoading(false); }
    };

    const handleAdminSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            await createAdmin({ ...adminForm, createdBy: adminId });
            setAlertDialog({ title: 'Admin Created', message: 'New administrator has been granted access.' });
            setAdminForm({ name: '', email: '', password: '' });
            setShowAdminForm(false);
            fetchAllData();
        } catch (err) { setAlertDialog({ title: 'Error', message: 'Creation failed.', isError: true }); }
        finally { setFormLoading(false); }
    };

    const handlePromoteToAdmin = async (memberId) => {
        setFormLoading(true);
        try {
            await promoteMemberToAdmin(memberId, { createdBy: adminId });
            setAlertDialog({ title: 'Success', message: 'Member has been promoted to administrator.' });
            fetchAllData();
        } catch (err) {
            setAlertDialog({ title: 'Promotion Failed', message: err.response?.data?.message || 'Server error', isError: true });
        } finally {
            setFormLoading(false);
        }
    };

    const handleBranchSubmit = async (e) => {
        e.preventDefault();
        const branchName = e.target.branchName.value;
        setFormLoading(true);
        try {
            await createBranch({ name: branchName });
            setAlertDialog({ title: 'Branch Created', message: `Branch "${branchName}" has been established.` });
            e.target.reset();
            fetchAllData();
        } catch (err) {
            setAlertDialog({ title: 'Creation Failed', message: 'Could not establish branch.', isError: true });
        } finally {
            setFormLoading(false);
        }
    };

    // -- Sub-Components --
    const MetricCard = ({ label, count, icon, color }) => (
        <div className="glass-card p-8 group hover:-translate-y-2 transition-all">
            <div className={`w-14 h-14 bg-mdSurfaceVariant/20 ${color} rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-500`}>
                <FontAwesomeIcon icon={icon} />
            </div>
            <p className="text-4xl font-black text-mdOnSurface mb-1">{count}</p>
            <p className="text-sm font-bold text-mdOnSurfaceVariant uppercase tracking-widest">{label}</p>
        </div>
    );

    const QuickAction = ({ label, icon, tab, desc }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className="flex items-center gap-5 p-6 rounded-[2rem] bg-mdSurfaceVariant/10 hover:bg-mdPrimary hover:text-white transition-all duration-300 group text-left border border-transparent"
        >
            <div className="w-12 h-12 rounded-xl bg-mdPrimary group-hover:bg-white/20 flex items-center justify-center text-white">
                <FontAwesomeIcon icon={icon} />
            </div>
            <div>
                <p className="font-black">{label}</p>
                <p className="text-[10px] text-mdOnSurfaceVariant group-hover:text-white/70 uppercase font-black tracking-widest">{desc}</p>
            </div>
            <FontAwesomeIcon icon={faChevronRight} className="ml-auto opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all text-sm" />
        </button>
    );

    return (
        <div className="animate-fade-in pb-24 max-w-[1600px] mx-auto px-4 md:px-0">
            {/* Dialogs */}
            {confirmDialog && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                    <div className="glass-card p-10 max-w-sm w-full animate-slide-up text-center">
                        <h3 className="text-2xl font-black text-mdOnSurface mb-4">{confirmDialog.title}</h3>
                        <p className="text-mdOnSurfaceVariant mb-8 font-medium">{confirmDialog.message}</p>
                        <div className="flex gap-4">
                            <button onClick={() => setConfirmDialog(null)} className="flex-1 py-4 rounded-2xl font-black border border-mdOutline/20 text-mdOnSurfaceVariant hover:bg-mdSurfaceVariant/10">Cancel</button>
                            <button onClick={() => { confirmDialog.onConfirm(); setConfirmDialog(null); }} className="flex-1 py-4 rounded-2xl font-black bg-mdError text-white shadow-lifted">Confirm</button>
                        </div>
                    </div>
                </div>
            )}
            
            <header className="mb-12 mt-4 px-4 md:px-0 animate-slide-up">
                <div className="relative group inline-block">
                    <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-mdPrimary rounded-full scale-y-100 transition-transform duration-700 origin-center hidden md:block"></div>
                    <h1 className="text-5xl md:text-7xl font-black text-mdOnSurface tracking-tighter mb-2">
                        EcclesiaSys Sanctuary
                    </h1>
                    <p className="text-mdOnSurfaceVariant font-bold text-lg opacity-80 flex items-center gap-3">
                        <span className="w-8 h-px bg-mdPrimary/30"></span>
                        Peace be with you, <span className="text-mdPrimary font-black">{adminName}</span>.
                    </p>
                </div>
            </header>

            {/* TAB CONTENT */}
            <div className="mt-8 transition-all">
                
                {/* 1. HOME / OVERVIEW */}
                {activeTab === 'home' && (
                    <div className="space-y-10 animate-fade-in">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <button onClick={() => setActiveTab('members')} className="w-full text-left">
                                <MetricCard label="Members" count={counts.members} icon={faUsers} color="text-mdPrimary" />
                            </button>
                            <button onClick={() => setActiveTab('events')} className="w-full text-left">
                                <MetricCard label="Events" count={counts.events} icon={faCalendarAlt} color="text-mdSecondary" />
                            </button>
                            <button onClick={() => setActiveTab('announcements')} className="w-full text-left">
                                <MetricCard label="Broadcasts" count={counts.announcements} icon={faBullhorn} color="text-amber-500" />
                            </button>
                            <button onClick={() => setActiveTab('sermons')} className="w-full text-left">
                                <MetricCard label="Messages" count={counts.sermons} icon={faMicrophone} color="text-purple-500" />
                            </button>
                            {isSuperAdmin && (
                                <button onClick={() => setActiveTab('branch-management')} className="w-full text-left">
                                    <MetricCard label="Branches" count={branches.length} icon={faBuilding} color="text-emerald-500" />
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 glass-card p-10">
                                <h3 className="text-2xl font-black text-mdOnSurface mb-8 flex items-center gap-3">
                                    <span className="w-1.5 h-6 bg-mdPrimary rounded-full"></span>
                                    Sanctuary Actions
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <QuickAction label="Post News" icon={faPlus} tab="announcements" desc="broadcast to all" />
                                    <QuickAction label="Add Event" icon={faCalendarAlt} tab="events" desc="Update calendar" />
                                    <QuickAction label="Upload Word" icon={faVideo} tab="sermons" desc="Media library" />
                                    {isSuperAdmin && <QuickAction label="New Admin" icon={faUserPlus} tab="admins" desc="Grant access" />}
                                    {isSuperAdmin && <QuickAction label="Branches" icon={faBuilding} tab="branch-management" desc="Manage network" />}
                                </div>
                            </div>
                            
                            <div className="glass-card p-10 bg-gradient-to-br from-mdPrimary to-mdSecondary text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                <h3 className="text-2xl font-black mb-6">System Status</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl">
                                        <span className="font-bold text-[10px] uppercase tracking-widest opacity-70">Heartbeat</span>
                                        <span className="flex items-center gap-2 font-black text-[10px] uppercase">
                                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                            Operational
                                        </span>
                                    </div>
                                    <div className="pt-8 border-t border-white/10">
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Authenticated As</p>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-black">{adminName?.[0]}</div>
                                            <p className="font-black text-lg">{adminName}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. MEMBERS */}
                {activeTab === 'members' && (
                    <div className="space-y-10 animate-fade-in">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <h1 className="text-4xl font-black text-mdOnSurface tracking-tighter flex items-center gap-4">
                                    Congregation
                                    <span className="text-xs bg-mdPrimary/10 text-mdPrimary px-3 py-1 rounded-full">{members.length} Members</span>
                                </h1>
                                <p className="text-mdPrimary font-black text-sm uppercase tracking-widest">Member Directory</p>
                            </div>
                            <div className="flex gap-4 w-full md:w-auto">
                                <div className="relative flex-1 md:w-80">
                                    <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-mdOutline" />
                                    <input 
                                        type="text" 
                                        placeholder="Find member..." 
                                        className="w-full pl-12 pr-4 py-3 bg-mdSurfaceVariant/10 border-none rounded-xl focus:ring-2 focus:ring-mdPrimary"
                                        value={memberSearchQuery}
                                        onChange={(e) => setMemberSearchQuery(e.target.value)}
                                    />
                                </div>
                                {(isSuperAdmin || (adminData?.role === 'SUPER_ADMIN')) && (
                                    <select 
                                        value={selectedBranchId || ''} 
                                        onChange={(e) => setSelectedBranchId(e.target.value ? parseInt(e.target.value) : null)}
                                        className="p-3 bg-mdSurfaceVariant/10 border-none rounded-xl font-bold text-sm text-mdOnSurface"
                                    >
                                        <option value="">All Branches</option>
                                        {branches.map(b => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </select>
                                )}
                                {(!isSuperAdmin && adminData?.role !== 'SUPER_ADMIN' && branches.length > 0) && (
                                    <div className="p-3 bg-mdSecondary/10 text-mdSecondary border-none rounded-xl font-bold text-sm flex items-center gap-2">
                                        <FontAwesomeIcon icon={faBuilding} className="text-xs" />
                                        {branches.find(b => b.id === selectedBranchId)?.name || 'Designated Branch'}
                                    </div>
                                )}
                                <button onClick={() => downloadMembersAsExcel(members)} className="p-3 bg-green-600 text-white rounded-xl shadow-sm hover:scale-105 transition-all">
                                    <FontAwesomeIcon icon={faFileExcel} />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[...members.filter(m => (m.name || `${m.firstName || ''} ${m.lastName || ''}`).toLowerCase().includes(memberSearchQuery.toLowerCase()))]
                                .sort((a, b) => a.id === adminId ? -1 : b.id === adminId ? 1 : 0)
                                .map(member => (
                                <div key={member.id} className={`glass-card group p-8 flex flex-col items-center text-center relative ${member.id === adminId ? 'bg-mdPrimary/5 border-mdPrimary border-2' : ''}`}>
                                    <div className="w-20 h-20 rounded-full bg-mdPrimary/10 flex items-center justify-center text-3xl font-black text-mdPrimary mb-4">
                                        {member.name?.[0] || member.firstName?.[0]}
                                    </div>
                                    <h4 className="text-xl font-black text-mdOnSurface truncate w-full flex items-center justify-center gap-2">
                                        {member.name || `${member.firstName} ${member.lastName}`}
                                        {member.id === adminId && <span className="text-[10px] text-mdPrimary bg-mdPrimary/10 px-2 py-0.5 rounded-lg">(YOU)</span>}
                                    </h4>
                                    <div className="flex items-center gap-2 mb-6">
                                        <p className="text-xs font-bold text-mdOnSurfaceVariant uppercase tracking-widest">Member</p>
                                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${member.status === 'Active' ? 'bg-green-500/10 text-green-600' : 'bg-mdError/10 text-mdError'}`}>
                                            {member.status || 'Active'}
                                        </span>
                                    </div>
                                    <div className="w-full space-y-2 mt-auto">
                                        <div className="flex items-center gap-2 p-3 bg-mdSurfaceVariant/10 rounded-xl text-xs font-bold text-mdOnSurfaceVariant overflow-hidden">
                                            <FontAwesomeIcon icon={faEnvelope} className="text-mdPrimary" />
                                            <span className="truncate">{member.email}</span>
                                        </div>
                                        <button 
                                            onClick={() => openConfirm(
                                                "Restrict Access?", 
                                                `Are you sure you want to ${member.status === 'Active' ? 'Deactivate' : 'Reactivate'} ${member.firstName}?`,
                                                () => toggleMemberStatus(member.id).then(fetchAllData)
                                            )}
                                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${member.id === adminId ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : member.status === 'Active' ? 'bg-mdError/10 text-mdError hover:bg-mdError hover:text-white' : 'bg-green-500/10 text-green-600 hover:bg-green-500 hover:text-white'}`}
                                            disabled={member.id === adminId}
                                        >
                                            {member.status === 'Active' ? 'Restrict' : 'Authorize'}
                                        </button>
                                        {isSuperAdmin && (
                                            <button 
                                                onClick={() => openConfirm(
                                                    "Promote to Admin?",
                                                    `Do you want to grant ${member.firstName} administrative access?`,
                                                    () => handlePromoteToAdmin(member.id),
                                                    "primary"
                                                )}
                                                className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-mdPrimary/10 text-mdPrimary hover:bg-mdPrimary hover:text-white transition-all w-full"
                                            >
                                                Promote
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => openConfirm(
                                                "Expunge Record?", 
                                                `This will permanently remove ${member.firstName} from the sanctuary registry. Proceed?`,
                                                () => deleteMember(member.id).then(fetchAllData)
                                            )}
                                            className="p-3 bg-mdSurfaceVariant/30 text-mdOnSurfaceVariant rounded-xl hover:bg-mdError hover:text-white transition-all shadow-sm"
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 3. ANNOUNCEMENTS */}
                {activeTab === 'announcements' && (
                    <div className="space-y-10 animate-fade-in mt-4">
                        <div className="flex justify-between items-center">
                            <h1 className="text-4xl font-black text-mdOnSurface tracking-tighter">Announcements</h1>
                            <button onClick={() => setShowAnnForm(!showAnnForm)} className="btn-premium">
                                <FontAwesomeIcon icon={showAnnForm ? faTimes : faPlus} />
                                {showAnnForm ? 'Cancel' : 'Post New'}
                            </button>
                        </div>

                        {showAnnForm && (
                            <div className="glass-card p-10 animate-slide-up border-l-8 border-l-mdPrimary">
                                <form onSubmit={handleAnnouncementSubmit} className="space-y-6">
                                    <input type="text" placeholder="Headline" className="w-full p-4 bg-mdSurfaceVariant/20 border-none rounded-2xl focus:ring-2 focus:ring-mdPrimary font-bold" value={annForm.title} onChange={e => setAnnForm({...annForm, title: e.target.value})} required />
                                    <textarea placeholder="The message..." className="w-full p-4 bg-mdSurfaceVariant/20 border-none rounded-2xl focus:ring-2 focus:ring-mdPrimary font-medium h-40" value={annForm.message} onChange={e => setAnnForm({...annForm, message: e.target.value})} required />
                                    <button type="submit" disabled={formLoading} className="btn-premium w-full sm:w-max">{formLoading ? 'Publishing...' : 'Release Post'}</button>
                                </form>
                            </div>
                        )}
                        <Announcements embedded={true} branchId={selectedBranchId} />
                    </div>
                )}

                {/* 4. EVENTS */}
                {activeTab === 'events' && (
                    <div className="space-y-10 animate-fade-in mt-4">
                        <div className="flex justify-between items-center">
                            <h1 className="text-4xl font-black text-mdOnSurface tracking-tighter">Events</h1>
                            <button onClick={() => setShowEventForm(!showEventForm)} className="btn-premium">
                                <FontAwesomeIcon icon={showEventForm ? faTimes : faPlus} />
                                {showEventForm ? 'Cancel' : 'Schedule New'}
                            </button>
                        </div>

                        {showEventForm && (
                            <div className="glass-card p-10 animate-slide-up border-l-8 border-l-mdSecondary">
                                <form onSubmit={handleEventSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <input type="text" placeholder="Event Name" className="w-full p-4 bg-mdSurfaceVariant/20 border-none rounded-2xl md:col-span-2 font-bold" value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} required />
                                    <textarea placeholder="Description" className="w-full p-4 bg-mdSurfaceVariant/20 border-none rounded-2xl md:col-span-2 font-medium h-32" value={eventForm.description} onChange={e => setEventForm({...eventForm, description: e.target.value})} required />
                                    <input type="datetime-local" className="w-full p-4 bg-mdSurfaceVariant/20 border-none rounded-2xl" value={eventForm.startDate} onChange={e => setEventForm({...eventForm, startDate: e.target.value})} required />
                                    <input type="text" placeholder="Venue" className="w-full p-4 bg-mdSurfaceVariant/20 border-none rounded-2xl" value={eventForm.location} onChange={e => setEventForm({...eventForm, location: e.target.value})} required />
                                    <button type="submit" disabled={formLoading} className="btn-premium sm:w-max">{formLoading ? 'Scheduling...' : 'Save Event'}</button>
                                </form>
                            </div>
                        )}
                        <Events embedded={true} branchId={selectedBranchId} />
                    </div>
                )}

                {/* 5. SERMONS */}
                {activeTab === 'sermons' && (
                    <div className="space-y-10 animate-fade-in mt-4">
                        <div className="flex justify-between items-center">
                            <h1 className="text-4xl font-black text-mdOnSurface tracking-tighter">Sermon Library</h1>
                            <button onClick={() => setShowSermonForm(!showSermonForm)} className="btn-premium">
                                <FontAwesomeIcon icon={showSermonForm ? faTimes : faPlus} />
                                {showSermonForm ? 'Cancel' : 'Upload Message'}
                            </button>
                        </div>

                        {showSermonForm && (
                            <div className="glass-card p-10 animate-slide-up border-l-8 border-l-purple-500">
                                <form onSubmit={handleSermonSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <input type="text" placeholder="Sermon Title" className="w-full p-4 bg-mdSurfaceVariant/20 border-none rounded-2xl md:col-span-2 font-bold" value={sermonForm.title} onChange={e => setSermonForm({...sermonForm, title: e.target.value})} required />
                                    <input type="text" placeholder="Speaker" className="w-full p-4 bg-mdSurfaceVariant/20 border-none rounded-2xl md:col-span-2 font-bold" value={sermonForm.preacherName} onChange={e => setSermonForm({...sermonForm, preacherName: e.target.value})} required />
                                    <textarea placeholder="Message highlight..." className="w-full p-4 bg-mdSurfaceVariant/20 border-none rounded-2xl md:col-span-2 font-medium h-32" value={sermonForm.description} onChange={e => setSermonForm({...sermonForm, description: e.target.value})} required />
                                    <button type="submit" disabled={formLoading} className="btn-premium sm:w-max">{formLoading ? 'Publishing...' : 'Add to Library'}</button>
                                </form>
                            </div>
                        )}
                        <Sermons embedded={true} branchId={selectedBranchId} />
                    </div>
                )}

                {/* 5.5 CHAT */}
                {activeTab === 'chat' && (
                    <div className="space-y-10 animate-fade-in mt-4">
                        <Chat />
                    </div>
                )}

                {/* 6. PRAYER REQUESTS */}
                {activeTab === 'prayer-requests' && (
                    <div className="space-y-10 animate-fade-in mt-4">
                        <h1 className="text-4xl font-black text-mdOnSurface tracking-tighter">Prayer Requests</h1>
                        <div className="grid gap-6">
                            {prayerRequests.map(pr => (
                                <div key={pr.id} className="glass-card p-8 flex flex-col md:flex-row justify-between items-start gap-6 border-l-4 border-l-mdPrimary">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            <h4 className="text-2xl font-black text-mdOnSurface">{pr.isAnonymous ? 'Restricted Identity' : pr.requesterName}</h4>
                                            <span className="px-3 py-1 rounded-full bg-mdPrimary/10 text-mdPrimary text-[10px] font-black uppercase tracking-widest">{pr.status}</span>
                                        </div>
                                        <p className="text-mdOnSurfaceVariant font-medium text-lg italic leading-relaxed">"{pr.requestText}"</p>
                                        <div className="mt-6 flex items-center gap-4 text-[10px] font-black text-mdOutline uppercase tracking-widest">
                                            <span>Received {new Date(pr.createdAt).toLocaleDateString()}</span>
                                            {!pr.isAnonymous && <span>• {pr.requesterEmail}</span>}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {pr.status !== 'Answered' && (
                                            <button onClick={() => updatePrayerRequestStatus(pr.id, 'Answered').then(fetchAllData)} className="p-4 bg-green-500/10 text-green-600 rounded-2xl hover:bg-green-500 hover:text-white transition-all">
                                                <FontAwesomeIcon icon={faCheck} />
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => openConfirm(
                                                "Archive Prayer?", 
                                                "This prayer request will be permanently removed from the dashboard. Proceed?",
                                                () => deletePrayerRequest(pr.id).then(fetchAllData)
                                            )}
                                            className="p-4 bg-mdError/10 text-mdError rounded-2xl hover:bg-mdError hover:text-white transition-all"
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 7. ADMINS */}
                {isSuperAdmin && activeTab === 'admins' && (
                    <div className="space-y-10 animate-fade-in mt-4">
                        <div className="flex justify-between items-center">
                            <h1 className="text-4xl font-black text-mdOnSurface tracking-tighter">System Staff</h1>
                            <button onClick={() => setShowAdminForm(!showAdminForm)} className="btn-premium">
                                <FontAwesomeIcon icon={showAdminForm ? faTimes : faPlus} />
                                {showAdminForm ? 'Revoke Form' : 'Authorize Admin'}
                            </button>
                        </div>

                        {showAdminForm && (
                            <div className="glass-card p-10 animate-slide-up border-l-8 border-l-mdOnSurface">
                                <form onSubmit={handleAdminSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <input type="text" placeholder="Full Name" className="w-full p-4 bg-mdSurfaceVariant/20 border-none rounded-2xl font-bold" value={adminForm.name} onChange={e => setAdminForm({...adminForm, name: e.target.value})} required />
                                    <input type="email" placeholder="Official Email" className="w-full p-4 bg-mdSurfaceVariant/20 border-none rounded-2xl font-bold" value={adminForm.email} onChange={e => setAdminForm({...adminForm, email: e.target.value})} required />
                                    <input type="password" placeholder="Temp Password" className="w-full p-4 bg-mdSurfaceVariant/20 border-none rounded-2xl font-bold" value={adminForm.password} onChange={e => setAdminForm({...adminForm, password: e.target.value})} required />
                                    <select 
                                        className="w-full p-4 bg-mdSurfaceVariant/20 border-none rounded-2xl font-bold" 
                                        value={adminForm.branchId || ''} 
                                        onChange={e => setAdminForm({...adminForm, branchId: e.target.value ? parseInt(e.target.value) : null})}
                                    >
                                        <option value="">Full Site (Super-Admin)</option>
                                        {branches.map(b => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </select>
                                    <button type="submit" disabled={formLoading} className="btn-premium md:col-span-4">{formLoading ? 'Authorizing...' : 'Create Staff Account'}</button>
                                </form>
                            </div>
                        )}

                        <div className="glass-card overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-mdSurfaceVariant/20 text-[10px] font-black uppercase tracking-widest text-mdOutline">
                                    <tr>
                                        <th className="p-6">Administrator</th>
                                        <th className="p-6">Credentials</th>
                                        <th className="p-6">Branch</th>
                                        <th className="p-6">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-mdOutline/5">
                                    {admins.map(adm => (
                                        <tr key={adm.id} className="hover:bg-mdPrimary/5 transition-colors">
                                            <td className="p-6 font-black text-mdOnSurface">{adm.name}</td>
                                            <td className="p-6 font-medium text-mdOnSurfaceVariant">{adm.email}</td>
                                            <td className="p-6">
                                                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${adm.branchId ? 'bg-mdSecondary/10 text-mdSecondary' : 'bg-mdPrimary/10 text-mdPrimary'}`}>
                                                    {adm.branchId ? (branches.find(b => b.id === adm.branchId)?.name || 'Branch Office') : 'Super Admin'}
                                                </span>
                                            </td>
                                            <td className="p-6">
                                                {adm.email !== 'benjaminbuckmanjunior@gmail.com' && adm.id !== adminId && (
                                                    <button 
                                                        onClick={() => openConfirm("Revoke Access?", `Remove ${adm.name} from the staff?`, () => deleteAdmin(adm.id).then(fetchAllData))}
                                                        className="text-mdError hover:scale-110 transition-all"
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 7.5 BRANCH MANAGEMENT */}
                {isSuperAdmin && activeTab === 'branch-management' && (
                    <div className="space-y-10 animate-fade-in mt-4">
                        <div className="flex justify-between items-center">
                            <h1 className="text-4xl font-black text-mdOnSurface tracking-tighter">Branch Network</h1>
                        </div>

                        <div className="glass-card p-10 border-l-8 border-l-emerald-500">
                            <form onSubmit={handleBranchSubmit} className="flex flex-col md:flex-row gap-6">
                                <input name="branchName" type="text" placeholder="Branch Name (e.g. Accra Central)" className="flex-1 p-4 bg-mdSurfaceVariant/20 border-none rounded-2xl font-bold" required />
                                <button type="submit" disabled={formLoading} className="btn-premium whitespace-nowrap">{formLoading ? 'Establishing...' : 'Establish Branch'}</button>
                            </form>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {branches.map(branch => (
                                <div key={branch.id} className="glass-card p-8 group relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>
                                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-xl mb-4">
                                        <FontAwesomeIcon icon={faBuilding} />
                                    </div>
                                    <h4 className="text-xl font-black text-mdOnSurface mb-1">{branch.name}</h4>
                                    <p className="text-[10px] font-black text-mdOnSurfaceVariant uppercase tracking-widest mb-6">Established Territory</p>
                                    
                                    <div className="pt-6 border-t border-mdOutline/10 flex justify-between items-center">
                                        <span className="text-sm font-bold text-mdPrimary">Active Branch</span>
                                        <button 
                                            onClick={() => { setSelectedBranchId(branch.id); setActiveTab('members'); }}
                                            className="text-xs font-black uppercase tracking-widest text-mdOnSurfaceVariant hover:text-mdPrimary transition-colors"
                                        >
                                            View Assets
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 8. PROFILE */}
                {activeTab === 'profile' && (
                    <div className="animate-fade-in mt-4">
                        <AdminProfile />
                    </div>
                )}

                {/* 9. PASSWORD */}
                {activeTab === 'password' && (
                    <div className="animate-fade-in mt-4">
                        <ChangePassword userType="admin" userId={adminId} />
                    </div>
                )}
            </div>

            {/* Alert Center */}
            {alertDialog && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                    <div className="glass-card p-10 max-w-sm w-full animate-slide-up text-center">
                        <div className={`w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center text-2xl ${alertDialog.isError ? 'bg-mdError/20 text-mdError' : 'bg-mdPrimary/20 text-mdPrimary'}`}>
                            <FontAwesomeIcon icon={alertDialog.isError ? faTimes : faCheck} />
                        </div>
                        <h3 className="text-2xl font-black text-mdOnSurface mb-2">{alertDialog.title}</h3>
                        <p className="text-mdOnSurfaceVariant mb-8 font-medium">{alertDialog.message}</p>
                        <button onClick={() => setAlertDialog(null)} className="w-full py-4 rounded-full font-black bg-mdSurfaceVariant/20 text-mdOnSurface">Dismiss</button>
                    </div>
                </div>
            )}
            {/* Deletion Confirmation Modal */}
            <ConfirmModal 
                isOpen={confirmModal.isOpen}
                onClose={closeConfirm}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
            />
        </div>
    );
}
