import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faPaperPlane, faInbox, faPaperclip, faReply, 
    faUserCircle, faCheckDouble, faShieldAlt, faEnvelopeOpenText,
    faChevronRight, faClock
} from '@fortawesome/free-solid-svg-icons';
import { useToast } from '../context/ToastContext';

export default function MessageCenter({ currentUserId, currentUserRole, adminName }) {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('inbox'); // 'inbox' or 'compose'
    const [selectedMessage, setSelectedMessage] = useState(null);
    const { showToast } = useToast();

    const [composeForm, setComposeForm] = useState({
        subject: '',
        content: '',
        category: 'FORMAL'
    });

    const [replyTo, setReplyTo] = useState(null);

    useEffect(() => {
        fetchMessages();
    }, [currentUserId, currentUserRole]);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            let url = `/api/messages/user/${currentUserId}`;
            
            // Super officials fetch by category to see all branch dispatches
            if (currentUserRole === 'SUPER_ADMIN') url = `/api/messages/category/DISTRICT_OFFICE`;
            else if (currentUserRole === 'SUPER_SECRETARY') url = `/api/messages/category/SECRETARIAT`;
            else if (currentUserRole === 'SUPER_MEDIA') url = `/api/messages/category/MEDIA_HUB`;

            const res = await fetch(url);
            const data = await res.json();
            if (data.success) setMessages(data.data);
        } catch (err) {
            console.error("Inbox load failure:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        setLoading(true);

        let targetCategory = 'DISTRICT_OFFICE'; 
        if (currentUserRole === 'BRANCH_SECRETARY' || currentUserRole === 'SUPER_SECRETARY') targetCategory = 'SECRETARIAT';
        if (currentUserRole === 'BRANCH_MEDIA' || currentUserRole === 'SUPER_MEDIA') targetCategory = 'MEDIA_HUB';

        const payload = {
            senderId: currentUserId,
            subject: composeForm.subject,
            content: composeForm.content,
            category: targetCategory,
            receiverId: replyTo ? replyTo.senderId : null, // If reply, send back to sender
            parentMessageId: replyTo ? replyTo.id : null
        };

        try {
            const res = await fetch('/api/messages/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                showToast("Formal dispatch sent successfully.", "success");
                setComposeForm({ subject: '', content: '', category: 'FORMAL' });
                setReplyTo(null);
                setActiveTab('inbox');
                fetchMessages();
            } else {
                showToast(data.message, "error");
            }
        } catch (err) {
            showToast("Dispatch failed to exit assembly gates.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleReply = (msg) => {
        setReplyTo(msg);
        setComposeForm({
            subject: msg.subject.startsWith('Re:') ? msg.subject : `Re: ${msg.subject}`,
            content: `\n\n--- On ${new Date(msg.timestamp).toLocaleString()}, Official wrote ---\n> ${msg.content.substring(0, 100)}...`,
            category: msg.category
        });
        setActiveTab('compose');
        setSelectedMessage(null);
    };

    return (
        <div className="animate-fade-in mt-4">
            <div className="flex flex-col lg:flex-row gap-8 min-h-[70vh]">
                {/* Sidebar Navigation */}
                <div className="w-full lg:w-80 space-y-4">
                    <button 
                        onClick={() => { setActiveTab('compose'); setSelectedMessage(null); }}
                        className="w-full py-5 bg-mdPrimary text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-premium hover:shadow-lifted transition-all flex items-center justify-center gap-3 group"
                    >
                        <FontAwesomeIcon icon={faPaperPlane} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        New Dispatch
                    </button>

                    <div className="glass-card p-4 space-y-2">
                        <button 
                            onClick={() => { setActiveTab('inbox'); setSelectedMessage(null); }}
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${activeTab === 'inbox' ? 'bg-mdPrimary/10 text-mdPrimary' : 'hover:bg-mdSurfaceVariant/10 text-mdOnSurfaceVariant'}`}
                        >
                            <FontAwesomeIcon icon={faInbox} className="w-5" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-left flex-1">Archives & Inbox</span>
                        </button>
                    </div>

                    <div className="p-8 bg-mdPrimary/5 rounded-[2.5rem] border border-mdPrimary/10">
                        <h4 className="text-[10px] font-black text-mdPrimary uppercase tracking-widest mb-4 flex items-center gap-2">
                            <FontAwesomeIcon icon={faShieldAlt} /> Protocols
                        </h4>
                        <p className="text-[10px] font-medium text-mdOnSurfaceVariant leading-loose opacity-70 italic">
                            All communication within the EcclesiaSys framework is archived and monitored for administrative integrity. Dispatches are paired by role.
                        </p>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1">
                    {activeTab === 'compose' ? (
                        <div className="glass-card p-10 animate-slide-up border-l-8 border-l-mdPrimary h-full">
                            <h2 className="text-3xl font-black text-mdOnSurface mb-8 tracking-tighter">New Formal Dispatch</h2>
                            <form onSubmit={handleSend} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-mdOutline ml-4">Subject Matter</label>
                                    <input 
                                        className="w-full p-5 bg-mdSurfaceVariant/10 border-none rounded-2xl font-bold text-mdOnSurface" 
                                        placeholder="e.g. Monthly Branch Report Correction"
                                        value={composeForm.subject}
                                        onChange={e => setComposeForm({...composeForm, subject: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-mdOutline ml-4">Detailed Content</label>
                                    <textarea 
                                        className="w-full p-5 bg-mdSurfaceVariant/10 border-none rounded-3xl font-medium text-mdOnSurface h-64 outline-none focus:ring-2 focus:ring-mdPrimary/10" 
                                        placeholder="Enter your formal message here..."
                                        value={composeForm.content}
                                        onChange={e => setComposeForm({...composeForm, content: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="flex justify-end gap-4 pt-4">
                                    <button 
                                        type="button" 
                                        onClick={() => setActiveTab('inbox')}
                                        className="px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-mdOnSurfaceVariant hover:bg-mdSurfaceVariant/20 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={loading}
                                        className="btn-premium px-12"
                                    >
                                        {loading ? 'Transmitting...' : 'Send Dispatch'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : selectedMessage ? (
                        <div className="glass-card p-10 animate-fade-in border-l-8 border-l-mdPrimary h-full flex flex-col">
                            <div className="flex justify-between items-start mb-10 pb-8 border-b border-mdOutline/10">
                                <div>
                                    <button 
                                        onClick={() => setSelectedMessage(null)}
                                        className="text-[10px] font-black text-mdPrimary uppercase tracking-widest flex items-center gap-2 mb-4 hover:opacity-70 transition-opacity"
                                    >
                                        ← Return to Inbox
                                    </button>
                                    <h1 className="text-4xl font-black text-mdOnSurface tracking-tighter">{selectedMessage.subject}</h1>
                                    <p className="text-mdOnSurfaceVariant font-bold mt-2">Dispatched: {new Date(selectedMessage.timestamp).toLocaleString()}</p>
                                </div>
                                <div className="w-16 h-16 rounded-[1.5rem] bg-mdPrimary shadow-lifted text-white flex items-center justify-center text-xl">
                                    <FontAwesomeIcon icon={faEnvelopeOpenText} />
                                </div>
                            </div>
                            
                            <div className="flex-1 bg-mdSurfaceVariant/5 p-8 rounded-[2rem] border border-mdOutline/5 mb-8 overflow-y-auto">
                                <p className="text-lg font-medium text-mdOnSurface leading-relaxed whitespace-pre-wrap">
                                    {selectedMessage.content}
                                </p>
                            </div>

                            <button 
                                onClick={() => handleReply(selectedMessage)}
                                className="btn-premium sm:w-max flex items-center gap-3"
                            >
                                <FontAwesomeIcon icon={faReply} />
                                Compose Reply
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {loading ? (
                                <div className="glass-card p-20 text-center animate-pulse">
                                    <p className="text-[10px] font-black text-mdPrimary uppercase tracking-widest">Opening Vault...</p>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="glass-card p-20 text-center flex flex-col items-center">
                                    <div className="w-20 h-20 bg-mdSurfaceVariant/20 rounded-full flex items-center justify-center text-4xl text-mdOutline/30 mb-6">
                                        <FontAwesomeIcon icon={faInbox} />
                                    </div>
                                    <h3 className="text-2xl font-black text-mdOnSurface">Vault is Empty</h3>
                                    <p className="text-mdOnSurfaceVariant font-medium max-w-sm mb-8">Your formal archives are currently clear of any new dispatches.</p>
                                    <button onClick={() => setActiveTab('compose')} className="btn-premium">Dispatch New Message</button>
                                </div>
                            ) : messages.map(msg => (
                                <div 
                                    key={msg.id} 
                                    onClick={() => setSelectedMessage(msg)}
                                    className={`glass-card p-8 flex items-center justify-between gap-6 hover:-translate-y-1 hover:shadow-premium transition-all cursor-pointer group border-l-4 ${!msg.read ? 'border-l-mdPrimary bg-mdPrimary/[0.02]' : 'border-l-transparent'}`}
                                >
                                    <div className="flex items-center gap-6 flex-1 min-w-0">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl transition-all ${!msg.read ? 'bg-mdPrimary text-white shadow-lifted ring-4 ring-mdPrimary/10' : 'bg-mdSurfaceVariant/40 text-mdOutline opacity-40'}`}>
                                            <FontAwesomeIcon icon={!msg.read ? faInbox : faCheckDouble} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h4 className={`text-xl font-black truncate ${!msg.read ? 'text-mdOnSurface' : 'text-mdOnSurfaceVariant opacity-60'}`}>{msg.subject}</h4>
                                                {!msg.read && <span className="px-2 py-0.5 bg-mdPrimary text-white text-[8px] font-black uppercase tracking-widest rounded-lg">New</span>}
                                            </div>
                                            <p className="text-sm font-medium text-mdOnSurfaceVariant truncate opacity-70 italic">"{msg.content}"</p>
                                        </div>
                                    </div>
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[10px] font-black text-mdOutline uppercase tracking-widest flex items-center justify-end gap-2">
                                            <FontAwesomeIcon icon={faClock} className="text-[9px]" />
                                            {new Date(msg.timestamp).toLocaleDateString()}
                                        </p>
                                        <div className="mt-2 text-mdPrimary opacity-0 group-hover:opacity-100 transition-opacity">
                                            <FontAwesomeIcon icon={faChevronRight} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
