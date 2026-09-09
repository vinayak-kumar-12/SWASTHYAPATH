import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { PageContainer } from '../../components/layout/PageContainer';
import {
  ShieldCheck,
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
  Activity,
  Bell,
  Sparkles,
  HeartPulse,
  MapPin,
  Edit3,
  CheckCircle2,
} from 'lucide-react';

export const Dashboard = () => {
  const { user, patientProfile } = useAuth();

  const fullName = patientProfile?.firstName
    ? `${patientProfile.firstName} ${patientProfile.lastName || ''}`.trim()
    : user?.name || 'Healthcare User';

  const patientPhone = patientProfile?.phone || user?.phone || 'Not provided';
  const patientEmail = patientProfile?.email || user?.email || 'Not provided';
  const patientGender = patientProfile?.gender || 'N/A';
  const patientDob = patientProfile?.dateOfBirth
    ? new Date(patientProfile.dateOfBirth).toLocaleDateString()
    : patientProfile?.date_of_birth || 'N/A';
  const emergencyContact = patientProfile?.emergencyContactName
    ? `${patientProfile.emergencyContactName} (${patientProfile.emergencyContactPhone || 'No Phone'})`
    : 'Not set';

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header Greeting Banner */}
        <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-teal-500/20 text-teal-300 border border-teal-400/20 text-[11px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Healthcare Portal
                </span>
                {user?.isVerified && (
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/20 text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Account
                  </span>
                )}
                {patientProfile && (
                  <span className="bg-teal-400/20 text-teal-200 border border-teal-300/20 text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Profile Active
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Welcome, {fullName}
              </h1>
              <p className="text-teal-100/80 text-xs sm:text-sm mt-1 max-w-xl">
                Access your personalized medical records, appointments, clinical communication, and health management suite.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 shrink-0 self-start md:self-auto">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-300">
                <HeartPulse className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold text-white">System Status</div>
                <div className="text-[11px] text-teal-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>RabbitMQ Event Bus Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account & Patient Profile Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-teal-600" />
              <span>Patient Profile Overview</span>
            </h2>
            <Link
              to="/patient-profile"
              className="text-xs text-teal-700 hover:text-teal-800 font-bold flex items-center gap-1 bg-teal-50 hover:bg-teal-100/60 py-1.5 px-3 rounded-xl border border-teal-100 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" /> View & Edit Full Profile
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Patient Name</div>
              <div className="text-sm font-bold text-slate-800 mt-1">{fullName}</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Email Address</div>
              <div className="text-sm font-bold text-slate-800 mt-1 truncate">{patientEmail}</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Phone Number</div>
              <div className="text-sm font-bold text-slate-800 mt-1">{patientPhone}</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Gender & DOB</div>
              <div className="text-sm font-bold text-teal-700 mt-1">
                {patientGender} • {patientDob}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 sm:col-span-2">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Emergency Contact</div>
              <div className="text-sm font-bold text-slate-800 mt-1">{emergencyContact}</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 sm:col-span-2">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Language & Location</div>
              <div className="text-sm font-bold text-slate-800 mt-1">
                {patientProfile?.preferredLanguage || 'English'} • {[patientProfile?.city, patientProfile?.country].filter(Boolean).join(', ') || 'India'}
              </div>
            </div>
          </div>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Appointments</span>
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">0</div>
            <p className="text-xs text-slate-500 mt-1">No upcoming consultations</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Medical Records</span>
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">0</div>
            <p className="text-xs text-slate-500 mt-1">Documents uploaded</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Metrics</span>
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">Normal</div>
            <p className="text-xs text-slate-500 mt-1">Vitals in healthy range</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Notifications</span>
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">1</div>
            <p className="text-xs text-teal-600 font-medium mt-1">Patient profile registered</p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

