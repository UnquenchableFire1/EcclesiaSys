import { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faDownload } from '@fortawesome/free-solid-svg-icons';

export default function Lightbox({ src, alt, onClose }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  if (!src) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-fade-in"
      onClick={onClose}
    >
      <button 
        className="absolute top-8 right-8 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all duration-300 z-10"
        onClick={onClose}
      >
        <FontAwesomeIcon icon={faTimes} className="text-xl" />
      </button>

      <div 
        className="relative max-w-[90vw] max-h-[90vh] group"
        onClick={(e) => e.stopPropagation()}
      >
        <img 
          src={src} 
          alt={alt || 'Profile Portrait'} 
          className="w-full h-full object-contain rounded-2xl shadow-premium animate-zoom-in"
        />
        
        <div className="absolute -bottom-16 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           <a 
             href={src} 
             download 
             target="_blank" 
             rel="noreferrer"
             className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-full backdrop-blur-md transition-all font-bold text-xs uppercase tracking-widest"
           >
             <FontAwesomeIcon icon={faDownload} />
             Save Portrait
           </a>
        </div>
      </div>
    </div>
  );
}
