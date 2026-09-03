import React from 'react';
import { Loader2, HeartPulse } from 'lucide-react';

export const Loader = ({ fullPage = false, message = 'Loading SWASTHYAPATH...' }) => {
  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-xs flex flex-col items-center justify-center z-50 p-4">
        <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center max-w-xs text-center border border-slate-100">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3 animate-pulse">
            <HeartPulse className="w-6 h-6" />
          </div>
          <Loader2 className="w-6 h-6 text-teal-600 animate-spin mb-2" />
          <p className="text-sm font-medium text-slate-700">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-6 gap-2 text-teal-600">
      <Loader2 className="w-5 h-5 animate-spin" />
      <span className="text-sm font-medium text-slate-600">{message}</span>
    </div>
  );
};
