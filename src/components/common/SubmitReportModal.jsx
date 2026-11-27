import React, { useState } from 'react';
import {
  FileText,
  Calendar,
  Clock,
  Building,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Send,
  UserCheck,
} from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import Avatar from './Avatar';
import { useApp } from '../../context/AppContext';

export default function SubmitReportModal({ open, onClose, session, onReportSubmitted }) {
  const { currentUser, submitSessionReport, getUserById } = useApp();

  const [attendance, setAttendance] = useState('present');
  const [objectives, setObjectives] = useState('');
  const [topics, setTopics] = useState(['']);
  const [progressSummary, setProgressSummary] = useState('');
  const [challenges, setChallenges] = useState('');
  const [observations, setObservations] = useState('');
  const [actionItems, setActionItems] = useState(['']);
  const [nextFocus, setNextFocus] = useState('');
  const [suggestedDate, setSuggestedDate] = useState('');
  const [error, setError] = useState('');

  if (!open || !session) return null;

  const mentee = getUserById(session.menteeId);

  // Dynamic list helpers
  const handleTopicChange = (index, value) => {
    const updated = [...topics];
    updated[index] = value;
    setTopics(updated);
  };

  const addTopicField = () => setTopics([...topics, '']);
  const removeTopicField = (index) => {
    if (topics.length > 1) {
      setTopics(topics.filter((_, i) => i !== index));
    }
  };

  const handleActionItemChange = (index, value) => {
    const updated = [...actionItems];
    updated[index] = value;
    setActionItems(updated);
  };

  const addActionItemField = () => setActionItems([...actionItems, '']);
  const removeActionItemField = (index) => {
    if (actionItems.length > 1) {
      setActionItems(actionItems.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!objectives.trim()) {
      setError('Please outline the primary objectives of this session.');
      return;
    }

    const filteredTopics = topics.map((t) => t.trim()).filter(Boolean);
    if (filteredTopics.length === 0) {
      setError('Please specify at least one topic discussed.');
      return;
    }

    if (!progressSummary.trim()) {
      setError('Please provide a brief summary of mentee progress.');
      return;
    }

    const filteredActionItems = actionItems.map((a) => a.trim()).filter(Boolean);

    const res = submitSessionReport({
      sessionId: session.id,
      mentorId: currentUser.id,
      menteeId: session.menteeId,
      sessionDate: session.date,
      duration: session.duration,
      mode: session.meetingMode,
      attendance,
      objectives,
      topicsDiscussed: filteredTopics,
      progressSummary,
      challenges,
      mentorObservations: observations,
      actionItems: filteredActionItems,
      nextSessionFocus: nextFocus,
      suggestedNextSessionDate: suggestedDate,
    });

    if (res.success) {
      if (onReportSubmitted) onReportSubmitted(res.report);
      onClose();
    } else {
      setError(res.error || 'Failed to submit session report.');
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Complete Session & Submit Report"
      description={`Record formal session notes and mentee progress for "${session.title}"`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-xs text-slate-700">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Pre-populated Session Overview Bar */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Avatar user={mentee} size="sm" />
            <div>
              <p className="font-bold text-navy-900">{mentee?.name || 'Assigned Mentee'}</p>
              <p className="text-[11px] text-slate-500">{session.title}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
            <span className="font-medium text-slate-700">{session.date}</span>
            <span>•</span>
            <span>{session.startTime} ({session.duration})</span>
            <span>•</span>
            <span>{session.meetingMode}</span>
          </div>
        </div>

        {/* Attendance Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Mentee Attendance Status *
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'present', label: 'Present', color: 'border-emerald-300 bg-emerald-50 text-emerald-800' },
              { id: 'absent', label: 'Absent', color: 'border-rose-300 bg-rose-50 text-rose-800' },
            ].map((opt) => (
              <label
                key={opt.id}
                className={`flex items-center justify-center p-2.5 rounded-xl border cursor-pointer font-medium transition-all ${
                  attendance === opt.id ? `${opt.color} font-bold ring-2 ring-brand-400` : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="attendance"
                  value={opt.id}
                  checked={attendance === opt.id}
                  onChange={(e) => setAttendance(e.target.value)}
                  className="sr-only"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Primary Objectives */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Session Objectives *
          </label>
          <input
            type="text"
            required
            value={objectives}
            onChange={(e) => setObjectives(e.target.value)}
            placeholder="e.g., Code review of capstone consensus module, establish load testing benchmarks..."
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>

        {/* Topics Discussed (Dynamic Multi-item) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Topics Discussed *
            </label>
            <button
              type="button"
              onClick={addTopicField}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:text-brand-800"
            >
              <Plus className="w-3 h-3" /> Add Topic
            </button>
          </div>
          <div className="space-y-1.5">
            {topics.map((topic, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => handleTopicChange(i, e.target.value)}
                  placeholder={`Topic ${i + 1} (e.g., Distributed consensus, API security)...`}
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
                {topics.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTopicField(i)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Mentee Progress Summary */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Mentee Progress Summary *
          </label>
          <textarea
            rows={2}
            required
            value={progressSummary}
            onChange={(e) => setProgressSummary(e.target.value)}
            placeholder="Summarize the mentee's milestone accomplishments, research progress, or technical breakthroughs..."
            className="w-full p-2.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>

        {/* Dual Observations & Challenges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Mentor Observations
            </label>
            <textarea
              rows={2}
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Qualitative observations on communication, analytical ability, or discipline..."
              className="w-full p-2.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Challenges / Difficulties Identified
            </label>
            <textarea
              rows={2}
              value={challenges}
              onChange={(e) => setChallenges(e.target.value)}
              placeholder="Areas where the mentee struggled or technical roadblocks encountered..."
              className="w-full p-2.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Mentee Action Items (Dynamic Multi-item) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Assigned Mentee Action Items
            </label>
            <button
              type="button"
              onClick={addActionItemField}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:text-brand-800"
            >
              <Plus className="w-3 h-3" /> Add Action Item
            </button>
          </div>
          <div className="space-y-1.5">
            {actionItems.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleActionItemChange(i, e.target.value)}
                  placeholder={`Action item ${i + 1} (e.g., Implement mutex locking, read chapter 4)...`}
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
                {actionItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeActionItemField(i)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Next Session Roadmap */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Suggested Next Session Focus
            </label>
            <input
              type="text"
              value={nextFocus}
              onChange={(e) => setNextFocus(e.target.value)}
              placeholder="e.g., Performance benchmarking & chaos tests..."
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Suggested Next Session Date
            </label>
            <input
              type="date"
              value={suggestedDate}
              onChange={(e) => setSuggestedDate(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
          <Button variant="secondary" size="sm" type="button" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" icon={Send}>
            Submit Report & Mark Completed
          </Button>
        </div>
      </form>
    </Modal>
  );
}
