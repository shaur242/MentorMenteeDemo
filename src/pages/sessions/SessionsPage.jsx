import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Video,
  Building,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  Filter,
  ExternalLink,
  Star,
  AlertCircle,
  Sparkles,
  User,
  UserCheck,
  MessageSquare,
  FileText,
  Send,
  CalendarPlus,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import SubmitReportModal from '../../components/common/SubmitReportModal';
import SessionReportViewModal from '../../components/common/SessionReportViewModal';

export default function SessionsPage() {
  const {
    currentUser,
    currentRole,
    sessions,
    connections,
    mentors,
    getUserById,
    getMentorById,
    getMentorAllocatedMentees,
    bookSession,
    confirmSession,
    cancelSession,
    declineSession,
    completeSession,
    getSessionReview,
    addReview,
    updateReview,
    isUserConnected,
    getSessionReport,
  } = useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const isMentor = currentRole === 'Mentor';
  const isMentee = currentRole === 'Mentee';
  const isCoordOrHod = currentRole === 'Coordinator' || currentRole === 'HOD' || currentRole === 'Admin';

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'confirmed' | 'pending' | 'completed' | 'cancelled'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMentorId, setFilterMentorId] = useState('all');

  // URL query parameter deep linking (?bookMenteeId=... or ?bookMentorId=... or ?menteeId=...)
  const bookMenteeId = searchParams.get('bookMenteeId');
  const bookMentorId = searchParams.get('bookMentorId');
  const menteeFilterId = searchParams.get('menteeId');

  // Booking Modal State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    mentorId: '',
    menteeId: '',
    title: '',
    description: '',
    agenda: '',
    requestMessage: '',
    date: '',
    startTime: '02:00 PM',
    duration: '45 mins',
    meetingMode: 'Campus Cabin 304',
    meetingLink: '',
  });
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewSession, setReviewSession] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewError, setReviewError] = useState('');
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);

  // Report Modals State
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportSession, setReportSession] = useState(null);
  const [viewReportModalOpen, setViewReportModalOpen] = useState(false);
  const [activeReportToView, setActiveReportToView] = useState(null);
  const [reportNotification, setReportNotification] = useState('');

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    action: null,
    danger: false,
  });

  // Calculate today's minimum booking date (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];

  // Mentee's eligible mentors: either accepted connection or assigned mentor
  const eligibleMentorsForMentee = useMemo(() => {
    if (!isMentee || !currentUser) return [];
    return mentors.filter((m) => isUserConnected(m.id, currentUser.id));
  }, [mentors, isMentee, currentUser?.id, isUserConnected]);

  // Mentor's officially allocated mentees
  const allocatedMenteesForMentor = useMemo(() => {
    if (!isMentor || !currentUser) return [];
    return getMentorAllocatedMentees(currentUser.id)
      .map((item) => item.mentee)
      .filter(Boolean);
  }, [isMentor, currentUser?.id, getMentorAllocatedMentees]);

  // Mentee being specifically filtered (if navigated via "Sessions (X)" button from MentorMenteesPage)
  const filteredMentee = useMemo(() => {
    if (!menteeFilterId) return null;
    return getUserById(menteeFilterId);
  }, [menteeFilterId, getUserById]);

  // Hydrate all sessions with mentor and mentee user objects
  const hydratedSessions = useMemo(() => {
    return sessions.map((s) => {
      const mentorObj = getMentorById(s.mentorId) || getUserById(s.mentorId);
      const menteeObj = getUserById(s.menteeId);
      return {
        ...s,
        mentor: mentorObj || { id: s.mentorId, name: 'Faculty Mentor' },
        mentee: menteeObj || { id: s.menteeId, name: 'Assigned Mentee' },
      };
    });
  }, [sessions, getMentorById, getUserById]);

  // Scope sessions by user role
  const roleSessions = useMemo(() => {
    if (!currentUser) return [];
    return hydratedSessions.filter((s) => {
      if (isMentee) {
        return s.menteeId === currentUser.id;
      }
      if (isMentor) {
        return s.mentorId === currentUser.id;
      }
      if (currentRole === 'Coordinator') {
        return s.mentor?.coordinatorId === currentUser.id || s.mentor?.coordinator === currentUser.id;
      }
      // HOD or Admin
      return true;
    });
  }, [hydratedSessions, isMentee, isMentor, currentRole, currentUser?.id]);

  // Base sessions filtered by menteeId (if clicked from MentorMenteesPage) and mentorId (for Coordinator)
  const baseSessions = useMemo(() => {
    return roleSessions.filter((s) => {
      if (menteeFilterId && s.menteeId !== menteeFilterId) {
        return false;
      }
      if (isCoordOrHod && filterMentorId !== 'all' && s.mentorId !== filterMentorId) {
        return false;
      }
      return true;
    });
  }, [roleSessions, menteeFilterId, isCoordOrHod, filterMentorId]);

  // Status Tab Counts for current scope
  const tabCounts = useMemo(() => {
    return {
      all: baseSessions.length,
      confirmed: baseSessions.filter((s) => s.status === 'confirmed').length,
      pending: baseSessions.filter((s) => s.status === 'pending').length,
      completed: baseSessions.filter((s) => s.status === 'completed').length,
      cancelled: baseSessions.filter((s) => s.status === 'cancelled').length,
    };
  }, [baseSessions]);

  // Scoped sessions after status tab and search query filtering
  const scopedSessions = useMemo(() => {
    return baseSessions.filter((s) => {
      if (activeTab !== 'all' && s.status !== activeTab) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = s.title?.toLowerCase().includes(q);
        const mentorMatch = s.mentor?.name?.toLowerCase().includes(q);
        const menteeMatch = s.mentee?.name?.toLowerCase().includes(q);
        const descMatch = s.description?.toLowerCase().includes(q);
        const agendaMatch = s.agenda?.toLowerCase().includes(q);
        if (!titleMatch && !mentorMatch && !menteeMatch && !descMatch && !agendaMatch) {
          return false;
        }
      }
      return true;
    });
  }, [baseSessions, activeTab, searchQuery]);

  // Handlers
  const handleOpenBookingModal = (preselectedPartnerId = null) => {
    setBookingError('');
    setBookingSuccess(false);

    if (isMentor) {
      const defaultMenteeId =
        preselectedPartnerId ||
        bookingForm.menteeId ||
        allocatedMenteesForMentor[0]?.id ||
        '';
      setBookingForm({
        mentorId: currentUser?.id || '',
        menteeId: defaultMenteeId,
        title: '',
        description: '',
        agenda: '',
        requestMessage: '',
        date: '',
        startTime: '02:00 PM',
        duration: '45 mins',
        meetingMode: 'Google Meet',
        meetingLink: `https://meet.google.com/mentor-${Date.now().toString().slice(-4)}`,
      });
    } else {
      const defaultMentorId =
        preselectedPartnerId ||
        bookingForm.mentorId ||
        eligibleMentorsForMentee[0]?.id ||
        '';
      setBookingForm({
        mentorId: defaultMentorId,
        menteeId: currentUser?.id || '',
        title: '',
        description: '',
        agenda: '',
        requestMessage: '',
        date: '',
        startTime: '02:00 PM',
        duration: '45 mins',
        meetingMode: 'Campus Cabin 304',
        meetingLink: '',
      });
    }
    setBookingModalOpen(true);
  };

  // URL query parameter deep linking (?bookMenteeId=... or ?bookMentorId=...)
  useEffect(() => {
    if (bookMenteeId && isMentor) {
      handleOpenBookingModal(bookMenteeId);
      // Clean query parameter from URL so closing the modal or changing inputs doesn't loop or get stuck
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('bookMenteeId');
      setSearchParams(nextParams, { replace: true });
    } else if (bookMentorId && isMentee) {
      handleOpenBookingModal(bookMentorId);
      // Clean query parameter from URL
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('bookMentorId');
      setSearchParams(nextParams, { replace: true });
    }
  }, [bookMenteeId, bookMentorId, isMentor, isMentee]);

  const handleCreateBooking = (e) => {
    e.preventDefault();
    setBookingError('');

    if (isMentor) {
      if (!bookingForm.menteeId) {
        setBookingError('Please select an officially allocated mentee.');
        return;
      }
      if (!bookingForm.title.trim()) {
        setBookingError('Please enter a session title or objective.');
        return;
      }
      if (!bookingForm.date) {
        setBookingError('Please select a session date.');
        return;
      }

      const res = bookSession({
        mentorId: currentUser.id,
        menteeId: bookingForm.menteeId,
        title: bookingForm.title,
        description: bookingForm.description,
        agenda: bookingForm.agenda || bookingForm.description,
        requestMessage: bookingForm.requestMessage,
        date: bookingForm.date,
        startTime: bookingForm.startTime,
        duration: bookingForm.duration,
        meetingMode: bookingForm.meetingMode,
        meetingLink: bookingForm.meetingLink,
        initiatedBy: 'mentor',
      });

      if (res.success) {
        setBookingSuccess(true);
        setTimeout(() => {
          setBookingModalOpen(false);
          setBookingSuccess(false);
          setActiveTab('pending');
        }, 1500);
      } else {
        setBookingError(res.error);
      }
    } else {
      if (!bookingForm.mentorId) {
        setBookingError('Please select a connected mentor.');
        return;
      }
      if (!bookingForm.title.trim()) {
        setBookingError('Please enter a session title or objective.');
        return;
      }
      if (!bookingForm.date) {
        setBookingError('Please select a session date.');
        return;
      }

      const res = bookSession({
        mentorId: bookingForm.mentorId,
        menteeId: currentUser.id,
        title: bookingForm.title,
        description: bookingForm.description,
        agenda: bookingForm.agenda || bookingForm.description,
        requestMessage: bookingForm.requestMessage,
        date: bookingForm.date,
        startTime: bookingForm.startTime,
        duration: bookingForm.duration,
        meetingMode: bookingForm.meetingMode,
        meetingLink: bookingForm.meetingLink,
        initiatedBy: 'mentee',
      });

      if (res.success) {
        setBookingSuccess(true);
        setTimeout(() => {
          setBookingModalOpen(false);
          setBookingSuccess(false);
          setActiveTab('pending');
        }, 1500);
      } else {
        setBookingError(res.error);
      }
    }
  };

  const handleConfirmSession = (sessionId) => {
    const res = confirmSession(sessionId, currentUser?.id);
    if (res && res.success) {
      setReportNotification('Session confirmed! Meeting schedule is now confirmed for both participants.');
      setTimeout(() => setReportNotification(''), 4500);
    } else {
      setReportNotification(res?.error || 'Failed to confirm session.');
      setTimeout(() => setReportNotification(''), 4500);
    }
  };

  const handleDeclineSessionPrompt = (sessionId, title, partnerName) => {
    setConfirmDialog({
      open: true,
      title: 'Decline Session Request?',
      message: `Are you sure you want to decline the session "${title}" with ${partnerName || 'the other participant'}? The session status will be updated to cancelled.`,
      danger: true,
      action: () => {
        const res = cancelSession(sessionId, 'Declined by recipient', currentUser?.id);
        if (res && res.success) {
          setReportNotification(`Session "${title}" was declined.`);
          setTimeout(() => setReportNotification(''), 4500);
        }
      },
    });
  };

  const handleCancelSessionPrompt = (sessionId, title) => {
    setConfirmDialog({
      open: true,
      title: 'Cancel Session?',
      message: `Are you sure you want to cancel the session "${title}"?`,
      danger: true,
      action: () => {
        const res = cancelSession(sessionId, 'Cancelled by user', currentUser?.id);
        if (res && res.success) {
          setReportNotification(`Session "${title}" was cancelled.`);
          setTimeout(() => setReportNotification(''), 4500);
        }
      },
    });
  };

  const handleCompleteSessionPrompt = (sessionId, title) => {
    setConfirmDialog({
      open: true,
      title: 'Mark Session as Completed?',
      message: `Confirm that the mentoring session "${title}" has finished. This will allow the mentee to submit a rating and review.`,
      danger: false,
      action: () => completeSession(sessionId),
    });
  };

  // Review handlers
  const handleOpenReviewModal = (session) => {
    setReviewSession(session);
    setReviewError('');
    const existing = getSessionReview(session.id);
    if (existing) {
      setIsEditingReview(true);
      setEditingReviewId(existing.id);
      setReviewForm({ rating: existing.rating, comment: existing.comment });
    } else {
      setIsEditingReview(false);
      setEditingReviewId(null);
      setReviewForm({ rating: 5, comment: '' });
    }
    setReviewModalOpen(true);
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    setReviewError('');

    if (!reviewForm.comment.trim()) {
      setReviewError('Please provide a brief comment describing your mentoring experience.');
      return;
    }

    if (isEditingReview && editingReviewId) {
      updateReview(editingReviewId, {
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      setReviewModalOpen(false);
    } else {
      const res = addReview({
        sessionId: reviewSession.id,
        mentorId: reviewSession.mentorId,
        menteeId: currentUser.id,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });

      if (res.success) {
        setReviewModalOpen(false);
      } else {
        setReviewError(res.error);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title="Session Management"
        subtitle={
          isMentee
            ? 'Schedule 1-on-1 mentoring sessions, respond to mentor proposals, access meeting links, and leave reviews.'
            : isMentor
            ? 'Initiate sessions with your allocated mentees, confirm incoming requests, manage meetings, and finalize reports.'
            : 'Departmental session schedule, attendance oversight, and mentor booking records.'
        }
        breadcrumbs={[currentRole || 'User', 'Sessions']}
      >
        {(isMentee || isMentor) && (
          <Button variant="primary" size="sm" onClick={() => handleOpenBookingModal()} icon={Plus}>
            {isMentor ? 'Schedule with Mentee' : 'Book a Session'}
          </Button>
        )}
      </PageHeader>

      {/* Report / Status Notification */}
      {reportNotification && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{reportNotification}</span>
          </div>
          <button
            onClick={() => setReportNotification('')}
            className="text-xs text-emerald-700 hover:text-emerald-950 font-bold ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Mentee Specific Filter Banner */}
      {filteredMentee && (
        <div className="bg-brand-50/80 border border-brand-200 rounded-2xl p-4 px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
              {filteredMentee.name?.charAt(0) || 'M'}
            </div>
            <div>
              <p className="text-xs font-bold text-brand-950">
                Filtered by Mentee: {filteredMentee.name}
              </p>
              <p className="text-[11px] text-brand-700">
                Showing {baseSessions.length} total session record{baseSessions.length === 1 ? '' : 's'} for this student.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              const nextParams = new URLSearchParams(searchParams);
              nextParams.delete('menteeId');
              setSearchParams(nextParams, { replace: true });
            }}
            className="text-xs font-bold text-brand-700 hover:text-brand-950 underline cursor-pointer self-start sm:self-auto"
          >
            Clear Filter (Show All Mentees)
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-xl">
          {[
            { key: 'all', label: 'All Sessions', count: tabCounts.all },
            { key: 'confirmed', label: 'Confirmed', count: tabCounts.confirmed },
            { key: 'pending', label: 'Pending', count: tabCounts.pending },
            { key: 'completed', label: 'Completed', count: tabCounts.completed },
            { key: 'cancelled', label: 'Cancelled', count: tabCounts.cancelled },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === tab.key
                  ? 'bg-white text-navy-900 shadow-xs'
                  : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === tab.key ? 'bg-navy-900 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Coordinator Filters */}
        <div className="flex items-center gap-2">
          {isCoordOrHod && (
            <select
              value={filterMentorId}
              onChange={(e) => setFilterMentorId(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 bg-white"
            >
              <option value="all">
                {currentRole === 'Coordinator' ? 'All Cohort Mentors' : 'All Department Mentors'}
              </option>
              {(currentRole === 'Coordinator'
                ? mentors.filter((m) => m.coordinatorId === currentUser?.id)
                : mentors
              ).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          )}

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search session..."
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none w-48 sm:w-56"
            />
          </div>
        </div>
      </div>

      {/* Sessions Grid */}
      {scopedSessions.length > 0 ? (
        <div className="space-y-4">
          {scopedSessions.map((session) => {
            const isConfirmed = session.status === 'confirmed';
            const isPending = session.status === 'pending';
            const isCompleted = session.status === 'completed';
            const isCancelled = session.status === 'cancelled';
            const review = getSessionReview(session.id);
            const initiatedBy = session.initiatedBy || 'mentee';

            // Determine if currentUser is the one who must confirm/accept or if they are waiting
            const needsMyAction =
              isPending &&
              ((isMentor && (session.confirmationRequiredFrom === 'mentor' || initiatedBy === 'mentee')) ||
               (isMentee && (session.confirmationRequiredFrom === 'mentee' || initiatedBy === 'mentor')));

            const isAwaitingPartner = isPending && !needsMyAction;

            return (
              <div
                key={session.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5 ${
                  needsMyAction
                    ? 'border-amber-300 ring-2 ring-amber-100 bg-amber-50/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Left: Partner Avatar + Info */}
                <div className="flex items-start gap-4 min-w-0">
                  <Avatar
                    user={isMentee ? session.mentor : session.mentee}
                    size="lg"
                    className="flex-shrink-0"
                  />
                  <div className="min-w-0 space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-bold text-navy-900 leading-tight">
                        {session.title}
                      </h4>

                      {/* Main Status Badge */}
                      {isConfirmed && (
                        <Badge variant="success" size="sm">
                          CONFIRMED
                        </Badge>
                      )}
                      {isCompleted && (
                        <Badge variant="navy" size="sm">
                          COMPLETED
                        </Badge>
                      )}
                      {isCancelled && (
                        <Badge variant="danger" size="sm">
                          {session.cancelReason?.toLowerCase().includes('declined') ? 'DECLINED' : 'CANCELLED'}
                        </Badge>
                      )}
                      {isPending && (
                        <>
                          {needsMyAction ? (
                            <Badge variant="warning" size="sm" className="bg-amber-100 text-amber-900 border-amber-300 font-bold">
                              ACTION REQUIRED: AWAITING YOUR CONFIRMATION
                            </Badge>
                          ) : isAwaitingPartner ? (
                            <Badge variant="warning" size="sm">
                              AWAITING {initiatedBy === 'mentor' ? 'MENTEE' : 'MENTOR'} CONFIRMATION
                            </Badge>
                          ) : (
                            <Badge variant="warning" size="sm">
                              PENDING ({initiatedBy === 'mentor' ? 'MENTEE CONFIRMATION' : 'MENTOR CONFIRMATION'})
                            </Badge>
                          )}
                        </>
                      )}

                      {/* Initiator Pill */}
                      {initiatedBy === 'mentor' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                          <UserCheck className="w-3 h-3 text-purple-600" />
                          Proposed by Mentor
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                          <User className="w-3 h-3 text-blue-600" />
                          Requested by Mentee
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600">
                      {isMentee ? (
                        <span>
                          Faculty Mentor: <strong className="text-slate-900">{session.mentor?.name}</strong> ({session.mentor?.department || session.mentor?.title})
                        </span>
                      ) : isMentor ? (
                        <span>
                          Assigned Mentee: <strong className="text-slate-900">{session.mentee?.name}</strong> ({session.mentee?.year || session.mentee?.department})
                        </span>
                      ) : (
                        <span>
                          <strong className="text-slate-900">{session.mentor?.name}</strong> with <strong className="text-slate-900">{session.mentee?.name}</strong>
                        </span>
                      )}
                    </p>

                    {/* Description / Agenda */}
                    {session.description && (
                      <p className="text-xs text-slate-600 italic max-w-xl line-clamp-2">
                        "{session.description}"
                      </p>
                    )}

                    {session.agenda && session.agenda !== session.description && (
                      <p className="text-xs text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 max-w-xl">
                        <strong className="text-slate-800">Discussion Agenda:</strong> {session.agenda}
                      </p>
                    )}

                    {session.requestMessage && (
                      <p className="text-xs text-brand-800 bg-brand-50/70 px-2.5 py-1.5 rounded-lg border border-brand-100 max-w-xl italic">
                        <strong className="not-italic font-semibold text-brand-900">Message from {initiatedBy === 'mentor' ? 'Mentor' : 'Mentee'}:</strong> "{session.requestMessage}"
                      </p>
                    )}

                    {isCancelled && session.cancelReason && (
                      <p className="text-xs text-rose-700 bg-rose-50/60 px-2.5 py-1.5 rounded-lg border border-rose-100 max-w-xl">
                        <strong>Reason:</strong> {session.cancelReason}
                      </p>
                    )}

                    {/* Schedule Metadata */}
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-brand-600" />
                        {session.date}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {session.startTime} ({session.duration})
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        {session.meetingMode}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 flex-shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                  {/* Meeting link for confirmed session */}
                  {isConfirmed && session.meetingLink && (
                    <a
                      href={session.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold text-xs border border-brand-200 transition-colors"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Room</span>
                      <ExternalLink className="w-3 h-3 text-brand-500" />
                    </a>
                  )}

                  {/* ── MENTOR ACTIONS ── */}
                  {isMentor && (
                    <>
                      {isPending && (
                        <>
                          {initiatedBy === 'mentee' ? (
                            /* Incoming request from mentee: mentor confirms or declines */
                            <div className="flex items-center gap-2">
                              <Button
                                variant="secondary"
                                size="xs"
                                onClick={() => handleDeclineSessionPrompt(session.id, session.title, session.mentee?.name)}
                                className="text-rose-600 hover:bg-rose-50 border-rose-200"
                                icon={XCircle}
                              >
                                Decline
                              </Button>
                              <Button
                                variant="success"
                                size="xs"
                                onClick={() => handleConfirmSession(session.id)}
                                icon={CheckCircle2}
                              >
                                Confirm Booking
                              </Button>
                            </div>
                          ) : (
                            /* Mentor initiated: mentor is waiting for mentee */
                            <Button
                              variant="secondary"
                              size="xs"
                              onClick={() => handleCancelSessionPrompt(session.id, session.title)}
                              className="text-slate-500 hover:text-rose-600 border-slate-200"
                            >
                              Cancel Proposal
                            </Button>
                          )}
                        </>
                      )}

                      {isConfirmed && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="secondary"
                            size="xs"
                            onClick={() => handleCancelSessionPrompt(session.id, session.title)}
                            className="text-rose-600"
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="primary"
                            size="xs"
                            onClick={() => {
                              setReportSession(session);
                              setReportModalOpen(true);
                            }}
                            icon={FileText}
                          >
                            Complete & Submit Report
                          </Button>
                        </div>
                      )}

                      {isCompleted && (
                        <div>
                          {getSessionReport(session.id) ? (
                            <Button
                              variant="secondary"
                              size="xs"
                              onClick={() => {
                                setActiveReportToView(getSessionReport(session.id));
                                setViewReportModalOpen(true);
                              }}
                              icon={FileText}
                            >
                              View Report
                            </Button>
                          ) : (
                            <Button
                              variant="warning"
                              size="xs"
                              onClick={() => {
                                setReportSession(session);
                                setReportModalOpen(true);
                              }}
                              icon={FileText}
                            >
                              Submit Report
                            </Button>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {/* ── MENTEE ACTIONS ── */}
                  {isMentee && (
                    <>
                      {isPending && (
                        <>
                          {initiatedBy === 'mentor' ? (
                            /* Incoming proposal from mentor: mentee accepts or declines */
                            <div className="flex items-center gap-2">
                              <Button
                                variant="secondary"
                                size="xs"
                                onClick={() => handleDeclineSessionPrompt(session.id, session.title, session.mentor?.name)}
                                className="text-rose-600 hover:bg-rose-50 border-rose-200"
                                icon={XCircle}
                              >
                                Decline
                              </Button>
                              <Button
                                variant="success"
                                size="xs"
                                onClick={() => handleConfirmSession(session.id)}
                                icon={CheckCircle2}
                              >
                                Accept & Confirm
                              </Button>
                            </div>
                          ) : (
                            /* Mentee requested: mentee is waiting for mentor */
                            <Button
                              variant="secondary"
                              size="xs"
                              onClick={() => handleCancelSessionPrompt(session.id, session.title)}
                              className="text-slate-500 hover:text-rose-600 border-slate-200"
                            >
                              Cancel Request
                            </Button>
                          )}
                        </>
                      )}

                      {isConfirmed && (
                        <Button
                          variant="secondary"
                          size="xs"
                          onClick={() => handleCancelSessionPrompt(session.id, session.title)}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          Cancel
                        </Button>
                      )}

                      {isCompleted && (
                        <div className="flex items-center gap-2">
                          {getSessionReport(session.id) && (
                            <Button
                              variant="secondary"
                              size="xs"
                              onClick={() => {
                                setActiveReportToView(getSessionReport(session.id));
                                setViewReportModalOpen(true);
                              }}
                              icon={FileText}
                            >
                              Session Report
                            </Button>
                          )}
                          {review ? (
                            <Button
                              variant="secondary"
                              size="xs"
                              onClick={() => handleOpenReviewModal(session)}
                              icon={Star}
                              className="text-amber-700 bg-amber-50/60 border-amber-200"
                            >
                              Review: {review.rating}★ (Edit)
                            </Button>
                          ) : (
                            <Button
                              variant="primary"
                              size="xs"
                              onClick={() => handleOpenReviewModal(session)}
                              icon={Star}
                            >
                              Leave Review
                            </Button>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-navy-900">No sessions found in this category</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
            {isMentee
              ? 'Connect with mentors and book your first 1-on-1 guidance meeting.'
              : isMentor
              ? 'Initiate a session proposal with your allocated mentees or check back for incoming requests.'
              : 'No sessions match your active filters.'}
          </p>
          {isMentee && (
            <Button variant="primary" size="sm" onClick={() => handleOpenBookingModal()} icon={Plus}>
              Book a Session Now
            </Button>
          )}
          {isMentor && (
            <Button variant="primary" size="sm" onClick={() => handleOpenBookingModal()} icon={Plus}>
              Schedule with Mentee
            </Button>
          )}
        </div>
      )}

      {/* ── BOOKING MODAL (MENTOR & MENTEE BIDIRECTIONAL) ──────────────────── */}
      <Modal
        open={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        title={isMentor ? 'Schedule Session with Mentee' : 'Book Mentorship Session'}
        description={
          isMentor
            ? 'Propose a 1-on-1 scheduled session with an officially allocated student.'
            : 'Select an accepted faculty mentor, choose a date & time, and submit your session request.'
        }
        size="lg"
      >
        {bookingSuccess ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-navy-900">
              {isMentor ? 'Session Proposal Sent to Mentee!' : 'Session Request Submitted!'}
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              {isMentor
                ? 'Your session request is marked as Awaiting Mentee Confirmation. The student can now accept or decline.'
                : 'Your request is marked as Pending. Your mentor has been notified to confirm the meeting.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleCreateBooking} className="space-y-4 text-xs">
            {bookingError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{bookingError}</span>
              </div>
            )}

            {/* Partner Selector */}
            {isMentor ? (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Select Officially Allocated Mentee <span className="text-rose-500">*</span>
                </label>
                {allocatedMenteesForMentor.length > 0 ? (
                  <select
                    value={bookingForm.menteeId}
                    onChange={(e) => setBookingForm({ ...bookingForm, menteeId: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    {allocatedMenteesForMentor.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} — {m.year || m.department} ({m.id})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
                    You do not currently have any officially allocated mentees in your cohort. You can only schedule sessions with mentees allocated to you by the coordinator.
                  </div>
                )}
              </div>
            ) : (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Select Connected Mentor <span className="text-rose-500">*</span>
                </label>
                {eligibleMentorsForMentee.length > 0 ? (
                  <select
                    value={bookingForm.mentorId}
                    onChange={(e) => setBookingForm({ ...bookingForm, mentorId: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    {eligibleMentorsForMentee.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.title})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
                    You do not have any accepted mentor connections or assigned mentors yet. Please request a mentor in Find Mentors first.
                  </div>
                )}
              </div>
            )}

            {/* Session Title / Objective */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Session Objective / Topic <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={bookingForm.title}
                onChange={(e) => setBookingForm({ ...bookingForm, title: e.target.value })}
                required
                placeholder={
                  isMentor
                    ? 'e.g. Capstone Architecture Review & Benchmark Verification'
                    : 'e.g. Distributed Consensus Capstone Walkthrough'
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            {/* Agenda / Discussion Topics */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Session Agenda & Key Discussion Topics
              </label>
              <textarea
                rows={2}
                value={bookingForm.agenda}
                onChange={(e) => setBookingForm({ ...bookingForm, agenda: e.target.value })}
                placeholder="Outline discussion items, questions to resolve, or capstone deliverables..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            {/* Date and Time Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Session Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  min={todayStr}
                  value={bookingForm.date}
                  onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Start Time <span className="text-rose-500">*</span>
                </label>
                <select
                  value={bookingForm.startTime}
                  onChange={(e) => setBookingForm({ ...bookingForm, startTime: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="09:30 AM">09:30 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="10:30 AM">10:30 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="11:30 AM">11:30 AM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="02:30 PM">02:30 PM</option>
                  <option value="03:00 PM">03:00 PM</option>
                  <option value="03:30 PM">03:30 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                  <option value="04:30 PM">04:30 PM</option>
                  <option value="05:00 PM">05:00 PM</option>
                </select>
              </div>
            </div>

            {/* Duration and Meeting Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Duration</label>
                <select
                  value={bookingForm.duration}
                  onChange={(e) => setBookingForm({ ...bookingForm, duration: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="30 mins">30 minutes</option>
                  <option value="45 mins">45 minutes</option>
                  <option value="60 mins">60 minutes</option>
                  <option value="90 mins">90 minutes</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Meeting Mode</label>
                <select
                  value={bookingForm.meetingMode}
                  onChange={(e) => setBookingForm({ ...bookingForm, meetingMode: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="Google Meet">Google Meet (Online)</option>
                  <option value="Campus Cabin 304">Campus Office (In-Person)</option>
                  <option value="AI Research Lab 412">AI Research Lab 412 (In-Person)</option>
                  <option value="Zoom">Zoom Meeting (Online)</option>
                </select>
              </div>
            </div>

            {/* Meeting Link or Room Location */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {bookingForm.meetingMode.toLowerCase().includes('meet') || bookingForm.meetingMode.toLowerCase().includes('zoom')
                  ? 'Meeting Video Link (Optional / Pre-generated)'
                  : 'Campus Room / Location'}
              </label>
              <input
                type="text"
                value={bookingForm.meetingLink}
                onChange={(e) => setBookingForm({ ...bookingForm, meetingLink: e.target.value })}
                placeholder={
                  bookingForm.meetingMode.toLowerCase().includes('meet') || bookingForm.meetingMode.toLowerCase().includes('zoom')
                    ? 'https://meet.google.com/abc-defg-hij'
                    : 'Campus Cabin 304, Department Building'
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            {/* Optional Message to Mentee / Mentor */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {isMentor ? 'Preparation Message to Mentee (Optional)' : 'Message to Mentor (Optional)'}
              </label>
              <textarea
                rows={2}
                value={bookingForm.requestMessage}
                onChange={(e) => setBookingForm({ ...bookingForm, requestMessage: e.target.value })}
                placeholder={
                  isMentor
                    ? 'e.g. Please bring your updated architecture diagrams and benchmark numbers.'
                    : 'e.g. I have prepared our draft schema and would like feedback on partition keys.'
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="secondary" size="sm" type="button" onClick={() => setBookingModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                disabled={isMentor ? allocatedMenteesForMentor.length === 0 : eligibleMentorsForMentee.length === 0}
              >
                {isMentor ? 'Send Session Proposal' : 'Submit Booking Request'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* ── REVIEW MODAL ───────────────────────────────────────────────── */}
      <Modal
        open={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title={isEditingReview ? 'Edit Session Review' : 'Submit Mentorship Review'}
        description={`Provide your rating and feedback for the session with ${reviewSession?.mentor?.name}.`}
        size="md"
      >
        <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
          {reviewError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{reviewError}</span>
            </div>
          )}

          {/* Rating stars picker */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Rating (1 to 5 Stars)</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((starVal) => (
                <button
                  key={starVal}
                  type="button"
                  onClick={() => setReviewForm({ ...reviewForm, rating: starVal })}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-7 h-7 ${
                      starVal <= reviewForm.rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200 hover:text-amber-200'
                    }`}
                  />
                </button>
              ))}
              <span className="font-bold text-sm text-navy-900 ml-2">
                {reviewForm.rating} of 5 Stars
              </span>
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Written Feedback <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              required
              placeholder="What went well? How did the mentor help your learning goals or project design?"
              className="w-full p-3 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none leading-relaxed"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" size="sm" type="button" onClick={() => setReviewModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {isEditingReview ? 'Update Review' : 'Submit Review'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, title: '', message: '', action: null, danger: false })}
        onConfirm={confirmDialog.action}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel="Confirm"
        danger={confirmDialog.danger}
      />

      {/* Submit Report Modal */}
      <SubmitReportModal
        open={reportModalOpen}
        onClose={() => {
          setReportModalOpen(false);
          setReportSession(null);
        }}
        session={reportSession}
        onReportSubmitted={(newRep) => {
          setReportNotification(`Session report submitted successfully and marked completed!`);
          setTimeout(() => setReportNotification(''), 4000);
        }}
      />

      {/* View Session Report Modal */}
      <SessionReportViewModal
        open={viewReportModalOpen}
        onClose={() => {
          setViewReportModalOpen(false);
          setActiveReportToView(null);
        }}
        report={activeReportToView}
      />
    </div>
  );
}
