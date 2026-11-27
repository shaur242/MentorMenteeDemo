import React, { useState, useMemo } from 'react';
import {
  Link2,
  UserCheck,
  Users,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

export default function CoordAssignPage() {
  const {
    currentUser,
    getCoordinatorMentees,
    getCoordinatorMentors,
    getMenteeAllocation,
    directlyAssignMentor,
    reassignMentor,
  } = useApp();

  const groupMentees = useMemo(
    () => (currentUser ? getCoordinatorMentees(currentUser.id) : []),
    [currentUser, getCoordinatorMentees]
  );

  const groupMentors = useMemo(
    () => (currentUser ? getCoordinatorMentors(currentUser.id) : []),
    [currentUser, getCoordinatorMentors]
  );

  const [selectedMenteeId, setSelectedMenteeId] = useState('');
  const [selectedMentorId, setSelectedMentorId] = useState('');
  const [assignmentNote, setAssignmentNote] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Mentee status details
  const selectedMentee = useMemo(
    () => groupMentees.find((m) => m.id === selectedMenteeId),
    [groupMentees, selectedMenteeId]
  );

  const currentAllocation = useMemo(
    () => (selectedMenteeId ? getMenteeAllocation(selectedMenteeId) : null),
    [selectedMenteeId, getMenteeAllocation]
  );

  const isReassignment = !!currentAllocation;

  const handleAssign = (e) => {
    e.preventDefault();
    if (!selectedMenteeId || !selectedMentorId) {
      setFeedback({ type: 'error', message: 'Please select both a mentee and a mentor.' });
      return;
    }

    if (isReassignment) {
      const res = reassignMentor({
        menteeId: selectedMenteeId,
        newMentorId: selectedMentorId,
        coordinatorId: currentUser.id,
        note: assignmentNote,
      });
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Successfully reassigned ${selectedMentee?.name} to new mentor!`,
        });
        setAssignmentNote('');
        setSelectedMentorId('');
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to reassign mentor.' });
      }
    } else {
      const res = directlyAssignMentor({
        menteeId: selectedMenteeId,
        mentorId: selectedMentorId,
        coordinatorId: currentUser.id,
        note: assignmentNote,
      });
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Successfully assigned mentor to ${selectedMentee?.name}!`,
        });
        setAssignmentNote('');
        setSelectedMentorId('');
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to assign mentor.' });
      }
    }

    setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Assign Mentors"
        subtitle="Directly allocate or reassign faculty mentors to mentees in your cohort."
        breadcrumbs={['Coordinator', 'Assign Mentors']}
      />

      {feedback.message && (
        <div
          className={`p-4 rounded-xl border text-sm font-medium flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Assignment Form (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Direct Mentor Allocation">
            <form onSubmit={handleAssign} className="space-y-5">
              {/* Mentee Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  1. Select Mentee
                </label>
                <select
                  value={selectedMenteeId}
                  onChange={(e) => {
                    setSelectedMenteeId(e.target.value);
                    setSelectedMentorId('');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="">-- Choose a mentee from your cohort --</option>
                  {groupMentees.map((m) => {
                    const alloc = getMenteeAllocation(m.id);
                    return (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.year}) {alloc ? '• [Currently Assigned]' : '• [Unassigned]'}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Current Status Preview */}
              {selectedMentee && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <Avatar user={selectedMentee} size="sm" />
                    <div>
                      <p className="font-bold text-navy-900">{selectedMentee.name}</p>
                      <p className="text-slate-500">{selectedMentee.department}</p>
                    </div>
                  </div>
                  <div>
                    {currentAllocation ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                        <RefreshCw className="w-3 h-3 text-amber-600" /> Reassignment Mode
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> New Allocation
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Mentor Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  2. Select Faculty Mentor
                </label>
                <select
                  value={selectedMentorId}
                  onChange={(e) => setSelectedMentorId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="">-- Choose an available faculty mentor --</option>
                  {groupMentors.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} – {m.title} ({m.rating}★)
                    </option>
                  ))}
                </select>
              </div>

              {/* Allocation / Decision Note */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  3. Coordinator Assignment Note (Optional)
                </label>
                <textarea
                  rows={3}
                  value={assignmentNote}
                  onChange={(e) => setAssignmentNote(e.target.value)}
                  placeholder="e.g., Assigned based on shared interest in distributed computing and systems research..."
                  className="w-full p-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  icon={isReassignment ? RefreshCw : Link2}
                  disabled={!selectedMenteeId || !selectedMentorId}
                >
                  {isReassignment ? 'Reassign Mentor' : 'Assign Mentor'}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right Info Column */}
        <div className="space-y-6">
          <Card title="Cohort Mentor Roster">
            <div className="space-y-3">
              {groupMentors.map((mentor) => (
                <div
                  key={mentor.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar user={mentor} size="sm" />
                    <div className="min-w-0">
                      <p className="font-bold text-navy-900 truncate">{mentor.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{mentor.title}</p>
                    </div>
                  </div>
                  <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {mentor.rating}★
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Assignment Guidelines">
            <ul className="space-y-2 text-xs text-slate-600 leading-relaxed list-disc list-inside">
              <li>Direct assignment immediately updates the mentee's active mentor.</li>
              <li>Reassigning a mentee marks the existing allocation as reassigned for audit history.</li>
              <li>Coordinators can only manage mentors and mentees in their own assigned cohort.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
