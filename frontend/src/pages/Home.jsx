
export default function Home() {
  return (
    <div>
      <section className="bg-primary text-white py-24 text-center">
        <h1 className="text-5xl font-bold mb-6">
          Welcome to BBJ Church
        </h1>
        <p className="text-lg mb-8 text-gray-200">
          Growing in faith. Serving with love.
        </p>
        <a href="/register" className="bg-accent hover:bg-accent-hover text-primary font-bold px-8 py-3 rounded-lg transition inline-block">
          Register Now
        </a>
      </section>

      <section className="bg-white py-16 text-center">
        <h2 className="text-3xl font-bold text-primary mb-6">
          Our Mission
        </h2>
        <p className="max-w-3xl mx-auto text-gray-700">
          We are committed to building lives, restoring hope, and spreading the love of Christ
          through impactful worship, community outreach, and spiritual growth.
        </p>
      </section>

      <section className="bg-accent-soft py-16 text-center">
        <h2 className="text-3xl font-bold text-primary mb-6">
          Service Times
        </h2>
        <p className="text-lg text-gray-800">Sunday Worship – 9:00 AM</p>
        <p className="text-lg text-gray-800">Midweek Service – Wednesday 6:00 PM</p>
      </section>
    </div>
  );
}
