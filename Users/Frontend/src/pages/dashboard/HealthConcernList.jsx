import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useHealthConcerns } from '../../hooks/useHealthConcerns';
import { PageContainer } from '../../components/layout/PageContainer';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { Input } from '../../components/common/Input';
import {
  Activity,
  PlusCircle,
  Clock,
  CheckCircle2,
  Search,
  ArrowRight,
  Filter,
  FilePlus,
} from 'lucide-react';

export const HealthConcernList = () => {
  const { concerns, isLoading } = useHealthConcerns();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredConcerns = concerns.filter((item) => {
    const matchesSearch =
      item.concern.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL' || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Awaiting Review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Awaiting Review</span>
          </span>
        );
      case 'Doctor Review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            <Activity className="w-3.5 h-3.5 text-sky-600" />
            <span>Doctor Review</span>
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Completed</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
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
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100 uppercase tracking-wider">
                Patient History
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">My Health Concerns</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive log of reported symptoms and health concern records.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            icon={PlusCircle}
            onClick={() => navigate('/dashboard/health-concern/new')}
          >
            + Describe New Concern
          </Button>
        </div>

        {/* Filter and Search Controls */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="w-full sm:w-72">
            <Input
              icon={Search}
              placeholder="Search concerns or symptoms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-50"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0">Filter:</span>
            {['ALL', 'Awaiting Review', 'Doctor Review', 'Completed'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === status
                    ? 'bg-teal-700 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status === 'ALL' ? 'All Concerns' : status}
              </button>
            ))}
          </div>
        </div>

        {/* List Content */}
        {isLoading ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 flex justify-center">
            <Loader message="Loading your health concern history..." />
          </div>
        ) : filteredConcerns.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-4 max-w-md mx-auto">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <FilePlus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">No matching health concerns</h3>
              <p className="text-xs text-slate-500 mt-1">
                {searchTerm || statusFilter !== 'ALL'
                  ? 'Try clearing your search filters or status selection.'
                  : 'You have not submitted any health concerns yet.'}
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={PlusCircle}
              onClick={() => navigate('/dashboard/health-concern/new')}
            >
              Describe a Health Concern
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredConcerns.map((item) => (
              <div
                key={item.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-teal-300 transition-all shadow-2xs hover:shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-100">
                      {item.category || 'General'}
                    </span>
                    {getStatusBadge(item.status)}
                    <span className="text-xs text-slate-400">
                      Submitted: {formatDate(item.createdAt)}
                    </span>
                  </div>

                  <h2 className="text-base font-bold text-slate-900">
                    {item.concern}
                  </h2>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                    <span>Onset: <strong className="text-slate-700 font-semibold">{item.onset}</strong></span>
                    <span>Severity: <strong className="text-slate-700 font-semibold">{item.severity}/10</strong></span>
                    <span>Frequency: <strong className="text-slate-700 font-semibold">{item.frequency}</strong></span>
                  </div>
                </div>

                <div className="shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 flex items-center justify-end">
                  <Link
                    to={`/dashboard/health-concern/${item.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100/70 px-4 py-2 rounded-xl border border-teal-200 transition-colors"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
};
