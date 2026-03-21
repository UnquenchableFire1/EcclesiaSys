import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentMemberProfile, updateMemberProfile, uploadProfilePicture, getProfilePictureHistory, selectProfilePicture, deleteProfilePicture } from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCamera, faCalendarAlt, faPhone, faEnvelope, faInfoCircle, faCheck, faQuoteLeft, faTrash, faSync } from '@fortawesome/free-solid-svg-icons';
import ImageCropperModal from '../components/ImageCropperModal';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../context/ToastContext';

export default function MemberProfile() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const { showToast } = useToast();
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        onConfirm: () => {}
    });
    const [previewUrl, setPreviewUrl] = useState(null);
    const [history, setHistory] = useState([]);
    const [fetchingHistory, setFetchingHistory] = useState(false);
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [isUploadingPortrait, setIsUploadingPortrait] = useState(false);
    const [isDeletingPortrait, setIsDeletingPortrait] = useState(false);
    const [imageToCrop, setImageToCrop] = useState(null);
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const memberId = sessionStorage.getItem('userId');

    const [formData, setFormData] = useState({
        phoneNumber: '',
        bio: ''
    });

    useEffect(() => {
        const userType = sessionStorage.getItem('userType');
        if (userType !== 'member') {
            navigate('/login');
            return;
        }

        fetchProfile();
        fetchHistory();
    }, [navigate]);

    const fetchHistory = async () => {
        try {
            setFetchingHistory(true);
            const response = await getProfilePictureHistory(memberId, 'member');
            if (response.data.success) {
                setHistory(response.data.history || []);
            }
        } catch (err) {
            console.error('Error fetching history', err);
        } finally {
            setFetchingHistory(false);
        }
    };

    const fetchProfile = async () => {
        try {
            const response = await getCurrentMemberProfile();
            if (response.data.success) {
                setProfile(response.data);
                setFormData({
                    phoneNumber: response.data.phoneNumber || '',
                    bio: response.data.bio || ''
                });
                
                if (response.data.profilePictureUrl) {
                    sessionStorage.setItem('profilePictureUrl', response.data.profilePictureUrl);
                }
                if (response.data.email) {
                    sessionStorage.setItem('memberEmail', response.data.email);
                    sessionStorage.setItem('userEmail', response.data.email);
                }
            } else {
                showToast('Failed to load profile', 'error');
            }
        } catch (err) {
            showToast('Error loading profile: ' + err.message, 'error');
            console.error('Error', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            
            const response = await updateMemberProfile(memberId, updateData);
            if (response.data.success) {
                showToast('Sanctuary records updated!', 'success');
                setEditing(false);
                fetchProfile();
            } else {
                showToast(response.data.message || 'Failed to update profile', 'error');
            }
        } catch (err) {
            showToast('Error updating profile: ' + err.message, 'error');
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setImageToCrop(reader.result);
            setIsCropperOpen(true);
        };
        reader.readAsDataURL(file);
    };

    const handleCropComplete = async (croppedFile) => {
        setIsCropperOpen(false);
        setImageToCrop(null);
        
        try {
            setIsUploadingPortrait(true);
            
            const formDataObj = new FormData();
            formDataObj.append('file', croppedFile);
            formDataObj.append('userId', memberId);
            formDataObj.append('userType', 'member');

            const response = await uploadProfilePicture(formDataObj);
            if (response.data.success) {
                showToast('Profile portrait updated!', 'success');
                await fetchProfile();
                await fetchHistory();
                
                const fileInput = document.getElementById('profilePictureInput');
                if (fileInput) fileInput.value = '';
                window.dispatchEvent(new Event('profileUpdated'));
            } else {
                showToast(response.data.message || 'Failed to upload profile picture', 'error');
            }
        } catch (err) {
            showToast('Error uploading profile picture: ' + err.message, 'error');
        } finally {
            setIsUploadingPortrait(false);
        }
    };

    const handleDeleteProfilePicture = () => {
        setConfirmModal({
            isOpen: true,
            onConfirm: async () => {
                try {
                    setIsDeletingPortrait(true);
                    const response = await deleteProfilePicture(memberId, 'member');
                    if (response.data.success) {
                        showToast('Profile picture deleted successfully.', 'success');
                        await fetchProfile();
                        await fetchHistory();
                        window.dispatchEvent(new Event('profileUpdated'));
                    } else {
                        showToast(response.data.message || 'Failed to delete profile picture', 'error');
                    }
                } catch (err) {
                    showToast('Error deleting profile picture: ' + err.message, 'error');
                } finally {
                    setIsDeletingPortrait(false);
                }
            }
        });
    };

    const handleSelectFromHistory = async (url) => {
        if (profile.profilePictureUrl === url) return;
        
        try {
            const response = await selectProfilePicture(memberId, 'member', url);
            if (response.data.success) {
                showToast('Profile identity updated from vault!', 'success');
                await fetchProfile();
                window.dispatchEvent(new Event('profileUpdated'));
            } else {
                showToast(response.data.message || 'Failed to update profile picture', 'error');
            }
        } catch (err) {
            showToast('Error selecting profile picture: ' + err.message, 'error');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-mdPrimary/30 border-t-mdPrimary rounded-full animate-spin"></div>
                    <p className="text-mdOnSurfaceVariant text-lg font-bold animate-pulse italic">Entering the profile sanctuary...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in space-y-6">


            {profile && (
                <>
                    {/* Premium Profile Header */}
                    <div className="glass-card p-10 flex flex-col md:flex-row gap-12 items-center md:items-start group rounded-[3rem] border-none shadow-premium">
                        <div className="relative">
                            <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-[3rem] p-1 bg-mdPrimary animate-gradient-slow group-hover:rotate-3 transition-transform duration-700 shadow-premium">
                                <div className="w-full h-full rounded-[2.9rem] bg-white overflow-hidden relative border-4 border-white shadow-inner">
                                    {profile.profilePictureUrl ? (
                                        <img 
                                            src={profile.profilePictureUrl} 
                                            alt="Profile" 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-6xl font-black text-mdPrimary bg-mdPrimary/5 italic">
                                            {profile.firstName.charAt(0)}
                                        </div>
                                    )}

                                    {isUploadingPortrait && (
                                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                                            <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mb-2"></div>
                                            <span className="text-[8px] font-black text-white uppercase tracking-widest text-center">Saving...</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="absolute -bottom-4 -right-4 flex flex-col gap-2">
                                <label className="w-15 h-15 bg-mdOnSurface text-white rounded-2xl flex items-center justify-center shadow-premium cursor-pointer hover:bg-mdPrimary hover:scale-110 transition-all duration-300 border-4 border-white">
                                    <FontAwesomeIcon icon={faCamera} className="text-xl" />
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={handleFileChange}
                                        id="profilePictureInput"
                                        className="hidden"
                                    />
                                </label>

                                {profile.profilePictureUrl && (
                                    <button 
                                        onClick={handleDeleteProfilePicture}
                                        disabled={isDeletingPortrait}
                                        className="w-15 h-15 bg-white text-mdError rounded-2xl flex items-center justify-center shadow-premium hover:bg-mdError hover:text-white hover:scale-110 transition-all duration-300 border-4 border-white disabled:opacity-50"
                                        title="Delete Profile Picture"
                                    >
                                        {isDeletingPortrait ? <FontAwesomeIcon icon={faSync} className="animate-spin" /> : <FontAwesomeIcon icon={faTrash} />}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left pt-4">
                            <div className="space-y-3 mb-8">
                                <h1 className="text-4xl sm:text-6xl font-black text-mdOnSurface tracking-tighter leading-none italic">
                                    {profile.firstName} {profile.lastName}
                                </h1>
                                <div className="flex items-center justify-center md:justify-start gap-4">
                                    <span className="px-4 py-1.5 rounded-full bg-mdPrimary/10 text-mdPrimary text-[10px] font-black uppercase tracking-[0.2em] border border-mdPrimary/10">
                                        Member Registry
                                    </span>
                                </div>
                            </div>
                            
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                <div className="glass-card px-6 py-4 border-none flex items-center gap-3 bg-mdSurfaceVariant/20 rounded-2xl">
                                    <FontAwesomeIcon icon={faEnvelope} className="text-mdPrimary" />
                                    <span className="text-xs font-black text-mdOnSurfaceVariant uppercase tracking-tighter">{profile.email}</span>
                                </div>
                                <div className="glass-card px-6 py-4 border-none flex items-center gap-3 bg-mdSecondary/10 rounded-2xl">
                                    <FontAwesomeIcon icon={faCalendarAlt} className="text-mdSecondary" />
                                    <span className="text-xs font-black text-mdOnSurfaceVariant uppercase tracking-tighter">EST. {new Date(profile.joinedDate).toLocaleDateString([], { month: 'long', year: 'numeric' })}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Information Section */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="glass-card p-12 rounded-[3.5rem] border-none shadow-premium">
                                <div className="flex justify-between items-center mb-12 pb-8 border-b border-mdOutline/5">
                                    <h3 className="text-3xl font-black text-mdOnSurface tracking-tighter italic">Personal Sanctuary</h3>
                                    <button
                                        onClick={() => setEditing(!editing)}
                                        className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-sm ${editing ? 'bg-mdError text-white' : 'bg-mdPrimary/5 text-mdPrimary hover:bg-mdPrimary hover:text-white shadow-lifted'}`}
                                    >
                                        {editing ? 'CANCEL' : 'MODIFY RECORDS'}
                                    </button>
                                </div>

                                {editing ? (
                                    <div className="space-y-10 animate-slide-up">
                                        <div className="grid sm:grid-cols-2 gap-10">
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-mdPrimary ml-2">Phone Line</label>
                                                <input
                                                    type="text"
                                                    value={formData.phoneNumber}
                                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                                    className="w-full bg-mdSurfaceVariant/30 border-none rounded-[1.5rem] py-5 px-8 focus:ring-4 focus:ring-mdPrimary/20 transition-all font-black text-sm tracking-tight shadow-inner"
                                                    placeholder="+1 234 567 890"
                                                />
                                            </div>
                                            <div className="space-y-4 opacity-40">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-mdOutline ml-2">Sanctuary Name</label>
                                                <div className="w-full bg-mdSurfaceVariant/10 border-none rounded-[1.5rem] py-5 px-8 font-black text-sm text-mdOnSurfaceVariant shadow-inner">
                                                    {profile.firstName} {profile.lastName}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-mdPrimary ml-2">Divine Bio</label>
                                            <textarea
                                                value={formData.bio}
                                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                                className="w-full bg-mdSurfaceVariant/30 border-none rounded-[2.5rem] py-8 px-10 focus:ring-4 focus:ring-mdPrimary/20 transition-all font-black text-sm min-h-[220px] custom-scrollbar leading-relaxed shadow-inner"
                                                placeholder="Share your spiritual journey..."
                                            />
                                        </div>

                                        <button
                                            onClick={handleUpdateProfile}
                                            disabled={isUpdatingProfile}
                                            className="w-full bg-mdPrimary text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] transform active:scale-95 transition-all shadow-premium hover:bg-mdSecondary"
                                        >
                                            {isUpdatingProfile ? 'SYNCHING...' : 'CONFIRM UPDATES'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-10 animate-fade-in">
                                        <div className="grid sm:grid-cols-2 gap-8">
                                            <div className="glass-card bg-mdSurfaceVariant/10 border-none p-8 rounded-[2rem] shadow-inner">
                                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-mdSecondary mb-3">Primary Contact</p>
                                                <p className="font-black text-xl text-mdOnSurface tracking-tighter">{profile.phoneNumber || 'UNLINKED'}</p>
                                            </div>
                                            <div className="glass-card bg-mdSurfaceVariant/10 border-none p-8 rounded-[2rem] shadow-inner">
                                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-mdPrimary mb-3">Official Email</p>
                                                <p className="font-black text-xl text-mdOnSurface tracking-tighter truncate">{profile.email}</p>
                                            </div>
                                        </div>

                                        <div className="glass-card bg-mdPrimary/5 border-none p-12 rounded-[3.5rem] shadow-inner relative overflow-hidden">
                                            <FontAwesomeIcon icon={faQuoteLeft} className="absolute top-8 left-8 text-4xl text-mdPrimary/10" />
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-mdPrimary mb-6 text-center">Spiritual Testimony</p>
                                            <p className="font-bold text-xl text-mdOnSurfaceVariant leading-loose italic text-center px-6">
                                                {profile.bio || "Speak your journey. Update your records to shared a personal testimony that will inspire the sanctuary."}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar Sections */}
                        <div className="space-y-8">
                             {/* Profile Vault Section */}
                            <div className="glass-card p-10 group rounded-[3rem] border-none shadow-premium bg-white">
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="w-12 h-12 rounded-2xl bg-mdPrimary/10 flex items-center justify-center text-mdPrimary shadow-inner">
                                        <FontAwesomeIcon icon={faCheck} className="text-xl" />
                                    </div>
                                    <h3 className="text-2xl font-black text-mdOnSurface tracking-tighter italic">Profile Vault</h3>
                                </div>
                                
                                {history.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-6">
                                        {history.map((url, index) => (
                                            <div 
                                                key={index} 
                                                onClick={() => handleSelectFromHistory(url)}
                                                className={`relative aspect-square rounded-[2rem] overflow-hidden cursor-pointer border-4 transition-all hover:scale-110 shadow-lifted ${profile.profilePictureUrl === url ? 'border-mdPrimary' : 'border-transparent opacity-40 hover:opacity-100'}`}
                                            >
                                                <img 
                                                    src={url} 
                                                    alt={`Vault ${index}`} 
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-20 text-center opacity-20">
                                        <FontAwesomeIcon icon={faCamera} className="text-5xl mb-6" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">Vault is empty</p>
                                    </div>
                                )}
                                
                                <p className="mt-10 text-[9px] font-black text-mdOutline text-center uppercase tracking-[0.2em] leading-loose opacity-60">
                                    Your historical sanctuary of divine identities
                                </p>
                            </div>
                            
                            <div className="glass-card p-10 bg-mdPrimary text-white border-none rounded-[3rem] shadow-premium group overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-6 text-white/60">Community Status</h4>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-3 border-b border-white/10">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Visibility</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest">Active</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Registry</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest">Verified</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {isCropperOpen && (
                <ImageCropperModal
                    image={imageToCrop}
                    onCropComplete={handleCropComplete}
                    onCancel={() => {
                        setIsCropperOpen(false);
                        setImageToCrop(null);
                        const fileInput = document.getElementById('memberProfilePictureInput');
                        if (fileInput) fileInput.value = '';
                    }}
                />
            )}
            <ConfirmModal 
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title="Remove Portrait?"
                message="Are you sure you want to permanently remove your current profile picture?"
                type="danger"
            />
        </div>
    );
}
