import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Home, AlertTriangle } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-100">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">404</h1>
          <h2 className="text-xl font-bold text-slate-800 mt-2">Page not found</h2>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>

        <Link to="/dashboard" className="block">
          <Button variant="primary" size="md" icon={Home} className="w-full">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};
