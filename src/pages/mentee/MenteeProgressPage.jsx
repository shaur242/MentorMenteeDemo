import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  CheckCircle2,
  Calendar,
  Clock,
  FileText,
  ListTodo,
  AlertCircle,
  Eye,
  Award,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import SessionReportViewModal from '../../components/common/SessionReportViewModal';

export default function MenteeProgressPage() {
  const {
    currentUser,
    getMenteeAllocation,
    getMentorById,
    sessions,
    getMenteeReports,
  } = useApp();
  const navigate = useNavigate();

  const [activeReportModal, setActiveReportModal] = useState(null);

  const allocation = useMemo(
    () => (currentUser ? getMenteeAllocation(currentUser.id) : null),
    [currentUser, getMenteeAllocation]
  );

  const mentor = useMemo(
    () => (allocation ? getMentorById(allocation.mentorId) : null),
    [allocation, getMentorById]
  );

  const menteeReports = useMemo(
    () => (currentUser ? getMenteeReports(currentUser.id) : []),
    [currentUser, getMenteeReports]
  );

  const mySessions = useMemo(() => {
    if (!currentUser) return [];
    return sessions.filter((s) => s.menteeId === currentUser.id);
  }, [currentUser, sessions]);

  const completedSessions = mySessions.filter((s) => s.status === 'completed');

  // Attendance metrics
  const attendanceRate = useMemo(() => {
    if (menteeReports.length === 0) return 100;
    const presentCount = menteeReports.filter((r) => r.attendance === 'present').length;
    return Math.round((presentCount / menteeReports.length) * 100);
  }, [menteeReports]);

  // Outstanding Action Items aggregated across recent reports
  const allActionItems = useMemo(() => {
    const list = [];
    menteeReports.forEach((rep) => {
      if (rep.actionItems?.length) {
        rep.actionItems.forEach((item) => {
          list.push({ item, date: rep.sessionDate, reportId: rep.id, report: rep });
        });
      }
    });
    return list;
  }, [menteeReports]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Mentoring Progress"
        subtitle="Review your completed sessions, verified session reports, attendance records, and assigned action items."
        breadcrumbs={['Mentee', 'My Progress']}
      >
        <Badge variant="navy" size="md">
          {completedSessions.length} Sessions Completed
        </Badge>
      </PageHeader>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Completed Sessions
          </p>
          <div className="flex items-center gap-2 mt-1">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="text-xl font-bold text-navy-900">{completedSessions.length}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">1-on-1 meetings conducted</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Official Reports
          </p>
          <div className="flex items-center gap-2 mt-1">
            <FileText className="w-5 h-5 text-brand-600" />
            <span className="text-xl font-bold text-navy-900">{menteeReports.length}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Logged by your mentor</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Attendance Rate
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Award className="w-5 h-5 text-amber-500" />
            <span className="text-xl font-bold text-navy-900">{attendanceRate}%</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Session presence record</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Action Roadmap
          </p>
          <div className="flex items-center gap-2 mt-1">
            <ListTodo className="w-5 h-5 text-indigo-600" />
            <span className="text-xl font-bold text-navy-900">{allActionItems.length}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Assigned focus items</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Session Reports History */}
        <div className="lg:col-span-2 space-y-6">
          <Card
            title="Session Reports & Meeting Timeline"
            subtitle="Verified reports submitted by your faculty mentor after each completed session."
          >
            {menteeReports.length > 0 ? (
              <div className="space-y-3.5">
                {menteeReports.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-200/60">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-navy-900">
                            {rep.id}
                          </span>
                          <span className="text-slate-400 text-xs">•</span>
                          <span className="text-xs font-semibold text-slate-700">
                            {rep.sessionDate}
                          </span>
                        </div>
                        <p className="text-xs text-brand-700 font-medium mt-0.5">
                          {rep.duration} · {rep.mode}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          variant={rep.attendance === 'present' ? 'success' : 'danger'}
                          size="xs"
                        >
                          {rep.attendance.replace('_', ' ')}
                        </Badge>
                        <Button
                          variant="secondary"
                          size="xs"
                          onClick={() => setActiveReportModal(rep)}
                          icon={Eye}
                        >
                          View Report
                        </Button>
                      </div>
                    </div>

                    <div className="pt-2.5 space-y-2 text-xs">
                      <div>
                        <p className="text-[11px] font-semibold text-slate-400 uppercase">Objectives</p>
                        <p className="text-slate-800 leading-relaxed mt-0.5">{rep.objectives}</p>
                      </div>
                      {rep.progressSummary && (
                        <div>
                          <p className="text-[11px] font-semibold text-slate-400 uppercase">Progress Summary</p>
                          <p className="text-slate-700 leading-relaxed mt-0.5">{rep.progressSummary}</p>
                        </div>
                      )}
                      {rep.nextSessionFocus && (
                        <div className="p-2 rounded-lg bg-blue-50/60 border border-blue-100 text-brand-900">
                          <span className="font-bold">Next Focus:</span> {rep.nextSessionFocus}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs">No session reports submitted yet. Reports will appear after your mentor completes your scheduled sessions.</p>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Mentor Card & Action Items */}
        <div className="space-y-6">
          {mentor ? (
            <Card title="Officially Allocated Mentor">
              <div className="flex items-center gap-3 mb-3">
                <Avatar user={mentor} size="lg" />
                <div className="min-w-0">
                  <h4 className="font-bold text-navy-900 truncate">{mentor.name}</h4>
                  <p className="text-xs text-brand-700 truncate">{mentor.title}</p>
                  <p className="text-[11px] text-slate-400 truncate">{mentor.department}</p>
                </div>
              </div>
              <Button
                variant="primary"
                size="xs"
                onClick={() => navigate('/mentee/sessions')}
                icon={Calendar}
                className="w-full"
              >
                Schedule Next Session
              </Button>
            </Card>
          ) : (
            <Card title="Mentor Status">
              <p className="text-xs text-slate-500 mb-3">You do not have an officially allocated mentor assigned.</p>
              <Button
                variant="primary"
                size="xs"
                onClick={() => navigate('/mentee/find-mentors')}
                className="w-full"
              >
                Find Mentors
              </Button>
            </Card>
          )}

          {/* Action Items List */}
          <Card title="Assigned Action Roadmap">
            {allActionItems.length > 0 ? (
              <div className="space-y-2">
                {allActionItems.map((act, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-start gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800 leading-relaxed">{act.item}</p>
                      <p className="text-[10px] text-slate-400 mt-1">From session on {act.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">
                No active action items logged from session reports.
              </p>
            )}
          </Card>
        </div>
      </div>

      {/* Modal */}
      <SessionReportViewModal
        open={!!activeReportModal}
        onClose={() => setActiveReportModal(null)}
        report={activeReportModal}
      />
    </div>
  );
}
