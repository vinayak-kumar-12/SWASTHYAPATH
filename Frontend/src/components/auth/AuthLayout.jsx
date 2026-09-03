import React from 'react';
import { HeartPulse, ShieldCheck, Activity, Users } from 'lucide-react';

export const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* Left Branding Side Panel */}
        <div className="lg:col-span-5 bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-teal-500/10 blur-2xl"></div>
          <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-teal-300/10 blur-2xl"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-teal-300 border border-white/10">
                <HeartPulse className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold tracking-wider text-white">SWASTHYAPATH</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold leading-tight mb-3">
              Your Health, Connected.
            </h1>
            <p className="text-teal-100/80 text-sm leading-relaxed">
              Enterprise healthcare management platform designed for security, real-time coordination, and patient care excellence.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="relative z-10 space-y-4 my-8">
            <div className="flex items-center gap-3 text-xs font-medium text-teal-100/90 bg-white/5 p-3 rounded-xl border border-white/10">
              <ShieldCheck className="w-4 h-4 text-teal-300 shrink-0" />
              <span>HIPAA Compliant & Encrypted Data Bus</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium text-teal-100/90 bg-white/5 p-3 rounded-xl border border-white/10">
              <Activity className="w-4 h-4 text-teal-300 shrink-0" />
              <span>Real-Time Notification Event Pipeline</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium text-teal-100/90 bg-white/5 p-3 rounded-xl border border-white/10">
              <Users className="w-4 h-4 text-teal-300 shrink-0" />
              <span>Patient & Doctor Collaborative Workspace</span>
            </div>
          </div>

          <div className="relative z-10 text-xs text-teal-200/60 pt-4 border-t border-white/10">
            © {new Date().getFullYear()} SWASTHYAPATH Inc. All rights reserved.
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="lg:col-span-7 p-6 sm:p-10 md:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto">{children}</div>
        </div>
      </div>
    </div>
  );
};
