import React, { useMemo, useState } from 'react';
import {
  Layers,
  Search,
  Filter,
  CheckCircle2,
  RefreshCw,
  UserCheck,
  Tag,
  Calendar,
  Building,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

export default function CoordAllocationsPage() {
  const {
    currentUser,
    getCoordinatorAllocations,
    getCoordinatorMentors,
    getMentorById,
    getUserById,
    reassignMentor,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMethod, setFilterMethod] = useState('all');
  const [reassignModal, setReassignModal] = useState({ open: false, allocation: null });
  const [newMentorId, setNewMentorId] = useState('');
  const [reassignNote, setReassignNote] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const cohortMentors = useMemo(
    () => (currentUser ? getCoordinatorMentors(currentUser.id) : []),
    [currentUser, getCoordinatorMentors]
  );

  const cohortAllocations = useMemo(() => {
    if (!currentUser) return [];
    return getCoordinatorAllocations(currentUser.id).map((a) => ({
      ...a,
      mentor: getMentorById(a.mentorId),
      mentee: getUserById(a.menteeId),
    }));
  }, [currentUser, getCoordinatorAllocations, getMentorById, getUserById]);

  // Active allocations only for the main table (status === 'approved')
  const activeAllocations = useMemo(() => {
    return cohortAllocations.filter((a) => a.status === 'approved');
  }, [cohortAllocations]);

  const filteredAllocations = useMemo(() => {
    return activeAllocations.filter((a) => {
      if (filterMethod !== 'all' && a.method !== filterMethod) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const menteeMatch = a.mentee?.name?.toLowerCase().includes(q);
        const mentorMatch = a.mentor?.name?.toLowerCase().includes(q);
        return menteeMatch || mentorMatch;
      }
      return true;
    });
  }, [activeAllocations, filterMethod, searchQuery]);

  const handleReassign = (e) => {
    e.preventDefault();
    if (!newMentorId || !reassignModal.allocation) return;

    const res = reassignMentor({
      menteeId: reassignModal.allocation.menteeId,
      newMentorId,
      coordinatorId: currentUser.id,
      note: reassignNote,
    });

    if (res.success) {
      setFeedback({ type: 'success', message: 'Mentor reassigned successfully.' });
    } else {
      setFeedback({ type: 'error', message: res.error || 'Reassignment failed.' });
    }

    setReassignModal({ open: false, allocation: null });
    setNewMentorId('');
    setReassignNote('');
    setTimeout(() => setFeedback({ type: '', message: '' }), 3000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Current Allocations"
        subtitle="Active mentor–mentee pairings within your assigned cohort."
        breadcrumbs={['Coordinator', 'Current Allocations']}
      >
        <Badge variant="navy" size="md">
          {activeAllocations.length} Active Pairings
        </Badge>
      </PageHeader>

      {feedback.message && (
        <div
          className={`p-3 rounded-xl border text-sm font-medium flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          {feedback.message}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search mentee or mentor..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Method:</span>
          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Methods</option>
            <option value="self_selected">Mentee Requested</option>
            <option value="coordinator_assigned">Coordinator Assigned</option>
          </select>
        </div>
      </div>

      {/* Allocations Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Mentee</th>
                <th className="py-3.5 px-4">Assigned Mentor</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4">Assigned Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredAllocations.length > 0 ? (
                filteredAllocations.map((alloc) => (
                  <tr key={alloc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <Avatar user={alloc.mentee} size="sm" />
                        <div>
                          <p className="font-bold text-navy-900">{alloc.mentee?.name}</p>
                          <p className="text-[11px] text-slate-400">{alloc.mentee?.year}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <Avatar user={alloc.mentor} size="sm" />
                        <div>
                          <p className="font-bold text-navy-900">{alloc.mentor?.name}</p>
                          <p className="text-[11px] text-slate-400">{alloc.mentor?.title}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={alloc.method === 'self_selected' ? 'info' : 'default'}
                        size="sm"
                      >
                        <Tag className="w-3 h-3" />
                        {alloc.method === 'self_selected' ? 'Self Selected' : 'Assigned'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(alloc.decidedAt || alloc.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={() => setReassignModal({ open: true, allocation: alloc })}
                        icon={RefreshCw}
                      >
                        Reassign
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No active allocations matching your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reassign Mentor Modal */}
      <Modal
        open={reassignModal.open}
        onClose={() => setReassignModal({ open: false, allocation: null })}
        title="Reassign Mentee Mentor"
        size="md"
      >
        {reassignModal.allocation && (
          <form onSubmit={handleReassign} className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Mentee
              </p>
              <div className="flex items-center gap-2.5">
                <Avatar user={reassignModal.allocation.mentee} size="sm" />
                <div>
                  <p className="font-bold text-navy-900">{reassignModal.allocation.mentee?.name}</p>
                  <p className="text-slate-500">
                    Currently with: <strong>{reassignModal.allocation.mentor?.name}</strong>
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select New Faculty Mentor
              </label>
              <select
                value={newMentorId}
                onChange={(e) => setNewMentorId(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="">-- Choose New Mentor --</option>
                {cohortMentors
                  .filter((m) => m.id !== reassignModal.allocation.mentorId)
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} – {m.title} ({m.rating}★)
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reassignment Reason / Note
              </label>
              <textarea
                rows={2}
                value={reassignNote}
                onChange={(e) => setReassignNote(e.target.value)}
                placeholder="Reason for transferring mentee to another faculty mentor..."
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="secondary"
                size="sm"
                type="button"
                onClick={() => setReassignModal({ open: false, allocation: null })}
              >
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" icon={RefreshCw}>
                Confirm Reassignment
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
