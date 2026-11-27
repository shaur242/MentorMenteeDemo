import React, { useMemo, useState } from 'react';
import {
  Layers,
  Search,
  Filter,
  Users,
  UserCheck,
  Building,
  Calendar,
  Tag,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';

export default function HODAllocationsPage() {
  const { allocations, mentors, mentees, coordinators, getMentorById, getUserById, getCoordinatorById } =
    useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCoord, setSelectedCoord] = useState('all');
  const [selectedMethod, setSelectedMethod] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('approved');

  const enrichedAllocations = useMemo(() => {
    return allocations.map((a) => ({
      ...a,
      mentor: getMentorById(a.mentorId),
      mentee: getUserById(a.menteeId),
      coordinator: getCoordinatorById(a.coordinatorId),
    }));
  }, [allocations, getMentorById, getUserById, getCoordinatorById]);

  const filtered = useMemo(() => {
    return enrichedAllocations.filter((a) => {
      if (selectedStatus !== 'all' && a.status !== selectedStatus) return false;
      if (selectedCoord !== 'all' && a.coordinatorId !== selectedCoord) return false;
      if (selectedMethod !== 'all' && a.method !== selectedMethod) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const menteeMatch = a.mentee?.name?.toLowerCase().includes(q);
        const mentorMatch = a.mentor?.name?.toLowerCase().includes(q);
        return menteeMatch || mentorMatch;
      }
      return true;
    });
  }, [enrichedAllocations, selectedStatus, selectedCoord, selectedMethod, searchQuery]);

  // Summary Metrics
  const stats = useMemo(() => {
    const total = allocations.length;
    const active = allocations.filter((a) => a.status === 'approved').length;
    const pending = allocations.filter((a) => a.status === 'pending').length;
    const selfSelected = allocations.filter((a) => a.method === 'self_selected' && a.status === 'approved').length;
    const coordAssigned = allocations.filter((a) => a.method === 'coordinator_assigned' && a.status === 'approved').length;
    return { total, active, pending, selfSelected, coordAssigned };
  }, [allocations]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Department Mentor Allocations"
        subtitle="Department-wide oversight of mentor allocations, coordinator approvals, and pairing matrix."
        breadcrumbs={['HOD', 'Allocations']}
      >
        <Badge variant="navy" size="md">
          {stats.active} Active Allocations
        </Badge>
      </PageHeader>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Active Allocations
          </p>
          <div className="flex items-center gap-2 mt-1">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="text-xl font-bold text-navy-900">{stats.active}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Department pairs active</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Pending Approval
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Clock className="w-5 h-5 text-amber-500" />
            <span className="text-xl font-bold text-navy-900">{stats.pending}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Under coordinator review</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Self-Selected
          </p>
          <div className="flex items-center gap-2 mt-1">
            <TrendingUp className="w-5 h-5 text-brand-600" />
            <span className="text-xl font-bold text-navy-900">{stats.selfSelected}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Mentee chosen</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Coordinator Assigned
          </p>
          <div className="flex items-center gap-2 mt-1">
            <UserCheck className="w-5 h-5 text-indigo-600" />
            <span className="text-xl font-bold text-navy-900">{stats.coordAssigned}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Directly allocated</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search mentee or mentor..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Coordinator Filter */}
          <select
            value={selectedCoord}
            onChange={(e) => setSelectedCoord(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Coordinators</option>
            {coordinators.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Method Filter */}
          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Methods</option>
            <option value="self_selected">Self Selected</option>
            <option value="coordinator_assigned">Coordinator Assigned</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
            <option value="reassigned">Reassigned</option>
          </select>
        </div>
      </div>

      {/* Allocations Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Mentee</th>
                <th className="py-3.5 px-4">Faculty Mentor</th>
                <th className="py-3.5 px-4">Cohort Coordinator</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.length > 0 ? (
                filtered.map((alloc) => (
                  <tr key={alloc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <Avatar user={alloc.mentee} size="sm" />
                        <div>
                          <p className="font-bold text-navy-900">{alloc.mentee?.name}</p>
                          <p className="text-[11px] text-slate-400">{alloc.mentee?.year}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <Avatar user={alloc.mentor} size="sm" />
                        <div>
                          <p className="font-bold text-navy-900">{alloc.mentor?.name}</p>
                          <p className="text-[11px] text-slate-400">{alloc.mentor?.title}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800">{alloc.coordinator?.name}</p>
                      <p className="text-[11px] text-slate-400">{alloc.coordinator?.cohort}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={alloc.method === 'self_selected' ? 'info' : 'default'}
                        size="sm"
                      >
                        <Tag className="w-3 h-3" />
                        {alloc.method === 'self_selected' ? 'Self Selected' : 'Assigned'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          alloc.status === 'approved'
                            ? 'success'
                            : alloc.status === 'pending'
                            ? 'warning'
                            : alloc.status === 'rejected'
                            ? 'danger'
                            : 'default'
                        }
                        size="sm"
                      >
                        {alloc.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(alloc.decidedAt || alloc.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No allocation records match the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
