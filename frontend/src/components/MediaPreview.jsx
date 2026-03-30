import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faFilePdf, faFileImage, faFileAlt, faDownload, 
    faEye, faExternalLinkAlt, faPlay, faVolumeUp 
} from '@fortawesome/free-solid-svg-icons';
import Lightbox from './Lightbox';

const MediaPreview = ({ url, type, title }) => {
    const [showLightbox, setShowLightbox] = useState(false);
    const [showPdfModal, setShowPdfModal] = useState(false);

    if (!url) return null;

    const lowerUrl = url.toLowerCase();
    const isImage = lowerUrl.match(/\.(jpg|jpeg|png|webp|gif)$/) || type === 'image';
    const isPdf = lowerUrl.endsWith('.pdf') || type === 'pdf';
    const isAudio = lowerUrl.endsWith('.mp3') || type === 'audio';
    const isVideo = lowerUrl.endsWith('.mp4') || lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be') || type === 'video';

    // Helper to render the appropriate icon
    const getIcon = () => {
        if (isImage) return faFileImage;
        if (isPdf) return faFilePdf;
        if (isAudio) return faVolumeUp;
        if (isVideo) return faPlay;
        return faFileAlt;
    };

    return (
        <div className="mt-4 animate-fade-in">
            {/* Inline Preview / Action Card */}
            <div className="glass-card p-4 flex items-center justify-between border-l-4 border-l-mdPrimary group hover:shadow-premium transition-all">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-mdPrimary/10 flex items-center justify-center text-mdPrimary group-hover:scale-110 transition-transform">
                        <FontAwesomeIcon icon={getIcon()} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-mdOutline">Attachment</p>
                        <p className="text-sm font-bold text-mdOnSurface truncate max-w-[200px]">{title || "Sanctuary Media"}</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    {(isImage || isPdf) && (
                        <button 
                            onClick={() => isImage ? setShowLightbox(true) : setShowPdfModal(true)}
                            className="w-10 h-10 rounded-lg bg-mdPrimary/10 text-mdPrimary hover:bg-mdPrimary hover:text-white transition-all flex items-center justify-center"
                            title="Preview"
                        >
                            <FontAwesomeIcon icon={faEye} />
                        </button>
                    )}
                    <a 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-lg bg-mdSurfaceVariant/20 text-mdOnSurfaceVariant hover:bg-mdPrimary hover:text-white transition-all flex items-center justify-center"
                        title="Open/Download"
                    >
                        <FontAwesomeIcon icon={isPdf || isImage ? faExternalLinkAlt : faDownload} />
                    </a>
                </div>
            </div>

            {/* Media Players (Visible if it's Audio or Video) */}
            {isAudio && (
                <div className="mt-4 p-4 glass-card bg-mdSurfaceVariant/5 rounded-2xl">
                    <audio controls className="w-full">
                        <source src={url} type="audio/mpeg" />
                        Your browser does not support the audio element.
                    </audio>
                </div>
            )}

            {isVideo && (
                <div className="mt-4 overflow-hidden rounded-2xl shadow-xl bg-black aspect-video flex items-center justify-center">
                    {lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be') ? (
                        <iframe 
                            width="100%" 
                            height="100%" 
                            src={url.replace('watch?v=', 'embed/').split('&')[0]} 
                            title="YouTube video player" 
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                        ></iframe>
                    ) : (
                        <video controls className="w-full h-full">
                            <source src={url} type="video/mp4" />
                            Your browser does not support the video element.
                        </video>
                    )}
                </div>
            )}

            {/* Lightbox for Images */}
            {showLightbox && (
                <Lightbox 
                    src={url} 
                    onClose={() => setShowLightbox(false)} 
                />
            )}

            {/* Modal for PDF Preview */}
            {showPdfModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10 bg-black/90 backdrop-blur-md animate-fade-in">
                    <div className="relative w-full h-full max-w-6xl bg-white rounded-[2rem] overflow-hidden flex flex-col">
                        <div className="p-6 border-b flex justify-between items-center bg-mdSurface">
                            <h3 className="font-black uppercase tracking-tighter text-mdOnSurface">Document Preview</h3>
                            <button 
                                onClick={() => setShowPdfModal(false)}
                                className="px-6 py-2 bg-mdError/10 text-mdError font-black rounded-full hover:bg-mdError hover:text-white transition-all"
                            >
                                Close Sanctuary Viewer
                            </button>
                        </div>
                        <div className="flex-1 bg-mdSurfaceVariant/20">
                            <iframe 
                                src={`${url}#toolbar=0`} 
                                className="w-full h-full border-none"
                                title="PDF Viewer"
                            ></iframe>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MediaPreview;
