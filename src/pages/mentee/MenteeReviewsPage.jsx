import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star,
  MessageSquare,
  Award,
  Edit2,
  Trash2,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Clock,
  User,
  TrendingUp,
  ExternalLink,
  ChevronRight,
  Shield,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function MenteeReviewsPage() {
  const {
    currentUser,
    reviews,
    sessions,
    getMentorById,
    getUserById,
    addReview,
    updateReview,
    deleteReview,
  } = useApp();

  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('submitted'); // 'submitted' | 'pending'
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({
    isEdit: false,
    reviewId: null,
    sessionId: null,
    mentorId: null,
    rating: 5,
    comment: '',
    targetName: '',
    sessionTitle: '',
  });
  const [modalError, setModalError] = useState('');
  const [successToast, setSuccessToast] = useState('');

  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    reviewId: null,
  });

  // ── MENTEE DATA: Reviews submitted by this mentee ─────────────────────────
  const menteeSubmittedReviews = useMemo(() => {
    if (!currentUser) return [];
    return reviews
      .filter((r) => r.menteeId === currentUser.id)
      .map((r) => ({
        ...r,
        mentor: getMentorById(r.mentorId) || getUserById(r.mentorId),
        session: sessions.find((s) => s.id === r.sessionId),
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [reviews, currentUser, getMentorById, getUserById, sessions]);

  // Completed sessions for this mentee awaiting review
  const menteeUnreviewedSessions = useMemo(() => {
    if (!currentUser) return [];
    const reviewedSessionIds = new Set(
      reviews.filter((r) => r.menteeId === currentUser.id).map((r) => r.sessionId)
    );
    return sessions
      .filter(
        (s) =>
          s.menteeId === currentUser.id &&
          s.status === 'completed' &&
          !reviewedSessionIds.has(s.id)
      )
      .map((s) => ({
        ...s,
        mentor: getMentorById(s.mentorId) || getUserById(s.mentorId),
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [sessions, reviews, currentUser, getMentorById, getUserById]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalSubmitted = menteeSubmittedReviews.length;
    const pendingCount = menteeUnreviewedSessions.length;
    const avgRatingGiven =
      totalSubmitted > 0
        ? Number(
            (
              menteeSubmittedReviews.reduce((sum, r) => sum + Number(r.rating), 0) /
              totalSubmitted
            ).toFixed(1)
          )
        : 0;

    return { totalSubmitted, pendingCount, avgRatingGiven };
  }, [menteeSubmittedReviews, menteeUnreviewedSessions]);

  // Handlers
  const handleOpenEdit = (review) => {
    setModalError('');
    setModalData({
      isEdit: true,
      reviewId: review.id,
      sessionId: review.sessionId,
      mentorId: review.mentorId,
      rating: review.rating,
      comment: review.comment,
      targetName: review.mentor?.name || 'Mentor',
      sessionTitle: review.session?.title || 'Mentoring Session',
    });
    setModalOpen(true);
  };

  const handleOpenCreateForSession = (session) => {
    setModalError('');
    setModalData({
      isEdit: false,
      reviewId: null,
      sessionId: session.id,
      mentorId: session.mentorId,
      rating: 5,
      comment: '',
      targetName: session.mentor?.name || 'Mentor',
      sessionTitle: session.title || 'Completed Session',
    });
    setModalOpen(true);
  };

  const handleSaveModal = (e) => {
    e.preventDefault();
    setModalError('');

    if (!modalData.comment.trim()) {
      setModalError('Please enter written review feedback.');
      return;
    }

    if (modalData.comment.trim().length < 5) {
      setModalError('Written feedback must be at least 5 characters long.');
      return;
    }

    if (modalData.isEdit) {
      const res = updateReview(
        modalData.reviewId,
        {
          rating: modalData.rating,
          comment: modalData.comment,
        },
        currentUser.id
      );

      if (res && res.success) {
        setModalOpen(false);
        setSuccessToast('Your review has been updated successfully!');
        setTimeout(() => setSuccessToast(''), 4000);
      } else {
        setModalError(res?.error || 'Failed to update review.');
      }
    } else {
      const res = addReview({
        sessionId: modalData.sessionId,
        mentorId: modalData.mentorId,
        menteeId: currentUser.id,
        rating: modalData.rating,
        comment: modalData.comment,
      });

      if (res && res.success) {
        setModalOpen(false);
        setActiveTab('submitted');
        setSuccessToast('Review submitted successfully! Thank you for your feedback.');
        setTimeout(() => setSuccessToast(''), 4000);
      } else {
        setModalError(res?.error || 'Failed to submit review.');
      }
    }
  };

  const handleDeletePrompt = (reviewId) => {
    setConfirmDialog({ open: true, reviewId });
  };

  const handleConfirmDelete = () => {
    if (confirmDialog.reviewId) {
      const res = deleteReview(confirmDialog.reviewId, currentUser?.id);
      if (res && res.success) {
        setSuccessToast('Review removed. Mentor rating score has been recomputed.');
        setTimeout(() => setSuccessToast(''), 4000);
      }
    }
    setConfirmDialog({ open: false, reviewId: null });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <PageHeader
        title="Session Reviews & Ratings"
        subtitle="Evaluate your completed faculty mentoring sessions, provide constructive feedback, and manage your submissions."
        breadcrumbs={['Mentee', 'Reviews']}
      />

      {/* Success Notification Alert */}
      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between shadow-xs transition-all animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="text-xs font-semibold">{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast('')}
            className="text-xs text-emerald-600 hover:text-emerald-900 font-bold ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">
              Reviews Submitted
            </span>
            <span className="text-2xl font-black text-navy-900">{metrics.totalSubmitted}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 flex-shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">
              Sessions Awaiting Review
            </span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-navy-900">{metrics.pendingCount}</span>
              {metrics.pendingCount > 0 && (
                <Badge variant="amber" size="xs">
                  Action Required
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 flex-shrink-0">
            <Star className="w-6 h-6 fill-purple-400 text-purple-400" />
          </div>
          <div>
            <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">
              Average Score Given
            </span>
            <span className="text-2xl font-black text-navy-900">
              {metrics.avgRatingGiven > 0 ? `${metrics.avgRatingGiven} / 5.0` : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('submitted')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'submitted'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>My Submitted Reviews ({menteeSubmittedReviews.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'pending'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Sessions Awaiting Review</span>
          {menteeUnreviewedSessions.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
              {menteeUnreviewedSessions.length}
            </span>
          )}
        </button>
      </div>

      {/* ── Tab 1: Submitted Reviews ───────────────────────────────────────── */}
      {activeTab === 'submitted' && (
        <div className="space-y-4">
          {menteeSubmittedReviews.length > 0 ? (
            menteeSubmittedReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-start justify-between gap-4 transition-all hover:border-slate-300"
              >
                <div className="flex items-start gap-4">
                  <Avatar user={rev.mentor} size="lg" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-navy-900">{rev.mentor?.name}</h4>
                      <span className="text-xs text-brand-700 font-medium">
                        ({rev.mentor?.department})
                      </span>
                      {rev.mentor?.title && (
                        <span className="text-[11px] text-slate-400">· {rev.mentor?.title}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 py-0.5">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-slate-700 ml-1">
                        {rev.rating} of 5 Stars
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 italic leading-relaxed pt-1">
                      "{rev.comment}"
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1.5 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        Reviewed on {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                      {rev.session && (
                        <span className="text-slate-500 font-medium">
                          · Session: "{rev.session.title}" ({rev.session.date})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions: Edit & Delete */}
                <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-start">
                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={() => handleOpenEdit(rev)}
                    icon={Edit2}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={() => handleDeletePrompt(rev.id)}
                    icon={Trash2}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-navy-900">No Submitted Reviews Yet</h3>
              <p className="text-slate-500 max-w-sm mx-auto">
                Once you complete mentoring sessions with your faculty mentor, you can leave structured feedback and ratings here.
              </p>
              {menteeUnreviewedSessions.length > 0 && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setActiveTab('pending')}
                  icon={Clock}
                  className="mt-2"
                >
                  View Sessions Awaiting Review ({menteeUnreviewedSessions.length})
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Tab 2: Sessions Awaiting Review ────────────────────────────────── */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {menteeUnreviewedSessions.length > 0 ? (
            menteeUnreviewedSessions.map((session) => (
              <div
                key={session.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <Avatar user={session.mentor} size="lg" />
                  <div>
                    <h4 className="text-sm font-bold text-navy-900">{session.title}</h4>
                    <p className="text-xs text-slate-600">
                      Mentor: <strong className="text-navy-900">{session.mentor?.name}</strong>{' '}
                      ({session.mentor?.department})
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        Completed on {session.date}
                      </span>
                      <span>· Duration: {session.duration || '45 mins'}</span>
                      {session.meetingMode && <span>· Mode: {session.meetingMode}</span>}
                    </div>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleOpenCreateForSession(session)}
                  icon={Star}
                >
                  Leave Review
                </Button>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-navy-900">All Completed Sessions Reviewed!</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                You have evaluated all completed mentorship sessions. Check your active sessions or schedule upcoming meetings.
              </p>
              <div className="mt-4 flex justify-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/mentee/sessions')}
                  icon={Calendar}
                >
                  View My Sessions
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Review Modal (Create / Edit) ─────────────────────────────────── */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalData.isEdit ? 'Edit Mentorship Review' : 'Leave Mentorship Review'}
        description={`Provide your rating and comments for ${modalData.targetName}.`}
        size="md"
      >
        <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
          {modalError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{modalError}</span>
            </div>
          )}

          {/* Session Banner */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Session Topic
              </span>
              <span className="font-semibold text-navy-900 block">{modalData.sessionTitle}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Faculty Mentor
              </span>
              <span className="font-semibold text-brand-700 block">{modalData.targetName}</span>
            </div>
          </div>

          {/* Star Rating Picker */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Rating Score <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((starVal) => (
                <button
                  key={starVal}
                  type="button"
                  onClick={() => setModalData({ ...modalData, rating: starVal })}
                  className="p-1 hover:scale-110 transition-transform focus:outline-none"
                  aria-label={`${starVal} Star`}
                >
                  <Star
                    className={`w-7 h-7 ${
                      starVal <= modalData.rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200 hover:text-amber-200'
                    }`}
                  />
                </button>
              ))}
              <span className="font-bold text-sm text-navy-900 ml-2">
                {modalData.rating} of 5 Stars
              </span>
            </div>
          </div>

          {/* Written Feedback Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">
                Written Feedback & Comments <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {modalData.comment.length} characters (min 5)
              </span>
            </div>
            <textarea
              rows={4}
              value={modalData.comment}
              onChange={(e) => setModalData({ ...modalData, comment: e.target.value })}
              required
              placeholder="Describe your session experience, the topics reviewed, and how this faculty guidance helped your academic milestones..."
              className="w-full p-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none leading-relaxed"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {modalData.isEdit ? 'Update Review' : 'Submit Review'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, reviewId: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Review?"
        message="Are you sure you want to delete this review? Your rating will be removed and the mentor's average score will be recomputed."
        confirmLabel="Delete Review"
        danger
      />
    </div>
  );
}
