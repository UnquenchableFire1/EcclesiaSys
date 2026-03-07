import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getMembers, deleteMember,
    getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement,
    getEvents, createEvent, updateEvent, deleteEvent,
    getSermons, uploadSermon, deleteSermon
} from '../services/api';

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

    const [newAnnouncement, setNewAnnouncement] = useState({ title: '', message: '' });
    const [newEvent, setNewEvent] = useState({ title: '', description: '', eventDate: '', location: '' });
    const [newSermon, setNewSermon] = useState({ title: '', description: '', filePath: '', fileType: 'mp3' });

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
            await createEvent({ ...newEvent, createdBy: adminId });
            setNewEvent({ title: '', description: '', eventDate: '', location: '' });
            await fetchAllData();
        } catch (error) {
            console.error('Error adding event:', error);
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
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-semibold transition ${
                activeTab === tab
                    ? 'bg-white text-tealDeep border-b-4 border-lemon'
                    : 'text-white hover:bg-opacity-80'
            }`}
        >
            {icon} {label}
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation Bar */}
            <div className="bg-tealDeep text-white sticky top-0 z-10 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    {/* Top row with title and logout */}
                    <div className="flex justify-between items-center py-3">
                        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition font-semibold"
                        >
                            Logout ({adminName})
                        </button>
                    </div>

                    {/* Tabs row */}
                    <div className="flex gap-0">
                        <TabButton tab="members" label="Members" icon="👥" />
                        <TabButton tab="announcements" label="Announcements" icon="📢" />
                        <TabButton tab="events" label="Events" icon="📅" />
                        <TabButton tab="sermons" label="Sermons" icon="🎵" />
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
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
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-tealDeep">Members</h2>
                    <div className="grid grid-cols-1 gap-4">
                        {members.map(member => (
                            <div key={member.id} className="bg-white p-4 rounded-lg shadow border-l-4 border-lemon flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-tealDeep">{member.name}</p>
                                    <p className="text-gray-600 text-sm">{member.email}</p>
                                </div>
                                <button
                                    onClick={() => handleDeleteMember(member.id)}
                                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
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
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-tealDeep">Create Announcement</h2>
                    <div className="bg-white p-6 rounded-lg shadow space-y-4">
                        <input
                            type="text"
                            placeholder="Announcement Title"
                            value={newAnnouncement.title}
                            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                            className="w-full border-2 border-lemon p-2 rounded focus:outline-none focus:border-tealDeep"
                        />
                        <textarea
                            placeholder="Announcement Message"
                            value={newAnnouncement.message}
                            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
                            className="w-full border-2 border-lemon p-2 rounded focus:outline-none focus:border-tealDeep h-32"
                        />
                        <button
                            onClick={handleAddAnnouncement}
                            className="bg-tealDeep text-white px-6 py-2 rounded font-semibold hover:bg-teal-700 transition"
                        >
                            Post Announcement
                        </button>
                    </div>
                    <h2 className="text-2xl font-bold text-tealDeep mt-8">Announcements</h2>
                    <div className="space-y-4">
                        {announcements.map(ann => (
                            <div key={ann.id} className="bg-white p-4 rounded-lg shadow border-l-4 border-lemon">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-lg text-tealDeep">{ann.title}</p>
                                        <p className="text-gray-700 mt-2">{ann.message}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteAnnouncement(ann.id)}
                                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition ml-4"
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
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-tealDeep">Create Event</h2>
                    <div className="bg-white p-6 rounded-lg shadow space-y-4">
                        <input
                            type="text"
                            placeholder="Event Title"
                            value={newEvent.title}
                            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                            className="w-full border-2 border-lemon p-2 rounded focus:outline-none focus:border-tealDeep"
                        />
                        <textarea
                            placeholder="Event Description"
                            value={newEvent.description}
                            onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                            className="w-full border-2 border-lemon p-2 rounded focus:outline-none focus:border-tealDeep h-24"
                        />
                        <input
                            type="datetime-local"
                            value={newEvent.eventDate}
                            onChange={(e) => setNewEvent({ ...newEvent, eventDate: e.target.value })}
                            className="w-full border-2 border-lemon p-2 rounded focus:outline-none focus:border-tealDeep"
                        />
                        <input
                            type="text"
                            placeholder="Event Location"
                            value={newEvent.location}
                            onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                            className="w-full border-2 border-lemon p-2 rounded focus:outline-none focus:border-tealDeep"
                        />
                        <button
                            onClick={handleAddEvent}
                            className="bg-tealDeep text-white px-6 py-2 rounded font-semibold hover:bg-teal-700 transition"
                        >
                            Create Event
                        </button>
                    </div>
                    <h2 className="text-2xl font-bold text-tealDeep mt-8">Events</h2>
                    <div className="grid grid-cols-1 gap-4">
                        {events.map(event => (
                            <div key={event.id} className="bg-white p-4 rounded-lg shadow border-l-4 border-lemon">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-lg text-tealDeep">{event.title}</p>
                                        <p className="text-gray-600 text-sm mt-1">{new Date(event.eventDate).toLocaleString()}</p>
                                        <p className="text-gray-700 mt-2">{event.location}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteEvent(event.id)}
                                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
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
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-tealDeep">Upload Sermon</h2>
                    <div className="bg-white p-6 rounded-lg shadow space-y-4">
                        <input
                            type="text"
                            placeholder="Sermon Title"
                            value={newSermon.title}
                            onChange={(e) => setNewSermon({ ...newSermon, title: e.target.value })}
                            className="w-full border-2 border-lemon p-2 rounded focus:outline-none focus:border-tealDeep"
                        />
                        <textarea
                            placeholder="Sermon Description"
                            value={newSermon.description}
                            onChange={(e) => setNewSermon({ ...newSermon, description: e.target.value })}
                            className="w-full border-2 border-lemon p-2 rounded focus:outline-none focus:border-tealDeep h-24"
                        />
                        <select
                            value={newSermon.fileType}
                            onChange={(e) => setNewSermon({ ...newSermon, fileType: e.target.value })}
                            className="w-full border-2 border-lemon p-2 rounded focus:outline-none focus:border-tealDeep"
                        >
                            <option value="mp3">Audio (MP3)</option>
                            <option value="mp4">Video (MP4)</option>
                        </select>
                        <input
                            type="text"
                            placeholder="File URL or Path"
                            value={newSermon.filePath}
                            onChange={(e) => setNewSermon({ ...newSermon, filePath: e.target.value })}
                            className="w-full border-2 border-lemon p-2 rounded focus:outline-none focus:border-tealDeep"
                        />
                        <button
                            onClick={handleAddSermon}
                            className="bg-tealDeep text-white px-6 py-2 rounded font-semibold hover:bg-teal-700 transition"
                        >
                            Upload Sermon
                        </button>
                    </div>
                    <h2 className="text-2xl font-bold text-tealDeep mt-8">Sermons</h2>
                    <div className="grid grid-cols-1 gap-4">
                        {sermons.map(sermon => (
                            <div key={sermon.id} className="bg-white p-4 rounded-lg shadow border-l-4 border-lemon flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-lg text-tealDeep">{sermon.title}</p>
                                    <p className="text-gray-600 text-sm">{sermon.fileType.toUpperCase()}</p>
                                    <p className="text-gray-700 mt-2">{sermon.description}</p>
                                </div>
                                <button
                                    onClick={() => handleDeleteSermon(sermon.id)}
                                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
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

