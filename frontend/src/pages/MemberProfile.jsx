import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { uploadProfilePicture, deleteProfilePicture, getMemberProfile, updateMemberProfile } from '../services/api';
import ImageCropperModal from '../components/ImageCropperModal';
import { faCamera, faTrash, faSpinner, faIdCard, faMapMarkerAlt, faPray, faBriefcase, faCrown, faEnvelope, faCalendarAlt, faStar, faUserShield, faPhone, faQuoteLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function MemberProfile({ onUpdate, autoEdit = false, memberIdProp = null }) {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(autoEdit);
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [lightboxImg, setLightboxImg] = useState(null);
    const [showMandatoryModal, setShowMandatoryModal] = useState(false);
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('identity');
    const memberId = memberIdProp || sessionStorage.getItem('userId');
    const isAdminViewing = !!memberIdProp;

    // Avatar state
    const [isUploading, setIsUploading] = useState(false);
    const [showCropper, setShowCropper] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const [formData, setFormData] = useState({
        phoneNumber: '',
        email: '',
        gender: '',
        bio: '',
        title: '',
        dateOfBirth: '',
        placeOfBirth: '',
        membershipType: '',
        maritalStatus: '',
        addressLine1: '',
        gpsAddress: '',
        hometown: '',
        streetName: '',
        city: '',
        postalCode: '',
        nationality: '',
        countryOfBirth: '',
        familyMemberName: '',
        relationship: '',
        residentialAddress: '',
        locality: '',
        landmark: '',
        holyGhostBaptism: '',
        dateOfHolySpiritBaptism: '',
        waterBaptism: '',
        dateOfWaterBaptism: '',
        dateOfConversion: '',
        formerChurch: '',
        dateOfJoining: '',
        placeOfBaptism: '',
        officiatingMinisterAtBaptism: '',
        officiatingMinisterDistrict: '',
        communicant: '',
        positionInChurch: '',
        otherAppointments: '',
        ministry: '',
        zone: '',
        occupation: '',
        humStatus: '',
        levelOfEducation: '',
        schoolName: '',
        schoolLocation: '',
        isEntrepreneur: '',
        isRetired: '',
        dateOfRetirement: '',
        hasDisability: '',
        natureOfDisability: '',
        assistiveDevice: '',
        royalStatus: '',
        traditionalArea: '',
        yearAppointed: '',
        parentGuardianName: '',
        parentGuardianContact: '',
        isDedicated: '',
        dedicationDate: '',
        officiatingMinisterAtDedication: '',
        dedicationChurch: ''
    });

    useEffect(() => {
        const userType = sessionStorage.getItem('userType');
        if (userType !== 'member' && !isAdminViewing) {
            navigate('/login');
            return;
        }

        fetchProfile();
    }, [navigate, isAdminViewing]);

    const fetchProfile = async () => {
        try {
            const response = await getMemberProfile(memberId);
            const m = response.data?.data || response.data;
            
            // Check for mandatory completion
            const isCompleted = m?.phoneNumber && m?.gender && m?.title && m?.membershipType;
            if (!isCompleted) {
                setShowMandatoryModal(true);
            }

            if (m) {
                setProfile(m);
                setFormData({
                    phoneNumber: m.phoneNumber || '',
                    email: m.email || '',
                    gender: m.gender || '',
                    bio: m.bio || '',
                    title: m.title || '',
                    dateOfBirth: m.dateOfBirth || '',
                    placeOfBirth: m.placeOfBirth || '',
                    membershipType: m.membershipType || '',
                    maritalStatus: m.maritalStatus || '',
                    addressLine1: m.addressLine1 || '',
                    gpsAddress: m.gpsAddress || '',
                    hometown: m.hometown || '',
                    streetName: m.streetName || '',
                    city: m.city || '',
                    postalCode: m.postalCode || '',
                    nationality: m.nationality || '',
                    countryOfBirth: m.countryOfBirth || '',
                    familyMemberName: m.familyMemberName || '',
                    relationship: m.relationship || '',
                    residentialAddress: m.residentialAddress || '',
                    locality: m.locality || '',
                    landmark: m.landmark || '',
                    holyGhostBaptism: m.holyGhostBaptism || '',
                    dateOfHolySpiritBaptism: m.dateOfHolySpiritBaptism || '',
                    waterBaptism: m.waterBaptism || '',
                    dateOfWaterBaptism: m.dateOfWaterBaptism || '',
                    dateOfConversion: m.dateOfConversion || '',
                    formerChurch: m.formerChurch || '',
                    dateOfJoining: m.dateOfJoining || '',
                    placeOfBaptism: m.placeOfBaptism || '',
                    officiatingMinisterAtBaptism: m.officiatingMinisterAtBaptism || '',
                    officiatingMinisterDistrict: m.officiatingMinisterDistrict || '',
                    communicant: m.communicant || '',
                    positionInChurch: m.positionInChurch || '',
                    otherAppointments: m.otherAppointments || '',
                    ministry: m.ministry || '',
                    zone: m.zone || '',
                    occupation: m.occupation || '',
                    humStatus: m.humStatus || '',
                    levelOfEducation: m.levelOfEducation || '',
                    schoolName: m.schoolName || '',
                    schoolLocation: m.schoolLocation || '',
                    isEntrepreneur: m.isEntrepreneur || '',
                    isRetired: m.isRetired || '',
                    dateOfRetirement: m.dateOfRetirement || '',
                    hasDisability: m.hasDisability || '',
                    natureOfDisability: m.natureOfDisability || '',
                    assistiveDevice: m.assistiveDevice || '',
                    royalStatus: m.royalStatus || '',
                    traditionalArea: m.traditionalArea || '',
                    yearAppointed: m.yearAppointed || '',
                    parentGuardianName: m.parentGuardianName || '',
                    parentGuardianContact: m.parentGuardianContact || '',
                    isDedicated: m.isDedicated || '',
                    dedicationDate: m.dedicationDate || '',
                    officiatingMinisterAtDedication: m.officiatingMinisterAtDedication || '',
                    dedicationChurch: m.dedicationChurch || ''
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
                showToast("Identity portrait updated.", "success");
                setProfile(prev => ({ ...prev, profilePictureUrl: response.data.profilePictureUrl }));
                sessionStorage.setItem('profilePictureUrl', response.data.profilePictureUrl);
                window.dispatchEvent(new Event('storage'));
                if (onUpdate) onUpdate();
            } else {
                showToast(response.data.message || "Upload failed.", "error");
            }
        } catch (err) {
            showToast("Server error during upload.", "error");
        } finally {
            setIsUploading(false);
            setSelectedImage(null);
        }
    };

    const handleDeleteProfilePicture = async () => {
        if (!window.confirm("Remove your assembly portrait?")) return;
        setIsUploading(true);
        try {
            const response = await deleteProfilePicture(memberId, 'member');
            if (response.data.success) {
                showToast("Portrait removed.", "success");
                setProfile(prev => ({ ...prev, profilePictureUrl: null }));
                sessionStorage.removeItem('profilePictureUrl');
                window.dispatchEvent(new Event('storage'));
                if (onUpdate) onUpdate();
            }
        } catch (err) {
            showToast("Delete error.", "error");
        } finally {
            setIsUploading(false);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            setIsUpdatingProfile(true);
            const response = await updateMemberProfile(memberId, formData);
            if (response.data.success) {
                showToast(isAdminViewing ? 'Member records updated successfully!' : 'Assembly records updated!', 'success');
                setEditing(false);
                setShowMandatoryModal(false);
                fetchProfile();
                if (onUpdate) onUpdate();
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
            <div className="flex items-center justify-center p-12">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-mdPrimary/30 border-t-mdPrimary rounded-full animate-spin"></div>
                    <p className="text-mdOnSurfaceVariant text-lg font-bold animate-pulse italic">Entering the profile assembly...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`animate-fade-in space-y-6 ${isAdminViewing ? 'p-0 pb-12' : ''}`}>

            {/* MANDATORY PROFILE POPUP */}
            {showMandatoryModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-fade-in backdrop-blur-xl bg-mdPrimary/40">
                    <div className="relative glass-card w-full max-w-lg p-12 text-center rounded-[3rem] shadow-premium-lg bg-white border-none animate-bounce-subtle">
                        <div className="w-24 h-24 bg-mdSecondary/10 text-mdSecondary rounded-full flex items-center justify-center mx-auto mb-8 text-4xl">
                            <FontAwesomeIcon icon={faIdCard} />
                        </div>
                        <h2 className="text-3xl font-black text-mdOnSurface tracking-tighter mb-4">Official Records Required</h2>
                        <p className="text-mdOnSurfaceVariant font-bold leading-relaxed opacity-80 mb-10">
                            Peace be with you. To maintain the digital assembly registry, all members must complete their spiritual and personal records before proceeding.
                        </p>
                        <button 
                            onClick={() => {
                                setEditing(true);
                                setShowMandatoryModal(false);
                            }}
                            className="w-full bg-mdPrimary text-white py-6 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-premium hover:bg-mdSecondary transition-all flex items-center justify-center gap-3"
                        >
                            <FontAwesomeIcon icon={faArrowRight} />
                            COMPLETE RECORDS NOW
                        </button>
                    </div>
                </div>
            )}

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
                                            className="w-full h-full object-cover cursor-zoom-in hover:scale-105 transition-transform duration-500"
                                            onClick={() => setLightboxImg(profile.profilePictureUrl)}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-6xl font-black text-mdPrimary bg-mdPrimary/5 italic">
                                            {profile.firstName?.charAt(0)}
                                        </div>
                                    )}

                                    {/* Camera Overlay */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white">
                                        <div className="flex flex-col items-center gap-2">
                                            <label className="flex flex-col items-center justify-center cursor-pointer p-2 hover:text-mdPrimary transition-colors">
                                                <FontAwesomeIcon icon={faCamera} className="text-xl" />
                                                <span className="text-[8px] font-black uppercase tracking-widest mt-1">Update</span>
                                                <input 
                                                    type="file" 
                                                    className="hidden" 
                                                    accept="image/*" 
                                                    onChange={handleImageSelect}
                                                    disabled={isUploading}
                                                />
                                            </label>
                                            
                                            {profile.profilePictureUrl && (
                                                <button 
                                                    onClick={handleDeleteProfilePicture}
                                                    disabled={isUploading}
                                                    className="flex flex-col items-center justify-center p-2 hover:text-mdError transition-colors"
                                                    title="Remove Portrait"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} className="text-xl" />
                                                    <span className="text-[8px] font-black uppercase tracking-widest mt-1">Remove</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {isUploading && (
                                        <div className="absolute inset-0 bg-mdPrimary/20 backdrop-blur-sm flex items-center justify-center">
                                            <FontAwesomeIcon icon={faSpinner} className="text-3xl text-white animate-spin" />
                                        </div>
                                    )}
                                </div>
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
                                    <span className="text-xs font-black text-mdOnSurfaceVariant uppercase tracking-tighter">EST. {new Date(profile.joinedDate || Date.now()).toLocaleDateString([], { month: 'long', year: 'numeric' })}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {!editing && (
                        <div className="flex justify-center -mt-8 mb-4">
                            <button 
                                onClick={() => setEditing(true)}
                                className="bg-mdPrimary text-white px-10 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-premium hover:bg-mdSecondary transition-all flex items-center gap-4 animate-bounce-subtle"
                            >
                                <FontAwesomeIcon icon={faIdCard} />
                                {isAdminViewing ? 'INSPECT & EDIT FULL RECORDS' : 'OPEN ASSEMBLY REGISTRY & COMPLETE RECORDS'}
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Information Section */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="glass-card p-12 rounded-[3.5rem] border-none shadow-premium">
                                {editing ? (
                                    <div className="space-y-12 animate-slide-up">
                                        {/* Tab Navigation */}
                                        <div className="flex flex-wrap gap-2 p-2 bg-mdSurfaceVariant/20 rounded-[2rem] border border-white">
                                            {[
                                                { id: 'identity', label: 'Identity', icon: faIdCard },
                                                { id: 'contact', label: 'Contact', icon: faMapMarkerAlt },
                                                { id: 'spiritual', label: 'Spiritual', icon: faPray },
                                                { id: 'vocation', label: 'Vocation', icon: faBriefcase },
                                                { id: 'heritage', label: 'Heritage', icon: faCrown }
                                            ].map(tab => (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => setActiveTab(tab.id)}
                                                    className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-mdPrimary text-white shadow-lifted' : 'text-mdOnSurfaceVariant hover:bg-mdPrimary/5'}`}
                                                >
                                                    <FontAwesomeIcon icon={tab.icon} />
                                                    <span className="hidden sm:inline">{tab.label}</span>
                                                </button>
                                            ))}
                                        </div>

                                        <div className="min-h-[400px] py-4">
                                            {/* Identity Tab */}
                                            {activeTab === 'identity' && (
                                                <div className="grid sm:grid-cols-2 gap-8 animate-fade-in">
                                                    <div className="space-y-4">
                                                        <label className="text-[9px] font-black uppercase tracking-widest text-mdPrimary ml-2">Spiritual Title</label>
                                                        <select value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="input-premium">
                                                            <option value="">Select Title</option>
                                                            <option value="Elder">Elder</option>
                                                            <option value="Deacon">Deacon</option>
                                                            <option value="Deaconess">Deaconess</option>
                                                            <option value="Sister">Sister</option>
                                                            <option value="Brother">Brother</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <label className="text-[9px] font-black uppercase tracking-widest text-mdPrimary ml-2">Gender</label>
                                                        <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="input-premium">
                                                            <option value="">Select Gender</option>
                                                            <option value="Male">Male</option>
                                                            <option value="Female">Female</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <label className="text-[9px] font-black uppercase tracking-widest text-mdPrimary ml-2">Email Address <span className="text-[8px] text-mdOnSurfaceVariant/50 font-medium normal-case tracking-normal">(read-only)</span></label>
                                                        <input type="email" value={formData.email} readOnly className="input-premium opacity-60 cursor-not-allowed" placeholder="Your email" />
                                                    </div>
                                                    <div className="space-y-4">
                                                        <label className="text-[9px] font-black uppercase tracking-widest text-mdPrimary ml-2">Date of Birth</label>
                                                        <input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})} className="input-premium" />
                                                    </div>
                                                    <div className="space-y-4">
                                                        <label className="text-[9px] font-black uppercase tracking-widest text-mdPrimary ml-2">Place of Birth</label>
                                                        <input type="text" value={formData.placeOfBirth} onChange={(e) => setFormData({...formData, placeOfBirth: e.target.value})} className="input-premium" placeholder="City, Region" />
                                                    </div>
                                                    <div className="space-y-4">
                                                        <label className="text-[9px] font-black uppercase tracking-widest text-mdPrimary ml-2">Membership Status</label>
                                                        <select value={formData.membershipType} onChange={(e) => setFormData({...formData, membershipType: e.target.value})} className="input-premium">
                                                            <option value="">Select Status</option>
                                                            <option value="By birth">By Birth</option>
                                                            <option value="Transfer">Transfer</option>
                                                            <option value="New Convert">New Convert</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <label className="text-[9px] font-black uppercase tracking-widest text-mdPrimary ml-2">Marital Status</label>
                                                        <select value={formData.maritalStatus} onChange={(e) => setFormData({...formData, maritalStatus: e.target.value})} className="input-premium">
                                                            <option value="">Select Status</option>
                                                            <option value="Single">Single</option>
                                                            <option value="Married">Married</option>
                                                            <option value="Divorced">Divorced</option>
                                                            <option value="Separated">Separated</option>
                                                            <option value="Widowed">Widowed</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <label className="text-[9px] font-black uppercase tracking-widest text-mdPrimary ml-2">Nationality</label>
                                                        <input type="text" value={formData.nationality} onChange={(e) => setFormData({...formData, nationality: e.target.value})} className="input-premium" placeholder="Country" />
                                                    </div>
                                                    <div className="space-y-4">
                                                        <label className="text-[9px] font-black uppercase tracking-widest text-mdPrimary ml-2">Country of Birth</label>
                                                        <input type="text" value={formData.countryOfBirth} onChange={(e) => setFormData({...formData, countryOfBirth: e.target.value})} className="input-premium" placeholder="Country" />
                                                    </div>
                                                    <div className="col-span-full space-y-4">
                                                        <label className="text-[9px] font-black uppercase tracking-widest text-mdPrimary ml-2">Spiritual Bio</label>
                                                        <textarea value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="input-premium min-h-[120px] py-6" placeholder="Share your journey..." />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Contact & Address Tab */}
                                            {activeTab === 'contact' && (
                                                <div className="grid sm:grid-cols-2 gap-8 animate-fade-in">
                                                    <div className="col-span-full space-y-4">
                                                        <label className="text-[9px] font-black uppercase tracking-widest text-mdPrimary ml-2">Digital Signal (Phone)</label>
                                                        <input type="text" value={formData.phoneNumber} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} className="input-premium" placeholder="+123 456 789" />
                                                    </div>
                                                    <div className="space-y-4">
                                                        <label className="text-[9px] font-black uppercase tracking-widest text-mdPrimary ml-2">Residential Address</label>
                                                        <input type="text" value={formData.addressLine1} onChange={(e) => setFormData({...formData, addressLine1: e.target.value})} className="input-premium" placeholder="House No / Street" />
                                                    </div>
                                                    <div className="space-y-4">
                                                        <label className="text-[9px] font-black uppercase tracking-widest text-mdPrimary ml-2">GPS Digital Address</label>
                                                        <input type="text" value={formData.gpsAddress} onChange={(e) => setFormData({...formData, gpsAddress: e.target.value})} className="input-premium" placeholder="GA-123-4567" />
                                                    </div>
                                                    <div className="space-y-4">
                                                        <label className="text-[9px] font-black uppercase tracking-widest text-mdPrimary ml-2">Hometown</label>
                                                        <input type="text" value={formData.hometown} onChange={(e) => setFormData({...formData, hometown: e.target.value})} className="input-premium" placeholder="Town / Region" />
                                                    </div>
                                                    <div className="space-y-4">
                                                        <label className="text-[9px] font-black uppercase tracking-widest text-mdPrimary ml-2">Street Name</label>
                                                        <input type="text" value={formData.streetName} onChange={(e) => setFormData({...formData, streetName: e.target.value})} className="input-premium" placeholder="Main St" />
                                                    </div>
                                                    <div className="space-y-4">
                                                        <label className="text-[9px] font-black uppercase tracking-widest text-mdPrimary ml-2">City</label>
                                                        <input type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="input-premium" placeholder="Accra" />
                                                    </div>
                                                    <div className="space-y-4">
                                                        <label className="text-[9px] font-black uppercase tracking-widest text-mdPrimary ml-2">Postal Code</label>
                                                        <input type="text" value={formData.postalCode} onChange={(e) => setFormData({...formData, postalCode: e.target.value})} className="input-premium" placeholder="00233" />
                                                    </div>
                                                    <div className="space-y-4">
                                                        <label className="text-[9px] font-black uppercase tracking-widest text-mdPrimary ml-2">Locality</label>
                                                        <input type="text" value={formData.locality} onChange={(e) => setFormData({...formData, locality: e.target.value})} className="input-premium" placeholder="Neighborhood" />
                                                    </div>
                                                    <div className="space-y-4">
                                                        <label className="text-[9px] font-black uppercase tracking-widest text-mdPrimary ml-2">Landmark</label>
                                                        <input type="text" value={formData.landmark} onChange={(e) => setFormData({...formData, landmark: e.target.value})} className="input-premium" placeholder="Near Blue Station" />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Spiritual Tab */}
                                            {activeTab === 'spiritual' && (
                                                <div className="grid sm:grid-cols-2 gap-8 animate-fade-in">
                                                    <div className="space-y-4">
                                                        <label className="text-[9px] font-black uppercase tracking-widest text-mdPrimary ml-2">Holy Ghost Baptism</label>
                                                        <select value={formData.holyGhostBaptism} onChange={(e) => setFormData({...formData, holyGhostBaptism: e.target.value})} className="input-premium">
                                                            <option value="">Select</option>
                                                            <option value="Yes">Yes</option>
                                                            <option value="No">No</option>
                                                        </select>
                                                    </div>
                                                    {formData.holyGhostBaptism === 'Yes' && (
                                                        <div className="space-y-4 animate-slide-up">
                                                            <label className="text-[9px] font-black uppercase tracking-widest text-mdPrimary ml-2">Baptism Date</label>
                                                            <input type="date" value={formData.dateOfHolySpiritBaptism} onChange={(e) => setFormData({...formData, dateOfHolySpiritBaptism: e.target.value})} className="input-premium" />
                                                        </div>
                                                    )}

                                                    <div className="space-y-4">
                                                        <label className="text-[9px] font-black uppercase tracking-widest text-mdPrimary ml-2">Water Baptism</label>
                                                        <select value={formData.waterBaptism} onChange={(e) => setFormData({...formData, waterBaptism: e.target.value})} className="input-premium">
                                                            <option value="">Select</option>
                                                            <option value="Yes">Yes</option>
                                                            <option value="No">No</option>
                                                        </select>
                                                    </div>
                                                    {formData.waterBaptism === 'Yes' && (
                                                        <>
                                                            <div className="space-y-4 animate-slide-up">
                                                                <label className="text-[9px] font-black uppercase tracking-widest text-mdPrimary ml-2">Baptism Date</label>
                                                                <input type="date" value={formData.dateOfWaterBaptism} onChange={(e) => setFormData({...formData, dateOfWaterBaptism: e.target.value})} className="input-premium" />
                                                            </div>
                                                            <div className="space-y-4 animate-slide-up">
                                                                <label className="text-[9px] font-black uppercase tracking-widest text-mdPrimary ml-2">Place of Baptism</label>
                                                                <input type="text" value={formData.placeOfBaptism} onChange={(e) => setFormData({...formData, placeOfBaptism: e.target.value})} className="input-premium" placeholder="Town / Region" />
                                                            </div>
                                                            <div className="space-y-4 animate-slide-up">
                                                                <label className="text-[9px] font-black uppercase tracking-widest text-mdPrimary ml-2">Officiating Minister</label>
                                                                <input type="text" value={formData.officiatingMinisterAtBaptism} onChange={(e) => setFormData({...formData, officiatingMinisterAtBaptism: e.target.value})} className="input-premium" />
                                                            </div>
                                                            <div className="space-y-4 animate-slide-up">
                                                                <label className="text-[9px] font-black uppercase tracking-widest text-mdPrimary ml-2">Minister's District</label>
                                                                <input type="text" value={formData.officiatingMinisterDistrict} onChange={(e) => setFormData({...formData, officiatingMinisterDistrict: e.target.value})} className="input-premium" />
                                                            </div>
                                                            <div className="space-y-4 animate-slide-up">
                                                                <label className="text-[9px] font-black uppercase tracking-widest text-mdPrimary ml-2">Communicant Status</label>
                                                                <select value={formData.communicant} onChange={(e) => setFormData({...formData, communicant: e.target.value})} className="input-premium">
                                                                    <option value="">Select</option>
                                                                    <option value="Yes">Yes</option>
                                                                    <option value="No">No</option>
                                                                </select>
                                                            </div>
                                                        </>
                                                    )}

                                                    <div className="border-t border-mdOutline/5 col-span-full my-4"></div>

                                                    {formData.membershipType !== 'By birth' && formData.membershipType !== 'Transfer' && (
                                                        <div className="space-y-4 animate-slide-up">
                                                            <label className="text-[9px] font-black uppercase tracking-widest text-mdPrimary ml-2">Date of Conversion</label>
                                                            <input type="date" value={formData.dateOfConversion} onChange={(e) => setFormData({...formData, dateOfConversion: e.target.value})} className="input-premium" />
                                                        </div>
                                                    )}
                                                    
                                                    {formData.membershipType !== 'By birth' && (
                                                        <>
                                                            <div className="space-y-4 animate-slide-up">
                                                                <label className="text-[9px] font-black uppercase tracking-widest text-mdPrimary ml-2">Former Church</label>
                                                                <input type="text" value={formData.formerChurch} onChange={(e) => setFormData({...formData, formerChurch: e.target.value})} className="input-premium" />
                                                            </div>
                                                            <div className="space-y-4 animate-slide-up">
                                                                <label className="text-[9px] font-black uppercase tracking-widest text-mdPrimary ml-2">Joining Date</label>
                                                                <input type="date" value={formData.dateOfJoining} onChange={(e) => setFormData({...formData, dateOfJoining: e.target.value})} className="input-premium" />
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            )}

                                            {/* Life & vocation Tab */}
                                            {activeTab === 'vocation' && (
                                                <div className="grid sm:grid-cols-2 gap-8 animate-fade-in">
                                                    <div className="space-y-4">
                                                        <label className="text-[9px] font-black uppercase tracking-widest text-mdPrimary ml-2">Occupation <span className="text-mdError">*</span></label>
                                                        <input type="text" value={formData.occupation} onChange={(e) => setFormData({...formData, occupation: e.target.value})} className="input-premium border-mdPrimary/20" placeholder="Required" />
                                                    </div>
                                                    <div className="space-y-4">
                                                        <label className="text-[9px] font-black uppercase tracking-widest text-mdPrimary ml-2">Hum Status <span className="text-mdOnSurfaceVariant/50 font-medium normal-case text-[8px] tracking-normal">(optional)</span></label>
                                                        <input type="text" value={formData.humStatus} onChange={(e) => setFormData({...formData, humStatus: e.target.value})} className="input-premium" placeholder="e.g. Active" />
                                                    </div>
                                                    <div className="space-y-4">
                                                        <label className="text-[9px] font-black uppercase tracking-widest text-mdPrimary ml-2">Church Position</label>
                                                        <input type="text" value={formData.positionInChurch} onChange={(e) => setFormData({...formData, positionInChurch: e.target.value})} className="input-premium" placeholder="Roles played" />
                                                    </div>
                                                    <div className="space-y-4">
                                                        <label className="text-[9px] font-black uppercase tracking-widest text-mdPrimary ml-2">Ministry</label>
                                                        <select value={formData.ministry} onChange={(e) => setFormData({...formData, ministry: e.target.value})} className="input-premium">
                                                            <option value="">Select Ministry</option>
                                                            <option value="Youth">Youth Ministry</option>
                                                            <option value="Men's Ministry">Men's Ministry</option>
                                                            <option value="Women's Ministry">Women's Ministry</option>
                                                            <option value="Children's Ministry">Children's Ministry</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <label className="text-[9px] font-black uppercase tracking-widest text-mdPrimary ml-2">Zone</label>
                                                        <input type="text" value={formData.zone} onChange={(e) => setFormData({...formData, zone: e.target.value})} className="input-premium" />
                                                    </div>
                                                    <div className="space-y-4">
                                                        <label className="text-[9px] font-black uppercase tracking-widest text-mdPrimary ml-2">Education Level</label>
                                                        <input type="text" value={formData.levelOfEducation} onChange={(e) => setFormData({...formData, levelOfEducation: e.target.value})} className="input-premium" />
                                                    </div>
                                                    <div className="space-y-4">
                                                        <label className="text-[9px] font-black uppercase tracking-widest text-mdPrimary ml-2">School / Org Name</label>
                                                        <input type="text" value={formData.schoolName} onChange={(e) => setFormData({...formData, schoolName: e.target.value})} className="input-premium" />
                                                    </div>
                                                    <div className="space-y-4">
                                                        <label className="text-[9px] font-black uppercase tracking-widest text-mdPrimary ml-2">Work/School Locality</label>
                                                        <input type="text" value={formData.schoolLocation} onChange={(e) => setFormData({...formData, schoolLocation: e.target.value})} className="input-premium" />
                                                    </div>
                                                    <div className="space-y-4">
                                                        <label className="text-[9px] font-black uppercase tracking-widest text-mdPrimary ml-2">Entrepreneur?</label>
                                                        <select value={formData.isEntrepreneur} onChange={(e) => setFormData({...formData, isEntrepreneur: e.target.value})} className="input-premium">
                                                            <option value="">Select</option>
                                                            <option value="Yes">Yes</option>
                                                            <option value="No">No</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <label className="text-[9px] font-black uppercase tracking-widest text-mdPrimary ml-2">Retired?</label>
                                                        <select value={formData.isRetired} onChange={(e) => setFormData({...formData, isRetired: e.target.value})} className="input-premium">
                                                            <option value="">Select</option>
                                                            <option value="Yes">Yes</option>
                                                            <option value="No">No</option>
                                                        </select>
                                                    </div>
                                                    {formData.isRetired === 'Yes' && (
                                                        <div className="space-y-4 animate-slide-up">
                                                            <label className="text-[9px] font-black uppercase tracking-widest text-mdPrimary ml-2">Retirement Date</label>
                                                            <input type="date" value={formData.dateOfRetirement} onChange={(e) => setFormData({...formData, dateOfRetirement: e.target.value})} className="input-premium" />
                                                        </div>
                                                    )}
                                                    
                                                    <div className="border-t border-mdOutline/5 col-span-full my-4"></div>

                                                    <div className="space-y-4">
                                                        <label className="text-[9px] font-black uppercase tracking-widest text-mdPrimary ml-2">Any Disability?</label>
                                                        <select value={formData.hasDisability} onChange={(e) => setFormData({...formData, hasDisability: e.target.value})} className="input-premium">
                                                            <option value="">Select</option>
                                                            <option value="Yes">Yes</option>
                                                            <option value="No">No</option>
                                                        </select>
                                                    </div>
                                                    {formData.hasDisability === 'Yes' && (
                                                        <>
                                                            <div className="space-y-4 animate-slide-up">
                                                                <label className="text-[9px] font-black uppercase tracking-widest text-mdPrimary ml-2">Nature of Disability</label>
                                                                <input type="text" value={formData.natureOfDisability} onChange={(e) => setFormData({...formData, natureOfDisability: e.target.value})} className="input-premium" />
                                                            </div>
                                                            <div className="space-y-4 animate-slide-up">
                                                                <label className="text-[9px] font-black uppercase tracking-widest text-mdPrimary ml-2">Assistive Device</label>
                                                                <input type="text" value={formData.assistiveDevice} onChange={(e) => setFormData({...formData, assistiveDevice: e.target.value})} className="input-premium" />
                                                            </div>
                                                        </>
                                                    )}
                                                    <div className="col-span-full space-y-4">
                                                        <label className="text-[9px] font-black uppercase tracking-widest text-mdPrimary ml-2">Other Appointments (with dates)</label>
                                                        <textarea value={formData.otherAppointments} onChange={(e) => setFormData({...formData, otherAppointments: e.target.value})} className="input-premium min-h-[100px] py-4" />
                                                    </div>
                                                </div>
                                            )}

                                            {/* heritage Tab */}
                                            {activeTab === 'heritage' && (
                                                <div className="grid sm:grid-cols-2 gap-8 animate-fade-in">
                                                    <div className="space-y-4">
                                                        <label className="text-[9px] font-black uppercase tracking-widest text-mdPrimary ml-2">Family Contact Name</label>
                                                        <input type="text" value={formData.familyMemberName} onChange={(e) => setFormData({...formData, familyMemberName: e.target.value})} className="input-premium" />
                                                    </div>
                                                    <div className="space-y-4">
                                                        <label className="text-[9px] font-black uppercase tracking-widest text-mdPrimary ml-2">Relationship</label>
                                                        <input type="text" value={formData.relationship} onChange={(e) => setFormData({...formData, relationship: e.target.value})} className="input-premium" />
                                                    </div>
                                                    <div className="col-span-full space-y-4">
                                                        <label className="text-[9px] font-black uppercase tracking-widest text-mdPrimary ml-2">Residential Address / Landmarks</label>
                                                        <textarea value={formData.residentialAddress} onChange={(e) => setFormData({...formData, residentialAddress: e.target.value})} className="input-premium py-4" placeholder="Home No / Direction" />
                                                    </div>
                                                    
                                                    <div className="border-t border-mdOutline/5 col-span-full my-4"></div>

                                                    <div className="space-y-4">
                                                        <label className="text-[9px] font-black uppercase tracking-widest text-mdPrimary ml-2">Parent / Guardian Name</label>
                                                        <input type="text" value={formData.parentGuardianName} onChange={(e) => setFormData({...formData, parentGuardianName: e.target.value})} className="input-premium" />
                                                    </div>
                                                    <div className="space-y-4">
                                                        <label className="text-[9px] font-black uppercase tracking-widest text-mdPrimary ml-2">Guardian Contact</label>
                                                        <input type="text" value={formData.parentGuardianContact} onChange={(e) => setFormData({...formData, parentGuardianContact: e.target.value})} className="input-premium" />
                                                    </div>
                                                    
                                                    <div className="space-y-4">
                                                        <label className="text-[9px] font-black uppercase tracking-widest text-mdPrimary ml-2">Dedicated?</label>
                                                        <select value={formData.isDedicated} onChange={(e) => setFormData({...formData, isDedicated: e.target.value})} className="input-premium">
                                                            <option value="">Select</option>
                                                            <option value="Yes">Yes</option>
                                                            <option value="No">No</option>
                                                        </select>
                                                    </div>
                                                    {formData.isDedicated === 'Yes' && (
                                                        <>
                                                            <div className="space-y-4 animate-slide-up">
                                                                <label className="text-[9px] font-black uppercase tracking-widest text-mdPrimary ml-2">Dedication Date</label>
                                                                <input type="date" value={formData.dedicationDate} onChange={(e) => setFormData({...formData, dedicationDate: e.target.value})} className="input-premium" />
                                                            </div>
                                                            <div className="space-y-4 animate-slide-up">
                                                                <label className="text-[9px] font-black uppercase tracking-widest text-mdPrimary ml-2">Officiating Minister</label>
                                                                <input type="text" value={formData.officiatingMinisterAtDedication} onChange={(e) => setFormData({...formData, officiatingMinisterAtDedication: e.target.value})} className="input-premium" />
                                                            </div>
                                                            <div className="space-y-4 animate-slide-up">
                                                                <label className="text-[9px] font-black uppercase tracking-widest text-mdPrimary ml-2">Dedication Church</label>
                                                                <input type="text" value={formData.dedicationChurch} onChange={(e) => setFormData({...formData, dedicationChurch: e.target.value})} className="input-premium" />
                                                            </div>
                                                        </>
                                                    )}

                                                    <div className="border-t border-mdOutline/5 col-span-full my-4"></div>

                                                    <div className="space-y-4">
                                                        <label className="text-[9px] font-black uppercase tracking-widest text-mdPrimary ml-2">Royal Status?</label>
                                                        <select value={formData.royalStatus} onChange={(e) => setFormData({...formData, royalStatus: e.target.value})} className="input-premium">
                                                            <option value="">Select</option>
                                                            <option value="Yes">Yes</option>
                                                            <option value="No">No</option>
                                                        </select>
                                                    </div>
                                                    {formData.royalStatus === 'Yes' && (
                                                        <>
                                                            <div className="space-y-4 animate-slide-up">
                                                                <label className="text-[9px] font-black uppercase tracking-widest text-mdPrimary ml-2">Traditional Area</label>
                                                                <input type="text" value={formData.traditionalArea} onChange={(e) => setFormData({...formData, traditionalArea: e.target.value})} className="input-premium" />
                                                            </div>
                                                            <div className="space-y-4 animate-slide-up">
                                                                <label className="text-[9px] font-black uppercase tracking-widest text-mdPrimary ml-2">Year Appointed</label>
                                                                <input type="text" value={formData.yearAppointed} onChange={(e) => setFormData({...formData, yearAppointed: e.target.value})} className="input-premium" />
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={handleUpdateProfile}
                                            disabled={isUpdatingProfile}
                                            className="w-full bg-mdPrimary text-white py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] transform active:scale-95 transition-all shadow-premium hover:bg-mdSecondary"
                                        >
                                            {isUpdatingProfile ? 'SECURELY SAVING...' : (isAdminViewing ? 'OVERWRITE MEMBER RECORDS' : 'UPDATE REGISTRY')}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-10 animate-fade-in">
                                        {/* Status Cards */}
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="glass-card bg-mdPrimary/5 border-none p-10 rounded-[2.5rem] shadow-inner text-center group hover:bg-mdPrimary hover:text-white transition-all duration-700">
                                                <div className="w-14 h-14 bg-mdPrimary/10 group-hover:bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors">
                                                    <FontAwesomeIcon icon={faStar} className="text-mdPrimary group-hover:text-white" />
                                                </div>
                                                <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Rank</p>
                                                <p className="font-black text-xs uppercase tracking-widest">{profile.title || 'MEMBER'}</p>
                                            </div>
                                            <div className="glass-card bg-mdSecondary/5 border-none p-10 rounded-[2.5rem] shadow-inner text-center group hover:bg-mdSecondary hover:text-white transition-all duration-700">
                                                <div className="w-14 h-14 bg-mdSecondary/10 group-hover:bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors">
                                                    <FontAwesomeIcon icon={faUserShield} className="text-mdSecondary group-hover:text-white" />
                                                </div>
                                                <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Status</p>
                                                <p className="font-black text-xs uppercase tracking-widest">{profile.membershipType || 'REGISTERED'}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="flex items-center gap-6 p-8 bg-mdSurfaceVariant/10 rounded-[2rem]">
                                                <div className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl shadow-sm text-mdPrimary">
                                                    <FontAwesomeIcon icon={faPhone} />
                                                </div>
                                                <div>
                                                    <p className="text-[8px] font-black uppercase tracking-widest text-mdOnSurfaceVariant opacity-50">Signal</p>
                                                    <p className="font-black text-sm tracking-tight">{profile.phoneNumber || 'NO CONTACT'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6 p-8 bg-mdSurfaceVariant/10 rounded-[2rem]">
                                                <div className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl shadow-sm text-mdSecondary">
                                                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                                                </div>
                                                <div>
                                                    <p className="text-[8px] font-black uppercase tracking-widest text-mdOnSurfaceVariant opacity-50">Base</p>
                                                    <p className="font-black text-sm tracking-tight">{profile.city || 'GLOBAL ASSEMBLY'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="glass-card bg-mdPrimary/5 border-none p-12 rounded-[3.5rem] shadow-inner relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-mdPrimary/5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-1000"></div>
                                            <FontAwesomeIcon icon={faQuoteLeft} className="absolute top-8 left-8 text-4xl text-mdPrimary/10" />
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-mdPrimary mb-6 text-center">Spiritual Testimony</p>
                                            <p className="font-bold text-xl text-mdOnSurfaceVariant leading-[2] italic text-center px-6 relative z-10">
                                                {profile.bio || "Speak your journey. Update your records to shared a personal testimony that will inspire the assembly."}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar Sections */}
                        <div className="space-y-8">
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
