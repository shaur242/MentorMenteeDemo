import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  Plus,
  Filter,
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
  Edit3,
  Award,
  Layers,
  Info,
  RotateCcw,
  Sliders,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

export default function MenteeGoalsPage() {
  const {
    currentUser,
    getMenteeAllocation,
    getMentorById,
    getCoordinatorById,
    goals,
    goalUpdates,
    createGoal,
    updateGoal,
    resubmitGoal,
    addGoalProgressUpdate,
    getMenteeGoals,
    getGoalUpdates,
    getGoalFeedback,
    trimesterReviews,
    getMenteeTrimesterReviews,
    getMenteeTrimesterGoalSummary,
    saveTrimesterReviewDraft,
    submitTrimesterReview,
  } = useApp();

  const navigate = useNavigate();

  // Active trimester filter
  const [selectedTrimester, setSelectedTrimester] = useState('All');

  // Active navigation tab: 'dashboard' | 'reviews' | 'history'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Trimester Review States (Stage 6)
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedReviewTrimester, setSelectedReviewTrimester] = useState('Trimester 2');
  const [activeReviewRecord, setActiveReviewRecord] = useState(null); // existing review if any
  const [reflectionForm, setReflectionForm] = useState({
    academic: { achievements: '', challenges: '', improvements: '' },
    professional: { skillsDeveloped: '', careerProgress: '', nextFocus: '' },
    personal: { improvements: '', challengesOvercome: '', nextPriorities: '' },
    overall: { majorAchievements: '', areasForImprovement: '', nextTrimesterPriorities: '' },
  });
  const [reviewError, setReviewError] = useState('');
  const [viewReviewDetails, setViewReviewDetails] = useState(null);

  // Notification / Alert message
  const [notification, setNotification] = useState(null);

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [detailsModalGoal, setDetailsModalGoal] = useState(null);
  const [editModalGoal, setEditModalGoal] = useState(null);
  const [progressModalGoal, setProgressModalGoal] = useState(null);

  // Form states for Add Goal
  const [addForm, setAddForm] = useState({
    title: '',
    category: 'Academic',
    description: '',
    expectedOutcome: '',
    targetDate: '',
    trimester: 'Trimester 2',
    notes: '',
  });
  const [addError, setAddError] = useState('');

  // Form states for Edit Goal
  const [editForm, setEditForm] = useState({
    title: '',
    category: 'Academic',
    description: '',
    expectedOutcome: '',
    targetDate: '',
    trimester: 'Trimester 2',
    notes: '',
  });
  const [editError, setEditError] = useState('');

  // Form states for Progress Update
  const [progressForm, setProgressForm] = useState({
    progressPercentage: 0,
    progressNote: '',
    achievements: '',
    supportingDescription: '',
    reasonForDecrease: '',
  });
  const [progressError, setProgressError] = useState('');

  // Check mentee allocation
  const allocation = useMemo(() => {
    return currentUser ? getMenteeAllocation(currentUser.id) : null;
  }, [currentUser, getMenteeAllocation]);

  const allocatedMentor = useMemo(() => {
    return allocation ? getMentorById(allocation.mentorId) : null;
  }, [allocation, getMentorById]);

  const allocatedCoordinator = useMemo(() => {
    return allocation ? getCoordinatorById(allocation.coordinatorId) : null;
  }, [allocation, getCoordinatorById]);

  // Today's date string YYYY-MM-DD for min date picker
  const todayStr = new Date().toISOString().split('T')[0];

  // Fetch mentee's personal goals
  const menteeGoals = useMemo(() => {
    if (!currentUser) return [];
    return getMenteeGoals(currentUser.id);
  }, [currentUser, goals]);

  // Filtered goals by selected trimester
  const filteredGoals = useMemo(() => {
    if (selectedTrimester === 'All') return menteeGoals;
    return menteeGoals.filter((g) => g.trimester === selectedTrimester);
  }, [menteeGoals, selectedTrimester]);

  // Active / current goals (not yet finalized)
  const activeAndPendingGoals = useMemo(() => {
    return filteredGoals.filter(
      (g) => g.status === 'active' || g.status === 'pending_approval' || g.status === 'changes_requested'
    );
  }, [filteredGoals]);

  // Historical / finalized goals
  const historyGoals = useMemo(() => {
    return filteredGoals.filter(
      (g) => g.status === 'achieved' || g.status === 'not_achieved' || g.status === 'rejected'
    );
  }, [filteredGoals]);

  // Dynamic Statistics
  const stats = useMemo(() => {
    const total = filteredGoals.length;
    const pending = filteredGoals.filter(
      (g) => g.status === 'pending_approval' || g.status === 'changes_requested'
    ).length;
    const active = filteredGoals.filter((g) => g.status === 'active').length;
    const achieved = filteredGoals.filter((g) => g.status === 'achieved').length;

    return { total, pending, active, achieved };
  }, [filteredGoals]);

  // Categorized goals
  const academicGoals = useMemo(() => {
    return activeAndPendingGoals.filter((g) => g.category === 'Academic');
  }, [activeAndPendingGoals]);

  const professionalGoals = useMemo(() => {
    return activeAndPendingGoals.filter((g) => g.category === 'Professional');
  }, [activeAndPendingGoals]);

  const personalGoals = useMemo(() => {
    return activeAndPendingGoals.filter((g) => g.category === 'Personal');
  }, [activeAndPendingGoals]);

  // Handlers for Add Goal
  const handleOpenAddModal = (presetCategory = 'Academic') => {
    setAddError('');
    setAddForm({
      title: '',
      category: presetCategory,
      description: '',
      expectedOutcome: '',
      targetDate: '',
      trimester: selectedTrimester !== 'All' ? selectedTrimester : 'Trimester 2',
      notes: '',
    });
    setAddModalOpen(true);
  };

  const handleCreateGoalSubmit = (e) => {
    e.preventDefault();
    setAddError('');

    if (!allocation || !allocation.mentorId) {
      setAddError('You cannot create goals without an officially allocated mentor.');
      return;
    }

    const res = createGoal(
      {
        menteeId: currentUser.id,
        ...addForm,
      },
      currentUser.id
    );

    if (res.success) {
      setAddModalOpen(false);
      setNotification({
        type: 'success',
        message: `Goal "${res.goal.title}" submitted successfully! It is now pending approval by your mentor.`,
      });
      setTimeout(() => setNotification(null), 5000);
    } else {
      setAddError(res.error || 'Failed to create goal.');
    }
  };

  // Handlers for Edit / Resubmit Goal
  const handleOpenEditModal = (goal) => {
    setEditError('');
    setEditModalGoal(goal);
    setEditForm({
      title: goal.title,
      category: goal.category,
      description: goal.description,
      expectedOutcome: goal.expectedOutcome,
      targetDate: goal.targetDate,
      trimester: goal.trimester || 'Trimester 2',
      notes: goal.notes || '',
    });
  };

  const handleEditGoalSubmit = (e) => {
    e.preventDefault();
    setEditError('');

    if (!editModalGoal) return;

    let res;
    if (editModalGoal.status === 'changes_requested') {
      res = resubmitGoal(editModalGoal.id, editForm, currentUser.id);
    } else {
      res = updateGoal(editModalGoal.id, editForm, currentUser.id);
    }

    if (res.success) {
      setEditModalGoal(null);
      setNotification({
        type: 'success',
        message:
          editModalGoal.status === 'changes_requested'
            ? `Goal "${res.goal.title}" resubmitted successfully for mentor review.`
            : `Goal "${res.goal.title}" updated successfully.`,
      });
      setTimeout(() => setNotification(null), 5000);
    } else {
      setEditError(res.error || 'Failed to update goal.');
    }
  };

  // Handlers for Progress Update
  const handleOpenProgressModal = (goal) => {
    setProgressError('');
    setProgressModalGoal(goal);
    setProgressForm({
      progressPercentage: goal.progress || 0,
      progressNote: '',
      achievements: '',
      supportingDescription: '',
      reasonForDecrease: '',
    });
  };

  const handleProgressSubmit = (e) => {
    e.preventDefault();
    setProgressError('');

    if (!progressModalGoal) return;

    const res = addGoalProgressUpdate(
      {
        goalId: progressModalGoal.id,
        ...progressForm,
      },
      currentUser.id
    );

    if (res.success) {
      setProgressModalGoal(null);
      setNotification({
        type: 'success',
        message: `Progress updated to ${progressForm.progressPercentage}% for "${progressModalGoal.title}".`,
      });
      setTimeout(() => setNotification(null), 5000);
    } else {
      setProgressError(res.error || 'Failed to update progress.');
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
          <Badge variant="danger" size="sm" className="font-semibold">
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
          <Badge variant="default" size="sm" className="font-semibold text-slate-500">
            Not Achieved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="danger" size="sm" className="font-semibold">
            Rejected
          </Badge>
        );
      default:
        return <Badge size="sm">{status}</Badge>;
    }
  };

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

  // Progress color helper
  const getProgressBarColor = (progress) => {
    if (progress >= 100) return 'bg-emerald-500';
    if (progress >= 60) return 'bg-brand-600';
    if (progress >= 30) return 'bg-blue-500';
    return 'bg-amber-500';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ── Page Header & Controls ────────────────────────────────────────── */}
      <PageHeader
        title="Goals Management"
        subtitle="Set, manage and track your academic, professional and personal goals."
        breadcrumbs={['Mentee', 'Goals Management']}
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
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  selectedTrimester === tri
                    ? 'bg-navy-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-navy-900'
                }`}
              >
                {tri}
              </button>
            ))}
          </div>

          {/* Add New Goal Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleOpenAddModal('Academic')}
            icon={Plus}
          >
            Add New Goal
          </Button>
        </div>
      </PageHeader>

      {/* ── Alert / Notification Banner ───────────────────────────────────── */}
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

      {/* ── Warning Banner if Mentee has No Allocated Mentor ───────────────── */}
      {(!allocation || !allocatedMentor) && (
        <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-amber-950 mb-0.5">Mentor Allocation Required</h4>
              <p className="text-amber-800 leading-relaxed max-w-2xl">
                You do not currently have an officially allocated faculty mentor. All proposed goals must be reviewed and
                approved by an assigned mentor before they become active. Please request a mentor or reach out to your coordinator.
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="xs"
            onClick={() => navigate('/mentee/find-mentors')}
            icon={ArrowRight}
            className="border-amber-300 text-amber-900 bg-white flex-shrink-0"
          >
            Find a Mentor
          </Button>
        </div>
      )}

      {/* ── Goal Statistics Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Goals */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Goals</p>
            <p className="text-2xl font-black text-navy-900 mt-1">{stats.total}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{selectedTrimester} records</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
        </div>

        {/* Pending Approval */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Pending Approval</p>
            <p className="text-2xl font-black text-amber-700 mt-1">{stats.pending}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Awaiting mentor review</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Active Goals */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Active Goals</p>
            <p className="text-2xl font-black text-emerald-700 mt-1">{stats.active}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Approved & in progress</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Achieved Goals */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">Achieved Goals</p>
            <p className="text-2xl font-black text-purple-700 mt-1">{stats.achieved}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Evaluated & completed</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── View Tab Selector (Dashboard Categories vs Trimester Reviews vs Goal History) ───────── */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-navy-900 text-white shadow-2xs'
              : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Active Goals by Category</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
              activeTab === 'dashboard' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {activeAndPendingGoals.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'reviews'
              ? 'bg-navy-900 text-white shadow-2xs'
              : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Overall Trimester Reviews</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
              activeTab === 'reviews' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {getMenteeTrimesterReviews(currentUser?.id).length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'bg-navy-900 text-white shadow-2xs'
              : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Goal Evaluation History</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
              activeTab === 'history' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {historyGoals.length}
          </span>
        </button>
      </div>

      {/* ── TAB 1: CATEGORY SECTIONS DASHBOARD ─────────────────────────────── */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          {/* 1. Academic Goals Section */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-navy-900">Academic Goals</h3>
                  <p className="text-[11px] text-slate-500">
                    Academic performance, subject improvement, certifications, research & technical learning.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="primary" size="sm">
                  {academicGoals.length} Goal{academicGoals.length === 1 ? '' : 's'}
                </Badge>
                <button
                  onClick={() => handleOpenAddModal('Academic')}
                  className="text-[11px] font-semibold text-brand-700 hover:text-brand-900 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add Academic Goal
                </button>
              </div>
            </div>

            {academicGoals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {academicGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onViewDetails={() => setDetailsModalGoal(goal)}
                    onEdit={() => handleOpenEditModal(goal)}
                    onUpdateProgress={() => handleOpenProgressModal(goal)}
                    renderStatusBadge={renderStatusBadge}
                    renderCategoryBadge={renderCategoryBadge}
                    getProgressBarColor={getProgressBarColor}
                  />
                ))}
              </div>
            ) : (
              <EmptyCategoryCard
                category="Academic"
                icon={GraduationCap}
                description="No active academic goals set for this period. Define learning targets, certifications or research milestones."
                onAdd={() => handleOpenAddModal('Academic')}
              />
            )}
          </section>

          {/* 2. Professional Goals Section */}
          <section className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-navy-900">Professional Goals</h3>
                  <p className="text-[11px] text-slate-500">
                    Internship preparation, career development, skill development, projects & placement readiness.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="purple" size="sm">
                  {professionalGoals.length} Goal{professionalGoals.length === 1 ? '' : 's'}
                </Badge>
                <button
                  onClick={() => handleOpenAddModal('Professional')}
                  className="text-[11px] font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add Professional Goal
                </button>
              </div>
            </div>

            {professionalGoals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {professionalGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onViewDetails={() => setDetailsModalGoal(goal)}
                    onEdit={() => handleOpenEditModal(goal)}
                    onUpdateProgress={() => handleOpenProgressModal(goal)}
                    renderStatusBadge={renderStatusBadge}
                    renderCategoryBadge={renderCategoryBadge}
                    getProgressBarColor={getProgressBarColor}
                  />
                ))}
              </div>
            ) : (
              <EmptyCategoryCard
                category="Professional"
                icon={Briefcase}
                description="No active professional goals recorded. Track placement prep, internships, or key technical projects."
                onAdd={() => handleOpenAddModal('Professional')}
              />
            )}
          </section>

          {/* 3. Personal Goals Section */}
          <section className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-navy-900">Personal Goals</h3>
                  <p className="text-[11px] text-slate-500">
                    Communication, confidence, time management, leadership & holistic personal development.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="warning" size="sm">
                  {personalGoals.length} Goal{personalGoals.length === 1 ? '' : 's'}
                </Badge>
                <button
                  onClick={() => handleOpenAddModal('Personal')}
                  className="text-[11px] font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add Personal Goal
                </button>
              </div>
            </div>

            {personalGoals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {personalGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onViewDetails={() => setDetailsModalGoal(goal)}
                    onEdit={() => handleOpenEditModal(goal)}
                    onUpdateProgress={() => handleOpenProgressModal(goal)}
                    renderStatusBadge={renderStatusBadge}
                    renderCategoryBadge={renderCategoryBadge}
                    getProgressBarColor={getProgressBarColor}
                  />
                ))}
              </div>
            ) : (
              <EmptyCategoryCard
                category="Personal"
                icon={Sparkles}
                description="No active personal development goals. Set targets for public speaking, time blocking or leadership."
                onAdd={() => handleOpenAddModal('Personal')}
              />
            )}
          </section>
        </div>
      )}

      {/* ── TAB 2: GOAL EVALUATION HISTORY ────────────────────────────────── */}
      {activeTab === 'history' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-navy-900">Evaluated & Historical Goals</h3>
              <p className="text-xs text-slate-500">
                Completed, achieved, and faculty-evaluated goals from current and previous academic trimesters. (Read-only)
              </p>
            </div>
            <Badge variant="navy">{historyGoals.length} Records</Badge>
          </div>

          {historyGoals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {historyGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:border-slate-300 transition-colors flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {renderCategoryBadge(goal.category)}
                        <span className="text-[11px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                          {goal.trimester}
                        </span>
                      </div>
                      {renderStatusBadge(goal.status)}
                    </div>

                    <h4 className="text-base font-bold text-navy-900">{goal.title}</h4>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {goal.description}
                    </p>

                    {/* Final Evaluation Highlight Box */}
                    {goal.evaluationComment && (
                      <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 text-xs">
                        <div className="flex items-center gap-1.5 text-purple-900 font-bold mb-1">
                          <Award className="w-3.5 h-3.5 text-purple-600" />
                          <span>Mentor Final Evaluation: {goal.evaluation || 'Evaluated'}</span>
                        </div>
                        <p className="text-[11px] text-purple-800 italic leading-relaxed">
                          "{goal.evaluationComment}"
                        </p>
                        {goal.evaluatedAt && (
                          <p className="text-[10px] text-purple-600 mt-1">
                            Evaluated on {new Date(goal.evaluatedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">
                      Completed Target: {goal.targetDate}
                    </span>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => setDetailsModalGoal(goal)}
                      iconRight={ChevronRight}
                    >
                      View Full Record
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <History className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-navy-900">No Finalized Goals in History</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                When your mentor conducts final milestone reviews and marks goals as achieved or evaluated,
                they will be archived here for your permanent academic portfolio.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: OVERALL TRIMESTER REVIEWS (STAGE 6) ───────────────────────── */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          {/* Header & Trimester Review Selector Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-600" />
                  Overall Trimester Reviews
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Reflect on your academic, professional, and personal growth at each trimester milestone.
                </p>
              </div>

              {allocatedMentor ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">Assigned Mentor:</span>
                  <Badge variant="navy" size="sm">
                    {allocatedMentor.name}
                  </Badge>
                </div>
              ) : (
                <Badge variant="warning" size="sm">
                  Mentor Allocation Required
                </Badge>
              )}
            </div>

            {/* Trimester Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
              {['Trimester 1', 'Trimester 2', 'Trimester 3'].map((tri) => {
                const summary = getMenteeTrimesterGoalSummary(currentUser?.id, tri);
                const reviewRecord = getMenteeTrimesterReviews(currentUser?.id).find((r) => r.trimester === tri);
                const reviewStatus = reviewRecord ? reviewRecord.status : 'not_started'; // 'not_started' | 'draft' | 'submitted' | 'finalized'

                return (
                  <div
                    key={tri}
                    className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-navy-900">{tri}</span>
                        {reviewStatus === 'finalized' && (
                          <Badge variant="success" size="sm">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Finalized
                          </Badge>
                        )}
                        {reviewStatus === 'submitted' && (
                          <Badge variant="warning" size="sm">
                            <Clock className="w-3 h-3 mr-1" /> Submitted
                          </Badge>
                        )}
                        {reviewStatus === 'draft' && (
                          <Badge variant="neutral" size="sm">
                            Draft Saved
                          </Badge>
                        )}
                        {reviewStatus === 'not_started' && (
                          <span className="text-[11px] font-semibold text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                            Not Started
                          </span>
                        )}
                      </div>

                      {/* Goal Outcome Summary for this Trimester */}
                      <div className="space-y-1.5 py-2.5 my-2 border-y border-slate-200/70 text-[11px]">
                        <div className="flex justify-between text-slate-600 font-medium">
                          <span>Total Goals:</span>
                          <span className="font-bold text-navy-900">{summary.overall.total}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span className="flex items-center gap-1">
                            <GraduationCap className="w-3 h-3 text-blue-500" /> Academic:
                          </span>
                          <span>
                            {summary.academic.achieved}/{summary.academic.total} achieved
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3 text-purple-500" /> Professional:
                          </span>
                          <span>
                            {summary.professional.achieved}/{summary.professional.total} achieved
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-500" /> Personal:
                          </span>
                          <span>
                            {summary.personal.achieved}/{summary.personal.total} achieved
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-700 font-bold pt-1 border-t border-slate-100">
                          <span>Completion Rate:</span>
                          <span className="text-brand-600">{summary.overall.completionRate}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div>
                      {reviewStatus === 'finalized' && (
                        <Button
                          variant="outline"
                          size="xs"
                          className="w-full"
                          onClick={() => setViewReviewDetails(reviewRecord)}
                          iconRight={ChevronRight}
                        >
                          View Finalized Review
                        </Button>
                      )}

                      {reviewStatus === 'submitted' && (
                        <Button
                          variant="secondary"
                          size="xs"
                          className="w-full"
                          onClick={() => setViewReviewDetails(reviewRecord)}
                          iconRight={Eye}
                        >
                          View Submitted Reflection
                        </Button>
                      )}

                      {(reviewStatus === 'draft' || reviewStatus === 'not_started') && (
                        <Button
                          variant="primary"
                          size="xs"
                          className="w-full"
                          disabled={!allocatedMentor || summary.overall.total === 0}
                          onClick={() => {
                            setSelectedReviewTrimester(tri);
                            setActiveReviewRecord(reviewRecord);
                            setReflectionForm(
                              reviewRecord?.reflections || {
                                academic: { achievements: '', challenges: '', improvements: '' },
                                professional: { skillsDeveloped: '', careerProgress: '', nextFocus: '' },
                                personal: { improvements: '', challengesOvercome: '', nextPriorities: '' },
                                overall: { majorAchievements: '', areasForImprovement: '', nextTrimesterPriorities: '' },
                              }
                            );
                            setReviewError('');
                            setReviewModalOpen(true);
                          }}
                          icon={Edit3}
                        >
                          {reviewStatus === 'draft' ? 'Continue Reflection' : 'Start Trimester Reflection'}
                        </Button>
                      )}

                      {summary.overall.total === 0 && reviewStatus === 'not_started' && (
                        <p className="text-[10px] text-slate-400 text-center mt-1">No goals set in {tri}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 1: ADD NEW GOAL ─────────────────────────────────────────── */}
      <Modal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add New Mentorship Goal"
        description="Define an academic, professional or personal goal. It will be sent to your assigned mentor for approval."
        size="lg"
      >
        <form onSubmit={handleCreateGoalSubmit} className="space-y-4 text-xs">
          {addError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{addError}</span>
            </div>
          )}

          {/* Allocation Info Callout */}
          {allocatedMentor ? (
            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-brand-600 flex-shrink-0" />
                <span className="text-brand-900">
                  Assigned Mentor Reviewer: <strong>{allocatedMentor.name}</strong> ({allocatedMentor.title})
                </span>
              </div>
              <span className="text-[10px] text-brand-600 font-semibold bg-white px-2 py-0.5 rounded-md border border-blue-200">
                Mandatory Approval
              </span>
            </div>
          ) : (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
              Warning: You do not currently have an approved mentor. You cannot submit goals until a mentor is allocated.
            </div>
          )}

          {/* Category Selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Goal Category <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'Academic', icon: GraduationCap, label: 'Academic' },
                { key: 'Professional', icon: Briefcase, label: 'Professional' },
                { key: 'Personal', icon: Sparkles, label: 'Personal' },
              ].map((cat) => {
                const IconComponent = cat.icon;
                const isSelected = addForm.category === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setAddForm({ ...addForm, category: cat.key })}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50/50 text-navy-950 font-bold ring-2 ring-brand-100'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 ${isSelected ? 'text-brand-600' : 'text-slate-400'}`} />
                    <span className="text-xs">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Goal Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={addForm.title}
              onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
              placeholder="e.g. Master Distributed Consensus Algorithms for Capstone"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Description & Methodology <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={addForm.description}
              onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
              placeholder="Explain the background, approach, key milestones and why this goal is important for your development..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Expected Outcome */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Expected Measurable Outcome <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={addForm.expectedOutcome}
              onChange={(e) => setAddForm({ ...addForm, expectedOutcome: e.target.value })}
              placeholder="e.g. Implement a working 3-node Raft cluster in Go passing all network partition benchmarks."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          {/* Dates & Trimester */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Target Completion Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                min={todayStr}
                value={addForm.targetDate}
                onChange={(e) => setAddForm({ ...addForm, targetDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Academic Trimester</label>
              <select
                value={addForm.trimester}
                onChange={(e) => setAddForm({ ...addForm, trimester: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="Trimester 1">Trimester 1</option>
                <option value="Trimester 2">Trimester 2</option>
                <option value="Trimester 3">Trimester 3</option>
              </select>
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Additional Notes (Optional)</label>
            <input
              type="text"
              value={addForm.notes}
              onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })}
              placeholder="e.g. Discussed with Dr. Chen during session 2; prerequisite for placement track."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" size="sm" type="button" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={!allocation || !allocatedMentor}>
              Submit for Mentor Approval
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── MODAL 2: EDIT / RESUBMIT GOAL ─────────────────────────────────── */}
      <Modal
        open={!!editModalGoal}
        onClose={() => setEditModalGoal(null)}
        title={
          editModalGoal?.status === 'changes_requested'
            ? 'Revise & Resubmit Goal'
            : 'Edit Goal'
        }
        description={
          editModalGoal?.status === 'changes_requested'
            ? 'Review your mentor\'s feedback and update the goal before resubmitting for approval.'
            : 'Update goal details. Changes will be saved to your mentorship plan.'
        }
        size="lg"
      >
        {editModalGoal && (
          <form onSubmit={handleEditGoalSubmit} className="space-y-4 text-xs">
            {editError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{editError}</span>
              </div>
            )}

            {/* Mentor Feedback Banner (When Changes Requested) */}
            {editModalGoal.status === 'changes_requested' && editModalGoal.mentorFeedback && (
              <div className="p-4 bg-amber-50/90 border border-amber-300 rounded-xl text-amber-950 space-y-1">
                <div className="flex items-center gap-2 font-bold text-xs text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-700" />
                  <span>Mentor Feedback & Required Adjustments</span>
                </div>
                <p className="text-xs text-amber-900 italic pl-6 leading-relaxed">
                  "{editModalGoal.mentorFeedback}"
                </p>
                <p className="text-[11px] text-amber-800 pl-6 pt-1">
                  Adjust the fields below to address this guidance. Upon submitting, the goal status will return to Pending Approval.
                </p>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Goal Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            {/* Category Selector */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Goal Category <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Academic', 'Professional', 'Personal'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setEditForm({ ...editForm, category: cat })}
                    className={`p-2.5 rounded-xl border text-center text-xs font-semibold cursor-pointer transition-all ${
                      editForm.category === cat
                        ? 'border-brand-600 bg-brand-50/50 text-navy-950 font-bold ring-2 ring-brand-100'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Description & Strategy <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none leading-relaxed"
              />
            </div>

            {/* Expected Outcome */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Expected Outcome <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={editForm.expectedOutcome}
                onChange={(e) => setEditForm({ ...editForm, expectedOutcome: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            {/* Target Date & Trimester */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Target Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={editForm.targetDate}
                  onChange={(e) => setEditForm({ ...editForm, targetDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Academic Trimester</label>
                <select
                  value={editForm.trimester}
                  onChange={(e) => setEditForm({ ...editForm, trimester: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="Trimester 1">Trimester 1</option>
                  <option value="Trimester 2">Trimester 2</option>
                  <option value="Trimester 3">Trimester 3</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Additional Notes</label>
              <input
                type="text"
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="secondary" size="sm" type="button" onClick={() => setEditModalGoal(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                {editModalGoal.status === 'changes_requested' ? 'Resubmit for Approval' : 'Save Changes'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* ── MODAL 3: UPDATE PROGRESS MODAL ────────────────────────────────── */}
      <Modal
        open={!!progressModalGoal}
        onClose={() => setProgressModalGoal(null)}
        title="Update Goal Progress"
        description={`Record your ongoing progress, milestones achieved, and notes for "${progressModalGoal?.title}".`}
        size="md"
      >
        {progressModalGoal && (
          <form onSubmit={handleProgressSubmit} className="space-y-4 text-xs">
            {progressError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{progressError}</span>
              </div>
            )}

            {/* Current vs New Progress Display */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600">Current Progress:</span>
                <span className="font-bold text-navy-900">{progressModalGoal.progress}%</span>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <label className="font-bold text-navy-900">New Progress Percentage:</label>
                  <span className="text-sm font-black text-brand-700">
                    {progressForm.progressPercentage}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={progressForm.progressPercentage}
                  onChange={(e) =>
                    setProgressForm({ ...progressForm, progressPercentage: Number(e.target.value) })
                  }
                  className="w-full accent-brand-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-medium mt-1">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            {/* Explanation if progress is reduced */}
            {progressForm.progressPercentage < progressModalGoal.progress && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5">
                <label className="block font-bold text-amber-900">
                  Reason for Progress Reduction <span className="text-rose-500">*</span>
                </label>
                <p className="text-[11px] text-amber-800">
                  Progress cannot decrease without an explanation note justifying the correction (e.g. scope recalibration, blocked dependency).
                </p>
                <textarea
                  rows={2}
                  required
                  value={progressForm.reasonForDecrease}
                  onChange={(e) => setProgressForm({ ...progressForm, reasonForDecrease: e.target.value })}
                  placeholder="Explain why progress percentage is being recalibrated downward..."
                  className="w-full p-2 bg-white rounded-lg border border-amber-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            )}

            {/* Milestones / Achievements Completed */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Milestones / Key Achievements Completed
              </label>
              <input
                type="text"
                value={progressForm.achievements}
                onChange={(e) => setProgressForm({ ...progressForm, achievements: e.target.value })}
                placeholder="e.g. Benchmarked 3-node leader election with 0 packet drops"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            {/* Progress Notes */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Progress Notes & Reflections <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={progressForm.progressNote}
                onChange={(e) => setProgressForm({ ...progressForm, progressNote: e.target.value })}
                placeholder="Detail what was built, challenges faced, or key lessons learned during this cycle..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none leading-relaxed"
              />
            </div>

            {/* Supporting Artifact / Link */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Supporting Link / Artifact (Optional)
              </label>
              <input
                type="text"
                value={progressForm.supportingDescription}
                onChange={(e) =>
                  setProgressForm({ ...progressForm, supportingDescription: e.target.value })
                }
                placeholder="e.g. GitHub PR #14, Notion design doc link, or demo recording"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[11px] text-slate-500 flex items-center gap-2">
              <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span>
                Note: Updating progress keeps your mentor informed. The faculty mentor conducts the final evaluation and marks goals as Achieved.
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="secondary" size="sm" type="button" onClick={() => setProgressModalGoal(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Submit Progress Update
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* ── MODAL 4: VIEW FULL DETAILS MODAL ──────────────────────────────── */}
      <Modal
        open={!!detailsModalGoal}
        onClose={() => setDetailsModalGoal(null)}
        title="Mentorship Goal Details"
        description="Comprehensive review of goal specifications, mentor feedback, and milestone progress timeline."
        size="lg"
      >
        {detailsModalGoal && (
          <div className="space-y-5 text-xs max-h-[75vh] overflow-y-auto pr-1">
            {/* Header Information */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {renderCategoryBadge(detailsModalGoal.category)}
                  <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {detailsModalGoal.trimester}
                  </span>
                </div>
                {renderStatusBadge(detailsModalGoal.status)}
              </div>

              <h3 className="text-base font-bold text-navy-900">{detailsModalGoal.title}</h3>

              {/* Progress Bar in Details */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600">Goal Progress</span>
                  <span className="text-navy-900">{detailsModalGoal.progress}% Completed</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${getProgressBarColor(detailsModalGoal.progress)}`}
                    style={{ width: `${detailsModalGoal.progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Mentor & Coordinator Allocation info */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Assigned Mentor</span>
                <p className="font-bold text-navy-900 mt-0.5">
                  {getMentorById(detailsModalGoal.mentorId)?.name || 'Faculty Mentor'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {getMentorById(detailsModalGoal.mentorId)?.department || 'CSE Department'}
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Target Date</span>
                <p className="font-bold text-navy-900 mt-0.5">{detailsModalGoal.targetDate}</p>
                <p className="text-[11px] text-slate-500">
                  Last updated {new Date(detailsModalGoal.updatedAt || detailsModalGoal.createdAt).toLocaleDateString()}
                </p>
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
                  <h4 className="font-bold text-slate-700 mb-1">Additional Context Notes</h4>
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                    "{detailsModalGoal.notes}"
                  </p>
                </div>
              )}
            </div>

            {/* Mentor Feedback History Section */}
            {getGoalFeedback(detailsModalGoal.id).length > 0 ? (
              <div className="space-y-2">
                <h4 className="font-bold text-navy-900 text-xs flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                  Mentor Feedback & Review Guidance ({getGoalFeedback(detailsModalGoal.id).length})
                </h4>
                <div className="space-y-2">
                  {getGoalFeedback(detailsModalGoal.id).map((fb) => (
                    <div
                      key={fb.id}
                      className={`p-3 rounded-xl border text-xs space-y-1 ${
                        fb.type === 'changes_requested'
                          ? 'bg-amber-50/80 border-amber-300 text-amber-950'
                          : fb.type === 'rejection'
                          ? 'bg-rose-50/80 border-rose-300 text-rose-950'
                          : fb.type === 'evaluation'
                          ? 'bg-purple-50/80 border-purple-200 text-purple-950'
                          : 'bg-blue-50/60 border-blue-200 text-blue-950'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-semibold">
                        <span className="capitalize flex items-center gap-1">
                          <UserCheck className="w-3 h-3" />
                          {fb.type === 'changes_requested'
                            ? 'Changes Requested'
                            : fb.type === 'approval'
                            ? 'Approved with Guidance'
                            : fb.type === 'evaluation'
                            ? 'Final Evaluation'
                            : 'Mentor Progress Feedback'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {new Date(fb.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className="italic leading-relaxed">"{fb.comment}"</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : detailsModalGoal.mentorFeedback ? (
              <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 space-y-1.5">
                <h4 className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-amber-700" />
                  Active Mentor Feedback
                </h4>
                <p className="text-xs text-amber-900 leading-relaxed italic">
                  "{detailsModalGoal.mentorFeedback}"
                </p>
              </div>
            ) : null}

            {/* Final Evaluation (If Achieved/Historical) */}
            {detailsModalGoal.evaluationComment && (
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 space-y-1.5">
                <h4 className="font-bold text-xs text-purple-950 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-purple-700" />
                  Final Mentor Evaluation: {detailsModalGoal.evaluation}
                </h4>
                <p className="text-xs text-purple-900 leading-relaxed">
                  "{detailsModalGoal.evaluationComment}"
                </p>
                {detailsModalGoal.evaluatedAt && (
                  <p className="text-[10px] text-purple-600 mt-1">
                    Evaluated on {new Date(detailsModalGoal.evaluatedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            {/* Progress History Timeline */}
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-navy-900 text-xs flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-brand-600" />
                  Progress Update Timeline
                </span>
                <span className="text-[11px] font-normal text-slate-400">
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
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex-1 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-navy-900 text-xs">
                            Progress: {up.previousProgress}% →{' '}
                            <strong className="text-brand-700">{up.progressPercentage}%</strong>
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(up.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>

                        {up.achievements && (
                          <p className="text-xs font-semibold text-slate-800">
                            ★ Milestone: {up.achievements}
                          </p>
                        )}

                        <p className="text-xs text-slate-600 leading-relaxed">{up.progressNote}</p>

                        {up.reasonForDecrease && (
                          <div className="p-2 bg-amber-50 rounded-lg text-amber-900 text-[11px]">
                            <strong>Correction Note:</strong> {up.reasonForDecrease}
                          </div>
                        )}

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
                <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-100 text-slate-400 text-xs">
                  No progress updates recorded yet. Once your mentor approves this goal, you can track progress milestones here.
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="secondary" size="sm" onClick={() => setDetailsModalGoal(null)}>
                Close
              </Button>
              {detailsModalGoal.status === 'active' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    const g = detailsModalGoal;
                    setDetailsModalGoal(null);
                    handleOpenProgressModal(g);
                  }}
                  icon={TrendingUp}
                >
                  Update Progress
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* ── MODAL: TRIMESTER REFLECTION FORM (DRAFT & SUBMIT) ───────────────── */}
      <Modal
        open={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title={`Overall Trimester Reflection: ${selectedReviewTrimester}`}
        description="Reflect on your academic, professional, and personal growth. You can save a draft or submit it to your assigned mentor."
        size="lg"
      >
        <div className="space-y-5 text-xs max-h-[75vh] overflow-y-auto pr-1">
          {reviewError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{reviewError}</span>
            </div>
          )}

          {/* Goal Outcome Summary Box */}
          {(() => {
            const sum = getMenteeTrimesterGoalSummary(currentUser?.id, selectedReviewTrimester);
            return (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-navy-900 text-xs">
                    Goal Outcome Summary ({selectedReviewTrimester})
                  </span>
                  <Badge variant="navy" size="xs">
                    Completion: {sum.overall.completionRate}%
                  </Badge>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center text-[11px] pt-1">
                  <div className="p-2 bg-white rounded-lg border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Total Goals</span>
                    <span className="font-bold text-slate-800 text-sm">{sum.overall.total}</span>
                  </div>
                  <div className="p-2 bg-blue-50/50 rounded-lg border border-blue-100">
                    <span className="text-blue-600 block text-[10px] uppercase font-semibold">Academic</span>
                    <span className="font-bold text-blue-800 text-sm">{sum.academic.achieved}/{sum.academic.total}</span>
                  </div>
                  <div className="p-2 bg-purple-50/50 rounded-lg border border-purple-100">
                    <span className="text-purple-600 block text-[10px] uppercase font-semibold">Professional</span>
                    <span className="font-bold text-purple-800 text-sm">{sum.professional.achieved}/{sum.professional.total}</span>
                  </div>
                  <div className="p-2 bg-amber-50/50 rounded-lg border border-amber-100">
                    <span className="text-amber-600 block text-[10px] uppercase font-semibold">Personal</span>
                    <span className="font-bold text-amber-800 text-sm">{sum.personal.achieved}/{sum.personal.total}</span>
                  </div>
                </div>

                {sum.unresolvedGoals.length > 0 && (
                  <p className="text-[10px] text-amber-700 bg-amber-50/80 p-2 rounded-lg border border-amber-200">
                    <strong>Note:</strong> You currently have {sum.unresolvedGoals.length} unresolved goal(s) in this trimester. You may submit your reflection now; your mentor will evaluate your individual goals before final review sign-off.
                  </p>
                )}
              </div>
            );
          })()}

          {/* Form Fields: Academic Reflection */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-xs text-navy-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              1. Academic Reflection
            </h4>
            <div className="space-y-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  What did I achieve academically this trimester?
                </label>
                <textarea
                  rows={2}
                  value={reflectionForm.academic.achievements}
                  onChange={(e) =>
                    setReflectionForm({
                      ...reflectionForm,
                      academic: { ...reflectionForm.academic, achievements: e.target.value },
                    })
                  }
                  placeholder="Key concepts learned, project milestones reached, coursework grades..."
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    What challenges did I face?
                  </label>
                  <input
                    type="text"
                    value={reflectionForm.academic.challenges}
                    onChange={(e) =>
                      setReflectionForm({
                        ...reflectionForm,
                        academic: { ...reflectionForm.academic, challenges: e.target.value },
                      })
                    }
                    placeholder="Complex algorithms, debugging, time allocation..."
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    What should I improve academically?
                  </label>
                  <input
                    type="text"
                    value={reflectionForm.academic.improvements}
                    onChange={(e) =>
                      setReflectionForm({
                        ...reflectionForm,
                        academic: { ...reflectionForm.academic, improvements: e.target.value },
                      })
                    }
                    placeholder="Test automation, deeper mathematical proofs..."
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Fields: Professional Reflection */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-xs text-navy-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Briefcase className="w-4 h-4 text-purple-600" />
              2. Professional Reflection
            </h4>
            <div className="space-y-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  What professional skills or competencies did I develop?
                </label>
                <textarea
                  rows={2}
                  value={reflectionForm.professional.skillsDeveloped}
                  onChange={(e) =>
                    setReflectionForm({
                      ...reflectionForm,
                      professional: { ...reflectionForm.professional, skillsDeveloped: e.target.value },
                    })
                  }
                  placeholder="System design, cloud architectures, interview techniques..."
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Career progress made:
                  </label>
                  <input
                    type="text"
                    value={reflectionForm.professional.careerProgress}
                    onChange={(e) =>
                      setReflectionForm({
                        ...reflectionForm,
                        professional: { ...reflectionForm.professional, careerProgress: e.target.value },
                      })
                    }
                    placeholder="Resume review, placement prep, certifications..."
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    What should I focus on next?
                  </label>
                  <input
                    type="text"
                    value={reflectionForm.professional.nextFocus}
                    onChange={(e) =>
                      setReflectionForm({
                        ...reflectionForm,
                        professional: { ...reflectionForm.professional, nextFocus: e.target.value },
                      })
                    }
                    placeholder="Target companies, internships, open source..."
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Fields: Personal Reflection */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-xs text-navy-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              3. Personal Reflection
            </h4>
            <div className="space-y-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  What personal improvements did I make?
                </label>
                <textarea
                  rows={2}
                  value={reflectionForm.personal.improvements}
                  onChange={(e) =>
                    setReflectionForm({
                      ...reflectionForm,
                      personal: { ...reflectionForm.personal, improvements: e.target.value },
                    })
                  }
                  placeholder="Time management habits, communication, consistency..."
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Challenges overcome:
                  </label>
                  <input
                    type="text"
                    value={reflectionForm.personal.challengesOvercome}
                    onChange={(e) =>
                      setReflectionForm({
                        ...reflectionForm,
                        personal: { ...reflectionForm.personal, challengesOvercome: e.target.value },
                      })
                    }
                    placeholder="Workload balance, presentation anxiety..."
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Next personal development priorities:
                  </label>
                  <input
                    type="text"
                    value={reflectionForm.personal.nextPriorities}
                    onChange={(e) =>
                      setReflectionForm({
                        ...reflectionForm,
                        personal: { ...reflectionForm.personal, nextPriorities: e.target.value },
                      })
                    }
                    placeholder="Public speaking, technical writing..."
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Fields: Overall Reflection (Mandatory for Submission) */}
          <div className="p-4 bg-blue-50/40 rounded-xl border border-blue-200 space-y-3">
            <h4 className="font-bold text-xs text-blue-950 flex items-center gap-1.5 border-b border-blue-200 pb-2">
              <FileText className="w-4 h-4 text-brand-600" />
              4. Overall Reflection <span className="text-rose-500">*</span>
            </h4>
            <div className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-800 mb-1">
                  Major Achievements This Trimester <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={reflectionForm.overall.majorAchievements}
                  onChange={(e) =>
                    setReflectionForm({
                      ...reflectionForm,
                      overall: { ...reflectionForm.overall, majorAchievements: e.target.value },
                    })
                  }
                  placeholder="Summarize your highest-impact outcomes and milestones..."
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-800 mb-1">
                  Areas That Need Improvement <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={reflectionForm.overall.areasForImprovement}
                  onChange={(e) =>
                    setReflectionForm({
                      ...reflectionForm,
                      overall: { ...reflectionForm.overall, areasForImprovement: e.target.value },
                    })
                  }
                  placeholder="What bottlenecks or skill gaps did you encounter?"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-800 mb-1">
                  Priorities For Next Trimester <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={reflectionForm.overall.nextTrimesterPriorities}
                  onChange={(e) =>
                    setReflectionForm({
                      ...reflectionForm,
                      overall: { ...reflectionForm.overall, nextTrimesterPriorities: e.target.value },
                    })
                  }
                  placeholder="Key targets, projects, and learning objectives for the upcoming term..."
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const res = saveTrimesterReviewDraft({
                  menteeId: currentUser.id,
                  trimester: selectedReviewTrimester,
                  reflections: reflectionForm,
                });
                if (!res.success) {
                  setReviewError(res.error);
                } else {
                  setReviewModalOpen(false);
                  setNotification({ type: 'success', message: 'Trimester review draft saved successfully.' });
                }
              }}
            >
              Save Draft
            </Button>

            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setReviewModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  const res = submitTrimesterReview({
                    menteeId: currentUser.id,
                    trimester: selectedReviewTrimester,
                    reflections: reflectionForm,
                  });
                  if (!res.success) {
                    setReviewError(res.error);
                  } else {
                    setReviewModalOpen(false);
                    setNotification({
                      type: 'success',
                      message: `Your ${selectedReviewTrimester} review has been submitted to your assigned mentor.`,
                    });
                  }
                }}
              >
                Submit Reflection to Mentor
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* ── MODAL: VIEW FINALIZED / SUBMITTED REVIEW DETAILS ────────────────── */}
      {viewReviewDetails && (
        <Modal
          open={!!viewReviewDetails}
          onClose={() => setViewReviewDetails(null)}
          title={`Trimester Review: ${viewReviewDetails.trimester}`}
          description={`Status: ${viewReviewDetails.status.toUpperCase()} • Mentee: ${currentUser?.name}`}
          size="lg"
        >
          <div className="space-y-4 text-xs max-h-[75vh] overflow-y-auto pr-1">
            {/* Goal Outcome Summary Bar */}
            {(() => {
              const sum = getMenteeTrimesterGoalSummary(currentUser?.id, viewReviewDetails.trimester);
              return (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold text-navy-900">
                    <span>Trimester Outcome Summary</span>
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

            {/* Mentor Final Evaluation Box (if finalized) */}
            {viewReviewDetails.status === 'finalized' && viewReviewDetails.mentorReview && (
              <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-950 space-y-2">
                <div className="flex items-center justify-between border-b border-teal-200 pb-2">
                  <h4 className="font-bold text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    Mentor Evaluation & Acknowledgment
                  </h4>
                  <span className="text-[10px] text-teal-700">
                    Finalized on {new Date(viewReviewDetails.finalizedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="space-y-1.5 pt-1">
                  <p className="text-xs">
                    <strong>Mentor Comments: </strong>
                    <span className="italic">"{viewReviewDetails.mentorReview.overallComments}"</span>
                  </p>
                  {viewReviewDetails.mentorReview.recommendations && (
                    <p className="text-xs">
                      <strong>Recommendations: </strong>
                      {viewReviewDetails.mentorReview.recommendations}
                    </p>
                  )}
                  {viewReviewDetails.mentorReview.nextTrimesterPriorities && (
                    <p className="text-xs">
                      <strong>Suggested Priorities: </strong>
                      {viewReviewDetails.mentorReview.nextTrimesterPriorities}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-teal-200 flex items-center justify-between text-[11px] text-teal-800">
                  <span>
                    Acknowledged by: <strong>{viewReviewDetails.mentorReview.acknowledgedBy}</strong>
                  </span>
                  <span>
                    {viewReviewDetails.mentorReview.acknowledgedAt &&
                      new Date(viewReviewDetails.mentorReview.acknowledgedAt).toLocaleString()}
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
                <p><strong>Achievements:</strong> {viewReviewDetails.reflections?.academic?.achievements || 'None noted'}</p>
                <p><strong>Challenges:</strong> {viewReviewDetails.reflections?.academic?.challenges || 'None noted'}</p>
                <p><strong>Improvements:</strong> {viewReviewDetails.reflections?.academic?.improvements || 'None noted'}</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5">
                <h5 className="font-bold text-purple-900 flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-purple-600" /> Professional Reflection
                </h5>
                <p><strong>Skills Developed:</strong> {viewReviewDetails.reflections?.professional?.skillsDeveloped || 'None noted'}</p>
                <p><strong>Career Progress:</strong> {viewReviewDetails.reflections?.professional?.careerProgress || 'None noted'}</p>
                <p><strong>Next Focus:</strong> {viewReviewDetails.reflections?.professional?.nextFocus || 'None noted'}</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5">
                <h5 className="font-bold text-amber-900 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Personal Reflection
                </h5>
                <p><strong>Improvements:</strong> {viewReviewDetails.reflections?.personal?.improvements || 'None noted'}</p>
                <p><strong>Challenges Overcome:</strong> {viewReviewDetails.reflections?.personal?.challengesOvercome || 'None noted'}</p>
                <p><strong>Next Priorities:</strong> {viewReviewDetails.reflections?.personal?.nextPriorities || 'None noted'}</p>
              </div>

              <div className="p-3 bg-blue-50/40 rounded-xl border border-blue-200 space-y-1.5">
                <h5 className="font-bold text-navy-950 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-brand-600" /> Overall Reflection
                </h5>
                <p><strong>Major Achievements:</strong> {viewReviewDetails.reflections?.overall?.majorAchievements}</p>
                <p><strong>Areas For Improvement:</strong> {viewReviewDetails.reflections?.overall?.areasForImprovement}</p>
                <p><strong>Next Trimester Priorities:</strong> {viewReviewDetails.reflections?.overall?.nextTrimesterPriorities}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setViewReviewDetails(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── SUBCOMPONENT: Goal Card ────────────────────────────────────────────────
function GoalCard({
  goal,
  onViewDetails,
  onEdit,
  onUpdateProgress,
  renderStatusBadge,
  renderCategoryBadge,
  getProgressBarColor,
}) {
  const isEditable = goal.status === 'pending_approval' || goal.status === 'changes_requested';
  const isActive = goal.status === 'active';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 p-5 shadow-2xs transition-all flex flex-col justify-between">
      <div className="space-y-3">
        {/* Top Badges */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {renderCategoryBadge(goal.category)}
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
              {goal.trimester}
            </span>
          </div>
          {renderStatusBadge(goal.status)}
        </div>

        {/* Title */}
        <h4 className="text-base font-bold text-navy-900 leading-snug">{goal.title}</h4>

        {/* Description */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{goal.description}</p>

        {/* Expected Outcome Pill */}
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
          <span className="font-bold text-slate-700 block text-[11px] mb-0.5">Expected Outcome:</span>
          <p className="text-slate-600 line-clamp-2 text-xs">{goal.expectedOutcome}</p>
        </div>

        {/* Mentor Feedback Alert Banner (Changes Requested) */}
        {goal.status === 'changes_requested' && goal.mentorFeedback && (
          <div className="p-3 rounded-xl bg-rose-50/80 border border-rose-200 text-rose-900 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-rose-800 text-xs">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
              <span>Mentor Feedback (Changes Requested):</span>
            </div>
            <p className="text-[11px] text-rose-900 italic line-clamp-2 leading-relaxed pl-5">
              "{goal.mentorFeedback}"
            </p>
          </div>
        )}

        {/* Progress Bar (Visible for active, achieved, or in-progress) */}
        <div className="space-y-1 pt-1">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-500">Progress</span>
            <span className="text-navy-900 font-bold">{goal.progress}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${getProgressBarColor(goal.progress)}`}
              style={{ width: `${goal.progress}%` }}
            />
          </div>
        </div>

        {/* Target Date & Updated Metadata */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <span className="flex items-center gap-1 text-slate-600 font-medium">
            <Calendar className="w-3 h-3 text-slate-400" /> Target: {goal.targetDate}
          </span>
          <span>Updated: {new Date(goal.updatedAt || goal.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          onClick={onViewDetails}
          className="text-xs font-semibold text-brand-700 hover:text-brand-900 cursor-pointer flex items-center gap-1"
        >
          View Details
        </button>

        <div className="flex items-center gap-1.5">
          {isEditable && (
            <Button
              variant={goal.status === 'changes_requested' ? 'primary' : 'secondary'}
              size="xs"
              onClick={onEdit}
              icon={Edit3}
            >
              {goal.status === 'changes_requested' ? 'Edit & Resubmit' : 'Edit Goal'}
            </Button>
          )}

          {isActive && (
            <Button variant="primary" size="xs" onClick={onUpdateProgress} icon={TrendingUp}>
              Update Progress
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── SUBCOMPONENT: Empty Category Card ──────────────────────────────────────
function EmptyCategoryCard({ category, icon: Icon, description, onAdd }) {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center">
      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2.5">
        <Icon className="w-5 h-5" />
      </div>
      <h4 className="text-xs font-bold text-navy-900 mb-1">No {category} Goals</h4>
      <p className="text-[11px] text-slate-500 max-w-sm mx-auto mb-3.5 leading-relaxed">
        {description}
      </p>
      <Button variant="secondary" size="xs" onClick={onAdd} icon={Plus}>
        Create {category} Goal
      </Button>
    </div>
  );
}
