import React, { useMemo } from 'react';
import {
  TrendingUp,
  Star,
  CheckCircle2,
  Calendar,
  Users,
  UserCheck,
  Activity,
  Award,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';

export default function CoordPerformancePage() {
  const {
    currentUser,
    getCoordinatorMentors,
    getCoordinatorMentees,
    getCoordinatorSessions,
    getCoordinatorStats,
    reviews,
  } = useApp();

  const coordinatorId = currentUser?.id;
  const stats = useMemo(() => getCoordinatorStats(coordinatorId), [getCoordinatorStats, coordinatorId]);
  const groupMentors = useMemo(() => getCoordinatorMentors(coordinatorId), [getCoordinatorMentors, coordinatorId]);
  const groupMentees = useMemo(() => getCoordinatorMentees(coordinatorId), [getCoordinatorMentees, coordinatorId]);
  const groupSessions = useMemo(() => getCoordinatorSessions(coordinatorId), [getCoordinatorSessions, coordinatorId]);

  const completionRate =
    stats.totalSessions > 0
      ? Math.round((stats.completedSessions / stats.totalSessions) * 100)
      : 0;

  const menteeEngagementRate =
    stats.menteesCount > 0
      ? Math.round((stats.activeConnections / stats.menteesCount) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cohort Performance & Quality"
        subtitle={`Mentorship engagement analytics for ${currentUser?.cohort || 'your cohort group'}`}
        breadcrumbs={['Coordinator', 'Performance']}
      >
        <Badge variant="primary" size="lg" dot>
          {currentUser?.cohort || 'Cohort Group'}
        </Badge>
      </PageHeader>

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>Completion Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-navy-900">{completionRate}%</p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            {stats.completedSessions} of {stats.totalSessions} sessions held
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>Average Group Rating</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
          </div>
          <p className="text-2xl font-black text-navy-900">{stats.avgRating} <span className="text-sm font-normal text-slate-400">/ 5.0</span></p>
          <p className="text-[11px] text-amber-600 font-medium mt-1">
            Based on completed session reviews
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>Mentee Participation</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-navy-900">{menteeEngagementRate}%</p>
          <p className="text-[11px] text-blue-600 font-medium mt-1">
            {stats.activeConnections} active mentee connections
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>Upcoming Workload</span>
            <Calendar className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-navy-900">{stats.upcomingSessions}</p>
          <p className="text-[11px] text-purple-600 font-medium mt-1">
            Confirmed & pending sessions
          </p>
        </div>
      </div>

      {/* Mentor Quality Breakdown */}
      <Card
        title="Cohort Mentor Performance Breakdown"
        subtitle="Individual rating scores, reviews, and session completion metrics"
        noPad
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Faculty Mentor</th>
                <th className="px-5 py-3">Specialty</th>
                <th className="px-5 py-3">Rating Score</th>
                <th className="px-5 py-3">Completed Sessions</th>
                <th className="px-5 py-3 text-right">Quality Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {groupMentors.map((mentor) => {
                const mentorSessions = groupSessions.filter((s) => s.mentorId === mentor.id);
                const completed = mentorSessions.filter((s) => s.status === 'completed').length;
                const mentorReviews = reviews.filter((r) => r.mentorId === mentor.id);

                return (
                  <tr key={mentor.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar user={mentor} size="sm" />
                        <div>
                          <p className="font-bold text-navy-900">{mentor.name}</p>
                          <p className="text-[11px] text-slate-400">{mentor.title}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-700">
                      {mentor.areasOfExpertise?.[0] || 'Computer Science'}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 font-bold text-amber-700">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{mentor.rating}</span>
                        <span className="text-[11px] font-normal text-slate-400">
                          ({mentorReviews.length} reviews)
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-navy-900">{completed}</span>
                      <span className="text-slate-400 text-[11px]"> of {mentorSessions.length} total</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Badge variant="success" size="xs">
                        High Engagement
                      </Badge>
                    </td>
                  </tr>
                );
              })}
              {groupMentors.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-5 py-8 text-center text-slate-400">
                    No mentors found in this cohort group.
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
