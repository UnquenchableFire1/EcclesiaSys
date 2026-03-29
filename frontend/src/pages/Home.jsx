import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBullhorn, faCalendarAlt, faMicrophone, faBolt, faEye, 
  faClock, faMapMarkerAlt, faEnvelope, faUsers, faCheckCircle,
  faStar, faQuoteLeft, faHeart, faPlusCircle
} from '@fortawesome/free-solid-svg-icons';

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
      <Hero 
        title={<>Experience Higher <br/><span className="text-mdSecondary">Connection</span> with God</>}
        subtitle="A modern digital home for your spiritual journey. Join a vibrant community of faith where growth has no limits."
        ctaText="Start Your Journey"
        ctaLink="/register"
      />

      {/* Service Times & Location Section */}
      <section className="py-12 px-2 reveal">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Sunday Service */}
            <div className="glass-card group h-[450px] !bg-mdPrimary p-10 flex flex-col justify-end text-white overflow-hidden">
              <div className="sanctuary-grid !opacity-20"></div>
              <div className="text-3xl mb-6 bg-mdSecondary w-16 h-16 flex items-center justify-center rounded-2xl shadow-premium relative z-10 animate-float">
                <FontAwesomeIcon icon={faClock} />
              </div>
              <h3 className="text-3xl font-black mb-2 relative z-10 italic">Sunday Worship</h3>
              <p className="text-mdSecondary font-black text-xl mb-4 relative z-10">10:00 AM — 12:00 PM</p>
              <p className="text-white/80 leading-relaxed font-medium line-clamp-2 relative z-10">Join us for a dynamic experience of multi-cultural worship and a life-transforming message.</p>
            </div>

            {/* Midweek Study */}
            <div className="glass-card group h-[450px] !bg-mdSecondary p-10 flex flex-col justify-end text-mdPrimary overflow-hidden">
              <div className="sanctuary-grid !opacity-20 !bg-mdPrimary/10"></div>
              <div className="text-3xl mb-6 bg-mdPrimary text-white w-16 h-16 flex items-center justify-center rounded-2xl shadow-premium relative z-10 animate-float" style={{animationDelay: '500ms'}}>
                <FontAwesomeIcon icon={faQuoteLeft} />
              </div>
              <h3 className="text-3xl font-black mb-2 relative z-10 italic">Midweek Study</h3>
              <p className="text-mdPrimary font-black text-xl mb-4 relative z-10">Wednesdays @ 7:00 PM</p>
              <p className="text-mdPrimary/80 leading-relaxed font-medium line-clamp-2 relative z-10">Deep dive into the Word of God in a relaxed environment. Grow in understanding and faith.</p>
            </div>

            {/* Location */}
            <div className="glass-card group h-[450px] !bg-white p-10 flex flex-col justify-end text-mdOnSurface overflow-hidden border-mdPrimary/10">
              <div className="sanctuary-grid !opacity-10 !bg-mdPrimary"></div>
              <div className="text-3xl mb-6 bg-mdPrimary/10 text-mdPrimary w-16 h-16 flex items-center justify-center rounded-2xl shadow-premium relative z-10 animate-float" style={{animationDelay: '1000ms'}}>
                <FontAwesomeIcon icon={faMapMarkerAlt} />
              </div>
              <h3 className="text-3xl font-black mb-2 relative z-10 italic">Visit Us</h3>
              <p className="text-mdPrimary font-black text-xl mb-4 relative z-10">UMaT SRID</p>
              <p className="text-mdOnSurfaceVariant leading-relaxed font-medium line-clamp-2 relative z-10">Essikado, Sekondi Takoradi.</p>
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
            className="glass-card group min-h-[500px] p-12 flex flex-col justify-end text-mdOnSurface overflow-hidden"
          >
            <div className="absolute inset-0 bg-mdPrimary/5 group-hover:bg-mdPrimary/10 transition-all duration-500"></div>
            <div className="sanctuary-grid !opacity-5 group-hover:!opacity-10"></div>
            <div className="text-4xl mb-8 bg-mdPrimary/10 text-mdPrimary w-20 h-20 flex items-center justify-center rounded-3xl group-hover:scale-110 transition-transform duration-500 shadow-premium relative z-10">
                <FontAwesomeIcon icon={faBullhorn} />
            </div>
            <h3 className="text-3xl font-black mb-4 relative z-10 italic">Announcements</h3>
            <p className="text-mdOnSurfaceVariant text-lg leading-relaxed font-medium mb-8 line-clamp-2 relative z-10">Stay updated with important church news, stories of faith, and community highlights.</p>
            <div className="text-mdPrimary font-bold flex items-center gap-2 group-hover:translate-x-2 transition-transform relative z-10">
              Read More <span className="text-xl">→</span>
            </div>
          </Link>

          <Link 
            to={userType ? (userType === 'admin' ? '/admin' : '/member-dashboard') : '/events'} 
            className="glass-card group min-h-[500px] p-12 flex flex-col justify-end text-mdOnSurface overflow-hidden"
          >
            <div className="absolute inset-0 bg-mdSecondary/5 group-hover:bg-mdSecondary/10 transition-all duration-500"></div>
            <div className="sanctuary-grid !opacity-5 group-hover:!opacity-10 !bg-mdSecondary"></div>
            <div className="text-4xl mb-8 bg-mdSecondary/10 text-mdSecondary w-20 h-20 flex items-center justify-center rounded-3xl group-hover:scale-110 transition-transform duration-500 shadow-premium relative z-10">
                <FontAwesomeIcon icon={faCalendarAlt} />
            </div>
            <h3 className="text-3xl font-black mb-4 relative z-10 italic">Events</h3>
            <p className="text-mdOnSurfaceVariant text-lg leading-relaxed font-medium mb-8 line-clamp-2 relative z-10">Discover upcoming gatherings, ministry programs, and special activities for all ages.</p>
            <div className="text-mdSecondary font-bold flex items-center gap-2 group-hover:translate-x-2 transition-transform relative z-10">
              View Calendar <span className="text-xl">→</span>
            </div>
          </Link>

          <Link 
            to={userType ? (userType === 'admin' ? '/admin' : '/member-dashboard') : '/sermons'} 
            className="glass-card group min-h-[500px] p-12 flex flex-col justify-end text-mdOnSurface overflow-hidden"
          >
            <div className="absolute inset-0 bg-mdPrimary/5 group-hover:bg-mdPrimary/10 transition-all duration-500"></div>
            <div className="sanctuary-grid !opacity-5 group-hover:!opacity-10"></div>
            <div className="text-4xl mb-8 bg-mdPrimary/10 text-mdPrimary w-20 h-20 flex items-center justify-center rounded-3xl group-hover:scale-110 transition-transform duration-500 shadow-premium relative z-10">
                <FontAwesomeIcon icon={faMicrophone} />
            </div>
            <h3 className="text-3xl font-black mb-4 relative z-10 italic">Sermons</h3>
            <p className="text-mdOnSurfaceVariant text-lg leading-relaxed font-medium mb-8 line-clamp-2 relative z-10">Listen to inspiring sermons and life-transforming teachings from our pastoral team.</p>
            <div className="text-mdPrimary font-bold flex items-center gap-2 group-hover:translate-x-2 transition-transform relative z-10">
              Listen Online <span className="text-xl">→</span>
            </div>
          </Link>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-16 reveal">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="glass-card h-[600px] rounded-[4rem] flex flex-col items-center justify-center p-20 text-center overflow-hidden !bg-mdPrimary text-white">
            <div className="sanctuary-grid !opacity-10"></div>
            <div className="relative z-10 animate-float">
                <SanctuaryLogo size={120} showText={false} isDark={true} />
            </div>
            <div className="bg-mdSecondary text-mdOnSecondary px-8 py-3 rounded-full font-black uppercase tracking-widest text-sm shadow-premium mt-12 relative z-10">
                Since 1999
            </div>
            <h3 className="text-5xl font-black mt-10 relative z-10 italic">Faith Foundations</h3>
          </div>

          <div className="space-y-10">
            <div>
              <h2 className="text-5xl font-black text-mdSecondary mb-8 flex items-center gap-4">
                <FontAwesomeIcon icon={faHeart} className="text-mdPrimary" />
                Our Mission
              </h2>
              <p className="text-2xl text-mdOnSurfaceVariant leading-relaxed font-medium italic">
                "We are committed to building lives, restoring hope, and spreading the love of Christ through authentic community."
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { text: 'Impactful Worship', icon: faStar, color: 'mdPrimary' },
                { text: 'Community Outreach', icon: faHeart, color: 'mdSecondary' },
                { text: 'Spiritual Growth', icon: faPlusCircle, color: 'mdPrimary' },
                { text: 'Dynamic Fellowship', icon: faUsers, color: 'mdSecondary' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-3xl bg-white shadow-sm border border-mdOutline/5 hover:border-mdPrimary/20 transition-all group">
                   <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-sm bg-${item.color}/10 text-${item.color} group-hover:scale-110 transition-transform`}>
                      <FontAwesomeIcon icon={item.icon} />
                   </div>
                   <span className="font-black text-mdOnSurface">{item.text}</span>
                </div>
              ))}
            </div>

            <div className="pt-8 border-t border-mdOutline/10">
              <h2 className="text-4xl font-black text-mdPrimary mb-6 flex items-center gap-4">
                <FontAwesomeIcon icon={faEye} />
                Our Vision
              </h2>
              <p className="text-lg text-mdOnSurfaceVariant leading-relaxed font-medium">
                Our vision extends beyond our walls. We believe in the transformative power of faith and the endless possibilities when we put God first in our community.
              </p>
              <div className="mt-10 flex gap-6">
                 <div className="flex -space-x-4">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`w-14 h-14 rounded-full border-4 border-white flex items-center justify-center font-black shadow-lifted ${i === 4 ? 'bg-mdPrimary text-white' : 'bg-mdPrimary/10 text-mdPrimary'}`}>
                         {i === 4 ? '+5K' : i}
                      </div>
                    ))}
                 </div>
                 <p className="text-base font-bold text-mdOnSurfaceVariant self-center leading-tight">
                   Join <span className="text-mdPrimary">5,000+ members</span> <br/>making a global impact
                 </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section with Background Image */}
      <section className="relative h-[400px] rounded-[4rem] overflow-hidden flex items-center justify-center shadow-premium group reveal bg-mdPrimary">
        <div className="sanctuary-grid !opacity-10"></div>
        <div className="sanctuary-bg !static !h-full !w-full !bg-mdPrimary/20 opacity-50"></div>
        <div className="auth-panel-bg absolute inset-0 opacity-20"></div>
        <div className="absolute inset-0 bg-mdPrimary/40 backdrop-blur-[1px]"></div>
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
                 Join EcclesiaSys
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
