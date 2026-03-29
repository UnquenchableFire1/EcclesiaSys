import React from 'react';
import { Link } from 'react-router-dom';

export default function Hero({ title, subtitle, ctaText, ctaLink = '/', small = false, backgroundImage }) {
  const heightClass = small ? 'py-16' : 'py-32';

  const Cta = () => {
    if (!ctaText) return null;
    if (String(ctaLink).startsWith('/')) {
      return (
        <Link to={ctaLink} className="inline-flex items-center bg-mdSecondary text-mdOnSecondary px-8 py-4 rounded-full font-black hover:bg-mdPrimary hover:text-white transition-all shadow-md2 hover:shadow-premium">
          {ctaText}
        </Link>
      );
    }
    return (
      <a href={ctaLink} className="inline-flex items-center bg-mdSecondary text-mdOnSecondary px-8 py-4 rounded-full font-black hover:bg-mdPrimary hover:text-white transition-all shadow-md2 hover:shadow-premium">
        {ctaText}
      </a>
    );
  };

  return (
    <section 
      className={`relative overflow-hidden rounded-[3rem] md:rounded-[4rem] shadow-premium group ${small ? 'h-[300px] md:h-[400px]' : 'h-[500px] md:h-[700px]'} bg-mdSurface`} 
      aria-labelledby="hero-heading"
    >
      {backgroundImage ? (
        <>
          <img 
            src={backgroundImage} 
            alt="" 
            className="absolute inset-0 w-full h-full object-cover animate-ken-burns" 
          />
          <div className="image-overlay-dark opacity-80 backdrop-blur-[1px]" aria-hidden="true" />
        </>
      ) : (
        <>
          <div className="sanctuary-bg !static !h-full !w-full"></div>
          <div className="sanctuary-grid !static !inset-0"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-mdPrimary/5 to-mdPrimary/20" aria-hidden="true" />
        </>
      )}
      
      <div className="relative z-10 h-full flex flex-col justify-center px-10 md:px-20 max-w-6xl mx-auto text-white">
        <h1 
          id="hero-heading" 
          className="text-5xl md:text-8xl font-black mb-8 leading-[0.85] tracking-tighter italic animate-slide-up"
        >
          {title}
        </h1>
        {subtitle && (
          <p 
            className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl font-medium leading-relaxed italic animate-slide-up"
            style={{ animationDelay: '200ms', animationFillMode: 'both' }}
          >
            {subtitle}
          </p>
        )}
        <div 
          className="mt-4 animate-slide-up"
          style={{ animationDelay: '400ms', animationFillMode: 'both' }}
        >
          <Cta />
        </div>
      </div>
    </section>
  );
}
