import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Bell, User as UserIcon, LogOut, Menu, Shield, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import Avatar from '../ui/Avatar';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { isDark, toggle: toggleDark } = useTheme();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur border-b border-gray-100 dark:border-[#334155] shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-[#334155] rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              MEDI<span className="text-primary">CONNECT</span>
            </span>
          </Link>
        </div>

        {/* Center nav (public) */}
        {!isAuthenticated && (
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/services" className="text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-primary transition-colors">Medical Services</Link>
            <Link to="/providers" className="text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-primary transition-colors">Find Providers</Link>
          </nav>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-2">

          {/* 🌙 Dark Mode Toggle */}
          <button
            onClick={toggleDark}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-full text-gray-500 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-[#334155] transition-colors"
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {isAuthenticated && user ? (
            <>
              {/* Notification Bell */}
              <Link
                to={user.role === 'PATIENT' ? '/dashboard' : user.role === 'PROVIDER' ? '/provider/dashboard' : '/admin/dashboard'}
                className="relative p-2 text-gray-500 dark:text-slate-300 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-[#334155] rounded-full transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-[#1E293B]" />
                )}
              </Link>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-50 dark:hover:bg-[#334155] transition-colors"
                >
                  <Avatar name={user.fullName || user.email} size="sm" />
                  <div className="hidden sm:block text-left text-xs">
                    <p className="font-semibold text-gray-800 dark:text-slate-100 leading-tight">
                      {user.firstName || user.email.split('@')[0]}
                    </p>
                    <span className="inline-block text-[10px] text-primary font-medium uppercase tracking-wide">
                      {user.role}
                    </span>
                  </div>
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1E293B] rounded-xl shadow-lg border border-gray-100 dark:border-[#334155] py-1 z-50 animate-fade-in">
                      <div className="px-4 py-2 border-b border-gray-100 dark:border-[#334155]">
                        <p className="text-xs text-gray-500 dark:text-slate-400">Signed in as</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 truncate">{user.email}</p>
                      </div>

                      <Link
                        to={user.role === 'PATIENT' ? '/dashboard' : user.role === 'PROVIDER' ? '/provider/dashboard' : '/admin/dashboard'}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-[#334155] transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-gray-400" /> Dashboard
                      </Link>

                      {user.role === 'ADMIN' && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-[#334155] transition-colors"
                        >
                          <Shield className="w-4 h-4 text-primary" /> Admin Panel
                        </Link>
                      )}

                      {/* Dark mode toggle row inside menu too */}
                      <button
                        onClick={() => { toggleDark(); setUserMenuOpen(false); }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-[#334155] transition-colors"
                      >
                        {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                        {isDark ? 'Light Mode' : 'Dark Mode'}
                      </button>

                      <button
                        onClick={() => { setUserMenuOpen(false); handleLogout(); }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-t border-gray-100 dark:border-[#334155]"
                      >
                        <LogOut className="w-4 h-4 text-red-500" /> Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 hover:text-primary transition-colors">Log In</Link>
              <Link to="/register" className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-xl shadow-sm transition-all">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
