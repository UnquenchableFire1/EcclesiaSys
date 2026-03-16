import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentMemberProfile, updateMemberProfile, updateProfilePrivacy, uploadProfilePicture } from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCamera, faLock, faLockOpen, faCalendarAlt, faPhone, faEnvelope, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

export default function MemberProfile() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const memberId = localStorage.getItem('userId');
    
    const [formData, setFormData] = useState({
        phoneNumber: '',
        bio: '',
        isProfilePublic: true
    });

    useEffect(() => {
        const userType = localStorage.getItem('userType');
        if (userType !== 'member') {
            navigate('/login');
            return;
        }

        fetchProfile();
    }, [navigate]);

    const fetchProfile = async () => {
        try {
            const response = await getCurrentMemberProfile();
            if (response.data.success) {
                setProfile(response.data);
                setFormData({
                    phoneNumber: response.data.phoneNumber || '',
                    bio: response.data.bio || '',
                    isProfilePublic: response.data.isProfilePublic !== undefined ? response.data.isProfilePublic : true
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
                bio: formData.bio
            };
            
            const response = await updateMemberProfile(memberId, updateData);
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

    const handlePrivacyToggle = async () => {
        try {
            setError('');
            setSuccess('');
            const newPrivacySetting = !formData.isProfilePublic;
            
            const response = await updateProfilePrivacy(memberId, newPrivacySetting);
            if (response.data.success) {
                setFormData({ ...formData, isProfilePublic: newPrivacySetting });
                setSuccess(`Profile is now ${newPrivacySetting ? 'public' : 'private'}!`);
                fetchProfile();
            } else {
                setError(response.data.message || 'Failed to update privacy settings');
            }
        } catch (err) {
            setError('Error updating privacy settings: ' + err.message);
        }
    };

    const handleProfilePictureUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setError('');
            setSuccess('');
            
            const formDataObj = new FormData();
            formDataObj.append('file', file);
            formDataObj.append('memberId', memberId);

            const response = await uploadProfilePicture(formDataObj);
            if (response.data.success) {
                setSuccess('Profile picture uploaded successfully!');
                fetchProfile();
            } else {
                setError(response.data.message || 'Failed to upload profile picture');
            }
        } catch (err) {
            setError('Error uploading profile picture: ' + err.message);
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
                <div className="bg-mdErrorContainer text-mdError px-6 py-4 rounded-3xl shadow-sm text-sm sm:text-base animate-pulse font-medium">
                    <p className="font-bold mb-1">Error</p>
                    <p>{error}</p>
                </div>
            )}

            {success && (
                <div className="bg-mdPrimaryContainer text-mdPrimary px-6 py-4 rounded-3xl shadow-sm text-sm sm:text-base animate-fade-in font-medium">
                    <p className="font-bold mb-1">Success</p>
                    <p>{success}</p>
                </div>
            )}

            {profile && (
                <>
                    {/* Header Summary */}
                    <div className="bg-mdSurface rounded-[2rem] shadow-sm border border-mdSurfaceVariant p-6 sm:p-8 flex flex-col md:flex-row gap-8 items-center md:items-start transition-all hover:shadow-md2">
                        <div className="relative group">
                            {profile.profilePictureUrl ? (
                                <img 
                                    src={profile.profilePictureUrl} 
                                    alt="Profile" 
                                    className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-mdPrimaryContainer shadow-md1 transition-transform group-hover:scale-105 duration-300"
                                />
                            ) : (
                                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-mdSurfaceVariant flex items-center justify-center text-4xl border-4 border-mdPrimaryContainer shadow-md1 transition-transform group-hover:scale-105 duration-300">
                                    <FontAwesomeIcon icon={faUser} className="text-mdPrimary/50" />
                                </div>
                            )}
                            <label className="absolute bottom-0 right-0 bg-mdPrimary hover:bg-mdSecondary text-mdOnPrimary w-10 h-10 rounded-full flex items-center justify-center shadow-md2 cursor-pointer transition-colors duration-200">
                                <FontAwesomeIcon icon={faCamera} />
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleProfilePictureUpload}
                                    id="profilePictureInput"
                                    className="hidden"
                                />
                            </label>
                        </div>

                        <div className="flex-1 text-center md:text-left space-y-2">
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-mdOnSurface tracking-tight">
                                {profile.firstName} {profile.lastName}
                            </h2>
                            <p className="text-mdPrimary font-bold">{profile.email}</p>
                             <div className="inline-flex mt-2 bg-mdSurfaceVariant/50 text-mdOnSurfaceVariant px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2">
                                <FontAwesomeIcon icon={faCalendarAlt} className="text-mdPrimary" />
                                Member since {new Date(profile.joinedDate).toLocaleDateString()}
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Profile Information Section */}
                        <div className="md:col-span-2 bg-mdSurface rounded-[2rem] shadow-sm border border-mdSurfaceVariant p-6 sm:p-8 hover:shadow-md2 transition-all">
                            <div className="flex justify-between items-center mb-8 pb-4 border-b border-mdSurfaceVariant">
                                <h3 className="text-xl font-extrabold text-mdOnSurface">Personal Details</h3>
                                <button
                                    onClick={() => setEditing(!editing)}
                                    className="bg-mdSecondaryContainer text-mdSecondary px-4 py-2 text-sm rounded-full hover:bg-mdSecondary hover:text-mdOnSecondary transition-colors font-bold shadow-sm"
                                >
                                    {editing ? 'Cancel' : 'Edit Profile'}
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div className="bg-mdSurfaceVariant/20 p-4 rounded-2xl border border-mdSurfaceVariant/50">
                                        <label className="text-mdOnSurfaceVariant text-xs font-bold uppercase tracking-wider mb-1 block">Full Name</label>
                                        <p className="text-base font-semibold text-mdOnSurface">{profile.firstName} {profile.lastName}</p>
                                    </div>

                                    <div className="bg-mdSurfaceVariant/20 p-4 rounded-2xl border border-mdSurfaceVariant/50">
                                        <label className="text-mdOnSurfaceVariant text-xs font-bold uppercase tracking-wider mb-1 block">Actual Email</label>
                                        <p className="text-base font-semibold text-mdOnSurface truncate" title={profile.actualEmail}>{profile.actualEmail}</p>
                                    </div>
                                </div>

                                {editing ? (
                                    <div className="space-y-6 pt-4 border-t border-mdSurfaceVariant/50">
                                        <div className="bg-mdSurfaceVariant/10 p-5 rounded-2xl border border-mdPrimary/20">
                                            <div className="space-y-4">
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
                                                    <label className="block text-sm font-semibold text-mdOnSurfaceVariant mb-2 ml-1">Bio</label>
                                                    <textarea
                                                        value={formData.bio}
                                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                                        className="w-full px-4 py-3 border border-mdOutline/30 rounded-2xl bg-mdSurface focus:outline-none focus:ring-2 focus:ring-mdPrimary focus:border-transparent transition-all duration-200 min-h-[120px]"
                                                        placeholder="Tell us about yourself"
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                onClick={handleUpdateProfile}
                                                className="w-full mt-6 bg-mdPrimary text-mdOnPrimary font-bold py-3 rounded-full hover:bg-mdSecondary shadow-md1 hover:shadow-md2 transition-all duration-300 transform hover:-translate-y-0.5"
                                            >
                                                Save Changes
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="bg-mdSurfaceVariant/20 p-4 rounded-2xl border border-mdSurfaceVariant/50">
                                            <label className="text-mdOnSurfaceVariant text-xs font-bold uppercase tracking-wider mb-1 block">Phone Number</label>
                                            <p className="text-base font-semibold text-mdOnSurface">{profile.phoneNumber || 'Not provided'}</p>
                                        </div>

                                        <div className="bg-mdSurfaceVariant/20 p-4 rounded-2xl border border-mdSurfaceVariant/50">
                                            <label className="text-mdOnSurfaceVariant text-xs font-bold uppercase tracking-wider mb-1 block">Bio</label>
                                            <p className="text-base text-mdOnSurface leading-relaxed whitespace-pre-wrap">{profile.bio || 'No bio provided'}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Privacy Settings Section */}
                        <div className="md:col-span-1 bg-mdSurface rounded-[2rem] shadow-sm border border-mdSurfaceVariant p-6 sm:p-8 hover:shadow-md2 transition-all h-fit">
                            <h3 className="text-xl font-extrabold text-mdOnSurface mb-6 pb-4 border-b border-mdSurfaceVariant">Privacy</h3>
                            
                            <div className="bg-mdSurfaceVariant/10 p-5 rounded-2xl border border-mdSurfaceVariant/50 text-center space-y-4">
                                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl shadow-sm ${formData.isProfilePublic ? 'bg-mdPrimaryContainer text-mdPrimary' : 'bg-mdSurfaceVariant text-mdOnSurfaceVariant'}`}>
                                    <FontAwesomeIcon icon={formData.isProfilePublic ? faLockOpen : faLock} />
                                </div>
                                
                                <div>
                                    <p className="font-bold text-mdOnSurface text-lg mb-1">
                                        {formData.isProfilePublic ? 'Public Profile' : 'Private Profile'}
                                    </p>
                                    <p className="text-mdOnSurfaceVariant text-sm">
                                        {formData.isProfilePublic 
                                            ? 'Visible to other members.' 
                                            : 'Hidden from directory.'}
                                    </p>
                                </div>

                                <button
                                    onClick={handlePrivacyToggle}
                                    className={`w-full py-3 rounded-full font-bold shadow-sm transition-all duration-300 transform hover:-translate-y-0.5 ${
                                        formData.isProfilePublic 
                                        ? 'bg-mdErrorContainer text-mdError hover:bg-mdError hover:text-mdOnError' 
                                        : 'bg-mdPrimaryContainer text-mdPrimary hover:bg-mdPrimary hover:text-mdOnPrimary'
                                    }`}
                                >
                                    {formData.isProfilePublic ? 'Make Private' : 'Make Public'}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
