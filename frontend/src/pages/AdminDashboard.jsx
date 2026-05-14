import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUsers, faBullhorn, faCalendarAlt, faMicrophone, faFileExcel, 
    faTrash, faPhone, faEnvelope, faMapMarkerAlt, faVideo, 
    faPlus, faHome, faPrayingHands, faCheckCircle, faUserShield, 
    faUser, faSearch, faUserPlus, faBell, faCheck, faCheckDouble,
    faExclamationTriangle, faSignOutAlt, faBuilding, faCamera,
    faPlay, faLink, faFileUpload, faTimes, faImages, faIdCard, faEnvelopeOpenText, faChartPie,
    faHistory, faFileDownload, faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import ImageCropperModal from '../components/ImageCropperModal';
import { useToast } from '../context/ToastContext';

import { 
    getAdminProfile, getCounts, toggleMemberStatus, deleteAdmin,
    getBranches, createBranch, deleteBranch, getMembers, getAnnouncements,
    getEvents, getSermons, getAdmins, getNotifications,
    getPrayerRequests, updatePrayerRequestStatus, deletePrayerRequest,
    deleteMember, createAnnouncement, createEvent, createSermon,
    createAdmin, promoteMemberToAdmin, assignBranch,
    uploadProfilePicture, deleteProfilePicture,
    uploadAnnouncementFile, uploadSermonFile, uploadEventDocument
} from '../services/api';

import MediaPreview from '../components/MediaPreview';
import Lightbox from '../components/Lightbox';

import Announcements from './Announcements';
import Events from './Events';
import Sermons from './Sermons';
import AdminProfile from './AdminProfile';
import MemberProfile from './MemberProfile';
import Gallery from './Gallery';
import ChangePassword from '../components/ChangePassword';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import CelebrationsWidget from '../components/CelebrationsWidget';
// Chat removed in favor of WhatsApp support
import { downloadMembersAsExcel } from '../services/excelExport';
import ConfirmModal from '../components/ConfirmModal';
import AttendanceManager from '../components/AttendanceManager';
import MessageCenter from '../components/MessageCenter';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { theme } = useTheme();

    // -- State --
    const [activeTab, setActiveTabInternal] = useState(() => sessionStorage.getItem('adminActiveTab') || 'home');
    const [loading, setLoading] = useState(true);
    
    // Profile Picture State
    const [selectedImage, setSelectedImage] = useState(null);
    const [showCropper, setShowCropper] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const { showToast } = useToast();
    
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
    const [adminData, setAdminData] = useState(null);
    const [inspectionBranchId, setInspectionBranchId] = useState(() => {
        const stored = sessionStorage.getItem('inspectionBranchId');
        return stored ? parseInt(stored) : null;
    });
    const [inspectionBranchName, setInspectionBranchName] = useState(() => sessionStorage.getItem('inspectionBranchName') || '');

    // Form States
    const [updatesSubTab, setUpdatesSubTab] = useState('announcements');
    const [showAnnForm, setShowAnnForm] = useState(false);
    const [annForm, setAnnForm] = useState({ title: '', message: '', fileUrl: '', isGlobal: false });
    const [annFile, setAnnFile] = useState(null);
    const [showEventForm, setShowEventForm] = useState(false);
    const [eventForm, setEventForm] = useState({ title: '', description: '', startDate: '', endDate: '', location: '', documentFileUrl: '', isGlobal: false });
    const [eventFile, setEventFile] = useState(null);
    const [showSermonForm, setShowSermonForm] = useState(false);
    const [sermonForm, setSermonForm] = useState({ 
        title: '', preacherName: '', description: '', 
        videoUrl: '', audioUrl: '', sourceType: 'file', isGlobal: false 
    });
    const [sermonFile, setSermonFile] = useState(null);
    const [showAdminForm, setShowAdminForm] = useState(false);
    const [adminForm, setAdminForm] = useState({ name: '', email: '', password: '', branchId: '', role: 'BRANCH_ADMIN' });
    const [showMediaTeamForm, setShowMediaTeamForm] = useState(false);
    const [mediaTeamForm, setMediaTeamForm] = useState({ name: '', email: '', password: '' });
    const [formLoading, setFormLoading] = useState(false);
    
    // Member Management States
    const [promotingMember, setPromotingMember] = useState(null);
    const [promotionBranchId, setPromotionBranchId] = useState('');
    const [targetBranchId, setTargetBranchId] = useState('');
    const [assigningBranchMember, setAssigningBranchMember] = useState(null);
    const [alertDialog, setAlertDialog] = useState(null);
    const [auditLogs, setAuditLogs] = useState([]);
    const [isFetchingAudit, setIsFetchingAudit] = useState(false);
    const [auditLimit, setAuditLimit] = useState(100);
    const [lightboxImg, setLightboxImg] = useState(null);
    const [viewingMember, setViewingMember] = useState(null);
    const [latestAttendance, setLatestAttendance] = useState(null);

    // Derived State
    const storedBranchId = sessionStorage.getItem('branchId');
    const effectiveRole = adminData?.role || sessionStorage.getItem('role');
    const isActuallySuperAdmin = effectiveRole === 'SUPER_ADMIN' || adminEmail === 'benjaminbuckmanjunior@gmail.com';
    const isReadOnly = inspectionBranchId !== null;
    
    // Role-specific flags
    const isSecretary = effectiveRole === 'SUPER_SECRETARY' || effectiveRole === 'BRANCH_SECRETARY';
    const isMediaTeam = effectiveRole === 'SUPER_MEDIA' || effectiveRole === 'BRANCH_MEDIA' || effectiveRole === 'MEDIA_TEAM';
    const isAnyAdmin = effectiveRole === 'SUPER_ADMIN' || effectiveRole === 'BRANCH_ADMIN';
    const isDistrictOfficial = effectiveRole?.startsWith('SUPER_');
    const isBranchOfficial = effectiveRole?.startsWith('BRANCH_');

    const currentBranchIdForData = inspectionBranchId || (isActuallySuperAdmin ? selectedBranchId : (adminData?.branchId || storedBranchId));

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

    // Restrict Media Team to Gallery, Profile, and Password tabs only
    useEffect(() => {
        if (isMediaTeam && !['gallery', 'profile', 'password'].includes(activeTab)) {
            setActiveTab('gallery');
        }
    }, [isMediaTeam, activeTab]);

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
        // Sanitize branchId to prevent 'undefined' string in URL
        const branchId = currentBranchIdForData === undefined ? null : currentBranchIdForData;
        
        try {
            const results = await Promise.allSettled([
                getMembers(branchId), 
                getAnnouncements(branchId), 
                getEvents(branchId), 
                getSermons(branchId), 
                getPrayerRequests(branchId),
                getCounts(branchId), 
                getAdmins(branchId),
                getBranches()
            ]);

            const [mem, ann, eve, ser, pra, cou, adm, bra] = results;

            if (mem.status === 'fulfilled') {
                const data = mem.value.data;
                setMembers(Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []));
            }
            if (ann.status === 'fulfilled') {
                const data = ann.value.data;
                setAnnouncements(Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []));
            }
            if (eve.status === 'fulfilled') {
                const data = eve.value.data;
                setEvents(Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []));
            }
            if (ser.status === 'fulfilled') {
                const data = ser.value.data;
                setSermons(Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []));
            }
            if (pra.status === 'fulfilled') {
                const data = pra.value.data;
                setPrayerRequests(Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []));
            }
            if (cou.status === 'fulfilled') {
                setCounts(cou.value.data.data || cou.value.data || { members: 0, announcements: 0, events: 0, sermons: 0, prayerRequests: 0 });
            }
            if (adm.status === 'fulfilled') {
                const data = adm.value.data;
                setAdmins(Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []));
            }
            if (bra.status === 'fulfilled') {
                const data = bra.value.data;
                setBranches(Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []));
            }

            // Log any failures to console for easier debugging
            results.forEach((res, i) => {
                if (res.status === 'rejected') {
                    const endpoints = ["Members", "Announcements", "Events", "Sermons", "PrayerRequests", "Counts", "Admins", "Branches"];
                    console.error(`Failed to load ${endpoints[i]}:`, res.reason);
                }
            });

        } catch (err) {
            console.error("Dashboard Data Load Error:", err);
        } finally {
            setLoading(false);
        }
    }, [currentBranchIdForData]);

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setSelectedImage(reader.result);
                setShowCropper(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCropComplete = async (croppedFile) => {
        setShowCropper(false);
        setIsUploading(true);
        
        const formData = new FormData();
        formData.append('file', croppedFile);
        formData.append('userId', adminId);
        formData.append('userType', 'admin');

        try {
            const response = await uploadProfilePicture(formData);
            if (response.data.success) {
                showToast("Identity portrait updated in the assembly.", "success");
                setAdminData(prev => ({
                    ...prev,
                    profilePictureUrl: response.data.profilePictureUrl
                }));
                sessionStorage.setItem('profilePictureUrl', response.data.profilePictureUrl);
                // Trigger global update (Navbar, etc)
                window.dispatchEvent(new Event('storage'));
            } else {
                showToast(response.data.message || "Failed to sync portrait.", "error");
            }
        } catch (err) {
            console.error("Upload error:", err);
            showToast("Server refused portrait sync.", "error");
        } finally {
            setIsUploading(false);
            setSelectedImage(null);
        }
    };

    const handleDeleteProfilePicture = async () => {
        if (!window.confirm("Are you sure you want to remove your assembly portrait?")) return;

        setIsUploading(true);
        try {
            const response = await deleteProfilePicture(adminId, 'admin');
            if (response.data.success) {
                showToast(response.data.message, "success");
                setAdminData(prev => ({
                    ...prev,
                    profilePictureUrl: null
                }));
                sessionStorage.removeItem('profilePictureUrl');
                window.dispatchEvent(new Event('storage'));
            } else {
                showToast(response.data.message || "Failed to remove portrait.", "error");
            }
        } catch (err) {
            console.error("Delete error:", err);
            showToast("Server refused portrait removal.", "error");
        } finally {
            setIsUploading(false);
        }
    };

    const fetchNotifications = async () => {
        try {
            const res = await getNotifications(adminId, 'ADMIN');
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
            }
        } catch (err) {
            console.error("Profile Fetch Error:", err);
        }
    }, [adminId]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const fetchAuditLogs = useCallback(async () => {
        if (!isActuallySuperAdmin || !adminId) return;
        setIsFetchingAudit(true);
        try {
            const res = await fetch(`/api/audit?adminId=${adminId}&limit=${auditLimit}`, {
                headers: { 'Authorization': `Bearer ${sessionStorage.getItem('authToken')}` }
            });
            const data = await res.json();
            if (data.success) {
                setAuditLogs(data.data);
            }
        } catch (err) {
            console.error("Failed to fetch audit logs", err);
        } finally {
            setIsFetchingAudit(false);
        }
    }, [isActuallySuperAdmin, adminId, auditLimit]);

    useEffect(() => {
        if (activeTab === 'audit') {
            fetchAuditLogs();
        }
    }, [activeTab, fetchAuditLogs]);

    useEffect(() => {
        if (!adminId) { navigate('/login'); return; }
        fetchAllData();
        fetchNotifications();
        if (currentBranchIdForData) fetchLatestAttendance();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [adminId, fetchAllData, navigate, currentBranchIdForData]);

    const fetchLatestAttendance = async () => {
        try {
            const res = await fetch(`/api/attendance/branch/${currentBranchIdForData}`);
            const data = await res.json();
            if (data.success && data.data.length > 0) {
                setLatestAttendance(data.data[0]); // Most recent
            }
        } catch (err) { console.error("Stats Fetch Error:", err); }
    };

    // Management Handlers
    const handleAnnouncementSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            let fileUrl = annForm.fileUrl;
            if (annFile) {
                const formData = new FormData();
                formData.append('file', annFile);
                const uploadRes = await uploadAnnouncementFile(formData);
                if (uploadRes.data.success) {
                    fileUrl = uploadRes.data.fileUrl;
                }
            }

            const currentBranchIdForData = annForm.isGlobal ? null : (inspectionBranchId || adminData?.branchId || selectedBranchId);

            const response = await createAnnouncement({ 
                ...annForm, 
                fileUrl,
                createdBy: adminId,
                branchId: currentBranchIdForData 
            });
            if (response.data.success) {
                showToast('Announcement broadcast successfully!', 'success');
                setAnnForm({ title: '', message: '', fileUrl: '', isGlobal: false });
                setAnnFile(null);
                setShowAnnForm(false);
                fetchAllData();
            } else {
                showToast(response.data.message || 'Failed to broadcast announcement.', 'error');
            }
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to broadcast announcement.', 'error');
        } finally {
            setFormLoading(false);
        }
    };

    const handleEventSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            let documentFileUrl = eventForm.documentFileUrl;
            if (eventFile) {
                const formData = new FormData();
                formData.append('file', eventFile);
                const uploadRes = await uploadEventDocument(formData);
                if (uploadRes.data.success) {
                    documentFileUrl = uploadRes.data.fileUrl;
                }
            }

            const currentBranchIdForData = eventForm.isGlobal ? null : (inspectionBranchId || adminData?.branchId || selectedBranchId);

            const response = await createEvent({ 
                ...eventForm, 
                eventDate: eventForm.startDate,
                documentFileUrl,
                createdBy: adminId,
                branchId: currentBranchIdForData 
            });
            if (response.data.success) {
                showToast('Assembly event scheduled!', 'success');
                setEventForm({ title: '', description: '', startDate: '', endDate: '', location: '', documentFileUrl: '', isGlobal: false });
                setEventFile(null);
                setShowEventForm(false);
                fetchAllData();
            } else {
                showToast(response.data.message || 'Failed to schedule event.', 'error');
            }
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to schedule event.', 'error');
        } finally {
            setFormLoading(false);
        }
    };

    const handleSermonSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            let finalVideoUrl = sermonForm.sourceType === 'url' ? sermonForm.videoUrl : '';
            let finalAudioUrl = sermonForm.sourceType === 'url' ? sermonForm.audioUrl : '';

            if (sermonForm.sourceType === 'file' && sermonFile) {
                const formData = new FormData();
                formData.append('file', sermonFile);
                formData.append('title', sermonForm.title);
                formData.append('adminId', adminId);
                
                const uploadRes = await uploadSermonFile(formData);
                if (uploadRes.data.fileUrl) {
                    const url = uploadRes.data.fileUrl;
                    if (url.toLowerCase().endsWith('.mp4')) finalVideoUrl = url;
                    else finalAudioUrl = url;
                }
            }

            const currentBranchIdForData = sermonForm.isGlobal ? null : (inspectionBranchId || adminData?.branchId || selectedBranchId);

            const response = await createSermon({
                title: sermonForm.title,
                speaker: sermonForm.preacherName,
                description: sermonForm.description,
                videoUrl: finalVideoUrl,
                audioUrl: finalAudioUrl,
                uploadedBy: adminId,
                branchId: currentBranchIdForData,
                sermonDate: new Date().toISOString()
            });

            if (response.data.success) {
                showToast('Word added to library!', 'success');
                setSermonForm({ title: '', preacherName: '', description: '', videoUrl: '', audioUrl: '', sourceType: 'file', isGlobal: false });
                setSermonFile(null);
                setShowSermonForm(false);
                fetchAllData();
            } else {
                showToast(response.data.message || 'Failed to publish Word.', 'error');
            }
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to publish Word.', 'error');
        } finally {
            setFormLoading(false);
        }
    };

    const handleAdminSubmit = async (e) => {
        e.preventDefault();
        
        // Enforcement: Must have a branch if not super admin
        if (!adminForm.branchId && branches.length > 0) {
            showToast('Please select a branch for the new administrator.', 'warning');
            return;
        }

        if (branches.length === 0) {
            showToast('Please create at least one branch before authorizing new staff.', 'warning');
            return;
        }

        setFormLoading(true);
        try {
            await createAdmin({ ...adminForm, createdBy: adminId });
            showToast('New administrator has been granted access.', 'success');
            setAdminForm({ name: '', email: '', password: '', branchId: '', role: 'BRANCH_ADMIN' });
            setShowAdminForm(false);
            fetchAllData();
        } catch (err) { showToast('Creation failed.', 'error'); }
        finally { setFormLoading(false); }
    };

    const handleMediaTeamSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            const branchAdminBranchId = adminData?.branchId || storedBranchId;
            await createAdmin({ ...mediaTeamForm, role: 'MEDIA_TEAM', branchId: branchAdminBranchId, createdBy: adminId });
            showToast('Media team member added!', 'success');
            setMediaTeamForm({ name: '', email: '', password: '' });
            setShowMediaTeamForm(false);
            fetchAllData();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to create media team account.', 'error');
        } finally { setFormLoading(false); }
    };

    const handlePromoteToAdmin = async (memberId) => {
        if (!promotionBranchId) {
            showToast('Please select a branch for this administrator.', 'warning');
            return;
        }

        setFormLoading(true);
        try {
            await promoteMemberToAdmin(memberId, { 
                createdBy: adminId,
                branchId: parseInt(promotionBranchId)
            });
            showToast('Member has been promoted to administrator.', 'success');
            setPromotingMember(null);
            setPromotionBranchId('');
            fetchAllData();
        } catch (err) {
            showToast(err.response?.data?.message || 'Promotion failed.', 'error');
        } finally {
            setFormLoading(false);
        }
    };

    const handleAssignBranch = async (memberId) => {
        if (!targetBranchId) {
            showToast('Please select a branch.', 'warning');
            return;
        }

        setFormLoading(true);
        try {
            await assignBranch(memberId, parseInt(targetBranchId));
            showToast('Member branch has been updated.', 'success');
            setAssigningBranchMember(null);
            setTargetBranchId('');
            fetchAllData();
        } catch (err) {
            showToast('Branch assignment failed.', 'error');
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
            showToast(`Branch "${branchName}" has been established.`, 'success');
            e.target.reset();
            fetchAllData();
        } catch (err) {
            showToast('Could not establish branch.', 'error');
        } finally {
            setFormLoading(false);
        }
    };

    const groupedMembers = useMemo(() => {
        const filtered = members.filter(m => (m.name || `${m.firstName || ''} ${m.lastName || ''}`).toLowerCase().includes(memberSearchQuery.toLowerCase()));
        
        if (!isActuallySuperAdmin || selectedBranchId || inspectionBranchId) {
            return { "Congregation": filtered };
        }
        
        const groups = {};
        filtered.forEach(m => {
            const branchName = branches.find(b => b.id === m.branchId)?.name || 'Central / No Branch';
            if (!groups[branchName]) groups[branchName] = [];
            groups[branchName].push(m);
        });
        return groups;
    }, [members, memberSearchQuery, isActuallySuperAdmin, selectedBranchId, inspectionBranchId, branches]);

    const enterInspection = (branchId, branchName) => {
        sessionStorage.setItem('inspectionBranchId', branchId);
        sessionStorage.setItem('inspectionBranchName', branchName);
        setInspectionBranchId(branchId);
        setInspectionBranchName(branchName);
        setActiveTab('home');
        showToast(`Viewing ${branchName} in inspection mode.`, 'info');
        window.location.reload(); // Force full Layout redraw to hide Commander tabs
    };

    const exitInspection = () => {
        sessionStorage.removeItem('inspectionBranchId');
        sessionStorage.removeItem('inspectionBranchName');
        setInspectionBranchId(null);
        setInspectionBranchName('');
        showToast('Exited inspection mode.', 'info');
        window.location.reload(); // Restore full Layout access
    };

    const MetricCard = ({ label, count, icon, color }) => (
        <div className="glass-card p-10 group hover:scale-[1.02] transition-all duration-700 border-none rounded-[3rem]">
            <div className="flex justify-between items-start mb-6">
                <div className={`w-16 h-16 rounded-[1.5rem] bg-mdSurfaceVariant/30 flex items-center justify-center text-3xl ${color} shadow-sm group-hover:scale-110 transition-transform duration-700`}>
                    <FontAwesomeIcon icon={icon} />
                </div>
                <span className="text-[10px] font-black opacity-30 uppercase tracking-[0.3em]">Universal</span>
            </div>
            <div className="text-4xl font-black text-mdOnSurface mb-1 flex items-baseline gap-2 leading-none">
                {count}
            </div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 text-mdPrimary">
                {label} Archive
            </div>
        </div>
    );

    const QuickAction = ({ label, icon, tab, desc }) => (
        <button 
            onClick={() => setActiveTab(tab)}
            className="group p-8 rounded-[2.5rem] bg-mdSurfaceVariant/20 hover:bg-white hover:shadow-premium transition-all duration-700 text-left border border-transparent hover:border-mdPrimary/5"
        >
            <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-mdPrimary text-white flex items-center justify-center text-xl shadow-premium group-hover:scale-110 transition-transform duration-700">
                    <FontAwesomeIcon icon={icon} />
                </div>
                <div>
                    <h4 className="font-black text-mdOnSurface text-lg leading-tight uppercase tracking-tight">{label}</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-50 text-mdPrimary mt-1">{desc}</p>
                </div>
            </div>
        </button>
    );

    return (
        <div className="animate-fade-in pb-24 max-w-[1600px] mx-auto px-4 md:px-0">

            
            <header className="mb-12 mt-4 px-4 md:px-0 animate-slide-up">
                {isReadOnly && (
                    <div className="mb-8 p-4 bg-mdPrimary/10 border border-mdPrimary rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 animate-pulse-slow">
                        <div className="flex items-center gap-4 text-mdPrimary">
                            <div className="w-12 h-12 bg-mdPrimary text-white rounded-full flex items-center justify-center text-xl shadow-md1">
                                <FontAwesomeIcon icon={faSearch} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black uppercase tracking-tighter">Inspection Mode Active</h3>
                                <p className="text-xs font-bold opacity-80 uppercase tracking-widest">Viewing {inspectionBranchName} Dashboard (Read-Only)</p>
                            </div>
                        </div>
                        <button 
                            onClick={exitInspection}
                            className="px-6 py-2 bg-mdPrimary text-white rounded-full font-black text-xs hover:bg-mdSecondary transition-all flex items-center gap-2"
                        >
                            <FontAwesomeIcon icon={faSignOutAlt} />
                            EXIT INSPECTION
                        </button>
                    </div>
                )}
                <div className="relative group inline-block">
                    <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-mdPrimary rounded-full scale-y-100 transition-transform duration-700 origin-center hidden md:block"></div>
                    <h1 className="text-5xl md:text-7xl font-black text-mdOnSurface tracking-tighter mb-2">
                        COP Ayikai Doblo
                    </h1>
                    <p className="text-mdOnSurfaceVariant font-bold text-lg opacity-80 flex items-center gap-3">
                        <span className="w-8 h-px bg-mdPrimary/30"></span>
                        Peace be with you, <span className="text-mdPrimary font-black">{adminName}</span>.
                        {adminData?.branchId && <span className="text-xs bg-mdSecondary/10 text-mdSecondary px-2 py-0.5 rounded-lg">Admin: {branches.find(b => b.id === adminData.branchId)?.name}</span>}
                        {isActuallySuperAdmin && !isReadOnly && <span className="text-xs bg-mdPrimary/10 text-mdPrimary px-2 py-0.5 rounded-lg">SUPER ADMIN</span>}
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
                            <button onClick={() => { setActiveTab('updates'); setUpdatesSubTab('events'); }} className="w-full text-left">
                                <MetricCard label="Events" count={counts.events} icon={faCalendarAlt} color="text-mdSecondary" />
                            </button>
                            <button onClick={() => { setActiveTab('updates'); setUpdatesSubTab('announcements'); }} className="w-full text-left">
                                <MetricCard label="Broadcasts" count={counts.announcements} icon={faBullhorn} color="text-amber-500" />
                            </button>
                            <button onClick={() => setActiveTab('gallery')} className="w-full text-left">
                                <MetricCard label="Gallery" count={counts.sermons} icon={faImages} color="text-pink-500" />
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
                                    Assembly Actions
                                </h3>
                                {(!isActuallySuperAdmin || isReadOnly) ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {(isAnyAdmin || isSecretary) && <QuickAction label="Post Insight" icon={faBullhorn} tab="updates" desc="Broadcast to Assembly" />}
                                        {(isAnyAdmin || isMediaTeam) && <QuickAction label="Upload Media" icon={faImages} tab="gallery" desc="Photos & Sermons" />}
                                        {(isBranchOfficial && isSecretary) && <QuickAction label="Sunday Stats" icon={faCalendarAlt} tab="attendance" desc="Fill Attendance Form" />}
                                        <QuickAction label="Registry" icon={faUsers} tab="members" desc="View Directory" />
                                        {isAnyAdmin && <QuickAction label="Analytics" icon={faChartPie} tab="analytics" desc="View Demographics" />}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <QuickAction label="Manage Staff" icon={faUserShield} tab="admins" desc="Oversee Officials" />
                                        <QuickAction label="Branches" icon={faBuilding} tab="branch-management" desc="Network Oversight" />
                                        <QuickAction label="Congregation" icon={faUsers} tab="members" desc="Universal Registry" />
                                        <QuickAction label="Analytics" icon={faChartPie} tab="analytics" desc="Visual Demographics" />
                                        <QuickAction label="Dispatches" icon={faEnvelopeOpenText} tab="messages" desc="Official Communication" />
                                        <QuickAction label="System Logs" icon={faHistory} tab="audit" desc="Audit Trail Monitoring" />
                                    </div>
                                )}
                            </div>
                            
                            <div className="relative h-[400px] rounded-[3rem] overflow-hidden shadow-premium bg-gradient-to-br from-mdPrimary to-mdTertiary group mb-12">
                                <div className="relative z-10 h-full p-12 flex flex-col justify-center text-white">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 rounded-2xl bg-mdPrimary/20 backdrop-blur-md flex items-center justify-center text-white border border-white/10">
                                            <FontAwesomeIcon icon={faUserShield} className="text-xl" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-70">Assembly Command Center</span>
                                    </div>
                                    <h3 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter">System Oversight</h3>
                                    <div className="flex items-center gap-6 pt-6 border-t border-white/10 mt-6 max-w-md">
                                        <div className="relative group/avatar">
                                            <div className="w-16 h-16 rounded-2xl border-2 border-white/20 overflow-hidden bg-mdSurface shadow-premium">
                                                {adminData?.profilePictureUrl ? (
                                                    <img 
                                                        src={adminData.profilePictureUrl} 
                                                        alt="Profile" 
                                                        className="w-full h-full object-cover cursor-zoom-in hover:scale-105 transition-transform"
                                                        onClick={() => setLightboxImg(adminData.profilePictureUrl)}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xl font-black text-mdPrimary bg-mdPrimary/5">
                                                        {adminName?.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Camera Overlay for Quick Upload */}
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center cursor-pointer rounded-2xl text-white">
                                                <label className="flex flex-col items-center justify-center cursor-pointer p-2 hover:text-mdPrimary transition-colors">
                                                    <FontAwesomeIcon icon={faCamera} className="text-sm mb-1" />
                                                    <span className="text-[6px] font-black uppercase tracking-widest">Update</span>
                                                    <input 
                                                        type="file" 
                                                        className="hidden" 
                                                        accept="image/*" 
                                                        onChange={handleImageSelect}
                                                        disabled={isUploading}
                                                    />
                                                </label>
                                                
                                                {adminData?.profilePictureUrl && (
                                                    <button 
                                                        onClick={handleDeleteProfilePicture}
                                                        disabled={isUploading}
                                                        className="flex flex-col items-center justify-center p-2 hover:text-mdError transition-colors"
                                                        title="Remove Portrait"
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} className="text-sm mb-1" />
                                                        <span className="text-[6px] font-black uppercase tracking-widest">Remove</span>
                                                    </button>
                                                )}
                                            </div>

                                            {isUploading && (
                                                <div className="absolute inset-0 bg-mdPrimary/20 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">Authenticated As</p>
                                            <p className="font-black text-lg text-mdSecondary leading-none">{adminName}</p>
                                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
                                                {isActuallySuperAdmin ? 'Super Administrator' : 'Branch Administrator'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="lg:col-span-1 glass-card p-10 rounded-[3rem] border-none flex flex-col justify-between h-[400px]">
                                <div>
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-xl font-black text-mdPrimary uppercase tracking-tighter italic">Assembly Pulse</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 bg-mdSecondary rounded-full pulse-gold"></span>
                                            <span className="text-[10px] font-black opacity-50 uppercase tracking-widest">Live Integration</span>
                                        </div>
                                    </div>
                                    
                                    {latestAttendance ? (
                                        <div className="space-y-4 animate-fade-in">
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Last Sunday Report</p>
                                            <div className="p-4 bg-mdPrimary/5 rounded-2xl border border-mdPrimary/10">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-xs font-bold text-mdOnSurfaceVariant">Total Souls</span>
                                                    <span className="text-lg font-black text-mdPrimary">{Number(latestAttendance.menCount) + Number(latestAttendance.womenCount) + Number(latestAttendance.childrenCount)}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-bold text-mdOnSurfaceVariant">Officers</span>
                                                    <span className="text-lg font-black text-mdSecondary">{latestAttendance.totalOfficers}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 pt-2 text-[10px] font-black text-emerald-600">
                                                <FontAwesomeIcon icon={faIdCard} />
                                                <span>{latestAttendance.visitorsCount} Newcomers Registered</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-sm font-medium text-mdOnSurfaceVariant mb-8 opacity-70">Interactive oversight of assembly growth across all branches.</p>
                                            <div className="relative h-24 w-full mb-6">
                                                <svg viewBox="0 0 100 40" className="w-full h-full drop-shadow-md">
                                                    <defs>
                                                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="0%" stopColor="var(--color-md-secondary)" stopOpacity="0.4" />
                                                            <stop offset="100%" stopColor="var(--color-md-secondary)" stopOpacity="0" />
                                                        </linearGradient>
                                                    </defs>
                                                    <path d="M0,35 Q10,30 20,32 T40,20 T60,25 T80,10 T100,5" fill="none" stroke="var(--color-md-secondary)" strokeWidth="2" strokeLinecap="round" />
                                                    <path d="M0,35 Q10,30 20,32 T40,20 T60,25 T80,10 T100,5 V40 H0 Z" fill="url(#chartGradient)" />
                                                    <circle cx="20" cy="32" r="1.5" fill="var(--color-md-primary)" />
                                                    <circle cx="100" cy="5" r="2" fill="var(--color-md-secondary)" className="animate-pulse" />
                                                </svg>
                                            </div>
                                        </>
                                    )}
                                    
                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-mdOutline/5 mt-auto">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Impact Level</p>
                                            <p className="text-xl font-black text-mdOnSurface">High</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Status</p>
                                            <p className="text-xl font-black text-mdSecondary">Active</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity Feed */}
                        <div className="glass-card p-12 rounded-[3rem] border-none shadow-premium animate-slide-up">
                            <div className="flex items-center justify-between mb-10">
                                <h3 className="text-2xl font-black text-mdOnSurface tracking-tighter italic">Recent Ministry Activity</h3>
                                <button className="text-[10px] font-black text-mdPrimary hover:underline uppercase tracking-widest opacity-70">View Universal Log</button>
                            </div>
                            <div className="space-y-6">
                                {[
                                    { icon: faUserPlus, color: 'bg-green-100 text-green-600', msg: 'New member integration confirmed in East Region', time: '2 mins ago' },
                                    { icon: faVideo, color: 'bg-blue-100 text-blue-600', msg: 'Life-transforming word "The Anointing" uploaded', time: '45 mins ago' },
                                    { icon: faPrayingHands, color: 'bg-purple-100 text-purple-600', msg: 'Branch Prayer Wall: Urgent request from Central Branch', time: '1 hour ago' },
                                    { icon: faCalendarAlt, color: 'bg-amber-100 text-amber-600', msg: 'Assembly Event "Higher Calling" published', time: '3 hours ago' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-5 rounded-3xl bg-mdSurfaceVariant/30 group hover:bg-white transition-all border border-transparent hover:border-mdOutline/10 hover:shadow-sm">
                                        <div className="flex items-center gap-6">
                                            <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center text-lg shadow-sm group-hover:scale-110 transition-transform`}>
                                                <FontAwesomeIcon icon={item.icon} />
                                            </div>
                                            <p className="font-bold text-mdOnSurface text-sm">{item.msg}</p>
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40 bg-mdSurface px-4 py-2 rounded-full whitespace-nowrap">{item.time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {/* 1.5 CELEBRATIONS WIDGET */}
                        <CelebrationsWidget members={members} />
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
                                {(isActuallySuperAdmin && !isReadOnly) && (
                                    <select 
                                        value={selectedBranchId || ''} 
                                        onChange={(e) => setSelectedBranchId(e.target.value ? parseInt(e.target.value) : null)}
                                        className="p-3 bg-mdSurfaceVariant/10 border-none rounded-xl font-bold text-sm text-mdOnSurface focus:ring-2 focus:ring-mdPrimary transition-all"
                                    >
                                        <option value="">All Branches</option>
                                        {branches.map(b => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </select>
                                )}
                                {(!isActuallySuperAdmin && !isReadOnly && branches.length > 0) && (
                                    <div className="p-3 bg-mdSecondary/10 text-mdSecondary border-none rounded-xl font-bold text-sm flex items-center gap-2">
                                        <FontAwesomeIcon icon={faBuilding} className="text-xs" />
                                        {branches.find(b => b.id === adminData?.branchId)?.name || 'Designated Branch'}
                                    </div>
                                )}
                                {isReadOnly && (
                                    <div className="p-3 bg-mdPrimary/10 text-mdPrimary border-none rounded-xl font-bold text-sm flex items-center gap-2">
                                        <FontAwesomeIcon icon={faSearch} className="text-xs" />
                                        Inspecting: {inspectionBranchName}
                                    </div>
                                )}
                                <button 
                                    onClick={() => {
                                        if (downloadMembersAsExcel(members, branches)) {
                                            showToast('Registry exported to Excel!', 'success');
                                        } else {
                                            showToast('Export failed.', 'error');
                                        }
                                    }} 
                                    className="p-3 bg-green-600 text-white rounded-xl shadow-sm hover:scale-105 transition-all text-xs"
                                >
                                    <FontAwesomeIcon icon={faFileExcel} className="mr-2" />
                                    EXPORT
                                </button>
                            </div>
                        </div>

                        <div className="space-y-12">
                            {Object.entries(groupedMembers).map(([branchName, branchMembers]) => (
                                <div key={branchName} className="space-y-6">
                                    {isActuallySuperAdmin && !selectedBranchId && !isReadOnly && (
                                        <h3 className="text-xl font-black text-mdPrimary flex items-center gap-3 bg-mdPrimary/5 p-4 rounded-2xl w-max border border-mdPrimary/10">
                                            <FontAwesomeIcon icon={faBuilding} className="text-sm" />
                                            {branchName}
                                            <span className="text-[10px] bg-mdPrimary text-white px-2 py-0.5 rounded-full">{branchMembers.length}</span>
                                        </h3>
                                    )}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {branchMembers
                                            .sort((a, b) => a.id === adminId ? -1 : b.id === adminId ? 1 : 0)
                                            .map(member => (
                                            <div key={member.id} className={`glass-card group p-8 flex flex-col items-center text-center relative ${member.id === adminId ? 'bg-mdPrimary/5 border-mdPrimary border-2' : ''} ${isReadOnly ? 'opacity-90' : ''}`}>
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
                                                    {!isReadOnly && (
                                                        <div className="flex gap-2">
                                                            <button 
                                                                onClick={() => openConfirm(
                                                                    "Restrict Access?", 
                                                                    `Are you sure you want to ${member.status === 'Active' ? 'Deactivate' : 'Reactivate'} ${member.firstName}?`,
                                                                    () => toggleMemberStatus(member.id).then(fetchAllData)
                                                                )}
                                                                className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${member.id === adminId ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : member.status === 'Active' ? 'bg-mdError/10 text-mdError hover:bg-mdError hover:text-white' : 'bg-green-500/10 text-green-600 hover:bg-green-500 hover:text-white'}`}
                                                                disabled={member.id === adminId}
                                                            >
                                                                {member.status === 'Active' ? 'Restrict' : 'Authorize'}
                                                            </button>
                                                            <button 
                                                                onClick={() => openConfirm(
                                                                    "Expunge Record?", 
                                                                    `This will permanently remove ${member.firstName} from the assembly registry. Proceed?`,
                                                                    () => deleteMember(member.id).then(fetchAllData)
                                                                )}
                                                                className="p-3 bg-mdSurfaceVariant/30 text-mdOnSurfaceVariant rounded-xl hover:bg-mdError hover:text-white transition-all shadow-sm"
                                                            >
                                                                <FontAwesomeIcon icon={faTrash} />
                                                            </button>
                                                        </div>
                                                    )}

                                                    <button 
                                                        onClick={() => setViewingMember(member)}
                                                        className="w-full mt-2 py-3 bg-mdPrimary/10 text-mdPrimary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-mdPrimary hover:text-white transition-all flex items-center justify-center gap-2 border border-mdPrimary/20"
                                                    >
                                                        <FontAwesomeIcon icon={faIdCard} />
                                                        View & Edit Records
                                                    </button>

                                                    {(isActuallySuperAdmin && !isReadOnly) && (
                                                        <div className="flex gap-2 mt-2">
                                                            <button 
                                                                onClick={() => {
                                                                    if (branches.length === 0) {
                                                                        showToast('Please create at least one branch first.', 'warning');
                                                                        return;
                                                                    }
                                                                    setPromotingMember(member);
                                                                }}
                                                                className="flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-mdPrimary/10 text-mdPrimary hover:bg-mdPrimary hover:text-white transition-all"
                                                            >
                                                                Promote
                                                            </button>
                                                            <button 
                                                                onClick={() => {
                                                                    setAssigningBranchMember(member);
                                                                    setTargetBranchId(member.branchId || '');
                                                                }}
                                                                className="flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all"
                                                            >
                                                                Set Branch
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 3. INSIGHTS (Announcements + Events combined) */}
                {activeTab === 'updates' && (
                    <div className="space-y-8 animate-fade-in mt-4">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h1 className="text-4xl font-black text-mdOnSurface tracking-tighter">Assembly Insights</h1>
                                <p className="text-mdPrimary font-black text-xs uppercase tracking-widest mt-1">Insights & Gatherings</p>
                            </div>
                            {(isAnyAdmin || isSecretary) && !isReadOnly && updatesSubTab === 'announcements' && (
                                <button onClick={() => setShowAnnForm(!showAnnForm)} className="btn-premium">
                                    <FontAwesomeIcon icon={showAnnForm ? faTimes : faPlus} />
                                    {showAnnForm ? 'Cancel' : 'Post Announcement'}
                                </button>
                            )}
                            {(isAnyAdmin || isSecretary) && !isReadOnly && updatesSubTab === 'events' && (
                                <button onClick={() => setShowEventForm(!showEventForm)} className="btn-premium">
                                    <FontAwesomeIcon icon={showEventForm ? faTimes : faPlus} />
                                    {showEventForm ? 'Cancel' : 'Schedule Event'}
                                </button>
                            )}
                        </div>

                        {/* Sub-tabs */}
                        <div className="flex p-1.5 bg-mdSurfaceVariant/20 rounded-[2rem] w-max border border-mdOutline/5 shadow-inner">
                            {[
                                { id: 'announcements', label: 'Insights', icon: faBullhorn },
                                { id: 'events', label: 'Gatherings', icon: faCalendarAlt },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => { setUpdatesSubTab(tab.id); setShowAnnForm(false); setShowEventForm(false); }}
                                    className={`flex items-center gap-2 px-8 py-3 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest transition-all duration-500 ${
                                        updatesSubTab === tab.id
                                            ? 'bg-mdPrimary text-white shadow-premium'
                                            : 'text-mdOnSurface hover:bg-mdSurfaceVariant/30'
                                    }`}
                                >
                                    <FontAwesomeIcon icon={tab.icon} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* ANNOUNCEMENTS sub-tab */}
                        {updatesSubTab === 'announcements' && (
                            <div className="space-y-8 animate-fade-in">
                                {showAnnForm && (
                                    <div className="glass-card p-10 animate-slide-up border-l-8 border-l-mdPrimary">
                                        <form onSubmit={handleAnnouncementSubmit} className="space-y-6">
                                            <input type="text" placeholder="Headline" className="w-full p-4 bg-mdSurfaceVariant/20 border-none rounded-2xl focus:ring-2 focus:ring-mdPrimary font-bold" value={annForm.title} onChange={e => setAnnForm({...annForm, title: e.target.value})} required />
                                            <textarea placeholder="The message..." className="w-full p-4 bg-mdSurfaceVariant/20 border-none rounded-2xl focus:ring-2 focus:ring-mdPrimary font-medium h-40" value={annForm.message} onChange={e => setAnnForm({...annForm, message: e.target.value})} required />
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-mdOutline ml-4">Attach Media (PNG, JPG, PDF)</label>
                                                <input type="file" className="w-full p-4 bg-mdSurfaceVariant/20 border-none rounded-2xl font-bold file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-mdPrimary/10 file:text-mdPrimary hover:file:bg-mdPrimary/20 transition-all" onChange={e => setAnnFile(e.target.files[0])} accept="image/*,.pdf" />
                                            </div>
                                            {isSuperAdmin && (
                                                <div className="flex items-center gap-3 p-4 bg-mdPrimary/5 rounded-2xl border border-mdPrimary/10">
                                                    <input type="checkbox" id="annGlobal" className="w-5 h-5 rounded border-mdOutline accent-mdPrimary" checked={annForm.isGlobal} onChange={e => setAnnForm({...annForm, isGlobal: e.target.checked})} />
                                                    <label htmlFor="annGlobal" className="text-sm font-bold text-mdOnSurface select-none cursor-pointer">Make Global Visibility (All Assembly Branches)</label>
                                                </div>
                                            )}
                                            <button type="submit" disabled={formLoading} className="btn-premium w-full sm:w-max">{formLoading ? 'Publishing...' : 'Release Post'}</button>
                                        </form>
                                    </div>
                                )}
                                <Announcements embedded={true} branchId={selectedBranchId} />
                            </div>
                        )}

                        {/* EVENTS sub-tab */}
                        {updatesSubTab === 'events' && (
                            <div className="space-y-8 animate-fade-in">
                                {showEventForm && (
                                    <div className="glass-card p-10 animate-slide-up border-l-8 border-l-mdSecondary">
                                        <form onSubmit={handleEventSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <input type="text" placeholder="Event Name" className="w-full p-4 bg-mdSurfaceVariant/20 border-none rounded-2xl md:col-span-2 font-bold" value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} required />
                                            <textarea placeholder="Description" className="w-full p-4 bg-mdSurfaceVariant/20 border-none rounded-2xl md:col-span-2 font-medium h-32" value={eventForm.description} onChange={e => setEventForm({...eventForm, description: e.target.value})} required />
                                            <input type="datetime-local" className="w-full p-4 bg-mdSurfaceVariant/20 border-none rounded-2xl" value={eventForm.startDate} onChange={e => setEventForm({...eventForm, startDate: e.target.value})} required />
                                            <input type="text" placeholder="Venue" className="w-full p-4 bg-mdSurfaceVariant/20 border-none rounded-2xl" value={eventForm.location} onChange={e => setEventForm({...eventForm, location: e.target.value})} required />
                                            <div className="md:col-span-2 space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-mdOutline ml-4">Event Document (PDF/JPG/PNG)</label>
                                                <input type="file" className="w-full p-4 bg-mdSurfaceVariant/20 border-none rounded-2xl font-bold file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-mdPrimary/10 file:text-mdPrimary" onChange={e => setEventFile(e.target.files[0])} accept="image/*,.pdf" />
                                            </div>
                                            {isSuperAdmin && (
                                                <div className="md:col-span-2 flex items-center gap-3 p-4 bg-mdSecondary/5 rounded-2xl border border-mdSecondary/10">
                                                    <input type="checkbox" id="eventGlobal" className="w-5 h-5 rounded border-mdOutline accent-mdSecondary" checked={eventForm.isGlobal} onChange={e => setEventForm({...eventForm, isGlobal: e.target.checked})} />
                                                    <label htmlFor="eventGlobal" className="text-sm font-bold text-mdOnSurface select-none cursor-pointer">Make Global Visibility (All Assembly Branches)</label>
                                                </div>
                                            )}
                                            <button type="submit" disabled={formLoading} className="btn-premium sm:w-max">{formLoading ? 'Scheduling...' : 'Save Event'}</button>
                                        </form>
                                    </div>
                                )}
                                <Events embedded={true} branchId={selectedBranchId} />
                            </div>
                        )}
                    </div>
                )}

                {/* 5. GALLERY */}
                {activeTab === 'gallery' && (
                    <div className="animate-fade-in mt-4">
                        <Gallery
                            canUpload={(isAnyAdmin || isMediaTeam) && !isReadOnly}
                            branchId={currentBranchIdForData}
                            currentUserId={adminId}
                            currentUserName={adminName}
                            userRole={effectiveRole}
                        />
                    </div>
                )}

                {/* 5.5 ATTENDANCE */}
                {activeTab === 'attendance' && (
                    <div className="animate-fade-in mt-4">
                        <AttendanceManager branchId={currentBranchIdForData} />
                    </div>
                )}

                {/* 5.6 MESSAGES */}
                {activeTab === 'messages' && (
                    <div className="animate-fade-in mt-4">
                        <MessageCenter 
                            currentUserId={adminId} 
                            currentUserRole={effectiveRole}
                            adminName={adminName}
                        />
                    </div>
                )}

                {/* 5.8 MEDIA TEAM — Branch Admins Only */}
                {!isActuallySuperAdmin && !isReadOnly && activeTab === 'media-team' && (
                    <div className="space-y-10 animate-fade-in mt-4">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h1 className="text-4xl font-black text-mdOnSurface tracking-tighter">Media Team</h1>
                                <p className="text-mdPrimary font-black text-xs uppercase tracking-widest mt-1">Manage your branch media team</p>
                            </div>
                            <button onClick={() => setShowMediaTeamForm(!showMediaTeamForm)} className="btn-premium">
                                <FontAwesomeIcon icon={showMediaTeamForm ? faTimes : faPlus} />
                                {showMediaTeamForm ? 'Cancel' : 'Add Member'}
                            </button>
                        </div>

                        {showMediaTeamForm && (
                            <div className="glass-card p-10 animate-slide-up border-l-8 border-l-mdPrimary">
                                <h3 className="text-xl font-black text-mdOnSurface mb-6 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-mdPrimary text-white flex items-center justify-center">
                                        <FontAwesomeIcon icon={faCamera} />
                                    </div>
                                    Create Media Team Account
                                </h3>
                                <form onSubmit={handleMediaTeamSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <input type="text" placeholder="Full Name" className="w-full p-4 bg-mdSurfaceVariant/20 border-none rounded-2xl font-bold" value={mediaTeamForm.name} onChange={e => setMediaTeamForm({...mediaTeamForm, name: e.target.value})} required />
                                    <input type="email" placeholder="Email Address" className="w-full p-4 bg-mdSurfaceVariant/20 border-none rounded-2xl font-bold" value={mediaTeamForm.email} onChange={e => setMediaTeamForm({...mediaTeamForm, email: e.target.value})} required />
                                    <input type="password" placeholder="Temporary Password" className="w-full p-4 bg-mdSurfaceVariant/20 border-none rounded-2xl font-bold" value={mediaTeamForm.password} onChange={e => setMediaTeamForm({...mediaTeamForm, password: e.target.value})} required />
                                    <button type="submit" disabled={formLoading} className="btn-premium md:col-span-3">
                                        {formLoading ? 'Creating...' : 'Create Media Team Account'}
                                    </button>
                                </form>
                            </div>
                        )}

                        <div className="space-y-4">
                            <h3 className="text-lg font-black text-mdOnSurface">Current Members</h3>
                            {admins.filter(a => a.role === 'MEDIA_TEAM' && String(a.branchId) === String(adminData?.branchId)).length === 0 ? (
                                <div className="glass-card p-12 text-center">
                                    <FontAwesomeIcon icon={faCamera} className="text-5xl text-mdOutline/20 mb-4" />
                                    <h3 className="text-xl font-black text-mdOnSurface mb-2">No Media Team Yet</h3>
                                    <p className="text-mdOnSurfaceVariant font-medium">Add your first media team member above.</p>
                                </div>
                            ) : admins.filter(a => a.role === 'MEDIA_TEAM' && String(a.branchId) === String(adminData?.branchId)).map(member => (
                                <div key={member.id} className="glass-card p-6 flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-500 font-black text-xl">
                                            {member.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-black text-mdOnSurface">{member.name}</p>
                                            <p className="text-mdOnSurfaceVariant text-sm font-medium">{member.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1 bg-pink-500/10 text-pink-600 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1">
                                            <FontAwesomeIcon icon={faCamera} className="text-[9px]" /> Media Team
                                        </span>
                                        <button
                                            onClick={() => openConfirm('Remove Member', `Remove ${member.name} from the media team?`, async () => { try { await fetch(`/api/admins/${member.id}`, { method: 'DELETE' }); fetchAllData(); showToast('Member removed.', 'success'); } catch { showToast('Failed to remove.', 'error'); } })}
                                            className="w-8 h-8 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                                        >
                                            <FontAwesomeIcon icon={faTrash} className="text-xs" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 6. PRAYER REQUESTS */}
                {activeTab === 'prayer-requests' && (
                    <div className="space-y-10 animate-fade-in mt-4">
                        <h1 className="text-4xl font-black text-mdOnSurface tracking-tighter">Prayer Requests</h1>
                        <div className="grid gap-6">
                            {prayerRequests.length === 0 ? (
                                <div className="glass-card p-12 text-center">
                                    <div className="w-16 h-16 bg-mdSurfaceVariant/20 text-mdOutline rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                                        <FontAwesomeIcon icon={faPrayingHands} />
                                    </div>
                                    <h3 className="text-xl font-black text-mdOnSurface">No Intercessions</h3>
                                    <p className="text-mdOnSurfaceVariant font-medium">There are currently no prayer requests in this territory.</p>
                                </div>
                            ) : prayerRequests.map(pr => (
                                <div key={pr.id} className="glass-card p-8 flex flex-col md:flex-row justify-between items-start gap-6 border-l-4 border-l-mdPrimary">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            <h4 className="text-2xl font-black text-mdOnSurface">{pr.isAnonymous ? 'Restricted Identity' : pr.requesterName}</h4>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${pr.status === 'Answered' ? 'bg-green-500/10 text-green-600' : pr.status === 'Prayed For' ? 'bg-mdPrimary/10 text-mdPrimary' : 'bg-amber-500/10 text-amber-600'}`}>
                                                {pr.status}
                                            </span>
                                        </div>
                                        <p className="text-mdOnSurfaceVariant font-medium text-lg italic leading-relaxed">"{pr.requestText}"</p>
                                        <div className="mt-6 flex items-center gap-4 text-[10px] font-black text-mdOutline uppercase tracking-widest">
                                            <span>Received {new Date(pr.createdAt).toLocaleDateString()}</span>
                                            {!pr.isAnonymous && <span>• {pr.email}</span>}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {!isActuallySuperAdmin && !isReadOnly && (
                                            <button 
                                                onClick={() => {
                                                    import('../services/api').then(({ forwardPrayerRequest }) => {
                                                        forwardPrayerRequest(pr.id, !pr.forwardedToSuperAdmin)
                                                            .then(() => fetchAllData())
                                                            .catch(() => showToast('Failed to modify escalation', 'error'));
                                                    });
                                                }}
                                                className={`p-4 rounded-2xl transition-all ${pr.forwardedToSuperAdmin ? 'bg-indigo-500 text-white hover:bg-indigo-600' : 'bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white'}`}
                                                title={pr.forwardedToSuperAdmin ? "Revoke Escalation" : "Forward to Super Admin"}
                                            >
                                                <FontAwesomeIcon icon={faUserShield} />
                                            </button>
                                        )}
                                        {pr.status === 'PENDING' && !isReadOnly && (
                                            <button 
                                                onClick={() => updatePrayerRequestStatus(pr.id, 'Prayed For').then(fetchAllData)} 
                                                className="p-4 bg-mdPrimary/10 text-mdPrimary rounded-2xl hover:bg-mdPrimary hover:text-white transition-all"
                                                title="Mark as Prayed For"
                                            >
                                                <FontAwesomeIcon icon={faCheck} />
                                            </button>
                                        )}
                                        {pr.status !== 'Answered' && !isReadOnly && (
                                            <button 
                                                onClick={() => updatePrayerRequestStatus(pr.id, 'Answered').then(fetchAllData)} 
                                                className="p-4 bg-green-500/10 text-green-600 rounded-2xl hover:bg-green-500 hover:text-white transition-all"
                                                title="Mark as Answered"
                                            >
                                                <FontAwesomeIcon icon={faCheckDouble} />
                                            </button>
                                        )}
                                        {!isReadOnly && (
                                            <button 
                                                onClick={() => openConfirm(
                                                    "Archive Prayer?", 
                                                    "This prayer request will be permanently removed from the dashboard. Proceed?",
                                                    () => deletePrayerRequest(pr.id).then(fetchAllData)
                                                )}
                                                className="p-4 bg-mdError/10 text-mdError rounded-2xl hover:bg-mdError hover:text-white transition-all"
                                                title="Delete Request"
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        )}
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
                                {branches.length === 0 ? (
                                    <div className="text-center py-6">
                                        <div className="w-16 h-16 bg-mdError/10 text-mdError rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                                            <FontAwesomeIcon icon={faExclamationTriangle} />
                                        </div>
                                        <h3 className="text-xl font-black text-mdOnSurface mb-2">Branch Network Required</h3>
                                        <p className="text-mdOnSurfaceVariant mb-6">You must establish at least one branch before authorizing staff.</p>
                                        <button onClick={() => setActiveTab('branch-management')} className="btn-premium">
                                            Go to Branches
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleAdminSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <input type="text" placeholder="Full Name" className="w-full p-4 bg-mdSurfaceVariant/20 border-none rounded-2xl font-bold" value={adminForm.name} onChange={e => setAdminForm({...adminForm, name: e.target.value})} required />
                                        <input type="email" placeholder="Official Email" className="w-full p-4 bg-mdSurfaceVariant/20 border-none rounded-2xl font-bold" value={adminForm.email} onChange={e => setAdminForm({...adminForm, email: e.target.value})} required />
                                        <input type="password" placeholder="Temp Password" className="w-full p-4 bg-mdSurfaceVariant/20 border-none rounded-2xl font-bold" value={adminForm.password} onChange={e => setAdminForm({...adminForm, password: e.target.value})} required />
                                        <select
                                            className="w-full p-4 bg-mdSurfaceVariant/20 border-none rounded-2xl font-bold"
                                            value={adminForm.role}
                                            onChange={e => setAdminForm({...adminForm, role: e.target.value})}
                                        >
                                            {isActuallySuperAdmin ? (
                                                <>
                                                    <option value="BRANCH_ADMIN">Branch Admin</option>
                                                    <option value="BRANCH_SECRETARY">Branch Secretary</option>
                                                    <option value="BRANCH_MEDIA">Branch Media Team</option>
                                                    <option value="SUPER_SECRETARY">District Secretary (Super)</option>
                                                    <option value="SUPER_MEDIA">District Media Team (Super)</option>
                                                </>
                                            ) : (
                                                <>
                                                    <option value="BRANCH_SECRETARY">Branch Secretary</option>
                                                    <option value="BRANCH_MEDIA">Branch Media Team</option>
                                                </>
                                            )}
                                        </select>
                                        <select 
                                            className="w-full p-4 bg-mdSurfaceVariant/20 border-none rounded-2xl font-bold" 
                                            value={adminForm.branchId || ''} 
                                            onChange={e => setAdminForm({...adminForm, branchId: e.target.value ? parseInt(e.target.value) : ''})}
                                            required
                                        >
                                            <option value="" disabled>Select Branch</option>
                                            {branches.map(b => (
                                                <option key={b.id} value={b.id}>{b.name}</option>
                                            ))}
                                        </select>
                                        <button type="submit" disabled={formLoading} className="btn-premium lg:col-span-3">{formLoading ? 'Authorizing...' : 'Create Staff Account'}</button>
                                    </form>
                                )}
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
                                                <div className="flex items-center gap-4">
                                                    {adm.branchId && (
                                                        <button 
                                                            onClick={() => enterInspection(adm.branchId, branches.find(b => b.id === adm.branchId)?.name || 'Branch')}
                                                            className="text-mdPrimary hover:scale-110 transition-all text-xs font-black bg-mdPrimary/10 px-3 py-1 rounded-lg flex items-center gap-2"
                                                            title="Inspect Branch Dashboard"
                                                        >
                                                            <FontAwesomeIcon icon={faSearch} />
                                                            INSPECT
                                                        </button>
                                                    )}
                                                    {adm.email !== 'benjaminbuckmanjunior@gmail.com' && adm.id !== adminId && (
                                                        <button 
                                                            onClick={() => openConfirm("Revoke Access?", `Remove ${adm.name} from the staff?`, () => deleteAdmin(adm.id).then(fetchAllData))}
                                                            className="text-mdError hover:scale-110 transition-all p-2 bg-mdError/5 rounded-lg"
                                                            title="Delete Administrator"
                                                        >
                                                            <FontAwesomeIcon icon={faTrash} />
                                                        </button>
                                                    )}
                                                </div>
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
                                        <button 
                                            onClick={() => { setSelectedBranchId(branch.id); setActiveTab('members'); }}
                                            className="text-xs font-black uppercase tracking-widest text-mdOnSurfaceVariant hover:text-mdPrimary transition-colors flex items-center gap-2"
                                        >
                                            <FontAwesomeIcon icon={faUsers} />
                                            View Members
                                        </button>
                                        <button 
                                            onClick={() => openConfirm(
                                                "Delete Branch?", 
                                                `Are you sure you want to delete "${branch.name}"? This will also remove all sermons, events, and announcements for this branch. Members will be unassigned.`,
                                                () => deleteBranch(branch.id).then((res) => {
                                                    if (res.data && res.data.success === false) {
                                                        throw new Error(res.data.message || 'Validation failed. Ensure no connected records blocked the deletion.');
                                                    }
                                                    showToast(`Branch "${branch.name}" deleted.`, 'success');
                                                    fetchAllData();
                                                }).catch((err) => showToast(err.message || 'Failed to delete branch.', 'error'))
                                            )}
                                            className="text-mdError hover:scale-110 transition-all p-2 bg-mdError/5 rounded-lg"
                                            title="Delete Branch"
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
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

                {/* 10. ANALYTICS */}
                {activeTab === 'analytics' && (
                    <div className="animate-fade-in mt-4">
                        <AnalyticsDashboard members={members} branches={branches} />
                    </div>
                )}
                {/* 11. AUDIT TRAIL (Super Admin Only) */}
                {(activeTab === 'audit' && isActuallySuperAdmin) && (
                    <div className="space-y-10 animate-fade-in">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-4xl font-black text-mdOnSurface tracking-tighter italic flex items-center gap-4">
                                    System Audit
                                    <span className="text-[10px] bg-mdPrimary/10 text-mdPrimary px-3 py-1 rounded-full uppercase tracking-widest">District Logs</span>
                                </h1>
                                <p className="text-mdPrimary font-black text-xs uppercase tracking-widest mt-1">Transparency & Accountability Trail</p>
                            </div>
                            <button 
                                onClick={fetchAuditLogs}
                                disabled={isFetchingAudit}
                                className="w-12 h-12 rounded-2xl bg-mdPrimary/10 text-mdPrimary flex items-center justify-center hover:bg-mdPrimary hover:text-white transition-all shadow-sm"
                            >
                                <FontAwesomeIcon icon={isFetchingAudit ? faSpinner : faHistory} className={isFetchingAudit ? 'animate-spin' : ''} />
                            </button>
                            <button 
                                onClick={() => {
                                    if (!auditLogs.length) return;
                                    const headers = ["Timestamp", "Admin", "Action", "Target", "Details"];
                                    const csvRows = [headers.join(',')];
                                    auditLogs.forEach(log => {
                                        const row = [
                                            `"${new Date(log.timestamp).toLocaleString()}"`,
                                            `"${log.adminName || 'Admin #' + log.adminId}"`,
                                            `"${log.action}"`,
                                            `"${log.targetType} (${log.targetId})"`,
                                            `"${(log.details || '').replace(/"/g, '""')}"`
                                        ];
                                        csvRows.push(row.join(','));
                                    });
                                    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.setAttribute('hidden', '');
                                    a.setAttribute('href', url);
                                    a.setAttribute('download', `COP_Ayikai_Doblo_Audit_Logs_${new Date().toISOString().split('T')[0]}.csv`);
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                }}
                                className="px-6 h-12 rounded-2xl bg-mdPrimary text-white flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest hover:bg-mdSecondary transition-all shadow-premium"
                            >
                                <FontAwesomeIcon icon={faFileDownload} />
                                Export Logs
                            </button>
                        </div>

                        <div className="glass-card overflow-hidden rounded-[3rem] border-none shadow-premium bg-white mb-20">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-mdPrimary/5">
                                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-mdOnSurfaceVariant">Timestamp</th>
                                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-mdOnSurfaceVariant">Administrator</th>
                                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-mdOnSurfaceVariant">Action</th>
                                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-mdOnSurfaceVariant">Target</th>
                                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-mdOnSurfaceVariant">Details</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-mdOutline/5">
                                        {auditLogs.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-8 py-20 text-center text-mdOnSurfaceVariant font-bold italic opacity-40">
                                                    {isFetchingAudit ? 'Accessing encrypted logs...' : 'No system activities recorded yet.'}
                                                </td>
                                            </tr>
                                        ) : (
                                            auditLogs.map(log => (
                                                <tr key={log.id} className="hover:bg-mdSurfaceVariant/20 transition-colors group">
                                                    <td className="px-8 py-5">
                                                        <div className="text-xs font-black text-mdOnSurface">
                                                            {new Date(log.timestamp).toLocaleDateString()}
                                                        </div>
                                                        <div className="text-[10px] font-bold text-mdOnSurfaceVariant">
                                                            {new Date(log.timestamp).toLocaleTimeString()}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-mdPrimary/10 text-mdPrimary flex items-center justify-center text-[10px] font-black">
                                                                {log.adminName?.charAt(0)}
                                                            </div>
                                                            <span className="text-sm font-black text-mdOnSurface">{log.adminName}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <span className="px-3 py-1 rounded-full bg-mdSecondary/10 text-mdSecondary text-[9px] font-black uppercase tracking-widest">
                                                            {log.action?.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <div className="text-xs font-bold text-mdOnSurfaceVariant uppercase tracking-widest">{log.targetType}</div>
                                                        <div className="text-[10px] font-black text-mdPrimary">#{log.targetId}</div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <p className="text-sm font-medium text-mdOnSurface leading-relaxed">{log.details}</p>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Promotion Selection Modal */}
            {promotingMember && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                    <div className="glass-card p-10 max-w-sm w-full animate-slide-up text-center border-l-8 border-l-mdPrimary">
                        <div className="w-16 h-16 rounded-full bg-mdPrimary/10 flex items-center justify-center text-2xl text-mdPrimary mx-auto mb-6">
                            <FontAwesomeIcon icon={faUserShield} />
                        </div>
                        <h3 className="text-2xl font-black text-mdOnSurface mb-2">Assign to Branch</h3>
                        <p className="text-mdOnSurfaceVariant mb-8 font-medium text-sm">Select a branch for <b>{promotingMember.firstName} {promotingMember.lastName}</b> to manage.</p>
                        
                        <div className="space-y-4 mb-8">
                            <select 
                                className="w-full p-4 bg-mdSurfaceVariant/20 border-none rounded-2xl font-bold"
                                value={promotionBranchId}
                                onChange={e => setPromotionBranchId(e.target.value)}
                            >
                                <option value="" disabled>Select Target Branch</option>
                                {branches.map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-4">
                            <button 
                                onClick={() => { setPromotingMember(null); setPromotionBranchId(''); }} 
                                className="flex-1 py-4 rounded-2xl font-black border border-mdOutline/20 text-mdOnSurfaceVariant hover:bg-mdSurfaceVariant/10"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => handlePromoteToAdmin(promotingMember.id)} 
                                disabled={!promotionBranchId || formLoading}
                                className="flex-1 py-4 rounded-2xl font-black bg-mdPrimary text-white shadow-lifted disabled:opacity-50"
                            >
                                {formLoading ? 'Promoting...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
            {/* Branch Assignment Modal */}
            {assigningBranchMember && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                    <div className="glass-card p-10 max-w-sm w-full animate-slide-up text-center border-l-8 border-l-emerald-500">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-2xl text-emerald-600 mx-auto mb-6">
                            <FontAwesomeIcon icon={faBuilding} />
                        </div>
                        <h3 className="text-2xl font-black text-mdOnSurface mb-2">Member Affiliation</h3>
                        <p className="text-mdOnSurfaceVariant mb-8 font-medium text-sm">Assign <b>{assigningBranchMember.firstName} {assigningBranchMember.lastName}</b> to a branch territory.</p>
                        
                        <div className="mb-8">
                            <select 
                                className="w-full p-4 bg-mdSurfaceVariant/20 border-none rounded-2xl font-bold"
                                value={targetBranchId}
                                onChange={e => setTargetBranchId(e.target.value)}
                            >
                                <option value="">No Branch / Central</option>
                                {branches.map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-4">
                            <button 
                                onClick={() => { setAssigningBranchMember(null); setTargetBranchId(''); }} 
                                className="flex-1 py-4 rounded-2xl font-black border border-mdOutline/20 text-mdOnSurfaceVariant hover:bg-mdSurfaceVariant/10"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => handleAssignBranch(assigningBranchMember.id)} 
                                disabled={formLoading}
                                className="flex-1 py-4 rounded-2xl font-black bg-emerald-500 text-white shadow-lifted disabled:opacity-50"
                            >
                                {formLoading ? 'Assigning...' : 'Update'}
                            </button>
                        </div>
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

            {lightboxImg && (
                <Lightbox 
                    src={lightboxImg} 
                    onClose={() => setLightboxImg(null)} 
                />
            )}

            {showCropper && (
                <ImageCropperModal 
                    image={selectedImage}
                    onCropComplete={handleCropComplete}
                    onCancel={() => {
                        setShowCropper(false);
                        setSelectedImage(null);
                    }}
                />
            )}

            {/* MEMBER PROFILE DOSSIER MODAL */}
            {viewingMember && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-fade-in">
                    <div 
                        className="absolute inset-0 bg-mdOnSurface/40 backdrop-blur-md"
                        onClick={() => setViewingMember(null)}
                    ></div>
                    
                    <div className="relative glass-card w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col rounded-[3.5rem] shadow-premium-lg border-none animate-slide-up bg-white/95">
                        {/* Header */}
                        <div className="p-8 border-b border-mdOutline/10 flex justify-between items-center bg-mdPrimary/5">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-mdPrimary text-white flex items-center justify-center text-2xl shadow-premium">
                                    <FontAwesomeIcon icon={faIdCard} />
                                </div>
                                <div className="text-left">
                                    <h2 className="text-2xl font-black text-mdOnSurface tracking-tighter leading-none">
                                        Registry Archive: {viewingMember.name || `${viewingMember.firstName} ${viewingMember.lastName}`}
                                    </h2>
                                    <p className="text-[10px] font-black text-mdPrimary uppercase tracking-[0.3em] mt-2 italic">Official Assembly Record • ID-{viewingMember.id}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setViewingMember(null)}
                                className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-mdOnSurfaceVariant hover:bg-mdError hover:text-white transition-all transform hover:rotate-90"
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            <MemberProfile 
                                memberIdProp={viewingMember.id} 
                                autoEdit={false}
                                onUpdate={fetchAllData}
                            />
                        </div>

                        {/* Footer Overlay Shadow */}
                        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white pointer-events-none"></div>
                    </div>
                </div>
            )}
        </div>
    );
}
