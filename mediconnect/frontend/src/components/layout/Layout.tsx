import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import EmergencyBanner from './EmergencyBanner';
import { useAuth } from '../../context/AuthContext';

const Layout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      {/* Emergency banner on top of all pages */}
      <EmergencyBanner />

      {/* Main app header */}
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        {/* Sidebar visible when authenticated */}
        {isAuthenticated && (
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}

        {/* Main Content Area */}
        <main
          className={`flex-1 transition-all duration-200 p-4 sm:p-6 lg:p-8 ${
            isAuthenticated ? 'lg:ml-64' : 'max-w-7xl mx-auto w-full'
          }`}
        >
          <Outlet />
        </main>
      </div>

      {/* Footer for public views */}
      {!isAuthenticated && (
        <footer className="bg-white border-t border-gray-100 py-12 px-4 text-center text-sm text-gray-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} MEDICONNECT Kenya. Healthcare at your doorstep.</p>
            <div className="flex items-center gap-6">
              <span className="text-gray-400">Emergency: 999</span>
              <span className="text-gray-400">M-Pesa Verified</span>
              <span className="text-gray-400">Privacy & Data Protected</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;
