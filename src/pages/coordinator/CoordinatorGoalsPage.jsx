import React, { useState, useMemo } from 'react';
import {
  Target,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  HelpCircle,
  TrendingUp,
  UserCheck,
  Users,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  MessageSquare,
  Award,
  BookOpen,
  Briefcase,
  User,
  Shield,
  Eye,
  RefreshCw,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

// Status badge styling helper
const getStatusBadge = (status) => {
  switch (status) {
    case 'active':
      return <Badge variant="primary">Active</Badge>;
    case 'achieved':
      return <Badge variant="success">Achieved</Badge>;
    case 'not_achieved':
      return <Badge variant="danger">Not Achieved</Badge>;
    case 'pending_approval':
      return <Badge variant="warning">Pending Approval</Badge>;
    case 'changes_requested':
      return <Badge variant="warning">Changes Requested</Badge>;
    case 'rejected':
      return <Badge variant="danger">Rejected</Badge>;
    default:
      return <Badge variant="neutral">{status}</Badge>;
  }
};

// Category badge helper
const getCategoryBadge = (category) => {
  switch (category) {
    case 'Academic':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          <BookOpen className="w-3 h-3 text-blue-500" />
          Academic
        </span>
      );
    case 'Professional':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
          <Briefcase className="w-3 h-3 text-purple-500" />
          Professional
        </span>
      );
    case 'Personal':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <User className="w-3 h-3 text-emerald-500" />
          Personal
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-700 border border-slate-200">
          {category}
        </span>
      );
  }
};

export default function CoordinatorGoalsPage() {
  const {
    currentUser,
    getCoordinatorGoals,
    getCoordinatorGoalStats,
    getCoordinatorMentors,
    getCoordinatorMentees,
    getMentorById,
    getUserById,
    getGoalFeedback,
    getGoalUpdates,
    getCoordinatorTrimesterReviews,
    getMenteeTrimesterGoalSummary,
    allocations,
  } = useApp();

  const coordinatorId = currentUser?.id;

  // STRICT ACCESS CONTROL: Only fetch records belonging to logged-in coordinator
  const groupGoals = useMemo(() => {
    return getCoordinatorGoals(coordinatorId);
  }, [getCoordinatorGoals, coordinatorId]);

  const groupStats = useMemo(() => {
    return getCoordinatorGoalStats(coordinatorId);
  }, [getCoordinatorGoalStats, coordinatorId]);

  const groupMentors = useMemo(() => {
    return getCoordinatorMentors(coordinatorId);
  }, [getCoordinatorMentors, coordinatorId]);

  const groupMentees = useMemo(() => {
    return getCoordinatorMentees(coordinatorId);
  }, [getCoordinatorMentees, coordinatorId]);

  // Active Workspace Tab
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'mentors' | 'mentees' | 'history'

  // Filters State
  const [selectedTrimester, setSelectedTrimester] = useState('all');
  const [selectedMentor, setSelectedMentor] = useState('all');
  const [selectedMentee, setSelectedMentee] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRangeStart, setDateRangeStart] = useState('');
  const [dateRangeEnd, setDateRangeEnd] = useState('');

  // Modals and selection state
  const [detailGoal, setDetailGoal] = useState(null);
  const [selectedMentorDetails, setSelectedMentorDetails] = useState(null);
  const [selectedMenteeDetails, setSelectedMenteeDetails] = useState(null);
  const [inspectTrimesterReview, setInspectTrimesterReview] = useState(null);

  // Filter Reset
  const handleClearFilters = () => {
    setSelectedTrimester('all');
    setSelectedMentor('all');
    setSelectedMentee('all');
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSearchQuery('');
    setDateRangeStart('');
    setDateRangeEnd('');
  };

  const hasActiveFilters =
    selectedTrimester !== 'all' ||
    selectedMentor !== 'all' ||
    selectedMentee !== 'all' ||
    selectedCategory !== 'all' ||
    selectedStatus !== 'all' ||
    searchQuery.trim() !== '' ||
    dateRangeStart !== '' ||
    dateRangeEnd !== '';

  // Filtered Goals matching all criteria
  const filteredGoals = useMemo(() => {
    return groupGoals.filter((g) => {
      if (selectedTrimester !== 'all' && g.trimester !== selectedTrimester) return false;
      if (selectedMentor !== 'all' && g.mentorId !== selectedMentor) return false;
      if (selectedMentee !== 'all' && g.menteeId !== selectedMentee) return false;
      if (selectedCategory !== 'all' && g.category !== selectedCategory) return false;
      if (selectedStatus !== 'all' && g.status !== selectedStatus) return false;

      if (dateRangeStart) {
        if (!g.targetDate || new Date(g.targetDate) < new Date(dateRangeStart)) return false;
      }
      if (dateRangeEnd) {
        if (!g.targetDate || new Date(g.targetDate) > new Date(dateRangeEnd)) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mentee = getUserById(g.menteeId);
        const mentor = getMentorById(g.mentorId);
        const matchTitle = g.title?.toLowerCase().includes(q);
        const matchDesc = g.description?.toLowerCase().includes(q);
        const matchMentee = mentee?.name?.toLowerCase().includes(q);
        const matchMentor = mentor?.name?.toLowerCase().includes(q);
        return matchTitle || matchDesc || matchMentee || matchMentor;
      }

      return true;
    });
  }, [
    groupGoals,
    selectedTrimester,
    selectedMentor,
    selectedMentee,
    selectedCategory,
    selectedStatus,
    dateRangeStart,
    dateRangeEnd,
    searchQuery,
    getUserById,
    getMentorById,
  ]);

  // Distribution calculations (category breakdown)
  const categoryStats = useMemo(() => {
    const total = groupGoals.length;
    const academic = groupGoals.filter((g) => g.category === 'Academic').length;
    const professional = groupGoals.filter((g) => g.category === 'Professional').length;
    const personal = groupGoals.filter((g) => g.category === 'Personal').length;

    return {
      academic: { count: academic, pct: total ? Math.round((academic / total) * 100) : 0 },
      professional: { count: professional, pct: total ? Math.round((professional / total) * 100) : 0 },
      personal: { count: personal, pct: total ? Math.round((personal / total) * 100) : 0 },
    };
  }, [groupGoals]);

  // Distribution calculations (status breakdown)
  const statusStats = useMemo(() => {
    const total = groupGoals.length;
    const pending = groupGoals.filter((g) => g.status === 'pending_approval').length;
    const active = groupGoals.filter((g) => g.status === 'active').length;
    const achieved = groupGoals.filter((g) => g.status === 'achieved').length;
    const notAchieved = groupGoals.filter((g) => g.status === 'not_achieved').length;
    const changesReq = groupGoals.filter((g) => g.status === 'changes_requested').length;
    const rejected = groupGoals.filter((g) => g.status === 'rejected').length;

    return {
      pending: { count: pending, pct: total ? Math.round((pending / total) * 100) : 0 },
      active: { count: active, pct: total ? Math.round((active / total) * 100) : 0 },
      achieved: { count: achieved, pct: total ? Math.round((achieved / total) * 100) : 0 },
      notAchieved: { count: notAchieved, pct: total ? Math.round((notAchieved / total) * 100) : 0 },
      changesRequested: { count: changesReq, pct: total ? Math.round((changesReq / total) * 100) : 0 },
      rejected: { count: rejected, pct: total ? Math.round((rejected / total) * 100) : 0 },
    };
  }, [groupGoals]);

  // Mentor Performance aggregation
  const mentorOverviewList = useMemo(() => {
    return groupMentors.map((mentor) => {
      // Find allocated mentees for this mentor
      const allocatedMentees = allocations
        .filter((a) => a.mentorId === mentor.id && a.status === 'approved')
        .map((a) => getUserById(a.menteeId))
        .filter(Boolean);

      const allocatedIds = new Set(allocatedMentees.map((m) => m.id));

      // Mentor goals are goals submitted by their allocated mentees or with mentorId
      const mGoals = groupGoals.filter((g) => g.mentorId === mentor.id || allocatedIds.has(g.menteeId));

      const pending = mGoals.filter((g) => g.status === 'pending_approval' || g.status === 'changes_requested').length;
      const active = mGoals.filter((g) => g.status === 'active').length;
      const achieved = mGoals.filter((g) => g.status === 'achieved').length;
      const notAchieved = mGoals.filter((g) => g.status === 'not_achieved').length;

      const activeProgressSum = mGoals
        .filter((g) => g.status === 'active')
        .reduce((sum, g) => sum + (g.progress || 0), 0);
      const avgProgress = active > 0 ? Math.round(activeProgressSum / active) : 0;

      // Attention calculation for mentor
      const now = new Date();
      const requiringAttention = mGoals.filter((g) => {
        if (g.status === 'active') {
          if (g.targetDate && new Date(g.targetDate) < now) return true;
          if ((g.progress || 0) < 30) return true;
        }
        if (g.status === 'pending_approval') {
          const days = (now - new Date(g.createdAt)) / (1000 * 60 * 60 * 24);
          if (days > 7) return true;
        }
        return false;
      }).length;

      return {
        mentor,
        allocatedMentees,
        totalGoals: mGoals.length,
        pending,
        active,
        achieved,
        notAchieved,
        avgProgress,
        requiringAttention,
        goals: mGoals,
      };
    });
  }, [groupMentors, groupGoals, allocations, getUserById]);

  // Mentee Goals aggregation
  const menteeOverviewList = useMemo(() => {
    return groupMentees.map((mentee) => {
      const assignedMentor = getMentorById(mentee.mentorId);
      const mGoals = groupGoals.filter((g) => g.menteeId === mentee.id);

      const academicCount = mGoals.filter((g) => g.category === 'Academic').length;
      const professionalCount = mGoals.filter((g) => g.category === 'Professional').length;
      const personalCount = mGoals.filter((g) => g.category === 'Personal').length;

      const active = mGoals.filter((g) => g.status === 'active').length;
      const achieved = mGoals.filter((g) => g.status === 'achieved').length;
      const notAchieved = mGoals.filter((g) => g.status === 'not_achieved').length;

      const activeSum = mGoals
        .filter((g) => g.status === 'active')
        .reduce((sum, g) => sum + (g.progress || 0), 0);
      const avgProgress = active > 0 ? Math.round(activeSum / active) : 0;

      return {
        mentee,
        assignedMentor,
        academicCount,
        professionalCount,
        personalCount,
        totalGoals: mGoals.length,
        active,
        achieved,
        notAchieved,
        avgProgress,
        goals: mGoals,
      };
    });
  }, [groupMentees, groupGoals, getMentorById]);

  // Trimester finalized history records (achieved, not_achieved)
  const finalizedGoals = useMemo(() => {
    return groupGoals
      .filter((g) => g.status === 'achieved' || g.status === 'not_achieved')
      .sort((a, b) => new Date(b.evaluatedAt || b.updatedAt) - new Date(a.evaluatedAt || a.updatedAt));
  }, [groupGoals]);

  return (
    <div className="space-y-6">
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <PageHeader
        title="Goals Overview"
        subtitle="Monitor goal setting, progress and trimester outcomes across your assigned mentoring group."
        breadcrumbs={['Coordinator', 'Goals Overview']}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-800">
            <Shield className="w-4 h-4 text-blue-600" />
            <span>Auditor / Monitoring Mode</span>
          </div>
          <Badge variant="primary" size="lg" dot>
            {currentUser?.cohort || 'Assigned Cohort'}
          </Badge>
        </div>
      </PageHeader>

      {/* Permissions Disclaimer Card */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <span className="font-bold">Monitoring & Reporting Access:</span> As a Cohort Coordinator, you have full visibility into the goal lifecycle, mentor approval timeliness, mentee progress velocity, and trimester evaluations across your group. Note that direct goal evaluations and approval actions are exclusively executed by assigned Mentors.
        </div>
      </div>

      {/* ── 1. Dashboard Statistics Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1.5">
            <span>Total Goals</span>
            <Target className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-navy-900">{groupStats.total}</p>
          <p className="text-[11px] text-slate-500 mt-1">Across all mentees</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1.5">
            <span>Pending Review</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600">{groupStats.pending}</p>
          <p className="text-[11px] text-amber-700 font-medium mt-1">Awaiting mentor action</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1.5">
            <span>Active Goals</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600">{groupStats.active}</p>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">Currently in progress</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1.5">
            <span>Achieved</span>
            <CheckCircle2 className="w-4 h-4 text-teal-500" />
          </div>
          <p className="text-2xl font-black text-teal-600">{groupStats.achieved}</p>
          <p className="text-[11px] text-teal-700 font-medium mt-1">Finalized outcomes</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1.5">
            <span>Not Achieved</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-600">{groupStats.notAchieved}</p>
          <p className="text-[11px] text-rose-700 font-medium mt-1">Target missed/pivoted</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-amber-300/80 bg-amber-50/20 shadow-xs">
          <div className="flex items-center justify-between text-xs text-amber-800 font-semibold mb-1.5">
            <span>Needs Attention</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-700">{groupStats.requiringAttention}</p>
          <p className="text-[11px] text-amber-800 font-medium mt-1">Overdue / low progress</p>
        </div>
      </div>

      {/* ── 2. Goals Distribution Breakdown (Category & Status) ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Category Distribution */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-navy-900 text-sm">Goals Category Distribution</h3>
              <p className="text-xs text-slate-500">Breakdown of goals across academic, professional & personal domains</p>
            </div>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3.5">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Academic
                </span>
                <span>
                  {categoryStats.academic.count} goals ({categoryStats.academic.pct}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${categoryStats.academic.pct}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Professional
                </span>
                <span>
                  {categoryStats.professional.count} goals ({categoryStats.professional.pct}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${categoryStats.professional.pct}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Personal
                </span>
                <span>
                  {categoryStats.personal.count} goals ({categoryStats.personal.pct}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${categoryStats.personal.pct}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Status Distribution */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-navy-900 text-sm">Goals Lifecycle Status Breakdown</h3>
              <p className="text-xs text-slate-500">Live operational status distribution across the cohort</p>
            </div>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">Active</span>
              <p className="text-lg font-bold text-blue-600">{statusStats.active.count}</p>
              <span className="text-[10px] text-slate-400">{statusStats.active.pct}% of total</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">Pending Approval</span>
              <p className="text-lg font-bold text-amber-600">{statusStats.pending.count}</p>
              <span className="text-[10px] text-slate-400">{statusStats.pending.pct}% of total</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">Achieved</span>
              <p className="text-lg font-bold text-teal-600">{statusStats.achieved.count}</p>
              <span className="text-[10px] text-slate-400">{statusStats.achieved.pct}% of total</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">Not Achieved</span>
              <p className="text-lg font-bold text-rose-600">{statusStats.notAchieved.count}</p>
              <span className="text-[10px] text-slate-400">{statusStats.notAchieved.pct}% of total</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">Changes Req.</span>
              <p className="text-lg font-bold text-orange-600">{statusStats.changesRequested.count}</p>
              <span className="text-[10px] text-slate-400">{statusStats.changesRequested.pct}% of total</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">Rejected</span>
              <p className="text-lg font-bold text-red-600">{statusStats.rejected.count}</p>
              <span className="text-[10px] text-slate-400">{statusStats.rejected.pct}% of total</span>
            </div>
          </div>
        </Card>
      </div>

      {/* ── 3. Filters and Search Control Bar ─────────────────────────────────── */}
      <Card>
        <div className="space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-navy-900 uppercase tracking-wider">
                Group Goals Filter & Search
              </span>
              <Badge variant="neutral" size="sm">
                Showing {filteredGoals.length} of {groupGoals.length}
              </Badge>
            </div>

            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="text-xs font-medium text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Clear All Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Search Input */}
            <div className="relative lg:col-span-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search mentee, mentor, goal title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            {/* Mentor Filter */}
            <div>
              <select
                value={selectedMentor}
                onChange={(e) => setSelectedMentor(e.target.value)}
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700"
              >
                <option value="all">All Mentors</option>
                {groupMentors.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Mentee Filter */}
            <div>
              <select
                value={selectedMentee}
                onChange={(e) => setSelectedMentee(e.target.value)}
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700"
              >
                <option value="all">All Mentees</option>
                {groupMentees.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700"
              >
                <option value="all">All Categories</option>
                <option value="Academic">Academic</option>
                <option value="Professional">Professional</option>
                <option value="Personal">Personal</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending_approval">Pending Approval</option>
                <option value="changes_requested">Changes Requested</option>
                <option value="achieved">Achieved</option>
                <option value="not_achieved">Not Achieved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Secondary Row: Trimester and Target Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Trimester</label>
              <select
                value={selectedTrimester}
                onChange={(e) => setSelectedTrimester(e.target.value)}
                className="w-full py-1.5 px-3 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700"
              >
                <option value="all">All Trimesters</option>
                <option value="Trimester 1">Trimester 1</option>
                <option value="Trimester 2">Trimester 2</option>
                <option value="Trimester 3">Trimester 3</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Target Date From</label>
              <input
                type="date"
                value={dateRangeStart}
                onChange={(e) => setDateRangeStart(e.target.value)}
                className="w-full py-1.5 px-3 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Target Date To</label>
              <input
                type="date"
                value={dateRangeEnd}
                onChange={(e) => setDateRangeEnd(e.target.value)}
                className="w-full py-1.5 px-3 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* ── 4. Workspace Navigation Tabs ──────────────────────────────────────── */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-3 text-xs font-bold transition-all relative ${
            activeTab === 'overview'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          All Cohort Goals ({filteredGoals.length})
        </button>

        <button
          onClick={() => setActiveTab('mentors')}
          className={`pb-3 px-3 text-xs font-bold transition-all relative ${
            activeTab === 'mentors'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Mentor Performance ({groupMentors.length})
        </button>

        <button
          onClick={() => setActiveTab('mentees')}
          className={`pb-3 px-3 text-xs font-bold transition-all relative ${
            activeTab === 'mentees'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Mentee Goals ({groupMentees.length})
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`pb-3 px-3 text-xs font-bold transition-all relative ${
            activeTab === 'reviews'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Trimester Reviews ({getCoordinatorTrimesterReviews(coordinatorId).filter(r => r.status === 'finalized').length})
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-3 text-xs font-bold transition-all relative ${
            activeTab === 'history'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Trimester History ({finalizedGoals.length})
        </button>
      </div>

      {/* ── TAB 1: ALL COHORT GOALS (OVERVIEW TABLE) ─────────────────────────── */}
      {activeTab === 'overview' && (
        <Card noPadding>
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-navy-900">Cohort Mentorship Goals Ledger</h3>
            <span className="text-xs text-slate-400">Strictly filtered to {currentUser?.name}'s cohort group</span>
          </div>

          {filteredGoals.length === 0 ? (
            <div className="py-12 text-center">
              <Target className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">No goals found</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No goal records match the selected filter parameters or search terms.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Goal Title & Category</th>
                    <th className="py-3 px-4">Mentee</th>
                    <th className="py-3 px-4">Assigned Mentor</th>
                    <th className="py-3 px-4">Trimester & Target</th>
                    <th className="py-3 px-4">Progress</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredGoals.map((goal) => {
                    const mentee = getUserById(goal.menteeId);
                    const mentor = getMentorById(goal.mentorId);
                    const isAttention = groupStats.attentionGoalIds?.includes(goal.id);

                    return (
                      <tr key={goal.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="flex items-center gap-2 mb-1">
                            {getCategoryBadge(goal.category)}
                            {isAttention && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                <AlertTriangle className="w-2.5 h-2.5" /> Attention
                              </span>
                            )}
                          </div>
                          <p className="font-bold text-slate-900 line-clamp-1">{goal.title}</p>
                          <p className="text-[11px] text-slate-400 line-clamp-1">{goal.description}</p>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <Avatar
                              name={mentee?.name || 'Mentee'}
                              initials={mentee?.initials}
                              color={mentee?.avatarColor}
                              size="xs"
                            />
                            <div>
                              <p className="font-semibold text-slate-800">{mentee?.name || 'Unknown'}</p>
                              <p className="text-[10px] text-slate-400">{mentee?.year || 'Student'}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <Avatar
                              name={mentor?.name || 'Mentor'}
                              initials={mentor?.initials}
                              color={mentor?.avatarColor}
                              size="xs"
                            />
                            <div>
                              <p className="font-semibold text-slate-800">{mentor?.name || 'Unassigned'}</p>
                              <p className="text-[10px] text-slate-400">{mentor?.department || 'Faculty'}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600">
                          <p className="font-medium text-slate-800">{goal.trimester || 'Trimester 2'}</p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3" />
                            {goal.targetDate || 'No date set'}
                          </p>
                        </td>

                        <td className="py-3.5 px-4 min-w-[120px]">
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                            <span>{goal.progress || 0}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                (goal.progress || 0) >= 80
                                  ? 'bg-teal-500'
                                  : (goal.progress || 0) >= 40
                                  ? 'bg-blue-500'
                                  : 'bg-amber-500'
                              }`}
                              style={{ width: `${goal.progress || 0}%` }}
                            />
                          </div>
                        </td>

                        <td className="py-3.5 px-4">{getStatusBadge(goal.status)}</td>

                        <td className="py-3.5 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDetailGoal(goal)}
                            className="text-blue-600 hover:text-blue-700 text-xs py-1"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            Inspect
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* ── TAB: COHORT TRIMESTER REVIEWS (STAGE 6) ─────────────────────────── */}
      {activeTab === 'reviews' && (
        <Card noPadding>
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-navy-900">Cohort Finalized Trimester Reviews</h3>
              <p className="text-xs text-slate-400">
                Supervisory inspection of student overall reflections, verified goal outcome summaries, and mentor sign-offs
              </p>
            </div>
            <Award className="w-5 h-5 text-amber-500" />
          </div>

          {(() => {
            const cohortReviews = getCoordinatorTrimesterReviews(coordinatorId).filter((r) => r.status === 'finalized');

            if (cohortReviews.length === 0) {
              return (
                <div className="py-12 text-center">
                  <Award className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-700">No finalized trimester reviews in this cohort</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Finalized trimester reviews will be archived here once mentors sign off on submitted reflections.
                  </p>
                </div>
              );
            }

            return (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Student Mentee</th>
                      <th className="py-3 px-4">Faculty Mentor</th>
                      <th className="py-3 px-4">Trimester</th>
                      <th className="py-3 px-4">Goal Outcome Summary</th>
                      <th className="py-3 px-4">Mentor Evaluation Summary</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cohortReviews.map((rev) => {
                      const mentee = getUserById(rev.menteeId);
                      const mentor = getMentorById(rev.mentorId);
                      const summary = getMenteeTrimesterGoalSummary(rev.menteeId, rev.trimester);

                      return (
                        <tr key={rev.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-900">{mentee?.name || 'Mentee'}</p>
                            <p className="text-[10px] text-slate-400">{mentee?.year}</p>
                          </td>

                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-slate-800">{mentor?.name || 'Mentor'}</p>
                            <p className="text-[10px] text-slate-400">{mentor?.department}</p>
                          </td>

                          <td className="py-3.5 px-4 font-semibold text-navy-900">{rev.trimester}</td>

                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5 text-[11px]">
                              <span className="font-bold text-teal-700">
                                {summary.overall.achieved}/{summary.overall.total} Goals Achieved ({summary.overall.completionRate}%)
                              </span>
                              <div className="text-[10px] text-slate-500">
                                Acad: {summary.academic.achieved}/{summary.academic.total} • Prof: {summary.professional.achieved}/{summary.professional.total} • Pers: {summary.personal.achieved}/{summary.personal.total}
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 max-w-sm">
                            <p className="text-slate-700 italic bg-slate-50 p-2 rounded-lg border border-slate-200/60 line-clamp-2">
                              "{rev.mentorReview?.overallComments}"
                            </p>
                            {rev.mentorReview?.acknowledgedBy && (
                              <p className="text-[10px] text-slate-500 mt-1">
                                Signed by: <strong>{rev.mentorReview.acknowledgedBy}</strong> on{' '}
                                {new Date(rev.finalizedAt).toLocaleDateString()}
                              </p>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setInspectTrimesterReview(rev)}
                              className="text-blue-600 hover:text-blue-700 text-xs py-1"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1" />
                              Inspect Audit
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </Card>
      )}

      {/* ── TAB 2: MENTOR PERFORMANCE (MENTOR-WISE GOAL OVERVIEW) ────────────── */}
      {activeTab === 'mentors' && (
        <div className="space-y-4">
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Mentor statistics represent supervisory activity indicators across assigned mentees, not employee appraisal scores.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mentorOverviewList.map((item) => {
              const { mentor, allocatedMentees, totalGoals, pending, active, achieved, notAchieved, avgProgress, requiringAttention } = item;

              return (
                <Card key={mentor.id}>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={mentor.name}
                        initials={mentor.initials}
                        color={mentor.avatarColor}
                        size="md"
                      />
                      <div>
                        <h4 className="font-bold text-navy-900 text-sm">{mentor.name}</h4>
                        <p className="text-xs text-slate-500">{mentor.title || 'Faculty Mentor'}</p>
                        <p className="text-[11px] text-slate-400">{mentor.department}</p>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedMentorDetails(item)}
                      className="text-xs"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      View Portfolio
                    </Button>
                  </div>

                  {/* Allocation & Attention badges */}
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="neutral" size="sm">
                      <Users className="w-3 h-3 mr-1 text-slate-500" />
                      {allocatedMentees.length} Allocated Mentees
                    </Badge>
                    {requiringAttention > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        {requiringAttention} need attention
                      </span>
                    ) : (
                      <Badge variant="success" size="sm">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        All goals healthy
                      </Badge>
                    )}
                  </div>

                  {/* Summary metric tiles */}
                  <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-100 text-center">
                    <div className="p-2 rounded-lg bg-slate-50">
                      <span className="text-[10px] font-semibold text-slate-400 block uppercase">Total</span>
                      <span className="text-base font-bold text-slate-800">{totalGoals}</span>
                    </div>

                    <div className="p-2 rounded-lg bg-amber-50/50">
                      <span className="text-[10px] font-semibold text-amber-600 block uppercase">Pending</span>
                      <span className="text-base font-bold text-amber-700">{pending}</span>
                    </div>

                    <div className="p-2 rounded-lg bg-blue-50/50">
                      <span className="text-[10px] font-semibold text-blue-600 block uppercase">Active</span>
                      <span className="text-base font-bold text-blue-700">{active}</span>
                    </div>

                    <div className="p-2 rounded-lg bg-teal-50/50">
                      <span className="text-[10px] font-semibold text-teal-600 block uppercase">Achieved</span>
                      <span className="text-base font-bold text-teal-700">{achieved}</span>
                    </div>
                  </div>

                  {/* Active Progress Bar */}
                  <div className="mt-3 pt-2">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Average Active Progress</span>
                      <span className="font-bold text-slate-800">{avgProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${avgProgress}%` }}
                      />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 3: MENTEE GOALS (MENTEE-WISE GOAL OVERVIEW) ──────────────────── */}
      {activeTab === 'mentees' && (
        <Card noPadding>
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-navy-900">Mentee Goals Portfolio Directory</h3>
            <span className="text-xs text-slate-400">Overview across all student mentees in this cohort</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Mentee</th>
                  <th className="py-3 px-4">Assigned Mentor</th>
                  <th className="py-3 px-4">Academic</th>
                  <th className="py-3 px-4">Professional</th>
                  <th className="py-3 px-4">Personal</th>
                  <th className="py-3 px-4">Total Goals</th>
                  <th className="py-3 px-4">Active & Avg Progress</th>
                  <th className="py-3 px-4">Outcomes</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {menteeOverviewList.map((item) => {
                  const { mentee, assignedMentor, academicCount, professionalCount, personalCount, totalGoals, active, achieved, notAchieved, avgProgress } = item;

                  return (
                    <tr key={mentee.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <Avatar
                            name={mentee.name}
                            initials={mentee.initials}
                            color={mentee.avatarColor}
                            size="sm"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{mentee.name}</p>
                            <p className="text-[11px] text-slate-400">{mentee.year || 'Student'}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {assignedMentor ? (
                          <div className="flex items-center gap-2">
                            <Avatar
                              name={assignedMentor.name}
                              initials={assignedMentor.initials}
                              color={assignedMentor.avatarColor}
                              size="xs"
                            />
                            <div>
                              <p className="font-semibold text-slate-800">{assignedMentor.name}</p>
                              <p className="text-[10px] text-slate-400">Assigned Mentor</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-blue-700">{academicCount}</td>
                      <td className="py-3.5 px-4 font-semibold text-purple-700">{professionalCount}</td>
                      <td className="py-3.5 px-4 font-semibold text-emerald-700">{personalCount}</td>

                      <td className="py-3.5 px-4 font-bold text-slate-900">{totalGoals}</td>

                      <td className="py-3.5 px-4 min-w-[130px]">
                        <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                          <span>{active} active</span>
                          <span>{avgProgress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${avgProgress}%` }}
                          />
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                            {achieved} Achieved
                          </span>
                          {notAchieved > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              {notAchieved} Missed
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedMenteeDetails(item)}
                          className="text-blue-600 hover:text-blue-700 text-xs py-1"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          View Goals
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ── TAB 4: TRIMESTER HISTORY ─────────────────────────────────────────── */}
      {activeTab === 'history' && (
        <Card noPadding>
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-navy-900">Finalized Trimester Goal Records</h3>
              <p className="text-xs text-slate-400">
                Audited goal evaluations and mentor closure comments across completed trimesters
              </p>
            </div>
            <Award className="w-5 h-5 text-amber-500" />
          </div>

          {finalizedGoals.length === 0 ? (
            <div className="py-12 text-center">
              <Award className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">No finalized trimester evaluations yet</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Evaluations will appear here once mentors conclude active goals at the trimester completion milestone.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Goal Title & Category</th>
                    <th className="py-3 px-4">Mentee</th>
                    <th className="py-3 px-4">Evaluator (Mentor)</th>
                    <th className="py-3 px-4">Trimester</th>
                    <th className="py-3 px-4">Outcome</th>
                    <th className="py-3 px-4">Mentor Evaluation Summary</th>
                    <th className="py-3 px-4 text-right">Evaluation Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {finalizedGoals.map((g) => {
                    const mentee = getUserById(g.menteeId);
                    const mentor = getMentorById(g.mentorId);

                    return (
                      <tr key={g.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="mb-1">{getCategoryBadge(g.category)}</div>
                          <p className="font-bold text-slate-900">{g.title}</p>
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-slate-800">{mentee?.name || 'Mentee'}</p>
                          <p className="text-[10px] text-slate-400">{mentee?.year}</p>
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-slate-800">{mentor?.name || 'Mentor'}</p>
                          <p className="text-[10px] text-slate-400">{mentor?.department}</p>
                        </td>

                        <td className="py-3.5 px-4 font-medium text-slate-700">{g.trimester}</td>

                        <td className="py-3.5 px-4">{getStatusBadge(g.status)}</td>

                        <td className="py-3.5 px-4 max-w-md">
                          <p className="text-slate-700 italic bg-slate-50 p-2 rounded-lg border border-slate-200/60 line-clamp-2">
                            "{g.evaluationComment || g.mentorFeedback || 'Goal finalized without additional commentary.'}"
                          </p>
                          {g.recommendations && (
                            <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                              <span className="font-semibold text-slate-600">Recommendations:</span> {g.recommendations}
                            </p>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right text-slate-500">
                          {g.evaluatedAt ? new Date(g.evaluatedAt).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* ── TAB: COHORT TRIMESTER REVIEWS (STAGE 6) ─────────────────────────── */}
      {activeTab === 'reviews' && (
        <Card noPadding>
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-navy-900">Cohort Finalized Trimester Reviews</h3>
              <p className="text-xs text-slate-400">
                Supervisory inspection of student overall reflections, verified goal outcome summaries, and mentor sign-offs
              </p>
            </div>
            <Award className="w-5 h-5 text-amber-500" />
          </div>

          {(() => {
            const cohortReviews = getCoordinatorTrimesterReviews(coordinatorId).filter((r) => r.status === 'finalized');

            if (cohortReviews.length === 0) {
              return (
                <div className="py-12 text-center">
                  <Award className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-700">No finalized trimester reviews in this cohort</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Finalized trimester reviews will be archived here once mentors sign off on submitted reflections.
                  </p>
                </div>
              );
            }

            return (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Student Mentee</th>
                      <th className="py-3 px-4">Faculty Mentor</th>
                      <th className="py-3 px-4">Trimester</th>
                      <th className="py-3 px-4">Goal Outcome Summary</th>
                      <th className="py-3 px-4">Mentor Evaluation Summary</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cohortReviews.map((rev) => {
                      const mentee = getUserById(rev.menteeId);
                      const mentor = getMentorById(rev.mentorId);
                      const summary = getMenteeTrimesterGoalSummary(rev.menteeId, rev.trimester);

                      return (
                        <tr key={rev.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-900">{mentee?.name || 'Mentee'}</p>
                            <p className="text-[10px] text-slate-400">{mentee?.year}</p>
                          </td>

                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-slate-800">{mentor?.name || 'Mentor'}</p>
                            <p className="text-[10px] text-slate-400">{mentor?.department}</p>
                          </td>

                          <td className="py-3.5 px-4 font-semibold text-navy-900">{rev.trimester}</td>

                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5 text-[11px]">
                              <span className="font-bold text-teal-700">
                                {summary.overall.achieved}/{summary.overall.total} Goals Achieved ({summary.overall.completionRate}%)
                              </span>
                              <div className="text-[10px] text-slate-500">
                                Acad: {summary.academic.achieved}/{summary.academic.total} • Prof: {summary.professional.achieved}/{summary.professional.total} • Pers: {summary.personal.achieved}/{summary.personal.total}
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 max-w-sm">
                            <p className="text-slate-700 italic bg-slate-50 p-2 rounded-lg border border-slate-200/60 line-clamp-2">
                              "{rev.mentorReview?.overallComments}"
                            </p>
                            {rev.mentorReview?.acknowledgedBy && (
                              <p className="text-[10px] text-slate-500 mt-1">
                                Signed by: <strong>{rev.mentorReview.acknowledgedBy}</strong> on{' '}
                                {new Date(rev.finalizedAt).toLocaleDateString()}
                              </p>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setInspectTrimesterReview(rev)}
                              className="text-blue-600 hover:text-blue-700 text-xs py-1"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1" />
                              Inspect Audit
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </Card>
      )}

      {/* ── MODAL: INDIVIDUAL GOAL DETAILS AUDIT ─────────────────────────────── */}
      {detailGoal && (
        <Modal
          isOpen={!!detailGoal}
          onClose={() => setDetailGoal(null)}
          title="Goal Details & Supervision Audit"
          size="lg"
        >
          <div className="space-y-5 text-xs">
            {/* Header / Badges */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2">
                {getCategoryBadge(detailGoal.category)}
                {getStatusBadge(detailGoal.status)}
              </div>
              <div className="flex items-center gap-3 text-slate-500">
                <span>{detailGoal.trimester}</span>
                <span>•</span>
                <span>Target: {detailGoal.targetDate || 'No date'}</span>
              </div>
            </div>

            <div>
              <h3 className="text-base font-bold text-navy-900 mb-1">{detailGoal.title}</h3>
              <p className="text-slate-600 leading-relaxed text-xs">{detailGoal.description}</p>
            </div>

            {/* Expected Outcome */}
            {detailGoal.expectedOutcome && (
              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                <span className="text-[11px] font-bold text-blue-900 block mb-1">Expected Success Metric:</span>
                <p className="text-slate-700">{detailGoal.expectedOutcome}</p>
              </div>
            )}

            {/* Progress Section */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-bold text-slate-700">Self-Reported Progress:</span>
                <span className="font-extrabold text-blue-600 text-sm">{detailGoal.progress || 0}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${detailGoal.progress || 0}%` }}
                />
              </div>
            </div>

            {/* Progress Updates Timeline */}
            <div>
              <h4 className="font-bold text-navy-900 text-xs mb-2">Student Check-in Updates</h4>
              {getGoalUpdates(detailGoal.id).length === 0 ? (
                <p className="text-slate-400 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  No check-in updates logged for this goal yet.
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {getGoalUpdates(detailGoal.id).map((up) => (
                    <div key={up.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 mb-1">
                        <span>Progress: {up.progressPercentage}%</span>
                        <span className="text-slate-400">{new Date(up.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-600 text-[11px]">{up.progressNote}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mentor Feedback History */}
            <div>
              <h4 className="font-bold text-navy-900 text-xs mb-2">Mentor Feedback & Audit Trail</h4>
              {getGoalFeedback(detailGoal.id).length === 0 ? (
                <p className="text-slate-400 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  No mentor feedback recorded yet.
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {getGoalFeedback(detailGoal.id).map((fb) => (
                    <div key={fb.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-800 mb-1">
                        <span className="capitalize text-blue-700 font-bold">
                          {fb.type.replace('_', ' ')}
                        </span>
                        <span className="text-slate-400">{new Date(fb.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-700">{fb.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setDetailGoal(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── MODAL: MENTOR PERFORMANCE PORTFOLIO DETAILS ──────────────────────── */}
      {selectedMentorDetails && (
        <Modal
          isOpen={!!selectedMentorDetails}
          onClose={() => setSelectedMentorDetails(null)}
          title={`Mentor Portfolio: ${selectedMentorDetails.mentor.name}`}
          size="lg"
        >
          <div className="space-y-4 text-xs">
            {/* Mentor Overview Header */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <Avatar
                name={selectedMentorDetails.mentor.name}
                initials={selectedMentorDetails.mentor.initials}
                color={selectedMentorDetails.mentor.avatarColor}
                size="md"
              />
              <div>
                <h4 className="font-bold text-navy-900 text-sm">{selectedMentorDetails.mentor.name}</h4>
                <p className="text-xs text-slate-500">{selectedMentorDetails.mentor.title}</p>
                <p className="text-[11px] text-slate-400">{selectedMentorDetails.mentor.email}</p>
              </div>
            </div>

            {/* Stat Row */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Goals</span>
                <p className="text-base font-bold text-slate-800">{selectedMentorDetails.totalGoals}</p>
              </div>
              <div className="p-2 rounded-lg bg-amber-50 border border-amber-100">
                <span className="text-[10px] text-amber-600 uppercase font-semibold">Pending</span>
                <p className="text-base font-bold text-amber-700">{selectedMentorDetails.pending}</p>
              </div>
              <div className="p-2 rounded-lg bg-blue-50 border border-blue-100">
                <span className="text-[10px] text-blue-600 uppercase font-semibold">Active</span>
                <p className="text-base font-bold text-blue-700">{selectedMentorDetails.active}</p>
              </div>
              <div className="p-2 rounded-lg bg-teal-50 border border-teal-100">
                <span className="text-[10px] text-teal-600 uppercase font-semibold">Achieved</span>
                <p className="text-base font-bold text-teal-700">{selectedMentorDetails.achieved}</p>
              </div>
            </div>

            {/* Allocated Mentees List */}
            <div>
              <h5 className="font-bold text-navy-900 mb-2">Allocated Mentees ({selectedMentorDetails.allocatedMentees.length})</h5>
              <div className="flex flex-wrap gap-2">
                {selectedMentorDetails.allocatedMentees.map((mentee) => (
                  <div key={mentee.id} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <Avatar name={mentee.name} initials={mentee.initials} color={mentee.avatarColor} size="xs" />
                    <div>
                      <p className="font-semibold text-slate-800">{mentee.name}</p>
                      <p className="text-[10px] text-slate-400">{mentee.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Goals List */}
            <div>
              <h5 className="font-bold text-navy-900 mb-2">Associated Goals ({selectedMentorDetails.goals.length})</h5>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {selectedMentorDetails.goals.map((g) => {
                  const m = getUserById(g.menteeId);
                  return (
                    <div key={g.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {getCategoryBadge(g.category)}
                          {getStatusBadge(g.status)}
                        </div>
                        <p className="font-bold text-slate-900">{g.title}</p>
                        <p className="text-[11px] text-slate-500">Mentee: {m?.name || 'Unknown'}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-extrabold text-blue-600 text-xs">{g.progress || 0}%</span>
                        <p className="text-[10px] text-slate-400">{g.trimester}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelectedMentorDetails(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── MODAL: MENTEE INDIVIDUAL GOAL OVERVIEW ────────────────────────────── */}
      {selectedMenteeDetails && (
        <Modal
          isOpen={!!selectedMenteeDetails}
          onClose={() => setSelectedMenteeDetails(null)}
          title={`Mentee Goals: ${selectedMenteeDetails.mentee.name}`}
          size="lg"
        >
          <div className="space-y-4 text-xs">
            {/* Header */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                <Avatar
                  name={selectedMenteeDetails.mentee.name}
                  initials={selectedMenteeDetails.mentee.initials}
                  color={selectedMenteeDetails.mentee.avatarColor}
                  size="md"
                />
                <div>
                  <h4 className="font-bold text-navy-900 text-sm">{selectedMenteeDetails.mentee.name}</h4>
                  <p className="text-xs text-slate-500">{selectedMenteeDetails.mentee.year}</p>
                  <p className="text-[11px] text-slate-400">
                    Mentor: {selectedMenteeDetails.assignedMentor?.name || 'Unassigned'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Goals</span>
                <p className="text-xl font-black text-navy-900">{selectedMenteeDetails.totalGoals}</p>
              </div>
            </div>

            {/* Categorized Goals list */}
            {['Academic', 'Professional', 'Personal'].map((cat) => {
              const catGoals = selectedMenteeDetails.goals.filter((g) => g.category === cat);

              return (
                <div key={cat} className="space-y-2">
                  <h5 className="font-bold text-navy-900 flex items-center justify-between border-b border-slate-100 pb-1">
                    <span>{cat} Goals</span>
                    <span className="text-slate-400 font-normal">({catGoals.length})</span>
                  </h5>

                  {catGoals.length === 0 ? (
                    <p className="text-slate-400 italic py-1">No {cat.toLowerCase()} goals submitted.</p>
                  ) : (
                    <div className="space-y-2">
                      {catGoals.map((g) => (
                        <div key={g.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-bold text-slate-900 text-xs">{g.title}</span>
                            {getStatusBadge(g.status)}
                          </div>
                          <p className="text-slate-600 text-[11px] mb-2">{g.description}</p>
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span>Target: {g.targetDate || 'None'}</span>
                            <span className="font-semibold text-blue-600">Progress: {g.progress || 0}%</span>
                          </div>
                          {g.mentorFeedback && (
                            <div className="mt-2 p-2 rounded-lg bg-white border border-slate-200/80 text-[11px] text-slate-700">
                              <span className="font-semibold text-slate-900">Mentor Feedback: </span>
                              {g.mentorFeedback}
                            </div>
                          )}
                          {g.evaluationComment && (
                            <div className="mt-2 p-2 rounded-lg bg-teal-50 border border-teal-200 text-[11px] text-teal-900">
                              <span className="font-semibold">Evaluation: </span>
                              {g.evaluationComment}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelectedMenteeDetails(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── MODAL: COORDINATOR INSPECT TRIMESTER REVIEW ─────────────────────── */}
      {inspectTrimesterReview && (
        <Modal
          isOpen={!!inspectTrimesterReview}
          onClose={() => setInspectTrimesterReview(null)}
          title={`Cohort Trimester Review: ${inspectTrimesterReview.trimester}`}
          size="lg"
        >
          <div className="space-y-4 text-xs max-h-[75vh] overflow-y-auto pr-1">
            {/* Header Box */}
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-200">
              <div>
                <p className="font-bold text-navy-900 text-sm">
                  {getUserById(inspectTrimesterReview.menteeId)?.name}
                </p>
                <p className="text-[11px] text-slate-500">
                  Assigned Mentor: {getMentorById(inspectTrimesterReview.mentorId)?.name}
                </p>
              </div>
              <Badge variant="success">Finalized</Badge>
            </div>

            {/* Goal Outcome Summary Bar */}
            {(() => {
              const sum = getMenteeTrimesterGoalSummary(inspectTrimesterReview.menteeId, inspectTrimesterReview.trimester);
              return (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold text-navy-900">
                    <span>Goal Outcome Summary</span>
                    <span className="text-teal-700 font-extrabold">{sum.overall.completionRate}% Achieved</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center text-[11px] pt-1">
                    <div className="p-1.5 bg-white rounded border border-slate-100">
                      <span className="text-slate-400 block text-[10px]">TOTAL</span>
                      <span className="font-bold">{sum.overall.total}</span>
                    </div>
                    <div className="p-1.5 bg-blue-50/50 rounded border border-blue-100">
                      <span className="text-blue-600 block text-[10px]">ACADEMIC</span>
                      <span className="font-bold">{sum.academic.achieved}/{sum.academic.total}</span>
                    </div>
                    <div className="p-1.5 bg-purple-50/50 rounded border border-purple-100">
                      <span className="text-purple-600 block text-[10px]">PROFESSIONAL</span>
                      <span className="font-bold">{sum.professional.achieved}/{sum.professional.total}</span>
                    </div>
                    <div className="p-1.5 bg-amber-50/50 rounded border border-amber-100">
                      <span className="text-amber-600 block text-[10px]">PERSONAL</span>
                      <span className="font-bold">{sum.personal.achieved}/{sum.personal.total}</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Mentor Evaluation */}
            {inspectTrimesterReview.mentorReview && (
              <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-xl text-teal-950 space-y-2">
                <h4 className="font-bold text-xs flex items-center gap-1.5 text-teal-900 border-b border-teal-200 pb-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  Mentor Evaluation & Acknowledgment
                </h4>
                <p className="text-xs">
                  <strong>Comments: </strong>
                  <span className="italic">"{inspectTrimesterReview.mentorReview.overallComments}"</span>
                </p>
                {inspectTrimesterReview.mentorReview.recommendations && (
                  <p className="text-xs">
                    <strong>Recommendations: </strong>
                    {inspectTrimesterReview.mentorReview.recommendations}
                  </p>
                )}
                {inspectTrimesterReview.mentorReview.nextTrimesterPriorities && (
                  <p className="text-xs">
                    <strong>Next Priorities: </strong>
                    {inspectTrimesterReview.mentorReview.nextTrimesterPriorities}
                  </p>
                )}
                <div className="pt-2 border-t border-teal-200 flex justify-between text-[11px] text-teal-800">
                  <span>Acknowledged by: <strong>{inspectTrimesterReview.mentorReview.acknowledgedBy}</strong></span>
                  <span>{new Date(inspectTrimesterReview.finalizedAt).toLocaleDateString()}</span>
                </div>
              </div>
            )}

            {/* Mentee Reflections */}
            <div className="space-y-2.5">
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <h5 className="font-bold text-blue-900">Academic Reflection</h5>
                <p><strong>Achievements:</strong> {inspectTrimesterReview.reflections?.academic?.achievements || 'None'}</p>
                <p><strong>Challenges:</strong> {inspectTrimesterReview.reflections?.academic?.challenges || 'None'}</p>
                <p><strong>Improvements:</strong> {inspectTrimesterReview.reflections?.academic?.improvements || 'None'}</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <h5 className="font-bold text-purple-900">Professional Reflection</h5>
                <p><strong>Skills Developed:</strong> {inspectTrimesterReview.reflections?.professional?.skillsDeveloped || 'None'}</p>
                <p><strong>Career Progress:</strong> {inspectTrimesterReview.reflections?.professional?.careerProgress || 'None'}</p>
                <p><strong>Next Focus:</strong> {inspectTrimesterReview.reflections?.professional?.nextFocus || 'None'}</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <h5 className="font-bold text-amber-900">Personal Reflection</h5>
                <p><strong>Improvements:</strong> {inspectTrimesterReview.reflections?.personal?.improvements || 'None'}</p>
                <p><strong>Challenges Overcome:</strong> {inspectTrimesterReview.reflections?.personal?.challengesOvercome || 'None'}</p>
                <p><strong>Next Priorities:</strong> {inspectTrimesterReview.reflections?.personal?.nextPriorities || 'None'}</p>
              </div>

              <div className="p-3 bg-blue-50/40 rounded-xl border border-blue-200 space-y-1">
                <h5 className="font-bold text-navy-950">Overall Reflection</h5>
                <p><strong>Major Achievements:</strong> {inspectTrimesterReview.reflections?.overall?.majorAchievements}</p>
                <p><strong>Areas For Improvement:</strong> {inspectTrimesterReview.reflections?.overall?.areasForImprovement}</p>
                <p><strong>Next Trimester Priorities:</strong> {inspectTrimesterReview.reflections?.overall?.nextTrimesterPriorities}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setInspectTrimesterReview(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
