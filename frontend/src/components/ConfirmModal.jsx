import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faTrash, faTimes, faCheckCircle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

export default function ConfirmModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = "Confirm Action", 
    message = "Are you sure you want to proceed?", 
    confirmText = "Confirm", 
    cancelText = "Cancel",
    type = "danger", // 'danger' (red), 'info' (blue), 'warning' (amber)
    icon = null
}) {
    if (!isOpen) return null;

    const colors = {
        danger: {
            bg: 'bg-mdError/10',
            text: 'text-mdError',
            btn: 'bg-mdError hover:bg-mdError/90',
            btnConfirm: 'bg-mdError',
            icon: faTrash
        },
        warning: {
            bg: 'bg-amber-500/10',
            text: 'text-amber-500',
            btn: 'bg-amber-500 hover:bg-amber-500/90',
            btnConfirm: 'bg-amber-500',
            icon: faExclamationTriangle
        },
        info: {
            bg: 'bg-mdPrimary/10',
            text: 'text-mdPrimary',
            btn: 'bg-mdPrimary hover:bg-mdPrimary/90',
            btnConfirm: 'bg-mdPrimary',
            icon: faInfoCircle
        }
    };

    const theme = colors[type] || colors.danger;
    const finalIcon = icon || theme.icon;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={onClose}></div>
            <div className="glass-card relative z-10 w-full max-w-sm bg-white overflow-hidden shadow-premium animate-scale-in border-none rounded-[2rem] p-8">
                <div className={`w-16 h-16 ${theme.bg} ${theme.text} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                    <FontAwesomeIcon icon={finalIcon} className="text-2xl" />
                </div>
                
                <h3 className="text-2xl font-black text-mdOnSurface tracking-tighter text-center mb-2">{title}</h3>
                <p className="text-sm font-medium text-mdOnSurfaceVariant text-center mb-8">{message}</p>
                
                <div className="flex gap-4">
                    <button 
                        onClick={onClose}
                        className="flex-1 py-4 bg-mdSurfaceVariant/30 text-mdOnSurface font-black rounded-xl hover:bg-mdSurfaceVariant/50 transition-all uppercase text-[10px] tracking-widest"
                    >
                        {cancelText}
                    </button>
                    <button 
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`flex-1 py-4 ${theme.btn} text-white font-black rounded-xl hover:shadow-lifted transition-all uppercase text-[10px] tracking-widest`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
