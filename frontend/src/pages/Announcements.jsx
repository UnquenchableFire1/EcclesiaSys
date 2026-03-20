import { useState, useEffect, useMemo } from 'react';
import { getAnnouncements, deleteAnnouncement } from '../services/api';
import ConfirmModal from '../components/ConfirmModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faBullhorn, 
    faClock, 
    faSearch, 
    faInfoCircle, 
    faTrashAlt, 
    faTimes 
} from '@fortawesome/free-solid-svg-icons';

export default function Announcements({ embedded = false, branchId = null }) {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        onConfirm: () => {}
    });
    
    // Use session storage for consistent auth checks
    const userType = sessionStorage.getItem('userType');
    const isAdmin = userType === 'admin';

    useEffect(() => {
        fetchAnnouncements();
    }, [branchId]);

    const fetchAnnouncements = async () => {
        try {
            const response = await getAnnouncements(branchId);
            const data = response.data?.data || response.data || [];
            setAnnouncements(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to fetch announcements:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id, e) => {
        e.stopPropagation();
        setConfirmModal({
            isOpen: true,
            onConfirm: async () => {
                try {
                    await deleteAnnouncement(id);
                    setAnnouncements(announcements.filter(ann => ann.id !== id));
                } catch (err) {
                    console.error('Failed to delete announcement');
                }
            }
        });
    };

    const filteredAnnouncements = useMemo(() => {
        return announcements.filter(ann => 
            ann.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ann.message?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [announcements, searchTerm]);

    return (
        <div className={`animate-fade-in ${embedded ? '' : 'max-w-7xl mx-auto px-4 py-6'}`}>
            {!embedded && (
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-mdOnSurface tracking-tighter mb-2 italic">Sanctuary News</h1>
                        <p className="text-mdPrimary font-black text-lg uppercase tracking-widest bg-mdPrimary/5 px-4 py-1 rounded-full w-max border border-mdPrimary/20 shadow-sm">
                            Latest Announcements
                        </p>
                    </div>
                </div>
            )}

            {/* Search and Filters */}
            <div className={`glass-card p-6 mb-10 flex flex-col md:flex-row gap-4 items-center ${embedded ? 'mt-4' : ''} rounded-[2rem]`}>
                <div className="relative flex-1 w-full">
                    <FontAwesomeIcon icon={faSearch} className="absolute left-6 top-1/2 -translate-y-1/2 text-mdOutline opacity-50" />
                    <input
                        type="text"
                        placeholder="Search announcements..."
                        className="w-full pl-14 pr-6 py-4 bg-mdSurfaceVariant/30 border-none rounded-2xl focus:ring-2 focus:ring-mdPrimary transition-all font-medium text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 text-mdOnSurfaceVariant font-black text-[10px] uppercase tracking-widest px-4">
                    <FontAwesomeIcon icon={faBullhorn} className="text-mdPrimary" />
                    <span>{filteredAnnouncements.length} Updates</span>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[1, 2, 3, 4].map(n => (
                        <div key={n} className="glass-card h-64 animate-pulse rounded-[2rem]"></div>
                    ))}
                </div>
            ) : filteredAnnouncements.length === 0 ? (
                <div className="glass-card p-20 text-center rounded-[3rem]">
                    <div className="w-24 h-24 bg-mdSurfaceVariant/30 rounded-full flex items-center justify-center mx-auto mb-8 opacity-40">
                        <FontAwesomeIcon icon={faBullhorn} className="text-4xl" />
                    </div>
                    <p className="text-2xl font-black text-mdOnSurface mb-2">Silence in the Sanctuary</p>
                    <p className="text-mdOnSurfaceVariant font-medium">No active announcements at this time.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {filteredAnnouncements.map((ann) => (
                        <div key={ann.id} className="glass-card group overflow-hidden flex flex-col hover:border-mdPrimary/30 transition-all duration-500 rounded-[2.5rem] shadow-premium">
                            <div className="p-8 flex-1">
                                <div className="flex items-center justify-between mb-6">
                                    <span className="px-5 py-2 rounded-full bg-mdPrimary/5 text-mdPrimary text-[10px] font-black uppercase tracking-[0.2em] border border-mdPrimary/10">
                                        ANNOUNCEMENT
                                    </span>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-mdSecondary uppercase tracking-widest mt-1">
                                            <FontAwesomeIcon icon={faClock} className="opacity-70" />
                                            {ann.createdAt ? new Date(ann.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                                        </div>
                                        {isAdmin && (
                                            <button 
                                                onClick={(e) => handleDelete(ann.id, e)}
                                                className="w-9 h-9 rounded-xl bg-mdError/5 text-mdError hover:bg-mdError hover:text-white transition-all flex items-center justify-center shadow-sm"
                                                title="Delete Announcement"
                                            >
                                                <FontAwesomeIcon icon={faTrashAlt} className="text-xs" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <h3 className="text-2xl font-black text-mdOnSurface mb-4 group-hover:text-mdPrimary transition-colors line-clamp-2 leading-tight tracking-tighter">
                                    {ann.title}
                                </h3>
                                <p className="text-mdOnSurfaceVariant font-medium leading-relaxed mb-6 line-clamp-3 text-sm italic opacity-80">
                                    {ann.message}
                                </p>
                            </div>
                            <div className="px-8 py-5 bg-mdSurfaceVariant/5 border-t border-mdOutline/5 flex items-center justify-between">
                                <button 
                                    onClick={() => setSelectedAnnouncement(ann)}
                                    className="text-[10px] font-black text-mdPrimary hover:text-mdSecondary uppercase tracking-[0.2em] flex items-center gap-2 group-hover:translate-x-1 transition-transform"
                                >
                                    Read Full Insight
                                    <FontAwesomeIcon icon={faInfoCircle} className="text-[10px]" />
                                </button>
                                {ann.isUrgent && (
                                    <span className="flex items-center gap-2">
                                        <span className="text-[8px] font-black text-mdError uppercase tracking-widest">Urgent</span>
                                        <span className="w-2.5 h-2.5 bg-mdError rounded-full animate-ping"></span>
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Announcement Detail Modal */}
            {selectedAnnouncement && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={() => setSelectedAnnouncement(null)}></div>
                    <div className="glass-card relative z-10 w-full max-w-2xl bg-white overflow-hidden shadow-premium animate-slide-up border-none rounded-[3rem]">
                        <div className="h-2 bg-mdPrimary"></div>
                        <div className="p-10 max-h-[80vh] overflow-y-auto custom-scrollbar">
                            <div className="flex items-center justify-between mb-8">
                                <span className="px-5 py-2 rounded-full bg-mdPrimary/5 text-mdPrimary text-[10px] font-black uppercase tracking-[0.2em] border border-mdPrimary/10">
                                    Official Insight
                                </span>
                                <button onClick={() => setSelectedAnnouncement(null)} className="w-11 h-11 rounded-2xl bg-mdSurfaceVariant/30 flex items-center justify-center text-mdOnSurface hover:bg-mdError hover:text-white transition-all shadow-sm">
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            </div>
                            <h2 className="text-4xl font-black text-mdOnSurface mb-6 leading-tight tracking-tighter mt-2">
                                {selectedAnnouncement.title}
                            </h2>
                            <div className="flex items-center gap-4 text-[10px] font-black text-mdSecondary mb-8 uppercase tracking-widest opacity-80">
                                <FontAwesomeIcon icon={faClock} />
                                Posted {selectedAnnouncement.createdAt ? new Date(selectedAnnouncement.createdAt).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : 'Recently'}
                            </div>
                            <div className="bg-mdSurfaceVariant/10 p-10 rounded-[2.5rem] border border-mdOutline/5 shadow-inner">
                                <p className="text-xl leading-relaxed text-mdOnSurface font-medium whitespace-pre-wrap italic">
                                    "{selectedAnnouncement.message}"
                                </p>
                            </div>
                        </div>
                        <div className="px-10 py-7 bg-mdSurfaceVariant/5 border-t border-mdOutline/5 flex justify-end">
                            <button 
                                onClick={() => setSelectedAnnouncement(null)}
                                className="px-10 py-4 bg-mdPrimary text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-premium hover:scale-[1.03] transition-all"
                            >
                                Dismiss Word
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Deletion Confirmation Modal */}
            <ConfirmModal 
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title="Revoke Insight?"
                message="This will permanently remove the announcement from the sanctuary newsfeed. Proceed?"
                type="danger"
            />
        </div>
    );
}
