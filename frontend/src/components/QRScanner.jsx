import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faQrcode, faCamera } from '@fortawesome/free-solid-svg-icons';

export default function QRScanner({ onScanSuccess, onScanError, onClose }) {
    const [scannerActive, setScannerActive] = useState(false);

    useEffect(() => {
        const scanner = new Html5QrcodeScanner("reader", { 
            fps: 10, 
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
        });

        scanner.render(
            (decodedText) => {
                scanner.clear();
                onScanSuccess(decodedText);
            },
            (error) => {
                if (onScanError) onScanError(error);
            }
        );

        setScannerActive(true);

        return () => {
            scanner.clear().catch(err => console.error("Failed to clear scanner", err));
        };
    }, []);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="bg-white rounded-[3rem] shadow-premium w-full max-w-lg overflow-hidden relative">
                <div className="p-8 border-b border-mdOutline/5 flex items-center justify-between bg-mdPrimary/5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-mdPrimary text-white flex items-center justify-center text-xl shadow-md">
                            <FontAwesomeIcon icon={faQrcode} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-mdOnSurface leading-none">ID Scanner</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-mdOnSurfaceVariant mt-1">Verification Engine</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-white hover:bg-mdError/10 hover:text-mdError transition-all flex items-center justify-center shadow-sm"
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                <div className="p-8">
                    <div id="reader" className="overflow-hidden rounded-3xl border-2 border-dashed border-mdOutline/20 bg-mdSurfaceVariant/10"></div>
                    
                    <div className="mt-8 flex items-center gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-200/50">
                        <FontAwesomeIcon icon={faCamera} className="text-amber-500" />
                        <p className="text-xs font-bold text-amber-800 leading-relaxed">
                            Point your camera at the member's digital or printed ID card QR code to process verification.
                        </p>
                    </div>
                </div>

                <div className="px-8 pb-8 flex flex-col items-center">
                    <div className="text-[10px] font-black uppercase tracking-[0.4em] text-mdOnSurfaceVariant/40">
                        Powered by EcclesiaSys Secure Scan
                    </div>
                </div>
            </div>
        </div>
    );
}
