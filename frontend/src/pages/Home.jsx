import React, { useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Sparkles, Calendar, ClipboardCheck, ArrowRight, ShieldCheck, Heart, Clock } from 'lucide-react';

const Home = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-brand-bg">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (user) {
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col justify-between selection:bg-primary-100">
      {/* Header / Navbar */}
      <header className="w-full max-w-7xl mx-auto px-6 md:px-12 py-6 flex justify-between items-center border-b border-brand-border/40">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2"
        >
          <span className="text-xl md:text-2xl font-serif font-bold text-primary-500 tracking-wide">LUMINA</span>
          <span className="text-xs uppercase tracking-[0.25em] text-brand-muted font-bold mt-1.5">Dining</span>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-6"
        >
          <Link to="/login" className="text-sm font-semibold text-brand-muted hover:text-primary-500 transition-colors">
            Sign In
          </Link>
          <Link to="/register" className="btn btn-primary text-xs py-2 px-5 font-bold tracking-wider uppercase">
            Reserve Now
          </Link>
        </motion.div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center">
        <motion.section 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 text-center space-y-12"
        >

          {/* Heading */}
          <motion.h1 
            variants={itemVariants}
            className="text-5xl md:text-7xl font-serif font-semibold leading-[1.1] text-brand-text max-w-4xl mx-auto"
          >
            Reserve Extraordinary <br className="hidden md:inline" />
            Dining Experiences
          </motion.h1>

          {/* Subheading */}
          <motion.p 
            variants={itemVariants}
            className="text-base md:text-lg font-medium text-brand-muted max-w-xl mx-auto leading-relaxed"
          >
            Seamlessly book tables, manage reservations, and enjoy exceptional hospitality with real-time capacity allocation.
          </motion.p>

          {/* Call to Actions */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link to="/login" className="btn btn-primary px-8 py-4 font-bold text-sm tracking-wide shadow-lg shadow-primary-500/10 flex items-center gap-2 group">
              Reserve Table
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to="/register" className="btn btn-outline px-8 py-4 font-bold text-sm">
              Explore Dining
            </Link>
          </motion.div>
        </motion.section>

        {/* Feature Highlights Grid */}
        <section className="w-full max-w-7xl mx-auto px-6 md:px-12 py-16 border-t border-brand-border/40">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="bg-white p-8 rounded-xl border border-brand-border/60 shadow-sm"
            >
              <div className="h-12 w-12 rounded-lg bg-orange-50 flex items-center justify-center text-primary-500 mb-6">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold font-serif text-brand-text mb-3">Smart Seating allocation</h3>
              <p className="text-sm text-brand-muted leading-relaxed font-medium">
                Our advanced engine automatically assigns the smallest optimal table to fit your group size, maximizing available seating.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
              className="bg-white p-8 rounded-xl border border-brand-border/60 shadow-sm"
            >
              <div className="h-12 w-12 rounded-lg bg-orange-50 flex items-center justify-center text-primary-500 mb-6">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold font-serif text-brand-text mb-3">Instant Reservations</h3>
              <p className="text-sm text-brand-muted leading-relaxed font-medium">
                Real-time booking previews instantly confirm table availability, preventing double-bookings and scheduling conflicts.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
              className="bg-white p-8 rounded-xl border border-brand-border/60 shadow-sm"
            >
              <div className="h-12 w-12 rounded-lg bg-orange-50 flex items-center justify-center text-primary-500 mb-6">
                <ClipboardCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold font-serif text-brand-text mb-3">Real-Time Management</h3>
              <p className="text-sm text-brand-muted leading-relaxed font-medium">
                Manage your profile, view complete transaction histories, and safely modify or cancel bookings with smooth status toggles.
              </p>
            </motion.div>
          </div>
        </section>


      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 md:px-12 py-12 border-t border-brand-border/40 text-center md:text-left">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-lg font-serif font-bold text-brand-text tracking-wide">LUMINA</span>
            <span className="text-xs uppercase tracking-[0.2em] text-brand-muted mt-1">Dining</span>
          </div>
          <div className="flex gap-8 text-xs font-semibold text-brand-muted">
            <span className="hover:text-primary-500 cursor-pointer transition-colors">About</span>
            <span className="hover:text-primary-500 cursor-pointer transition-colors">Reservations</span>
            <span className="hover:text-primary-500 cursor-pointer transition-colors">Contact</span>
          </div>
          <p className="text-xs text-brand-muted font-medium">
            &copy; {new Date().getFullYear()} Lumina Dining. Crafted with Michelin-inspired standards.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
