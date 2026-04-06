import React from 'react';

/**
 * AssemblyLogo - A premium, hand-crafted SVG identity for The Church of PENTECOST.
 * Features a sacred-digital geometric symbol with metallic gold and deep navy styles.
 */
export default function AssemblyLogo({
    size = 42,
    showText = true,
    isDark = false,
    className = ""
}) {
    const gold = '#D4AF37';
    const primary = isDark ? '#FFFFFF' : '#0F172A';

    return (
        <div className={`flex items-center gap-4 select-none group transition-all duration-500 ${className}`}>
            <div className="relative">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-mdSecondary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"></div>

                <svg
                    width={size}
                    height={size}
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="relative z-10 transition-transform duration-1000 group-hover:rotate-[360deg]"
                >
                    <defs>
                        <linearGradient id="assemblyGold" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#C5A059" />
                            <stop offset="50%" stopColor="#D4AF37" />
                            <stop offset="100%" stopColor="#F5D782" />
                        </linearGradient>

                        <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="2" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>

                    {/* Outer Sacred Ring */}
                    <circle
                        cx="50" cy="50" r="46"
                        stroke={gold}
                        strokeWidth="0.5"
                        strokeDasharray="4 8"
                        className="opacity-40 animate-spin-slow"
                        style={{ animationDuration: '20s' }}
                    />

                    {/* Inner Geometric Shield */}
                    <path
                        d="M50 10 L85 30 L85 70 L50 90 L15 70 L15 30 Z"
                        stroke={gold}
                        strokeWidth="1"
                        className="opacity-20"
                    />

                    {/* Sacred Geometric Dove - Symbol of Peace & Holy Spirit */}
                    <path
                        d="M50 32 
                           C65 32, 82 42, 82 58 
                           C82 72, 65 78, 50 88 
                           C35 78, 18 72, 18 58 
                           C18 42, 35 32, 50 32 Z"
                        fill="url(#assemblyGold)"
                        filter="url(#logoGlow)"
                        className="opacity-90"
                    />
                    
                    {/* Divinity Wings Detail */}
                    <path
                        d="M30 48 Q50 40 70 48"
                        stroke="white"
                        strokeWidth="0.5"
                        fill="none"
                        className="opacity-40"
                    />
                    
                    {/* Sacred Heart Point */}
                    <circle cx="50" cy="52" r="3" fill="white" className="opacity-60 blur-[1px]" />

                    {/* Focal Divinity Point */}
                    <circle cx="50" cy="48" r="10" fill="white" className="divinity-pulse opacity-10" />
                    <circle cx="50" cy="48" r="6" fill={gold} stroke="white" strokeWidth="2" />

                    {/* Digital Terminal Nodes */}
                    <circle cx="50" cy="22" r="3.5" fill="white" stroke={gold} strokeWidth="1.5" />
                    <circle cx="50" cy="78" r="3.5" fill="white" stroke={gold} strokeWidth="1.5" />
                    <circle cx="24" cy="48" r="3.5" fill="white" stroke={gold} strokeWidth="1.5" />
                    <circle cx="76" cy="48" r="3.5" fill="white" stroke={gold} strokeWidth="1.5" />

                    {/* Celestial Orbits */}
                    <circle cx="50" cy="48" r="30" stroke={gold} strokeWidth="0.25" className="opacity-20" />
                </svg>
            </div>

            {showText && (
                <div className="flex flex-col">
                    <span className={`text-2xl font-black tracking-tighter leading-none transition-colors duration-500 ${isDark ? 'text-white' : 'text-mdPrimary'} group-hover:text-mdSecondary`}>
                        The Church of <span className="text-mdSecondary group-hover:text-mdPrimary transition-colors duration-500">PENTECOST.</span>
                    </span>
                    <div className="flex items-center gap-2">
                        <div className="h-[1px] w-4 bg-mdSecondary/40 group-hover:w-8 transition-all duration-500"></div>
                        <span className={`text-[8px] font-black uppercase tracking-[0.4em] opacity-60 italic ${isDark ? 'text-white/60' : 'text-mdOnSurfaceVariant'}`}>
                            Ayikai Doblo District
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
