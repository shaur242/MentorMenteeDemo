import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Star,
  RefreshCw,
  UserCheck,
  CheckCircle2,
  Calendar,
  Building,
  Briefcase,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

export default function HODMentorsPage() {
  const { mentors, coordinators, assignMentorToCoordinator, sessions, connections } = useApp();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCoordId, setFilterCoordId] = useState('all');

  // Reassignment Modal State
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [targetCoordId, setTargetCoordId] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  const filteredMentors = useMemo(() => {
    return mentors.filter((m) => {
      if (filterCoordId !== 'all' && m.coordinatorId !== filterCoordId) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = m.name?.toLowerCase().includes(q);
        const matchTitle = m.title?.toLowerCase().includes(q);
        const matchExpertise = m.areasOfExpertise?.some((e) => e.toLowerCase().includes(q));
        return matchName || matchTitle || matchExpertise;
      }
      return true;
    });
  }, [mentors, filterCoordId, searchQuery]);

  const handleOpenReassign = (mentor) => {
    setSelectedMentor(mentor);
    const otherCoords = coordinators.filter((c) => c.id !== mentor.coordinatorId);
    setTargetCoordId(otherCoords[0]?.id || coordinators[0]?.id || '');
    setSuccessNotice('');
    setReassignModalOpen(true);
  };

  const handleExecuteReassign = () => {
    if (!selectedMentor || !targetCoordId) return;
    const res = assignMentorToCoordinator(selectedMentor.id, targetCoordId);
    if (res.success) {
      const target = coordinators.find((c) => c.id === targetCoordId);
      setSuccessNotice(`Successfully reassigned ${selectedMentor.name} to ${target?.name}!`);
      setTimeout(() => {
        setReassignModalOpen(false);
        setSuccessNotice('');
      }, 1000);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Department Faculty Mentors"
        subtitle="Department-wide overview and coordinator group assignments"
        breadcrumbs={['HOD', 'Mentors']}
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
            placeholder="Search by mentor or expertise..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Mentors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredMentors.map((mentor) => {
          const assignedCoord = coordinators.find((c) => c.id === mentor.coordinatorId);
          const mentorSessionsCount = sessions.filter((s) => s.mentorId === mentor.id).length;
          const activeMenteesCount = connections.filter(
            (c) =>
              c.status === 'accepted' &&
              (c.recipientId === mentor.id || c.requesterId === mentor.id)
          ).length;

          return (
            <div
              key={mentor.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <Avatar user={mentor} size="lg" />
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-navy-900 truncate">{mentor.name}</h3>
                      <p className="text-xs text-slate-500 truncate">{mentor.title}</p>
                      <p className="text-xs text-brand-600 font-medium truncate mt-0.5">
                        {mentor.department}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-lg flex-shrink-0">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {mentor.rating} ({mentor.totalReviews})
                  </div>
                </div>

                {/* Coordinator Tag */}
                <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 mb-4 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block">
                      Coordinator Group
                    </span>
                    <span className="font-bold text-navy-900">
                      {assignedCoord?.name || mentor.coordinatorName || 'Unassigned'}
                    </span>
                    <span className="text-[11px] text-brand-600 ml-1">
                      ({assignedCoord?.cohort || 'Cohort'})
                    </span>
                  </div>
                  <Badge variant={assignedCoord?.status === 'active' ? 'success' : 'neutral'} size="xs">
                    {assignedCoord?.status === 'active' ? 'Active Group' : 'Inactive Group'}
                  </Badge>
                </div>

                {/* Expertise tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {mentor.areasOfExpertise?.slice(0, 3).map((exp, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[10px]"
                    >
                      {exp}
                    </span>
                  ))}
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-3 gap-2 text-center p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div>
                    <span className="block font-black text-navy-900">{activeMenteesCount}</span>
                    <span className="text-[10px] text-slate-400">Active Mentees</span>
                  </div>
                  <div>
                    <span className="block font-black text-navy-900">{mentorSessionsCount}</span>
                    <span className="text-[10px] text-slate-400">Total Sessions</span>
                  </div>
                  <div>
                    <span className="block font-black text-navy-900">
                      {mentor.yearsOfExperience} yrs
                    </span>
                    <span className="text-[10px] text-slate-400">Experience</span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <Button
                  variant="secondary"
                  size="xs"
                  onClick={() => handleOpenReassign(mentor)}
                  icon={RefreshCw}
                >
                  Reassign Coordinator
                </Button>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => navigate(`/hod/mentors/${mentor.id}`)}
                  icon={ExternalLink}
                >
                  View Profile
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reassign Mentor Modal */}
      <Modal
        open={reassignModalOpen}
        onClose={() => setReassignModalOpen(false)}
        title={`Reassign Coordinator for ${selectedMentor?.name}`}
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Select a new coordinator to manage this mentor. The mentor's existing sessions,
            ratings, and reviews will remain completely preserved.
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
