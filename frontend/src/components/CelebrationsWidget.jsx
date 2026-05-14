import React, { useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBirthdayCake, faChurch, faGift, faCalendarDay } from '@fortawesome/free-solid-svg-icons';

export default function CelebrationsWidget({ members }) {
    const { birthdays, anniversaries } = useMemo(() => {
        const today = new Date();
        const todayMonthStr = String(today.getMonth() + 1).padStart(2, '0');
        const todayDateStr = String(today.getDate()).padStart(2, '0');
        const todayMatch = `${todayMonthStr}-${todayDateStr}`;

        const bdays = [];
        const annivs = [];

        members.forEach(m => {
            if (m.dateOfBirth) {
                // Assuming dateOfBirth is YYYY-MM-DD
                const dobParts = m.dateOfBirth.split('-');
                if (dobParts.length === 3 && `${dobParts[1]}-${dobParts[2]}` === todayMatch) {
                    bdays.push(m);
                }
            }

            if (m.joinedDate) {
                const joined = new Date(m.joinedDate);
                const jMonth = String(joined.getMonth() + 1).padStart(2, '0');
                const jDate = String(joined.getDate()).padStart(2, '0');
                if (`${jMonth}-${jDate}` === todayMatch && joined.getFullYear() !== today.getFullYear()) {
                    annivs.push({ ...m, years: today.getFullYear() - joined.getFullYear() });
                }
            }
        });

        return { birthdays: bdays, anniversaries: annivs };
    }, [members]);

    if (birthdays.length === 0 && anniversaries.length === 0) {
        return null; // Don't show the widget if there's nothing to celebrate today
    }

    return (
        <div className="glass-card p-10 mt-8 rounded-[3rem] border-none shadow-premium relative overflow-hidden bg-gradient-to-br from-white to-amber-50">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <h3 className="text-2xl font-black text-mdOnSurface mb-8 flex items-center gap-3 relative z-10">
                <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span>
                <FontAwesomeIcon icon={faGift} className="text-amber-500" />
                Today's Blessings
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                {/* Birthdays */}
                {birthdays.length > 0 && (
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-mdOnSurfaceVariant mb-4 flex items-center gap-2">
                            <FontAwesomeIcon icon={faBirthdayCake} className="text-pink-500" />
                            Birthdays
                        </h4>
                        <div className="space-y-3">
                            {birthdays.map(m => (
                                <div key={`b-${m.id}`} className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-500 flex items-center justify-center font-black">
                                        {m.firstName.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-black text-mdOnSurface text-sm">{m.firstName} {m.lastName}</div>
                                        <div className="text-[10px] font-bold text-mdOnSurfaceVariant/60 uppercase tracking-widest">
                                            {m.branchId ? `Branch #${m.branchId}` : 'Central'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Anniversaries */}
                {anniversaries.length > 0 && (
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-mdOnSurfaceVariant mb-4 flex items-center gap-2">
                            <FontAwesomeIcon icon={faChurch} className="text-emerald-500" />
                            Anniversaries
                        </h4>
                        <div className="space-y-3">
                            {anniversaries.map(m => (
                                <div key={`a-${m.id}`} className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center font-black">
                                        <FontAwesomeIcon icon={faCalendarDay} />
                                    </div>
                                    <div>
                                        <div className="font-black text-mdOnSurface text-sm">{m.firstName} {m.lastName}</div>
                                        <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                                            {m.years} {m.years === 1 ? 'Year' : 'Years'} in Assembly
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
