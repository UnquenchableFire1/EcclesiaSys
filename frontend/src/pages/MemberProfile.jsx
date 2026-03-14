import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentMemberProfile, updateMemberProfile, updateProfilePrivacy, uploadProfilePicture } from '../services/api';
import analytics from '../services/analyticsTracker';

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

        analytics.trackPageView('Member Profile');
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
                analytics.trackError('Profile Load Failed', { reason: 'Failed to load profile' });
            }
        } catch (err) {
            setError('Error loading profile: ' + err.message);
            analytics.trackError('Profile Load Error', { message: err.message });
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
                analytics.trackUserAction('Profile Updated', { fields: Object.keys(updateData) });
                fetchProfile();
            } else {
                setError(response.data.message || 'Failed to update profile');
                analytics.trackError('Profile Update Failed', { message: response.data.message });
            }
        } catch (err) {
            setError('Error updating profile: ' + err.message);
            analytics.trackError('Profile Update Error', { message: err.message });
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
                analytics.trackUserAction('Privacy Setting Changed', { newSetting: newPrivacySetting ? 'public' : 'private' });
                fetchProfile();
            } else {
                setError(response.data.message || 'Failed to update privacy settings');
                analytics.trackError('Privacy Update Failed', { message: response.data.message });
            }
        } catch (err) {
            setError('Error updating privacy settings: ' + err.message);
            analytics.trackError('Privacy Update Error', { message: err.message });
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
                analytics.trackUserAction('Profile Picture Uploaded', { fileSize: file.size });
                fetchProfile();
            } else {
                setError(response.data.message || 'Failed to upload profile picture');
                analytics.trackError('Picture Upload Failed', { message: response.data.message });
            }
        } catch (err) {
            setError('Error uploading profile picture: ' + err.message);
            analytics.trackError('Picture Upload Error', { message: err.message });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <p className="text-gray-500 text-lg font-semibold">⏳ Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-5xl font-bold text-tealDeep mb-2">👤 My Profile</h2>
                <p className="text-xl text-gray-300">Manage your account information</p>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg shadow-sm">
                    <p className="font-semibold text-sm">Error:</p>
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {success && (
                <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg shadow-sm">
                    <p className="font-semibold text-sm">Success:</p>
                    <p className="text-sm">{success}</p>
                </div>
            )}

            {profile && (
                <div className="space-y-6">
                    {/* Profile Picture Section */}
                    <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-lemon">
                        <h3 className="text-2xl font-bold text-tealDeep mb-4">📷 Profile Picture</h3>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                            {profile.profilePictureUrl ? (
                                <img 
                                    src={profile.profilePictureUrl} 
                                    alt="Profile" 
                                    className="w-32 h-32 rounded-lg object-cover border-4 border-lemon shadow-md"
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 text-5xl border-2 border-gray-300">
                                    📸
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
                                    className="bg-gradient-to-r from-tealDeep to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-6 py-3 rounded-lg font-semibold cursor-pointer transition shadow-md"
                                >
                                    🖼️ Upload Photo
                                </button>
                                <p className="text-xs text-gray-500 mt-2">JPG, PNG or GIF (max 5MB)</p>
                            </label>
                        </div>
                    </div>

                    {/* Profile Information Section */}
                    <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-lemon">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-tealDeep">ℹ️ Profile Information</h3>
                            <button
                                onClick={() => setEditing(!editing)}
                                className={`px-6 py-2 rounded-lg font-semibold transition ${
                                    editing 
                                        ? 'bg-red-500 hover:bg-red-600 text-white' 
                                        : 'bg-lemon hover:bg-yellow-400 text-tealDeep'
                                }`}
                            >
                                {editing ? '❌ Cancel' : '✏️ Edit'}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-gray-600 text-sm font-semibold block mb-2">Full Name</label>
                                <p className="text-lg font-semibold text-tealDeep bg-gray-50 px-4 py-3 rounded-lg">{profile.firstName} {profile.lastName}</p>
                            </div>

                            <div>
                                <label className="text-gray-600 text-sm font-semibold block mb-2">System Email</label>
                                <p className="text-lg font-semibold text-tealDeep bg-gray-50 px-4 py-3 rounded-lg break-all">{profile.email}</p>
                            </div>

                            <div>
                                <label className="text-gray-600 text-sm font-semibold block mb-2">Personal Email</label>
                                <p className="text-lg font-semibold text-tealDeep bg-gray-50 px-4 py-3 rounded-lg break-all">{profile.actualEmail}</p>
                            </div>

                            <div>
                                <label className="text-gray-600 text-sm font-semibold block mb-2">Phone Number</label>
                                {editing ? (
                                    <input
                                        type="tel"
                                        value={formData.phoneNumber}
                                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        className="w-full border-2 border-lemon px-4 py-3 rounded-lg focus:outline-none focus:border-tealDeep focus:ring-2 focus:ring-yellow-100 transition"
                                        placeholder="(123) 456-7890"
                                    />
                                ) : (
                                    <p className="text-lg font-semibold text-tealDeep bg-gray-50 px-4 py-3 rounded-lg">{formData.phoneNumber || 'Not provided'}</p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-gray-600 text-sm font-semibold block mb-2">Bio</label>
                                {editing ? (
                                    <textarea
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        className="w-full border-2 border-lemon px-4 py-3 rounded-lg focus:outline-none focus:border-tealDeep focus:ring-2 focus:ring-yellow-100 transition h-24 resize-none"
                                        placeholder="Tell us about yourself..."
                                    />
                                ) : (
                                    <p className="text-lg text-tealDeep bg-gray-50 px-4 py-3 rounded-lg min-h-24 flex items-start">{formData.bio || 'No bio added yet'}</p>
                                )}
                            </div>
                        </div>

                        {editing && (
                            <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                                <button
                                    onClick={handleUpdateProfile}
                                    className="w-full bg-gradient-to-r from-tealDeep to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-6 py-3 rounded-lg font-semibold transition shadow-md"
                                >
                                    ✅ Save Changes
                                </button>
                                <button
                                    onClick={() => setEditing(false)}
                                    className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-lg font-semibold transition"
                                >
                                    ❌ Cancel
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Privacy Settings Section */}
                    <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-lemon">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-bold text-tealDeep mb-2">🔒 Privacy Settings</h3>
                                <p className="text-gray-600 text-sm">Control who can see your profile</p>
                            </div>
                            <button
                                onClick={handlePrivacyToggle}
                                className={`px-6 py-3 rounded-lg font-semibold transition ${
                                    formData.isProfilePublic
                                        ? 'bg-lemon hover:bg-yellow-400 text-tealDeep'
                                        : 'bg-red-500 hover:bg-red-600 text-white'
                                }`}
                            >
                                {formData.isProfilePublic ? '🌍 Public' : '🔐 Private'}
                            </button>
                        </div>
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <p className="text-gray-700 text-sm">
                                {formData.isProfilePublic
                                    ? '✅ Your profile is visible to all church members'
                                    : '🔒 Your profile is only visible to you'}
                            </p>
                        </div>
                    </div>

                    {/* Member Info Section */}
                    <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-lemon">
                        <h3 className="text-2xl font-bold text-tealDeep mb-4">📊 Member Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-gray-600 text-sm font-semibold block mb-2">Member Since</label>
                                <p className="text-lg font-semibold text-tealDeep bg-gray-50 px-4 py-3 rounded-lg">{new Date(profile.joinedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>

                            <div>
                                <label className="text-gray-600 text-sm font-semibold block mb-2">Account Status</label>
                                <p className="text-lg font-semibold text-tealDeep bg-green-50 px-4 py-3 rounded-lg border-l-4 border-green-500">✅ Active</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
