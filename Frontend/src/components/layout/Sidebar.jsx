import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Stethoscope,
  FileText,
  Calendar,
  Bell,
  Settings,
} from 'lucide-react';

const navigationItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Patients', path: '/patients', icon: Users, badge: 'Coming Soon' },
  { name: 'Doctors', path: '/doctors', icon: Stethoscope, badge: 'Coming Soon' },
  { name: 'Appointments', path: '/appointments', icon: Calendar, badge: 'Coming Soon' },
  { name: 'Documents', path: '/documents', icon: FileText, badge: 'Coming Soon' },
  { name: 'Notifications', path: '/notifications', icon: Bell, badge: 'Coming Soon' },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar = () => {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 hidden md:block shrink-0">
      <div className="space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-teal-50 text-teal-700 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] bg-slate-100 text-slate-500 font-medium px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
};
