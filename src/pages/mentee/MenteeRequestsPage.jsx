import React, { useMemo, useState } from 'react';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
  X,
  UserCheck,
  Calendar,
  Tag,
  MessageSquare,
  Search,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function MenteeRequestsPage() {
  const {
    currentUser,
    getMenteeAllocations,
    getMentorById,
    getCoordinatorById,
    cancelAllocationRequest,
  } = useApp();

  const [activeTab, setActiveTab] = useState('all');
  const [confirmDialog, setConfirmDialog] = useState({ open: false, allocationId: null });

  const allAllocations = useMemo(
    () => (currentUser ? getMenteeAllocations(currentUser.id) : []),
    [currentUser, getMenteeAllocations]
  );

  const enriched = useMemo(
    () =>
      allAllocations.map((a) => ({
        ...a,
        mentor: getMentorById(a.mentorId),
        coordinator: getCoordinatorById(a.coordinatorId),
      })),
    [allAllocations, getMentorById, getCoordinatorById]
  );

  const filtered = useMemo(() => {
    if (activeTab === 'all') return enriched;
    return enriched.filter((a) => a.status === activeTab);
  }, [enriched, activeTab]);

  const counts = useMemo(() => {
    const c = { all: enriched.length, pending: 0, approved: 0, rejected: 0, cancelled: 0, reassigned: 0 };
    enriched.forEach((a) => { if (c[a.status] !== undefined) c[a.status]++; });
    return c;
  }, [enriched]);

  const handleCancel = () => {
    if (confirmDialog.allocationId) {
      cancelAllocationRequest(confirmDialog.allocationId);
    }
    setConfirmDialog({ open: false, allocationId: null });
  };

  const statusConfig = {
    pending: { icon: Clock, color: 'warning', label: 'Pending Review' },
    approved: { icon: CheckCircle2, color: 'success', label: 'Approved' },
    rejected: { icon: XCircle, color: 'danger', label: 'Rejected' },
    cancelled: { icon: X, color: 'default', label: 'Cancelled' },
    reassigned: { icon: UserCheck, color: 'info', label: 'Reassigned' },
  };

  const tabs = [
    { key: 'all', label: 'All Requests' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Requests"
        subtitle="Track your mentor allocation requests and their approval status."
        breadcrumbs={['Mentee', 'My Requests']}
      >
        <Badge variant="navy" size="md">
          {counts.pending} Pending
        </Badge>
      </PageHeader>

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
            <span className="ml-1.5 text-[10px] text-slate-400">({counts[tab.key]})</span>
          </button>
        ))}
      </div>

      {/* Request Cards */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((alloc) => {
            const cfg = statusConfig[alloc.status] || statusConfig.pending;
            const StatusIcon = cfg.icon;
            return (
              <div
                key={alloc.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-slate-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Mentor Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar user={alloc.mentor} size="lg" className="ring-2 ring-slate-100 flex-shrink-0" />
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-navy-900 truncate">
                        {alloc.mentor?.name || 'Unknown Mentor'}
                      </h4>
                      <p className="text-xs text-slate-500 truncate">
                        {alloc.mentor?.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                        <Tag className="w-3 h-3" />
                        {alloc.method === 'self_selected' ? 'Self Selected' : 'Coordinator Assigned'}
                        <span>•</span>
                        <Calendar className="w-3 h-3" />
                        {new Date(alloc.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Status + Action */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge variant={cfg.color} size="sm">
                      <StatusIcon className="w-3 h-3" />
                      {cfg.label}
                    </Badge>
                    {alloc.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() =>
                          setConfirmDialog({ open: true, allocationId: alloc.id })
                        }
                        className="text-rose-600 hover:bg-rose-50"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>

                {/* Request Message & Decision Note */}
                {(alloc.requestMessage || alloc.decisionNote) && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                    {alloc.requestMessage && (
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-slate-600 leading-relaxed">
                          <span className="font-semibold text-slate-700">Your message:</span>{' '}
                          {alloc.requestMessage}
                        </p>
                      </div>
                    )}
                    {alloc.decisionNote && (
                      <div className="flex items-start gap-2">
                        <UserCheck className="w-3.5 h-3.5 text-brand-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-slate-600 leading-relaxed">
                          <span className="font-semibold text-brand-700">Coordinator:</span>{' '}
                          {alloc.decisionNote}
                        </p>
                      </div>
                    )}
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
            {activeTab === 'all'
              ? 'You have not submitted any mentor allocation requests yet. Visit Find Mentors to get started.'
              : `No ${activeTab} requests found.`}
          </p>
        </div>
      )}

      <ConfirmDialog
        open={confirmDialog.open}
        title="Cancel Request"
        message="Are you sure you want to cancel this mentor allocation request? This action cannot be undone."
        onConfirm={handleCancel}
        onCancel={() => setConfirmDialog({ open: false, allocationId: null })}
        danger
      />
    </div>
  );
}
