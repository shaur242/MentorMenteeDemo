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
  Shield,
  Layers,
  ArrowRight,
  UserCog,
  Building,
  Activity,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

export default function HODDashboard() {
  const {
    currentUser,
    coordinators,
    mentors,
    mentees,
    sessions,
    connections,
    getDepartmentStats,
    getCoordinatorMentors,
    getCoordinatorMentees,
  } = useApp();
  const navigate = useNavigate();

  const stats = useMemo(() => getDepartmentStats(), [getDepartmentStats]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Recent Department Sessions (latest 5)
  const recentSessions = useMemo(() => {
    return [...sessions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
      .map((s) => {
        const mentor = mentors.find((m) => m.id === s.mentorId);
        const mentee = mentees.find((m) => m.id === s.menteeId);
        return { ...s, mentor, mentee };
      });
  }, [sessions, mentors, mentees]);

  // Coordinator group distribution
  const coordinatorCards = useMemo(() => {
    return coordinators.map((c) => {
      const groupMentors = getCoordinatorMentors(c.id);
      const groupMentees = getCoordinatorMentees(c.id);
      const mentorIds = new Set(groupMentors.map((m) => m.id));
      const menteeIds = new Set(groupMentees.map((m) => m.id));

      const groupSessions = sessions.filter(
        (s) => mentorIds.has(s.mentorId) || menteeIds.has(s.menteeId)
      );
      const completedCount = groupSessions.filter((s) => s.status === 'completed').length;

      const avgGroupRating =
        groupMentors.length > 0
          ? (
              groupMentors.reduce((acc, m) => acc + (Number(m.rating) || 0), 0) /
              groupMentors.length
            ).toFixed(1)
          : '0.0';

      return {
        ...c,
        mentorsCount: groupMentors.length,
        menteesCount: groupMentees.length,
        sessionsCount: groupSessions.length,
        completedCount,
        avgRating: avgGroupRating,
      };
    });
  }, [coordinators, mentors, mentees, sessions, getCoordinatorMentors, getCoordinatorMentees]);

  // Department Performance KPIs
  const completionRate =
    stats.totalSessions > 0
      ? Math.round((stats.completedSessions / stats.totalSessions) * 100)
      : 0;

  const menteeEngagementRate =
    stats.totalMentees > 0
      ? Math.round((stats.totalConnections / stats.totalMentees) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={`${greeting()}, ${currentUser?.name || 'Dr. Sarah Mitchell'}`}
        subtitle={`Department of Computer Science & Engineering · University Mentorship Governance`}
        breadcrumbs={['HOD', 'Overview']}
      >
        <div className="flex items-center gap-2">
          <Badge variant="primary" size="lg" dot>
            Single Department HOD
          </Badge>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/hod/coordinators')}
            icon={UserCog}
          >
            Manage Coordinators
          </Button>
        </div>
      </PageHeader>

      {/* 8 Metric Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Coordinators"
          value={`${stats.activeCoordinators} / ${stats.totalCoordinators}`}
          change={`${stats.activeCoordinators} Active Groups`}
          trend="up"
          icon={UserCog}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          label="Total Faculty Mentors"
          value={stats.totalMentors}
          change="Distributed across cohorts"
          trend="neutral"
          icon={UserCheck}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatCard
          label="Enrolled Mentees"
          value={stats.totalMentees}
          change="Undergraduate & PG"
          trend="up"
          icon={Users}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
        <StatCard
          label="Active Connections"
          value={stats.totalConnections}
          change={`${stats.pendingRequests} Pending Approvals`}
          trend={stats.pendingRequests > 0 ? 'up' : 'neutral'}
          icon={Link2}
          iconColor="text-cyan-600"
          iconBg="bg-cyan-50"
        />
        <StatCard
          label="Total Sessions"
          value={stats.totalSessions}
          change={`${stats.upcomingSessions} Upcoming / Pending`}
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
          label="Avg Mentor Rating"
          value={`${stats.avgRating} / 5.0`}
          change="Department average"
          trend="up"
          icon={Star}
          iconColor="text-amber-500"
          iconBg="bg-amber-50"
        />
      </div>

      {/* Main Grid: Coordinator Overview & Department Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coordinators Overview (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card
            title="Coordinator Groups Overview"
            subtitle="Department cohorts reporting to HOD"
            action={
              <Button
                variant="ghost"
                size="xs"
                onClick={() => navigate('/hod/coordinators')}
                icon={ArrowRight}
              >
                View Details
              </Button>
            }
          >
            <div className="space-y-4">
              {coordinatorCards.map((coord) => (
                <div
                  key={coord.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <Avatar user={coord} size="md" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-navy-900">{coord.name}</h4>
                        <Badge
                          variant={coord.status === 'active' ? 'success' : 'neutral'}
                          size="xs"
                        >
                          {coord.status === 'active' ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-xs text-brand-600 font-medium">{coord.cohort}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{coord.email}</p>
                    </div>
                  </div>

                  {/* Group Metrics Badge Pills */}
                  <div className="flex flex-wrap items-center gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                    <div className="text-center px-3 py-1.5 rounded-lg bg-slate-100">
                      <span className="block text-xs font-bold text-navy-900">
                        {coord.mentorsCount}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">Mentors</span>
                    </div>
                    <div className="text-center px-3 py-1.5 rounded-lg bg-slate-100">
                      <span className="block text-xs font-bold text-navy-900">
                        {coord.menteesCount}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">Mentees</span>
                    </div>
                    <div className="text-center px-3 py-1.5 rounded-lg bg-slate-100">
                      <span className="block text-xs font-bold text-navy-900">
                        {coord.completedCount}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">Completed</span>
                    </div>
                    <div className="text-center px-3 py-1.5 rounded-lg bg-amber-50">
                      <span className="block text-xs font-bold text-amber-700 flex items-center justify-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {coord.avgRating}
                      </span>
                      <span className="text-[10px] text-amber-600 font-medium">Avg Rating</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Mentor Distribution across Cohorts */}
          <Card
            title="Mentor Allocation by Coordinator Group"
            subtitle="Current faculty mentor assignment matrix"
            action={
              <Button
                variant="ghost"
                size="xs"
                onClick={() => navigate('/hod/mentors')}
                icon={ArrowRight}
              >
                All Mentors
              </Button>
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {coordinatorCards.map((coord) => {
                const groupMentors = getCoordinatorMentors(coord.id);
                return (
                  <div
                    key={coord.id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider">
                        {coord.name}
                      </h4>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-100 text-brand-700">
                        {groupMentors.length} Mentors
                      </span>
                    </div>
                    <div className="space-y-2">
                      {groupMentors.map((m) => (
                        <div
                          key={m.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs"
                        >
                          <div className="flex items-center gap-2 truncate min-w-0">
                            <Avatar user={m} size="xs" />
                            <span className="font-semibold text-slate-800 truncate">{m.name}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 ml-2">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {m.rating}
                          </div>
                        </div>
                      ))}
                      {groupMentors.length === 0 && (
                        <p className="text-xs text-slate-400 italic py-2">
                          No mentors assigned to this coordinator.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Column: Performance & Activity */}
        <div className="space-y-6">
          {/* Department Performance */}
          <Card
            title="Department Health"
            subtitle="Mentorship KPIs and completion rate"
          >
            <div className="space-y-5">
              {/* Session Completion Rate */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-700">Session Completion Rate</span>
                  <span className="font-bold text-navy-900">{completionRate}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(completionRate, 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {stats.completedSessions} of {stats.totalSessions} sessions successfully finished
                </p>
              </div>

              {/* Mentee Engagement Rate */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-700">Mentee Engagement Rate</span>
                  <span className="font-bold text-navy-900">{menteeEngagementRate}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-brand-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(menteeEngagementRate, 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {stats.totalConnections} active connections across {stats.totalMentees} mentees
                </p>
              </div>

              {/* Department Rating Score */}
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-900">
                    Department Rating Index
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-black text-amber-900">{stats.avgRating}</span>
                    <span className="text-xs text-amber-600">/ 5.0</span>
                  </div>
                </div>
                <p className="text-[11px] text-amber-700 mt-1">
                  Computed dynamically across all mentee reviews submitted for completed sessions.
                </p>
              </div>
            </div>
          </Card>

          {/* Recent Department Activity */}
          <Card
            title="Recent Activity"
            subtitle="Department-wide audit trail"
            noPad
          >
            <div className="divide-y divide-slate-100">
              <div className="flex items-start gap-3 p-3.5 text-xs">
                <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700 flex-shrink-0">
                  <UserCog className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-navy-900">Coordinator Groups Active</p>
                  <p className="text-slate-500 text-[11px]">
                    {coordinators.length} coordinators overseeing {mentors.length} faculty mentors
                  </p>
                </div>
                <span className="text-[10px] text-slate-400">Today</span>
              </div>
              <div className="flex items-start gap-3 p-3.5 text-xs">
                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 flex-shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-navy-900">Mentorship Sessions Logged</p>
                  <p className="text-slate-500 text-[11px]">
                    {stats.completedSessions} completed sessions logged and rated
                  </p>
                </div>
                <span className="text-[10px] text-slate-400">1h ago</span>
              </div>
              <div className="flex items-start gap-3 p-3.5 text-xs">
                <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700 flex-shrink-0">
                  <Link2 className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-navy-900">Active Mentorship Connections</p>
                  <p className="text-slate-500 text-[11px]">
                    {stats.totalConnections} verified student-faculty pairings
                  </p>
                </div>
                <span className="text-[10px] text-slate-400">3h ago</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Sessions Table across Department */}
      <Card
        title="Recent Mentoring Sessions"
        subtitle="Department-wide session activity across all cohorts"
        action={
          <Button
            variant="ghost"
            size="xs"
            onClick={() => navigate('/hod/sessions')}
            icon={ArrowRight}
          >
            All Sessions ({sessions.length})
          </Button>
        }
        noPad
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Session Topic</th>
                <th className="px-5 py-3">Mentor</th>
                <th className="px-5 py-3">Mentee</th>
                <th className="px-5 py-3">Date & Time</th>
                <th className="px-5 py-3">Mode</th>
                <th className="px-5 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentSessions.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-navy-900 max-w-xs truncate">
                    {s.title}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <Avatar user={s.mentor} size="xs" />
                      <span className="font-medium text-slate-800">{s.mentor?.name || 'Faculty'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <Avatar user={s.mentee} size="xs" />
                      <span className="font-medium text-slate-800">{s.mentee?.name || 'Student'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {s.date} · {s.startTime}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 truncate max-w-[150px]">
                    {s.meetingMode}
                  </td>
                  <td className="px-5 py-3.5 text-right">
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
              {recentSessions.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-5 py-6 text-center text-slate-400">
                    No sessions scheduled yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
