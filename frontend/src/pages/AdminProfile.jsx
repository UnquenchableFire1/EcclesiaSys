import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminProfile, updateAdminProfile, uploadProfilePicture, getProfilePictureHistory, selectProfilePicture, deleteProfilePicture } from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCamera, faCalendarAlt, faPhone, faEnvelope, faInfoCircle, faCheck, faShieldAlt, faTrash, faSync } from '@fortawesome/free-solid-svg-icons';
import ImageCropperModal from '../components/ImageCropperModal';

export default function AdminProfile() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [history, setHistory] = useState([]);
    const [fetchingHistory, setFetchingHistory] = useState(false);
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [isUploadingPortrait, setIsUploadingPortrait] = useState(false);
    const [isDeletingPortrait, setIsDeletingPortrait] = useState(false);
    const [imageToCrop, setImageToCrop] = useState(null);
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const adminId = sessionStorage.getItem('userId');

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
        fetchHistory();
    }, [navigate]);

    const fetchHistory = async () => {
        try {
            setFetchingHistory(true);
            const response = await getProfilePictureHistory(adminId, 'admin');
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
                setError('Failed to load profile');
            }
        } catch (err) {
            setError('Error loading profile: ' + err.message);
            console.error('Error', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            setError('');
            setSuccess('');
            setIsUpdatingProfile(true);
            const updateData = {
                phoneNumber: formData.phoneNumber,
                bio: formData.bio,
                gender: formData.gender
            };
            
            const response = await updateAdminProfile(adminId, updateData);
            if (response.data.success) {
                setSuccess('Admin profile updated!');
                setEditing(false);
                fetchProfile();
            } else {
                setError(response.data.message || 'Failed to update profile');
            }
        } catch (err) {
            setError('Error updating profile: ' + err.message);
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
            setError('');
            setSuccess('');
            setIsUploadingPortrait(true);
            
            const formDataObj = new FormData();
            formDataObj.append('file', croppedFile);
            formDataObj.append('userId', adminId);
            formDataObj.append('userType', 'admin');

            const response = await uploadProfilePicture(formDataObj);
            if (response.data.success) {
                setSuccess('Admin portrait updated!');
                await fetchProfile();
                await fetchHistory();
                
                const fileInput = document.getElementById('adminProfilePictureInput');
                if (fileInput) fileInput.value = '';
                window.dispatchEvent(new Event('profileUpdated'));
            } else {
                setError(response.data.message || 'Failed to upload profile picture');
            }
        } catch (err) {
            setError('Error uploading profile picture: ' + err.message);
        } finally {
            setIsUploadingPortrait(false);
        }
    };

    const handleDeleteProfilePicture = async () => {
        if (!window.confirm('Are you sure you want to remove your admin profile picture?')) return;

        try {
            setError('');
            setSuccess('');
            setIsDeletingPortrait(true);
            const response = await deleteProfilePicture(adminId, 'admin');
            if (response.data.success) {
                setSuccess('Admin profile picture deleted successfully.');
                await fetchProfile();
                await fetchHistory();
                window.dispatchEvent(new Event('profileUpdated'));
            } else {
                setError(response.data.message || 'Failed to delete profile picture');
            }
        } catch (err) {
            setError('Error deleting profile picture: ' + err.message);
        } finally {
            setIsDeletingPortrait(false);
        }
    };

    const handleSelectFromHistory = async (url) => {
        if (profile.profilePictureUrl === url) return;

        try {
            setError('');
            setSuccess('');
            const response = await selectProfilePicture(adminId, 'admin', url);
            if (response.data.success) {
                setSuccess('Profile picture updated from vault!');
                await fetchProfile();
                window.dispatchEvent(new Event('profileUpdated'));
            } else {
                setError(response.data.message || 'Failed to update profile picture');
            }
        } catch (err) {
            setError('Error selecting profile picture: ' + err.message);
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
            {error && (
                <div className="bg-mdError/10 text-mdError px-8 py-5 rounded-3xl mb-12 border border-mdError/20 flex items-center gap-4 shadow-sm">
                    <FontAwesomeIcon icon={faInfoCircle} />
                    <span className="font-bold">{error}</span>
                </div>
            )}

            {success && (
                <div className="bg-mdPrimary/10 text-mdPrimary px-8 py-5 rounded-3xl mb-12 border border-mdPrimary/20 flex items-center gap-4 shadow-sm animate-fade-in">
                    <FontAwesomeIcon icon={faCheck} />
                    <span className="font-bold">{success}</span>
                </div>
            )}

            {profile && (
                <>
                    {/* Admin Profile Header */}
                    <div className="glass-card p-10 flex flex-col md:flex-row gap-12 items-center md:items-start group">
                        <div className="relative">
                            <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-[3rem] p-1 bg-gradient-to-br from-mdPrimary/40 via-mdSecondary/40 to-mdPrimary/40 animate-gradient-slow group-hover:rotate-3 transition-transform duration-700 shadow-premium">
                                <div className="w-full h-full rounded-[2.9rem] bg-white dark:bg-mdSurface overflow-hidden relative">
                                    {profile.profilePictureUrl ? (
                                        <img 
                                            src={profile.profilePictureUrl} 
                                            alt="Profile" 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-6xl font-black text-mdPrimary bg-mdPrimary/5">
                                            {profile.name.charAt(0)}
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
                                <label className="w-14 h-14 bg-mdOnSurface text-mdSurface rounded-2xl flex items-center justify-center shadow-premium cursor-pointer hover:bg-mdPrimary hover:text-white hover:scale-110 transition-all duration-300">
                                    <FontAwesomeIcon icon={faCamera} className="text-xl" />
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={handleFileChange}
                                        id="adminProfilePictureInput"
                                        className="hidden"
                                    />
                                </label>

                                {profile.profilePictureUrl && (
                                    <button 
                                        onClick={handleDeleteProfilePicture}
                                        disabled={isDeletingPortrait}
                                        className="w-14 h-14 bg-white text-mdError rounded-2xl flex items-center justify-center shadow-premium hover:bg-mdError hover:text-white hover:scale-110 transition-all duration-300 disabled:opacity-50"
                                        title="Delete Admin Profile Picture"
                                    >
                                        {isDeletingPortrait ? <FontAwesomeIcon icon={faSync} className="animate-spin" /> : <FontAwesomeIcon icon={faTrash} />}
                                    </button>
                                )}
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

                        {/* Sidebar: Admin Vault */}
                        <div className="space-y-8">
                            <div className="glass-card p-8 group overflow-hidden relative">
                                <div className="absolute -top-12 -right-12 w-24 h-24 bg-mdPrimary/5 rounded-full blur-2xl group-hover:bg-mdPrimary/10 transition-all duration-700"></div>
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-10 h-10 rounded-xl bg-mdPrimary/10 flex items-center justify-center text-mdPrimary">
                                        <FontAwesomeIcon icon={faShieldAlt} className="text-sm" />
                                    </div>
                                    <h3 className="text-xl font-black text-mdOnSurface tracking-tighter">Admin Vault</h3>
                                </div>
                                
                                {history.length > 0 ? (
                                    <div className="grid grid-cols-3 gap-4">
                                        {history.map((url, index) => (
                                            <div 
                                                key={index} 
                                                onClick={() => handleSelectFromHistory(url)}
                                                className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer border-2 transition-all hover:scale-110 shadow-sm ${profile.profilePictureUrl === url ? 'border-mdPrimary' : 'border-transparent opacity-60 hover:opacity-100 hover:border-mdPrimary/40'}`}
                                            >
                                                <img 
                                                    src={url} 
                                                    alt={`Admin Vault ${index}`} 
                                                    className="w-full h-full object-cover"
                                                />
                                                {profile.profilePictureUrl === url && (
                                                    <div className="absolute inset-0 bg-mdPrimary/20 flex items-center justify-center backdrop-blur-[1px]">
                                                        <div className="w-6 h-6 rounded-full bg-mdPrimary text-white shadow-lifted flex items-center justify-center animate-bounce-in">
                                                            <FontAwesomeIcon icon={faCheck} className="text-[8px]" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-12 text-center opacity-30">
                                        <FontAwesomeIcon icon={faCamera} className="text-3xl mb-4" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Vault is empty</p>
                                    </div>
                                )}
                                
                                <p className="mt-8 text-[9px] font-bold text-mdOutline text-center uppercase tracking-widest leading-relaxed">
                                    Encrypted historical record of administrative portraits
                                </p>
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
                        const fileInput = document.getElementById('adminProfilePictureInput');
                        if (fileInput) fileInput.value = '';
                    }}
                />
            )}
        </div>
    );
}
