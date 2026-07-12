import React, { useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  // Redirect authenticated users
  if (user) {
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-orange-50/20 flex flex-col justify-between">
      {/* Navbar */}
      <header className="px-6 md:px-12 py-6 flex justify-between items-center max-w-6xl w-full mx-auto">
        <h1 className="text-2xl font-bold font-serif text-primary-500 tracking-wide">Lumina Dining</h1>
        <div className="flex gap-4">
          <Link to="/login" className="text-sm font-semibold text-gray-700 hover:text-primary-600 px-4 py-2 transition-colors">
            Login
          </Link>
          <Link to="/register" className="btn btn-primary text-sm shadow-none" style={{ padding: '0.5rem 1.25rem' }}>
            Register
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-2xl bg-white p-10 rounded-2xl shadow-sm border border-orange-100/50">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 leading-tight mb-4">
            Culinary Artistry, <br />
            <span className="text-primary-500">Reserved For You</span>
          </h2>
          <p className="text-gray-500 font-medium text-base md:text-lg mb-8 leading-relaxed">
            Experience cozy fine dining with optimized table allocation. Reserve your table now for a perfectly curated culinary evening.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login" className="btn btn-primary px-8 py-3.5 shadow-md shadow-primary-500/10 font-bold">
              Reserve Your Table
            </Link>
            <Link to="/register" className="btn btn-outline px-8 py-3.5 font-bold">
              Create an Account
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 border-t border-orange-100/50 max-w-6xl w-full mx-auto">
        <p className="text-xs text-gray-400 font-medium">&copy; {new Date().getFullYear()} Lumina Dining. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
