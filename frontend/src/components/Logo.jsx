import React from 'react';
import SanctuaryLogo from './SanctuaryLogo';

/**
 * Legacy Logo wrapper - redirects to the new premium SanctuaryLogo identity.
 */
const Logo = ({ className = "", showText = true, variant = "primary", size = 42 }) => {
  return (
    <div className={className}>
      <SanctuaryLogo 
        size={size} 
        showText={showText} 
        isDark={variant === "white"} 
      />
    </div>
  );
};

export default Logo;
