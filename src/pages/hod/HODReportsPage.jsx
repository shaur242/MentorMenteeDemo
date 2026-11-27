import React, { useMemo, useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Users,
  UserCheck,
  Calendar,
  Clock,
  Printer,
  Eye,
  Award,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import SessionReportViewModal from '../../components/common/SessionReportViewModal';

export default function HODReportsPage() {
  const {
    getDepartmentReports,
    coordinators,
    mentors,
    mentees,
    getMentorById,
    getUserById,
    getCoordinatorById,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCoordId, setSelectedCoordId] = useState('all');
  const [selectedMentorId, setSelectedMentorId] = useState('all');
  const [selectedAttendance, setSelectedAttendance] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const rawReports = useMemo(() => {
    return getDepartmentReports().map((r) => ({
      ...r,
      mentor: getMentorById(r.mentorId) || getUserById(r.mentorId),
      mentee: getUserById(r.menteeId),
      coordinator: getCoordinatorById(r.coordinatorId),
    }));
  }, [getDepartmentReports, getMentorById, getUserById, getCoordinatorById]);

  const filteredReports = useMemo(() => {
    return rawReports.filter((r) => {
      if (selectedCoordId !== 'all' && r.coordinatorId !== selectedCoordId) return false;
      if (selectedMentorId !== 'all' && r.mentorId !== selectedMentorId) return false;
      if (selectedAttendance !== 'all' && r.attendance !== selectedAttendance) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const menteeMatch = r.mentee?.name?.toLowerCase().includes(q);
        const mentorMatch = r.mentor?.name?.toLowerCase().includes(q);
        const coordMatch = r.coordinator?.name?.toLowerCase().includes(q);
        const idMatch = r.id?.toLowerCase().includes(q);
        return menteeMatch || mentorMatch || coordMatch || idMatch;
      }
      return true;
    });
  }, [rawReports, selectedCoordId, selectedMentorId, selectedAttendance, searchQuery]);

  // Department-wide Metrics
  const metrics = useMemo(() => {
    const totalReports = rawReports.length;
    const presentCount = rawReports.filter((r) => r.attendance === 'present').length;
    const irregularCount = rawReports.filter((r) => r.attendance === 'absent').length;
    const attendancePct = totalReports > 0 ? Math.round((presentCount / totalReports) * 100) : 100;

    return {
      totalReports,
      presentCount,
      irregularCount,
      attendancePct,
      totalMentees: mentees.length,
      totalMentors: mentors.length,
      totalCoordinators: coordinators.length,
    };
  }, [rawReports, mentees, mentors, coordinators]);

  const handleOpenReport = (rep) => {
    setSelectedReport(rep);
    setViewModalOpen(true);
  };

  const attendanceLabels = {
    present: { label: 'Present', variant: 'success' },
    absent: { label: 'Absent', variant: 'danger' },
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Department Mentoring Reports"
        subtitle="Comprehensive departmental oversight of verified session reports, attendance fidelity, and mentoring outcomes across all faculty."
        breadcrumbs={['HOD', 'Reports']}
      >
        <Badge variant="navy" size="md">
          {rawReports.length} Reports Logged
        </Badge>
      </PageHeader>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Reports Filed
          </p>
          <div className="flex items-center gap-2 mt-1">
            <FileText className="w-5 h-5 text-brand-600" />
            <span className="text-xl font-bold text-navy-900">{metrics.totalReports}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Verified academic records</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Department Attendance
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Award className="w-5 h-5 text-emerald-600" />
            <span className="text-xl font-bold text-navy-900">{metrics.attendancePct}%</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Overall session presence</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Attendance Alerts
          </p>
          <div className="flex items-center gap-2 mt-1">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span className="text-xl font-bold text-navy-900">{metrics.irregularCount}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Absent or partial meetings</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Faculty Mentors Active
          </p>
          <div className="flex items-center gap-2 mt-1">
            <UserCheck className="w-5 h-5 text-indigo-600" />
            <span className="text-xl font-bold text-navy-900">{metrics.totalMentors}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Across {metrics.totalCoordinators} cohorts</p>
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
            placeholder="Search mentee, mentor, coordinator, or ID..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Coordinator Filter */}
          <select
            value={selectedCoordId}
            onChange={(e) => setSelectedCoordId(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Cohorts / Coordinators</option>
            {coordinators.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Mentor Filter */}
          <select
            value={selectedMentorId}
            onChange={(e) => setSelectedMentorId(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Faculty Mentors</option>
            {mentors.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          {/* Attendance Filter */}
          <select
            value={selectedAttendance}
            onChange={(e) => setSelectedAttendance(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Attendance</option>
            <option value="present">Present Only</option>
            <option value="absent">Absent Only</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Report ID</th>
                <th className="py-3.5 px-4">Mentee</th>
                <th className="py-3.5 px-4">Conducting Faculty</th>
                <th className="py-3.5 px-4">Cohort Coordinator</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Attendance</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredReports.length > 0 ? (
                filteredReports.map((rep) => {
                  const att = attendanceLabels[rep.attendance] || attendanceLabels.present;
                  return (
                    <tr key={rep.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-600">
                        {rep.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <Avatar user={rep.mentee} size="sm" />
                          <div>
                            <p className="font-bold text-navy-900">{rep.mentee?.name || 'Mentee'}</p>
                            <p className="text-[11px] text-slate-400">{rep.mentee?.year}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <Avatar user={rep.mentor} size="sm" />
                          <div>
                            <p className="font-bold text-navy-900">{rep.mentor?.name || 'Mentor'}</p>
                            <p className="text-[11px] text-slate-400">{rep.mentor?.title}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-800">{rep.coordinator?.name || 'Coordinator'}</p>
                        <p className="text-[11px] text-slate-400">{rep.coordinator?.cohort}</p>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {rep.sessionDate}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={att.variant} size="xs">
                          {att.label}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="secondary"
                          size="xs"
                          onClick={() => handleOpenReport(rep)}
                          icon={Eye}
                        >
                          View Report
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No departmental session reports match your filter query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Modal */}
      <SessionReportViewModal
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedReport(null);
        }}
        report={selectedReport}
      />
    </div>
  );
}
