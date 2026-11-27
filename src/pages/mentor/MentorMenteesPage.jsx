import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  Tag,
  ArrowRight,
  FileText,
  ListTodo,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import SessionReportViewModal from '../../components/common/SessionReportViewModal';

export default function MentorMenteesPage() {
  const { currentUser, getMentorAllocatedMentees, sessions, getCoordinatorById, getMenteeReports } = useApp();
  const navigate = useNavigate();

  const [activeReportModal, setActiveReportModal] = useState(null);

  const allocatedMentees = useMemo(() => {
    if (!currentUser) return [];
    return getMentorAllocatedMentees(currentUser.id).map((item) => {
      const coordinator = getCoordinatorById(item.coordinatorId);
      const menteeSessions = sessions.filter(
        (s) => s.mentorId === currentUser.id && s.menteeId === item.menteeId
      );
      const completedSessions = menteeSessions.filter((s) => s.status === 'completed').length;
      const upcomingSessions = menteeSessions.filter(
        (s) => s.status === 'confirmed' || s.status === 'pending'
      ).length;

      // Mentee reports
      const reports = getMenteeReports(item.menteeId);
      const latestReport = reports[0] || null;

      // Pending action items from the latest report
      const pendingActionItems = latestReport?.actionItems || [];

      return {
        ...item,
        coordinator,
        totalSessions: menteeSessions.length,
        completedSessions,
        upcomingSessions,
        reportsCount: reports.length,
        latestReport,
        pendingActionItems,
      };
    });
  }, [currentUser, getMentorAllocatedMentees, sessions, getCoordinatorById, getMenteeReports]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Allocated Mentees"
        subtitle="Mentees officially assigned to your guidance for the current academic session."
        breadcrumbs={['Mentor', 'My Mentees']}
      >
        <Badge variant="navy" size="md">
          {allocatedMentees.length} Active Mentees
        </Badge>
      </PageHeader>

      {allocatedMentees.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {allocatedMentees.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 p-5 shadow-xs transition-colors flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar user={item.mentee} size="lg" className="ring-2 ring-slate-100 flex-shrink-0" />
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-navy-900 truncate">
                        {item.mentee?.name || 'Assigned Mentee'}
                      </h3>
                      <p className="text-xs text-brand-700 font-medium truncate">
                        {item.mentee?.year || item.mentee?.department}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        Cohort Coordinator: {item.coordinator?.name}
                      </p>
                    </div>
                  </div>

                  <Badge
                    variant={item.method === 'self_selected' ? 'info' : 'default'}
                    size="sm"
                  >
                    <Tag className="w-3 h-3" />
                    {item.method === 'self_selected' ? 'Self Selected' : 'Assigned'}
                  </Badge>
                </div>

                {/* Goals */}
                {item.mentee?.goals && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4 leading-relaxed line-clamp-2">
                    <span className="font-semibold text-slate-700">Mentee Goals:</span>{' '}
                    {item.mentee.goals}
                  </p>
                )}

                {/* Progress Indicators & Action Items */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-slate-400 text-[10px] uppercase font-bold">Sessions</p>
                    <p className="text-sm font-bold text-navy-900 mt-0.5">
                      {item.completedSessions}
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-slate-400 text-[10px] uppercase font-bold">Reports</p>
                    <p className="text-sm font-bold text-navy-900 mt-0.5">
                      {item.reportsCount}
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-slate-400 text-[10px] uppercase font-bold">Action Items</p>
                    <p className="text-sm font-bold text-navy-900 mt-0.5">
                      {item.pendingActionItems.length}
                    </p>
                  </div>
                </div>

                {/* Latest Action Items Preview */}
                {item.pendingActionItems.length > 0 && (
                  <div className="mb-3 p-2.5 rounded-xl bg-blue-50/50 border border-blue-100 text-xs">
                    <p className="text-[10px] font-bold text-brand-900 uppercase flex items-center gap-1 mb-1">
                      <ListTodo className="w-3 h-3 text-brand-600" /> Latest Assigned Actions
                    </p>
                    <ul className="space-y-1">
                      {item.pendingActionItems.slice(0, 2).map((act, idx) => (
                        <li key={idx} className="text-[11px] text-slate-700 flex items-start gap-1.5 truncate">
                          <span className="w-1.5 h-1.5 bg-brand-500 rounded-full mt-1 flex-shrink-0" />
                          <span className="truncate">{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                {item.latestReport ? (
                  <button
                    onClick={() => setActiveReportModal(item.latestReport)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:text-brand-800"
                  >
                    <FileText className="w-3 h-3" /> View Last Report
                  </button>
                ) : (
                  <span className="text-slate-400 text-[11px]">No reports yet</span>
                )}
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="primary"
                    size="xs"
                    onClick={() => navigate(`/mentor/sessions?bookMenteeId=${item.menteeId}`)}
                    icon={Calendar}
                  >
                    Schedule Session
                  </Button>
                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={() => navigate(`/mentor/sessions?menteeId=${item.menteeId}`)}
                  >
                    Sessions ({item.totalSessions})
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-navy-900 mb-1">No Allocated Mentees</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You do not currently have any officially allocated mentees. Your coordinator will allocate
            mentees to you as cohort assignments are finalized.
          </p>
        </div>
      )}

      {/* Session Report View Modal */}
      <SessionReportViewModal
        open={!!activeReportModal}
        onClose={() => setActiveReportModal(null)}
        report={activeReportModal}
      />
    </div>
  );
}
