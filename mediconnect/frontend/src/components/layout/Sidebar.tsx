import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Clock,
  UserCheck,
  CreditCard,
  Settings,
  FileText,
  MapPin,
  Users,
  ShieldCheck,
  Activity,
  Award,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  const patientLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/services', icon: Activity, label: 'Services' },
    { to: '/providers', icon: MapPin, label: 'Find Providers' },
    { to: '/bookings', icon: Calendar, label: 'My Bookings' },
    { to: '/profile', icon: Settings, label: 'Profile & Addresses' },
  ];

  const providerLinks = [
    { to: '/provider/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/provider/requests', icon: Clock, label: 'Incoming Requests' },
    { to: '/provider/appointments', icon: Calendar, label: 'Appointments' },
    { to: '/provider/availability', icon: Calendar, label: 'Availability' },
    { to: '/provider/earnings', icon: CreditCard, label: 'Earnings' },
    { to: '/provider/credentials', icon: Award, label: 'Credentials' },
    { to: '/provider/verification', icon: UserCheck, label: 'Verification Status' },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { to: '/admin/users', icon: Users, label: 'User Accounts' },
    { to: '/admin/verifications', icon: ShieldCheck, label: 'Provider Verifications' },
    { to: '/admin/bookings', icon: Calendar, label: 'All Bookings' },
    { to: '/admin/payments', icon: CreditCard, label: 'Payments & Revenue' },
    { to: '/admin/audit-logs', icon: FileText, label: 'Audit Logs' },
    { to: '/admin/settings', icon: Settings, label: 'Platform Settings' },
  ];

  const links =
    role === 'PATIENT' ? patientLinks : role === 'PROVIDER' ? providerLinks : adminLinks;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden backdrop-blur-xs"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-gray-100 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 flex-1 overflow-y-auto space-y-1">
          <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {role === 'PATIENT' ? 'Patient Portal' : role === 'PROVIDER' ? 'Provider Portal' : 'Administration'}
          </div>

          {links.map(link => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                end={link.to === '/dashboard' || link.to === '/provider/dashboard' || link.to === '/admin/dashboard'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-100 text-xs text-gray-400">
          <p className="font-semibold text-gray-600">MEDICONNECT Kenya</p>
          <p>M-Pesa & Emergency Verified</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
