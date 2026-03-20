import { useState, useEffect, useMemo } from 'react';
import { getSermons, deleteSermon } from '../services/api';
import ConfirmModal from '../components/ConfirmModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faMicrophone, 
    faClock, 
    faUser, 
    faSearch, 
    faPlayCircle, 
    faTrashAlt,
    faTimes,
    faBroadcastTower
} from '@fortawesome/free-solid-svg-icons';

export default function Sermons({ embedded = false, branchId = null }) {
    const [sermons, setSermons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSermon, setSelectedSermon] = useState(null);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        onConfirm: () => {}
    });
    
    // Use session storage for consistent auth checks
    const userType = sessionStorage.getItem('userType');
    const isAdmin = userType === 'admin';

    useEffect(() => {
        fetchSermons();
    }, [branchId]);

    const fetchSermons = async () => {
        try {
            const response = await getSermons(branchId);
            const data = response.data?.data || response.data || [];
            setSermons(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to fetch sermons:", err);
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
                    await deleteSermon(id);
                    setSermons(sermons.filter(s => s.id !== id));
                } catch (err) {
                    console.error('Failed to delete sermon');
                }
            }
        });
    };

    const filteredSermons = useMemo(() => {
        return sermons.filter(sermon => 
            sermon.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sermon.speaker?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sermon.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [sermons, searchTerm]);

    return (
        <div className={`animate-fade-in ${embedded ? '' : 'max-w-7xl mx-auto px-4 py-6'}`}>
            {!embedded && (
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-mdOnSurface tracking-tighter mb-2 italic">Divine Messages</h1>
                        <p className="text-mdPrimary font-black text-lg uppercase tracking-widest bg-mdPrimary/5 px-4 py-1 rounded-full w-max border border-mdPrimary/20 shadow-sm">
                            Word Archive
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
                        placeholder="Search sermons by title or preacher..."
                        className="w-full pl-14 pr-6 py-4 bg-mdSurfaceVariant/30 border-none rounded-2xl focus:ring-2 focus:ring-mdPrimary transition-all font-medium text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 text-mdOnSurfaceVariant font-black text-[10px] uppercase tracking-widest px-4">
                    <FontAwesomeIcon icon={faMicrophone} className="text-mdPrimary" />
                    <span>{filteredSermons.length} Revelations</span>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(n => (
                        <div key={n} className="glass-card h-80 animate-pulse rounded-[2rem]"></div>
                    ))}
                </div>
            ) : filteredSermons.length === 0 ? (
                <div className="glass-card p-20 text-center rounded-[3rem]">
                    <div className="w-24 h-24 bg-mdSurfaceVariant/30 rounded-full flex items-center justify-center mx-auto mb-8 opacity-40">
                        <FontAwesomeIcon icon={faMicrophone} className="text-4xl" />
                    </div>
                    <p className="text-2xl font-black text-mdOnSurface mb-2">The Archive is Silent</p>
                    <p className="text-mdOnSurfaceVariant font-medium">No sermons uploaded yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredSermons.map((sermon) => (
                        <div key={sermon.id} className="glass-card group overflow-hidden flex flex-col hover:border-mdPrimary/30 transition-all duration-500 rounded-[2.5rem] shadow-premium bg-white">
                            <div className="relative h-48 bg-mdSurfaceVariant/20 overflow-hidden">
                                <div className="absolute inset-0 bg-mdPrimary/40 opacity-60 group-hover:opacity-40 transition-opacity"></div>
                                <div className="absolute inset-0 flex items-center justify-center text-mdSecondary/20 text-6xl group-hover:scale-110 transition-transform duration-700">
                                    <FontAwesomeIcon icon={faMicrophone} />
                                </div>
                                <div className="absolute top-4 right-4 z-10 flex gap-2">
                                    {isAdmin && (
                                        <button 
                                            onClick={(e) => handleDelete(sermon.id, e)}
                                            className="w-10 h-10 rounded-xl bg-mdError/10 text-mdError flex items-center justify-center hover:bg-mdError hover:text-white transition-all shadow-md1 hover:scale-110 active:scale-90"
                                            title="Delete Sermon"
                                        >
                                            <FontAwesomeIcon icon={faTrashAlt} />
                                        </button>
                                    )}
                                </div>
                                <div className="absolute bottom-4 left-6">
                                    <span className="px-3 py-1 rounded-full bg-mdSecondary text-white text-[10px] font-black uppercase tracking-widest shadow-md1">
                                        DIVINE WORD
                                    </span>
                                </div>
                            </div>
                            <div className="p-8 flex-1">
                                <h3 className="text-xl font-black text-mdOnSurface mb-3 group-hover:text-mdPrimary transition-colors line-clamp-2 leading-tight tracking-tight">
                                    {sermon.title}
                                </h3>
                                <div className="flex items-center gap-3 text-sm font-black text-mdOnSurfaceVariant mb-4 opacity-80 uppercase tracking-tighter">
                                    <div className="w-8 h-8 rounded-xl bg-mdPrimary/10 flex items-center justify-center text-mdPrimary overflow-hidden">
                                        <FontAwesomeIcon icon={faUser} className="text-[10px]" />
                                    </div>
                                    <span className="truncate">{sermon.speaker || 'Preacher of Word'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-black text-mdSecondary uppercase tracking-widest mt-1">
                                    <FontAwesomeIcon icon={faClock} className="opacity-70" />
                                    {sermon.sermonDate ? new Date(sermon.sermonDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                                </div>
                            </div>
                            <div className="px-8 py-6 border-t border-mdOutline/5 bg-mdSurfaceVariant/5">
                                <button 
                                    onClick={() => setSelectedSermon(sermon)}
                                    className="w-full py-4 bg-mdPrimary text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-premium hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                                >
                                    <FontAwesomeIcon icon={faMicrophone} />
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Sermon Player Modal */}
            {selectedSermon && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={() => setSelectedSermon(null)}></div>
                    <div className="glass-card relative z-10 w-full max-w-4xl bg-white overflow-hidden shadow-premium animate-slide-up border-none rounded-[3rem]">
                        <div className="absolute top-6 right-6 z-20">
                            <button onClick={() => setSelectedSermon(null)} className="w-12 h-12 rounded-2xl bg-mdSurfaceVariant/30 text-mdOnSurface hover:bg-mdError hover:text-white transition-all shadow-sm flex items-center justify-center">
                                <FontAwesomeIcon icon={faTimes} /> 
                            </button>
                        </div>

                        <div className="flex flex-col md:flex-row min-h-[400px]">
                            {/* Visual Section */}
                            <div className="w-full md:w-2/5 bg-mdPrimary flex items-center justify-center p-12">
                                <div className="text-center">
                                    <div className="w-32 h-32 rounded-[2.5rem] bg-white/10 flex items-center justify-center mx-auto mb-8 shadow-premium border border-white/10">
                                        <FontAwesomeIcon icon={faMicrophone} className="text-5xl text-white" />
                                    </div>
                                    <p className="text-white/60 font-black uppercase tracking-[0.3em] text-[10px]">EcclesiaSys</p>
                                    <h3 className="text-white text-2xl font-black tracking-tighter mt-4 leading-tight">Word Archive</h3>
                                </div>
                            </div>

                            {/* Info Section */}
                            <div className="w-full md:w-3/5 p-12 flex flex-col justify-between bg-white">
                                <div>
                                    <span className="px-5 py-2 rounded-full bg-mdPrimary/5 text-mdPrimary text-[10px] font-black uppercase tracking-[0.2em] mb-8 inline-block border border-mdPrimary/10">
                                        Revelation Info
                                    </span>
                                    <h2 className="text-3xl font-black text-mdOnSurface mb-8 leading-tight tracking-tighter">
                                        {selectedSermon.title}
                                    </h2>
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4 text-mdOnSurface">
                                            <div className="w-12 h-12 rounded-2xl bg-mdPrimary/5 flex items-center justify-center text-mdPrimary shadow-inner">
                                                <FontAwesomeIcon icon={faUser} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-black tracking-widest text-mdOutline opacity-60">Preacher</p>
                                                <p className="font-black text-lg">{selectedSermon.speaker || 'Preacher'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-mdOnSurface">
                                            <div className="w-12 h-12 rounded-2xl bg-mdSecondary/5 flex items-center justify-center text-mdSecondary shadow-inner">
                                                <FontAwesomeIcon icon={faClock} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-black tracking-widest text-mdOutline opacity-60">Delivered On</p>
                                                <p className="font-black text-lg text-mdPrimary">{selectedSermon.sermonDate ? new Date(selectedSermon.sermonDate).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : 'Recently'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-10 pt-10 border-t border-mdOutline/5">
                                        <p className="text-[10px] uppercase font-black tracking-widest text-mdOutline opacity-60 mb-3">Description</p>
                                        <p className="text-sm text-mdOnSurfaceVariant font-medium leading-relaxed italic opacity-80">
                                            {selectedSermon.description || 'No description provided for this revelation.'}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-12">
                                    <button 
                                        onClick={() => setSelectedSermon(null)}
                                        className="w-full py-4 bg-mdOnSurface text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-premium hover:bg-mdPrimary hover:text-white transition-all"
                                    >
                                        Exit Player
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Deletion Confirmation Modal */}
            <ConfirmModal 
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title="Remove Revelation?"
                message="This will permanently remove the sermon from the sanctuary archive. Proceed?"
                type="danger"
            />
        </div>
    );
}

// Add CSS keyframe for the loader if needed in a global way, but for now we use Tailwind classes or simple styles
