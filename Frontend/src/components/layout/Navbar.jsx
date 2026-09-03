import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { HeartPulse, LogOut, User, Bell, ShieldCheck } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-xs">
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
        </div>

        {/* User Action Info Bar */}
        <div className="flex items-center gap-4">
          {/* Notifications Placeholder */}
          <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-500 rounded-full"></span>
          </button>

          {/* User Badge */}
          {user && (
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-semibold flex items-center justify-center text-xs">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                  <span>{user.name || user.email}</span>
                  {user.isVerified && (
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600" title="Verified Account" />
                  )}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {user.role || 'PATIENT'}
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="ml-2 p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
