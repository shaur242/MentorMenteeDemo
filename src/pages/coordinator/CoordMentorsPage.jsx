import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Star,
  ExternalLink,
  Calendar,
  Building,
  Briefcase,
  Clock,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

export default function CoordMentorsPage() {
  const { currentUser, getCoordinatorMentors, sessions, connections } = useApp();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterExpertise, setFilterExpertise] = useState('all');

  // STRICT ACCESS CONTROL: Only fetch mentors belonging to logged-in coordinator
  const myMentors = useMemo(() => {
    return getCoordinatorMentors(currentUser?.id);
  }, [getCoordinatorMentors, currentUser]);

  // Extract unique areas of expertise across this group's mentors
  const groupExpertise = useMemo(() => {
    const set = new Set();
    myMentors.forEach((m) => {
      m.areasOfExpertise?.forEach((exp) => set.add(exp));
    });
    return Array.from(set);
  }, [myMentors]);

  // Filtered mentors
  const filteredMentors = useMemo(() => {
    return myMentors.filter((m) => {
      if (filterExpertise !== 'all' && !m.areasOfExpertise?.includes(filterExpertise)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = m.name?.toLowerCase().includes(q);
        const matchTitle = m.title?.toLowerCase().includes(q);
        const matchExpertise = m.areasOfExpertise?.some((e) => e.toLowerCase().includes(q));
        const matchSkill = m.skills?.some((s) => s.toLowerCase().includes(q));
        return matchName || matchTitle || matchExpertise || matchSkill;
      }
      return true;
    });
  }, [myMentors, filterExpertise, searchQuery]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Cohort Mentors"
        subtitle={`Faculty mentors assigned to ${currentUser?.cohort || 'your cohort'} (${myMentors.length} Mentors)`}
        breadcrumbs={['Coordinator', 'My Mentors']}
      >
        <Badge variant="primary" size="lg" dot>
          {currentUser?.cohort || 'Cohort Group'}
        </Badge>
      </PageHeader>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-semibold text-slate-500">Expertise:</label>
          <select
            value={filterExpertise}
            onChange={(e) => setFilterExpertise(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 bg-white"
          >
            <option value="all">All Expertise Areas</option>
            {groupExpertise.map((exp, idx) => (
              <option key={idx} value={exp}>
                {exp}
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
            placeholder="Search mentors by name, skill, or title..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Mentor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredMentors.map((mentor) => {
          // Workload: active mentees connected
          const activeMentees = connections.filter(
            (c) =>
              c.status === 'accepted' &&
              (c.recipientId === mentor.id || c.requesterId === mentor.id)
          ).length;

          // Sessions statistics
          const mentorSessions = sessions.filter((s) => s.mentorId === mentor.id);
          const completedSessions = mentorSessions.filter((s) => s.status === 'completed').length;
          const upcomingSessions = mentorSessions.filter(
            (s) => s.status === 'confirmed' || s.status === 'pending'
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
                        {mentor.company}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-lg flex-shrink-0">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {mentor.rating} ({mentor.totalReviews})
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                  {mentor.biography}
                </p>

                {/* Expertise Badges */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {mentor.areasOfExpertise?.map((exp, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 font-semibold text-[10px]"
                    >
                      {exp}
                    </span>
                  ))}
                </div>

                {/* Workload and Statistics Grid */}
                <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div>
                    <span className="block font-black text-navy-900">{activeMentees}</span>
                    <span className="text-[10px] text-slate-500 font-medium">Active Mentees</span>
                  </div>
                  <div>
                    <span className="block font-black text-navy-900">{completedSessions}</span>
                    <span className="text-[10px] text-slate-500 font-medium">Completed</span>
                  </div>
                  <div>
                    <span className="block font-black text-navy-900">{upcomingSessions}</span>
                    <span className="text-[10px] text-slate-500 font-medium">Upcoming</span>
                  </div>
                </div>

                {/* Availability detail */}
                <div className="mt-3 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>
                    Availability: {mentor.availability?.days?.join(', ') || 'Flexible'}
                  </span>
                  <span className="font-semibold text-slate-700">
                    {mentor.availability?.hours || 'Campus Office'}
                  </span>
                </div>
              </div>

              {/* Footer Profile Action */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Joined Cohort: {mentor.joinedYear || 2021}
                </span>
                <Button
                  variant="secondary"
                  size="xs"
                  onClick={() => navigate(`/coordinator/mentors/${mentor.id}`)}
                  icon={ExternalLink}
                >
                  View Full Profile
                </Button>
              </div>
            </div>
          );
        })}
        {filteredMentors.length === 0 && (
          <div className="col-span-full bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400">
            <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">No mentors found</p>
            <p className="text-xs mt-1">No faculty mentors match the selected filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
