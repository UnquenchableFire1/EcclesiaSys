import { useState, useEffect, useMemo } from 'react';
import { getAnnouncements, deleteAnnouncement } from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faBullhorn, 
    faClock, 
    faSearch, 
    faInfoCircle, 
    faTrashAlt, 
    faTimes 
} from '@fortawesome/free-solid-svg-icons';

export default function Announcements({ embedded = false }) {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = user.role === 'ADMIN';

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const response = await getAnnouncements();
            const data = response.data?.data || response.data || [];
            setAnnouncements(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to fetch announcements:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this announcement?')) {
            try {
                await deleteAnnouncement(id);
                setAnnouncements(announcements.filter(ann => ann.id !== id));
            } catch (err) {
                alert('Failed to delete announcement');
            }
        }
    };

    const filteredAnnouncements = useMemo(() => {
        return announcements.filter(ann => 
            ann.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ann.message?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [announcements, searchTerm]);

    return (
        <div className={`animate-fade-in ${embedded ? '' : 'max-w-7xl mx-auto px-4 py-12'}`}>
            {!embedded && (
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-mdOnSurface tracking-tighter mb-2">Church News</h1>
                        <p className="text-mdPrimary font-black text-lg uppercase tracking-widest bg-mdPrimary/5 px-4 py-1 rounded-full w-max">
                            Announcements
                        </p>
                    </div>
                </div>
            )}

            {/* Search and Filters */}
            <div className={`glass-card p-6 mb-10 flex flex-col md:flex-row gap-4 items-center ${embedded ? 'mt-4' : ''}`}>
                <div className="relative flex-1 w-full">
                    <FontAwesomeIcon icon={faSearch} className="absolute left-5 top-1/2 -translate-y-1/2 text-mdOutline" />
                    <input
                        type="text"
                        placeholder="Search announcements..."
                        className="w-full pl-14 pr-6 py-4 bg-mdSurfaceVariant/20 border-none rounded-2xl focus:ring-2 focus:ring-mdPrimary transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 text-mdOnSurfaceVariant font-bold text-sm uppercase tracking-widest px-4">
                    <FontAwesomeIcon icon={faBullhorn} className="text-mdPrimary" />
                    <span>{filteredAnnouncements.length} Total</span>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[1, 2, 3, 4].map(n => (
                        <div key={n} className="glass-card h-64 animate-pulse"></div>
                    ))}
                </div>
            ) : filteredAnnouncements.length === 0 ? (
                <div className="glass-card p-20 text-center">
                    <div className="w-24 h-24 bg-mdSurfaceVariant/30 rounded-full flex items-center justify-center mx-auto mb-8 opacity-40">
                        <FontAwesomeIcon icon={faBullhorn} className="text-4xl" />
                    </div>
                    <p className="text-2xl font-black text-mdOnSurface mb-2">No announcements found</p>
                    <p className="text-mdOnSurfaceVariant font-medium">Try adjusting your search terms.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {filteredAnnouncements.map((ann) => (
                        <div key={ann.id} className="glass-card group overflow-hidden flex flex-col hover:border-mdPrimary/30 transition-all duration-500">
                            <div className="p-8 flex-1">
                                <div className="flex items-center justify-between mb-6">
                                    <span className="px-4 py-1.5 rounded-full bg-mdPrimary/10 text-mdPrimary text-[10px] font-black uppercase tracking-widest">
                                        Announcement
                                    </span>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-mdOutline uppercase tracking-widest">
                                            <FontAwesomeIcon icon={faClock} className="opacity-50" />
                                            {ann.createdAt ? new Date(ann.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                                        </div>
                                        {isAdmin && (
                                            <button 
                                                onClick={(e) => handleDelete(ann.id, e)}
                                                className="w-8 h-8 rounded-lg bg-mdError/10 text-mdError hover:bg-mdError hover:text-white transition-all flex items-center justify-center"
                                                title="Delete Announcement"
                                            >
                                                <FontAwesomeIcon icon={faTrashAlt} className="text-xs" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <h3 className="text-2xl font-black text-mdOnSurface mb-4 group-hover:text-mdPrimary transition-colors line-clamp-2">
                                    {ann.title}
                                </h3>
                                <p className="text-mdOnSurfaceVariant font-medium leading-relaxed mb-6 line-clamp-3">
                                    {ann.message}
                                </p>
                            </div>
                            <div className="px-8 py-4 bg-mdSurfaceVariant/5 border-t border-mdOutline/5 flex items-center justify-between">
                                <button 
                                    onClick={() => setSelectedAnnouncement(ann)}
                                    className="text-sm font-black text-mdPrimary hover:underline uppercase tracking-widest flex items-center gap-2 group-hover:translate-x-1 transition-transform"
                                >
                                    Read Full Story
                                    <FontAwesomeIcon icon={faInfoCircle} className="text-[10px]" />
                                </button>
                                {ann.isUrgent && (
                                    <span className="w-2 h-2 bg-mdError rounded-full animate-ping"></span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Announcement Detail Modal */}
            {selectedAnnouncement && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setSelectedAnnouncement(null)}></div>
                    <div className="glass-card relative z-10 w-full max-w-2xl bg-white dark:bg-mdSurface overflow-hidden shadow-premium animate-slide-up border-none">
                        <div className="h-2 bg-gradient-to-r from-mdPrimary to-mdSecondary"></div>
                        <div className="p-10 max-h-[80vh] overflow-y-auto custom-scrollbar">
                            <div className="flex items-center justify-between mb-8">
                                <span className="px-4 py-2 rounded-full bg-mdPrimary/10 text-mdPrimary text-[10px] font-black uppercase tracking-widest">
                                    Official Announcement
                                </span>
                                <button onClick={() => setSelectedAnnouncement(null)} className="w-10 h-10 rounded-xl bg-mdSurfaceVariant/30 flex items-center justify-center text-mdOnSurface hover:bg-mdError hover:text-white transition-all">
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            </div>
                            <h2 className="text-4xl font-black text-mdOnSurface mb-6 leading-tight tracking-tighter">
                                {selectedAnnouncement.title}
                            </h2>
                            <div className="flex items-center gap-4 text-xs font-bold text-mdOnSurfaceVariant mb-8 opacity-60 uppercase tracking-widest">
                                <FontAwesomeIcon icon={faClock} />
                                Posted {selectedAnnouncement.createdAt ? new Date(selectedAnnouncement.createdAt).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : 'Recently'}
                            </div>
                            <div className="bg-mdPrimary/5 p-8 rounded-3xl border border-mdPrimary/10">
                                <p className="text-xl leading-relaxed text-mdOnSurface font-medium whitespace-pre-wrap">
                                    {selectedAnnouncement.message}
                                </p>
                            </div>
                        </div>
                        <div className="px-10 py-6 bg-mdSurfaceVariant/10 border-t border-mdOutline/5 flex justify-end">
                            <button 
                                onClick={() => setSelectedAnnouncement(null)}
                                className="px-8 py-4 bg-mdPrimary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lifted hover:scale-105 transition-all"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
