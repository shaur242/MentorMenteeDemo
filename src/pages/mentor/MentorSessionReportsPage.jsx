import React, { useMemo, useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  Calendar,
  Clock,
  Printer,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  Plus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import SessionReportViewModal from '../../components/common/SessionReportViewModal';

export default function MentorSessionReportsPage() {
  const { currentUser, getMentorReports, getUserById, sessions } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterAttendance, setFilterAttendance] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const reports = useMemo(() => {
    if (!currentUser) return [];
    return getMentorReports(currentUser.id).map((r) => ({
      ...r,
      mentee: getUserById(r.menteeId),
      session: sessions.find((s) => s.id === r.sessionId),
    }));
  }, [currentUser, getMentorReports, getUserById, sessions]);

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (filterAttendance !== 'all' && r.attendance !== filterAttendance) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const menteeMatch = r.mentee?.name?.toLowerCase().includes(q);
        const objMatch = r.objectives?.toLowerCase().includes(q);
        const idMatch = r.id?.toLowerCase().includes(q);
        return menteeMatch || objMatch || idMatch;
      }
      return true;
    });
  }, [reports, filterAttendance, searchQuery]);

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
        title="Session Reports"
        subtitle="Manage and print official mentoring reports submitted for your completed student sessions."
        breadcrumbs={['Mentor', 'Session Reports']}
      >
        <Badge variant="navy" size="md">
          {reports.length} Reports Submitted
        </Badge>
      </PageHeader>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search mentee name, report ID, or topic..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Attendance:</span>
          <select
            value={filterAttendance}
            onChange={(e) => setFilterAttendance(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Records</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
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
                <th className="py-3.5 px-4">Session Date</th>
                <th className="py-3.5 px-4">Attendance</th>
                <th className="py-3.5 px-4">Primary Objectives</th>
                <th className="py-3.5 px-4">Submitted</th>
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
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {rep.sessionDate}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={att.variant} size="xs">
                          {att.label}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate text-slate-600">
                        {rep.objectives}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(rep.createdAt).toLocaleDateString()}
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
                    No session reports found matching your criteria.
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
