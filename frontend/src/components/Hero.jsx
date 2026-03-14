import React from 'react';
import { Link } from 'react-router-dom';

export default function Hero({ title, subtitle, ctaText, ctaLink, bgImage }) {
  const bgStyle = bgImage ? { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {};

  return (
    <header className="w-full relative">
      <div className="h-64 sm:h-80 md:h-96 flex items-center" style={bgStyle}>
        <div className="w-full bg-black bg-opacity-40 py-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight">
              {title}
            </h1>
            {subtitle && <p className="mt-4 text-lg sm:text-xl text-gray-200 max-w-3xl mx-auto">{subtitle}</p>}
            {ctaText && ctaLink && (
              <div className="mt-6">
                <Link to={ctaLink} className="inline-flex items-center bg-accent text-primary px-6 py-3 rounded-md font-semibold shadow-lg hover:opacity-95 transition">
                  {ctaText}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
import React from 'react';

export default function Hero({ title, subtitle, ctaText, ctaLink = '/', bgImage, small = false }) {
  const heightClass = small ? 'py-10' : 'py-24';
  const bgStyle = bgImage ? { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {};

  return (
    <section className={`text-white ${heightClass} relative`} style={bgStyle} aria-labelledby="hero-heading">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-900/75 to-primary/60" aria-hidden="true" />
      <div className="relative max-w-6xl mx-auto px-4 text-center">
        <h1 id="hero-heading" className={`text-4xl sm:text-5xl font-bold mb-4 ${small ? '' : 'text-5xl'}`}>
          {title}
        </h1>
        {subtitle && <p className="text-lg text-gray-100 mb-6 max-w-3xl mx-auto">{subtitle}</p>}
        {ctaText && (
          <a href={ctaLink} className="inline-flex items-center bg-accent text-primary px-6 py-3 rounded-lg font-semibold hover:opacity-95 transition">
            {ctaText}
          </a>
        )}
      </div>
    </section>
  );
}
