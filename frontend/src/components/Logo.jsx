import React from 'react';
import AssemblyLogo from './AssemblyLogo';

/**
 * Logo wrapper - redirects to the new premium AssemblyLogo identity.
 */
const Logo = ({ className = "", showText = true, variant = "primary", size = 42 }) => {
  return (
    <div className={className}>
      <AssemblyLogo 
        size={size} 
        showText={showText} 
        isDark={variant === "white"} 
      />
    </div>
  );
};

export default Logo;
