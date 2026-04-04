import { useState, useEffect, useMemo } from 'react';
import { getPublicMembers, getMembers } from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faPhone, faEnvelope, faInfoCircle, faSearch, faUserShield } from '@fortawesome/free-solid-svg-icons';

export default function MemberDirectory() {
    const [members, setMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const userType = sessionStorage.getItem('userType');
    const isAdmin = userType === 'admin';
    const currentUserId = parseInt(sessionStorage.getItem('userId')) || 0;

    const filteredMembers = useMemo(() => {
        return members.filter(member => {
            // If not admin, don't show the current user to themselves (usually they see it in profile anyway)
            // But for admin, show everyone.
            if (!isAdmin && member.id === currentUserId) return false;
            
            return `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (member.phoneNumber && member.phoneNumber.includes(searchTerm)) ||
            (member.email || '').toLowerCase().includes(searchTerm.toLowerCase());
        });
    }, [members, searchTerm, isAdmin, currentUserId]);

    useEffect(() => {
        fetchMembers();
    }, [isAdmin]);

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const branchId = sessionStorage.getItem('branchId');
            const response = isAdmin ? await getMembers(branchId) : await getPublicMembers(branchId);
            if (response.data.success) {
                setMembers(response.data.data);
            } else {
                setError('Failed to load members');
            }
        } catch (err) {
            setError('Error loading members: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-mdPrimary/30 border-t-mdPrimary rounded-full animate-spin"></div>
                    <p className="text-mdOnSurfaceVariant text-lg font-bold animate-pulse">Gathering community...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="bg-mdPrimary/10 p-5 rounded-3xl text-mdPrimary shadow-sm">
                        <FontAwesomeIcon icon={isAdmin ? faUserShield : faUser} className="text-2xl" />
                    </div>
                    <div>
                        <h2 className="text-4xl font-black text-mdOnSurface tracking-tighter">
                            {isAdmin ? 'Church Registry' : 'Member Directory'}
                        </h2>
                        <p className="text-mdPrimary font-black text-[10px] uppercase tracking-[0.2em] opacity-70">
                            {isAdmin ? 'All registered members' : 'Connect with the fellowship'}
                        </p>
                    </div>
                </div>
                
                <div className="md:ml-auto relative w-full max-w-md group">
                    <FontAwesomeIcon icon={faSearch} className="absolute left-6 top-1/2 -translate-y-1/2 text-mdOutline group-focus-within:text-mdPrimary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by name, email or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white dark:bg-mdSurfaceVariant/20 border-none rounded-[2rem] py-5 pl-16 pr-8 focus:ring-2 focus:ring-mdPrimary transition-all shadow-premium font-bold text-sm"
                    />
                </div>
            </div>

            {error && (
                <div className="bg-mdError/10 text-mdError px-8 py-5 rounded-3xl mb-12 border border-mdError/20 flex items-center gap-4">
                    <FontAwesomeIcon icon={faInfoCircle} />
                    <span className="font-bold">{error}</span>
                </div>
            )}

            {filteredMembers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredMembers.map((member) => {
                        const firstName = member.firstName || 'Member';
                        const lastName = member.lastName || '';
                        const initial = firstName.charAt(0).toUpperCase();

                        return (
                            <div key={member.id} className="glass-card group flex flex-col items-center text-center p-8 hover:scale-[1.02] transition-all duration-500">
                                <div className="relative mb-6">
                                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-mdPrimary/20 to-mdSecondary/20 p-1 group-hover:rotate-6 transition-transform duration-700">
                                        <div className="w-full h-full rounded-full bg-white dark:bg-mdSurface overflow-hidden shadow-inner">
                                            {member.profilePictureUrl ? (
                                                <img src={member.profilePictureUrl} alt={firstName} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-4xl font-black text-mdPrimary bg-mdPrimary/10">
                                                    {initial}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {!member.isProfilePublic && isAdmin && (
                                        <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-mdOutline/10 backdrop-blur-md flex items-center justify-center text-mdOutline border border-white/20" title="Private Profile">
                                            <FontAwesomeIcon icon={faInfoCircle} className="text-xs" />
                                        </div>
                                    )}
                                </div>
                                
                                <h3 className="text-xl font-black text-mdOnSurface mb-1 group-hover:text-mdPrimary transition-colors">
                                    {firstName} {lastName}
                                </h3>
                                
                                {isAdmin && (
                                    <span className="text-[10px] font-black uppercase tracking-widest text-mdOutline opacity-50 mb-4 block">
                                        ID: #{member.id} {member.status === 'active' ? '● Active' : ''}
                                    </span>
                                )}

                                {member.bio && (
                                    <p className="text-xs text-mdOnSurfaceVariant font-medium line-clamp-2 mb-6 opacity-80 leading-relaxed">
                                        {member.bio}
                                    </p>
                                )}

                                <div className="w-full space-y-3 pt-6 border-t border-mdOutline/5 mt-auto">
                                    {member.phoneNumber && (
                                        <div className="flex items-center justify-center gap-3 text-mdOnSurface opacity-70">
                                            <FontAwesomeIcon icon={faPhone} className="text-[10px]" />
                                            <p className="text-xs font-bold">{member.phoneNumber}</p>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-center gap-3 text-mdOnSurface opacity-70">
                                        <FontAwesomeIcon icon={faEnvelope} className="text-[10px]" />
                                        <p className="text-xs font-bold truncate max-w-[150px]">{member.email}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="glass-card p-24 text-center">
                    <div className="w-20 h-20 bg-mdSurfaceVariant/30 rounded-full flex items-center justify-center mx-auto mb-8 opacity-40">
                        <FontAwesomeIcon icon={faUser} className="text-3xl" />
                    </div>
                    <p className="text-2xl font-black text-mdOnSurface mb-2">
                        {searchTerm ? 'No matches found' : 'Fellowship gathering...'}
                    </p>
                    <p className="text-mdOnSurfaceVariant font-medium opacity-60">
                        {searchTerm ? 'Try adjusting your search criteria.' : 'Invite more members to join the assembly.'}
                    </p>
                </div>
            )}
        </div>
    );
}
