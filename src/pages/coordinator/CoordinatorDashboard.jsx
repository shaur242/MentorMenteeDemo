import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  Calendar,
  Star,
  CheckCircle2,
  Clock,
  TrendingUp,
  Link2,
  ArrowRight,
  Video,
  Award,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

export default function CoordinatorDashboard() {
  const {
    currentUser,
    mentors,
    mentees,
    sessions,
    connections,
    getCoordinatorStats,
    getCoordinatorMentors,
    getCoordinatorMentees,
    getCoordinatorSessions,
  } = useApp();
  const navigate = useNavigate();

  const coordinatorId = currentUser?.id;
  const stats = useMemo(() => {
    return getCoordinatorStats(coordinatorId);
  }, [getCoordinatorStats, coordinatorId]);

  const groupMentors = useMemo(() => {
    return getCoordinatorMentors(coordinatorId);
  }, [getCoordinatorMentors, coordinatorId]);

  const groupMentees = useMemo(() => {
    return getCoordinatorMentees(coordinatorId);
  }, [getCoordinatorMentees, coordinatorId]);

  const groupSessions = useMemo(() => {
    return getCoordinatorSessions(coordinatorId)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map((s) => {
        const mentor = mentors.find((m) => m.id === s.mentorId);
        const mentee = mentees.find((m) => m.id === s.menteeId);
        return { ...s, mentor, mentee };
      });
  }, [getCoordinatorSessions, coordinatorId, mentors, mentees]);

  const recentGroupSessions = useMemo(() => {
    return groupSessions.slice(0, 5);
  }, [groupSessions]);

  const completionRate =
    stats.totalSessions > 0
      ? Math.round((stats.completedSessions / stats.totalSessions) * 100)
      : 0;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={`${greeting()}, ${currentUser?.name || 'Coordinator'}`}
        subtitle={`${currentUser?.cohort || 'Assigned Cohort'} · Dedicated Mentorship Management`}
        breadcrumbs={['Coordinator', 'Overview']}
      >
        <div className="flex items-center gap-2">
          <Badge variant="primary" size="lg" dot>
            {currentUser?.cohort || 'Cohort'}
          </Badge>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/coordinator/sessions')}
            icon={Calendar}
          >
            Cohort Sessions
          </Button>
        </div>
      </PageHeader>

      {/* 7 Group Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="My Mentors"
          value={stats.mentorsCount}
          change="Assigned to your cohort"
          trend="neutral"
          icon={UserCheck}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          label="My Mentees"
          value={stats.menteesCount}
          change="Under cohort guidance"
          trend="up"
          icon={Users}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
        <StatCard
          label="Active Connections"
          value={stats.activeConnections}
          change={`${stats.pendingRequests} Pending in Group`}
          trend={stats.pendingRequests > 0 ? 'up' : 'neutral'}
          icon={Link2}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatCard
          label="Upcoming Sessions"
          value={stats.upcomingSessions}
          change="Confirmed / Pending"
          trend="up"
          icon={Calendar}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
        />
        <StatCard
          label="Completed Sessions"
          value={stats.completedSessions}
          change={`${completionRate}% Completion Rate`}
          trend="up"
          icon={CheckCircle2}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatCard
          label="Pending Requests"
          value={stats.pendingRequests}
          change="Awaiting mentor response"
          trend={stats.pendingRequests > 0 ? 'down' : 'neutral'}
          icon={Clock}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
        <StatCard
          label="Average Mentor Rating"
          value={`${stats.avgRating} / 5.0`}
          change="Cohort mentor score"
          trend="up"
          icon={Star}
          iconColor="text-amber-500"
          iconBg="bg-amber-50"
        />
      </div>

      {/* Main Grid: My Mentors & My Mentees */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Mentors */}
        <Card
          title="My Faculty Mentors"
          subtitle={`Mentors assigned to ${currentUser?.cohort || 'your group'} (${groupMentors.length})`}
          action={
            <Button
              variant="ghost"
              size="xs"
              onClick={() => navigate('/coordinator/mentors')}
              icon={ArrowRight}
            >
              Manage Mentors
            </Button>
          }
        >
          <div className="space-y-3">
            {groupMentors.map((mentor) => {
              // Calculate mentor's active mentees within group
              const activeMenteeCount = connections.filter(
                (c) =>
                  c.status === 'accepted' &&
                  (c.recipientId === mentor.id || c.requesterId === mentor.id)
              ).length;

              const mentorSessionsCount = sessions.filter(
                (s) => s.mentorId === mentor.id
              ).length;

              return (
                <div
                  key={mentor.id}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar user={mentor} size="md" />
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-navy-900 truncate">{mentor.name}</h4>
                      <p className="text-xs text-slate-500 truncate">{mentor.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] font-bold text-amber-600 flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {mentor.rating}
                        </span>
                        <span className="text-[10px] text-slate-400">•</span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {activeMenteeCount} Mentees
                        </span>
                        <span className="text-[10px] text-slate-400">•</span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {mentorSessionsCount} Sessions
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={() => navigate(`/coordinator/mentors/${mentor.id}`)}
                  >
                    Profile
                  </Button>
                </div>
              );
            })}
            {groupMentors.length === 0 && (
              <div className="p-6 text-center text-slate-400">
                <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-xs">No faculty mentors currently assigned to your cohort.</p>
              </div>
            )}
          </div>
        </Card>

        {/* My Mentees */}
        <Card
          title="My Cohort Mentees"
          subtitle={`Students assigned to ${currentUser?.cohort || 'your group'} (${groupMentees.length})`}
          action={
            <Button
              variant="ghost"
              size="xs"
              onClick={() => navigate('/coordinator/mentees')}
              icon={ArrowRight}
            >
              All Mentees
            </Button>
          }
        >
          <div className="space-y-3">
            {groupMentees.map((mentee) => {
              const allocatedMentor = mentors.find((m) => m.id === mentee.mentorId);
              const menteeSessionsCount = sessions.filter(
                (s) => s.menteeId === mentee.id
              ).length;

              return (
                <div
                  key={mentee.id}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar user={mentee} size="md" />
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-navy-900 truncate">{mentee.name}</h4>
                      <p className="text-xs text-brand-600 font-medium truncate">{mentee.year}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-slate-600 font-medium truncate">
                          Mentor: {allocatedMentor?.name || 'Unassigned'}
                        </span>
                        <span className="text-[10px] text-slate-400">•</span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {menteeSessionsCount} Sessions
                        </span>
                      </div>
                    </div>
                  </div>

                  <Badge variant={allocatedMentor ? 'success' : 'neutral'} size="xs">
                    {allocatedMentor ? 'Assigned' : 'Seeking'}
                  </Badge>
                </div>
              );
            })}
            {groupMentees.length === 0 && (
              <div className="p-6 text-center text-slate-400">
                <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-xs">No mentees currently registered in this cohort group.</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Group Sessions & Group Performance Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sessions Table (2 cols) */}
        <Card
          title="Recent Cohort Sessions"
          subtitle="Mentorship sessions strictly involving your group"
          className="lg:col-span-2"
          action={
            <Button
              variant="ghost"
              size="xs"
              onClick={() => navigate('/coordinator/sessions')}
              icon={ArrowRight}
            >
              All ({groupSessions.length})
            </Button>
          }
          noPad
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Topic</th>
                  <th className="px-5 py-3">Mentor</th>
                  <th className="px-5 py-3">Mentee</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentGroupSessions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3 font-semibold text-navy-900 truncate max-w-xs">
                      {s.title}
                    </td>
                    <td className="px-5 py-3 text-slate-700">{s.mentor?.name || 'Faculty'}</td>
                    <td className="px-5 py-3 text-slate-700">{s.mentee?.name || 'Student'}</td>
                    <td className="px-5 py-3 text-slate-500">{s.date}</td>
                    <td className="px-5 py-3 text-right">
                      <Badge
                        variant={
                          s.status === 'completed'
                            ? 'success'
                            : s.status === 'confirmed'
                            ? 'primary'
                            : s.status === 'cancelled'
                            ? 'danger'
                            : 'warning'
                        }
                        size="xs"
                      >
                        {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {recentGroupSessions.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-5 py-6 text-center text-slate-400">
                      No sessions recorded in this cohort group.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Group Performance Summary */}
        <div className="space-y-6">
          <Card
            title="Group Performance"
            subtitle="Cohort mentorship progress"
          >
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-700">Group Session Completion</span>
                  <span className="font-bold text-navy-900">{completionRate}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(completionRate, 100)}%` }}
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-900">Mentor Group Score</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-black text-blue-900">{stats.avgRating}</span>
                  </div>
                </div>
                <p className="text-[11px] text-blue-700 mt-1">
                  Derived from mentee ratings specifically for mentors in your cohort.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Group Sessions:</span>
                  <span className="font-bold text-navy-900">{stats.totalSessions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Active Pairings:</span>
                  <span className="font-bold text-emerald-700">{stats.activeConnections}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pending Inquiries:</span>
                  <span className="font-bold text-amber-600">{stats.pendingRequests}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
