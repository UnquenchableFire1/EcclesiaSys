import { useState, useEffect, useMemo } from 'react';
import { getSermons, deleteSermon } from '../services/api';
import ConfirmModal from '../components/ConfirmModal';
import Hero from '../components/Hero';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faMicrophone, 
    faClock, 
    faUser, 
    faSearch, 
    faTrashAlt,
    faTimes,
    faQuoteLeft,
    faVideo,
    faVolumeUp
} from '@fortawesome/free-solid-svg-icons';
import MediaPreview from '../components/MediaPreview';

export default function Sermons({ embedded = false, branchId = null }) {
    const [sermons, setSermons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSermon, setSelectedSermon] = useState(null);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        onConfirm: () => {}
    });
    
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
        <div className={`animate-fade-in pb-20 ${embedded ? '' : 'max-w-7xl mx-auto px-4'}`}>
            {!embedded && (
                <div className="mb-12">
                     <Hero 
                        title="Heavenly Revelations"
                        subtitle="Explore our archive of life-transforming messages and divine teachings from the anointed leaders of our assembly."
                        backgroundImage="/assets/images/church/church_9.jpg"
                        small={true}
                    />
                </div>
            )}

            {/* Search and Filters */}
            <div className={`glass-card p-8 mb-12 flex flex-col md:flex-row gap-6 items-center ${embedded ? 'mt-4' : ''} rounded-[2.5rem] shadow-premium bg-white/50 backdrop-blur-xl border-white/20`}>
                <div className="relative flex-1 w-full">
                    <FontAwesomeIcon icon={faSearch} className="absolute left-6 top-1/2 -translate-y-1/2 text-mdPrimary opacity-50 text-xl" />
                    <input
                        type="text"
                        placeholder="Search for a specific message or speaker..."
                        className="w-full pl-16 pr-8 py-5 bg-mdSurfaceVariant/30 border-none rounded-3xl focus:ring-4 focus:ring-mdPrimary/20 transition-all font-bold text-lg placeholder:text-mdOnSurfaceVariant/40"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-4 bg-mdPrimary/10 px-8 py-4 rounded-3xl text-mdPrimary font-black text-xs uppercase tracking-widest border border-mdPrimary/5 shadow-sm whitespace-nowrap">
                    <FontAwesomeIcon icon={faMicrophone} className="animate-pulse" />
                    <span>{filteredSermons.length} Messages Found</span>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {[1, 2, 3].map(n => (
                        <div key={n} className="img-card h-[450px] animate-pulse rounded-[2.5rem] opacity-50"></div>
                    ))}
                </div>
            ) : filteredSermons.length === 0 ? (
                <div className="bg-mdSurfaceVariant/20 p-24 text-center rounded-[4rem] border-4 border-dashed border-mdOutline/10">
                    <div className="w-32 h-32 bg-mdSurfaceVariant/30 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 opacity-30 shadow-inner">
                        <FontAwesomeIcon icon={faMicrophone} className="text-5xl" />
                    </div>
                    <h3 className="text-3xl font-black text-mdOnSurface mb-4">The Assembly is Silent</h3>
                    <p className="text-xl text-mdOnSurfaceVariant font-medium max-w-md mx-auto leading-relaxed">No sermons have been recorded in this archive yet. Check back soon for new revelations.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {filteredSermons.map((sermon, idx) => (
                        <div key={sermon.id} className="img-card group h-[450px] rounded-[2.5rem] hover:shadow-premium transition-all duration-700">
                             <img 
                                src={`/assets/images/church/church_${(idx % 10) + 4}.jpg`} 
                                alt={sermon.title} 
                                className="transition-transform duration-[2s] group-hover:scale-110"
                             />
                             <div className="image-overlay group-hover:bg-mdPrimary/40 transition-all duration-700"></div>
                             
                             {isAdmin && (
                                <div className="absolute top-6 right-6 z-20">
                                    <button 
                                        onClick={(e) => handleDelete(sermon.id, e)}
                                        className="w-12 h-12 rounded-2xl bg-black/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-mdError hover:shadow-premium transition-all shadow-md active:scale-90"
                                    >
                                        <FontAwesomeIcon icon={faTrashAlt} />
                                    </button>
                                </div>
                             )}

                             <div className="absolute inset-0 z-10 p-10 flex flex-col justify-end text-white">
                                <div className="flex gap-2 mb-6">
                                    <span className="px-4 py-1 rounded-full bg-mdSecondary text-white text-[10px] font-black uppercase tracking-[0.2em] w-fit shadow-md shadow-black/20">
                                        Word Archive
                                    </span>
                                    {!sermon.branchId && (
                                        <span className="px-4 py-1 rounded-full bg-purple-500 text-white text-[10px] font-black uppercase tracking-[0.2em] w-fit shadow-md shadow-black/20">
                                            Global
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-3xl font-black mb-4 leading-tight tracking-tighter line-clamp-2">
                                    {sermon.title}
                                </h3>
                                
                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full border-2 border-white/30 overflow-hidden shadow-md">
                                            <div className="w-full h-full bg-mdPrimary flex items-center justify-center">
                                                <FontAwesomeIcon icon={faUser} className="text-white text-xs" />
                                            </div>
                                        </div>
                                        <span className="font-bold text-white/90 truncate max-w-[150px]">{sermon.speaker || 'Pastor'}</span>
                                    </div>
                                    <div className="text-[11px] font-black text-mdSecondary uppercase tracking-widest flex items-center gap-2">
                                        <FontAwesomeIcon icon={faClock} />
                                        {sermon.sermonDate ? new Date(sermon.sermonDate).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Recent'}
                                    </div>
                                </div>

                                <button 
                                    onClick={() => setSelectedSermon(sermon)}
                                    className="mt-8 py-5 bg-white text-mdPrimary rounded-full font-black text-xs uppercase tracking-[0.3em] shadow-premium hover:bg-mdSecondary hover:text-white transition-all transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 duration-500"
                                >
                                    Experience Word
                                </button>
                             </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Sermon Player Modal */}
            {selectedSermon && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl" onClick={() => setSelectedSermon(null)}></div>
                    <div className="relative z-10 w-full max-w-5xl bg-white overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] animate-slide-up border-none rounded-[4rem] flex flex-col md:flex-row min-h-[600px]">
                        <button 
                            onClick={() => setSelectedSermon(null)} 
                            className="absolute top-8 right-8 z-30 w-14 h-14 rounded-[2rem] bg-white/10 hover:bg-mdError text-white backdrop-blur-md transition-all flex items-center justify-center text-xl shadow-premium"
                        >
                            <FontAwesomeIcon icon={faTimes} /> 
                        </button>

                        {/* Visual Section */}
                        <div className="w-full md:w-5/12 relative min-h-[300px] md:min-h-full">
                            <img src="/assets/images/church/church_12.jpg" alt="Sermon Detail" className="absolute inset-0 w-full h-full object-cover" />
                            <div className="image-overlay-dark opacity-70"></div>
                            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-12 text-white">
                                <div className="w-24 h-24 rounded-[2rem] bg-mdSecondary flex items-center justify-center mb-8 shadow-premium animate-float">
                                    <FontAwesomeIcon icon={faMicrophone} className="text-4xl" />
                                </div>
                                <span className="text-white/40 font-black uppercase tracking-[0.4em] text-[10px] mb-4">
                                    Divine Message {!selectedSermon.branchId && " • Assembly Wide"}
                                </span>
                                <h3 className="text-4xl font-black tracking-tighter leading-none italic">Archive<br/>Revelation</h3>
                            </div>
                        </div>

                        {/* Info Section */}
                        <div className="w-full md:w-7/12 p-16 flex flex-col justify-between bg-white relative">
                            <div className="absolute top-0 right-0 p-10 text-mdPrimary/5 text-9xl">
                                <FontAwesomeIcon icon={faQuoteLeft} />
                            </div>
                            
                            <div>
                                <span className="px-6 py-2 rounded-full bg-mdPrimary/5 text-mdPrimary text-[10px] font-black uppercase tracking-[0.2em] mb-10 inline-block border border-mdPrimary/10">
                                    Revelation Details
                                </span>
                                <h2 className="text-4xl md:text-5xl font-black text-mdOnSurface mb-12 leading-[1.1] tracking-tighter">
                                    {selectedSermon.title}
                                </h2>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-16">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 rounded-3xl bg-mdPrimary/5 flex items-center justify-center text-mdPrimary shadow-inner text-xl">
                                            <FontAwesomeIcon icon={faUser} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-black tracking-[0.2em] text-mdOutline opacity-60 mb-1">Spirit Speaker</p>
                                            <p className="font-black text-xl text-mdOnSurface">{selectedSermon.speaker || 'Anointed Preacher'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 rounded-3xl bg-mdSecondary/5 flex items-center justify-center text-mdSecondary shadow-inner text-xl">
                                            <FontAwesomeIcon icon={faClock} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-black tracking-[0.2em] text-mdOutline opacity-60 mb-1">Date Delivered</p>
                                            <p className="font-black text-xl text-mdPrimary">{selectedSermon.sermonDate ? new Date(selectedSermon.sermonDate).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' }) : 'Recently'}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="pt-12 border-t border-mdOutline/5">
                                    <p className="text-[11px] uppercase font-black tracking-[0.3em] text-mdOutline opacity-60 mb-6">Summary of Revelation</p>
                                    <p className="text-xl text-mdOnSurfaceVariant font-medium leading-relaxed italic opacity-80 mb-8">
                                        {selectedSermon.description || 'No description provided for this revelation. The word is waiting to be explored.'}
                                    </p>
                                    
                                    {(selectedSermon.videoUrl || selectedSermon.audioUrl) && (
                                        <div className="mt-8 border-t border-mdOutline/10 pt-8 space-y-4">
                                            <p className="text-[10px] uppercase font-black tracking-[0.3em] text-mdOutline opacity-60 mb-2">Manifestation of the Word</p>
                                            {selectedSermon.videoUrl && (
                                                <MediaPreview url={selectedSermon.videoUrl} type="video" title={`${selectedSermon.title} (Video)`} />
                                            )}
                                            {selectedSermon.audioUrl && (
                                                <MediaPreview url={selectedSermon.audioUrl} type="audio" title={`${selectedSermon.title} (Audio)`} />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button 
                                onClick={() => setSelectedSermon(null)}
                                className="mt-16 w-full py-6 bg-mdOnSurface text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] shadow-premium hover:bg-mdPrimary hover:scale-[1.02] transition-all duration-300"
                            >
                                Close Archive
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal 
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title="Remove Revelation?"
                message="This will permanently remove the sermon from the assembly archive. Proceed?"
                type="danger"
            />
        </div>
    );
}

// Add CSS keyframe for the loader if needed in a global way, but for now we use Tailwind classes or simple styles
