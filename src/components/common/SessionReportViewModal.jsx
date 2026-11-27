import React, { useRef } from 'react';
import {
  Printer,
  Calendar,
  Clock,
  Building,
  UserCheck,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Target,
  ListTodo,
  Sparkles,
} from 'lucide-react';
import Modal from './Modal';
import Badge from './Badge';
import Button from './Button';
import Avatar from './Avatar';
import { useApp } from '../../context/AppContext';

export default function SessionReportViewModal({ open, onClose, report }) {
  const { getUserById, getMentorById, getCoordinatorById } = useApp();
  const printRef = useRef(null);

  if (!open || !report) return null;

  const mentor = getMentorById(report.mentorId) || getUserById(report.mentorId);
  const mentee = getUserById(report.menteeId);
  const coordinator = getCoordinatorById(report.coordinatorId);

  const handlePrint = () => {
    window.print();
  };

  const attendanceLabels = {
    present: { label: 'Present', variant: 'success' },
    absent: { label: 'Absent', variant: 'danger' },
  };

  const attBadge = attendanceLabels[report.attendance] || attendanceLabels.present;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Mentoring Session Report"
      description={`Official record for Session #${report.sessionId}`}
      size="xl"
    >
      <div className="space-y-6 text-xs text-slate-700">
        {/* Print controls bar */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-slate-500 font-bold uppercase">
              Report ID: {report.id}
            </span>
            <Badge variant="navy" size="xs">
              Verified Submission
            </Badge>
          </div>
          <Button variant="secondary" size="xs" onClick={handlePrint} icon={Printer}>
            Print / Save as PDF
          </Button>
        </div>

        {/* Printable Document Container */}
        <div ref={printRef} className="space-y-6 printable-report-card">
          {/* Institutional Header */}
          <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-navy-900 tracking-tight">
                Department Mentoring Record
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Faculty Mentorship Programme & Progress Monitoring System
              </p>
            </div>
            <div className="text-right">
              <Badge variant={attBadge.variant} size="md">
                Attendance: {attBadge.label}
              </Badge>
              <p className="text-[10px] text-slate-400 mt-1">
                Generated: {new Date(report.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          {/* 1. Session Information Table */}
          <div>
            <h3 className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <span className="w-1.5 h-3.5 bg-brand-600 rounded-full inline-block" />
              1. Session & Participant Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Date & Time:</span>
                  <span className="font-semibold text-navy-900">{report.sessionDate}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Scheduled Duration:</span>
                  <span className="font-semibold text-navy-900">{report.duration}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Meeting Mode:</span>
                  <span className="font-semibold text-navy-900">{report.mode}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Conducting Mentor:</span>
                  <span className="font-semibold text-navy-900">{mentor?.name || 'Faculty Mentor'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Allocated Mentee:</span>
                  <span className="font-semibold text-navy-900">{mentee?.name || 'Mentee'} ({mentee?.year || 'UG'})</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Cohort Coordinator:</span>
                  <span className="font-semibold text-navy-900">{coordinator?.name || 'Department Coordinator'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Session Summary & Objectives */}
          <div>
            <h3 className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <span className="w-1.5 h-3.5 bg-brand-600 rounded-full inline-block" />
              2. Session Objectives & Topics Discussed
            </h3>
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase">Primary Objectives</p>
                <p className="text-xs text-slate-800 leading-relaxed mt-0.5">{report.objectives || 'None specified'}</p>
              </div>

              {report.topicsDiscussed?.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase mb-1.5">Key Topics Covered</p>
                  <ul className="space-y-1">
                    {report.topicsDiscussed.map((topic, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                        <span className="w-1.5 h-1.5 bg-brand-500 rounded-full mt-1.5 flex-shrink-0" />
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {report.progressSummary && (
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase">Progress Summary</p>
                  <p className="text-xs text-slate-800 leading-relaxed mt-0.5">{report.progressSummary}</p>
                </div>
              )}
            </div>
          </div>

          {/* 3. Observations & Challenges */}
          <div>
            <h3 className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <span className="w-1.5 h-3.5 bg-brand-600 rounded-full inline-block" />
              3. Mentor Observations & Challenges Identified
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-[11px] font-bold text-navy-900 uppercase flex items-center gap-1.5 mb-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-brand-600" />
                  Mentor Observations
                </p>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {report.mentorObservations || 'No qualitative observations logged.'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200">
                <p className="text-[11px] font-bold text-amber-900 uppercase flex items-center gap-1.5 mb-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Difficulties / Academic Challenges
                </p>
                <p className="text-xs text-amber-900/90 leading-relaxed">
                  {report.challenges || 'No critical bottlenecks identified.'}
                </p>
              </div>
            </div>
          </div>

          {/* 4. Action Plan & Next Focus */}
          <div>
            <h3 className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <span className="w-1.5 h-3.5 bg-brand-600 rounded-full inline-block" />
              4. Action Plan & Next Session Roadmap
            </h3>
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
              {report.actionItems?.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase mb-2">Assigned Mentee Action Items</p>
                  <div className="space-y-1.5">
                    {report.actionItems.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase">Recommended Next Focus</p>
                  <p className="text-xs font-medium text-navy-900 mt-0.5">{report.nextSessionFocus || 'Follow-up on action items'}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase">Suggested Next Date</p>
                  <p className="text-xs font-medium text-navy-900 mt-0.5">
                    {report.suggestedNextSessionDate ? new Date(report.suggestedNextSessionDate).toLocaleDateString() : 'To be scheduled'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Sign-off */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-slate-400">
            <span>Official Academic Document • Confidential Mentorship Record</span>
            <span>Recorded in Centralized University Registry</span>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100 print:hidden">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close Report
          </Button>
        </div>
      </div>
    </Modal>
  );
}
