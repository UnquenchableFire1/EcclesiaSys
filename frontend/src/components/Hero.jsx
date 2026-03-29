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
      className={`text-white ${heightClass} relative overflow-hidden rounded-[3rem] ${backgroundImage ? '' : 'bg-mdPrimary'}`} 
      aria-labelledby="hero-heading"
      style={backgroundImage ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      } : {}}
    >
      {backgroundImage && <div className="image-overlay-dark" aria-hidden="true" />}
      {!backgroundImage && <div className="absolute inset-0 bg-black/10" aria-hidden="true" />}
      
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <h1 id="hero-heading" className={`text-5xl sm:text-7xl font-black mb-6 tracking-tighter leading-tight animate-slide-up`}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto font-medium leading-relaxed animate-slide-up [animation-delay:200ms]">
            {subtitle}
          </p>
        )}
        <div className="mt-4 animate-slide-up [animation-delay:400ms]">
          <Cta />
        </div>
      </div>
    </section>
  );
}
