import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  RefreshCw,
  UserCheck,
  CheckCircle2,
  Calendar,
  GraduationCap,
  Layers,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

export default function HODMenteesPage() {
  const { mentees, mentors, coordinators, assignMenteeToCoordinator, sessions } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCoordId, setFilterCoordId] = useState('all');

  // Reassignment Modal State
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [selectedMentee, setSelectedMentee] = useState(null);
  const [targetCoordId, setTargetCoordId] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  const filteredMentees = useMemo(() => {
    return mentees.filter((m) => {
      if (filterCoordId !== 'all' && m.coordinatorId !== filterCoordId) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = m.name?.toLowerCase().includes(q);
        const matchEmail = m.email?.toLowerCase().includes(q);
        const matchYear = m.year?.toLowerCase().includes(q);
        return matchName || matchEmail || matchYear;
      }
      return true;
    });
  }, [mentees, filterCoordId, searchQuery]);

  const handleOpenReassign = (mentee) => {
    setSelectedMentee(mentee);
    const otherCoords = coordinators.filter((c) => c.id !== mentee.coordinatorId);
    setTargetCoordId(otherCoords[0]?.id || coordinators[0]?.id || '');
    setSuccessNotice('');
    setReassignModalOpen(true);
  };

  const handleExecuteReassign = () => {
    if (!selectedMentee || !targetCoordId) return;
    const res = assignMenteeToCoordinator(selectedMentee.id, targetCoordId);
    if (res.success) {
      const target = coordinators.find((c) => c.id === targetCoordId);
      setSuccessNotice(`Successfully reassigned ${selectedMentee.name} to ${target?.name}!`);
      setTimeout(() => {
        setReassignModalOpen(false);
        setSuccessNotice('');
      }, 1000);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Department Mentees Directory"
        subtitle="Department-wide overview of all student mentees and assigned coordinator cohorts"
        breadcrumbs={['HOD', 'Mentees']}
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-semibold text-slate-500">Coordinator:</label>
          <select
            value={filterCoordId}
            onChange={(e) => setFilterCoordId(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 bg-white"
          >
            <option value="all">All Coordinators</option>
            {coordinators.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.cohort})
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name or year..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Mentees Table Card */}
      <Card
        title={`All Enrolled Mentees (${filteredMentees.length})`}
        subtitle="Students distributed across department coordinator cohorts"
        noPad
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Student Name</th>
                <th className="px-5 py-3">Academic Year & Dept</th>
                <th className="px-5 py-3">Coordinator Group</th>
                <th className="px-5 py-3">Allocated Mentor</th>
                <th className="px-5 py-3">Sessions</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMentees.map((mentee) => {
                const assignedCoord = coordinators.find((c) => c.id === mentee.coordinatorId);
                const allocatedMentor = mentors.find((m) => m.id === mentee.mentorId);
                const menteeSessionsCount = sessions.filter((s) => s.menteeId === mentee.id).length;

                return (
                  <tr key={mentee.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar user={mentee} size="sm" />
                        <div>
                          <p className="font-bold text-navy-900">{mentee.name}</p>
                          <p className="text-[11px] text-slate-400">{mentee.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-slate-800">{mentee.year}</p>
                      <p className="text-[11px] text-slate-400">{mentee.department}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-navy-900 block">
                        {assignedCoord?.name || mentee.coordinatorName || 'Unassigned'}
                      </span>
                      <span className="text-[11px] text-brand-600 block">
                        {assignedCoord?.cohort || 'General'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {allocatedMentor ? (
                        <div className="flex items-center gap-2">
                          <Avatar user={allocatedMentor} size="xs" />
                          <div>
                            <span className="font-medium text-slate-800 block">
                              {allocatedMentor.name}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {allocatedMentor.title}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <Badge variant="neutral" size="xs">
                          Not Allocated
                        </Badge>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-navy-900">{menteeSessionsCount}</span>
                      <span className="text-slate-400 text-[11px]"> booked</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={() => handleOpenReassign(mentee)}
                        icon={RefreshCw}
                      >
                        Reassign
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {filteredMentees.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-5 py-8 text-center text-slate-400">
                    No student mentees found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Reassign Mentee Modal */}
      <Modal
        open={reassignModalOpen}
        onClose={() => setReassignModalOpen(false)}
        title={`Reassign Coordinator for ${selectedMentee?.name}`}
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Select a new coordinator to manage this mentee. Their historical session records,
            goals, and mentor connections will remain fully intact.
          </p>

          {successNotice && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successNotice}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assign to Coordinator <span className="text-rose-500">*</span>
            </label>
            <select
              value={targetCoordId}
              onChange={(e) => setTargetCoordId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            >
              {coordinators.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.cohort} ({c.status === 'active' ? 'Active' : 'Inactive'})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" size="sm" onClick={() => setReassignModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleExecuteReassign}
              disabled={!targetCoordId}
              icon={RefreshCw}
            >
              Save Reassignment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
