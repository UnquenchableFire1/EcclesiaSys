import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faUsers, faUserTie, faChild, faFemale, faMale, faPlus, 
    faTrash, faCheckCircle, faHistory, faWalking 
} from '@fortawesome/free-solid-svg-icons';
import { useToast } from '../context/ToastContext';

export default function AttendanceManager({ branchId }) {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [visitorsList, setVisitorsList] = useState([]);
    const [activeView, setActiveView] = useState('new'); // 'new', 'history', or 'followup'

    // Form State
    const [stats, setStats] = useState({
        men: 0,
        women: 0,
        children: 0,
        elders: 0,
        deacons: 0,
        deaconesses: 0,
        visitorsCount: 0,
        visitorType: 'Worship', // 'Worship' or 'Visiting'
        date: new Date().toISOString().split('T')[0]
    });

    const [visitors, setVisitors] = useState([]);
    const [newVisitor, setNewVisitor] = useState({ name: '', phoneNumber: '', email: '' });

    const totalOfficers = Number(stats.elders) + Number(stats.deacons) + Number(stats.deaconesses);

    useEffect(() => {
        if (branchId) {
            fetchHistory();
            fetchVisitors();
        }
    }, [branchId]);

    const fetchVisitors = async () => {
        try {
            const res = await fetch(`/api/attendance/visitors/branch/${branchId}`);
            const data = await res.json();
            if (data.success) setVisitorsList(data.data);
        } catch (err) {
            console.error("Failed to load visitor list:", err);
        }
    };

    const fetchHistory = async () => {
        try {
            const res = await fetch(`/api/attendance/branch/${branchId}`);
            const data = await res.json();
            if (data.success) setHistory(data.data);
        } catch (err) {
            console.error("Failed to load attendance history:", err);
        }
    };

    const addVisitorRow = () => {
        if (!newVisitor.name || !newVisitor.phoneNumber) {
            showToast("Name and phone number are required for visitors.", "error");
            return;
        }
        setVisitors([...visitors, newVisitor]);
        setNewVisitor({ name: '', phoneNumber: '', email: '' });
        setStats({ ...stats, visitorsCount: visitors.length + 1 });
    };

    const removeVisitor = (index) => {
        const updated = visitors.filter((_, i) => i !== index);
        setVisitors(updated);
        setStats({ ...stats, visitorsCount: updated.length });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            ...stats,
            branchId,
            totalOfficers,
            visitors: visitors // Backend handles creating Visitor records
        };

        try {
            const res = await fetch('/api/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                showToast("Sunday stats archived successfully!", "success");
                setActiveView('history');
                fetchHistory();
                // Reset form
                setStats({ men: 0, women: 0, children: 0, elders: 0, deacons: 0, deaconesses: 0, visitorsCount: 0, visitorType: 'Worship', date: new Date().toISOString().split('T')[0] });
                setVisitors([]);
            } else {
                showToast(data.message, "error");
            }
        } catch (err) {
            showToast("Server refused archives.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleFollowUpToggle = async (visitorId, currentStatus) => {
        const newStatus = currentStatus === 'PENDING' ? 'COMPLETED' : 'PENDING';
        try {
            const res = await fetch(`/api/attendance/visitors/${visitorId}/followup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            const data = await res.json();
            if (data.success) {
                showToast(`Follow-up marked as ${newStatus.toLowerCase()}!`, "success");
                fetchVisitors();
            }
        } catch (err) {
            showToast("Failed to update status.", "error");
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-mdOnSurface tracking-tighter italic">Attendance Ledger</h1>
                    <p className="text-mdPrimary font-black text-xs uppercase tracking-widest mt-1">Sunday Numerical Reporting & Resident Newcomers</p>
                </div>
                <div className="flex bg-mdSurfaceVariant/20 p-1 rounded-2xl">
                    <button 
                        onClick={() => setActiveView('new')}
                        className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeView === 'new' ? 'bg-mdPrimary text-white shadow-lifted' : 'text-mdOnSurfaceVariant hover:text-mdPrimary'}`}
                    >
                        New Entry
                    </button>
                    <button 
                        onClick={() => setActiveView('followup')}
                        className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeView === 'followup' ? 'bg-mdPrimary text-white shadow-lifted' : 'text-mdOnSurfaceVariant hover:text-mdPrimary'}`}
                    >
                        Follow-up {visitorsList.filter(v => v.followUpStatus === 'PENDING').length > 0 && `(${visitorsList.filter(v => v.followUpStatus === 'PENDING').length})`}
                    </button>
                    <button 
                        onClick={() => setActiveView('history')}
                        className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeView === 'history' ? 'bg-mdPrimary text-white shadow-lifted' : 'text-mdOnSurfaceVariant hover:text-mdPrimary'}`}
                    >
                        History
                    </button>
                </div>
            </div>

            {activeView === 'new' ? (
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Date Picker */}
                    <div className="glass-card p-6 flex items-center justify-between border-l-4 border-l-mdPrimary">
                        <span className="text-sm font-black uppercase tracking-widest text-mdOnSurface">Statistical Date</span>
                        <input 
                            type="date" 
                            className="p-3 bg-mdSurfaceVariant/10 border-none rounded-xl font-bold text-mdPrimary outline-none focus:ring-2 focus:ring-mdPrimary/20"
                            value={stats.date}
                            onChange={e => setStats({...stats, date: e.target.value})}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Numerical Stats */}
                        {[
                            { id: 'men', label: 'Men', icon: faMale, color: 'blue' },
                            { id: 'women', label: 'Women', icon: faFemale, color: 'pink' },
                            { id: 'children', label: 'Children', icon: faChild, color: 'amber' },
                            { id: 'elders', label: 'Elders', icon: faUserTie, color: 'indigo' },
                            { id: 'deacons', label: 'Deacons', icon: faUserTie, color: 'teal' },
                            { id: 'deaconesses', label: 'Deaconesses', icon: faUserTie, color: 'rose' }
                        ].map(item => (
                            <div key={item.id} className="glass-card p-6 border-b-4 border-b-mdOutline/10 hover:border-b-mdPrimary transition-all group">
                                <div className={`w-10 h-10 rounded-xl bg-${item.color}-500/10 text-${item.color}-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <FontAwesomeIcon icon={item.icon} />
                                </div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-mdOnSurfaceVariant mb-2">{item.label}</label>
                                <input 
                                    type="number" 
                                    min="0"
                                    className="w-full text-2xl font-black bg-transparent border-none text-mdOnSurface focus:ring-0 p-0"
                                    value={stats[item.id]}
                                    onChange={e => setStats({...stats, [item.id]: e.target.value})}
                                />
                            </div>
                        ))}

                        {/* Officers Summary */}
                        <div className="glass-card p-6 bg-mdPrimary/5 border-l-4 border-l-mdPrimary">
                            <div className="w-10 h-10 rounded-xl bg-mdPrimary text-white flex items-center justify-center mb-4 shadow-lifted">
                                <FontAwesomeIcon icon={faUserTie} />
                            </div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-mdPrimary mb-2">Total Officers</label>
                            <div className="text-3xl font-black text-mdPrimary">{totalOfficers}</div>
                            <p className="text-[8px] font-bold text-mdOnSurfaceVariant mt-2">Sum of Elders + Deacons + Deaconesses</p>
                        </div>
                    </div>

                    {/* Visitors Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-black text-mdOnSurface italic">Newcomers Registry</h2>
                            <div className="h-px flex-1 bg-mdOutline/10"></div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-1 space-y-6">
                                <div className="glass-card p-8 space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-mdOnSurfaceVariant block mb-3">Visit Intent</label>
                                        <div className="flex gap-2">
                                            {['Worship', 'Visiting'].map(type => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => setStats({...stats, visitorType: type})}
                                                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${stats.visitorType === type ? 'bg-mdPrimary border-mdPrimary text-white shadow-lifted' : 'bg-transparent border-mdOutline/20 text-mdOnSurfaceVariant hover:bg-mdPrimary/5'}`}
                                                >
                                                    {type === 'Worship' ? 'Will Worship' : 'Just Visiting'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-mdOnSurfaceVariant block">Add Visitor Details</label>
                                        <input 
                                            placeholder="Full Name"
                                            className="w-full p-4 bg-mdSurfaceVariant/20 border-none rounded-2xl font-bold text-sm"
                                            value={newVisitor.name}
                                            onChange={e => setNewVisitor({...newVisitor, name: e.target.value})}
                                        />
                                        <input 
                                            placeholder="Phone Number"
                                            className="w-full p-4 bg-mdSurfaceVariant/20 border-none rounded-2xl font-bold text-sm"
                                            value={newVisitor.phoneNumber}
                                            onChange={e => setNewVisitor({...newVisitor, phoneNumber: e.target.value})}
                                        />
                                        <input 
                                            placeholder="Email (Optional)"
                                            className="w-full p-4 bg-mdSurfaceVariant/20 border-none rounded-2xl font-bold text-sm"
                                            value={newVisitor.email}
                                            onChange={e => setNewVisitor({...newVisitor, email: e.target.value})}
                                        />
                                        <button 
                                            type="button" 
                                            onClick={addVisitorRow}
                                            className="w-full py-4 bg-mdOnSurface text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2"
                                        >
                                            <FontAwesomeIcon icon={faPlus} /> Add to List
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-2">
                                <div className="glass-card overflow-hidden">
                                    <div className="p-6 bg-mdPrimary/5 border-b border-mdOutline/10 flex justify-between items-center">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-mdPrimary">Staging List ({visitors.length})</span>
                                        <FontAwesomeIcon icon={faWalking} className="text-mdPrimary opacity-30" />
                                    </div>
                                    <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                                        {visitors.length === 0 ? (
                                            <div className="py-12 text-center text-mdOnSurfaceVariant opacity-40 italic font-medium">No visitors queued for entry.</div>
                                        ) : visitors.map((v, i) => (
                                            <div key={i} className="p-4 bg-mdSurfaceVariant/10 rounded-2xl flex justify-between items-center animate-slide-right">
                                                <div>
                                                    <p className="font-black text-mdOnSurface">{v.name}</p>
                                                    <p className="text-[10px] font-bold text-mdOnSurfaceVariant">{v.phoneNumber} {v.email && `• ${v.email}`}</p>
                                                </div>
                                                <button onClick={() => removeVisitor(i)} className="w-8 h-8 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                                                    <FontAwesomeIcon icon={faTrash} className="text-[10px]" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-mdOutline/10">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="btn-premium w-full py-6 text-lg"
                        >
                            {loading ? 'Committing to Archives...' : 'Submit Statistical Report'}
                        </button>
                    </div>
                </form>
            ) : activeView === 'followup' ? (
                <div className="space-y-6">
                    {visitorsList.length === 0 ? (
                        <div className="glass-card p-20 text-center">
                             <FontAwesomeIcon icon={faWalking} className="text-6xl text-mdOutline/20 mb-6" />
                             <h3 className="text-2xl font-black text-mdOnSurface">No Newcomers Yet</h3>
                             <p className="text-mdOnSurfaceVariant font-medium">When visitors are added via attendance reports, they'll appear here for pastoral care.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {visitorsList.map(v => (
                                <div key={v.id} className={`glass-card p-6 flex justify-between items-center border-l-4 ${v.followUpStatus === 'PENDING' ? 'border-l-amber-500' : 'border-l-emerald-500 bg-emerald-500/5'}`}>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="text-xl font-black text-mdOnSurface">{v.name}</h4>
                                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${v.visitType === 'Worship' ? 'bg-blue-500/10 text-blue-600' : 'bg-pink-500/10 text-pink-600'}`}>
                                                {v.visitType === 'Worship' ? 'Soul Winning' : 'Visiting'}
                                            </span>
                                        </div>
                                        <p className="text-sm font-bold text-mdOnSurfaceVariant mb-1">{v.phoneNumber}</p>
                                        <p className="text-[10px] font-medium text-mdOutline italic">Registered: {new Date(v.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <button 
                                        onClick={() => handleFollowUpToggle(v.id, v.followUpStatus)}
                                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm ${v.followUpStatus === 'PENDING' ? 'bg-amber-500 text-white hover:bg-emerald-500' : 'bg-emerald-500 text-white hover:bg-amber-500'}`}
                                        title={v.followUpStatus === 'PENDING' ? "Mark as Contacted" : "Mark as Pending"}
                                    >
                                        <FontAwesomeIcon icon={v.followUpStatus === 'PENDING' ? faWalking : faCheckCircle} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-6">
                    {history.length === 0 ? (
                        <div className="glass-card p-20 text-center">
                             <FontAwesomeIcon icon={faHistory} className="text-6xl text-mdOutline/20 mb-6" />
                             <h3 className="text-2xl font-black text-mdOnSurface">Empty Archives</h3>
                             <p className="text-mdOnSurfaceVariant font-medium">No historical attendance records found for this assembly.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {history.map(item => (
                                <div key={item.id} className="glass-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-l-4 border-l-mdSecondary">
                                   <div>
                                       <h4 className="text-xl font-black text-mdOnSurface">{new Date(item.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h4>
                                       <div className="flex flex-wrap gap-4 mt-2">
                                           <span className="text-[10px] font-black uppercase tracking-widest text-mdOnSurfaceVariant">Total: {Number(item.menCount) + Number(item.womenCount) + Number(item.childrenCount)} souls</span>
                                           <span className="text-[10px] font-black uppercase tracking-widest text-mdPrimary">Officers: {item.totalOfficers}</span>
                                           <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 font-bold">Visitors: {item.visitorsCount}</span>
                                       </div>
                                   </div>
                                   <div className="flex gap-2">
                                        <div className="px-4 py-2 bg-mdSurfaceVariant/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-mdOnSurface">
                                            {item.visitorType} Focus
                                        </div>
                                   </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
