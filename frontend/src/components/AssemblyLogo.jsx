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
    const gold = '#C9AF1E';
    const primary = isDark ? '#FFFFFF' : '#1A2F5F';

    return (
        <div className={`flex items-center gap-4 select-none group transition-all duration-500 ${className}`}>
            <div className="relative">
                <img
                    src="/logo.png"
                    alt="COP Logo"
                    style={{ width: size, height: size }}
                    className="relative z-10 transition-transform duration-1000 group-hover:scale-110 object-contain"
                />
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
