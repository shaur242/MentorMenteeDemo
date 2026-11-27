import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  UserCheck,
  Calendar,
  GraduationCap,
  Layers,
  ArrowRight,
  BookOpen,
  Target,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

export default function CoordMenteesPage() {
  const { currentUser, getCoordinatorMentees, mentors, sessions, connections } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterAllocation, setFilterAllocation] = useState('all'); // 'all' | 'assigned' | 'unassigned'

  // Profile Modal State
  const [selectedMentee, setSelectedMentee] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // STRICT ACCESS CONTROL: Only mentees belonging to logged-in coordinator
  const myMentees = useMemo(() => {
    return getCoordinatorMentees(currentUser?.id);
  }, [getCoordinatorMentees, currentUser]);

  const filteredMentees = useMemo(() => {
    return myMentees.filter((m) => {
      const hasMentor = !!m.mentorId;
      if (filterAllocation === 'assigned' && !hasMentor) return false;
      if (filterAllocation === 'unassigned' && hasMentor) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = m.name?.toLowerCase().includes(q);
        const matchEmail = m.email?.toLowerCase().includes(q);
        const matchYear = m.year?.toLowerCase().includes(q);
        const matchGoals = m.goals?.toLowerCase().includes(q);
        return matchName || matchEmail || matchYear || matchGoals;
      }
      return true;
    });
  }, [myMentees, filterAllocation, searchQuery]);

  const handleOpenDetails = (mentee) => {
    setSelectedMentee(mentee);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Cohort Mentees"
        subtitle={`Students registered under ${currentUser?.cohort || 'your cohort group'} (${myMentees.length} Mentees)`}
        breadcrumbs={['Coordinator', 'My Mentees']}
      >
        <Badge variant="primary" size="lg" dot>
          {currentUser?.cohort || 'Cohort Group'}
        </Badge>
      </PageHeader>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterAllocation('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterAllocation === 'all'
                ? 'bg-navy-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Mentees ({myMentees.length})
          </button>
          <button
            onClick={() => setFilterAllocation('assigned')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterAllocation === 'assigned'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Assigned Mentor ({myMentees.filter((m) => !!m.mentorId).length})
          </button>
          <button
            onClick={() => setFilterAllocation('unassigned')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterAllocation === 'unassigned'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Seeking Mentor ({myMentees.filter((m) => !m.mentorId).length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search mentees by name, goal, or year..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Mentees Table Card */}
      <Card
        title={`Mentees in Your Cohort (${filteredMentees.length})`}
        subtitle="Individual academic progress and mentorship status"
        noPad
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Student Name</th>
                <th className="px-5 py-3">Academic Stage</th>
                <th className="px-5 py-3">Allocated Faculty Mentor</th>
                <th className="px-5 py-3">Mentoring Goals</th>
                <th className="px-5 py-3">Sessions</th>
                <th className="px-5 py-3 text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMentees.map((mentee) => {
                const allocatedMentor = mentors.find((m) => m.id === mentee.mentorId);
                const menteeSessions = sessions.filter((s) => s.menteeId === mentee.id);
                const completedCount = menteeSessions.filter((s) => s.status === 'completed').length;

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
                      <p className="font-semibold text-slate-800">{mentee.year}</p>
                      <p className="text-[11px] text-slate-400">{mentee.department}</p>
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
                          Unassigned
                        </Badge>
                      )}
                    </td>
                    <td className="px-5 py-3.5 max-w-xs">
                      <p className="text-slate-600 line-clamp-1 italic text-[11px]">
                        "{mentee.goals || 'No specific mentoring goal entered yet.'}"
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-navy-900">{completedCount}</span>
                      <span className="text-slate-400 text-[11px]"> completed</span>
                      <span className="text-[10px] text-slate-400 block">
                        ({menteeSessions.length} total)
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={() => handleOpenDetails(mentee)}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {filteredMentees.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-5 py-8 text-center text-slate-400">
                    No student mentees match your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mentee Profile Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedMentee ? `${selectedMentee.name} — Mentee Profile` : 'Mentee Details'}
        maxWidth="max-w-md"
      >
        {selectedMentee && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <Avatar user={selectedMentee} size="lg" />
              <div>
                <h3 className="text-base font-bold text-navy-900">{selectedMentee.name}</h3>
                <p className="text-xs text-brand-600 font-semibold">{selectedMentee.year}</p>
                <p className="text-xs text-slate-400">{selectedMentee.email}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] block">
                  Department & Cohort
                </span>
                <span className="text-slate-800 font-medium">
                  {selectedMentee.department} · {currentUser?.cohort || 'Assigned Cohort'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] block">
                  Allocated Faculty Mentor
                </span>
                <span className="text-navy-900 font-bold">
                  {mentors.find((m) => m.id === selectedMentee.mentorId)?.name ||
                    selectedMentee.mentorName ||
                    'Currently Unassigned'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] block">
                  Learning & Capstone Goals
                </span>
                <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200 mt-1 leading-relaxed italic">
                  "{selectedMentee.goals || 'Master distributed algorithms and scalable system architecture.'}"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="block font-black text-navy-900">
                    {sessions.filter((s) => s.menteeId === selectedMentee.id && s.status === 'completed').length}
                  </span>
                  <span className="text-[10px] text-slate-400">Completed Sessions</span>
                </div>
                <div>
                  <span className="block font-black text-navy-900">
                    {sessions.filter((s) => s.menteeId === selectedMentee.id).length}
                  </span>
                  <span className="text-[10px] text-slate-400">Total Bookings</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
