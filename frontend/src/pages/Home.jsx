import { Link } from 'react-router-dom';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBullhorn, faCalendarAlt, faMicrophone, faBolt, faEye, 
  faClock, faMapMarkerAlt, faEnvelope, faUsers, faCheckCircle,
  faStar, faQuoteLeft, faHeart, faPlusCircle
} from '@fortawesome/free-solid-svg-icons';
import PrayerRequestModal from '../components/PrayerRequestModal';

export default function Home() {
  const userName = sessionStorage.getItem('userName');
  const userType = sessionStorage.getItem('userType');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isPrayerModalOpen, setIsPrayerModalOpen] = useState(false);

  const handleNewsletterSignup = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail('');
      setTimeout(() => setSubmitted(false), 5000);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <section className="bg-mdPrimaryContainer text-mdOnPrimaryContainer py-24 text-center rounded-[2rem] shadow-sm relative overflow-hidden">
        {/* Soft decorative background element */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-mdPrimary opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-mdSecondary opacity-5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
        
        <div className="relative z-10 px-6 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tight text-mdPrimary leading-[1.1]">
            Experience Higher <br/>
            <span className="text-mdSecondary">Connection</span> with God
          </h1>
          <p className="text-xl md:text-2xl mb-12 text-mdOnPrimaryContainer/70 font-medium max-w-2xl mx-auto leading-relaxed">
            A modern digital home for your spiritual journey. Join a vibrant community of faith where growth has no limits.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            {!userType ? (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/register" className="w-full sm:w-auto bg-mdPrimary hover:bg-mdSecondary text-mdOnPrimary font-black px-12 py-5 text-xl rounded-full shadow-md2 hover:shadow-md3 transition-all duration-300 transform hover:-translate-y-1">
                  Start Your Journey
                </Link>
                <Link to="/login" className="w-full sm:w-auto bg-mdSurface/80 backdrop-blur-md border-2 border-mdPrimary/20 hover:border-mdPrimary text-mdPrimary font-black px-12 py-5 text-xl rounded-full transition-all duration-300">
                  Member Login
                </Link>
                <button 
                  onClick={() => setIsPrayerModalOpen(true)}
                  className="w-full sm:w-auto bg-mdSecondary hover:bg-mdPrimary text-white font-black px-12 py-5 text-xl rounded-full shadow-md2 hover:shadow-md3 transition-all duration-300 transform hover:-translate-y-1"
                >
                  Request Prayer
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to={userType === 'admin' ? '/admin' : '/member-dashboard'} className="w-full sm:w-auto bg-mdPrimary hover:bg-mdSecondary text-mdOnPrimary font-black px-12 py-5 text-xl rounded-full shadow-md2 hover:shadow-md3 transition-all duration-300 transform hover:-translate-y-1">
                  Go to Dashboard
                </Link>
                <button 
                  onClick={() => setIsPrayerModalOpen(true)}
                  className="w-full sm:w-auto bg-mdSecondary hover:bg-mdPrimary text-white font-black px-12 py-5 text-xl rounded-full shadow-md2 hover:shadow-md3 transition-all duration-300 transform hover:-translate-y-1"
                >
                  Request Prayer
                </button>
              </div>
            )}
          </div>

          {userType && userName && (
            <div className="inline-flex items-center gap-3 bg-white/40 backdrop-blur-md px-8 py-4 rounded-full border border-mdPrimary/10 shadow-sm animate-fade-in">
              <div className="w-10 h-10 rounded-full bg-mdPrimary text-mdOnPrimary flex items-center justify-center font-black">
                {userName.charAt(0)}
              </div>
              <p className="text-xl font-bold text-mdPrimary">
                Welcome back, {userName}!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Service Times & Location Section */}
      <section className="py-12 px-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sunday Service */}
            <div className="bg-mdSurface rounded-[2.5rem] p-10 border border-mdSurfaceVariant shadow-sm hover:shadow-md2 transition-all group overflow-hidden relative">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-mdSecondaryContainer/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="text-3xl mb-6 text-mdSecondary bg-mdSecondaryContainer w-16 h-16 flex items-center justify-center rounded-2xl shadow-sm">
                <FontAwesomeIcon icon={faClock} />
              </div>
              <h3 className="text-2xl font-black text-mdOnSurface mb-4">Sunday Worship</h3>
              <p className="text-mdPrimary font-black text-lg mb-2">10:00 AM — 12:00 PM</p>
              <p className="text-mdOnSurfaceVariant leading-relaxed font-medium">Join us for a dynamic experience of multi-cultural worship and a life-transforming message.</p>
            </div>

            {/* Midweek Study */}
            <div className="bg-mdSurface rounded-[2.5rem] p-10 border border-mdSurfaceVariant shadow-sm hover:shadow-md2 transition-all group overflow-hidden relative">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-mdPrimaryContainer/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="text-3xl mb-6 text-mdPrimary bg-mdPrimaryContainer w-16 h-16 flex items-center justify-center rounded-2xl shadow-sm">
                <FontAwesomeIcon icon={faQuoteLeft} />
              </div>
              <h3 className="text-2xl font-black text-mdOnSurface mb-4">Midweek Study</h3>
              <p className="text-mdPrimary font-black text-lg mb-2">Wednesdays @ 7:00 PM</p>
              <p className="text-mdOnSurfaceVariant leading-relaxed font-medium">Deep dive into the Word of God in a relaxed environment. Grow in understanding and faith.</p>
            </div>

            {/* Location */}
            <div className="bg-mdPrimary rounded-[2.5rem] p-10 shadow-md2 transition-all group overflow-hidden relative text-white">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="text-3xl mb-6 text-mdPrimary bg-white w-16 h-16 flex items-center justify-center rounded-2xl shadow-sm">
                <FontAwesomeIcon icon={faMapMarkerAlt} />
              </div>
              <h3 className="text-2xl font-black mb-4">Visit Us</h3>
              <p className="text-white/90 font-bold text-lg mb-2">UMaT SRID</p>
              <p className="text-white/80 leading-relaxed font-medium">Essikado, Sekondi Takoradi.</p>
            </div>
        </div>
      </section>

      {/* Navigation Cards Section */}
      <section className="py-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-mdOnSurface tracking-tight">Explore Our <span className="text-mdPrimary">Ministry</span></h2>
          <p className="text-xl text-mdOnSurfaceVariant font-medium mt-4">Discover ways to connect, grow, and serve.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link 
            to={userType ? (userType === 'admin' ? '/admin' : '/member-dashboard') : '/announcements'} 
            onClick={() => userType && localStorage.setItem(userType === 'admin' ? 'adminActiveTab' : 'memberActiveTab', 'announcements')}
            className="bg-mdSurface rounded-[3rem] shadow-sm p-12 hover:shadow-md3 hover:-translate-y-2 transition-all duration-500 border border-mdSurfaceVariant block group relative overflow-hidden"
          >
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-mdPrimaryContainer opacity-20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <div className="text-4xl mb-8 bg-mdPrimaryContainer w-20 h-20 flex items-center justify-center rounded-3xl group-hover:scale-110 transition-transform duration-500 shadow-sm text-mdPrimary">
                <FontAwesomeIcon icon={faBullhorn} />
            </div>
            <h3 className="text-2xl font-black text-mdPrimary mb-4">Announcements</h3>
            <p className="text-mdOnSurfaceVariant text-lg leading-relaxed font-medium mb-6">Stay updated with important church news, stories of faith, and community highlights.</p>
            <div className="text-mdPrimary font-bold flex items-center gap-2 group-hover:translate-x-2 transition-transform">
              {userType ? 'Go to Announcements' : 'See What\'s New'} <span className="text-xl">→</span>
            </div>
          </Link>

          <Link 
            to={userType ? (userType === 'admin' ? '/admin' : '/member-dashboard') : '/events'} 
            onClick={() => userType && localStorage.setItem(userType === 'admin' ? 'adminActiveTab' : 'memberActiveTab', 'events')}
            className="bg-mdSurface rounded-[3rem] shadow-sm p-12 hover:shadow-md3 hover:-translate-y-2 transition-all duration-500 border border-mdSurfaceVariant block group relative overflow-hidden"
          >
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-mdSecondaryContainer opacity-20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <div className="text-4xl mb-8 bg-mdSecondaryContainer w-20 h-20 flex items-center justify-center rounded-3xl group-hover:scale-110 transition-transform duration-500 shadow-sm text-mdSecondary">
                <FontAwesomeIcon icon={faCalendarAlt} />
            </div>
            <h3 className="text-2xl font-black text-mdSecondary mb-4">Events</h3>
            <p className="text-mdOnSurfaceVariant text-lg leading-relaxed font-medium mb-6">Discover upcoming gatherings, ministry programs, and special activities for all ages.</p>
            <div className="text-mdSecondary font-bold flex items-center gap-2 group-hover:translate-x-2 transition-transform">
              {userType ? 'Manage Events' : 'View Calendar'} <span className="text-xl">→</span>
            </div>
          </Link>

          <Link 
            to={userType ? (userType === 'admin' ? '/admin' : '/member-dashboard') : '/sermons'} 
            onClick={() => userType && localStorage.setItem(userType === 'admin' ? 'adminActiveTab' : 'memberActiveTab', 'sermons')}
            className="bg-mdSurface rounded-[3rem] shadow-sm p-12 hover:shadow-md3 hover:-translate-y-2 transition-all duration-500 border border-mdSurfaceVariant block group relative overflow-hidden"
          >
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-mdPrimaryContainer opacity-20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <div className="text-4xl mb-8 bg-mdPrimaryContainer w-20 h-20 flex items-center justify-center rounded-3xl group-hover:scale-110 transition-transform duration-500 shadow-sm text-mdPrimary">
                <FontAwesomeIcon icon={faMicrophone} />
            </div>
            <h3 className="text-2xl font-black text-mdPrimary mb-4">Sermons</h3>
            <p className="text-mdOnSurfaceVariant text-lg leading-relaxed font-medium mb-6">Listen to inspiring sermons and life-transforming teachings from our pastoral team.</p>
            <div className="text-mdPrimary font-bold flex items-center gap-2 group-hover:translate-x-2 transition-transform">
              {userType ? 'Latest Sermons' : 'Listen Online'} <span className="text-xl">→</span>
            </div>
          </Link>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="bg-mdSecondaryContainer/20 p-12 rounded-[3rem] border border-mdSecondary/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 text-mdSecondary opacity-10 text-8xl group-hover:scale-110 transition-transform duration-700">
              <FontAwesomeIcon icon={faHeart} />
            </div>
            <h2 className="text-4xl font-black text-mdSecondary mb-8 flex items-center gap-4">
              <FontAwesomeIcon icon={faBolt} className="text-accent" />
              Our Mission
            </h2>
            <p className="text-xl text-mdOnSurfaceVariant leading-relaxed mb-8 font-medium">
              We are committed to building lives, restoring hope, and spreading the love of Christ through authentic community.
            </p>
            <ul className="space-y-4">
              {[
                { text: 'Impactful Worship', icon: faStar },
                { text: 'Community Outreach', icon: faHeart },
                { text: 'Spiritual Growth', icon: faPlusCircle },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-lg font-bold text-mdOnSurface">
                  <div className="w-8 h-8 rounded-full bg-mdSecondary text-white flex items-center justify-center text-sm shadow-sm group-hover:rotate-12 transition-transform">
                    <FontAwesomeIcon icon={item.icon} />
                  </div>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-8">
            <h2 className="text-4xl font-black text-mdPrimary mb-8 flex items-center gap-4">
              <FontAwesomeIcon icon={faEye} className="text-secondary" />
              Our Vision
            </h2>
            <p className="text-2xl text-mdPrimary font-black leading-tight mb-8">
              "To be a beacon of hope where every heart is touched and every soul uplifted."
            </p>
            <p className="text-lg text-mdOnSurfaceVariant leading-relaxed font-medium">
              Our vision extends beyond our walls. We believe in the transformative power of faith and the endless possibilities when we put God first in our community.
            </p>
            <div className="mt-8 flex gap-6">
               <div className="flex -space-x-4">
                  {[1,2,3,4].map(i => (
                    <div key={i} className={`w-12 h-12 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center font-bold text-xs ${i === 4 ? 'bg-mdPrimary text-white' : ''}`}>
                       {i === 4 ? '+500' : <FontAwesomeIcon icon={faUsers} className="text-gray-400" />}
                    </div>
                  ))}
               </div>
               <p className="text-sm font-bold text-mdOnSurfaceVariant self-center">
                 Join <span className="text-mdPrimary">5,000+ members</span> <br/>making an impact
               </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-mdPrimary text-mdOnPrimary rounded-[3rem] py-20 px-4 shadow-md2 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center relative z-10">
          {[
            { label: 'Years Serving', value: '25+', icon: faStar },
            { label: 'Global Members', value: '5K+', icon: faUsers },
            { label: 'Annual Events', value: '50+', icon: faCalendarAlt },
            { label: 'Volunteers', value: '500+', icon: faHeart },
          ].map((stat, i) => (
            <div key={i} className="group">
              <div className="text-4xl mb-4 text-mdSecondary group-hover:scale-110 transition-transform">
                <FontAwesomeIcon icon={stat.icon} />
              </div>
              <div className="text-5xl font-black mb-2 tracking-tight">{stat.value}</div>
              <div className="text-mdOnPrimary/70 font-bold uppercase tracking-widest text-xs">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="bg-mdSecondaryContainer/30 rounded-[3rem] py-20 px-8 text-center border border-mdSecondary/5">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-mdSecondary text-white text-3xl mb-8 shadow-md">
            <FontAwesomeIcon icon={faEnvelope} />
          </div>
          <h2 className="text-4xl font-black text-mdOnSurface mb-4">Stay Inspired</h2>
          <p className="text-xl text-mdOnSurfaceVariant font-medium mb-10">
            Join our weekly newsletter for spiritual insights, upcoming events, and community updates delivered to your inbox.
          </p>
          
          {submitted ? (
            <div className="bg-emerald-50 text-emerald-700 p-6 rounded-[2rem] border border-emerald-100 flex items-center justify-center gap-3 animate-fade-in">
              <FontAwesomeIcon icon={faCheckCircle} className="text-2xl" />
              <p className="text-lg font-bold uppercase tracking-tight">Blessings! You're subscribed.</p>
            </div>
          ) : (
            <form onSubmit={handleNewsletterSignup} className="flex flex-col sm:flex-row gap-4 p-2 bg-white rounded-[2.5rem] shadow-sm border border-mdOutline/10 focus-within:ring-2 focus-within:ring-mdSecondary transition-all">
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 px-8 py-4 rounded-full text-mdOnSurface font-medium focus:outline-none bg-transparent"
              />
              <button
                type="submit"
                className="bg-mdSecondary hover:bg-mdPrimary text-white font-black px-10 py-4 rounded-full shadow-sm hover:shadow-md2 transition-all duration-300 transform active:scale-95"
              >
                Join Now
              </button>
            </form>
          )}
          <p className="mt-6 text-sm text-mdOutline font-medium uppercase tracking-widest">
            Privacy Guaranteed — No Spam
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-center">
        <h2 className="text-5xl font-black text-mdOnSurface mb-8 tracking-tight">
          Ready to find your <span className="text-mdPrimary">place?</span>
        </h2>
        <p className="text-xl text-mdOnSurfaceVariant font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
          Whether you're visiting for the first time or looking for a church home, we're here to welcome you with open arms.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
           {!userName && (
             <Link to="/register" className="w-full sm:w-auto bg-mdPrimary text-mdOnPrimary font-black px-12 py-5 text-xl rounded-full shadow-md hover:shadow-md3 transition-all">
               Join EcclesiaSys
             </Link>
           )}
           <Link to="/events" className="w-full sm:w-auto bg-white border-2 border-mdOutline/20 hover:border-mdPrimary text-mdOnSurface font-black px-12 py-5 text-xl rounded-full transition-all">
             Plan a Visit
           </Link>
        </div>
      </section>
      <PrayerRequestModal isOpen={isPrayerModalOpen} onClose={() => setIsPrayerModalOpen(false)} />
    </div>
  );
}
