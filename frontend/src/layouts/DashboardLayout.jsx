import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  LogOut, 
  Calendar, 
  PlusCircle, 
  List, 
  LayoutDashboard, 
  TableProperties, 
  User
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

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

  return (
    <div className="flex h-screen bg-orange-50/30">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-orange-100 flex flex-col justify-between shadow-sm">
        <div>
          {/* Logo */}
          <div className="p-6 border-b border-orange-100">
            <h1 className="text-2xl font-bold font-serif text-primary-500 tracking-wide">Lumina Dining</h1>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-orange-50 bg-orange-50/20 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate text-gray-800">{user?.name}</p>
              <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 capitalize mt-0.5">
                {user?.role}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-colors ${
                    isActive 
                      ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20' 
                      : 'text-gray-600 hover:bg-orange-50/50 hover:text-primary-600'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-orange-50">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-orange-100 flex items-center justify-end px-8 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
            <User className="h-4 w-4 text-primary-500" />
            <span>Welcome, {user?.name}</span>
          </div>
        </header>

        {/* Page Body */}
        <section className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </section>
      </main>
    </div>
  );
};

export default DashboardLayout;
