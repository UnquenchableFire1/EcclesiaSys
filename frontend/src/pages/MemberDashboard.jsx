import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faComments, faUsers, faEnvelope, faSearch, faHandsHelping,
    faBullhorn, faCalendarAlt, faMicrophone, faPrayingHands, faArrowRight, faCamera, faTrash,
    faImages, faCheck
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import ImageCropperModal from '../components/ImageCropperModal';
import { useToast } from '../context/ToastContext';

import { 
    getMemberProfile, getAnnouncements, getEvents, getSermons,
    createPrayerRequest, getNotifications, markNotificationAsRead,
    markAllNotificationsAsRead, getMembers, getPublicMembers,
    getMyPrayerRequests, uploadProfilePicture, deleteProfilePicture
} from '../services/api';

import Announcements from './Announcements';
import Events from './Events';
import Sermons from './Sermons';
import Gallery from './Gallery';
import DailyVerse from '../components/DailyVerse';
import ChangePassword from '../components/ChangePassword';
// Chat removed in favor of WhatsApp support
import Lightbox from '../components/Lightbox';

export default function MemberDashboard() {
    const navigate = useNavigate();
    const { theme } = useTheme();

    // -- State --
    const [activeTab, setActiveTabInternal] = useState(() => sessionStorage.getItem('memberActiveTab') || 'home');
    const [updatesSubTab, setUpdatesSubTab] = useState('announcements');
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();
    
    // Profile Picture State
    const [selectedImage, setSelectedImage] = useState(null);
    const [showCropper, setShowCropper] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [lightboxImg, setLightboxImg] = useState(null);
    const [memberProfile, setMemberProfile] = useState(null);
    const [memberId] = useState(parseInt(sessionStorage.getItem('userId')));
    const [memberName] = useState(sessionStorage.getItem('userName'));
    
    // UI State
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [members, setMembers] = useState([]);
    const [memberSearchQuery, setMemberSearchQuery] = useState('');
    const [myPrayerRequests, setMyPrayerRequests] = useState([]);

    // -- Handlers --
    const setActiveTab = (tab) => {
        setActiveTabInternal(tab);
        sessionStorage.setItem('memberActiveTab', tab);
    };

    // Listen for tab changes from Sidebar / BottomNav
    useEffect(() => {
        const handleTabChange = (e) => {
            if (e.detail) {
                setActiveTab(e.detail);
            }
        };
        window.addEventListener('setActiveTab', handleTabChange);
        return () => window.removeEventListener('setActiveTab', handleTabChange);
    }, []);

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
        formData.append('userId', memberId);
        formData.append('userType', 'member');

        try {
            const response = await uploadProfilePicture(formData);
            if (response.data.success) {
                showToast("Identity portrait updated in the assembly.", "success");
                setMemberProfile(prev => ({
                    ...prev,
                    profilePictureUrl: response.data.profilePictureUrl
                }));
                sessionStorage.setItem('profilePictureUrl', response.data.profilePictureUrl);
                // Trigger a global update for components like Navbar
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
            const response = await deleteProfilePicture(memberId, 'member');
            if (response.data.success) {
                showToast(response.data.message, "success");
                setMemberProfile(prev => ({
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

    const fetchMemberData = async () => {
        if (!memberId) { navigate('/login'); return; }
        setLoading(true);
        try {
            const [profileRes, membersRes] = await Promise.all([
                getMemberProfile(memberId),
                getPublicMembers(sessionStorage.getItem('branchId'))
            ]);
            setMemberProfile(profileRes.data?.data || profileRes.data || {});
            setMembers(membersRes.data?.data || membersRes.data || []);

            // Fetch personal prayer requests
            const email = sessionStorage.getItem('userEmail');
            if (email) {
                try {
                    const prRes = await getMyPrayerRequests(email);
                    setMyPrayerRequests(prRes.data?.data || prRes.data || []);
                } catch (prErr) {
                    console.error("Prayer requests fetch error:", prErr);
                }
            }
        } catch (err) {
            console.error("Dashboard Data Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!memberId) { navigate('/login'); return; }
        fetchMemberData();
    }, [memberId]);

    // -- Sub-Components --
    const DiscoveryCard = ({ title, desc, icon, tab, color, onClick }) => (
        <button 
            onClick={onClick || (() => setActiveTab(tab))}
            className="glass-card p-8 group text-left hover:border-mdPrimary/30 transition-all overflow-hidden relative"
        >
            <div className={`w-12 h-12 rounded-xl bg-mdSurfaceVariant/30 ${color} flex items-center justify-center text-xl mb-6 group-hover:scale-110 group-hover:bg-mdPrimary group-hover:text-white transition-all duration-500`}>
                <FontAwesomeIcon icon={icon} />
            </div>
            <h3 className="text-xl font-black text-mdOnSurface mb-2">{title}</h3>
            <p className="text-sm font-medium text-mdOnSurfaceVariant mb-6 line-clamp-2">{desc}</p>
            <div className="flex items-center gap-2 text-[10px] font-black text-mdPrimary uppercase tracking-widest">
                Explore Now <FontAwesomeIcon icon={faArrowRight} className="text-[8px]" />
            </div>
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-mdPrimary/5 rounded-full blur-2xl group-hover:bg-mdPrimary/10 transition-all`}></div>
        </button>
    );

    return (
        <div className="pb-24 max-w-[1600px] mx-auto px-4 md:px-0">
            
            <header className="mb-12 mt-4 px-4 md:px-0 animate-slide-up">
                <div className="relative group inline-block">
                    <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-mdPrimary rounded-full scale-y-100 transition-transform duration-700 origin-center hidden md:block"></div>
                    <h1 className="text-5xl md:text-7xl font-black text-mdOnSurface tracking-tighter mb-2 bg-clip-text text-transparent bg-gradient-to-br from-mdOnSurface to-mdOnSurfaceVariant/60">
                        COP Ayikai Doblo Assembly
                    </h1>
                    <p className="text-mdOnSurfaceVariant font-bold text-lg opacity-80 flex items-center gap-3">
                        <span className="w-8 h-px bg-mdPrimary/30"></span>
                        Peace be with you, <span className="text-mdPrimary font-black">{memberProfile?.name || memberProfile?.firstName || memberName || 'Friend'}</span>.
                    </p>
                </div>
            </header>

            {/* TAB CONTENT */}
            <div className="mt-8 transition-all animate-slide-up" style={{ animationDelay: '0.1s' }}>
                
                {/* 1. HOME / OVERVIEW */}
                {activeTab === 'home' && (
                    <div className="space-y-12">
                        {/* Hero Section */}
                        <div className="relative h-[450px] rounded-[3rem] overflow-hidden shadow-premium group mb-12">
                            <img src="/assets/images/church/church_8.jpg" alt="Assembly" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]" />
                            <div className="image-overlay-dark opacity-70"></div>
                            <div className="relative z-10 h-full p-10 md:p-16 flex flex-col justify-center max-w-2xl text-white">
                                <span className="px-5 py-2 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.4em] mb-8 inline-block border border-white/10 w-max">Member Assembly</span>
                                <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-[0.9]">
                                    Your faith,<br/>
                                    <span className="opacity-60 text-mdSecondary">Connected.</span>
                                </h2>
                                <p className="text-lg md:text-xl font-medium text-white/80 mb-10 leading-relaxed max-w-lg">
                                    "Your word is a lamp to my feet and a light to my path." – Explore what's happening in our assembly today.
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <button onClick={() => setActiveTab('sermons')} className="px-8 py-4 bg-white text-mdPrimary rounded-2xl font-black text-sm uppercase tracking-widest shadow-lifted hover:bg-mdSecondary hover:text-white transition-all">
                                        Listen to Word
                                    </button>
                                    <button onClick={() => navigate('/prayer-request')} className="px-8 py-4 bg-white/10 border border-white/30 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/20 transition-all">
                                        Request Prayer
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                            {/* Daily Verse Integration */}
                            <div className="lg:col-span-1">
                                <DailyVerse />
                            </div>

                            {/* Quick Discovery */}
                            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <DiscoveryCard 
                                    title="Upcoming Events" 
                                    desc="Announcements and upcoming events from our assembly community." 
                                    icon={faBullhorn}
                                    tab="updates"
                                    color="text-amber-500"
                                    onClick={() => { setActiveTab('updates'); setUpdatesSubTab('announcements'); }}
                                />
                                <DiscoveryCard 
                                    title="Gallery" 
                                    desc="Moments of faith and fellowship captured by our media team." 
                                    icon={faImages}
                                    tab="gallery"
                                    color="text-pink-500"
                                />
                                <DiscoveryCard 
                                    title="Word Room" 
                                    desc="Access our collection of sermons and spiritual resources anywhere." 
                                    icon={faMicrophone}
                                    tab="sermons"
                                    color="text-indigo-500"
                                />
                                <DiscoveryCard 
                                    title="Prayer Wall" 
                                    desc="Submit and view prayer requests. Let us stand with you in faith." 
                                    icon={faPrayingHands}
                                    tab="prayer-requests"
                                    onClick={() => navigate('/prayer-request')}
                                    color="text-emerald-500"
                                />
                                <DiscoveryCard 
                                    title="Member Directory" 
                                    desc="Connect with your brothers and sisters in the assembly." 
                                    icon={faUsers} 
                                    tab="members" 
                                    color="text-mdPrimary" 
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. UPDATES (Announcements + Events) */}
                {activeTab === 'updates' && (
                    <div className="space-y-8 animate-fade-in">
                        <div>
                            <h1 className="text-4xl font-black text-mdOnSurface tracking-tighter">Upcoming Events</h1>
                            <p className="text-mdPrimary font-black text-xs uppercase tracking-widest mt-1">Events &amp; Announcements</p>
                        </div>

                        {/* Sub-tabs */}
                        <div className="flex p-1.5 bg-mdSurfaceVariant/20 rounded-[2rem] w-max border border-mdOutline/5 shadow-inner">
                            {[
                                { id: 'announcements', label: 'Announcements', icon: faBullhorn },
                                { id: 'events', label: 'Events', icon: faCalendarAlt },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setUpdatesSubTab(tab.id)}
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

                        {updatesSubTab === 'announcements' && (
                            <div className="animate-fade-in">
                                <Announcements embedded={true} branchId={memberProfile?.branchId} />
                            </div>
                        )}
                        {updatesSubTab === 'events' && (
                            <div className="animate-fade-in">
                                <Events embedded={true} branchId={memberProfile?.branchId} />
                            </div>
                        )}
                    </div>
                )}

                {/* 3. SERMONS */}
                {activeTab === 'sermons' && (
                    <div className="space-y-10 animate-fade-in">
                        <Sermons embedded={true} branchId={memberProfile?.branchId} />
                    </div>
                )}

                {/* 4. GALLERY */}
                {activeTab === 'gallery' && (
                    <div className="space-y-10 animate-fade-in">
                        <Gallery
                            canUpload={false}
                            branchId={memberProfile?.branchId}
                            currentUserId={memberId}
                            currentUserName={memberName}
                        />
                    </div>
                )}

                {/* 4.7 MEMBERS */}
                {activeTab === 'members' && (
                    <div className="space-y-10 animate-fade-in">
                        <div className="max-w-4xl mx-auto text-center mb-12">
                            <h1 className="text-5xl font-black text-mdOnSurface tracking-tighter mb-4">Member Directory</h1>
                            <p className="text-lg text-mdOnSurfaceVariant font-medium">Meet the family of faith at COP Ayikai Doblo Assembly.</p>
                            
                            <div className="mt-8 relative max-w-xl mx-auto">
                                <FontAwesomeIcon icon={faSearch} className="absolute left-6 top-1/2 -translate-y-1/2 text-mdPrimary opacity-50" />
                                <input 
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={memberSearchQuery}
                                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                                    className="w-full bg-white border-2 border-mdOutline/10 rounded-2xl py-4 pl-14 pr-6 font-bold text-sm focus:border-mdPrimary focus:ring-4 focus:ring-mdPrimary/5 transition-all outline-none shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[...members.filter(m => (m.name || `${m.firstName || ''} ${m.lastName || ''}`).toLowerCase().includes(memberSearchQuery.toLowerCase()))]
                                .sort((a, b) => a.id === memberId ? -1 : b.id === memberId ? 1 : 0)
                                .map(member => (
                                <div key={member.id} className={`glass-card group p-8 flex flex-col items-center text-center relative hover:border-mdPrimary/30 transition-all ${member.id === memberId ? 'bg-mdPrimary/5 border-mdPrimary shadow-lifted' : ''}`}>
                                    <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black mb-4 transition-all duration-500 ${member.id === memberId ? 'bg-mdPrimary text-white shadow-lifted' : 'bg-mdPrimary/10 text-mdPrimary group-hover:bg-mdPrimary group-hover:text-white'}`}>
                                        {member.name?.[0] || member.firstName?.[0]}
                                    </div>
                                    <h4 className="text-lg font-black text-mdOnSurface truncate w-full flex items-center justify-center gap-2">
                                        {member.name || `${member.firstName} ${member.lastName}`}
                                        {member.id === memberId && <span className="text-xs text-mdPrimary bg-mdPrimary/10 px-2 py-0.5 rounded-lg">(YOU)</span>}
                                    </h4>
                                    <p className="text-[9px] font-black text-mdPrimary uppercase tracking-widest mb-6">Active Member</p>
                                    
                                    <div className="w-full pt-4 border-t border-mdOutline/5">
                                        <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-mdOnSurfaceVariant">
                                            <FontAwesomeIcon icon={faEnvelope} className="text-mdPrimary opacity-50" />
                                            <span className="truncate max-w-[150px]">{member.email}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 4.5 CHAT removed */}

                {/* 5. PRAYER REQUESTS */}
                {activeTab === 'prayer-requests' && (
                    <div className="space-y-12 animate-fade-in">
                        <div className="max-w-4xl mx-auto text-center">
                            <h1 className="text-5xl font-black text-mdOnSurface tracking-tighter mb-4">Prayer Wall</h1>
                            <p className="text-lg text-mdOnSurfaceVariant font-medium">"Therefore confess your sins to each other and pray for each other so that you may be healed." – James 5:16</p>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            <div className="glass-card p-10 border-l-8 border-l-mdPrimary">
                                <h3 className="text-2xl font-black text-mdOnSurface mb-6">Submit a Request</h3>
                                <p className="text-mdOnSurfaceVariant mb-8 font-medium leading-relaxed">
                                    Our prayer team and pastoral staff are here to support you in faith. Your requests are handled with the utmost care and confidentiality.
                                </p>
                                <button 
                                    onClick={() => navigate('/prayer-request')}
                                    className="btn-premium w-full py-5 text-lg"
                                >
                                    <FontAwesomeIcon icon={faPrayingHands} />
                                    Launch Prayer Form
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="glass-card p-8 bg-mdSurfaceVariant/10 border-none">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-mdPrimary/10 flex items-center justify-center text-mdPrimary">
                                            <FontAwesomeIcon icon={faCheck} />
                                        </div>
                                        <h4 className="text-xl font-black text-mdOnSurface">How we pray</h4>
                                    </div>
                                    <ul className="space-y-4 text-sm font-medium text-mdOnSurfaceVariant">
                                        <li className="flex gap-3"><span className="text-mdPrimary font-black">•</span> Morning & Evening Intercession</li>
                                        <li className="flex gap-3"><span className="text-mdPrimary font-black">•</span> Weekly Pastoral Prayer Meetings</li>
                                        <li className="flex gap-3"><span className="text-mdPrimary font-black">•</span> Confidential Spiritual Support</li>
                                    </ul>
                                </div>
                                <div className="glass-card p-8 bg-mdSecondary/10 border-none group">
                                    <div className="flex items-center gap-4 mb-6 text-mdSecondary">
                                        <div className="w-12 h-12 rounded-2xl bg-mdSecondary text-white flex items-center justify-center text-2xl shadow-premium group-hover:scale-110 transition-transform">
                                            <FontAwesomeIcon icon={faWhatsapp} />
                                        </div>
                                        <h4 className="text-xl font-black">WhatsApp Support</h4>
                                    </div>
                                    <p className="text-sm font-medium text-mdOnSurfaceVariant mb-6 opacity-80 leading-relaxed">
                                        Connect with our assembly support team directly for fellowship, guidance, or assistance.
                                    </p>
                                    <a 
                                      href="https://wa.me/message/DMJE5W7QXC2MF1"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="btn-premium py-4 w-full flex items-center justify-center gap-3"
                                    >
                                        <FontAwesomeIcon icon={faWhatsapp} />
                                        Message Assembly
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* My Prayer Requests */}
                        {myPrayerRequests.length > 0 && (
                            <div className="mt-12">
                                <h2 className="text-3xl font-black text-mdOnSurface tracking-tighter mb-6 flex items-center gap-3">
                                    <span className="w-1.5 h-6 bg-mdPrimary rounded-full"></span>
                                    My Requests
                                </h2>
                                <div className="grid gap-4">
                                    {myPrayerRequests.map(pr => (
                                        <div key={pr.id} className="glass-card p-6 border-l-4 border-l-mdPrimary">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <p className="text-mdOnSurfaceVariant font-medium italic">"{pr.requestText}"</p>
                                                    <p className="text-[10px] font-black text-mdOutline uppercase tracking-widest mt-3">
                                                        Submitted {new Date(pr.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${
                                                    pr.status === 'Answered' ? 'bg-green-500/10 text-green-600' : 
                                                    pr.status === 'Prayed For' ? 'bg-mdPrimary/10 text-mdPrimary' : 
                                                    'bg-amber-500/10 text-amber-600'
                                                }`}>
                                                    {pr.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* 6. PROFILE */}
                {activeTab === 'profile' && (
                    <div className="animate-fade-in max-w-4xl mx-auto">
                        <div className="glass-card p-12 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-32 bg-mdPrimary/10"></div>
                            <div className="relative z-10">
                                <div className="group/avatar relative w-40 h-40 rounded-full mx-auto -mt-20 border-8 border-mdSurface shadow-xl overflow-hidden">
                                    {memberProfile?.profilePictureUrl ? (
                                        <img 
                                            src={memberProfile.profilePictureUrl} 
                                            alt="Profile" 
                                            className="w-full h-full object-cover cursor-zoom-in hover:scale-110 transition-transform duration-500"
                                            onClick={() => setLightboxImg(memberProfile.profilePictureUrl)}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-mdPrimary/5 flex items-center justify-center text-6xl font-black text-mdPrimary">
                                            {memberProfile?.name?.[0] || 'M'}
                                        </div>
                                    )}
                                    
                                            {/* Camera Overlay */}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white">
                                                <label className="flex flex-col items-center justify-center cursor-pointer p-4 hover:text-mdPrimary transition-colors">
                                                    <FontAwesomeIcon icon={faCamera} className="text-xl mb-1" />
                                                    <span className="text-[8px] font-black uppercase tracking-widest">Update</span>
                                                    <input 
                                                        type="file" 
                                                        className="hidden" 
                                                        accept="image/*" 
                                                        onChange={handleImageSelect}
                                                        disabled={isUploading}
                                                    />
                                                </label>
                                                
                                                {memberProfile?.profilePictureUrl && (
                                                    <button 
                                                        onClick={handleDeleteProfilePicture}
                                                        disabled={isUploading}
                                                        className="flex flex-col items-center justify-center p-4 hover:text-mdError transition-colors"
                                                        title="Remove Portrait"
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} className="text-xl mb-1" />
                                                        <span className="text-[8px] font-black uppercase tracking-widest">Remove</span>
                                                    </button>
                                                )}
                                            </div>

                                    {isUploading && (
                                        <div className="absolute inset-0 bg-mdPrimary/20 backdrop-blur-sm flex items-center justify-center">
                                            <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                </div>
                                <h2 className="text-4xl font-black text-mdOnSurface mt-8">{memberProfile?.name || 'Member'}</h2>
                                <p className="text-mdPrimary font-black text-sm uppercase tracking-widest mt-2">{memberProfile?.role || 'Valued Member'}</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12 text-left">
                                    <div className="p-6 bg-mdSurfaceVariant/10 rounded-2xl">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-mdOutline mb-2">Primary Email</p>
                                        <p className="font-black text-mdOnSurface">{memberProfile?.email}</p>
                                    </div>
                                    <div className="p-6 bg-mdSurfaceVariant/10 rounded-2xl">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-mdOutline mb-2">Member Strength</p>
                                        <p className="font-black text-mdOnSurface">Active Communitarian</p>
                                    </div>
                                </div>

                                <button onClick={() => setActiveTab('password')} className="mt-10 text-sm font-black text-mdPrimary hover:underline uppercase tracking-widest">
                                    Update Security Credentials
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 7. PASSWORD */}
                {activeTab === 'password' && (
                    <div className="animate-fade-in max-w-2xl mx-auto">
                        <ChangePassword userType="member" userId={memberId} />
                    </div>
                )}
            </div>

            {/* MODALS */}
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
            {lightboxImg && (
                <Lightbox 
                    src={lightboxImg} 
                    onClose={() => setLightboxImg(null)} 
                />
            )}
        </div>
    );
}
