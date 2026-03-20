import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faPaperPlane, faUser, faChevronLeft, faSearch, 
    faInbox, faClock, faCheck, faCheckDouble, faComments
} from '@fortawesome/free-solid-svg-icons';
import { 
    sendChatMessage, getChatHistory, getConversations, markChatMessageAsRead, getAdminTeam 
} from '../services/api';

export default function Chat() {
    const userId = parseInt(sessionStorage.getItem('userId'));
    const userType = sessionStorage.getItem('userType');
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const scrollRef = useRef(null);

    // Initial load
    useEffect(() => {
        const initChat = async () => {
            if (userType === 'admin') {
                await fetchConversations();
            } else {
                // For members, dynamically discover the support admin
                try {
                    const res = await getAdminTeam();
                    if (res.data.success) {
                        setActiveConversation({ 
                            id: res.data.adminId, 
                            name: res.data.adminName || 'Sanctuary Support', 
                            type: 'admin' 
                        });
                    } else {
                        // Fallback if no admin is found
                        setActiveConversation({ id: 1, name: 'Sanctuary Support', type: 'admin' });
                    }
                } catch (err) {
                    console.error("Discovery error:", err);
                    setActiveConversation({ id: 1, name: 'Sanctuary Support', type: 'admin' });
                }
            }
            setLoading(false);
        };
        initChat();
    }, [userType, userId]);

    // Fetch conversation history when active conversation changes
    useEffect(() => {
        if (activeConversation) {
            fetchHistory();
            const interval = setInterval(fetchHistory, 5000); // Polling for new messages
            return () => clearInterval(interval);
        }
    }, [activeConversation]);

    // Scroll to bottom when messages update
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const fetchConversations = async () => {
        try {
            const res = await getConversations(userId);
            if (res.data.success) {
                setConversations(res.data.data || res.data.conversations || []);
            }
        } catch (err) {
            console.error("Failed to fetch conversations:", err);
        }
    };

    const fetchHistory = async () => {
        if (!activeConversation) return;
        try {
            const res = await getChatHistory(userId, activeConversation.id);
            if (res.data.success) {
                const newMessages = res.data.data || res.data.messages || [];
                setMessages(newMessages);
                
                // Mark unread messages as read
                newMessages.forEach(msg => {
                    if (!msg.isRead && msg.receiverId === userId) {
                        markChatMessageAsRead(msg.id);
                    }
                });
            }
        } catch (err) {
            console.error("Failed to fetch history:", err);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversation || sending) return;

        setSending(true);
        try {
            const res = await sendChatMessage({
                senderId: userId,
                senderType: userType, // Pass sender type
                receiverId: activeConversation.id,
                receiverType: userType === 'admin' ? 'member' : 'admin', // Pass receiver type
                content: newMessage.trim()
            });

            if (res.data.success) {
                setNewMessage('');
                fetchHistory();
                if (userType === 'admin') fetchConversations();
            }
        } catch (err) {
            console.error("Failed to send message:", err);
            alert("Connection error. The Sanctuary could not transmit your message at this time.");
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="w-12 h-12 border-4 border-mdPrimary/30 border-t-mdPrimary rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="glass-card overflow-hidden flex flex-col md:flex-row h-[70vh] border-none shadow-premium rounded-[3rem] bg-white">
            
            {/* Sidebar (Only for Admins) */}
            {userType === 'admin' && (
                <div className={`w-full md:w-80 border-r border-mdOutline/10 flex flex-col ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-8 border-b border-mdOutline/10">
                        <h2 className="text-2xl font-black text-mdOnSurface tracking-tighter mb-6 italic">Sanctuary Inbox</h2>
                        <div className="relative">
                            <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-mdOutline text-xs" />
                            <input 
                                type="text" 
                                placeholder="Search seekers..." 
                                className="w-full pl-10 pr-4 py-3 bg-mdSurfaceVariant/20 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-mdPrimary/20 transition-all"
                            />
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
                        {conversations.length > 0 ? conversations.map((conv) => (
                            <button 
                                key={conv.userId}
                                onClick={() => setActiveConversation({ id: conv.userId, name: conv.userName })}
                                className={`w-full p-6 rounded-2xl flex items-center gap-4 transition-all hover:bg-mdPrimary/5 ${activeConversation?.id === conv.userId ? 'bg-mdPrimary/10 ring-1 ring-mdPrimary/20' : ''}`}
                            >
                                <div className="w-12 h-12 rounded-xl bg-mdPrimary/10 flex items-center justify-center text-mdPrimary font-black text-lg shadow-inner">
                                    {conv.userName?.charAt(0) || 'M'}
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                    <h4 className="font-black text-sm text-mdOnSurface truncate">{conv.userName}</h4>
                                    <p className="text-[10px] font-medium text-mdOnSurfaceVariant truncate opacity-70">
                                        {conv.lastMessage || 'Open sanctuary dialogue'}
                                    </p>
                                </div>
                                {conv.unreadCount > 0 && (
                                    <span className="w-5 h-5 bg-mdPrimary text-white text-[8px] font-black rounded-full flex items-center justify-center animate-pulse">
                                        {conv.unreadCount}
                                    </span>
                                )}
                            </button>
                        )) : (
                            <div className="flex flex-col items-center justify-center py-20 opacity-20">
                                <FontAwesomeIcon icon={faInbox} className="text-4xl mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-widest">No active dialogues</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col bg-mdSurfaceVariant/5 ${!activeConversation && userType === 'admin' ? 'hidden md:flex' : 'flex'}`}>
                {activeConversation ? (
                    <>
                        {/* Header */}
                        <div className="p-8 bg-white border-b border-mdOutline/10 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                {userType === 'admin' && (
                                    <button 
                                        onClick={() => setActiveConversation(null)}
                                        className="md:hidden w-10 h-10 rounded-xl bg-mdSurfaceVariant/20 flex items-center justify-center text-mdOnSurface"
                                    >
                                        <FontAwesomeIcon icon={faChevronLeft} />
                                    </button>
                                )}
                                <div className="w-12 h-12 rounded-xl bg-mdPrimary text-white flex items-center justify-center font-black text-xl shadow-premium">
                                    {activeConversation.name?.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-black text-mdOnSurface tracking-tight">{activeConversation.name}</h3>
                                    <span className="text-[9px] font-black text-green-500 uppercase tracking-widest flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                        Sanctuary Connected
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Messages Pool */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-6">
                            {messages.length > 0 ? messages.map((msg, index) => {
                                const isOwn = msg.senderId === userId;
                                return (
                                    <div key={msg.id || index} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                                        <div className={`max-w-[80%] space-y-2 ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                                            <div className={`p-5 rounded-[1.8rem] text-sm font-medium shadow-sm leading-relaxed ${
                                                isOwn 
                                                ? 'bg-mdPrimary text-white rounded-tr-none' 
                                                : 'bg-white text-mdOnSurface rounded-tl-none border border-mdOutline/5'
                                            }`}>
                                                {msg.content}
                                            </div>
                                            <div className="flex items-center gap-3 px-2">
                                                <span className="text-[9px] font-black text-mdOutline uppercase tracking-tighter opacity-60">
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {isOwn && (
                                                    <FontAwesomeIcon 
                                                        icon={msg.isRead ? faCheckDouble : faCheck} 
                                                        className={`text-[8px] ${msg.isRead ? 'text-blue-400' : 'text-mdOutline'}`} 
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="flex flex-col items-center justify-center py-20 opacity-20">
                                    <FontAwesomeIcon icon={faComments} className="text-5xl mb-6" />
                                    <p className="text-xs font-black uppercase tracking-[0.3em]">Speak your truths in the sanctuary</p>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-8 bg-white border-t border-mdOutline/10">
                            <form onSubmit={handleSendMessage} className="flex gap-4">
                                <input 
                                    type="text" 
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type your message to the sanctuary..." 
                                    className="flex-1 bg-mdSurfaceVariant/20 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-mdPrimary/10 transition-all shadow-inner"
                                />
                                <button 
                                    type="submit" 
                                    disabled={!newMessage.trim() || sending}
                                    className="w-14 h-14 bg-mdPrimary text-white rounded-2xl flex items-center justify-center shadow-premium hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    <FontAwesomeIcon icon={faPaperPlane} className={sending ? 'animate-pulse' : ''} />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-8 opacity-20">
                        <div className="w-32 h-32 rounded-full border-4 border-dashed border-mdOutline/30 flex items-center justify-center">
                            <FontAwesomeIcon icon={faInbox} className="text-6xl" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-mdOnSurface tracking-tighter mb-2">Sanctuary Dialogue</h3>
                            <p className="text-sm font-medium text-mdOnSurfaceVariant max-w-xs mx-auto uppercase tracking-widest leading-loose">
                                Select a member from the registry to begin a dialogue of faith and support.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
