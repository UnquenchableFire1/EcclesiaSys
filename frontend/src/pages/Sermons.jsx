import { useState, useEffect, useMemo } from 'react';
import { getSermons } from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faClock, faUser, faSearch, faInfoCircle, faPlayCircle, faHeadphones } from '@fortawesome/free-solid-svg-icons';

export default function Sermons({ embedded = false }) {
    const [sermons, setSermons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
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
        fetchSermons();
    }, []);

    const filteredSermons = useMemo(() => {
        return sermons.filter(sermon => 
            sermon.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sermon.preacherName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sermon.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [sermons, searchTerm]);

    return (
        <div className={`animate-fade-in ${embedded ? '' : 'max-w-7xl mx-auto px-4 py-12'}`}>
            {!embedded && (
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-mdOnSurface tracking-tighter mb-2">Sermon Library</h1>
                        <p className="text-purple-600 font-black text-lg uppercase tracking-widest bg-purple-500/5 px-4 py-1 rounded-full w-max">
                            Spiritual Growth
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
                        className="w-full pl-14 pr-6 py-4 bg-mdSurfaceVariant/20 border-none rounded-2xl focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 text-mdOnSurfaceVariant font-bold text-sm uppercase tracking-widest px-4">
                    <FontAwesomeIcon icon={faMicrophone} className="text-purple-600" />
                    <span>{filteredSermons.length} Sermons</span>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(n => (
                        <div key={n} className="glass-card h-64 animate-pulse"></div>
                    ))}
                </div>
            ) : filteredSermons.length === 0 ? (
                <div className="glass-card p-20 text-center">
                    <div className="w-24 h-24 bg-mdSurfaceVariant/30 rounded-full flex items-center justify-center mx-auto mb-8 opacity-40">
                        <FontAwesomeIcon icon={faMicrophone} className="text-4xl" />
                    </div>
                    <p className="text-2xl font-black text-mdOnSurface mb-2">No sermons found</p>
                    <p className="text-mdOnSurfaceVariant font-medium">Try searching for a preacher or topic.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredSermons.map((sermon) => (
                        <div key={sermon.id} className="glass-card group overflow-hidden flex flex-col hover:border-purple-500/30">
                            <div className="p-8 flex-1">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600">
                                            <FontAwesomeIcon icon={faHeadphones} className="text-xs" />
                                        </div>
                                        <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">
                                            Audio Message
                                        </span>
                                    </div>
                                    <div className="text-[10px] font-bold text-mdOutline uppercase tracking-widest flex items-center gap-2">
                                        <FontAwesomeIcon icon={faClock} />
                                        {new Date(sermon.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                    </div>
                                </div>

                                <h3 className="text-2xl font-black text-mdOnSurface mb-4 group-hover:text-purple-600 transition-colors line-clamp-2 leading-tight">
                                    {sermon.title}
                                </h3>

                                <div className="flex items-center gap-3 text-sm font-bold text-mdOnSurfaceVariant mb-4">
                                    <div className="w-8 h-8 rounded-full bg-mdSurfaceVariant/30 flex items-center justify-center text-mdPrimary">
                                        <FontAwesomeIcon icon={faUser} />
                                    </div>
                                    <span>{sermon.preacherName || 'Guest Speaker'}</span>
                                </div>

                                <p className="text-xs text-mdOnSurfaceVariant/70 font-medium leading-relaxed line-clamp-3">
                                    {sermon.description}
                                </p>
                            </div>

                            <div className="px-8 py-5 bg-mdSurfaceVariant/5 border-t border-mdOutline/5 flex items-center justify-between">
                                <button className="text-sm font-black text-purple-600 hover:text-purple-700 uppercase tracking-widest flex items-center gap-2 group/btn">
                                    Listen Now
                                    <FontAwesomeIcon icon={faPlayCircle} className="text-lg group-hover/btn:scale-110 transition-transform" />
                                </button>
                                <button className="p-3 text-mdOutline hover:text-mdPrimary transition-colors">
                                    <FontAwesomeIcon icon={faInfoCircle} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
