import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogOut, 
  Calendar, 
  PlusCircle, 
  List, 
  LayoutDashboard, 
  TableProperties, 
  User,
  Menu,
  X
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';

  const menuItems = isAdmin 
    ? [
        { name: 'Admin Dashboard', path: '/admin', icon: LayoutDashboard },
        { name: 'Reservations', path: '/admin/reservations', icon: Calendar },
        { name: 'Manage Tables', path: '/admin/tables', icon: TableProperties },
      ]
    : [
        { name: 'My Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Book a Table', path: '/dashboard/book', icon: PlusCircle },
        { name: 'My Reservations', path: '/dashboard/my-reservations', icon: List },
      ];

  const SidebarContent = () => (
    <div className="h-full flex flex-col justify-between bg-white">
      <div>
        {/* Brand Logo */}
        <div className="p-6 border-b border-brand-border/60">
          <Link to="/" className="flex items-center gap-1.5">
            <span className="text-lg font-serif font-bold text-brand-text tracking-wide">LUMINA</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-brand-muted font-bold mt-1">Dining</span>
          </Link>
        </div>

        {/* Profile Card */}
        <div className="p-4 border-b border-brand-border/40 bg-brand-bg/40 flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold border border-primary-200/50">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate text-brand-text">{user?.name}</p>
            <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full bg-orange-100/50 border border-orange-200/20 text-primary-700 uppercase tracking-wider mt-0.5">
              {user?.role}
            </span>
          </div>
        </div>

        {/* Menu Navigation */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm transition-colors ${
                  isActive 
                    ? 'text-white' 
                    : 'text-brand-muted hover:bg-brand-bg/50 hover:text-brand-text'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavBg"
                    className="absolute inset-0 bg-primary-500 rounded-lg -z-10 shadow-sm"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className="h-4.5 w-4.5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout Action */}
      <div className="p-4 border-t border-brand-border/40">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm text-red-600 hover:bg-red-50/50 active:bg-red-50 transition-colors"
        >
          <LogOut className="h-4.5 w-4.5" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-brand-bg overflow-hidden">
      {/* Desktop Sidebar (Left-anchored) */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-brand-border/60 flex-col shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer (Framer-motion slide-out overlay) */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop filter overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="absolute inset-0 bg-brand-text"
            />
            {/* Drawer sheet */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-2xl z-10"
            >
              <SidebarContent />
              {/* Close Button on drawer top right */}
              <button 
                onClick={() => setIsMobileOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg border border-brand-border text-brand-muted hover:text-brand-text transition-colors bg-brand-bg"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Right Column Layout */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header Ribbon */}
        <header className="h-16 bg-white border-b border-brand-border/60 flex items-center justify-between lg:justify-end px-6 md:px-8 shadow-sm/5 z-20 shrink-0">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 -ml-2 rounded-lg border border-brand-border text-brand-muted hover:text-brand-text transition-colors lg:hidden bg-brand-bg/50"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-2 text-sm text-brand-muted font-semibold">
            <User className="h-4 w-4 text-primary-500" />
            <span>Logged in as <span className="text-brand-text">{user?.name}</span></span>
          </div>
        </header>

        {/* Scrollable Container */}
        <section className="flex-1 overflow-y-auto p-6 md:p-8">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="max-w-6xl mx-auto"
          >
            {children}
          </motion.div>
        </section>
      </main>
    </div>
  );
};

export default DashboardLayout;
