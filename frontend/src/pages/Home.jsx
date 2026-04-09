import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBullhorn, faCalendarAlt, faMicrophone, faBolt, faEye, 
  faClock, faMapMarkerAlt, faEnvelope, faUsers, faCheckCircle,
  faStar, faQuoteLeft, faHeart, faPlusCircle, faCross
} from '@fortawesome/free-solid-svg-icons';
import TenetsSlideshow from '../components/TenetsSlideshow';
import ExecutiveCouncil from '../components/ExecutiveCouncil';
import { getMeetingsForDate } from '../utils/scheduleUtils';

export default function Home() {
  const navigate = useNavigate();
  const userName = sessionStorage.getItem('userName');
  const userType = sessionStorage.getItem('userType');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleNewsletterSignup = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail('');
      setTimeout(() => setSubmitted(false), 5000);
    }
  };

  return (
    <div className="space-y-16 animate-fade-in pb-16">
      {/* Hero Section */}
      {/* 2026 Theme Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden rounded-[4rem] group reveal mx-4 mt-4">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-mdPrimary to-mdTertiary">
          <div className="absolute inset-0 bg-gradient-to-t from-mdPrimary via-mdPrimary/40 to-transparent"></div>
        </div>

        <div className="relative z-10 text-center px-6 max-w-6xl mx-auto space-y-10">
          <div className="inline-flex items-center gap-4 bg-mdSecondary/20 backdrop-blur-xl border border-mdSecondary/30 px-8 py-3 rounded-full text-mdSecondary font-black uppercase tracking-[0.5em] text-xs animate-float">
            Theme of the Year 2026
          </div>
          
          <h1 className="text-5xl md:text-8xl lg:text-9xl font-black text-white leading-[0.9] tracking-tighter italic drop-shadow-2xl">
            THE CHURCH <br/>
            <span className="text-mdSecondary not-italic font-black">UNLEASHED</span>
          </h1>

          <p className="text-xl md:text-3xl text-white/90 font-medium max-w-4xl mx-auto leading-relaxed drop-shadow-lg">
            "To Transform Society Through the Gospel and the Power of the Holy Spirit"
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10">
            <Link to="/register" className="btn-premium py-6 px-16 text-lg w-full sm:w-auto">
              Engage with the Vision
            </Link>
          </div>
        </div>

        {/* Floating Scripture */}
        <div className="absolute bottom-12 right-12 text-right hidden lg:block opacity-60">
          <p className="text-white font-black italic text-xl">"Go into all the world..."</p>
          <p className="text-mdSecondary font-bold text-xs uppercase tracking-widest mt-1">Mark 16:15</p>
        </div>
      </section>

      {/* Tenets Slideshow */}
      <div className="px-4 reveal">
        <TenetsSlideshow />
      </div>

      {/* Dynamic Meeting Schedule Section */}
      <section className="py-12 px-4 reveal">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8 text-center md:text-left">
           <div>
              <h2 className="text-4xl md:text-6xl font-black text-mdOnSurface tracking-tight">Happening <span className="text-mdPrimary">This Week</span></h2>
              <p className="text-xl text-mdOnSurfaceVariant font-medium mt-4">Stay synchronized with the assembly calendar.</p>
           </div>
           <div className="bg-mdPrimary text-white px-8 py-4 rounded-3xl font-black uppercase tracking-widest text-xs shadow-premium flex items-center gap-3">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-mdSecondary" />
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Logic: Generate next meaningful days */}
            {(() => {
              const scheduleItems = [];
              for (let i = 0; i < 7; i++) {
                const dayDate = new Date();
                dayDate.setDate(dayDate.getDate() + i);
                const meetings = getMeetingsForDate(dayDate);
                meetings.forEach(m => {
                  scheduleItems.push({ date: new Date(dayDate), ...m });
                });
              }
              return scheduleItems.slice(0, 3).map((item, idx) => (
                 <div key={idx} className="glass-card group p-10 border-l-8 border-l-mdSecondary transition-all duration-500">
                    <div className="flex justify-between items-start mb-8">
                       <p className="text-[10px] font-black uppercase tracking-[0.3em] text-mdPrimary">
                          {item.date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })}
                       </p>
                       <div className="text-mdSecondary text-xl group-hover:scale-110 transition-transform">
                          <FontAwesomeIcon icon={faClock} />
                       </div>
                    </div>
                    <h3 className="text-2xl font-black text-mdOnSurface mb-2">{item.name}</h3>
                    <p className="text-mdPrimary font-black text-lg mb-6">{item.time}</p>
                    <p className="text-mdOnSurfaceVariant font-medium text-sm border-t border-mdOutline/10 pt-6">
                       {item.description}
                    </p>
                 </div>
              ));
            })()}

            {/* Always show Location as a fallback/extra card if needed, or just standard card */}
            <div className="img-card group h-full min-h-[350px] bg-gradient-to-br from-mdPrimary to-mdTertiary">
              <div className="absolute inset-0 z-10 p-10 flex flex-col justify-end text-white">
                <div className="text-3xl mb-6 bg-white text-mdPrimary w-16 h-16 flex items-center justify-center rounded-2xl shadow-premium">
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                </div>
                <h4 className="text-2xl font-black mb-1">Our Location</h4>
                <p className="text-white/70 font-bold">Ayikai Doblo, Amasaman.</p>
              </div>
            </div>
        </div>
      </section>

      {/* Navigation Cards Section */}
      <section className="py-8 reveal">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black text-mdOnSurface tracking-tight">Explore Our <span className="text-mdPrimary">Ministry</span></h2>
          <p className="text-xl text-mdOnSurfaceVariant font-medium mt-4">Discover ways to connect, grow, and serve.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link 
            to={userType ? (userType === 'admin' ? '/admin' : '/member-dashboard') : '/announcements'} 
            className="img-card group min-h-[500px] bg-gradient-to-br from-mdPrimary to-mdTertiary"
          >
            <div className="absolute inset-0 z-10 p-12 flex flex-col justify-end text-white">
              <div className="text-4xl mb-8 bg-mdPrimary w-20 h-20 flex items-center justify-center rounded-3xl group-hover:scale-110 transition-transform duration-500 shadow-premium">
                  <FontAwesomeIcon icon={faBullhorn} />
              </div>
              <h3 className="text-3xl font-black mb-4">Announcements</h3>
              <p className="text-white/80 text-lg leading-relaxed font-medium mb-8 line-clamp-2">Stay updated with important church news, stories of faith, and community highlights.</p>
              <div className="text-mdSecondary font-bold flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                Read More <span className="text-xl">→</span>
              </div>
            </div>
          </Link>

          <Link 
            to={userType ? (userType === 'admin' ? '/admin' : '/member-dashboard') : '/events'} 
            className="img-card group min-h-[500px] bg-gradient-to-br from-mdSecondaryContainer to-mdSecondary"
          >
            <div className="absolute inset-0 z-10 p-12 flex flex-col justify-end text-white">
              <div className="text-4xl mb-8 bg-mdSecondary w-20 h-20 flex items-center justify-center rounded-3xl group-hover:scale-110 transition-transform duration-500 shadow-premium">
                  <FontAwesomeIcon icon={faCalendarAlt} />
              </div>
              <h3 className="text-3xl font-black mb-4">Events</h3>
              <p className="text-white/80 text-lg leading-relaxed font-medium mb-8 line-clamp-2">Discover upcoming gatherings, ministry programs, and special activities for all ages.</p>
              <div className="text-mdSecondary font-bold flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                View Calendar <span className="text-xl">→</span>
              </div>
            </div>
          </Link>

          <Link 
            to={userType ? (userType === 'admin' ? '/admin' : '/member-dashboard') : '/sermons'} 
            className="img-card group min-h-[500px] bg-gradient-to-br from-mdPrimary to-mdTertiary"
          >
            <div className="absolute inset-0 z-10 p-12 flex flex-col justify-end text-white">
              <div className="text-4xl mb-8 bg-mdPrimary w-20 h-20 flex items-center justify-center rounded-3xl group-hover:scale-110 transition-transform duration-500 shadow-premium">
                  <FontAwesomeIcon icon={faMicrophone} />
              </div>
              <h3 className="text-3xl font-black mb-4">Sermons</h3>
              <p className="text-white/80 text-lg leading-relaxed font-medium mb-8 line-clamp-2">Listen to inspiring sermons and life-transforming teachings from our pastoral team.</p>
              <div className="text-mdSecondary font-bold flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                Listen Online <span className="text-xl">→</span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Executive Council Section */}
      <div className="reveal">
        <ExecutiveCouncil />
      </div>

      {/* Stats Section with Background Image */}
      <section className="relative h-[400px] rounded-[4rem] overflow-hidden flex items-center justify-center shadow-premium group reveal bg-gradient-to-br from-mdPrimary to-mdTertiary">
        <div className="relative z-10 w-full max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center text-white">
          {[
            { label: 'Years Serving', value: '25+', icon: faStar },
            { label: 'Global Members', value: '5K+', icon: faUsers },
            { label: 'Annual Events', value: '50+', icon: faCalendarAlt },
            { label: 'Volunteers', value: '500+', icon: faHeart },
          ].map((stat, i) => (
            <div key={i} className="group/stat">
              <div className="text-4xl mb-6 text-mdSecondary group-hover/stat:scale-110 transition-transform">
                <FontAwesomeIcon icon={stat.icon} />
              </div>
              <div className="text-5xl font-black mb-2 tracking-tighter">{stat.value}</div>
              <div className="text-white/60 font-black uppercase tracking-[0.2em] text-[10px]">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter Signup with Dynamic Design */}
      <section className="bg-mdSurface rounded-[4rem] py-24 px-8 text-center border border-mdOutline/5 relative overflow-hidden shadow-premium reveal">
        <div className="absolute top-0 right-0 w-96 h-96 bg-mdSecondaryContainer/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-mdSecondary text-white text-4xl mb-10 shadow-premium animate-float">
            <FontAwesomeIcon icon={faEnvelope} />
          </div>
          <h2 className="text-5xl font-black text-mdOnSurface mb-6 tracking-tight">Stay Inspired</h2>
          <p className="text-2xl text-mdOnSurfaceVariant font-medium mb-12 leading-relaxed">
            Join our weekly newsletter for spiritual insights, upcoming events, and community updates delivered to your inbox.
          </p>
          
          {submitted ? (
            <div className="bg-mdPrimary/5 text-mdPrimary p-8 rounded-[3rem] border border-mdPrimary/10 flex items-center justify-center gap-4 animate-fade-in shadow-inner">
              <FontAwesomeIcon icon={faCheckCircle} className="text-3xl" />
              <p className="text-xl font-black uppercase tracking-tight">Blessings! You're subscribed.</p>
            </div>
          ) : (
            <form onSubmit={handleNewsletterSignup} className="flex flex-col sm:flex-row gap-4 p-3 bg-mdSurfaceVariant/30 rounded-full shadow-inner border border-mdOutline/10 focus-within:ring-4 focus-within:ring-mdSecondary/20 transition-all max-w-2xl mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 px-10 py-5 rounded-full text-mdOnSurface font-bold focus:outline-none bg-transparent text-lg"
              />
              <button
                type="submit"
                className="bg-mdPrimary hover:bg-mdSecondary text-white font-black px-12 py-5 rounded-full shadow-premium hover:-translate-y-1 transition-all duration-300 transform active:scale-95 text-lg"
              >
                Join Now
              </button>
            </form>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 text-center">
        <div className="max-w-5xl mx-auto space-y-12">
          <h2 className="text-6xl md:text-8xl font-black text-mdOnSurface mb-8 tracking-tighter leading-none italic">
            Ready to find your <span className="text-mdPrimary not-italic">place?</span>
          </h2>
          <p className="text-2xl text-mdOnSurfaceVariant font-medium max-w-3xl mx-auto leading-relaxed">
            Whether you're visiting for the first time or looking for a church home, we're here to welcome you with open arms.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-8">
             {!userName && (
               <Link to="/register" className="w-full sm:w-auto bg-mdPrimary text-white font-black px-14 py-6 text-2xl rounded-full shadow-premium hover:-translate-y-2 transition-all">
                 Join COP Ayikai Doblo
               </Link>
             )}
             <Link to="/events" className="w-full sm:w-auto bg-white border-4 border-mdOutline/10 hover:border-mdSecondary text-mdOnSurface font-black px-14 py-6 text-2xl rounded-full shadow-md transition-all">
               Plan a Visit
             </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
