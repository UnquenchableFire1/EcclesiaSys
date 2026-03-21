import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faCheckCircle, 
    faExclamationCircle, 
    faInfoCircle, 
    faExclamationTriangle,
    faTimes 
} from '@fortawesome/free-solid-svg-icons';

const Toast = ({ message, type = 'info', onClick, onClose }) => {
    
    const icons = {
        success: { icon: faCheckCircle, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
        error: { icon: faExclamationCircle, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
        info: { icon: faInfoCircle, color: 'text-mdPrimary', bg: 'bg-mdPrimary/10', border: 'border-mdPrimary/20' },
        warning: { icon: faExclamationTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' }
    };

    const config = icons[type] || icons.info;

    const handleClick = () => {
        if (onClick) {
            onClick();
            onClose(); // Close toast when clicked if it has an action
        }
    };

    return (
        <div 
            onClick={handleClick}
            className={`
                glass-card p-4 rounded-2xl border ${config.border} ${config.bg} 
                flex items-center gap-4 shadow-premium animate-slide-up bg-white/80 backdrop-blur-md
                pointer-events-auto transition-all hover:scale-[1.02]
                ${onClick ? 'cursor-pointer hover:shadow-lg active:scale-95' : ''}
            `}
        >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.color} bg-white shadow-inner`}>
                <FontAwesomeIcon icon={config.icon} className="text-xl" />
            </div>
            
            <div className="flex-1">
                <p className="text-sm font-black text-mdOnSurface tracking-tight">
                    {message}
                </p>
            </div>

            <button 
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-mdOutline hover:bg-black/5 transition-all"
            >
                <FontAwesomeIcon icon={faTimes} className="text-xs" />
            </button>
        </div>
    );
};

export default Toast;
