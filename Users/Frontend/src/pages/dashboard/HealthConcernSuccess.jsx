import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  LayoutDashboard,
  PlusCircle,
  FileText,
} from 'lucide-react';

export const HealthConcernSuccess = ({ concern }) => {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 max-w-lg w-full text-center space-y-6">
        {/* Success Icon */}
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-50 shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        {/* Success Text */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-wider">
            Submission Confirmed
          </span>
          <h1 className="text-2xl font-bold text-slate-900">
            Health concern submitted
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Your information has been saved successfully in your medical records.
          </p>
        </div>

        {/* Concern Summary Card */}
        {concern && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-400">
              <span>Reference ID: <strong className="text-slate-700 font-semibold">{concern.id}</strong></span>
              <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                <Clock className="w-3 h-3 text-amber-600" />
                <span>Awaiting Review</span>
              </span>
            </div>

            <div className="text-sm font-bold text-slate-900 pt-1">
              {concern.concern}
            </div>

            <div className="text-slate-600 line-clamp-2">
              {concern.description}
            </div>

            <div className="pt-2 border-t border-slate-200/80 flex justify-between items-center text-[11px] text-slate-500">
              <span>Category: <strong>{concern.category || 'General'}</strong></span>
              <span>Submitted: <strong>{formatDate(concern.createdAt)}</strong></span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            icon={FileText}
            onClick={() => navigate(`/dashboard/health-concern/${concern?.id || ''}`)}
          >
            View Concern
          </Button>

          <Button
            variant="outline"
            size="md"
            className="w-full"
            icon={LayoutDashboard}
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </Button>

          <button
            onClick={() => window.location.href = '/dashboard/health-concern/new'}
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 hover:underline pt-1 inline-flex items-center gap-1 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Describe Another Concern</span>
          </button>
        </div>
      </div>
    </div>
  );
};
