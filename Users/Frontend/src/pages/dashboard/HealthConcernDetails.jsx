import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useHealthConcerns } from '../../hooks/useHealthConcerns';
import { useAuth } from '../../hooks/useAuth';
import { PageContainer } from '../../components/layout/PageContainer';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  Activity,
  FileCheck,
  Stethoscope,
  Info,
  Calendar,
  User,
  PlusCircle,
  AlertCircle,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export const HealthConcernDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, patientProfile } = useAuth();
  const { activeConcern, isLoading, error, fetchConcernById } = useHealthConcerns(id);

  useEffect(() => {
    if (id) {
      fetchConcernById(id);
    }
  }, [id, fetchConcernById]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="py-20 flex justify-center">
          <Loader message="Loading health concern details..." />
        </div>
      </PageContainer>
    );
  }

  if (error || !activeConcern) {
    return (
      <PageContainer>
        <div className="max-w-md mx-auto py-16 text-center space-y-4">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-100">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Health concern not found</h2>
          <p className="text-xs text-slate-500">
            The requested health concern record could not be located or may have been removed.
          </p>
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </PageContainer>
    );
  }

  const fullName = patientProfile?.firstName
    ? `${patientProfile.firstName} ${patientProfile.lastName || ''}`.trim()
    : user?.name || 'Healthcare Patient';

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        {/* Top Header Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200 transition-colors cursor-pointer self-start"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>

          <Button
            variant="outline"
            size="sm"
            icon={PlusCircle}
            onClick={() => navigate('/dashboard/health-concern/new')}
          >
            Describe Another Concern
          </Button>
        </div>

        {/* Concern Main Header Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-100 uppercase tracking-wider">
                  {activeConcern.category || 'General'}
                </span>
                <span className="text-xs text-slate-400">
                  Ref: {activeConcern.id}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {activeConcern.concern}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Submitted: {formatDate(activeConcern.createdAt)}
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Patient: {fullName}
                </span>
              </div>
            </div>

            {/* Status Badge */}
            <div className="shrink-0">
              {activeConcern.status === 'Awaiting Review' ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200 font-bold text-xs shadow-2xs">
                  <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                  <span>Awaiting Review</span>
                </div>
              ) : activeConcern.status === 'Completed' ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Completed</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-sky-50 text-sky-800 border border-sky-200 font-bold text-xs shadow-2xs">
                  <Activity className="w-4 h-4 text-sky-600" />
                  <span>{activeConcern.status}</span>
                </div>
              )}
            </div>
          </div>

          {/* Timeline / Clinical Progress Tracker */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>Clinical Journey Timeline</span>
              <span className="text-[11px] text-teal-700 font-medium">Stage 1 of 3</span>
            </div>

            <div className="relative pt-2 pb-1">
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-slate-200">
                <div className="w-1/3 shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-teal-600"></div>
              </div>
              <div className="grid grid-cols-3 text-center text-xs">
                <div>
                  <span className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold inline-flex items-center justify-center mx-auto text-[11px] shadow-sm mb-1">
                    ✓
                  </span>
                  <div className="font-bold text-teal-900">Submitted</div>
                  <div className="text-[10px] text-slate-500">Record Saved</div>
                </div>

                <div>
                  <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-400 font-bold inline-flex items-center justify-center mx-auto text-[11px] mb-1">
                    2
                  </span>
                  <div className="font-semibold text-slate-400">Doctor Review</div>
                  <div className="text-[10px] text-slate-400">Upcoming</div>
                </div>

                <div>
                  <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-400 font-bold inline-flex items-center justify-center mx-auto text-[11px] mb-1">
                    3
                  </span>
                  <div className="font-semibold text-slate-400">Clinical Assessment</div>
                  <div className="text-[10px] text-slate-400">Upcoming</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 1: Concern Summary */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileCheck className="w-5 h-5 text-teal-600" />
            <span>Concern Summary</span>
          </h2>

          <div className="space-y-3">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Description
              </span>
              <p className="text-sm text-slate-800 bg-slate-50 p-4 rounded-2xl border border-slate-200 mt-1 leading-relaxed whitespace-pre-line">
                {activeConcern.description}
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 2: Symptoms & Details */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Stethoscope className="w-5 h-5 text-teal-600" />
            <span>Symptoms & Detailed Observations</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Onset Timing</span>
              <span className="text-sm font-bold text-slate-800 mt-1 block">{activeConcern.onset}</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Severity Score</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-base font-bold text-teal-700">{activeConcern.severity} / 10</span>
                <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      activeConcern.severity >= 8
                        ? 'bg-rose-600'
                        : activeConcern.severity >= 5
                        ? 'bg-amber-500'
                        : 'bg-teal-600'
                    }`}
                    style={{ width: `${activeConcern.severity * 10}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Frequency</span>
              <span className="text-sm font-bold text-slate-800 mt-1 block">{activeConcern.frequency}</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Location</span>
              <span className="text-sm font-bold text-slate-800 mt-1 block">{activeConcern.location || 'Not specified'}</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Triggers</span>
              <span className="text-sm font-bold text-slate-800 mt-1 block">{activeConcern.triggers || 'None reported'}</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Relieving Factors</span>
              <span className="text-sm font-bold text-slate-800 mt-1 block">{activeConcern.relievingFactors || 'None reported'}</span>
            </div>
          </div>

          {/* Associated Symptoms */}
          <div className="pt-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Associated Symptoms Reported
            </span>
            <div className="flex flex-wrap gap-2">
              {activeConcern.associatedSymptoms && activeConcern.associatedSymptoms.length > 0 ? (
                activeConcern.associatedSymptoms.map((sym) => (
                  <span
                    key={sym}
                    className="px-3 py-1 bg-teal-50 text-teal-900 border border-teal-100 rounded-xl text-xs font-semibold"
                  >
                    {sym}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500 italic">No associated symptoms reported</span>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3: Health Context */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Info className="w-5 h-5 text-teal-600" />
            <span>Health Context & Medical History</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-400 font-semibold uppercase tracking-wider block">Existing Medical Conditions</span>
              <p className="text-slate-800 font-medium mt-1">{activeConcern.medicalConditions || 'None reported'}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-400 font-semibold uppercase tracking-wider block">Current Medications</span>
              <p className="text-slate-800 font-medium mt-1">{activeConcern.medications || 'None reported'}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-400 font-semibold uppercase tracking-wider block">Allergies</span>
              <p className="text-slate-800 font-medium mt-1">{activeConcern.allergies || 'None reported'}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-400 font-semibold uppercase tracking-wider block">Previous Treatment</span>
              <p className="text-slate-800 font-medium mt-1">{activeConcern.previousTreatment || 'None reported'}</p>
            </div>
          </div>

          {activeConcern.additionalInformation && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <span className="text-slate-400 font-semibold uppercase tracking-wider block">Additional Notes</span>
              <p className="text-slate-800 font-medium mt-1">{activeConcern.additionalInformation}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 pt-2">
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Button>

          <Button variant="primary" icon={PlusCircle} onClick={() => navigate('/dashboard/health-concern/new')}>
            Describe Another Concern
          </Button>
        </div>
      </div>
    </PageContainer>
  );
};
