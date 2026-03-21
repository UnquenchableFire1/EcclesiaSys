import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../utils/cropUtils';
import { useToast } from '../context/ToastContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faSync } from '@fortawesome/free-solid-svg-icons';

const ImageCropperModal = ({ image, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { showToast } = useToast();

  const onCropChange = (crop) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom) => {
    setZoom(zoom);
  };

  const onCropCompleteInternal = useCallback((_croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirm = async () => {
    try {
      setIsProcessing(true);
      const croppedFile = await getCroppedImg(image, croppedAreaPixels);
      onCropComplete(croppedFile);
    } catch (e) {
      console.error(e);
      showToast("Failed to crop image. Please try another selection.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-mdSurface w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-premium flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-10 py-8 border-b border-mdOutline/10 flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-black text-mdOnSurface tracking-tight">Refine Your Portrait</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-mdPrimary opacity-70 mt-1">
              Adjust placement and zoom
            </p>
          </div>
          <button 
            onClick={onCancel}
            className="w-12 h-12 rounded-2xl bg-mdSurfaceVariant/20 text-mdOnSurfaceVariant hover:bg-mdError/10 hover:text-mdError transition-all flex items-center justify-center"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Cropper Container */}
        <div className="relative flex-1 min-h-[400px] bg-mdSurfaceVariant/5">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={onCropChange}
            onCropComplete={onCropCompleteInternal}
            onZoomChange={onZoomChange}
            cropShape="round"
            showGrid={true}
          />
        </div>

        {/* Controls */}
        <div className="p-10 space-y-8 bg-mdSurface">
          <div className="space-y-4">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-mdOutline px-2">
              <span>Zoom Level</span>
              <span>{Math.round(zoom * 100)}%</span>
            </div>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-2 bg-mdSurfaceVariant/30 rounded-full appearance-none cursor-pointer accent-mdPrimary"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={onCancel}
              className="flex-1 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-mdOnSurfaceVariant bg-mdSurfaceVariant/20 hover:bg-mdSurfaceVariant/40 transition-all shadow-sm"
            >
              Discard Changes
            </button>
            <button
              onClick={handleConfirm}
              disabled={isProcessing}
              className="flex-3 py-5 px-10 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-white bg-mdPrimary hover:shadow-premium-hover hover:scale-[1.02] transform transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <FontAwesomeIcon icon={faSync} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheck} />
                  Confirm Selection
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropperModal;
