import React, { useState } from 'react';

const Logo = ({ className = "h-12 w-auto", showText = true, variant = "primary" }) => {
  const [imageError, setImageError] = useState(false);
  
  const textColor = variant === "white" ? "text-white" : "text-mdPrimary";
  const subTextColor = variant === "white" ? "text-white/70" : "text-mdSecondary";

  return (
    <div className={`flex items-center gap-3 transition-all duration-300 transform hover:scale-105 ${className}`}>
      {!imageError ? (
        <img 
          src="/logo.png" 
          alt="EcclesiaSys Logo" 
          className="h-full w-auto object-contain drop-shadow-md"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className={`${variant === "white" ? "bg-white text-mdPrimary" : "bg-mdPrimary text-white"} rounded-xl h-10 w-10 flex items-center justify-center font-black text-xl shadow-md border-2 border-white/20`}>
          E
        </div>
      )}
      
      {showText && (
        <div className="flex flex-col">
          <span className={`text-2xl font-black tracking-tighter ${textColor} leading-none`}>
            EcclesiaSys
          </span>
          <span className={`text-[0.6rem] font-bold tracking-[0.2em] ${subTextColor} uppercase opacity-70 ml-0.5`}>
            Church Management
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
