import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  HeartPulse,
  LogOut,
  Bell,
  ShieldCheck,
  Menu,
  X,
  LayoutDashboard,
  Activity,
  UserCheck,
  Calendar,
  FileText,
  PlusCircle,
} from 'lucide-react';

export const Navbar = () => {
  const { user, patientProfile, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fullName = patientProfile?.firstName
    ? `${patientProfile.firstName} ${patientProfile.lastName || ''}`.trim()
    : user?.name || user?.email || 'Patient';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-xs group-hover:bg-teal-700 transition-colors">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-slate-900 block leading-none">
              SWASTHYAPATH
            </span>
            <span className="text-[10px] text-teal-600 font-semibold tracking-wider uppercase">
              Healthcare Portal
            </span>
          </div>
        </Link>

        {/* Desktop Quick Nav Links */}
        <div className="hidden lg:flex items-center gap-1 text-sm font-medium text-slate-600">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg transition-colors ${
                isActive ? 'text-teal-700 bg-teal-50 font-semibold' : 'hover:text-slate-900 hover:bg-slate-50'
              }`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/dashboard/health-concerns"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg transition-colors ${
                isActive ? 'text-teal-700 bg-teal-50 font-semibold' : 'hover:text-slate-900 hover:bg-slate-50'
              }`
            }
          >
            My Health Concerns
          </NavLink>
          <NavLink
            to="/dashboard/health-concern/new"
            className="px-3 py-1.5 text-teal-700 bg-teal-50 hover:bg-teal-100/70 rounded-lg font-semibold flex items-center gap-1.5 transition-colors border border-teal-200/60"
          >
            <PlusCircle className="w-4 h-4 text-teal-600" />
            <span>Describe Concern</span>
          </NavLink>
        </div>

        {/* User Action Info Bar */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Notifications Button */}
          <button
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-500 rounded-full"></span>
          </button>

          {/* User Badge */}
          {user && (
            <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-slate-200">
              <Link
                to="/patient-profile"
                className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer"
                title="View & Edit Patient Profile"
              >
                <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-semibold flex items-center justify-center text-xs overflow-hidden border border-teal-200 shrink-0">
                  {patientProfile?.profileImageUrl || patientProfile?.profile_image_url ? (
                    <img
                      src={patientProfile.profileImageUrl || patientProfile.profile_image_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>
                      {patientProfile?.firstName
                        ? patientProfile.firstName.charAt(0).toUpperCase()
                        : user.name
                        ? user.name.charAt(0).toUpperCase()
                        : 'P'}
                    </span>
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-xs font-semibold text-slate-800 flex items-center gap-1 group-hover:text-teal-700 transition-colors">
                    <span>{fullName}</span>
                    {user.isVerified && (
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-600" title="Verified Account" />
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    Patient Profile
                  </div>
                </div>
              </Link>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>

              {/* Mobile Hamburger Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 md:hidden transition-colors cursor-pointer ml-1"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Collapsible Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-4 space-y-2 shadow-lg">
          <NavLink
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium ${
                isActive ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
              }`
            }
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/dashboard/health-concerns"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium ${
                isActive ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
              }`
            }
          >
            <Activity className="w-4 h-4" />
            <span>My Health Concerns</span>
          </NavLink>

          <NavLink
            to="/dashboard/health-concern/new"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium bg-teal-600 text-white font-semibold"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Describe a Health Concern</span>
          </NavLink>

          <NavLink
            to="/patient-profile"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium ${
                isActive ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
              }`
            }
          >
            <UserCheck className="w-4 h-4" />
            <span>My Profile</span>
          </NavLink>
        </div>
      )}
    </header>
  );
};
