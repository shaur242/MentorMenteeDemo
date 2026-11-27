import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  GraduationCap,
  Briefcase,
  Sparkles,
  Calendar,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  History,
  FileText,
  UserCheck,
  ChevronRight,
  Award,
  Layers,
  Info,
  XCircle,
  Search,
  Filter,
  User,
  ExternalLink,
  Users,
  Check,
  Send,
  SlidersHorizontal,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

export default function MentorGoalsPage() {
  const {
    currentUser,
    getMentorAllocatedMentees,
    getMentorGoals,
    getGoalUpdates,
    getGoalFeedback,
    getUserById,
    approveGoal,
    requestGoalChanges,
    rejectGoal,
    addMentorGoalFeedback,
    evaluateGoal,
    trimesterReviews,
    getMentorTrimesterReviews,
    getMenteeTrimesterGoalSummary,
    finalizeTrimesterReview,
  } = useApp();

  const navigate = useNavigate();

  // Active trimester filter
  const [selectedTrimester, setSelectedTrimester] = useState('All');

  // Active navigation tab: 'overview' | 'approvals' | 'active' | 'mentees' | 'history'
  const [activeTab, setActiveTab] = useState('overview');

  // Sub-filter for specific mentee (used in Active tab and Mentees tab)
  const [selectedMenteeFilter, setSelectedMenteeFilter] = useState('all');

  // Search query
  const [searchQuery, setSearchQuery] = useState('');

  // Selected mentee for detailed view in 'mentees' tab
  const [activeMenteeView, setActiveMenteeView] = useState(null);

  // Notification message
  const [notification, setNotification] = useState(null);

  // Modals state
  const [detailsModalGoal, setDetailsModalGoal] = useState(null);
  const [approveModalGoal, setApproveModalGoal] = useState(null);
  const [approvalFeedback, setApprovalFeedback] = useState('');
  const [requestChangesModalGoal, setRequestChangesModalGoal] = useState(null);
  const [changesFeedback, setChangesFeedback] = useState('');
  const [rejectModalGoal, setRejectModalGoal] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [feedbackModalGoal, setFeedbackModalGoal] = useState(null);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [evaluateModalGoal, setEvaluateModalGoal] = useState(null);
  const [evaluationForm, setEvaluationForm] = useState({
    outcome: 'achieved',
    evaluationComment: '',
    recommendations: '',
  });

  // Action error state
  const [actionError, setActionError] = useState('');

  // Trimester Reviews State (Stage 6)
  const [selectedReviewTrimesterFilter, setSelectedReviewTrimesterFilter] = useState('All');
  const [selectedReviewStatusFilter, setSelectedReviewStatusFilter] = useState('All');
  const [finalizeModalReview, setFinalizeModalReview] = useState(null);
  const [finalizeForm, setFinalizeForm] = useState({
    overallComments: '',
    recommendations: '',
    nextTrimesterPriorities: '',
    acknowledgedBy: '',
  });
  const [finalizeError, setFinalizeError] = useState('');
  const [inspectReviewModal, setInspectReviewModal] = useState(null);

  // Get mentor's officially allocated mentees
  const allocatedMentees = useMemo(() => {
    if (!currentUser) return [];
    return getMentorAllocatedMentees(currentUser.id).map((a) => {
      const menteeObj = a.mentee || getUserById(a.menteeId);
      return {
        ...a,
        mentee: menteeObj,
      };
    });
  }, [currentUser, getMentorAllocatedMentees, getUserById]);

  // Get all goals belonging to this mentor's allocated mentees
  const mentorGoals = useMemo(() => {
    if (!currentUser) return [];
    return getMentorGoals(currentUser.id);
  }, [currentUser, getMentorGoals]);

  // Filter goals by trimester
  const trimesterGoals = useMemo(() => {
    if (selectedTrimester === 'All') return mentorGoals;
    return mentorGoals.filter((g) => g.trimester === selectedTrimester);
  }, [mentorGoals, selectedTrimester]);

  // Goals grouped by status
  const pendingApprovals = useMemo(() => {
    return trimesterGoals.filter((g) => g.status === 'pending_approval');
  }, [trimesterGoals]);

  const activeGoals = useMemo(() => {
    return trimesterGoals.filter((g) => g.status === 'active');
  }, [trimesterGoals]);

  const historyGoals = useMemo(() => {
    return trimesterGoals.filter(
      (g) => g.status === 'achieved' || g.status === 'not_achieved' || g.status === 'rejected'
    );
  }, [trimesterGoals]);

  const changesRequestedGoals = useMemo(() => {
    return trimesterGoals.filter((g) => g.status === 'changes_requested');
  }, [trimesterGoals]);

  // Dynamic Statistics
  const stats = useMemo(() => {
    const total = trimesterGoals.length;
    const pending = pendingApprovals.length;
    const active = activeGoals.length;
    const achieved = trimesterGoals.filter((g) => g.status === 'achieved').length;
    // Requiring attention: changes_requested OR pending_approval OR active goals with progress < 40%
    const requiringAttention = trimesterGoals.filter(
      (g) =>
        g.status === 'changes_requested' ||
        g.status === 'pending_approval' ||
        (g.status === 'active' && (g.progress || 0) < 40)
    ).length;

    return { total, pending, active, achieved, requiringAttention };
  }, [trimesterGoals, pendingApprovals, activeGoals]);

  // Active goals filtered by selected mentee & search
  const filteredActiveGoals = useMemo(() => {
    return activeGoals.filter((g) => {
      if (selectedMenteeFilter !== 'all' && g.menteeId !== selectedMenteeFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mentee = getUserById(g.menteeId);
        const titleMatch = g.title?.toLowerCase().includes(q);
        const descMatch = g.description?.toLowerCase().includes(q);
        const menteeMatch = mentee?.name?.toLowerCase().includes(q);
        return titleMatch || descMatch || menteeMatch;
      }
      return true;
    });
  }, [activeGoals, selectedMenteeFilter, searchQuery, getUserById]);

  // Category Badge helper
  const renderCategoryBadge = (category) => {
    switch (category) {
      case 'Academic':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <GraduationCap className="w-3 h-3" />
            Academic
          </span>
        );
      case 'Professional':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Briefcase className="w-3 h-3" />
            Professional
          </span>
        );
      case 'Personal':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Sparkles className="w-3 h-3" />
            Personal
          </span>
        );
      default:
        return <Badge size="sm">{category}</Badge>;
    }
  };

  // Status Badge helper
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'pending_approval':
        return (
          <Badge variant="warning" size="sm" className="font-semibold">
            <Clock className="w-3 h-3 mr-1" />
            Pending Approval
          </Badge>
        );
      case 'changes_requested':
        return (
          <Badge variant="danger" size="sm" className="font-semibold bg-amber-100 text-amber-900 border-amber-300">
            <AlertCircle className="w-3 h-3 mr-1" />
            Changes Requested
          </Badge>
        );
      case 'active':
        return (
          <Badge variant="success" size="sm" className="font-semibold">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case 'achieved':
        return (
          <Badge variant="navy" size="sm" className="font-semibold">
            <Award className="w-3 h-3 mr-1 text-amber-400" />
            Achieved
          </Badge>
        );
      case 'not_achieved':
        return (
          <Badge variant="default" size="sm" className="font-semibold text-slate-600 bg-slate-100">
            Not Achieved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="danger" size="sm" className="font-semibold">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge size="sm">{status}</Badge>;
    }
  };

  // Progress color helper
  const getProgressBarColor = (progress) => {
    if (progress >= 100) return 'bg-emerald-500';
    if (progress >= 60) return 'bg-brand-600';
    if (progress >= 30) return 'bg-blue-500';
    return 'bg-amber-500';
  };

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleApproveSubmit = (e) => {
    e.preventDefault();
    if (!approveModalGoal) return;
    setActionError('');

    const res = approveGoal(approveModalGoal.id, approvalFeedback, currentUser.id);
    if (res.success) {
      setApproveModalGoal(null);
      setApprovalFeedback('');
      setNotification({
        type: 'success',
        message: `Goal "${approveModalGoal.title}" was approved and is now Active for the student.`,
      });
      setTimeout(() => setNotification(null), 5000);
    } else {
      setActionError(res.error || 'Failed to approve goal.');
    }
  };

  const handleRequestChangesSubmit = (e) => {
    e.preventDefault();
    if (!requestChangesModalGoal) return;
    setActionError('');

    if (!changesFeedback.trim()) {
      setActionError('Feedback comment is required when requesting changes.');
      return;
    }

    const res = requestGoalChanges(requestChangesModalGoal.id, changesFeedback, currentUser.id);
    if (res.success) {
      setRequestChangesModalGoal(null);
      setChangesFeedback('');
      setNotification({
        type: 'success',
        message: `Changes requested on goal "${requestChangesModalGoal.title}". The student has been notified.`,
      });
      setTimeout(() => setNotification(null), 5000);
    } else {
      setActionError(res.error || 'Failed to request changes.');
    }
  };

  const handleRejectSubmit = (e) => {
    e.preventDefault();
    if (!rejectModalGoal) return;
    setActionError('');

    if (!rejectionReason.trim()) {
      setActionError('Rejection reason is mandatory.');
      return;
    }

    const res = rejectGoal(rejectModalGoal.id, rejectionReason, currentUser.id);
    if (res.success) {
      setRejectModalGoal(null);
      setRejectionReason('');
      setNotification({
        type: 'success',
        message: `Goal "${rejectModalGoal.title}" was rejected and recorded in historical records.`,
      });
      setTimeout(() => setNotification(null), 5000);
    } else {
      setActionError(res.error || 'Failed to reject goal.');
    }
  };

  const handleAddFeedbackSubmit = (e) => {
    e.preventDefault();
    if (!feedbackModalGoal) return;
    setActionError('');

    if (!feedbackComment.trim()) {
      setActionError('Feedback comment cannot be empty.');
      return;
    }

    const res = addMentorGoalFeedback(feedbackModalGoal.id, feedbackComment, currentUser.id);
    if (res.success) {
      setFeedbackModalGoal(null);
      setFeedbackComment('');
      setNotification({
        type: 'success',
        message: `Feedback added to goal "${feedbackModalGoal.title}". Preserved in feedback history.`,
      });
      setTimeout(() => setNotification(null), 5000);
    } else {
      setActionError(res.error || 'Failed to add feedback.');
    }
  };

  const handleEvaluateSubmit = (e) => {
    e.preventDefault();
    if (!evaluateModalGoal) return;
    setActionError('');

    if (!evaluationForm.evaluationComment.trim()) {
      setActionError('Evaluation comments are mandatory.');
      return;
    }

    const res = evaluateGoal(
      {
        goalId: evaluateModalGoal.id,
        outcome: evaluationForm.outcome,
        evaluationComment: evaluationForm.evaluationComment,
        recommendations: evaluationForm.recommendations,
      },
      currentUser.id
    );

    if (res.success) {
      setEvaluateModalGoal(null);
      setEvaluationForm({ outcome: 'achieved', evaluationComment: '', recommendations: '' });
      setNotification({
        type: 'success',
        message: `Goal "${evaluateModalGoal.title}" finalized as "${
          evaluationForm.outcome === 'achieved' ? 'Achieved' : 'Not Achieved'
        }". Saved to Goal History.`,
      });
      setTimeout(() => setNotification(null), 5000);
    } else {
      setActionError(res.error || 'Failed to evaluate goal.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <PageHeader
        title="Goals Management"
        subtitle="Review mentee goals, monitor progress and evaluate trimester outcomes."
        breadcrumbs={['Mentor', 'Goals Management']}
      >
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Trimester Selector */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-400 px-2 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" /> Trimester:
            </span>
            {['All', 'Trimester 1', 'Trimester 2', 'Trimester 3'].map((tri) => (
              <button
                key={tri}
                onClick={() => setSelectedTrimester(tri)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  selectedTrimester === tri
                    ? 'bg-navy-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-navy-900'
                }`}
              >
                {tri}
              </button>
            ))}
          </div>

          <Badge variant="navy" size="md">
            {allocatedMentees.length} Allocated Mentees
          </Badge>
        </div>
      </PageHeader>

      {/* ── Notification Banner ───────────────────────────────────────────── */}
      {notification && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-2xs animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-xs text-emerald-700 hover:text-emerald-950 font-bold ml-4 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── Dashboard Statistics Cards (5 Cards) ──────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Goals */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Goals</p>
            <p className="text-2xl font-black text-navy-900 mt-1">{stats.total}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{selectedTrimester} records</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
        </div>

        {/* Pending Approval */}
        <div
          onClick={() => setActiveTab('approvals')}
          className="bg-white rounded-2xl border border-amber-200 p-4 shadow-2xs flex items-center justify-between cursor-pointer hover:border-amber-300 hover:shadow-xs transition-all"
        >
          <div>
            <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Pending Approval</p>
            <p className="text-2xl font-black text-amber-800 mt-1">{stats.pending}</p>
            <p className="text-[10px] text-amber-600 font-semibold mt-0.5">Action Required</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Active Goals */}
        <div
          onClick={() => setActiveTab('active')}
          className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex items-center justify-between cursor-pointer hover:border-slate-300 transition-all"
        >
          <div>
            <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Active Goals</p>
            <p className="text-2xl font-black text-emerald-800 mt-1">{stats.active}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">In Progress</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Achieved Goals */}
        <div
          onClick={() => setActiveTab('history')}
          className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex items-center justify-between cursor-pointer hover:border-slate-300 transition-all"
        >
          <div>
            <p className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">Achieved Goals</p>
            <p className="text-2xl font-black text-purple-800 mt-1">{stats.achieved}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Evaluated</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>

        {/* Goals Requiring Attention */}
        <div className="bg-white rounded-2xl border border-rose-200/90 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Requiring Attention</p>
            <p className="text-2xl font-black text-rose-800 mt-1">{stats.requiringAttention}</p>
            <p className="text-[10px] text-rose-600 mt-0.5">Pending or Slow</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── Internal Tab Navigation ───────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { key: 'overview', label: 'Overview', icon: Layers, count: null },
          { key: 'approvals', label: 'Pending Approvals', icon: Clock, count: pendingApprovals.length, alert: pendingApprovals.length > 0 },
          { key: 'active', label: 'Active Goals', icon: TrendingUp, count: activeGoals.length },
          { key: 'reviews', label: 'Trimester Reviews', icon: FileText, count: getMentorTrimesterReviews(currentUser?.id).filter(r => r.status === 'submitted').length, alert: getMentorTrimesterReviews(currentUser?.id).some(r => r.status === 'submitted') },
          { key: 'mentees', label: 'Mentee Goals', icon: Users, count: allocatedMentees.length },
          { key: 'history', label: 'Goal History', icon: History, count: historyGoals.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                if (tab.key !== 'mentees') setActiveMenteeView(null);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                isSelected
                  ? 'bg-navy-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : tab.alert
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: OVERVIEW ────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Pending Approvals Queue + Attention Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pending Approvals Callout */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-navy-900">Pending Goal Proposals</h3>
                    <p className="text-[11px] text-slate-500">Mentees awaiting your faculty review and authorization</p>
                  </div>
                </div>
                {pendingApprovals.length > 0 && (
                  <Button variant="secondary" size="xs" onClick={() => setActiveTab('approvals')}>
                    View All ({pendingApprovals.length})
                  </Button>
                )}
              </div>

              {pendingApprovals.length > 0 ? (
                <div className="space-y-3">
                  {pendingApprovals.slice(0, 3).map((goal) => {
                    const mentee = getUserById(goal.menteeId);
                    return (
                      <div
                        key={goal.id}
                        className="p-4 rounded-xl border border-amber-200/80 bg-amber-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <Avatar user={mentee} size="sm" className="mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-bold text-xs text-navy-900 truncate">
                                {mentee?.name || 'Allocated Mentee'}
                              </span>
                              {renderCategoryBadge(goal.category)}
                              <span className="text-[10px] text-slate-400 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                                {goal.trimester}
                              </span>
                            </div>
                            <h4 className="text-xs font-semibold text-slate-800 truncate">{goal.title}</h4>
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                              {goal.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                          <Button
                            variant="primary"
                            size="xs"
                            onClick={() => {
                              setApproveModalGoal(goal);
                              setApprovalFeedback('');
                            }}
                            icon={Check}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="secondary"
                            size="xs"
                            onClick={() => {
                              setRequestChangesModalGoal(goal);
                              setChangesFeedback('');
                            }}
                          >
                            Changes
                          </Button>
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => setDetailsModalGoal(goal)}
                          >
                            Details
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                  All submitted mentee goals have been reviewed! No pending approvals.
                </div>
              )}
            </div>

            {/* Active Goals Snapshot */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-navy-900">Active Goals in Progress</h3>
                    <p className="text-[11px] text-slate-500">Monitoring milestone completion and mentorship feedback</p>
                  </div>
                </div>
                <Button variant="secondary" size="xs" onClick={() => setActiveTab('active')}>
                  View Active Goals ({activeGoals.length})
                </Button>
              </div>

              {activeGoals.length > 0 ? (
                <div className="space-y-3">
                  {activeGoals.slice(0, 4).map((goal) => {
                    const mentee = getUserById(goal.menteeId);
                    return (
                      <div
                        key={goal.id}
                        className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0 space-y-1.5 flex-1 pr-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-navy-900">{mentee?.name}</span>
                            {renderCategoryBadge(goal.category)}
                            <span className="text-[10px] text-slate-400">Target: {goal.targetDate}</span>
                          </div>
                          <p className="font-semibold text-slate-800 truncate">{goal.title}</p>
                          <div className="flex items-center gap-2">
                            <div className="w-36 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${getProgressBarColor(goal.progress)}`}
                                style={{ width: `${goal.progress}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-bold text-navy-900">{goal.progress}%</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0 self-end sm:self-center">
                          <Button
                            variant="secondary"
                            size="xs"
                            onClick={() => {
                              setFeedbackModalGoal(goal);
                              setFeedbackComment('');
                            }}
                            icon={MessageSquare}
                          >
                            Feedback
                          </Button>
                          <Button
                            variant="primary"
                            size="xs"
                            onClick={() => {
                              setEvaluateModalGoal(goal);
                              setEvaluationForm({ outcome: 'achieved', evaluationComment: '', recommendations: '' });
                            }}
                            icon={Award}
                          >
                            Evaluate
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-center bg-slate-50 rounded-xl text-xs text-slate-400">
                  No active goals in progress currently.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Mentee Progress Distribution */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-brand-600" />
                  Allocated Mentee Roster
                </h3>
                <span className="text-xs font-semibold text-slate-400">
                  {allocatedMentees.length} Students
                </span>
              </div>

              <div className="space-y-3">
                {allocatedMentees.map((item) => {
                  const mGoals = mentorGoals.filter((g) => g.menteeId === item.menteeId);
                  const mActive = mGoals.filter((g) => g.status === 'active').length;
                  const mPending = mGoals.filter((g) => g.status === 'pending_approval').length;
                  const mAchieved = mGoals.filter((g) => g.status === 'achieved').length;

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setActiveMenteeView(item);
                        setActiveTab('mentees');
                      }}
                      className="p-3.5 rounded-xl border border-slate-200 hover:border-brand-300 hover:bg-brand-50/20 transition-all cursor-pointer text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Avatar user={item.mentee} size="sm" />
                          <div>
                            <h4 className="font-bold text-navy-900 text-xs leading-tight">
                              {item.mentee?.name || 'Assigned Mentee'}
                            </h4>
                            <p className="text-[10px] text-slate-400">
                              {item.mentee?.year || item.mentee?.department}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>

                      <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] pt-1 border-t border-slate-100">
                        <div className="p-1 rounded bg-slate-50 font-medium">
                          <span className="text-slate-400 block text-[9px]">ACTIVE</span>
                          <span className="font-bold text-navy-900">{mActive}</span>
                        </div>
                        <div className="p-1 rounded bg-amber-50 font-medium">
                          <span className="text-amber-600 block text-[9px]">PENDING</span>
                          <span className="font-bold text-amber-800">{mPending}</span>
                        </div>
                        <div className="p-1 rounded bg-purple-50 font-medium">
                          <span className="text-purple-600 block text-[9px]">ACHIEVED</span>
                          <span className="font-bold text-purple-800">{mAchieved}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Policy Notice */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs text-slate-600 space-y-2">
              <h4 className="font-bold text-navy-900 flex items-center gap-1.5 text-xs">
                <Info className="w-3.5 h-3.5 text-brand-600" />
                Faculty Evaluation Authority
              </h4>
              <p className="text-[11px] leading-relaxed text-slate-500">
                Mentees record progress and milestone notes during term execution. Final completion requires faculty
                mentor review to certify achievement rubric standards.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: PENDING APPROVALS ──────────────────────────────────────── */}
      {activeTab === 'approvals' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-navy-900">Pending Goal Approvals</h3>
              <p className="text-xs text-slate-500">
                Review proposed mentee goals. Approve for term tracking, request clarifying adjustments, or reject with a reason.
              </p>
            </div>
            <Badge variant="warning">{pendingApprovals.length} Pending Approval</Badge>
          </div>

          {pendingApprovals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {pendingApprovals.map((goal) => {
                const mentee = getUserById(goal.menteeId);
                return (
                  <div
                    key={goal.id}
                    className="bg-white rounded-2xl border border-amber-200 p-5 shadow-2xs flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      {/* Mentee Header */}
                      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar user={mentee} size="md" />
                          <div>
                            <h4 className="font-bold text-navy-900 text-sm">{mentee?.name}</h4>
                            <p className="text-[11px] text-slate-400">
                              {mentee?.year || mentee?.department}
                            </p>
                          </div>
                        </div>
                        {renderCategoryBadge(goal.category)}
                      </div>

                      {/* Goal Title & Trimester */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                          {goal.trimester}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Submitted {new Date(goal.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-navy-900">{goal.title}</h4>

                      {/* Description */}
                      <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {goal.description}
                      </p>

                      {/* Expected Outcome */}
                      <div className="p-3 bg-brand-50/50 rounded-xl border border-brand-100 text-xs">
                        <span className="font-bold text-brand-900 block text-[11px] mb-0.5">
                          Expected Measurable Outcome:
                        </span>
                        <p className="text-slate-700 leading-relaxed">{goal.expectedOutcome}</p>
                      </div>

                      {/* Target Date & Notes */}
                      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <Calendar className="w-3.5 h-3.5 text-brand-600" />
                          Target: {goal.targetDate}
                        </span>
                        {goal.notes && (
                          <span className="italic text-slate-500 max-w-xs truncate">
                            Note: "{goal.notes}"
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => setDetailsModalGoal(goal)}
                      >
                        Full Details
                      </Button>

                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="danger"
                          size="xs"
                          onClick={() => {
                            setRejectModalGoal(goal);
                            setRejectionReason('');
                          }}
                        >
                          Reject
                        </Button>
                        <Button
                          variant="secondary"
                          size="xs"
                          onClick={() => {
                            setRequestChangesModalGoal(goal);
                            setChangesFeedback('');
                          }}
                        >
                          Request Changes
                        </Button>
                        <Button
                          variant="primary"
                          size="xs"
                          onClick={() => {
                            setApproveModalGoal(goal);
                            setApprovalFeedback('');
                          }}
                          icon={Check}
                        >
                          Approve Goal
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-navy-900">No Goals Pending Approval</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                You have addressed all proposed goals submitted by your allocated mentees.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: ACTIVE GOALS MONITORING ────────────────────────────────── */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-navy-900">Active Goals Monitoring</h3>
              <p className="text-xs text-slate-500">
                Track ongoing progress milestones, provide mentorship guidance, and conduct final trimester evaluations.
              </p>
            </div>

            {/* Filter by mentee and search */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedMenteeFilter}
                onChange={(e) => setSelectedMenteeFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-navy-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="all">All Allocated Students</option>
                {allocatedMentees.map((item) => (
                  <option key={item.menteeId} value={item.menteeId}>
                    {item.mentee?.name}
                  </option>
                ))}
              </select>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search goals..."
                  className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none w-44"
                />
              </div>
            </div>
          </div>

          {filteredActiveGoals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredActiveGoals.map((goal) => {
                const mentee = getUserById(goal.menteeId);
                const updates = getGoalUpdates(goal.id);
                const latestUpdate = updates[0];

                return (
                  <div
                    key={goal.id}
                    className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 p-5 shadow-2xs transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      {/* Mentee & Category */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <Avatar user={mentee} size="sm" />
                          <div>
                            <h4 className="font-bold text-navy-900 text-xs">{mentee?.name}</h4>
                            <span className="text-[10px] text-slate-400">{goal.trimester}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {renderCategoryBadge(goal.category)}
                          {renderStatusBadge(goal.status)}
                        </div>
                      </div>

                      {/* Goal Title */}
                      <h4 className="text-base font-bold text-navy-900 leading-snug">{goal.title}</h4>

                      {/* Description */}
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {goal.description}
                      </p>

                      {/* Expected Outcome */}
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                        <span className="font-bold text-slate-700 block text-[11px] mb-0.5">
                          Expected Outcome:
                        </span>
                        <p className="text-slate-600 line-clamp-2 text-xs">{goal.expectedOutcome}</p>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-500">Mentee Reported Progress</span>
                          <span className="text-navy-900 font-bold">{goal.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${getProgressBarColor(goal.progress)}`}
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Latest Progress Note if available */}
                      {latestUpdate && (
                        <div className="p-2.5 rounded-xl bg-blue-50/40 border border-blue-100 text-xs space-y-0.5">
                          <span className="text-[10px] font-bold text-brand-900 uppercase">
                            Latest Update ({new Date(latestUpdate.createdAt).toLocaleDateString()}):
                          </span>
                          <p className="text-[11px] text-slate-700 line-clamp-1 italic">
                            "{latestUpdate.progressNote}"
                          </p>
                        </div>
                      )}

                      {/* Target Date */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span className="flex items-center gap-1 text-slate-600 font-medium">
                          <Calendar className="w-3 h-3 text-slate-400" /> Target Date: {goal.targetDate}
                        </span>
                        <span>Updated: {new Date(goal.updatedAt || goal.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setDetailsModalGoal(goal)}
                        className="text-xs font-semibold text-brand-700 hover:text-brand-900 cursor-pointer flex items-center gap-1"
                      >
                        View Details
                      </button>

                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="secondary"
                          size="xs"
                          onClick={() => {
                            setFeedbackModalGoal(goal);
                            setFeedbackComment('');
                          }}
                          icon={MessageSquare}
                        >
                          Add Feedback
                        </Button>
                        <Button
                          variant="primary"
                          size="xs"
                          onClick={() => {
                            setEvaluateModalGoal(goal);
                            setEvaluationForm({ outcome: 'achieved', evaluationComment: '', recommendations: '' });
                          }}
                          icon={Award}
                        >
                          Evaluate Goal
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500">
              No active goals match the current filters.
            </div>
          )}
        </div>
      )}

      {/* ── TAB: TRIMESTER REVIEWS (STAGE 6) ─────────────────────────────────── */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-600" />
                  Mentee Overall Trimester Reviews
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Inspect student self-reflections, verify goal outcome summaries, and finalize trimester evaluations.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <select
                  value={selectedReviewTrimesterFilter}
                  onChange={(e) => setSelectedReviewTrimesterFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700"
                >
                  <option value="All">All Trimesters</option>
                  <option value="Trimester 1">Trimester 1</option>
                  <option value="Trimester 2">Trimester 2</option>
                  <option value="Trimester 3">Trimester 3</option>
                </select>

                <select
                  value={selectedReviewStatusFilter}
                  onChange={(e) => setSelectedReviewStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700"
                >
                  <option value="All">All Statuses</option>
                  <option value="submitted">Submitted (Needs Review)</option>
                  <option value="finalized">Finalized</option>
                  <option value="draft">Draft in Progress</option>
                </select>
              </div>
            </div>

            {/* Trimester Reviews Ledger Table */}
            {(() => {
              const allReviews = getMentorTrimesterReviews(currentUser?.id);
              const filteredReviews = allReviews.filter((r) => {
                if (selectedReviewTrimesterFilter !== 'All' && r.trimester !== selectedReviewTrimesterFilter) return false;
                if (selectedReviewStatusFilter !== 'All' && r.status !== selectedReviewStatusFilter) return false;
                if (selectedMenteeFilter !== 'all' && r.menteeId !== selectedMenteeFilter) return false;
                return true;
              });

              if (filteredReviews.length === 0) {
                return (
                  <div className="py-12 text-center text-xs text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No trimester reviews match the selected filter parameters.
                  </div>
                );
              }

              return (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                        <th className="py-3 px-3">Student Mentee</th>
                        <th className="py-3 px-3">Trimester</th>
                        <th className="py-3 px-3">Goal Outcome Summary</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3">Submitted / Finalized</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredReviews.map((rev) => {
                        const mentee = getUserById(rev.menteeId);
                        const summary = getMenteeTrimesterGoalSummary(rev.menteeId, rev.trimester);
                        const hasUnresolved = summary.unresolvedGoals.length > 0;

                        return (
                          <tr key={rev.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                <Avatar
                                  name={mentee?.name || 'Mentee'}
                                  initials={mentee?.initials}
                                  color={mentee?.avatarColor}
                                  size="xs"
                                />
                                <div>
                                  <p className="font-bold text-navy-900">{mentee?.name}</p>
                                  <p className="text-[10px] text-slate-400">{mentee?.year}</p>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-3 font-semibold text-slate-800">
                              {rev.trimester}
                            </td>

                            <td className="py-3 px-3">
                              <div className="space-y-0.5 text-[11px]">
                                <span className="font-bold text-navy-900">
                                  {summary.overall.achieved}/{summary.overall.total} Goals Achieved ({summary.overall.completionRate}%)
                                </span>
                                <div className="text-[10px] text-slate-500 flex items-center gap-2">
                                  <span>Acad: {summary.academic.achieved}/{summary.academic.total}</span>
                                  <span>•</span>
                                  <span>Prof: {summary.professional.achieved}/{summary.professional.total}</span>
                                  <span>•</span>
                                  <span>Pers: {summary.personal.achieved}/{summary.personal.total}</span>
                                </div>
                                {hasUnresolved && (
                                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 inline-block mt-0.5">
                                    {summary.unresolvedGoals.length} goal(s) unresolved
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="py-3 px-3">
                              {rev.status === 'finalized' && (
                                <Badge variant="success" size="sm">
                                  <CheckCircle2 className="w-3 h-3 mr-1" /> Finalized
                                </Badge>
                              )}
                              {rev.status === 'submitted' && (
                                <Badge variant="warning" size="sm">
                                  <Clock className="w-3 h-3 mr-1" /> Awaiting Review
                                </Badge>
                              )}
                              {rev.status === 'draft' && (
                                <Badge variant="neutral" size="sm">
                                  Mentee Draft
                                </Badge>
                              )}
                            </td>

                            <td className="py-3 px-3 text-[11px] text-slate-500">
                              {rev.status === 'finalized'
                                ? `Finalized: ${new Date(rev.finalizedAt).toLocaleDateString()}`
                                : rev.submittedAt
                                ? `Submitted: ${new Date(rev.submittedAt).toLocaleDateString()}`
                                : 'In progress'}
                            </td>

                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  onClick={() => setInspectReviewModal(rev)}
                                  icon={Eye}
                                >
                                  Inspect
                                </Button>

                                {rev.status === 'submitted' && (
                                  <Button
                                    variant="primary"
                                    size="xs"
                                    onClick={() => {
                                      setFinalizeModalReview(rev);
                                      setFinalizeForm({
                                        overallComments: '',
                                        recommendations: '',
                                        nextTrimesterPriorities: '',
                                        acknowledgedBy: currentUser?.name || '',
                                      });
                                      setFinalizeError('');
                                    }}
                                    icon={Award}
                                  >
                                    Evaluate & Finalize
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ── TAB 4: MENTEE-WISE GOAL OVERVIEW ──────────────────────────────── */}
      {activeTab === 'mentees' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-navy-900">Allocated Mentee Goal Portfolios</h3>
              <p className="text-xs text-slate-500">
                Detailed goal tracking, categories breakdown, and term progress organized by individual student.
              </p>
            </div>
            {activeMenteeView && (
              <Button
                variant="secondary"
                size="xs"
                onClick={() => setActiveMenteeView(null)}
              >
                Back to All Mentees
              </Button>
            )}
          </div>

          {!activeMenteeView ? (
            /* Roster Grid of All Allocated Mentees */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {allocatedMentees.map((item) => {
                const mGoals = trimesterGoals.filter((g) => g.menteeId === item.menteeId);
                const mPending = mGoals.filter((g) => g.status === 'pending_approval' || g.status === 'changes_requested').length;
                const mActive = mGoals.filter((g) => g.status === 'active').length;
                const mAchieved = mGoals.filter((g) => g.status === 'achieved').length;
                const mNotAchieved = mGoals.filter((g) => g.status === 'not_achieved').length;

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:border-slate-300 transition-all space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar user={item.mentee} size="md" />
                        <div>
                          <h4 className="font-bold text-navy-900 text-sm">
                            {item.mentee?.name || 'Allocated Mentee'}
                          </h4>
                          <p className="text-xs text-brand-700 font-medium">
                            {item.mentee?.year || item.mentee?.department}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Total Goals: <strong className="text-slate-700">{mGoals.length}</strong>
                          </p>
                        </div>
                      </div>
                      <Badge variant="default" size="sm">
                        {item.method === 'self_selected' ? 'Self Selected' : 'Assigned'}
                      </Badge>
                    </div>

                    {/* Counts Grid */}
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div className="p-2 rounded-xl bg-amber-50 border border-amber-100">
                        <p className="text-[10px] text-amber-700 font-semibold uppercase">Pending</p>
                        <p className="text-sm font-bold text-amber-900 mt-0.5">{mPending}</p>
                      </div>
                      <div className="p-2 rounded-xl bg-blue-50 border border-blue-100">
                        <p className="text-[10px] text-blue-700 font-semibold uppercase">Active</p>
                        <p className="text-sm font-bold text-blue-900 mt-0.5">{mActive}</p>
                      </div>
                      <div className="p-2 rounded-xl bg-purple-50 border border-purple-100">
                        <p className="text-[10px] text-purple-700 font-semibold uppercase">Achieved</p>
                        <p className="text-sm font-bold text-purple-900 mt-0.5">{mAchieved}</p>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <p className="text-[10px] text-slate-500 font-semibold uppercase">Not Achieved</p>
                        <p className="text-sm font-bold text-slate-800 mt-0.5">{mNotAchieved}</p>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Button
                        variant="primary"
                        size="xs"
                        onClick={() => setActiveMenteeView(item)}
                        iconRight={ArrowRight}
                      >
                        View Mentee Portfolio ({mGoals.length})
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Selected Mentee's Organized Goals View */
            <div className="space-y-6">
              {/* Mentee Banner */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar user={activeMenteeView.mentee} size="lg" />
                  <div>
                    <h3 className="text-base font-bold text-navy-900">
                      {activeMenteeView.mentee?.name}'s Goals
                    </h3>
                    <p className="text-xs text-brand-700 font-medium">
                      {activeMenteeView.mentee?.year || activeMenteeView.mentee?.department}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Coordinator: {getUserById(activeMenteeView.coordinatorId)?.name || 'Department Coordinator'}
                    </p>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setActiveMenteeView(null)}
                >
                  Switch Mentee
                </Button>
              </div>

              {/* Categorized Goals for this Mentee */}
              {['Academic', 'Professional', 'Personal'].map((cat) => {
                const catGoals = trimesterGoals.filter(
                  (g) => g.menteeId === activeMenteeView.menteeId && g.category === cat
                );
                return (
                  <div key={cat} className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h4 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                        {cat === 'Academic' ? (
                          <GraduationCap className="w-4 h-4 text-blue-600" />
                        ) : cat === 'Professional' ? (
                          <Briefcase className="w-4 h-4 text-purple-600" />
                        ) : (
                          <Sparkles className="w-4 h-4 text-amber-600" />
                        )}
                        {cat} Goals ({catGoals.length})
                      </h4>
                    </div>

                    {catGoals.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {catGoals.map((goal) => (
                          <div
                            key={goal.id}
                            className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-2.5 text-xs flex flex-col justify-between"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] text-slate-500 font-semibold bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                                  {goal.trimester}
                                </span>
                                {renderStatusBadge(goal.status)}
                              </div>

                              <h5 className="font-bold text-navy-900 text-sm leading-snug">{goal.title}</h5>
                              <p className="text-slate-600 line-clamp-2">{goal.description}</p>

                              {/* Progress bar */}
                              <div className="space-y-1">
                                <div className="flex justify-between text-[11px] font-semibold">
                                  <span className="text-slate-400">Progress</span>
                                  <span className="text-navy-900">{goal.progress}%</span>
                                </div>
                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${getProgressBarColor(goal.progress)}`}
                                    style={{ width: `${goal.progress}%` }}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                              <span className="text-[10px] text-slate-400">Target: {goal.targetDate}</span>
                              <Button
                                variant="ghost"
                                size="xs"
                                onClick={() => setDetailsModalGoal(goal)}
                              >
                                View Record
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400 text-center">
                        No {cat.toLowerCase()} goals set for this student.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 5: GOAL HISTORY ───────────────────────────────────────────── */}
      {activeTab === 'history' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-navy-900">Trimester Goal History</h3>
              <p className="text-xs text-slate-500">
                Previously finalized, evaluated, and completed goals for your assigned mentees. (Read-only permanent records)
              </p>
            </div>
            <Badge variant="navy">{historyGoals.length} Historical Records</Badge>
          </div>

          {historyGoals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {historyGoals.map((goal) => {
                const mentee = getUserById(goal.menteeId);
                return (
                  <div
                    key={goal.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:border-slate-300 transition-colors flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Avatar user={mentee} size="sm" />
                          <div>
                            <h4 className="font-bold text-navy-900 text-xs">{mentee?.name}</h4>
                            <span className="text-[10px] text-slate-400">{goal.trimester}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {renderCategoryBadge(goal.category)}
                          {renderStatusBadge(goal.status)}
                        </div>
                      </div>

                      <h4 className="text-sm font-bold text-navy-900 leading-snug">{goal.title}</h4>
                      <p className="text-xs text-slate-600 line-clamp-2">{goal.description}</p>

                      {/* Final Evaluation Highlight Box */}
                      {goal.evaluationComment && (
                        <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-100 text-xs space-y-1">
                          <div className="flex items-center justify-between text-purple-900 font-bold">
                            <span className="flex items-center gap-1.5">
                              <Award className="w-3.5 h-3.5 text-purple-600" />
                              Final Outcome: {goal.evaluation || 'Evaluated'}
                            </span>
                            {goal.evaluatedAt && (
                              <span className="text-[10px] text-purple-600 font-normal">
                                {new Date(goal.evaluatedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-purple-900 italic leading-relaxed">
                            "{goal.evaluationComment}"
                          </p>
                          {goal.recommendations && (
                            <p className="text-[11px] text-purple-800 pt-0.5">
                              <strong>Recommendations:</strong> {goal.recommendations}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-400">Target Date: {goal.targetDate}</span>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => setDetailsModalGoal(goal)}
                      >
                        View Full History
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500">
              <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              No finalized goals recorded in history yet.
            </div>
          )}
        </div>
      )}

      {/* ── MODAL 1: APPROVE GOAL ─────────────────────────────────────────── */}
      <Modal
        open={!!approveModalGoal}
        onClose={() => setApproveModalGoal(null)}
        title="Approve Mentee Goal"
        description={`Authorizing "${approveModalGoal?.title}" for active tracking during ${approveModalGoal?.trimester}.`}
        size="md"
      >
        {approveModalGoal && (
          <form onSubmit={handleApproveSubmit} className="space-y-4 text-xs">
            {actionError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
                {actionError}
              </div>
            )}

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <p className="font-semibold text-slate-700">Student: {getUserById(approveModalGoal.menteeId)?.name}</p>
              <p className="text-slate-600">Goal: <strong>{approveModalGoal.title}</strong></p>
              <p className="text-slate-500 text-[11px]">Category: {approveModalGoal.category} • Target: {approveModalGoal.targetDate}</p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Approval Guidance / Kick-off Note to Student (Optional)
              </label>
              <textarea
                rows={3}
                value={approvalFeedback}
                onChange={(e) => setApprovalFeedback(e.target.value)}
                placeholder="e.g. Approved with recommendation. Ensure partition tolerance is tested thoroughly during phase 2."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none leading-relaxed"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="secondary" size="sm" type="button" onClick={() => setApproveModalGoal(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" icon={Check}>
                Confirm Approval
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* ── MODAL 2: REQUEST CHANGES ──────────────────────────────────────── */}
      <Modal
        open={!!requestChangesModalGoal}
        onClose={() => setRequestChangesModalGoal(null)}
        title="Request Changes on Goal"
        description={`Provide guidance for "${requestChangesModalGoal?.title}" so the student can revise and resubmit.`}
        size="md"
      >
        {requestChangesModalGoal && (
          <form onSubmit={handleRequestChangesSubmit} className="space-y-4 text-xs">
            {actionError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
                {actionError}
              </div>
            )}

            <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-amber-950 text-xs">
              The student will receive your constructive feedback and will be required to update their goal specifications before resubmitting.
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Requested Adjustments & Guidance <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={changesFeedback}
                onChange={(e) => setChangesFeedback(e.target.value)}
                placeholder="Explain clearly what should be adjusted (e.g. make expected outcome more measurable, list exact design patterns, refine timeline)..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none leading-relaxed"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="secondary" size="sm" type="button" onClick={() => setRequestChangesModalGoal(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Submit Change Request
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* ── MODAL 3: REJECT GOAL ──────────────────────────────────────────── */}
      <Modal
        open={!!rejectModalGoal}
        onClose={() => setRejectModalGoal(null)}
        title="Reject Proposed Goal"
        description={`Record the rejection reason for "${rejectModalGoal?.title}".`}
        size="md"
      >
        {rejectModalGoal && (
          <form onSubmit={handleRejectSubmit} className="space-y-4 text-xs">
            {actionError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
                {actionError}
              </div>
            )}

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs">
              Rejected goals are preserved in permanent history for transparency and student portfolio audit records.
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Rejection Reason <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this goal cannot be accepted (e.g. out of syllabus scope, duplicate deliverable, misaligned objectives)..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none leading-relaxed"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="secondary" size="sm" type="button" onClick={() => setRejectModalGoal(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" type="submit">
                Confirm Rejection
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* ── MODAL 4: ADD MENTOR FEEDBACK TO ACTIVE GOAL ────────────────────── */}
      <Modal
        open={!!feedbackModalGoal}
        onClose={() => setFeedbackModalGoal(null)}
        title="Add Mentorship Feedback"
        description={`Post structured review feedback on "${feedbackModalGoal?.title}".`}
        size="md"
      >
        {feedbackModalGoal && (
          <form onSubmit={handleAddFeedbackSubmit} className="space-y-4 text-xs">
            {actionError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
                {actionError}
              </div>
            )}

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <p className="font-semibold text-slate-700">
                Mentee: <strong>{getUserById(feedbackModalGoal.menteeId)?.name}</strong>
              </p>
              <p className="text-slate-600">Current Progress: {feedbackModalGoal.progress}%</p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Mentor Feedback Comment <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                placeholder="Provide observations on the mentee's latest milestones, suggestions for improvement, or test criteria..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none leading-relaxed"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="secondary" size="sm" type="button" onClick={() => setFeedbackModalGoal(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" icon={Send}>
                Post Feedback
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* ── MODAL 5: TRIMESTER EVALUATE GOAL ──────────────────────────────── */}
      <Modal
        open={!!evaluateModalGoal}
        onClose={() => setEvaluateModalGoal(null)}
        title="Trimester-End Goal Evaluation"
        description="Conduct comprehensive faculty evaluation of mentee milestone achievements."
        size="lg"
      >
        {evaluateModalGoal && (
          <form onSubmit={handleEvaluateSubmit} className="space-y-4 text-xs">
            {actionError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
                {actionError}
              </div>
            )}

            {/* Read-only Goal Summary */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">
                  Student: <strong>{getUserById(evaluateModalGoal.menteeId)?.name}</strong>
                </span>
                <div className="flex items-center gap-1.5">
                  {renderCategoryBadge(evaluateModalGoal.category)}
                  <span className="text-[10px] text-slate-400 bg-white px-2 py-0.5 rounded border">
                    {evaluateModalGoal.trimester}
                  </span>
                </div>
              </div>

              <h4 className="font-bold text-navy-900 text-sm">{evaluateModalGoal.title}</h4>

              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-slate-500">Reported Progress</span>
                  <span className="text-navy-900">{evaluateModalGoal.progress}% Completed</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getProgressBarColor(evaluateModalGoal.progress)}`}
                    style={{ width: `${evaluateModalGoal.progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Outcome Selection */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Final Evaluation Outcome <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setEvaluationForm({ ...evaluationForm, outcome: 'achieved' })}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 cursor-pointer font-bold text-xs transition-all ${
                    evaluationForm.outcome === 'achieved'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-100'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <Award className="w-4 h-4 text-emerald-600" />
                  Achieved
                </button>

                <button
                  type="button"
                  onClick={() => setEvaluationForm({ ...evaluationForm, outcome: 'not_achieved' })}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 cursor-pointer font-bold text-xs transition-all ${
                    evaluationForm.outcome === 'not_achieved'
                      ? 'border-slate-400 bg-slate-100 text-slate-900 ring-2 ring-slate-200'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <XCircle className="w-4 h-4 text-slate-500" />
                  Not Achieved
                </button>
              </div>
            </div>

            {/* Evaluation Comments */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Faculty Evaluation Comments <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={evaluationForm.evaluationComment}
                onChange={(e) =>
                  setEvaluationForm({ ...evaluationForm, evaluationComment: e.target.value })
                }
                placeholder="Summarize the student's mastery, technical execution quality, and overall outcome delivery..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none leading-relaxed"
              />
            </div>

            {/* Recommendations for Future Improvement */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Recommendations for Future Improvement (Optional)
              </label>
              <textarea
                rows={2}
                value={evaluationForm.recommendations}
                onChange={(e) =>
                  setEvaluationForm({ ...evaluationForm, recommendations: e.target.value })
                }
                placeholder="Actionable recommendations for next trimester or upcoming industry capstone phases..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="secondary" size="sm" type="button" onClick={() => setEvaluateModalGoal(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" icon={Award}>
                Finalize Evaluation
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* ── MODAL 6: GOAL DETAILS MODAL ───────────────────────────────────── */}
      <Modal
        open={!!detailsModalGoal}
        onClose={() => setDetailsModalGoal(null)}
        title="Mentorship Goal Portfolio Record"
        description="Full specifications, mentee progress updates, and faculty review history."
        size="lg"
      >
        {detailsModalGoal && (
          <div className="space-y-5 text-xs max-h-[75vh] overflow-y-auto pr-1">
            {/* Header info */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Avatar user={getUserById(detailsModalGoal.menteeId)} size="sm" />
                  <span className="font-bold text-navy-900 text-xs">
                    {getUserById(detailsModalGoal.menteeId)?.name}
                  </span>
                  {renderCategoryBadge(detailsModalGoal.category)}
                  <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border">
                    {detailsModalGoal.trimester}
                  </span>
                </div>
                {renderStatusBadge(detailsModalGoal.status)}
              </div>

              <h3 className="text-base font-bold text-navy-900">{detailsModalGoal.title}</h3>

              {/* Progress bar */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600">Reported Progress</span>
                  <span className="text-navy-900 font-bold">{detailsModalGoal.progress}% Completed</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getProgressBarColor(detailsModalGoal.progress)}`}
                    style={{ width: `${detailsModalGoal.progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Description & Expected Outcome */}
            <div className="space-y-3">
              <div>
                <h4 className="font-bold text-navy-900 mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  Description & Plan
                </h4>
                <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200 leading-relaxed whitespace-pre-wrap">
                  {detailsModalGoal.description}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-navy-900 mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
                  Expected Measurable Outcome
                </h4>
                <p className="text-xs text-slate-700 bg-brand-50/40 p-3 rounded-xl border border-brand-100 leading-relaxed">
                  {detailsModalGoal.expectedOutcome}
                </p>
              </div>

              {detailsModalGoal.notes && (
                <div>
                  <h4 className="font-bold text-slate-700 mb-1">Additional Student Notes</h4>
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                    "{detailsModalGoal.notes}"
                  </p>
                </div>
              )}
            </div>

            {/* Final Evaluation (If Achieved or Not Achieved) */}
            {detailsModalGoal.evaluationComment && (
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 space-y-1.5">
                <h4 className="font-bold text-xs text-purple-950 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-purple-700" />
                  Final Faculty Evaluation: {detailsModalGoal.evaluation}
                </h4>
                <p className="text-xs text-purple-900 leading-relaxed">
                  "{detailsModalGoal.evaluationComment}"
                </p>
                {detailsModalGoal.recommendations && (
                  <p className="text-[11px] text-purple-800 pt-0.5">
                    <strong>Recommendations:</strong> {detailsModalGoal.recommendations}
                  </p>
                )}
                {detailsModalGoal.evaluatedAt && (
                  <p className="text-[10px] text-purple-600 mt-1">
                    Evaluated on {new Date(detailsModalGoal.evaluatedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            {/* Mentor Feedback History */}
            {getGoalFeedback(detailsModalGoal.id).length > 0 && (
              <div className="space-y-2">
                <h4 className="font-bold text-navy-900 text-xs flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                  Chronological Feedback History ({getGoalFeedback(detailsModalGoal.id).length})
                </h4>
                <div className="space-y-2">
                  {getGoalFeedback(detailsModalGoal.id).map((fb) => (
                    <div
                      key={fb.id}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-700 capitalize flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-brand-600" />
                          {fb.type}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(fb.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className="text-slate-700 italic">"{fb.comment}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Progress Update Timeline */}
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-navy-900 text-xs flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-brand-600" />
                  Mentee Progress Timeline
                </span>
                <span className="text-[11px] text-slate-400 font-normal">
                  {getGoalUpdates(detailsModalGoal.id).length} recorded update(s)
                </span>
              </h4>

              {getGoalUpdates(detailsModalGoal.id).length > 0 ? (
                <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-200">
                  {getGoalUpdates(detailsModalGoal.id).map((up) => (
                    <div key={up.id} className="relative flex items-start gap-3 pl-1">
                      <div className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center text-[10px] font-bold z-10 flex-shrink-0 mt-1">
                        ✓
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex-1 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-navy-900">
                            Progress: {up.previousProgress}% →{' '}
                            <strong className="text-brand-700">{up.progressPercentage}%</strong>
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(up.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        {up.achievements && (
                          <p className="text-xs font-semibold text-slate-800">
                            ★ Milestone: {up.achievements}
                          </p>
                        )}

                        <p className="text-xs text-slate-600 leading-relaxed">{up.progressNote}</p>

                        {up.supportingDescription && (
                          <p className="text-[11px] text-brand-700 flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" /> {up.supportingDescription}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-400">
                  No progress updates submitted by the student yet.
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="secondary" size="sm" onClick={() => setDetailsModalGoal(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── MODAL: FINALIZE TRIMESTER REVIEW ───────────────────────────────── */}
      {finalizeModalReview && (
        <Modal
          open={!!finalizeModalReview}
          onClose={() => setFinalizeModalReview(null)}
          title={`Evaluate & Finalize Trimester Review (${finalizeModalReview.trimester})`}
          description={`Student: ${getUserById(finalizeModalReview.menteeId)?.name} • Review mentee reflection, check individual goal outcomes, and provide faculty sign-off.`}
          size="lg"
        >
          <div className="space-y-4 text-xs max-h-[75vh] overflow-y-auto pr-1">
            {finalizeError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{finalizeError}</span>
              </div>
            )}

            {/* Goal Outcome Summary & Unresolved Warning */}
            {(() => {
              const summary = getMenteeTrimesterGoalSummary(finalizeModalReview.menteeId, finalizeModalReview.trimester);
              return (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-navy-900">
                    <span>Goal Outcome Summary ({finalizeModalReview.trimester})</span>
                    <Badge variant="navy" size="xs">
                      Completion: {summary.overall.completionRate}%
                    </Badge>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                    <div className="p-1.5 bg-white rounded border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">TOTAL GOALS</span>
                      <span className="font-bold text-navy-900">{summary.overall.total}</span>
                    </div>
                    <div className="p-1.5 bg-blue-50/50 rounded border border-blue-100">
                      <span className="text-[10px] text-blue-600 block">ACADEMIC</span>
                      <span className="font-bold text-blue-800">{summary.academic.achieved}/{summary.academic.total}</span>
                    </div>
                    <div className="p-1.5 bg-purple-50/50 rounded border border-purple-100">
                      <span className="text-[10px] text-purple-600 block">PROFESSIONAL</span>
                      <span className="font-bold text-purple-800">{summary.professional.achieved}/{summary.professional.total}</span>
                    </div>
                    <div className="p-1.5 bg-amber-50/50 rounded border border-amber-100">
                      <span className="text-[10px] text-amber-600 block">PERSONAL</span>
                      <span className="font-bold text-amber-800">{summary.personal.achieved}/{summary.personal.total}</span>
                    </div>
                  </div>

                  {summary.unresolvedGoals.length > 0 ? (
                    <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
                      <p className="font-bold text-[11px] flex items-center gap-1.5 text-rose-800">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                        Finalization Blocked: Unresolved Goals Found
                      </p>
                      <p className="text-[11px] leading-relaxed">
                        Before you can finalize this overall review, all applicable goals for this mentee in {finalizeModalReview.trimester} must have a final evaluation outcome of <strong>Achieved</strong> or <strong>Not Achieved</strong>.
                      </p>
                      <div className="pt-1 space-y-1">
                        {summary.unresolvedGoals.map((ug) => (
                          <div key={ug.id} className="flex items-center justify-between bg-white/80 px-2 py-1 rounded text-[10px] border border-rose-100">
                            <span className="font-medium text-slate-800 truncate max-w-xs">{ug.title}</span>
                            <span className="font-bold text-amber-700 capitalize">Status: {ug.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200 flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      All individual goals for this trimester are finalized and eligible for review sign-off.
                    </p>
                  )}
                </div>
              );
            })()}

            {/* Mentee's Reflection Highlights */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-xs text-navy-900 border-b border-slate-100 pb-1.5">
                Mentee's Submitted Reflection
              </h4>
              <div className="space-y-2 text-[11px] text-slate-700">
                <p>
                  <strong>Major Achievements: </strong>
                  {finalizeModalReview.reflections?.overall?.majorAchievements || 'None submitted'}
                </p>
                <p>
                  <strong>Areas for Improvement: </strong>
                  {finalizeModalReview.reflections?.overall?.areasForImprovement || 'None submitted'}
                </p>
                <p>
                  <strong>Next Priorities: </strong>
                  {finalizeModalReview.reflections?.overall?.nextTrimesterPriorities || 'None submitted'}
                </p>
              </div>
            </div>

            {/* Mentor Evaluation Input Form */}
            <div className="space-y-3 pt-1">
              <div>
                <label className="block font-bold text-navy-900 mb-1">
                  Overall Mentor Comments & Assessment <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={finalizeForm.overallComments}
                  onChange={(e) => setFinalizeForm({ ...finalizeForm, overallComments: e.target.value })}
                  placeholder="Provide your comprehensive evaluation of the student's progress and performance across the term..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-navy-900 mb-1">
                  Recommendations & Growth Opportunities
                </label>
                <textarea
                  rows={2}
                  value={finalizeForm.recommendations}
                  onChange={(e) => setFinalizeForm({ ...finalizeForm, recommendations: e.target.value })}
                  placeholder="Specific actions or competencies the student should cultivate..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-navy-900 mb-1">
                  Suggested Priorities for Next Trimester
                </label>
                <input
                  type="text"
                  value={finalizeForm.nextTrimesterPriorities}
                  onChange={(e) => setFinalizeForm({ ...finalizeForm, nextTrimesterPriorities: e.target.value })}
                  placeholder="e.g. Raft multi-node testbed, AWS cloud certification, colloquium presentation"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-navy-900 mb-1">
                  Faculty Acknowledgment Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={finalizeForm.acknowledgedBy}
                  onChange={(e) => setFinalizeForm({ ...finalizeForm, acknowledgedBy: e.target.value })}
                  placeholder="Type your full academic name (e.g. Dr. Emily Chen)"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Signing with date: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="secondary" size="sm" onClick={() => setFinalizeModalReview(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  const res = finalizeTrimesterReview({
                    reviewId: finalizeModalReview.id,
                    mentorId: currentUser.id,
                    overallComments: finalizeForm.overallComments,
                    recommendations: finalizeForm.recommendations,
                    nextTrimesterPriorities: finalizeForm.nextTrimesterPriorities,
                    acknowledgedBy: finalizeForm.acknowledgedBy,
                  });

                  if (!res.success) {
                    setFinalizeError(res.error);
                  } else {
                    setFinalizeModalReview(null);
                    setNotification({
                      type: 'success',
                      message: `Successfully finalized ${finalizeModalReview.trimester} review for ${getUserById(finalizeModalReview.menteeId)?.name}.`,
                    });
                  }
                }}
              >
                Sign & Finalize Review
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── MODAL: INSPECT REVIEW DETAILS ──────────────────────────────────── */}
      {inspectReviewModal && (
        <Modal
          open={!!inspectReviewModal}
          onClose={() => setInspectReviewModal(null)}
          title={`Trimester Review: ${inspectReviewModal.trimester}`}
          description={`Student: ${getUserById(inspectReviewModal.menteeId)?.name} • Status: ${inspectReviewModal.status.toUpperCase()}`}
          size="lg"
        >
          <div className="space-y-4 text-xs max-h-[75vh] overflow-y-auto pr-1">
            {/* Goal Outcome Summary Bar */}
            {(() => {
              const sum = getMenteeTrimesterGoalSummary(inspectReviewModal.menteeId, inspectReviewModal.trimester);
              return (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold text-navy-900">
                    <span>Goal Outcome Summary</span>
                    <span className="text-brand-600 font-extrabold">{sum.overall.completionRate}% Achieved</span>
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

            {/* Mentor Evaluation (if finalized) */}
            {inspectReviewModal.status === 'finalized' && inspectReviewModal.mentorReview && (
              <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-950 space-y-2">
                <div className="flex items-center justify-between border-b border-teal-200 pb-2">
                  <h4 className="font-bold text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    Mentor Evaluation & Faculty Sign-off
                  </h4>
                  <span className="text-[10px] text-teal-700">
                    Finalized on {new Date(inspectReviewModal.finalizedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="space-y-1.5 pt-1">
                  <p className="text-xs">
                    <strong>Faculty Comments: </strong>
                    <span className="italic">"{inspectReviewModal.mentorReview.overallComments}"</span>
                  </p>
                  {inspectReviewModal.mentorReview.recommendations && (
                    <p className="text-xs">
                      <strong>Recommendations: </strong>
                      {inspectReviewModal.mentorReview.recommendations}
                    </p>
                  )}
                  {inspectReviewModal.mentorReview.nextTrimesterPriorities && (
                    <p className="text-xs">
                      <strong>Next Priorities: </strong>
                      {inspectReviewModal.mentorReview.nextTrimesterPriorities}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-teal-200 flex items-center justify-between text-[11px] text-teal-800">
                  <span>
                    Signed by: <strong>{inspectReviewModal.mentorReview.acknowledgedBy}</strong>
                  </span>
                  <span>
                    {inspectReviewModal.mentorReview.acknowledgedAt &&
                      new Date(inspectReviewModal.mentorReview.acknowledgedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Mentee Reflections Breakdown */}
            <div className="space-y-3">
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5">
                <h5 className="font-bold text-blue-900 flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-600" /> Academic Reflection
                </h5>
                <p><strong>Achievements:</strong> {inspectReviewModal.reflections?.academic?.achievements || 'None noted'}</p>
                <p><strong>Challenges:</strong> {inspectReviewModal.reflections?.academic?.challenges || 'None noted'}</p>
                <p><strong>Improvements:</strong> {inspectReviewModal.reflections?.academic?.improvements || 'None noted'}</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5">
                <h5 className="font-bold text-purple-900 flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-purple-600" /> Professional Reflection
                </h5>
                <p><strong>Skills Developed:</strong> {inspectReviewModal.reflections?.professional?.skillsDeveloped || 'None noted'}</p>
                <p><strong>Career Progress:</strong> {inspectReviewModal.reflections?.professional?.careerProgress || 'None noted'}</p>
                <p><strong>Next Focus:</strong> {inspectReviewModal.reflections?.professional?.nextFocus || 'None noted'}</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5">
                <h5 className="font-bold text-amber-900 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Personal Reflection
                </h5>
                <p><strong>Improvements:</strong> {inspectReviewModal.reflections?.personal?.improvements || 'None noted'}</p>
                <p><strong>Challenges Overcome:</strong> {inspectReviewModal.reflections?.personal?.challengesOvercome || 'None noted'}</p>
                <p><strong>Next Priorities:</strong> {inspectReviewModal.reflections?.personal?.nextPriorities || 'None noted'}</p>
              </div>

              <div className="p-3 bg-blue-50/40 rounded-xl border border-blue-200 space-y-1.5">
                <h5 className="font-bold text-navy-950 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-brand-600" /> Overall Reflection
                </h5>
                <p><strong>Major Achievements:</strong> {inspectReviewModal.reflections?.overall?.majorAchievements}</p>
                <p><strong>Areas For Improvement:</strong> {inspectReviewModal.reflections?.overall?.areasForImprovement}</p>
                <p><strong>Next Trimester Priorities:</strong> {inspectReviewModal.reflections?.overall?.nextTrimesterPriorities}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setInspectReviewModal(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
