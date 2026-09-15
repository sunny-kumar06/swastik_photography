import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Image as ImageIcon,
  Layers,
  Package,
  Star,
  Mail,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronLeft,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

const menuItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Bookings', path: '/admin/bookings', icon: Calendar },
  { name: 'Gallery', path: '/admin/gallery', icon: ImageIcon },
  { name: 'Services', path: '/admin/services', icon: Layers },
  { name: 'Packages', path: '/admin/packages', icon: Package },
  { name: 'Reviews', path: '/admin/reviews', icon: Star },
  { name: 'Messages', path: '/admin/messages', icon: Mail },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
];

const AdminLayout = () => {
  const { admin, logout } = useAuth();
  const { settings } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0c121e] border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-brand-accent font-bold block">
                Management
              </span>
              <h1 className="text-lg font-cinematic font-black text-white tracking-wider truncate">
                {settings.businessName || 'SWASTIK'}
              </h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition-colors flex items-center space-x-1 text-xs font-semibold"
              aria-label="Close menu"
              title="Close menu"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-accent text-white shadow-glow-red font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Logout Bottom Bar */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/60 text-xs text-slate-300 hover:text-amber-400 border border-slate-800/80 transition-colors"
          >
            <span className="flex items-center space-x-2">
              <ExternalLink className="w-3.5 h-3.5 text-brand-accent" />
              <span>Visit Live Website</span>
            </span>
            <span className="text-[10px] text-slate-400">Preview ↗</span>
          </a>

          <div className="flex items-center justify-between px-2 pt-1">
            <div className="truncate max-w-[140px]">
              <div className="text-xs font-semibold text-white truncate">{admin?.name || 'Director'}</div>
              <div className="text-[10px] text-slate-400 truncate">{admin?.email}</div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition-colors"
              title="Logout from Admin"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        {/* Top bar for mobile header */}
        <header className="lg:hidden sticky top-0 z-30 bg-[#0c121e]/90 backdrop-blur-md border-b border-slate-800 px-4 py-3.5 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-slate-300 hover:text-white bg-slate-800/60 flex items-center space-x-1.5 focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
            <span className="text-xs font-semibold text-slate-300">Menu</span>
          </button>

          <span className="font-cinematic font-bold text-sm text-white">
            {settings.businessName} Studio Admin
          </span>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-slate-400 hover:text-white"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </header>

        {/* Page Content Outlet */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
