import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getMembers, deleteMember,
    getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement,
    getEvents, createEvent, updateEvent, deleteEvent,
    getSermons, uploadSermon, deleteSermon,
    uploadEventDocument
} from '../services/api';
import { downloadMembersAsExcel } from '../services/excelExport';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('members');
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
    const [theme, setTheme] = useState(() => localStorage.getItem('appTheme') || 'light');
    const [newAnnouncement, setNewAnnouncement] = useState({ title: '', message: '' });
    const [newEvent, setNewEvent] = useState({ title: '', description: '', eventDate: '', location: '', documentFile: null });
    const [newSermon, setNewSermon] = useState({ title: '', description: '', filePath: '', fileType: 'mp3' });

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < 768;

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('appTheme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    const handleLogout = () => {
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
            await createAnnouncement({ ...newAnnouncement, createdBy: adminId });
            setNewAnnouncement({ title: '', message: '' });
            await fetchAllData();
        } catch (error) {
            console.error('Error adding announcement:', error);
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
        try {
            await uploadSermon({ ...newSermon, uploadedBy: adminId });
            setNewSermon({ title: '', description: '', filePath: '', fileType: 'mp3' });
            await fetchAllData();
        } catch (error) {
            console.error('Error adding sermon:', error);
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
        <div className="min-h-screen bg-gray-50">
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

                        {/* Theme Toggle Button */}
                        <button
                            onClick={toggleTheme}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm rounded-lg transition font-semibold"
                            title="Toggle theme"
                        >
                            {theme === 'light' ? '🌙' : '☀️'}
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
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                        <p className="font-semibold">Error:</p>
                        <p>{error}</p>
                    </div>
                )}

            {/* Loading State */}
            {loading && <p className="text-center text-gray-600">Loading...</p>}

            {/* Members Tab */}
            {activeTab === 'members' && !loading && (
                <div className="space-y-4 sm:space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-tealDeep">Members</h2>
                        <button
                            onClick={() => downloadMembersAsExcel(members)}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 sm:px-6 py-2 rounded font-semibold transition text-sm sm:text-base whitespace-nowrap"
                        >
                            📥 Export to CSV
                        </button>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        {members.map(member => (
                            <div key={member.id} className="bg-white p-3 sm:p-4 rounded-lg shadow border-l-4 border-lemon flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-base sm:text-lg text-tealDeep">{member.name}</p>
                                    <p className="text-gray-600 text-xs sm:text-sm break-words">{member.email}</p>
                                </div>
                                <button
                                    onClick={() => handleDeleteMember(member.id)}
                                    className="bg-red-500 text-white px-2 sm:px-3 py-1 text-xs sm:text-sm rounded hover:bg-red-600 transition flex-shrink-0"
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Announcements Tab */}
            {activeTab === 'announcements' && !loading && (
                <div className="space-y-4 sm:space-y-6">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-tealDeep">Create Announcement</h2>
                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow space-y-4">
                        <input
                            type="text"
                            placeholder="Announcement Title"
                            value={newAnnouncement.title}
                            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                            className="w-full border-2 border-lemon p-2 sm:p-3 rounded focus:outline-none focus:border-tealDeep text-sm sm:text-base"
                        />
                        <textarea
                            placeholder="Announcement Message"
                            value={newAnnouncement.message}
                            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
                            className="w-full border-2 border-lemon p-2 sm:p-3 rounded focus:outline-none focus:border-tealDeep h-24 sm:h-32 text-sm sm:text-base"
                        />
                        <button
                            onClick={handleAddAnnouncement}
                            className="w-full sm:w-auto bg-tealDeep text-white px-4 sm:px-6 py-2 rounded font-semibold hover:bg-teal-700 transition text-sm sm:text-base"
                        >
                            Post Announcement
                        </button>
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-tealDeep mt-6 sm:mt-8">Announcements</h2>
                    <div className="space-y-4">
                        {announcements.map(ann => (
                            <div key={ann.id} className="bg-white p-3 sm:p-4 rounded-lg shadow border-l-4 border-lemon">
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-base sm:text-lg text-tealDeep">{ann.title}</p>
                                        <p className="text-gray-700 text-sm sm:text-base mt-2 break-words">{ann.message}</p>
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
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-tealDeep">Create Event</h2>
                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow space-y-4">
                        <input
                            type="text"
                            placeholder="Event Title"
                            value={newEvent.title}
                            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                            className="w-full border-2 border-lemon p-2 sm:p-3 rounded focus:outline-none focus:border-tealDeep text-sm sm:text-base"
                        />
                        <textarea
                            placeholder="Event Description"
                            value={newEvent.description}
                            onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                            className="w-full border-2 border-lemon p-2 sm:p-3 rounded focus:outline-none focus:border-tealDeep h-20 sm:h-24 text-sm sm:text-base"
                        />
                        <input
                            type="datetime-local"
                            value={newEvent.eventDate}
                            onChange={(e) => setNewEvent({ ...newEvent, eventDate: e.target.value })}
                            className="w-full border-2 border-lemon p-2 sm:p-3 rounded focus:outline-none focus:border-tealDeep text-sm sm:text-base"
                        />
                        <input
                            type="text"
                            placeholder="Event Location"
                            value={newEvent.location}
                            onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                            className="w-full border-2 border-lemon p-2 sm:p-3 rounded focus:outline-none focus:border-tealDeep text-sm sm:text-base"
                        />
                        <div>
                            <label className="block text-sm font-semibold text-tealDeep mb-2">Upload Event Document (PDF, DOCX, etc.)</label>
                            <input
                                type="file"
                                onChange={(e) => setNewEvent({ ...newEvent, documentFile: e.target.files[0] })}
                                accept=".pdf,.doc,.docx,.txt,.xlsx,.xls"
                                className="w-full border-2 border-lemon p-2 sm:p-3 rounded focus:outline-none focus:border-tealDeep text-sm sm:text-base"
                            />
                            {newEvent.documentFile && <p className="text-sm text-green-600 mt-1">✓ {newEvent.documentFile.name}</p>}
                        </div>
                        <button
                            onClick={handleAddEvent}
                            className="w-full sm:w-auto bg-tealDeep text-white px-4 sm:px-6 py-2 rounded font-semibold hover:bg-teal-700 transition text-sm sm:text-base"
                        >
                            Create Event
                        </button>
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-tealDeep mt-6 sm:mt-8">Events</h2>
                    <div className="grid grid-cols-1 gap-4">
                        {events.map(event => (
                            <div key={event.id} className="bg-white p-3 sm:p-4 rounded-lg shadow border-l-4 border-lemon">
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-base sm:text-lg text-tealDeep">{event.title}</p>
                                        <p className="text-gray-600 text-xs sm:text-sm mt-1">{new Date(event.eventDate).toLocaleString()}</p>
                                        <p className="text-gray-700 text-sm sm:text-base mt-2 break-words">{event.location}</p>
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
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-tealDeep">Upload Sermon</h2>
                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow space-y-4">
                        <input
                            type="text"
                            placeholder="Sermon Title"
                            value={newSermon.title}
                            onChange={(e) => setNewSermon({ ...newSermon, title: e.target.value })}
                            className="w-full border-2 border-lemon p-2 sm:p-3 rounded focus:outline-none focus:border-tealDeep text-sm sm:text-base"
                        />
                        <textarea
                            placeholder="Sermon Description"
                            value={newSermon.description}
                            onChange={(e) => setNewSermon({ ...newSermon, description: e.target.value })}
                            className="w-full border-2 border-lemon p-2 sm:p-3 rounded focus:outline-none focus:border-tealDeep h-20 sm:h-24 text-sm sm:text-base"
                        />
                        <select
                            value={newSermon.fileType}
                            onChange={(e) => setNewSermon({ ...newSermon, fileType: e.target.value })}
                            className="w-full border-2 border-lemon p-2 sm:p-3 rounded focus:outline-none focus:border-tealDeep text-sm sm:text-base"
                        >
                            <option value="mp3">Audio (MP3)</option>
                            <option value="mp4">Video (MP4)</option>
                        </select>
                        <input
                            type="text"
                            placeholder="File URL or Path"
                            value={newSermon.filePath}
                            onChange={(e) => setNewSermon({ ...newSermon, filePath: e.target.value })}
                            className="w-full border-2 border-lemon p-2 sm:p-3 rounded focus:outline-none focus:border-tealDeep text-sm sm:text-base"
                        />
                        <button
                            onClick={handleAddSermon}
                            className="w-full sm:w-auto bg-tealDeep text-white px-4 sm:px-6 py-2 rounded font-semibold hover:bg-teal-700 transition text-sm sm:text-base"
                        >
                            Upload Sermon
                        </button>
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-tealDeep mt-6 sm:mt-8">Sermons</h2>
                    <div className="grid grid-cols-1 gap-4">
                        {sermons.map(sermon => (
                            <div key={sermon.id} className="bg-white p-3 sm:p-4 rounded-lg shadow border-l-4 border-lemon flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-base sm:text-lg text-tealDeep">{sermon.title}</p>
                                    <p className="text-gray-600 text-xs sm:text-sm">{sermon.fileType.toUpperCase()}</p>
                                    <p className="text-gray-700 text-sm sm:text-base mt-2 break-words">{sermon.description}</p>
                                </div>
                                <button
                                    onClick={() => handleDeleteSermon(sermon.id)}
                                    className="bg-red-500 text-white px-2 sm:px-3 py-1 text-xs sm:text-sm rounded hover:bg-red-600 transition flex-shrink-0"
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            </div>
        </div>
    );
}

