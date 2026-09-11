import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useHealthConcerns } from '../../hooks/useHealthConcerns';
import { PageContainer } from '../../components/layout/PageContainer';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import {
  ShieldCheck,
  User,
  Calendar,
  FileText,
  Activity,
  Bell,
  HeartPulse,
  CheckCircle2,
  PlusCircle,
  ArrowRight,
  Clock,
  AlertCircle,
  FilePlus,
  ClipboardList,
} from 'lucide-react';

export const Dashboard = () => {
  const { user, patientProfile } = useAuth();
  const { concerns, isLoading } = useHealthConcerns();
  const navigate = useNavigate();

  const fullName = patientProfile?.firstName
    ? `${patientProfile.firstName} ${patientProfile.lastName || ''}`.trim()
    : user?.name || 'Healthcare Patient';

  // Time-based greeting helper
  const getGreetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Helper for status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Awaiting Review':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Awaiting Review</span>
          </span>
        );
      case 'Doctor Review':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            <Activity className="w-3.5 h-3.5 text-sky-600" />
            <span>Doctor Review</span>
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Completed</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <span>{status || 'Submitted'}</span>
          </span>
        );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <PageContainer>
      <div className="space-y-8 max-w-6xl mx-auto">
        {/* Welcome Section */}
        <div className="bg-gradient-to-br from-teal-800 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-teal-500/20 text-teal-300 border border-teal-400/30 text-[11px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                Patient Portal
              </span>
              {user?.isVerified && (
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Account
                </span>
              )}
              {patientProfile && (
                <span className="bg-teal-400/20 text-teal-200 border border-teal-300/30 text-[11px] font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Profile Active
                </span>
              )}
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
                {getGreetingTime()}, {fullName}
              </h1>
              <p className="text-teal-100/90 text-sm sm:text-base mt-1.5 font-medium">
                How are you feeling today?
              </p>
              <p className="text-teal-200/70 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                Tell us what you're experiencing and we'll help you organize the information for your healthcare journey.
              </p>
            </div>

            {/* Action Call to Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                size="lg"
                icon={PlusCircle}
                onClick={() => navigate('/dashboard/health-concern/new')}
                className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold border border-teal-300/30 shadow-lg shadow-teal-950/30"
              >
                + Describe a Health Concern
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/dashboard/health-concerns')}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30 backdrop-blur-sm"
              >
                View My Health Concerns
              </Button>
            </div>
          </div>
        </div>

        {/* Health Overview Cards */}
        <div>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
            Health Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* Upcoming Appointment Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Upcoming Appointment
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-lg font-bold text-slate-900 mt-1">None Scheduled</div>
                <p className="text-xs text-slate-500 mt-1">Book consultations with specialist doctors.</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
                <span>Clinical Schedule</span>
                <span className="font-medium text-slate-500">Active</span>
              </div>
            </div>

            {/* Health Concerns Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Health Concerns
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                    <Activity className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900">{concerns.length}</div>
                <p className="text-xs text-teal-700 font-medium mt-1">
                  {concerns.filter((c) => c.status === 'Awaiting Review').length} awaiting review
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                <Link to="/dashboard/health-concerns" className="text-teal-700 font-semibold hover:underline">
                  View All ({concerns.length})
                </Link>
                <span className="text-slate-400">Updated today</span>
              </div>
            </div>

            {/* Medical Records Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Medical Records
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900">0</div>
                <p className="text-xs text-slate-500 mt-1">Lab reports & clinical summaries</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
                <span>Secure Storage</span>
                <span className="font-medium text-slate-500">Ready</span>
              </div>
            </div>

            {/* Documents Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Documents
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900">0</div>
                <p className="text-xs text-slate-500 mt-1">Prescriptions & receipts</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
                <span>Digital Archive</span>
                <span className="font-medium text-slate-500">Ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* Patient Profile Quick Summary */}
        {patientProfile && (
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-teal-600" />
                <span>Patient Profile Quick View</span>
              </h2>
              <Link
                to="/patient-profile"
                className="text-xs text-teal-700 font-semibold hover:underline"
              >
                Full Profile →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Name</span>
                <span className="font-semibold text-slate-800 truncate block mt-0.5">{fullName}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Gender & DOB</span>
                <span className="font-semibold text-slate-800 truncate block mt-0.5">
                  {patientProfile.gender || 'N/A'} • {patientProfile.dateOfBirth ? new Date(patientProfile.dateOfBirth).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Contact</span>
                <span className="font-semibold text-slate-800 truncate block mt-0.5">{patientProfile.phone || user?.email}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Emergency Contact</span>
                <span className="font-semibold text-slate-800 truncate block mt-0.5">{patientProfile.emergencyContactName || 'Not configured'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Recent Health Concerns */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-teal-600" />
                <span>Recent Health Concerns</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Track and manage symptoms or health concerns submitted for clinical evaluation.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={PlusCircle}
              onClick={() => navigate('/dashboard/health-concern/new')}
            >
              Describe Concern
            </Button>
          </div>

          <div className="p-5 sm:p-6">
            {isLoading ? (
              <div className="py-12 flex justify-center">
                <Loader message="Loading your health concerns..." />
              </div>
            ) : concerns.length === 0 ? (
              /* Empty State */
              <div className="text-center py-12 px-4 max-w-md mx-auto space-y-4">
                <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto border border-teal-100">
                  <FilePlus className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">No health concerns submitted yet</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Share your current health concerns or symptoms to organize your information for your upcoming healthcare consultations.
                  </p>
                </div>
                <Button
                  variant="primary"
                  icon={PlusCircle}
                  onClick={() => navigate('/dashboard/health-concern/new')}
                >
                  Describe Your First Concern
                </Button>
              </div>
            ) : (
              /* Concerns List Grid / Cards */
              <div className="space-y-4">
                {concerns.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 rounded-xl border border-slate-200 hover:border-teal-300 hover:shadow-2xs transition-all bg-white group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-100">
                          {item.category || 'General'}
                        </span>
                        {getStatusBadge(item.status)}
                        <span className="text-xs text-slate-400">
                          Submitted: {formatDate(item.createdAt)}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors truncate">
                        {item.concern}
                      </h3>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                        <span>Onset: <strong className="text-slate-700 font-semibold">{item.onset}</strong></span>
                        <span>Severity: <strong className="text-slate-700 font-semibold">{item.severity}/10</strong></span>
                        {item.associatedSymptoms?.length > 0 && (
                          <span>
                            Symptoms: <strong className="text-slate-700 font-semibold">{item.associatedSymptoms.join(', ')}</strong>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 flex items-center justify-end">
                      <Link
                        to={`/dashboard/health-concern/${item.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100/70 px-3.5 py-2 rounded-xl border border-teal-200 transition-colors"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}

                {concerns.length > 5 && (
                  <div className="text-center pt-2">
                    <Link
                      to="/dashboard/health-concerns"
                      className="text-xs font-bold text-teal-700 hover:text-teal-800 inline-flex items-center gap-1 py-1"
                    >
                      <span>View all {concerns.length} health concerns</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
