import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { RefreshCw, ServerOff } from 'lucide-react';

export const ServerError = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-100">
          <ServerOff className="w-8 h-8" />
        </div>

        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">500</h1>
          <h2 className="text-xl font-bold text-slate-800 mt-2">Server Error</h2>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Something went wrong on our end. Please try again in a few moments.
          </p>
        </div>

        <button onClick={() => window.location.reload()} className="w-full">
          <Button variant="primary" size="md" icon={RefreshCw} className="w-full">
            Refresh Page
          </Button>
        </button>
      </div>
    </div>
  );
};
