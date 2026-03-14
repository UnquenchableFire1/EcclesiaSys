
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';

export default function Home() {
  const userName = localStorage.getItem('userName');
  const userType = localStorage.getItem('userType');

  return (
    <div>
      <Hero
        title={<><span className="text-lemon">📣</span> Welcome to EcclesiaSys</>}
        subtitle="A digital church designed to make your church management simple."
        ctaText="Register Now"
        ctaLink="/register"
        bgImage="/hero-home.jpg"
      />

      {/* Navigation Cards Section */}
      <section className="bg-tealDeep py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Link to="/announcements" className="bg-tealDeep rounded-lg shadow-lg p-6 hover:shadow-xl transition border-t-4 border-lemon cursor-pointer">
              <div className="text-3xl mb-3">📢</div>
              <h3 className="text-xl font-bold text-lemon mb-2">Announcements</h3>
              <p className="text-white">Stay updated with important church announcements</p>
            </Link>

            <Link to="/events" className="bg-tealDeep rounded-lg shadow-lg p-6 hover:shadow-xl transition border-t-4 border-lemon cursor-pointer">
              <div className="text-3xl mb-3">📅</div>
              <h3 className="text-xl font-bold text-lemon mb-2">Events</h3>
              <p className="text-white">Discover upcoming events and activities</p>
            </Link>

            <Link to="/sermons" className="bg-tealDeep rounded-lg shadow-lg p-6 hover:shadow-xl transition border-t-4 border-lemon cursor-pointer">
              <div className="text-3xl mb-3">🎙️</div>
              <h3 className="text-xl font-bold text-lemon mb-2">Sermons</h3>
              <p className="text-white">Listen to our latest sermons and teachings</p>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 text-center">
        <h2 className="text-3xl font-bold text-tealDeep mb-6">
          Our Mission
        </h2>
        <p className="max-w-3xl mx-auto text-gray-700">
          We are committed to building lives, restoring hope, and spreading the love of Christ
          through impactful worship, community outreach, and spiritual growth.
        </p>
      </section>

      <section className="bg-yellow-50 py-16 text-center">
        <h2 className="text-3xl font-bold text-tealDeep mb-6">
          Vision
        </h2>
        <p className="max-w-3xl mx-auto text-gray-800">
          To be a beacon of hope where every heart is touched, every soul
          uplifted, and all are welcomed into the warm embrace of God’s
          enduring love.
        </p>
      </section>
    </div>
  );
}
