import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faHome, 
    faBullhorn, 
    faCalendarAlt, 
    faMicrophone, 
    faUsers, 
    faHeadset, 
    faUser, 
    faSignOutAlt,
    faChevronLeft,
    faChevronRight
} from '@fortawesome/free-solid-svg-icons';

const Sidebar = ({ userType, activeTab, setActiveTab }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < 1024);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth < 1024) setIsCollapsed(true);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const menuItems = userType === 'admin' ? [
        { id: 'home', label: 'Dashboard', icon: faHome },
        { id: 'members', label: 'Members', icon: faUsers },
        { id: 'announcements', label: 'Announcements', icon: faBullhorn },
        { id: 'events', label: 'Events', icon: faCalendarAlt },
        { id: 'sermons', label: 'Sermons', icon: faMicrophone },
    ] : [
        { id: 'home', label: 'Overview', icon: faHome },
        { id: 'announcements', label: 'Announcements', icon: faBullhorn },
        { id: 'events', label: 'Events', icon: faCalendarAlt },
        { id: 'sermons', label: 'Sermons', icon: faMicrophone },
        { id: 'directory', label: 'Members', icon: faUsers },
        { id: 'support', label: 'Support', icon: faHeadset },
        { id: 'profile', label: 'Profile', icon: faUser },
    ];

    const handleTabClick = (id) => {
        setActiveTab(id);
        const storageKey = userType === 'admin' ? 'adminActiveTab' : 'memberActiveTab';
        sessionStorage.setItem(storageKey, id);
        if (isMobile) setIsCollapsed(true);
    };

    if (isMobile && isCollapsed) {
        return (
            <button 
                onClick={() => setIsCollapsed(false)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-mdPrimary text-white rounded-full shadow-md3 z-[100] flex items-center justify-center text-xl"
            >
                <FontAwesomeIcon icon={faChevronRight} />
            </button>
        );
    }

    return (
        <>
            {/* Mobile Backdrop */}
            {isMobile && !isCollapsed && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
                    onClick={() => setIsCollapsed(true)}
                ></div>
            )}

            <aside 
                className={`fixed left-0 top-0 h-screen bg-mdSurface border-r border-mdSurfaceVariant transition-all duration-300 z-[100] flex flex-col ${
                    isCollapsed ? 'w-20' : 'w-72'
                } ${isMobile && isCollapsed ? '-translate-x-full' : 'translate-x-0'}`}
            >
                {/* Sidebar Header */}
                <div className="p-6 flex items-center justify-between">
                    {!isCollapsed && (
                        <span className="text-2xl font-black text-mdPrimary tracking-tighter">EcclesiaSys</span>
                    )}
                    <button 
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={`w-10 h-10 rounded-xl hover:bg-mdSurfaceVariant flex items-center justify-center text-mdOutline transition-colors ${isCollapsed ? 'mx-auto' : ''}`}
                    >
                        <FontAwesomeIcon icon={isCollapsed ? faChevronRight : faChevronLeft} />
                    </button>
                </div>

                {/* Menu Items */}
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleTabClick(item.id)}
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 group relative ${
                                activeTab === item.id 
                                    ? 'bg-mdPrimaryContainer text-mdPrimary shadow-sm' 
                                    : 'text-mdOnSurfaceVariant hover:bg-mdSurfaceVariant hover:text-mdOnSurface'
                            }`}
                        >
                            <div className={`w-6 flex justify-center shrink-0 transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                                <FontAwesomeIcon icon={item.icon} className="text-lg" />
                            </div>
                            {!isCollapsed && (
                                <span className="font-bold whitespace-nowrap">{item.label}</span>
                            )}
                            {isCollapsed && (
                                <div className="absolute left-full ml-4 px-3 py-2 bg-mdOnSurface text-mdSurface text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap shadow-md z-[110]">
                                    {item.label}
                                </div>
                            )}
                        </button>
                    ))}
                </nav>

                {/* Sidebar Footer */}
                <div className="p-4 mt-auto border-t border-mdSurfaceVariant">
                    <button 
                        onClick={() => navigate('/')}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl text-mdOnSurfaceVariant hover:bg-mdSurfaceVariant hover:text-mdOnSurface transition-all group ${isCollapsed ? 'justify-center' : ''}`}
                    >
                        <FontAwesomeIcon icon={faHome} className="text-lg group-hover:scale-110 transition-transform" />
                        {!isCollapsed && <span className="font-bold">Home Page</span>}
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
