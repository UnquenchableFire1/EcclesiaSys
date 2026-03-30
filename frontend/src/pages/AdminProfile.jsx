import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminProfile, updateAdminProfile } from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCalendarAlt, faPhone, faEnvelope, faInfoCircle, faCheck, faShieldAlt, faCamera } from '@fortawesome/free-solid-svg-icons';
import Lightbox from '../components/Lightbox';
import ImageCropperModal from '../components/ImageCropperModal';
import { useToast } from '../context/ToastContext';
import { uploadProfilePicture } from '../services/api';

export default function AdminProfile() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const { showToast } = useToast();
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [lightboxImg, setLightboxImg] = useState(null);
    const adminId = sessionStorage.getItem('userId');
    const [selectedImage, setSelectedImage] = useState(null);
    const [showCropper, setShowCropper] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const getDefaultAvatar = (gender, name) => {
        if (gender === 'male' || gender === 'Male') return 'https://avatar.iran.liara.run/public/boy';
        if (gender === 'female' || gender === 'Female') return 'https://avatar.iran.liara.run/public/girl';
        return `https://ui-avatars.com/api/?name=${name}&background=random`;
    };
    
    const [formData, setFormData] = useState({
        phoneNumber: '',
        bio: '',
        gender: 'unspecified'
    });

    useEffect(() => {
        const userType = sessionStorage.getItem('userType');
        if (userType !== 'admin') {
            navigate('/login');
            return;
        }

        fetchProfile();
    }, [navigate]);

    const fetchProfile = async () => {
        try {
            const response = await getAdminProfile(adminId);
            if (response.data.success) {
                const data = response.data.data;
                setProfile(data);
                setFormData({
                    phoneNumber: data.phoneNumber || '',
                    bio: data.bio || '',
                    gender: data.gender || 'unspecified'
                });
                
                // Update session storage details
                if (data.profilePictureUrl) {
                    sessionStorage.setItem('profilePictureUrl', data.profilePictureUrl);
                }
                if (data.email) {
                    sessionStorage.setItem('adminEmail', data.email);
                    sessionStorage.setItem('userEmail', data.email);
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
                showToast("Admin portrait synced with the sanctuary.", "success");
                setProfile(prev => ({
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

    const handleUpdateProfile = async () => {
        try {
            setIsUpdatingProfile(true);
            const response = await updateAdminProfile(adminId, formData);
            if (response.data.success) {
                showToast('Admin profile updated!', 'success');
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

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-mdPrimary/30 border-t-mdPrimary rounded-full animate-spin"></div>
                    <p className="text-mdOnSurfaceVariant text-lg font-bold animate-pulse">Securing admin sanctuary...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in space-y-6">


            {profile && (
                <>
                    {/* Admin Profile Header */}
                    <div className="glass-card p-10 flex flex-col md:flex-row gap-12 items-center md:items-start group">
                        <div className="relative">
                            <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-[3rem] p-1 bg-gradient-to-br from-mdPrimary/40 via-mdSecondary/40 to-mdPrimary/40 animate-gradient-slow group-hover:rotate-3 transition-transform duration-700 shadow-premium">
                                <div className="w-full h-full rounded-[2.9rem] bg-white dark:bg-mdSurface overflow-hidden relative">
                                    {profile.profilePictureUrl ? (
                                        <div className="relative w-full h-full group/image">
                                            <img 
                                                src={profile.profilePictureUrl} 
                                                alt="Profile" 
                                                className="w-full h-full object-cover cursor-zoom-in hover:scale-105 transition-transform duration-500"
                                                onClick={() => setLightboxImg(profile.profilePictureUrl)}
                                            />
                                            {/* Camera Overlay */}
                                            <label className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white">
                                                <FontAwesomeIcon icon={faCamera} className="text-xl mb-1" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Change</span>
                                                <input 
                                                    type="file" 
                                                    className="hidden" 
                                                    accept="image/*" 
                                                    onChange={handleImageSelect}
                                                    disabled={isUploading}
                                                />
                                            </label>
                                        </div>
                                    ) : (
                                        <label className="w-full h-full flex flex-col items-center justify-center text-6xl font-black text-mdPrimary bg-mdPrimary/5 cursor-pointer hover:bg-mdPrimary/10 transition-colors">
                                            {profile.name.charAt(0)}
                                            <FontAwesomeIcon icon={faCamera} className="text-sm mt-2 opacity-30" />
                                            <input 
                                                type="file" 
                                                className="hidden" 
                                                accept="image/*" 
                                                onChange={handleImageSelect}
                                                disabled={isUploading}
                                            />
                                        </label>
                                    )}

                                    {isUploading && (
                                        <div className="absolute inset-0 bg-mdPrimary/20 backdrop-blur-sm flex items-center justify-center z-10">
                                            <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                    
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left pt-4">
                            <div className="space-y-2 mb-8">
                                <h1 className="text-4xl sm:text-5xl font-black text-mdOnSurface tracking-tighter">
                                    {profile.name}
                                </h1>
                                <p className="text-mdPrimary font-black text-[10px] uppercase tracking-[0.3em] opacity-70 flex items-center justify-center md:justify-start gap-2">
                                    <FontAwesomeIcon icon={faShieldAlt} /> System Administrator
                                </p>
                            </div>
                            
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                <div className="glass-card px-6 py-3 border-none flex items-center gap-3">
                                    <FontAwesomeIcon icon={faEnvelope} className="text-mdPrimary/60" />
                                    <span className="text-xs font-bold text-mdOnSurfaceVariant">{profile.email}</span>
                                </div>
                                <div className="glass-card px-6 py-3 border-none flex items-center gap-3">
                                    <FontAwesomeIcon icon={faCalendarAlt} className="text-mdPrimary/60" />
                                    <span className="text-xs font-bold text-mdOnSurfaceVariant">EcclesiaSys Sanctuary Access</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <div className="glass-card p-10">
                                <div className="flex justify-between items-center mb-10 pb-6 border-b border-mdOutline/5">
                                    <h3 className="text-2xl font-black text-mdOnSurface tracking-tight">Admin Credentials</h3>
                                    <button
                                        onClick={() => setEditing(!editing)}
                                        className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${editing ? 'bg-mdError/10 text-mdError' : 'bg-mdPrimary/10 text-mdPrimary hover:bg-mdPrimary hover:text-white'}`}
                                    >
                                        {editing ? 'Cancel Editing' : 'Modify Access'}
                                    </button>
                                </div>

                                {editing ? (
                                    <div className="space-y-8 animate-slide-up">
                                        <div className="grid sm:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-mdOutline ml-2">Phone Number</label>
                                                <input
                                                    type="text"
                                                    value={formData.phoneNumber}
                                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                                    className="w-full bg-mdSurfaceVariant/20 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-mdPrimary transition-all font-bold text-sm"
                                                    placeholder="+1 234 567 890"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-mdOutline ml-2">Gender Identification</label>
                                                <select
                                                    value={formData.gender}
                                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                                    className="w-full bg-mdSurfaceVariant/20 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-mdPrimary transition-all font-bold text-sm appearance-none"
                                                >
                                                    <option value="unspecified">Unspecified Space</option>
                                                    <option value="male">Male Identity</option>
                                                    <option value="female">Female Identity</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-mdOutline ml-2">Administrative Bio</label>
                                            <textarea
                                                value={formData.bio}
                                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                                className="w-full bg-mdSurfaceVariant/20 border-none rounded-[2rem] py-6 px-8 focus:ring-2 focus:ring-mdPrimary transition-all font-bold text-sm min-h-[160px] custom-scrollbar"
                                                placeholder="Professional administrative profile summary..."
                                            />
                                        </div>

                                        <button
                                            onClick={handleUpdateProfile}
                                            disabled={isUpdatingProfile}
                                            className="w-full bg-mdOnSurface text-mdSurface py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transform active:scale-95 transition-all shadow-lifted hover:bg-mdPrimary hover:text-white disabled:opacity-50"
                                        >
                                            {isUpdatingProfile ? 'Synching Sanctuary...' : 'Update Admin Records'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-8 animate-fade-in">
                                        <div className="grid sm:grid-cols-2 gap-8">
                                            <div className="glass-card bg-mdSurfaceVariant/5 border-none p-6">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-mdOutline mb-2">Secure Line</p>
                                                <p className="font-black text-mdOnSurface tracking-tight">{profile.phoneNumber || 'Unlinked'}</p>
                                            </div>
                                            <div className="glass-card bg-mdSurfaceVariant/5 border-none p-6">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-mdOutline mb-2">Gender Designation</p>
                                                <p className="font-black text-mdOnSurface tracking-tight capitalize">{profile.gender || 'Classified'}</p>
                                            </div>
                                        </div>

                                        <div className="glass-card bg-mdSurfaceVariant/5 border-none p-10 text-center">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-mdOutline mb-4">Official Bio</p>
                                            <p className="font-bold text-mdOnSurfaceVariant leading-loose italic">
                                                {profile.bio || "No administrative bio provided for this sanctuary."}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>



                            <div className="glass-card p-8 bg-mdSurfaceVariant/10 border-none space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-mdPrimary text-center">System Information</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center py-2 border-b border-mdOutline/5">
                                        <span className="text-[10px] font-bold text-mdOutline">Tier</span>
                                        <span className="text-[10px] font-black text-mdOnSurface uppercase">God Mode</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-mdOutline/5">
                                        <span className="text-[10px] font-bold text-mdOutline">Status</span>
                                        <span className="text-[10px] font-black text-mdSuccess uppercase">Encrypted</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                </>
            )}


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
        </div>
    );
}
