
import { Link } from 'react-router-dom';

export default function Home() {
  const userName = localStorage.getItem('userName');
  const userType = localStorage.getItem('userType');

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <section className="bg-mdPrimaryContainer text-mdOnPrimaryContainer py-24 text-center rounded-[2rem] shadow-sm relative overflow-hidden">
        {/* Soft decorative background element */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-mdPrimary opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-mdSecondary opacity-5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
        
        <div className="relative z-10 px-6 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight text-mdPrimary">
            Welcome to EcclesiaSys
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-mdOnPrimaryContainer/80 font-medium max-w-2xl mx-auto">
            A digital church designed to make your church management simple.
          </p>
          <a href="/register" className="bg-mdPrimary hover:bg-mdSecondary text-mdOnPrimary font-bold px-10 py-4 text-lg rounded-full shadow-md2 hover:shadow-md3 transition-all duration-300 inline-block transform hover:-translate-y-1">
            Register Now
          </a>
          {userType && userName && (
            <div className="mt-12 inline-block bg-mdSurface/50 backdrop-blur-sm px-6 py-3 rounded-full border border-mdPrimaryContainer">
              <p className="text-xl font-bold text-mdPrimary">
                Welcome back, {userName}!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Navigation Cards Section */}
      <section className="py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link to="/announcements" className="bg-mdSurface rounded-3xl shadow-sm p-8 hover:shadow-md3 hover:-translate-y-1 transition-all duration-300 border border-mdSurfaceVariant block group">
            <div className="text-4xl mb-6 bg-mdPrimaryContainer w-16 h-16 flex items-center justify-center rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-sm">📢</div>
            <h3 className="text-2xl font-bold text-mdPrimary mb-3">Announcements</h3>
            <p className="text-mdOnSurfaceVariant text-lg leading-relaxed">Stay updated with important church announcements and news.</p>
          </Link>

          <Link to="/events" className="bg-mdSurface rounded-3xl shadow-sm p-8 hover:shadow-md3 hover:-translate-y-1 transition-all duration-300 border border-mdSurfaceVariant block group">
            <div className="text-4xl mb-6 bg-mdSecondaryContainer w-16 h-16 flex items-center justify-center rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-sm">📅</div>
            <h3 className="text-2xl font-bold text-mdSecondary mb-3">Events</h3>
            <p className="text-mdOnSurfaceVariant text-lg leading-relaxed">Discover upcoming events, programs, and activities.</p>
          </Link>

          <Link to="/sermons" className="bg-mdSurface rounded-3xl shadow-sm p-8 hover:shadow-md3 hover:-translate-y-1 transition-all duration-300 border border-mdSurfaceVariant block group">
            <div className="text-4xl mb-6 bg-mdPrimaryContainer w-16 h-16 flex items-center justify-center rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-sm">🎙️</div>
            <h3 className="text-2xl font-bold text-mdPrimary mb-3">Sermons</h3>
            <p className="text-mdOnSurfaceVariant text-lg leading-relaxed">Listen to our latest sermons, teachings, and podcasts.</p>
          </Link>
        </div>
      </section>

      {/* Info Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-8">
        <section className="bg-mdSurface rounded-3xl shadow-sm border border-mdSurfaceVariant p-12 text-center hover:shadow-md2 transition-all duration-300 group">
          <div className="inline-block p-5 bg-mdSecondaryContainer rounded-3xl mb-6 text-mdSecondary group-hover:scale-110 transition-transform duration-300 shadow-sm">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <h2 className="text-3xl font-extrabold text-mdSecondary mb-4 tracking-tight">
            Our Mission
          </h2>
          <p className="text-lg text-mdOnSurfaceVariant leading-relaxed">
            We are committed to building lives, restoring hope, and spreading the love of Christ
            through impactful worship, community outreach, and spiritual growth.
          </p>
        </section>

        <section className="bg-mdPrimary text-mdOnPrimary rounded-3xl shadow-md2 p-12 text-center hover:shadow-md3 transition-all duration-300 relative overflow-hidden group">
          {/* Decorative elements */}
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
          
          <div className="relative z-10">
            <div className="inline-block p-5 bg-white/20 rounded-3xl mb-6 backdrop-blur-md shadow-sm group-hover:scale-110 transition-transform duration-300">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
            </div>
            <h2 className="text-3xl font-extrabold mb-4 tracking-tight">
              Vision
            </h2>
            <p className="text-lg text-mdPrimaryContainer font-medium leading-relaxed">
              To be a beacon of hope where every heart is touched, every soul
              uplifted, and all are welcomed into the warm embrace of God’s
              enduring love.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
