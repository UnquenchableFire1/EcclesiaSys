import { useState, useEffect, useMemo } from 'react';
import { getSermons, deleteSermon } from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faMicrophone, 
    faClock, 
    faUser, 
    faSearch, 
    faInfoCircle, 
    faPlayCircle, 
    faTrashAlt 
} from '@fortawesome/free-solid-svg-icons';

export default function Sermons({ embedded = false }) {
    const [sermons, setSermons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSermon, setSelectedSermon] = useState(null);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = user.role === 'ADMIN';

    useEffect(() => {
        fetchSermons();
    }, []);

    const fetchSermons = async () => {
        try {
            const response = await getSermons();
            const data = response.data?.data || response.data || [];
            setSermons(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to fetch sermons:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this sermon?')) {
            try {
                await deleteSermon(id);
                setSermons(sermons.filter(s => s.id !== id));
            } catch (err) {
                alert('Failed to delete sermon');
            }
        }
    };

    const filteredSermons = useMemo(() => {
        return sermons.filter(sermon => 
            sermon.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sermon.speaker?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sermon.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [sermons, searchTerm]);

    return (
        <div className={`animate-fade-in ${embedded ? '' : 'max-w-7xl mx-auto px-4 py-12'}`}>
            {!embedded && (
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-mdOnSurface tracking-tighter mb-2">Spiritual Nourishment</h1>
                        <p className="text-mdPrimary font-black text-lg uppercase tracking-widest bg-mdPrimary/5 px-4 py-1 rounded-full w-max">
                            Sermon Archive
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
                        placeholder="Search sermons by title or preacher..."
                        className="w-full pl-14 pr-6 py-4 bg-mdSurfaceVariant/20 border-none rounded-2xl focus:ring-2 focus:ring-mdPrimary transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-mdOnSurfaceVariant font-bold text-sm uppercase tracking-widest px-4 border-r border-mdOutline/10">
                        <FontAwesomeIcon icon={faMicrophone} className="text-mdPrimary" />
                        <span>{filteredSermons.length} Sermons</span>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(n => (
                        <div key={n} className="glass-card h-80 animate-pulse"></div>
                    ))}
                </div>
            ) : filteredSermons.length === 0 ? (
                <div className="glass-card p-20 text-center">
                    <div className="w-24 h-24 bg-mdSurfaceVariant/30 rounded-full flex items-center justify-center mx-auto mb-8 opacity-40">
                        <FontAwesomeIcon icon={faMicrophone} className="text-4xl" />
                    </div>
                    <p className="text-2xl font-black text-mdOnSurface mb-2">No sermons found</p>
                    <p className="text-mdOnSurfaceVariant font-medium">Try searching for a different title or preacher.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredSermons.map((sermon) => (
                        <div key={sermon.id} className="glass-card group overflow-hidden flex flex-col hover:border-mdPrimary/30 transition-all duration-500">
                            <div className="relative h-48 bg-mdSurfaceVariant/20 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                                <div className="absolute inset-0 flex items-center justify-center text-mdPrimary/20 text-6xl group-hover:scale-110 transition-transform duration-700">
                                    <FontAwesomeIcon icon={faPlayCircle} />
                                </div>
                                <div className="absolute top-4 right-4 z-10 flex gap-2">
                                    {isAdmin && (
                                        <button 
                                            onClick={(e) => handleDelete(sermon.id, e)}
                                            className="w-10 h-10 rounded-xl bg-mdError/90 text-white flex items-center justify-center hover:bg-mdError transition-all shadow-md1 hover:scale-110 active:scale-90"
                                            title="Delete Sermon"
                                        >
                                            <FontAwesomeIcon icon={faTrashAlt} />
                                        </button>
                                    )}
                                </div>
                                <div className="absolute bottom-4 left-6">
                                    <span className="px-3 py-1 rounded-full bg-mdPrimary text-white text-[10px] font-black uppercase tracking-widest shadow-md1">
                                        Message
                                    </span>
                                </div>
                            </div>
                            <div className="p-8 flex-1">
                                <h3 className="text-xl font-black text-mdOnSurface mb-3 group-hover:text-mdPrimary transition-colors line-clamp-2">
                                    {sermon.title}
                                </h3>
                                <div className="flex items-center gap-3 text-sm font-bold text-mdOnSurfaceVariant mb-4 opacity-80">
                                    <div className="w-8 h-8 rounded-full bg-mdPrimary/10 flex items-center justify-center text-mdPrimary">
                                        <FontAwesomeIcon icon={faUser} className="text-[10px]" />
                                    </div>
                                    <span className="truncate">{sermon.speaker || 'Church Speaker'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-mdOutline uppercase tracking-widest opacity-60">
                                    <FontAwesomeIcon icon={faClock} />
                                    {sermon.sermonDate ? new Date(sermon.sermonDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                                </div>
                            </div>
                            <div className="px-8 py-5 border-t border-mdOutline/5 bg-mdSurfaceVariant/5">
                                <button 
                                    onClick={() => setSelectedSermon(sermon)}
                                    className="w-full py-4 bg-mdPrimary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lifted hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                                >
                                    <FontAwesomeIcon icon={faPlayCircle} />
                                    Listen Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Sermon Player Modal */}
            {selectedSermon && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setSelectedSermon(null)}></div>
                    <div className="glass-card relative z-10 w-full max-w-4xl bg-white dark:bg-mdSurface overflow-hidden shadow-2xl animate-scale-up border-none">
                        <div className="absolute top-6 right-6 z-20">
                            <button onClick={() => setSelectedSermon(null)} className="w-12 h-12 rounded-2xl bg-white/10 text-white hover:bg-mdError hover:text-white transition-all backdrop-blur-md border border-white/20 flex items-center justify-center">
                                <FontAwesomeIcon icon={faInfoCircle} className="rotate-45" /> 
                            </button>
                        </div>

                        <div className="flex flex-col md:flex-row min-h-[500px]">
                            {/* Player Section */}
                            <div className="w-full md:w-3/5 bg-black flex items-center justify-center aspect-video md:aspect-auto">
                                <div className="text-center p-12">
                                    <div className="w-32 h-32 rounded-full bg-mdPrimary/20 flex items-center justify-center mx-auto mb-8 animate-glow-pulse">
                                        <FontAwesomeIcon icon={faMicrophone} className="text-5xl text-mdPrimary" />
                                    </div>
                                    <p className="text-white/60 font-black uppercase tracking-[0.3em] text-xs">Spiritual Broadcast Ready</p>
                                    <p className="text-white text-lg font-bold mt-4">Connecting to Stream...</p>
                                </div>
                            </div>

                            {/* Info Section */}
                            <div className="w-full md:w-2/5 p-10 flex flex-col justify-between bg-mdSurfaceVariant/5">
                                <div>
                                    <span className="px-4 py-2 rounded-full bg-mdPrimary/10 text-mdPrimary text-[10px] font-black uppercase tracking-[0.2em] mb-8 inline-block">
                                        Sermon Info
                                    </span>
                                    <h2 className="text-3xl font-black text-mdOnSurface mb-6 leading-tight tracking-tighter">
                                        {selectedSermon.title}
                                    </h2>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4 text-mdOnSurface">
                                            <div className="w-10 h-10 rounded-xl bg-mdPrimary/10 flex items-center justify-center text-mdPrimary">
                                                <FontAwesomeIcon icon={faUser} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-black tracking-widest text-mdOutline opacity-60">Preacher</p>
                                                <p className="font-black text-lg">{selectedSermon.speaker || 'Guest Speaker'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-mdOnSurface">
                                            <div className="w-10 h-10 rounded-xl bg-mdSecondary/10 flex items-center justify-center text-mdSecondary">
                                                <FontAwesomeIcon icon={faClock} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-black tracking-widest text-mdOutline opacity-60">Delivered On</p>
                                                <p className="font-black text-lg">{selectedSermon.sermonDate ? new Date(selectedSermon.sermonDate).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : 'Recently'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-12">
                                    <button 
                                        onClick={() => setSelectedSermon(null)}
                                        className="w-full py-4 bg-mdOnSurface text-mdSurface rounded-2xl font-black text-xs uppercase tracking-widest shadow-lifted hover:bg-mdPrimary hover:text-white transition-all"
                                    >
                                        Close Player
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
