
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-primary shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-accent">BBJ Church</h1>
        <div className="space-x-6 text-white font-medium">
          <Link to="/" className="hover:text-accent transition">Home</Link>
          <Link to="/login" className="hover:text-accent transition">Login</Link>
          <Link to="/register" className="hover:text-accent transition">Register</Link>
        </div>
      </div>
    </nav>
  );
}
