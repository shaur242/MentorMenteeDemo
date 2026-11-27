import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserCheck,
  Calendar,
  Star,
  Clock,
  Briefcase,
  Building,
  ArrowRight,
  Search,
  Info,
  CheckCircle2,
  Tag,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

export default function MenteeMyMentorPage() {
  const {
    currentUser,
    getMenteeAllocation,
    getMentorById,
    sessions,
    getMentorReviews,
  } = useApp();
  const navigate = useNavigate();

  const allocation = useMemo(
    () => (currentUser ? getMenteeAllocation(currentUser.id) : null),
    [currentUser, getMenteeAllocation]
  );

  const mentor = useMemo(
    () => (allocation ? getMentorById(allocation.mentorId) : null),
    [allocation, getMentorById]
  );

  const mentorReviews = useMemo(
    () => (mentor ? getMentorReviews(mentor.id) : []),
    [mentor, getMentorReviews]
  );

  const sharedSessions = useMemo(() => {
    if (!currentUser || !mentor) return [];
    return sessions.filter(
      (s) => s.mentorId === mentor.id && s.menteeId === currentUser.id
    );
  }, [sessions, currentUser, mentor]);

  const completedCount = sharedSessions.filter((s) => s.status === 'completed').length;
  const upcomingCount = sharedSessions.filter(
    (s) => s.status === 'confirmed' || s.status === 'pending'
  ).length;

  // No mentor assigned — empty state
  if (!allocation || !mentor) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="My Mentor"
          subtitle="Your officially allocated mentor will appear here."
          breadcrumbs={['Mentee', 'My Mentor']}
        />

        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <UserCheck className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-navy-900 mb-2">No Mentor Assigned Yet</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
            You do not currently have an officially allocated mentor. Browse the mentor
            directory and submit a request, or contact your coordinator for direct assignment.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/mentee/find-mentors')}
              icon={Search}
            >
              Find Mentors
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate('/mentee/requests')}
            >
              View My Requests
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Mentor"
        subtitle="Your officially allocated mentor and mentorship details."
        breadcrumbs={['Mentee', 'My Mentor']}
      >
        <Badge variant="success" size="md">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Mentor Assigned
        </Badge>
      </PageHeader>

      {/* Mentor Profile Hero Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        {/* ── 1. Decorative gradient banner (pure background, no content) ── */}
        <div className="h-32 bg-gradient-to-r from-navy-950 via-navy-800 to-brand-800" />

        {/* ── 2. White content section ───────────────────────────────────── */}
        <div className="px-6 pb-6">

          {/* ── 2a. Avatar row — only the avatar is pulled up into the banner */}
          {/*   -mt-10 = 40 px, avatar is 80 px tall → bottom 40 px in white area */}
          <div className="-mt-10 mb-4 flex items-end justify-between">
            <Avatar
              user={mentor}
              size="xl"
              className="w-20 h-20 text-xl ring-4 ring-white shadow-md flex-shrink-0"
            />
            {/* Buttons anchored to the right of the avatar row, bottom-aligned */}
            <div className="flex gap-2 pb-1">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(`/mentee/mentors/${mentor.id}`)}
                iconRight={ArrowRight}
              >
                Full Profile
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(`/mentee/sessions?bookMentorId=${mentor.id}`)}
                icon={Calendar}
              >
                Book Session
              </Button>
            </div>
          </div>

          {/* ── 2b. Mentor name & details — entirely in white section ────── */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-navy-900">{mentor.name}</h2>
            <p className="text-sm font-medium text-brand-700 mt-0.5">{mentor.title}</p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1.5">
              <span className="flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                {mentor.company || mentor.department}
              </span>
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                {mentor.yearsOfExperience} years experience
              </span>
            </div>
          </div>

          {/* ── 2c. Quick Stats ──────────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Rating
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-base font-bold text-navy-900">{mentor.rating}</span>
                <span className="text-xs text-slate-500">({mentorReviews.length})</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Completed
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-base font-bold text-navy-900">{completedCount} Sessions</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Upcoming
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <Calendar className="w-4 h-4 text-brand-600" />
                <span className="text-base font-bold text-navy-900">{upcomingCount} Scheduled</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Session Duration
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <Clock className="w-4 h-4 text-brand-600" />
                <span className="text-base font-bold text-navy-900">{mentor.sessionDuration}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Allocation Details + Expertise Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Allocation Details */}
        <Card title="Allocation Details">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500">Allocation Method</span>
              <Badge variant={allocation.method === 'self_selected' ? 'info' : 'default'} size="sm">
                <Tag className="w-3 h-3" />
                {allocation.method === 'self_selected' ? 'Self Selected' : 'Coordinator Assigned'}
              </Badge>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500">Status</span>
              <Badge variant="success" size="sm">
                <CheckCircle2 className="w-3 h-3" />
                Active
              </Badge>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500">Assigned Date</span>
              <span className="text-navy-900 font-medium">
                {new Date(allocation.decidedAt || allocation.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            {allocation.decisionNote && (
              <div className="pt-2">
                <p className="text-xs text-slate-500 mb-1 font-semibold">Coordinator Note</p>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed italic">
                  "{allocation.decisionNote}"
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Expertise & Availability */}
        <Card title="Expertise & Availability">
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Areas of Expertise
              </p>
              <div className="flex flex-wrap gap-1.5">
                {mentor.areasOfExpertise?.map((exp, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md text-xs font-medium bg-navy-50 text-navy-800 border border-navy-200"
                  >
                    {exp}
                  </span>
                ))}
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Available Days
              </p>
              <div className="flex flex-wrap gap-1.5">
                {mentor.availability?.days?.map((day, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-xs"
                  >
                    {day}
                  </span>
                ))}
              </div>
              <p className="text-xs text-slate-600 mt-2">
                <Clock className="w-3 h-3 inline text-slate-400 mr-1" />
                {mentor.availability?.hours}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Shared Sessions */}
      {sharedSessions.length > 0 && (
        <Card
          title="Recent Sessions"
          subtitle={`${sharedSessions.length} total sessions with ${mentor.name}`}
        >
          <div className="space-y-2">
            {sharedSessions.slice(0, 5).map((sess) => (
              <div
                key={sess.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-navy-900 truncate">{sess.title}</p>
                  <p className="text-xs text-slate-500">
                    {sess.date} · {sess.startTime}
                  </p>
                </div>
                <Badge
                  variant={
                    sess.status === 'completed'
                      ? 'success'
                      : sess.status === 'confirmed'
                      ? 'info'
                      : sess.status === 'cancelled'
                      ? 'danger'
                      : 'warning'
                  }
                  size="sm"
                >
                  {sess.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
