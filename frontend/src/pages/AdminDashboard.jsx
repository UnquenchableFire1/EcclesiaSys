import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getMembers, deleteMember,
    getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement,
    getEvents, createEvent, updateEvent, deleteEvent,
    getSermons, createSermon, deleteSermon,
    uploadEventDocument
} from '../services/api';
import { downloadMembersAsExcel } from '../services/excelExport';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState(() => localStorage.getItem('adminActiveTab') || 'members');
    const [members, setMembers] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [events, setEvents] = useState([]);
    const [sermons, setSermons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [adminId] = useState(parseInt(localStorage.getItem('userId')));
    const [adminName] = useState(localStorage.getItem('userName'));
    const navigate = useNavigate();

    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [newAnnouncement, setNewAnnouncement] = useState({ title: '', message: '', file: null });
    const [newEvent, setNewEvent] = useState({ title: '', description: '', eventDate: '', location: '', documentFile: null });
    const [newSermon, setNewSermon] = useState({ title: '', description: '', speaker: '', sermonDate: '', file: null, fileType: 'mp3' });

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < 768;

    const handleLogout = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        localStorage.clear();
        navigate('/login');
    };
    useEffect(() => {
        const userType = localStorage.getItem('userType');
        if (userType !== 'admin') {
            navigate('/login');
        }
        fetchAllData();
    }, [navigate]);

    const fetchAllData = async () => {
        setLoading(true);
        setError('');
        try {
            const [membersRes, announcementsRes, eventsRes, sermonsRes] = await Promise.all([
                getMembers(),
                getAnnouncements(),
                getEvents(),
                getSermons()
            ]);
            setMembers(membersRes.data?.data || []);
            setAnnouncements(announcementsRes.data?.data || []);
            setEvents(eventsRes.data?.data || []);
            setSermons(sermonsRes.data?.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to load data: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    // Member Management
    const handleDeleteMember = async (id) => {
        if (window.confirm('Are you sure you want to delete this member?')) {
            try {
                await deleteMember(id);
                setMembers(members.filter(m => m.id !== id));
            } catch (error) {
                console.error('Error deleting member:', error);
            }
        }
    };

    // Announcement Management
    const handleAddAnnouncement = async () => {
        try {
            let announcementData = { ...newAnnouncement, createdBy: adminId };
            
            // Upload file if provided
            if (newAnnouncement.file) {
                const formData = new FormData();
                formData.append('file', newAnnouncement.file);
                
                try {
                    const fileResponse = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData
                    });
                    
                    if (fileResponse.ok) {
                        const fileData = await fileResponse.json();
                        announcementData.fileUrl = fileData.fileUrl || fileData.url;
                    }
                } catch (error) {
                    console.error('Error uploading file:', error);
                    alert('File upload failed, but announcement will be created');
                }
            }
            
            await createAnnouncement(announcementData);
            setNewAnnouncement({ title: '', message: '', file: null });
            await fetchAllData();
        } catch (error) {
            console.error('Error adding announcement:', error);
            alert('Error creating announcement: ' + error.message);
        }
    };

    const handleDeleteAnnouncement = async (id) => {
        if (window.confirm('Delete this announcement?')) {
            try {
                await deleteAnnouncement(id);
                await fetchAllData();
            } catch (error) {
                console.error('Error deleting announcement:', error);
            }
        }
    };

    // Event Management
    const handleAddEvent = async () => {
        try {
            let eventData = { ...newEvent, createdBy: adminId, documentUrl: null };
            
            // Upload document if provided
            if (newEvent.documentFile) {
                const formData = new FormData();
                formData.append('file', newEvent.documentFile);
                formData.append('eventId', 0); // Will be set after event creation
                
                try {
                    const docResponse = await uploadEventDocument(formData);
                    if (docResponse.data.success) {
                        eventData.documentUrl = docResponse.data.fileUrl;
                    }
                } catch (error) {
                    console.error('Error uploading document:', error);
                    alert('Document upload failed, but event will be created');
                }
            }
            
            await createEvent(eventData);
            setNewEvent({ title: '', description: '', eventDate: '', location: '', documentFile: null });
            await fetchAllData();
        } catch (error) {
            console.error('Error adding event:', error);
            alert('Error creating event: ' + error.message);
        }
    };

    const handleDeleteEvent = async (id) => {
        if (window.confirm('Delete this event?')) {
            try {
                await deleteEvent(id);
                await fetchAllData();
            } catch (error) {
                console.error('Error deleting event:', error);
            }
        }
    };

    // Sermon Management
    const handleAddSermon = async () => {
        // Validate required fields
        if (!newSermon.title.trim() || !newSermon.speaker.trim() || !newSermon.sermonDate.trim()) {
            alert('Please fill in Title, Speaker, and Date fields');
            return;
        }

        try {
            let sermonData = { 
                title: newSermon.title.trim(),
                description: newSermon.description.trim(),
                speaker: newSermon.speaker.trim(),
                sermonDate: newSermon.sermonDate,
                fileType: newSermon.fileType,
                createdBy: adminId
            };
            
            // Upload file if provided
            if (newSermon.file) {
                const formData = new FormData();
                formData.append('file', newSermon.file);
                formData.append('fileType', newSermon.fileType);
                
                try {
                    const fileResponse = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData
                    });
                    
                    if (fileResponse.ok) {
                        const fileData = await fileResponse.json();
                        if (newSermon.fileType === 'mp3') {
                            sermonData.audioUrl = fileData.fileUrl || fileData.url;
                        } else {
                            sermonData.videoUrl = fileData.fileUrl || fileData.url;
                        }
                    } else {
                        console.warn('File upload returned status:', fileResponse.status);
                        alert('File upload failed, but sermon will be created');
                    }
                } catch (error) {
                    console.error('Error uploading file:', error);
                    alert('File upload failed, but sermon will be created');
                }
            }
            
            console.log('Creating sermon with data:', sermonData);
            const response = await createSermon(sermonData);
            console.log('Sermon response:', response);
            
            if (response.data?.success || response.data?.data?.id) {
                setNewSermon({ title: '', description: '', speaker: '', sermonDate: '', file: null, fileType: 'mp3' });
                alert('Sermon created successfully!');
                await fetchAllData();
            } else {
                alert('Error creating sermon: ' + (response.data?.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error adding sermon:', error);
            alert('Error creating sermon: ' + error.message);
        }
    };

    const handleDeleteSermon = async (id) => {
        if (window.confirm('Delete this sermon?')) {
            try {
                await deleteSermon(id);
                await fetchAllData();
            } catch (error) {
                console.error('Error deleting sermon:', error);
            }
        }
    };

    const TabButton = ({ tab, label, icon }) => (
        <button
            onClick={() => {
                setActiveTab(tab);
                localStorage.setItem('adminActiveTab', tab);
                setMobileMenuOpen(false);
            }}
            className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-sm sm:text-base font-semibold transition whitespace-nowrap ${
                activeTab === tab
                    ? 'bg-white text-tealDeep border-b-4 border-lemon'
                    : 'text-white hover:bg-opacity-80'
            }`}
        >
            <span className="hidden sm:inline">{icon} </span>
            {label}
        </button>
    );

    return (
        <div className="min-h-screen bg-tealDeep">
            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-4">
                        <h3 className="text-lg font-bold text-tealDeep mb-4">Confirm Logout</h3>
                        <p className="text-gray-700 mb-6">Are you sure you want to logout?</p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 rounded-lg transition"
                            >
                                No
                            </button>
                            <button
                                onClick={confirmLogout}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition"
                            >
                                Yes
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Navigation Bar */}
            <div className="bg-tealDeep text-white sticky top-0 z-50 shadow-lg">
                <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6">
                    {/* Top row with title, menu button, and logout */}
                    <div className="flex justify-between items-center py-2 sm:py-3 gap-2">
                        <h1 className="text-lg sm:text-xl md:text-2xl font-bold flex-1">
                            Admin Dashboard
                        </h1>
                        
                        {/* Hamburger Menu Button - Mobile Only */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden bg-tealDeep hover:bg-teal-700 text-white px-3 py-2 rounded-lg transition"
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? '✕' : '☰'}
                        </button>

                        <button
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-600 text-white px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm md:text-base rounded-lg transition font-semibold flex-shrink-0"
                        >
                            {isMobile ? 'Logout' : `Logout (${adminName})`}
                        </button>
                    </div>

                    {/* Tabs row - Desktop (visible), Mobile dropdown (hidden until menu open) */}
                    <div className={`${mobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row gap-0 pb-2 md:pb-0`}>
                        <TabButton tab="members" label="Members" icon="👥" />
                        <TabButton tab="announcements" label="Announcements" icon="📢" />
                        <TabButton tab="events" label="Events" icon="📅" />
                        <TabButton tab="sermons" label="Sermons" icon="🎵" />
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
                {error && (
                    <div className="bg-red-900 border border-red-400 text-red-100 px-4 py-3 rounded-lg mb-4">
                        <p className="font-semibold">Error:</p>
                        <p>{error}</p>
                    </div>
                )}

            {/* Loading State */}
            {loading && <p className="text-center text-white text-lg">Loading...</p>}

            {/* Members Tab */}
            {activeTab === 'members' && !loading && (
                <div className="space-y-4 sm:space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-lemon">Members</h2>
                        <button
                            onClick={() => downloadMembersAsExcel(members)}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 sm:px-6 py-2 rounded font-semibold transition text-sm sm:text-base whitespace-nowrap"
                        >
                            📥 Export to Excel
                        </button>
                    </div>
                    <div className="overflow-x-auto bg-tealDeep rounded-lg shadow">
                        <table className="w-full text-white">
                            <thead className="bg-teal-800">
                                <tr>
                                    <th className="px-4 py-3 text-left font-bold text-lemon">First Name</th>
                                    <th className="px-4 py-3 text-left font-bold text-lemon">Last Name</th>
                                    <th className="px-4 py-3 text-left font-bold text-lemon">Phone Number</th>
                                    <th className="px-4 py-3 text-left font-bold text-lemon">System Email</th>
                                    <th className="px-4 py-3 text-left font-bold text-lemon">Personal Email</th>
                                    <th className="px-4 py-3 text-left font-bold text-lemon">Date Joined</th>
                                    <th className="px-4 py-3 text-center font-bold text-lemon">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {members.map((member, index) => (
                                    <tr key={member.id} className={`border-t border-teal-700 ${index % 2 === 0 ? 'bg-tealDeep' : 'bg-teal-900'} hover:bg-teal-700 transition`}>
                                        <td className="px-4 py-3 text-white">{member.firstName || member.name?.split(' ')[0] || 'N/A'}</td>
                                        <td className="px-4 py-3 text-white">{member.lastName || member.name?.split(' ')[1] || 'N/A'}</td>
                                        <td className="px-4 py-3 text-white">{member.phoneNumber || 'N/A'}</td>
                                        <td className="px-4 py-3 text-white truncate text-sm">{member.email || 'N/A'}</td>
                                        <td className="px-4 py-3 text-white truncate text-sm">{member.actualEmail || 'N/A'}</td>
                                        <td className="px-4 py-3 text-white text-sm">
                                            {member.joinedDate ? new Date(member.joinedDate).toLocaleString() : (member.createdAt ? new Date(member.createdAt).toLocaleString() : 'N/A')}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => handleDeleteMember(member.id)}
                                                className="bg-red-500 hover:bg-red-600 text-white px-2 sm:px-3 py-1 text-xs sm:text-sm rounded transition font-semibold"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {members.length === 0 && (
                            <div className="text-center py-8 text-white">
                                <p className="text-lg">No members registered yet</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Announcements Tab */}
            {activeTab === 'announcements' && !loading && (
                <div className="space-y-4 sm:space-y-6">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-lemon">Create Announcement</h2>
                    <div className="bg-teal-800 p-4 sm:p-6 rounded-lg shadow space-y-4">
                        <input
                            type="text"
                            placeholder="Announcement Title"
                            value={newAnnouncement.title}
                            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                            className="w-full border-2 border-lemon p-2 sm:p-3 rounded focus:outline-none focus:border-white bg-tealDeep text-white placeholder-gray-300 text-sm sm:text-base"
                        />
                        <textarea
                            placeholder="Announcement Message"
                            value={newAnnouncement.message}
                            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
                            className="w-full border-2 border-lemon p-2 sm:p-3 rounded focus:outline-none focus:border-white bg-tealDeep text-white placeholder-gray-300 h-24 sm:h-32 text-sm sm:text-base"
                        />
                        <div>
                            <label className="block text-sm font-semibold text-lemon mb-2">Upload File (Optional)</label>
                            <input
                                type="file"
                                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, file: e.target.files[0] })}
                                className="w-full border-2 border-lemon p-2 sm:p-3 rounded text-white bg-tealDeep text-sm sm:text-base"
                            />
                            {newAnnouncement.file && (
                                <p className="text-sm text-lemon mt-1">Selected: {newAnnouncement.file.name}</p>
                            )}
                        </div>
                        <button
                            onClick={handleAddAnnouncement}
                            className="w-full sm:w-auto bg-lemon text-tealDeep px-4 sm:px-6 py-2 rounded font-semibold hover:bg-yellow-300 transition text-sm sm:text-base"
                        >
                            Post Announcement
                        </button>
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-lemon mt-6 sm:mt-8">Announcements</h2>
                    <div className="space-y-4">
                        {announcements.map(ann => (
                            <div key={ann.id} className="bg-teal-800 p-3 sm:p-4 rounded-lg shadow border-l-4 border-lemon">
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-base sm:text-lg text-lemon">{ann.title}</p>
                                        <p className="text-white text-sm sm:text-base mt-2 break-words">{ann.message}</p>
                                        {ann.fileUrl && (
                                            <a 
                                                href={ann.fileUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-yellow-300 text-sm mt-2 inline-block hover:text-yellow-100 transition underline"
                                            >
                                                📎 Download File
                                            </a>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleDeleteAnnouncement(ann.id)}
                                        className="bg-red-500 text-white px-2 sm:px-3 py-1 text-xs sm:text-sm rounded hover:bg-red-600 transition flex-shrink-0"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Events Tab */}
            {activeTab === 'events' && !loading && (
                <div className="space-y-4 sm:space-y-6">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-lemon">Create Event</h2>
                    <div className="bg-teal-800 p-4 sm:p-6 rounded-lg shadow space-y-4">
                        <input
                            type="text"
                            placeholder="Event Title"
                            value={newEvent.title}
                            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                            className="w-full border-2 border-lemon p-2 sm:p-3 rounded focus:outline-none focus:border-white bg-tealDeep text-white placeholder-gray-300 text-sm sm:text-base"
                        />
                        <textarea
                            placeholder="Event Description"
                            value={newEvent.description}
                            onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                            className="w-full border-2 border-lemon p-2 sm:p-3 rounded focus:outline-none focus:border-white bg-tealDeep text-white placeholder-gray-300 h-20 sm:h-24 text-sm sm:text-base"
                        />
                        <input
                            type="datetime-local"
                            value={newEvent.eventDate}
                            onChange={(e) => setNewEvent({ ...newEvent, eventDate: e.target.value })}
                            className="w-full border-2 border-lemon p-2 sm:p-3 rounded focus:outline-none focus:border-white bg-tealDeep text-white text-sm sm:text-base"
                        />
                        <input
                            type="text"
                            placeholder="Event Location"
                            value={newEvent.location}
                            onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                            className="w-full border-2 border-lemon p-2 sm:p-3 rounded focus:outline-none focus:border-white bg-tealDeep text-white placeholder-gray-300 text-sm sm:text-base"
                        />
                        <div>
                            <label className="block text-sm font-semibold text-lemon mb-2">Upload Event Document (PDF, DOCX, etc.)</label>
                            <input
                                type="file"
                                onChange={(e) => setNewEvent({ ...newEvent, documentFile: e.target.files[0] })}
                                accept=".pdf,.doc,.docx,.txt,.xlsx,.xls"
                                className="w-full border-2 border-lemon p-2 sm:p-3 rounded focus:outline-none focus:border-white bg-tealDeep text-white text-sm sm:text-base"
                            />
                            {newEvent.documentFile && <p className="text-sm text-lemon mt-1">✓ {newEvent.documentFile.name}</p>}
                        </div>
                        <button
                            onClick={handleAddEvent}
                            className="w-full sm:w-auto bg-lemon text-tealDeep px-4 sm:px-6 py-2 rounded font-semibold hover:bg-yellow-300 transition text-sm sm:text-base"
                        >
                            Create Event
                        </button>
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-lemon mt-6 sm:mt-8">Events</h2>
                    <div className="grid grid-cols-1 gap-4">
                        {events.map(event => (
                            <div key={event.id} className="bg-teal-800 p-3 sm:p-4 rounded-lg shadow border-l-4 border-lemon">
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-base sm:text-lg text-lemon">{event.title}</p>
                                        <p className="text-yellow-200 text-xs sm:text-sm mt-1">{new Date(event.eventDate).toLocaleString()}</p>
                                        <p className="text-white text-sm sm:text-base mt-2 break-words">{event.location}</p>
                                        {event.description && (
                                            <p className="text-gray-200 text-sm mt-2">{event.description}</p>
                                        )}
                                        {event.documentFileUrl && (
                                            <a 
                                                href={event.documentFileUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-yellow-300 text-sm mt-2 inline-block hover:text-yellow-100 transition underline"
                                            >
                                                📄 Download Document
                                            </a>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleDeleteEvent(event.id)}
                                        className="bg-red-500 text-white px-2 sm:px-3 py-1 text-xs sm:text-sm rounded hover:bg-red-600 transition flex-shrink-0"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Sermons Tab */}
            {activeTab === 'sermons' && !loading && (
                <div className="space-y-4 sm:space-y-6">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-lemon">Upload Sermon</h2>
                    <div className="bg-teal-800 p-4 sm:p-6 rounded-lg shadow space-y-4">
                        <input
                            type="text"
                            placeholder="Sermon Title"
                            value={newSermon.title}
                            onChange={(e) => setNewSermon({ ...newSermon, title: e.target.value })}
                            className="w-full border-2 border-lemon p-2 sm:p-3 rounded focus:outline-none focus:border-white bg-tealDeep text-white placeholder-gray-300 text-sm sm:text-base"
                        />
                        <textarea
                            placeholder="Sermon Description"
                            value={newSermon.description}
                            onChange={(e) => setNewSermon({ ...newSermon, description: e.target.value })}
                            className="w-full border-2 border-lemon p-2 sm:p-3 rounded focus:outline-none focus:border-white bg-tealDeep text-white placeholder-gray-300 h-20 sm:h-24 text-sm sm:text-base"
                        />
                        <input
                            type="text"
                            placeholder="Sermon Speaker"
                            value={newSermon.speaker}
                            onChange={(e) => setNewSermon({ ...newSermon, speaker: e.target.value })}
                            className="w-full border-2 border-lemon p-2 sm:p-3 rounded focus:outline-none focus:border-white bg-tealDeep text-white placeholder-gray-300 text-sm sm:text-base"
                        />
                        <input
                            type="date"
                            value={newSermon.sermonDate}
                            onChange={(e) => setNewSermon({ ...newSermon, sermonDate: e.target.value })}
                            className="w-full border-2 border-lemon p-2 sm:p-3 rounded focus:outline-none focus:border-white bg-tealDeep text-white text-sm sm:text-base"
                        />
                        <select
                            value={newSermon.fileType}
                            onChange={(e) => setNewSermon({ ...newSermon, fileType: e.target.value })}
                            className="w-full border-2 border-lemon p-2 sm:p-3 rounded focus:outline-none focus:border-white bg-tealDeep text-white text-sm sm:text-base"
                        >
                            <option value="mp3" style={{color: 'black'}}>Audio (MP3)</option>
                            <option value="mp4" style={{color: 'black'}}>Video (MP4)</option>
                        </select>
                        <div>
                            <label className="block text-sm font-semibold text-lemon mb-2">Upload Sermon File</label>
                            <input
                                type="file"
                                accept="audio/*,video/*"
                                onChange={(e) => setNewSermon({ ...newSermon, file: e.target.files[0] })}
                                className="w-full border-2 border-lemon p-2 sm:p-3 rounded text-white bg-tealDeep text-sm sm:text-base"
                            />
                            {newSermon.file && (
                                <p className="text-sm text-lemon mt-1">Selected: {newSermon.file.name}</p>
                            )}
                        </div>
                        <button
                            onClick={handleAddSermon}
                            className="w-full sm:w-auto bg-lemon text-tealDeep px-4 sm:px-6 py-2 rounded font-semibold hover:bg-yellow-300 transition text-sm sm:text-base"
                        >
                            Upload Sermon
                        </button>
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-lemon mt-6 sm:mt-8">Sermons</h2>
                    <div className="grid grid-cols-1 gap-4">
                        {sermons.map(sermon => (
                            <div key={sermon.id} className="bg-teal-800 p-3 sm:p-4 rounded-lg shadow border-l-4 border-lemon flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-base sm:text-lg text-lemon">{sermon.title}</p>
                                    <p className="text-yellow-200 text-xs sm:text-sm">{sermon.fileType?.toUpperCase() || 'Audio'}</p>
                                    <p className="text-white text-sm sm:text-base mt-2 break-words">{sermon.description}</p>
                                    <p className="text-gray-300 text-xs sm:text-sm mt-1">Speaker: {sermon.speaker}</p>
                                    <div className="flex gap-2 mt-2">
                                        {sermon.audioUrl && (
                                            <a 
                                                href={sermon.audioUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-yellow-300 text-sm hover:text-yellow-100 transition underline"
                                            >
                                                🎵 Listen
                                            </a>
                                        )}
                                        {sermon.videoUrl && (
                                            <a 
                                                href={sermon.videoUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-yellow-300 text-sm hover:text-yellow-100 transition underline"
                                            >
                                                🎬 Watch
                                            </a>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeleteSermon(sermon.id)}
                                    className="bg-red-500 text-white px-2 sm:px-3 py-1 text-xs sm:text-sm rounded hover:bg-red-600 transition flex-shrink-0"
                                >
                                    Delete
                                </button>
                            </div>
                        ))}}
                    </div>
                </div>
            )}
            </div>
        </div>
    );
}

