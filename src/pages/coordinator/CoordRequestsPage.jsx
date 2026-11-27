import React, { useMemo, useState } from 'react';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
  UserCheck,
  MessageSquare,
  Calendar,
  Tag,
  Star,
  Briefcase,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

export default function CoordRequestsPage() {
  const {
    currentUser,
    getCoordinatorPendingAllocations,
    getCoordinatorAllocations,
    getMentorById,
    getUserById,
    approveMentorAllocation,
    rejectMentorAllocation,
  } = useApp();

  const [activeTab, setActiveTab] = useState('pending');
  const [decisionModal, setDecisionModal] = useState({ open: false, allocation: null, action: '' });
  const [decisionNote, setDecisionNote] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const allAllocations = useMemo(
    () => (currentUser ? getCoordinatorAllocations(currentUser.id) : []),
    [currentUser, getCoordinatorAllocations]
  );

  const enriched = useMemo(
    () =>
      allAllocations.map((a) => ({
        ...a,
        mentor: getMentorById(a.mentorId),
        mentee: getUserById(a.menteeId),
      })),
    [allAllocations, getMentorById, getUserById]
  );

  const filtered = useMemo(() => {
    if (activeTab === 'all') return enriched;
    return enriched.filter((a) => a.status === activeTab);
  }, [enriched, activeTab]);

  const pendingCount = enriched.filter((a) => a.status === 'pending').length;

  const handleDecision = () => {
    if (!decisionModal.allocation) return;
    if (decisionModal.action === 'approve') {
      approveMentorAllocation(decisionModal.allocation.id, decisionNote);
      setFeedback({ type: 'success', message: 'Allocation request approved successfully.' });
    } else {
      rejectMentorAllocation(decisionModal.allocation.id, decisionNote);
      setFeedback({ type: 'success', message: 'Allocation request rejected.' });
    }
    setDecisionModal({ open: false, allocation: null, action: '' });
    setDecisionNote('');
    setTimeout(() => setFeedback({ type: '', message: '' }), 3000);
  };

  const statusConfig = {
    pending: { color: 'warning', label: 'Pending' },
    approved: { color: 'success', label: 'Approved' },
    rejected: { color: 'danger', label: 'Rejected' },
    cancelled: { color: 'default', label: 'Cancelled' },
    reassigned: { color: 'info', label: 'Reassigned' },
  };

  const tabs = [
    { key: 'pending', label: 'Pending', count: pendingCount },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
    { key: 'all', label: 'All' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mentor Requests"
        subtitle="Review and approve mentor allocation requests from your mentees."
        breadcrumbs={['Coordinator', 'Mentor Requests']}
      >
        {pendingCount > 0 && (
          <Badge variant="warning" size="md">
            <Clock className="w-3.5 h-3.5" />
            {pendingCount} Awaiting Review
          </Badge>
        )}
      </PageHeader>

      {/* Feedback Banner */}
      {feedback.message && (
        <div className={`p-3 rounded-xl border text-sm font-medium flex items-center gap-2 ${
          feedback.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <CheckCircle2 className="w-4 h-4" />
          {feedback.message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-navy-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Request Cards */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((alloc) => {
            const cfg = statusConfig[alloc.status] || statusConfig.pending;
            return (
              <div
                key={alloc.id}
                className={`bg-white rounded-2xl border p-5 transition-colors ${
                  alloc.status === 'pending' ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Mentee + Mentor Info */}
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="flex -space-x-3">
                      <Avatar user={alloc.mentee} size="md" className="ring-2 ring-white" />
                      <Avatar user={alloc.mentor} size="md" className="ring-2 ring-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-navy-900">
                          {alloc.mentee?.name || 'Unknown'}
                        </h4>
                        <span className="text-slate-400 text-xs">→</span>
                        <span className="text-sm font-semibold text-brand-700">
                          {alloc.mentor?.name || 'Unknown'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                        <Tag className="w-3 h-3" />
                        {alloc.method === 'self_selected' ? 'Mentee Request' : 'Direct Assignment'}
                        <span>•</span>
                        <Calendar className="w-3 h-3" />
                        {new Date(alloc.createdAt).toLocaleDateString()}
                      </div>
                      {alloc.requestMessage && (
                        <div className="flex items-start gap-1.5 mt-2">
                          <MessageSquare className="w-3 h-3 text-slate-400 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-slate-600 leading-relaxed italic line-clamp-2">
                            "{alloc.requestMessage}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status + Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant={cfg.color} size="sm">{cfg.label}</Badge>
                    {alloc.status === 'pending' && (
                      <>
                        <Button
                          variant="primary"
                          size="xs"
                          onClick={() =>
                            setDecisionModal({ open: true, allocation: alloc, action: 'approve' })
                          }
                          icon={CheckCircle2}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() =>
                            setDecisionModal({ open: true, allocation: alloc, action: 'reject' })
                          }
                          className="text-rose-600 hover:bg-rose-50"
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Decision Note for already-decided */}
                {alloc.decisionNote && alloc.status !== 'pending' && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-start gap-2">
                      <UserCheck className="w-3.5 h-3.5 text-brand-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-slate-600">
                        <span className="font-semibold text-slate-700">Decision Note:</span>{' '}
                        {alloc.decisionNote}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-navy-900 mb-1">No Requests Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {activeTab === 'pending'
              ? 'No pending mentor allocation requests at this time.'
              : `No ${activeTab} requests found.`}
          </p>
        </div>
      )}

      {/* Approve / Reject Decision Modal */}
      <Modal
        open={decisionModal.open}
        onClose={() => { setDecisionModal({ open: false, allocation: null, action: '' }); setDecisionNote(''); }}
        title={decisionModal.action === 'approve' ? 'Approve Allocation' : 'Reject Allocation'}
        size="md"
      >
        {decisionModal.allocation && (
          <div className="space-y-4 text-xs">
            <div className={`p-3 rounded-xl border ${
              decisionModal.action === 'approve'
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-rose-50 border-rose-200'
            }`}>
              <div className="flex items-center gap-3">
                <Avatar user={decisionModal.allocation.mentee} size="sm" />
                <div>
                  <p className="font-bold text-navy-900">{decisionModal.allocation.mentee?.name}</p>
                  <p className="text-slate-500">requests mentor</p>
                </div>
                <span className="text-slate-400">→</span>
                <Avatar user={decisionModal.allocation.mentor} size="sm" />
                <div>
                  <p className="font-bold text-navy-900">{decisionModal.allocation.mentor?.name}</p>
                  <p className="text-slate-500">{decisionModal.allocation.mentor?.title}</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Decision Note (Optional)
              </label>
              <textarea
                rows={3}
                value={decisionNote}
                onChange={(e) => setDecisionNote(e.target.value)}
                placeholder="Add a note about your decision..."
                className="w-full p-3 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => { setDecisionModal({ open: false, allocation: null, action: '' }); setDecisionNote(''); }}
              >
                Cancel
              </Button>
              <Button
                variant={decisionModal.action === 'approve' ? 'success' : 'danger'}
                size="sm"
                onClick={handleDecision}
                icon={decisionModal.action === 'approve' ? CheckCircle2 : XCircle}
              >
                {decisionModal.action === 'approve' ? 'Approve' : 'Reject'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
