import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faImages, faUpload, faTrash, faTimes, faPlus, faCamera,
    faMicrophone, faSearch, faSpinner, faPlay, faHeadphones,
    faFolder, faFolderOpen, faArrowLeft, faBookOpen, faVideo,
    faChevronRight, faFilm, faDownload
} from '@fortawesome/free-solid-svg-icons';
import { getGalleryItems, getGalleryFolders, createGalleryItem, deleteGalleryItem, uploadGalleryMedia } from '../services/api';
import Lightbox from '../components/Lightbox';
import { useToast } from '../context/ToastContext';

/**
 * Gallery — photos, video, audio, albums, and sermon classification
 * canUpload: true for media team and branch admins
 */
export default function Gallery({ canUpload = false, branchId = null, currentUserId, currentUserName }) {
    const [viewMode, setViewMode] = useState('all'); // all | photos | sermons | albums
    const [activeFolder, setActiveFolder] = useState(null);
    const [galleryItems, setGalleryItems] = useState([]);
    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lightboxSrc, setLightboxSrc] = useState(null);
    const [videoModal, setVideoModal] = useState(null);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [uploadForm, setUploadForm] = useState({
        title: '', caption: '', mediaType: 'PHOTO', isSermon: false, folderName: '',
    });
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadPreview, setUploadPreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { showToast } = useToast();

    const fetchData = async () => {
        setLoading(true);
        try {
            const [itemsRes, foldersRes] = await Promise.all([
                getGalleryItems(branchId),
                getGalleryFolders(branchId),
            ]);
            setGalleryItems(Array.isArray(itemsRes.data?.data) ? itemsRes.data.data : []);
            setFolders(Array.isArray(foldersRes.data?.data) ? foldersRes.data.data : []);
        } catch (err) {
            console.error('Gallery fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [branchId]);

    // ---- Filtering ----
    const visibleItems = galleryItems.filter(item => {
        const matchFolder = activeFolder ? item.folderName === activeFolder : true;
        const matchMode = viewMode === 'photos'
            ? item.mediaType === 'PHOTO'
            : viewMode === 'sermons'
            ? item.isSermon === true
            : true;
        const matchSearch = !searchQuery ||
            (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.caption || '').toLowerCase().includes(searchQuery.toLowerCase());
        return matchFolder && matchMode && matchSearch;
    });

    // Album thumbnail = first photo in the folder
    const albumData = folders.map(f => ({
        name: f,
        count: galleryItems.filter(i => i.folderName === f).length,
        thumb: galleryItems.find(i => i.folderName === f && i.mediaType === 'PHOTO')?.mediaUrl || null,
    }));

    // ---- File selection ----
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadFile(file);
        if (uploadForm.mediaType === 'PHOTO') {
            const reader = new FileReader();
            reader.onload = () => setUploadPreview(reader.result);
            reader.readAsDataURL(file);
        } else {
            setUploadPreview(null);
        }
    };

    const acceptForType = () => {
        if (uploadForm.mediaType === 'PHOTO') return 'image/*';
        if (uploadForm.mediaType === 'VIDEO') return 'video/mp4,video/mov,video/avi,video/mkv';
        return 'audio/mp3,audio/mpeg,audio/aac,audio/wav,audio/ogg,audio/m4a';
    };

    const resetForm = () => {
        setUploadForm({ title: '', caption: '', mediaType: 'PHOTO', isSermon: false, folderName: '' });
        setUploadFile(null);
        setUploadPreview(null);
        setShowUploadForm(false);
    };

    // ---- Submit ----
    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        if (!uploadFile) { showToast('Please select a file.', 'warning'); return; }
        setIsUploading(true);
        try {
            // 1. Upload to Cloudinary
            const formData = new FormData();
            formData.append('file', uploadFile);
            formData.append('mediaType', uploadForm.mediaType);
            const uploadRes = await uploadGalleryMedia(formData);
            if (!uploadRes.data.success) {
                showToast(uploadRes.data.message || 'Upload failed.', 'error');
                return;
            }
            const { mediaUrl, mediaType: resolvedType } = uploadRes.data;

            // 2. Save record
            const res = await createGalleryItem({
                title: uploadForm.title || 'Sanctuary Moment',
                caption: uploadForm.caption,
                mediaUrl,
                mediaType: resolvedType || uploadForm.mediaType,
                isSermon: (resolvedType === 'VIDEO' || resolvedType === 'AUDIO') && uploadForm.isSermon,
                folderName: uploadForm.folderName.trim() || null,
                branchId,
                uploadedBy: currentUserId,
                uploaderName: currentUserName || 'Media Team',
            });

            if (res.data.success) {
                showToast('Published to gallery!', 'success');
                resetForm();
                fetchData();
            } else {
                showToast(res.data.message || 'Failed to save.', 'error');
            }
        } catch (err) {
            showToast('Upload error: ' + (err.message || 'Unknown'), 'error');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            const res = await deleteGalleryItem(id);
            if (res.data.success) { showToast('Removed from gallery.', 'success'); fetchData(); }
            else showToast(res.data.message || 'Delete failed.', 'error');
        } catch { showToast('Delete error.', 'error'); }
    };

    // ---- Media card ----
    const MediaCard = ({ item }) => {
        const isPhoto = item.mediaType === 'PHOTO';
        const isVideo = item.mediaType === 'VIDEO';
        const isAudio = item.mediaType === 'AUDIO';

        return (
            <div className="relative group rounded-3xl overflow-hidden shadow-premium bg-mdSurface border border-mdOutline/5 break-inside-avoid">
                {/* Thumbnail */}
                {isPhoto && (
                    <div className="cursor-zoom-in" onClick={() => setLightboxSrc(item.mediaUrl)}>
                        <img src={item.mediaUrl} alt={item.title} className="w-full object-cover transition-transform duration-[2s] group-hover:scale-105" loading="lazy" />
                    </div>
                )}
                {isVideo && (
                    <div
                        className="relative h-48 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center cursor-pointer group/play"
                        onClick={() => setVideoModal(item)}
                    >
                        <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white text-2xl group-hover/play:scale-110 group-hover/play:bg-white/20 transition-all">
                            <FontAwesomeIcon icon={faPlay} />
                        </div>
                        {item.isSermon && (
                            <span className="absolute top-3 left-3 px-2 py-1 bg-mdPrimary text-white text-[9px] font-black uppercase tracking-widest rounded-full flex items-center gap-1">
                                <FontAwesomeIcon icon={faBookOpen} /> Sermon
                            </span>
                        )}
                    </div>
                )}
                {isAudio && (
                    <div className="p-5 bg-gradient-to-br from-indigo-900/40 to-purple-900/40">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xl">
                                <FontAwesomeIcon icon={faHeadphones} />
                            </div>
                            {item.isSermon && (
                                <span className="px-2 py-1 bg-mdPrimary text-white text-[9px] font-black uppercase tracking-widest rounded-full flex items-center gap-1">
                                    <FontAwesomeIcon icon={faBookOpen} /> Sermon
                                </span>
                            )}
                        </div>
                        <audio controls className="w-full h-8 rounded-xl" style={{ accentColor: 'var(--md-primary)' }}>
                            <source src={item.mediaUrl} />
                            Your browser does not support audio.
                        </audio>
                    </div>
                )}

                {/* Info overlay */}
                <div className={`${isPhoto ? 'absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-4' : 'p-4'}`}>
                    <p className={`font-black text-sm leading-tight mb-1 ${isPhoto ? 'text-white' : 'text-mdOnSurface'}`}>{item.title}</p>
                    {item.caption && <p className={`text-[10px] font-medium line-clamp-2 mb-2 ${isPhoto ? 'text-white/70' : 'text-mdOnSurfaceVariant'}`}>{item.caption}</p>}
                    <div className="flex items-center justify-between">
                        {item.folderName && (
                            <span className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${isPhoto ? 'text-white/50' : 'text-mdOutline'}`}>
                                <FontAwesomeIcon icon={faFolder} /> {item.folderName}
                            </span>
                        )}
                        <div className="flex items-center gap-2 ml-auto">
                            <a
                                href={item.mediaUrl}
                                download={item.title || 'media'}
                                target="_blank"
                                rel="noreferrer"
                                onClick={e => e.stopPropagation()}
                                className="w-7 h-7 rounded-xl bg-mdPrimary/80 text-white flex items-center justify-center hover:bg-mdPrimary transition-all"
                                title="Download Media"
                            >
                                <FontAwesomeIcon icon={faDownload} className="text-[10px]" />
                            </a>
                            {canUpload && (
                                <button
                                    onClick={e => { e.stopPropagation(); handleDelete(item.id); }}
                                    className="w-7 h-7 rounded-xl bg-red-500/80 text-white flex items-center justify-center hover:bg-red-500 transition-all"
                                >
                                    <FontAwesomeIcon icon={faTrash} className="text-[10px]" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-10 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-mdOnSurface tracking-tighter flex items-center gap-4">
                        Sanctuary Gallery
                        <span className="text-xs bg-mdPrimary/10 text-mdPrimary px-3 py-1 rounded-full font-black">{galleryItems.length} items</span>
                    </h1>
                    <p className="text-mdPrimary font-black text-xs uppercase tracking-widest mt-1">Photos · Videos · Sermons · Albums</p>
                </div>
                {canUpload && (
                    <button onClick={() => setShowUploadForm(!showUploadForm)} className="btn-premium">
                        <FontAwesomeIcon icon={showUploadForm ? faTimes : faPlus} />
                        {showUploadForm ? 'Cancel' : 'Add Media'}
                    </button>
                )}
            </div>

            {/* View Mode Pills */}
            <div className="flex p-1.5 bg-mdSurfaceVariant/20 rounded-[2rem] w-max border border-mdOutline/5 shadow-inner flex-wrap gap-1">
                {[
                    { id: 'all', label: 'All', icon: faImages },
                    { id: 'photos', label: 'Photos', icon: faCamera },
                    { id: 'sermons', label: 'Sermons', icon: faBookOpen },
                    { id: 'albums', label: 'Albums', icon: faFolder },
                ].map(m => (
                    <button
                        key={m.id}
                        onClick={() => { setViewMode(m.id); setActiveFolder(null); }}
                        className={`flex items-center gap-2 px-6 py-3 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest transition-all duration-500 ${
                            viewMode === m.id ? 'bg-mdPrimary text-white shadow-premium' : 'text-mdOnSurface hover:bg-mdSurfaceVariant/30'
                        }`}
                    >
                        <FontAwesomeIcon icon={m.icon} />
                        {m.label}
                    </button>
                ))}
            </div>

            {/* Active folder breadcrumb */}
            {activeFolder && (
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => { setActiveFolder(null); setViewMode('albums'); }}
                        className="flex items-center gap-2 text-mdPrimary font-black text-sm hover:underline"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} />
                        Albums
                    </button>
                    <FontAwesomeIcon icon={faChevronRight} className="text-mdOutline text-xs" />
                    <span className="flex items-center gap-2 text-mdOnSurface font-black text-sm">
                        <FontAwesomeIcon icon={faFolderOpen} className="text-amber-500" />
                        {activeFolder}
                    </span>
                </div>
            )}

            {/* Upload Form */}
            {canUpload && showUploadForm && (
                <div className="glass-card p-10 animate-slide-up border-l-8 border-l-mdPrimary">
                    <h3 className="text-2xl font-black text-mdOnSurface mb-6 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-mdPrimary text-white flex items-center justify-center">
                            <FontAwesomeIcon icon={faUpload} />
                        </div>
                        Publish Media
                    </h3>
                    <form onSubmit={handleUploadSubmit} className="space-y-6">
                        {/* Media type picker */}
                        <div className="flex p-1 bg-mdSurfaceVariant/30 rounded-2xl border border-mdOutline/10">
                            {[
                                { type: 'PHOTO', label: 'Photo', icon: faCamera },
                                { type: 'VIDEO', label: 'Video', icon: faFilm },
                                { type: 'AUDIO', label: 'Audio', icon: faHeadphones },
                            ].map(({ type, label, icon }) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => { setUploadForm({ ...uploadForm, mediaType: type, isSermon: false }); setUploadFile(null); setUploadPreview(null); }}
                                    className={`flex-1 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${uploadForm.mediaType === type ? 'bg-mdPrimary text-white shadow-lg' : 'text-mdOnSurface hover:bg-mdSurfaceVariant/20'}`}
                                >
                                    <FontAwesomeIcon icon={icon} />
                                    {label}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Title (e.g. Sunday Service, Pastor's Message)"
                                className="w-full p-4 bg-mdSurfaceVariant/20 border-none rounded-2xl font-bold focus:ring-2 focus:ring-mdPrimary outline-none"
                                value={uploadForm.title}
                                onChange={e => setUploadForm({ ...uploadForm, title: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Caption / Description (optional)"
                                className="w-full p-4 bg-mdSurfaceVariant/20 border-none rounded-2xl font-bold focus:ring-2 focus:ring-mdPrimary outline-none"
                                value={uploadForm.caption}
                                onChange={e => setUploadForm({ ...uploadForm, caption: e.target.value })}
                            />
                        </div>

                        {/* Album / folder input */}
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-mdOutline mb-2 block ml-1">
                                <FontAwesomeIcon icon={faFolder} className="mr-2 text-amber-500" />
                                Album / Folder (optional)
                            </label>
                            <input
                                type="text"
                                list="folder-suggestions"
                                placeholder="e.g. Easter 2025, Youth Camp, Weekly Service..."
                                className="w-full p-4 bg-mdSurfaceVariant/20 border-none rounded-2xl font-bold focus:ring-2 focus:ring-mdPrimary outline-none"
                                value={uploadForm.folderName}
                                onChange={e => setUploadForm({ ...uploadForm, folderName: e.target.value })}
                            />
                            <datalist id="folder-suggestions">
                                {folders.map(f => <option key={f} value={f} />)}
                            </datalist>
                        </div>

                        {/* Sermon classification (video/audio only) */}
                        {(uploadForm.mediaType === 'VIDEO' || uploadForm.mediaType === 'AUDIO') && (
                            <div className="flex items-center gap-3 p-4 bg-mdPrimary/5 rounded-2xl border border-mdPrimary/10">
                                <input
                                    type="checkbox"
                                    id="isSermon"
                                    className="w-5 h-5 rounded border-mdOutline accent-mdPrimary"
                                    checked={uploadForm.isSermon}
                                    onChange={e => setUploadForm({ ...uploadForm, isSermon: e.target.checked })}
                                />
                                <label htmlFor="isSermon" className="text-sm font-bold text-mdOnSurface select-none cursor-pointer flex items-center gap-2">
                                    <FontAwesomeIcon icon={faBookOpen} className="text-mdPrimary" />
                                    Classify as a Sermon (will appear in Sermons section)
                                </label>
                            </div>
                        )}

                        {/* File picker */}
                        {uploadPreview ? (
                            <div className="relative rounded-3xl overflow-hidden h-56 group">
                                <img src={uploadPreview} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button type="button" onClick={() => { setUploadFile(null); setUploadPreview(null); }} className="px-6 py-3 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest">
                                        <FontAwesomeIcon icon={faTimes} className="mr-2" />Remove
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-mdOutline/20 rounded-3xl cursor-pointer hover:border-mdPrimary hover:bg-mdPrimary/5 transition-all group">
                                <FontAwesomeIcon
                                    icon={uploadForm.mediaType === 'PHOTO' ? faCamera : uploadForm.mediaType === 'VIDEO' ? faVideo : faHeadphones}
                                    className="text-4xl text-mdOutline/30 group-hover:text-mdPrimary mb-4 transition-colors"
                                />
                                <p className="text-sm font-black text-mdOutline uppercase tracking-widest">
                                    {uploadFile ? uploadFile.name : `Select ${uploadForm.mediaType === 'PHOTO' ? 'Image' : uploadForm.mediaType === 'VIDEO' ? 'Video' : 'Audio'}`}
                                </p>
                                <p className="text-[10px] font-bold text-mdOutline/60 mt-1">
                                    {uploadForm.mediaType === 'PHOTO' ? 'JPG, PNG, WEBP — Max 20MB' : 'MP4, MOV / MP3, AAC, WAV — Max 500MB'}
                                </p>
                                <input type="file" accept={acceptForType()} className="hidden" onChange={handleFileSelect} />
                            </label>
                        )}

                        <button type="submit" disabled={isUploading || !uploadFile} className="btn-premium disabled:opacity-50">
                            {isUploading ? (
                                <><FontAwesomeIcon icon={faSpinner} className="animate-spin" /> Uploading...</>
                            ) : (
                                <><FontAwesomeIcon icon={faUpload} /> Publish to Gallery</>
                            )}
                        </button>
                    </form>
                </div>
            )}

            {/* Search (not in albums view) */}
            {viewMode !== 'albums' && !activeFolder && (
                <div className="relative max-w-sm">
                    <FontAwesomeIcon icon={faSearch} className="absolute left-5 top-1/2 -translate-y-1/2 text-mdOutline" />
                    <input
                        type="text"
                        placeholder="Search gallery..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-mdSurfaceVariant/20 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-mdPrimary transition-all"
                    />
                </div>
            )}

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <FontAwesomeIcon icon={faSpinner} className="text-4xl text-mdPrimary animate-spin" />
                </div>
            ) : viewMode === 'albums' && !activeFolder ? (
                /* Album grid */
                albumData.length === 0 ? (
                    <div className="glass-card p-16 text-center">
                        <FontAwesomeIcon icon={faFolder} className="text-5xl text-mdOutline/20 mb-6" />
                        <h3 className="text-2xl font-black text-mdOnSurface mb-3">No Albums Yet</h3>
                        <p className="text-mdOnSurfaceVariant font-medium">
                            {canUpload ? 'Create an album by entering a folder name when uploading.' : 'No albums have been created yet.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {albumData.map(album => (
                            <button
                                key={album.name}
                                onClick={() => { setActiveFolder(album.name); setViewMode('all'); }}
                                className="glass-card group p-0 overflow-hidden hover:border-mdPrimary/30 transition-all text-left"
                            >
                                <div className="relative h-44 bg-gradient-to-br from-slate-800 to-indigo-900 overflow-hidden">
                                    {album.thumb ? (
                                        <img src={album.thumb} alt={album.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s] opacity-80" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <FontAwesomeIcon icon={faFolderOpen} className="text-5xl text-white/20" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                                    <div className="absolute bottom-3 left-4 right-4">
                                        <p className="text-white font-black text-base leading-tight">{album.name}</p>
                                        <p className="text-white/50 text-[10px] font-black uppercase tracking-widest">{album.count} item{album.count !== 1 ? 's' : ''}</p>
                                    </div>
                                </div>
                                <div className="px-4 py-3 flex items-center justify-between">
                                    <span className="text-[10px] font-black text-mdOutline uppercase tracking-widest">View Album</span>
                                    <FontAwesomeIcon icon={faChevronRight} className="text-mdPrimary text-xs" />
                                </div>
                            </button>
                        ))}
                    </div>
                )
            ) : visibleItems.length === 0 ? (
                <div className="glass-card p-16 text-center">
                    <FontAwesomeIcon icon={viewMode === 'sermons' ? faBookOpen : faImages} className="text-5xl text-mdOutline/20 mb-6" />
                    <h3 className="text-2xl font-black text-mdOnSurface mb-3">
                        {viewMode === 'sermons' ? 'No Sermons Found' : 'Gallery is Empty'}
                    </h3>
                    <p className="text-mdOnSurfaceVariant font-medium">
                        {canUpload ? 'Click "Add Media" to publish your first item.' : 'Nothing published yet. Check back soon!'}
                    </p>
                </div>
            ) : (
                <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
                    {visibleItems.map(item => <MediaCard key={item.id} item={item} />)}
                </div>
            )}

            {/* Lightbox for photos */}
            {lightboxSrc && <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}

            {/* Video Modal */}
            {videoModal && (
                <div
                    className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[300] flex items-center justify-center p-4"
                    onClick={() => setVideoModal(null)}
                >
                    <div className="relative w-full max-w-4xl" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setVideoModal(null)}
                            className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all"
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                        <div className="glass-card p-2 rounded-3xl overflow-hidden">
                            <video controls autoPlay className="w-full rounded-2xl" style={{ maxHeight: '75vh' }}>
                                <source src={videoModal.mediaUrl} />
                                Your browser does not support video.
                            </video>
                        </div>
                        <div className="mt-4 text-center">
                            <p className="text-white font-black text-xl">{videoModal.title}</p>
                            {videoModal.caption && <p className="text-white/60 font-medium mt-1">{videoModal.caption}</p>}
                            {videoModal.isSermon && <span className="mt-2 inline-block px-3 py-1 bg-mdPrimary text-white text-[10px] font-black uppercase tracking-widest rounded-full">Sermon</span>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
