import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminProfile, updateAdminProfile, uploadProfilePicture, getProfilePictureHistory, selectProfilePicture } from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCamera, faCalendarAlt, faPhone, faEnvelope, faInfoCircle, faCheck } from '@fortawesome/free-solid-svg-icons';

export default function AdminProfile() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [previewUrl, setPreviewUrl] = useState(null);
    const [history, setHistory] = useState([]);
    const [fetchingHistory, setFetchingHistory] = useState(false);
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
            const updateData = {
                phoneNumber: formData.phoneNumber,
                bio: formData.bio,
                gender: formData.gender
            };
            
            const response = await updateAdminProfile(adminId, updateData);
            if (response.data.success) {
                setSuccess('Profile updated successfully!');
                setEditing(false);
                fetchProfile();
            } else {
                setError(response.data.message || 'Failed to update profile');
            }
        } catch (err) {
            setError('Error updating profile: ' + err.message);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleProfilePictureUpload = async () => {
        const fileInput = document.getElementById('adminProfilePictureInput');
        const file = fileInput.files?.[0];
        if (!file) return;

        try {
            setError('');
            setSuccess('');
            
            const formDataObj = new FormData();
            formDataObj.append('file', file);
            formDataObj.append('userId', adminId);
            formDataObj.append('userType', 'admin');

            const response = await uploadProfilePicture(formDataObj);
            if (response.data.success) {
                setSuccess('Profile picture uploaded successfully!');
                setPreviewUrl(null);
                fetchProfile();
                fetchHistory();
            } else {
                setError(response.data.message || 'Failed to upload profile picture');
            }
        } catch (err) {
            setError('Error uploading profile picture: ' + err.message);
        }
    };

    const handleSelectFromHistory = async (url) => {
        try {
            setError('');
            setSuccess('');
            const response = await selectProfilePicture(adminId, 'admin', url);
            if (response.data.success) {
                setSuccess('Profile picture updated from history!');
                fetchProfile();
            } else {
                setError(response.data.message || 'Failed to update profile picture');
            }
        } catch (err) {
            setError('Error selecting profile picture: ' + err.message);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <p className="text-mdOnSurfaceVariant text-lg font-bold animate-pulse">Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in space-y-6">
            {error && (
                <div className="bg-mdErrorContainer text-mdError px-6 py-4 rounded-3xl shadow-sm text-sm sm:text-base animate-pulse font-medium mb-6">
                    <p className="font-bold mb-1">Error</p>
                    <p>{error}</p>
                </div>
            )}

            {success && (
                <div className="bg-mdPrimaryContainer text-mdPrimary px-6 py-4 rounded-3xl shadow-sm text-sm sm:text-base animate-fade-in font-medium mb-6">
                    <p className="font-bold mb-1">Success</p>
                    <p>{success}</p>
                </div>
            )}

            {profile && (
                <>
                    <div className="bg-mdSurface rounded-[2rem] shadow-sm border border-mdSurfaceVariant p-6 sm:p-8 flex flex-col md:flex-row gap-8 items-center md:items-start transition-all hover:shadow-md2">
                        <div className="relative group">
                            {previewUrl ? (
                                <div className="relative">
                                    <img 
                                        src={previewUrl} 
                                        alt="Preview" 
                                        className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-mdPrimary shadow-lifted transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center">
                                        <button 
                                            onClick={handleProfilePictureUpload}
                                            className="bg-mdPrimary text-white px-4 py-2 rounded-full text-xs font-black shadow-premium hover:bg-mdSecondary transition-all animate-bounce"
                                        >
                                            UPLOAD NOW
                                        </button>
                                    </div>
                                    <button 
                                        onClick={() => setPreviewUrl(null)}
                                        className="absolute -top-2 -right-2 bg-mdError text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md hover:bg-red-700 transition-colors"
                                    >
                                        &times;
                                    </button>
                                </div>
                            ) : profile.profilePictureUrl ? (
                                <img 
                                    src={profile.profilePictureUrl} 
                                    alt="Profile" 
                                    className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-mdPrimaryContainer shadow-md1 transition-transform group-hover:scale-105 duration-300"
                                />
                            ) : (
                                <img 
                                    src={getDefaultAvatar(profile.gender, profile.name)}
                                    alt="Default Avatar" 
                                    className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-mdPrimaryContainer shadow-md1 transition-transform group-hover:scale-105 duration-300"
                                />
                            )}
                            <label className="absolute bottom-0 right-0 bg-mdPrimary hover:bg-mdSecondary text-mdOnPrimary w-10 h-10 rounded-full flex items-center justify-center shadow-md2 cursor-pointer transition-colors duration-200">
                                <FontAwesomeIcon icon={faCamera} />
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleFileChange}
                                    id="adminProfilePictureInput"
                                    className="hidden"
                                />
                            </label>
                        </div>

                        <div className="flex-1 text-center md:text-left space-y-2">
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-mdOnSurface tracking-tight">
                                {profile.name}
                            </h2>
                            <p className="text-mdPrimary font-bold">{profile.email}</p>
                             <div className="inline-flex mt-2 bg-mdSurfaceVariant/50 text-mdOnSurfaceVariant px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2">
                                <FontAwesomeIcon icon={faCalendarAlt} className="text-mdPrimary" />
                                Administrator
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="md:col-span-3 bg-mdSurface rounded-[2rem] shadow-sm border border-mdSurfaceVariant p-6 sm:p-8 hover:shadow-md2 transition-all">
                            <div className="flex justify-between items-center mb-8 pb-4 border-b border-mdSurfaceVariant">
                                <h3 className="text-xl font-extrabold text-mdOnSurface">Admin Profile Details</h3>
                                <button
                                    onClick={() => setEditing(!editing)}
                                    className="bg-mdSecondaryContainer text-mdSecondary px-4 py-2 text-sm rounded-full hover:bg-mdSecondary hover:text-mdOnSecondary transition-colors font-bold shadow-sm"
                                >
                                    {editing ? 'Cancel' : 'Edit Profile'}
                                </button>
                            </div>

                            <div className="space-y-6">
                                {editing ? (
                                    <div className="space-y-6 pt-4">
                                        <div className="grid sm:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-mdOnSurfaceVariant mb-2 ml-1">Phone Number</label>
                                                <input
                                                    type="text"
                                                    value={formData.phoneNumber}
                                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                                    className="w-full px-4 py-3 border border-mdOutline/30 rounded-2xl bg-mdSurface focus:outline-none focus:ring-2 focus:ring-mdPrimary focus:border-transparent transition-all duration-200"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-mdOnSurfaceVariant mb-2 ml-1">Gender</label>
                                                <select
                                                    value={formData.gender}
                                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                                    className="w-full px-4 py-3 border border-mdOutline/30 rounded-2xl bg-mdSurface focus:outline-none focus:ring-2 focus:ring-mdPrimary focus:border-transparent transition-all duration-200"
                                                >
                                                    <option value="unspecified">Unspecified</option>
                                                    <option value="male">Male</option>
                                                    <option value="female">Female</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-mdOnSurfaceVariant mb-2 ml-1">Bio</label>
                                            <textarea
                                                value={formData.bio}
                                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                                className="w-full px-4 py-3 border border-mdOutline/30 rounded-2xl bg-mdSurface focus:outline-none focus:ring-2 focus:ring-mdPrimary focus:border-transparent transition-all duration-200 min-h-[120px]"
                                                placeholder="Professional bio..."
                                            />
                                        </div>

                                        <button
                                            onClick={handleUpdateProfile}
                                            className="w-full mt-6 bg-mdPrimary text-mdOnPrimary font-bold py-3 rounded-full hover:bg-mdSecondary shadow-md1 hover:shadow-md2 transition-all duration-300 transform hover:-translate-y-0.5"
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="grid sm:grid-cols-2 gap-6">
                                            <div className="bg-mdSurfaceVariant/20 p-4 rounded-2xl border border-mdSurfaceVariant/50">
                                                <label className="text-mdOnSurfaceVariant text-xs font-bold uppercase tracking-wider mb-1 block">Phone Number</label>
                                                <p className="text-base font-semibold text-mdOnSurface">{profile.phoneNumber || 'Not provided'}</p>
                                            </div>
                                            <div className="bg-mdSurfaceVariant/20 p-4 rounded-2xl border border-mdSurfaceVariant/50">
                                                <label className="text-mdOnSurfaceVariant text-xs font-bold uppercase tracking-wider mb-1 block">Gender</label>
                                                <p className="text-base font-semibold text-mdOnSurface capitalize">{profile.gender || 'unspecified'}</p>
                                            </div>
                                        </div>

                                        <div className="bg-mdSurfaceVariant/20 p-4 rounded-2xl border border-mdSurfaceVariant/50">
                                            <label className="text-mdOnSurfaceVariant text-xs font-bold uppercase tracking-wider mb-1 block">Bio</label>
                                            <p className="text-base text-mdOnSurface leading-relaxed whitespace-pre-wrap">{profile.bio || 'No bio provided'}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {history.length > 0 && (
                        <div className="bg-mdSurface rounded-[2rem] shadow-sm border border-mdSurfaceVariant p-6 sm:p-8 hover:shadow-md2 transition-all mt-6">
                            <h3 className="text-xl font-extrabold text-mdOnSurface mb-6 pb-4 border-b border-mdSurfaceVariant">Previous Profile Pictures</h3>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                                {history.map((url, index) => (
                                    <div 
                                        key={index} 
                                        onClick={() => handleSelectFromHistory(url)}
                                        className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer border-2 transition-all hover:scale-105 ${profile.profilePictureUrl === url ? 'border-mdPrimary shadow-md' : 'border-transparent hover:border-mdPrimary/50'}`}
                                    >
                                        <img 
                                            src={url} 
                                            alt={`History ${index}`} 
                                            className="w-full h-full object-cover"
                                        />
                                        {profile.profilePictureUrl === url && (
                                            <div className="absolute inset-0 bg-mdPrimary/20 flex items-center justify-center">
                                                <div className="bg-mdPrimary text-white rounded-full p-1 shadow-sm">
                                                    <FontAwesomeIcon icon={faCheck} className="text-xs" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
