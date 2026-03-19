import React, { useState } from 'react';

const Logo = ({ className = "h-12 w-auto", showText = true, variant = "primary" }) => {
  const [imageError, setImageError] = useState(false);
  
  const textColor = variant === "white" ? "text-white" : "text-green-700 dark:text-emerald-400";
  const subTextColor = variant === "white" ? "text-white/70" : "text-green-600 dark:text-emerald-500";

  return (
    <div className={`flex items-center gap-3 transition-all duration-300 transform hover:scale-105 ${className}`}>
      {!imageError ? (
        <img 
          src="/logo.png" 
          alt="EcclesiaSys Logo" 
          className={`h-full w-auto object-contain ${
            variant === "white" 
              ? "brightness-0 invert" 
              : "mix-blend-multiply dark:mix-blend-normal dark:brightness-0 dark:invert dark:hue-rotate-[100deg] dark:saturate-150"
          }`}
          onError={() => setImageError(true)}
        />
      ) : (
        <div className={`${
          variant === "white" 
            ? "bg-white text-green-700" 
            : "bg-green-700 dark:bg-emerald-500 text-white"
        } rounded-xl h-10 w-10 flex items-center justify-center font-black text-xl shadow-md`}>
          E
        </div>
      )}
      
      {showText && (
        <div className="flex flex-col">
          <span className={`text-2xl font-black tracking-tighter ${textColor} leading-none`}>
            EcclesiaSys
          </span>
          <span className={`text-[0.6rem] font-bold tracking-[0.2em] ${subTextColor} uppercase opacity-80 ml-0.5`}>
            Church Management
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
