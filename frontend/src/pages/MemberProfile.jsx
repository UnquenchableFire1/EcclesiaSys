import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentMemberProfile, updateMemberProfile, updateProfilePrivacy, uploadProfilePicture } from '../services/api';

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
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-600">Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-2 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-4 text-sm sm:text-base">
                    <p className="font-semibold">Error:</p>
                    <p>{error}</p>
                </div>
            )}

            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-4 text-sm sm:text-base">
                    <p className="font-semibold">Success:</p>
                    <p>{success}</p>
                </div>
            )}

            {profile && (
                <div className="space-y-4 sm:space-y-6">
                    {/* Profile Picture Section */}
                    <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 md:p-6 border-l-4 border-lemon">
                        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-tealDeep mb-4">Profile Picture</h2>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            {profile.profilePictureUrl ? (
                                <img 
                                    src={profile.profilePictureUrl} 
                                    alt="Profile" 
                                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg object-cover border-2 border-lemon"
                                />
                            ) : (
                                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg bg-gray-300 flex items-center justify-center text-gray-600">
                                    No Picture
                                </div>
                            )}
                            <label className="flex-1">
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleProfilePictureUpload}
                                    id="profilePictureInput"
                                    className="hidden"
                                />
                                <button 
                                    type="button"
                                    onClick={() => document.getElementById('profilePictureInput').click()}
                                    className="bg-tealDeep text-white px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg hover:bg-teal-700 transition font-semibold cursor-pointer"
                                >
                                    Upload Picture
                                </button>
                            </label>
                        </div>
                    </div>

                    {/* Profile Information Section */}
                    <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 md:p-6 border-l-4 border-lemon">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-tealDeep">Profile Information</h2>
                            <button
                                onClick={() => setEditing(!editing)}
                                className="bg-lemon text-tealDeep px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm rounded-lg hover:bg-yellow-400 transition font-semibold"
                            >
                                {editing ? 'Cancel' : 'Edit'}
                            </button>
                        </div>

                        <div className="space-y-3 sm:space-y-4">
                            <div>
                                <label className="text-gray-600 text-xs sm:text-sm">Full Name</label>
                                <p className="text-base sm:text-lg font-semibold text-tealDeep">{profile.firstName} {profile.lastName}</p>
                            </div>

                            <div>
                                <label className="text-gray-600 text-xs sm:text-sm">Email</label>
                                <p className="text-base sm:text-lg font-semibold text-tealDeep break-all">{profile.email}</p>
                            </div>

                            <div>
                                <label className="text-gray-600 text-xs sm:text-sm">Actual Email</label>
                                <p className="text-base sm:text-lg font-semibold text-tealDeep break-all">{profile.actualEmail}</p>
                            </div>

                            {editing ? (
                                <>
                                    <div>
                                        <label className="text-gray-600 text-xs sm:text-sm">Phone Number</label>
                                        <input
                                            type="text"
                                            value={formData.phoneNumber}
                                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                            className="w-full border-2 border-lemon p-2 sm:p-3 rounded focus:outline-none focus:border-tealDeep text-sm sm:text-base"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-gray-600 text-xs sm:text-sm">Bio</label>
                                        <textarea
                                            value={formData.bio}
                                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                            className="w-full border-2 border-lemon p-2 sm:p-3 rounded focus:outline-none focus:border-tealDeep h-24 text-sm sm:text-base"
                                            placeholder="Tell us about yourself"
                                        />
                                    </div>

                                    <button
                                        onClick={handleUpdateProfile}
                                        className="w-full sm:w-auto bg-tealDeep text-white px-4 sm:px-6 py-2 rounded font-semibold hover:bg-teal-700 transition text-sm sm:text-base"
                                    >
                                        Save Changes
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label className="text-gray-600 text-xs sm:text-sm">Phone Number</label>
                                        <p className="text-base sm:text-lg text-gray-700">{profile.phoneNumber || 'Not provided'}</p>
                                    </div>

                                    <div>
                                        <label className="text-gray-600 text-xs sm:text-sm">Bio</label>
                                        <p className="text-base sm:text-lg text-gray-700 break-words">{profile.bio || 'No bio provided'}</p>
                                    </div>

                                    <div>
                                        <label className="text-gray-600 text-xs sm:text-sm">Member Since</label>
                                        <p className="text-base sm:text-lg text-gray-700">
                                            {new Date(profile.joinedDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Privacy Settings Section */}
                    <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 md:p-6 border-l-4 border-lemon">
                        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-tealDeep mb-4">Privacy Settings</h2>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                            <div>
                                <p className="font-semibold text-tealDeep text-base sm:text-lg">Profile Visibility</p>
                                <p className="text-gray-600 text-sm">
                                    {formData.isProfilePublic 
                                        ? 'Your profile is visible to other members' 
                                        : 'Your profile is private'}
                                </p>
                            </div>
                            <button
                                onClick={handlePrivacyToggle}
                                className={`px-4 sm:px-6 py-2 rounded font-semibold transition text-sm sm:text-base whitespace-nowrap ${formData.isProfilePublic ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-green-500 text-white hover:bg-green-600'}`}
                            >
                                {formData.isProfilePublic ? 'Make Private' : 'Make Public'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
