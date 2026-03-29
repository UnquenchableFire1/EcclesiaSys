import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
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
        backgroundImage="/assets/images/church/church_1.jpg"
      />

      {/* Service Times & Location Section */}
      <section className="py-12 px-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Sunday Service */}
            <div className="img-card group h-[450px]">
              <img src="/assets/images/church/church_9.jpg" alt="Sunday Worship" />
              <div className="image-overlay group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute inset-0 z-10 p-10 flex flex-col justify-end text-white">
                <div className="text-3xl mb-6 bg-mdSecondary w-16 h-16 flex items-center justify-center rounded-2xl shadow-premium">
                  <FontAwesomeIcon icon={faClock} />
                </div>
                <h3 className="text-3xl font-black mb-2">Sunday Worship</h3>
                <p className="text-mdSecondary font-black text-xl mb-4">10:00 AM — 12:00 PM</p>
                <p className="text-white/80 leading-relaxed font-medium line-clamp-2">Join us for a dynamic experience of multi-cultural worship and a life-transforming message.</p>
              </div>
            </div>

            {/* Midweek Study */}
            <div className="img-card group h-[450px]">
              <img src="/assets/images/church/church_10.jpg" alt="Midweek Study" />
              <div className="image-overlay group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute inset-0 z-10 p-10 flex flex-col justify-end text-white">
                <div className="text-3xl mb-6 bg-mdPrimary w-16 h-16 flex items-center justify-center rounded-2xl shadow-premium">
                  <FontAwesomeIcon icon={faQuoteLeft} />
                </div>
                <h3 className="text-3xl font-black mb-2">Midweek Study</h3>
                <p className="text-mdSecondary font-black text-xl mb-4">Wednesdays @ 7:00 PM</p>
                <p className="text-white/80 leading-relaxed font-medium line-clamp-2">Deep dive into the Word of God in a relaxed environment. Grow in understanding and faith.</p>
              </div>
            </div>

            {/* Location */}
            <div className="img-card group h-[450px]">
              <img src="/assets/images/church/church_11.jpg" alt="Visit Us" />
              <div className="image-overlay-dark"></div>
              <div className="absolute inset-0 z-10 p-10 flex flex-col justify-end text-white">
                <div className="text-3xl mb-6 bg-white text-mdPrimary w-16 h-16 flex items-center justify-center rounded-2xl shadow-premium">
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                </div>
                <h3 className="text-3xl font-black mb-2">Visit Us</h3>
                <p className="text-mdSecondary font-black text-xl mb-4">UMaT SRID</p>
                <p className="text-white/80 leading-relaxed font-medium line-clamp-2">Essikado, Sekondi Takoradi.</p>
              </div>
            </div>
        </div>
      </section>

      {/* Navigation Cards Section */}
      <section className="py-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black text-mdOnSurface tracking-tight">Explore Our <span className="text-mdPrimary">Ministry</span></h2>
          <p className="text-xl text-mdOnSurfaceVariant font-medium mt-4">Discover ways to connect, grow, and serve.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link 
            to={userType ? (userType === 'admin' ? '/admin' : '/member-dashboard') : '/announcements'} 
            className="img-card group min-h-[500px]"
          >
            <img src="/assets/images/church/church_4.jpg" alt="Announcements" />
            <div className="image-overlay group-hover:bg-mdPrimary/60 transition-all duration-500"></div>
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
            className="img-card group min-h-[500px]"
          >
            <img src="/assets/images/church/church_5.jpg" alt="Events" />
            <div className="image-overlay group-hover:bg-mdSecondary/60 transition-all duration-500"></div>
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
            className="img-card group min-h-[500px]"
          >
            <img src="/assets/images/church/church_6.jpg" alt="Sermons" />
            <div className="image-overlay group-hover:bg-mdPrimary/60 transition-all duration-500"></div>
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

      {/* Mission & Vision Section */}
      <section className="py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="img-card h-[600px] rounded-[4rem]">
            <img src="/assets/images/church/church_2.jpg" alt="Our Mission" className="hover:scale-105" />
            <div className="image-overlay-dark opacity-40"></div>
            <div className="absolute top-10 left-10 z-10">
              <div className="bg-mdPrimary text-white px-8 py-3 rounded-full font-black uppercase tracking-widest text-sm shadow-premium">
                Since 1999
              </div>
            </div>
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
                { text: 'Impactful Worship', icon: faStar, img: 'church_13.jpg' },
                { text: 'Community Outreach', icon: faHeart, img: 'church_14.jpg' },
                { text: 'Spiritual Growth', icon: faPlusCircle, img: 'church_15.jpg' },
                { text: 'Dynamic Fellowship', icon: faUsers, img: 'church_12.jpg' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-3xl bg-mdSurfaceVariant/30 border border-mdOutline/5 hover:border-mdPrimary/20 transition-all group">
                   <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm">
                      <img src={`/assets/images/church/${item.img}`} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
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
                      <div key={i} className={`w-14 h-14 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center font-bold overflow-hidden shadow-lifted ${i === 4 ? 'bg-mdPrimary text-white' : ''}`}>
                         {i === 4 ? '+5K' : <img src={`/assets/images/church/church_${i+1}.jpg`} className="w-full h-full object-cover" />}
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
      <section className="relative h-[400px] rounded-[4rem] overflow-hidden flex items-center justify-center shadow-premium group">
        <img src="/assets/images/church/church_7.jpg" alt="Stats Background" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]" />
        <div className="image-overlay-dark opacity-80 backdrop-blur-sm"></div>
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
      <section className="bg-mdSurface rounded-[4rem] py-24 px-8 text-center border border-mdOutline/5 relative overflow-hidden shadow-premium">
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
