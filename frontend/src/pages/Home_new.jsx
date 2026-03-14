import { Link } from 'react-router-dom';
import { useState } from 'react';
import Hero from '../components/Hero';

export default function Home() {
  const userName = localStorage.getItem('userName');
  const userType = localStorage.getItem('userType');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleNewsletterSignup = async (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail('');
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  return (
    <div>
      <Hero
        title={<><span className="text-lemon">📣</span> Welcome to EcclesiaSys</>}
        subtitle="A modern church management system designed for spiritual growth and community connection."
        ctaText={userType && userName ? 'Dashboard' : 'Join Us Today'}
        ctaLink={userType && userName ? '/announcements' : '/register'}
        bgImage="/hero-home.jpg"
      />

      {/* Service Times Section */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
          <h2 className="text-4xl font-bold text-center text-tealDeep mb-12">
            Service Times & Location
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Sunday Service */}
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-8 border-l-4 border-lemon shadow-md">
              <h3 className="text-2xl font-bold text-tealDeep mb-2">Sunday Service</h3>
              <p className="text-gray-700 mb-4">
                <span className="font-semibold">Time:</span> 10:00 AM - 12:00 PM
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Worship & Teaching:</span> Experience dynamic worship and powerful teaching that will transform your spiritual journey.
              </p>
            </div>

            {/* Midweek Service */}
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-8 border-l-4 border-lemon shadow-md">
              <h3 className="text-2xl font-bold text-tealDeep mb-2">Midweek Service</h3>
              <p className="text-gray-700 mb-4">
                <span className="font-semibold">Time:</span> 7:00 PM - 8:30 PM (Wednesday)
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Bible Study:</span> Dive deeper into scripture and grow together as a community of believers.
              </p>
            </div>

            {/* Location */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-8 border-l-4 border-lemon shadow-md">
              <h3 className="text-2xl font-bold text-tealDeep mb-2">📍 Location</h3>
              <p className="text-gray-700 mb-2">
                <span className="font-semibold">Address:</span>
              </p>
              <p className="text-gray-700">
                123 Faith Avenue<br />
                Your City, State 12345<br />
                <span className="text-sm text-gray-600">(Parking Available)</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Cards Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
          <h2 className="text-4xl font-bold text-center text-tealDeep mb-12">
            Explore Our Ministry
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link to="/announcements" className="group bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden border-t-4 border-lemon cursor-pointer hover:-translate-y-1">
              <div className="bg-gradient-to-r from-lemon to-yellow-300 py-8 text-center text-4xl">📢</div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-tealDeep mb-3">Announcements</h3>
                <p className="text-gray-600 mb-4">Stay connected with important church news, updates, and community highlights.</p>
                <span className="text-lemon font-semibold group-hover:translate-x-2 transition inline-block">Learn More →</span>
              </div>
            </Link>

            <Link to="/events" className="group bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden border-t-4 border-lemon cursor-pointer hover:-translate-y-1">
              <div className="bg-gradient-to-r from-lemon to-yellow-300 py-8 text-center text-4xl">📅</div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-tealDeep mb-3">Events</h3>
                <p className="text-gray-600 mb-4">Discover upcoming ministry events, gatherings, and special programs for all ages.</p>
                <span className="text-lemon font-semibold group-hover:translate-x-2 transition inline-block">View Calendar →</span>
              </div>
            </Link>

            <Link to="/sermons" className="group bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden border-t-4 border-lemon cursor-pointer hover:-translate-y-1">
              <div className="bg-gradient-to-r from-lemon to-yellow-300 py-8 text-center text-4xl">🎙️</div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-tealDeep mb-3">Sermons</h3>
                <p className="text-gray-600 mb-4">Listen to inspiring sermons, messages, and teachings from our pastoral team.</p>
                <span className="text-lemon font-semibold group-hover:translate-x-2 transition inline-block">Listen Now →</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section - Two Column */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Mission */}
            <div>
              <h2 className="text-4xl font-bold text-tealDeep mb-6 flex items-center">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-lemon text-tealDeep font-bold mr-4">💫</span>
                Our Mission
              </h2>
              <div className="space-y-4">
                <p className="text-lg text-gray-700">
                  We are committed to building lives, restoring hope, and spreading the love of Christ through:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-lemon font-bold mr-3 text-xl">✓</span>
                    <span className="text-gray-700"><strong>Impactful Worship</strong> - Dynamic services that honor God</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-lemon font-bold mr-3 text-xl">✓</span>
                    <span className="text-gray-700"><strong>Community Outreach</strong> - Serving our neighbors with love</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-lemon font-bold mr-3 text-xl">✓</span>
                    <span className="text-gray-700"><strong>Spiritual Growth</strong> - Discipleship for all ages</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Vision */}
            <div>
              <h2 className="text-4xl font-bold text-tealDeep mb-6 flex items-center">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-lemon text-tealDeep font-bold mr-4">🌟</span>
                Our Vision
              </h2>
              <div className="space-y-4">
                <p className="text-xl text-gray-700 font-semibold text-lemon mb-4">
                  To be a beacon of hope where every heart is touched, every soul uplifted, and all are welcomed into the warm embrace of God's enduring love.
                </p>
                <p className="text-gray-700">
                  Our vision extends beyond our walls to impact our community and the world. We believe in the transformative power of faith, the strength of community, and the endless possibilities when we put God first.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup Section */}
      <section className="bg-gradient-to-r from-tealDeep to-teal-900 text-white py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 md:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Stay Connected</h2>
          <p className="text-lg text-gray-100 mb-8">
            Subscribe to our newsletter and never miss important updates, events, and spiritual insights.
          </p>
          <form onSubmit={handleNewsletterSignup} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-6 py-3 rounded-lg text-tealDeep focus:outline-none focus:ring-2 focus:ring-lemon"
              required
            />
            <button
              type="submit"
              className="bg-lemon hover:bg-yellow-300 text-tealDeep font-bold px-8 py-3 rounded-lg transition shadow-lg"
            >
              Subscribe
            </button>
          </form>
          {submitted && (
            <p className="text-lemon mt-4 font-semibold animate-pulse">
              ✓ Thank you for subscribing! Check your email for updates.
            </p>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-lemon mb-2">25+</div>
              <p className="text-gray-700 font-semibold">Years Serving</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-lemon mb-2">5K+</div>
              <p className="text-gray-700 font-semibold">Community Members</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-lemon mb-2">50+</div>
              <p className="text-gray-700 font-semibold">Annual Events</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-lemon mb-2">500+</div>
              <p className="text-gray-700 font-semibold">Volunteers</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-lemon py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 text-center">
          <h2 className="text-4xl font-bold text-tealDeep mb-6">
            Ready to Join Our Community?
          </h2>
          <p className="text-lg text-gray-800 mb-8">
            Take the first step in your spiritual journey. Whether you're new to faith or a longtime believer, there's a place for you here.
          </p>
          {!userType && (
            <Link to="/register" className="bg-tealDeep hover:bg-teal-800 text-white font-bold px-10 py-4 rounded-lg transition shadow-lg inline-block">
              Get Started Now
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
