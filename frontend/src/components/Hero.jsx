import React from 'react';
import { Link } from 'react-router-dom';

export default function Hero({ title, subtitle, ctaText, ctaLink = '/', small = false }) {
  const heightClass = small ? 'py-10' : 'py-24';

  const Cta = () => {
    if (!ctaText) return null;
    if (String(ctaLink).startsWith('/')) {
      return (
        <Link to={ctaLink} className="inline-flex items-center bg-accent text-primary px-6 py-3 rounded-lg font-semibold hover:opacity-95 transition">
          {ctaText}
        </Link>
      );
    }
    return (
      <a href={ctaLink} className="inline-flex items-center bg-accent text-primary px-6 py-3 rounded-lg font-semibold hover:opacity-95 transition" target="_blank" rel="noopener noreferrer">
        {ctaText}
      </a>
    );
  };

  return (
    <section className={`text-white ${heightClass} relative bg-mdPrimaryContainer`} aria-labelledby="hero-heading">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-900/40 to-primary/30" aria-hidden="true" />
      <div className="relative max-w-6xl mx-auto px-4 text-center">
        <h1 id="hero-heading" className={`text-4xl sm:text-5xl font-bold mb-4 ${small ? '' : 'text-5xl'}`}>
          {title}
        </h1>
        {subtitle && <p className="text-lg text-gray-100 mb-6 max-w-3xl mx-auto">{subtitle}</p>}
        <div className="mt-4">
          <Cta />
        </div>
      </div>
    </section>
  );
}
