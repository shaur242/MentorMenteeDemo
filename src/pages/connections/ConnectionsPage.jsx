import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  UserPlus,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  MessageSquare,
  ArrowRight,
  ShieldAlert,
  Search,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function ConnectionsPage() {
  const {
    currentUser,
    currentRole,
    connections,
    getUserById,
    acceptConnectionRequest,
    rejectConnectionRequest,
    cancelConnectionRequest,
    removeConnection,
  } = useApp();
  const navigate = useNavigate();

  // Tab State: Mentee defaults to 'active', Mentor defaults to 'incoming' if has pending requests
  const isMentor = currentRole === 'Mentor';
  const isMentee = currentRole === 'Mentee';
  const isCoordOrHod = currentRole === 'Coordinator' || currentRole === 'HOD';

  const [activeTab, setActiveTab] = useState(() => (isMentor ? 'incoming' : 'active'));
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', message: '', action: null });

  // ── Mentee Data Slices ──────────────────────────────────────────────────
  // Active connections where mentee is requester or recipient, and status is accepted
  const menteeActiveConnections = connections
    .filter(
      (c) =>
        c.status === 'accepted' &&
        (c.requesterId === currentUser?.id || c.recipientId === currentUser?.id)
    )
    .map((c) => {
      const partnerId = c.requesterId === currentUser?.id ? c.recipientId : c.requesterId;
      return { ...c, partner: getUserById(partnerId) };
    });

  // Sent requests by mentee
  const menteeSentRequests = connections
    .filter((c) => c.requesterId === currentUser?.id)
    .map((c) => ({ ...c, partner: getUserById(c.recipientId) }));

  // ── Mentor Data Slices ──────────────────────────────────────────────────
  // Incoming requests waiting for mentor response
  const mentorIncomingRequests = connections
    .filter((c) => c.recipientId === currentUser?.id && c.status === 'pending')
    .map((c) => ({ ...c, partner: getUserById(c.requesterId) }));

  // Active connections for mentor
  const mentorActiveConnections = connections
    .filter(
      (c) =>
        c.status === 'accepted' &&
        (c.recipientId === currentUser?.id || c.requesterId === currentUser?.id)
    )
    .map((c) => {
      const partnerId = c.recipientId === currentUser?.id ? c.requesterId : c.recipientId;
      return { ...c, partner: getUserById(partnerId) };
    });

  // History for mentor (accepted or rejected)
  const mentorHistory = connections
    .filter((c) => c.recipientId === currentUser?.id && c.status !== 'pending')
    .map((c) => ({ ...c, partner: getUserById(c.requesterId) }));

  // ── Department / Scope (HOD / Coordinator) ────────────────────────
  const allScopedConnections = connections
    .map((c) => ({
      ...c,
      requester: getUserById(c.requesterId),
      recipient: getUserById(c.recipientId),
    }))
    .filter((c) => {
      // Coordinator access control: restrict to records in their group
      if (currentRole === 'Coordinator') {
        const isRequesterInGroup = c.requester?.coordinatorId === currentUser?.id;
        const isRecipientInGroup = c.recipient?.coordinatorId === currentUser?.id;
        if (!isRequesterInGroup && !isRecipientInGroup) return false;
      }
      return true;
    })
    .filter((c) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        c.requester?.name?.toLowerCase().includes(q) ||
        c.recipient?.name?.toLowerCase().includes(q) ||
        c.status?.toLowerCase().includes(q)
      );
    });

  // Handlers
  const handleAccept = (connectionId) => {
    acceptConnectionRequest(connectionId);
  };

  const handleReject = (connectionId) => {
    rejectConnectionRequest(connectionId);
  };

  const handleCancelRequest = (connectionId) => {
    setConfirmDialog({
      open: true,
      title: 'Cancel Connection Request?',
      message: 'Are you sure you want to withdraw this connection request?',
      action: () => cancelConnectionRequest(connectionId),
    });
  };

  const handleRemoveConnection = (connectionId, partnerName) => {
    setConfirmDialog({
      open: true,
      title: 'Remove Connection?',
      message: `Are you sure you want to remove the connection with ${partnerName}? Scheduled sessions will not be deleted.`,
      action: () => removeConnection(connectionId),
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title="Connections & Requests"
        subtitle="Manage 1-on-1 mentor–mentee relationships, review incoming requests, and connect with academic peers."
        breadcrumbs={[currentRole || 'User', 'Connections']}
      >
        {isMentee && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/mentee/find-mentors')}
            icon={UserPlus}
          >
            Find New Mentors
          </Button>
        )}
      </PageHeader>

      {/* ── MENTEE VIEW ─────────────────────────────────────────────────── */}
      {isMentee && (
        <div className="space-y-6">
          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 gap-6">
            <button
              onClick={() => setActiveTab('active')}
              className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'active'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Active Connections ({menteeActiveConnections.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'sent'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Sent Requests ({menteeSentRequests.length})</span>
            </button>
          </div>

          {/* Tab 1: Active Connections */}
          {activeTab === 'active' && (
            <div>
              {menteeActiveConnections.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {menteeActiveConnections.map((conn) => (
                    <div
                      key={conn.id}
                      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar user={conn.partner} size="lg" />
                          <div>
                            <h4 className="text-sm font-bold text-navy-900">{conn.partner?.name}</h4>
                            <p className="text-xs text-brand-700 font-medium">{conn.partner?.title}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {conn.partner?.department} · {conn.partner?.company}
                            </p>
                          </div>
                        </div>
                        <Badge variant="success" size="sm">Connected</Badge>
                      </div>

                      <div className="text-[11px] text-slate-500 mb-4 p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <span>Connected since {new Date(conn.updatedAt).toLocaleDateString()}</span>
                        <span className="font-semibold text-slate-700">1-on-1 Eligible</span>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                        <Button
                          variant="secondary"
                          size="xs"
                          onClick={() => handleRemoveConnection(conn.id, conn.partner?.name)}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          Remove
                        </Button>
                        <div className="flex gap-2">
                          <Button
                            variant="secondary"
                            size="xs"
                            onClick={() => navigate(`/mentee/mentors/${conn.partner?.id}`)}
                          >
                            View Profile
                          </Button>
                          <Button
                            variant="primary"
                            size="xs"
                            onClick={() => navigate(`/mentee/sessions?bookMentorId=${conn.partner?.id}`)}
                            icon={Calendar}
                          >
                            Book Session
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                  <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-navy-900">No active mentor connections yet</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5 leading-relaxed">
                    Browse the verified faculty directory, explore research areas, and send connection requests to begin mentorship sessions.
                  </p>
                  <Button variant="primary" size="sm" onClick={() => navigate('/mentee/find-mentors')} icon={UserPlus}>
                    Browse Mentors Directory
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Sent Requests */}
          {activeTab === 'sent' && (
            <div className="space-y-3">
              {menteeSentRequests.length > 0 ? (
                menteeSentRequests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar user={req.partner} size="md" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-navy-900">{req.partner?.name}</h4>
                          <Badge
                            variant={
                              req.status === 'accepted'
                                ? 'success'
                                : req.status === 'pending'
                                ? 'warning'
                                : 'danger'
                            }
                            size="sm"
                          >
                            {req.status === 'pending' ? 'Pending Mentor Review' : req.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {req.partner?.title} · {req.partner?.department}
                        </p>
                        {req.note && (
                          <p className="text-[11px] text-slate-600 italic mt-1 bg-slate-50 p-1.5 rounded border border-slate-100 max-w-lg">
                            "{req.note}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                      <span className="text-[10px] text-slate-400 mr-2">
                        Sent {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                      {req.status === 'pending' && (
                        <Button
                          variant="secondary"
                          size="xs"
                          onClick={() => handleCancelRequest(req.id)}
                          className="text-rose-600 hover:bg-rose-50 border-rose-200"
                        >
                          Cancel Request
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => navigate(`/mentee/mentors/${req.partner?.id}`)}
                      >
                        View Profile
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500">
                  No sent requests found.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── MENTOR VIEW ─────────────────────────────────────────────────── */}
      {isMentor && (
        <div className="space-y-6">
          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 gap-6">
            <button
              onClick={() => setActiveTab('incoming')}
              className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'incoming'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Incoming Requests</span>
              {mentorIncomingRequests.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                  {mentorIncomingRequests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'active'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Connected Mentees ({mentorActiveConnections.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'history'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Past Requests</span>
            </button>
          </div>

          {/* Tab 1: Incoming Requests (Actionable: Accept / Reject) */}
          {activeTab === 'incoming' && (
            <div className="space-y-4">
              {mentorIncomingRequests.length > 0 ? (
                mentorIncomingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar user={req.partner} size="lg" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-navy-900">{req.partner?.name}</h4>
                          <Badge role="Mentee" size="sm">
                            {req.partner?.year || 'Undergraduate'}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {req.partner?.department} · Email: {req.partner?.email}
                        </p>
                        {req.note && (
                          <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                            <span className="font-semibold text-navy-900 block mb-0.5">Student Note:</span>
                            "{req.note}"
                          </div>
                        )}
                        <p className="text-[10px] text-slate-400 mt-2">
                          Received on {new Date(req.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-center pt-2 md:pt-0">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleReject(req.id)}
                        icon={XCircle}
                        className="text-rose-600 hover:bg-rose-50 border-rose-200"
                      >
                        Decline
                      </Button>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleAccept(req.id)}
                        icon={CheckCircle2}
                      >
                        Accept Connection
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-navy-900">All caught up!</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                    You have no pending connection requests from students at this time.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Connected Mentees */}
          {activeTab === 'active' && (
            <div>
              {mentorActiveConnections.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mentorActiveConnections.map((conn) => (
                    <div
                      key={conn.id}
                      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar user={conn.partner} size="lg" />
                          <div>
                            <h4 className="text-sm font-bold text-navy-900">{conn.partner?.name}</h4>
                            <p className="text-xs text-slate-500">{conn.partner?.year || conn.partner?.department}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">{conn.partner?.email}</p>
                          </div>
                        </div>
                        <Badge variant="success" size="sm">Active</Badge>
                      </div>

                      {conn.partner?.goals && (
                        <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mb-4 line-clamp-2">
                          <strong className="text-slate-700">Mentee Goals:</strong> {conn.partner.goals}
                        </p>
                      )}

                      <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs">
                        <button
                          onClick={() => handleRemoveConnection(conn.id, conn.partner?.name)}
                          className="text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          Remove
                        </button>
                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="primary"
                            size="xs"
                            onClick={() => navigate(`/mentor/sessions?bookMenteeId=${conn.partner?.id}`)}
                            icon={Calendar}
                          >
                            Book Session
                          </Button>
                          <Button
                            variant="secondary"
                            size="xs"
                            onClick={() => navigate(`/mentor/sessions?menteeId=${conn.partner?.id}`)}
                          >
                            Sessions
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500">
                  No active mentees connected currently.
                </div>
              )}
            </div>
          )}

          {/* Tab 3: History */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              {mentorHistory.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-slate-200 p-3.5 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <Avatar user={item.partner} size="sm" />
                    <div>
                      <span className="font-bold text-navy-900">{item.partner?.name}</span>
                      <span className="text-slate-400 ml-2">({item.partner?.department})</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-400">
                      {new Date(item.updatedAt).toLocaleDateString()}
                    </span>
                    <Badge variant={item.status === 'accepted' ? 'success' : 'danger'} size="sm">
                      {item.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── HOD / COORDINATOR VIEW ──────────────────────────────── */}
      {isCoordOrHod && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search mentor or mentee name..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div className="text-xs text-slate-500">
              Total Recorded Connections: <strong className="text-navy-900">{allScopedConnections.length}</strong>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="p-3.5">Mentee (Requester)</th>
                    <th className="p-3.5">Mentor (Recipient)</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Date Created</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {allScopedConnections.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60">
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <Avatar user={item.requester} size="xs" />
                          <span className="font-semibold text-navy-900">{item.requester?.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <Avatar user={item.recipient} size="xs" />
                          <span className="font-semibold text-navy-900">{item.recipient?.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <Badge
                          variant={
                            item.status === 'accepted'
                              ? 'success'
                              : item.status === 'pending'
                              ? 'warning'
                              : 'danger'
                          }
                          size="sm"
                        >
                          {item.status}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-slate-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3.5 text-right">
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => navigate(`/mentee/mentors/${item.recipientId}`)}
                        >
                          View Mentor
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, title: '', message: '', action: null })}
        onConfirm={confirmDialog.action}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel="Confirm"
        danger
      />
    </div>
  );
}
