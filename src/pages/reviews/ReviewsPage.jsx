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
  Plus,
  User,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function ReviewsPage() {
  const {
    currentUser,
    currentRole,
    reviews,
    sessions,
    mentors,
    getUserById,
    getMentorById,
    addReview,
    updateReview,
    deleteReview,
  } = useApp();
  const navigate = useNavigate();

  const isMentor = currentRole === 'Mentor';
  const isMentee = currentRole === 'Mentee';

  const [activeTab, setActiveTab] = useState('submitted'); // for mentee: 'submitted' | 'pending'
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({
    isEdit: false,
    reviewId: null,
    sessionId: null,
    mentorId: null,
    rating: 5,
    comment: '',
    targetName: '',
  });
  const [modalError, setModalError] = useState('');

  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    reviewId: null,
  });

  // ── MENTOR DATA: Reviews received by this mentor ─────────────────────────
  const mentorReviews = useMemo(() => {
    return reviews
      .filter((r) => r.mentorId === currentUser?.id)
      .map((r) => ({
        ...r,
        mentee: getUserById(r.menteeId),
        session: sessions.find((s) => s.id === r.sessionId),
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [reviews, currentUser, getUserById, sessions]);

  // Mentor Rating Breakdown Analytics
  const mentorAnalytics = useMemo(() => {
    const total = mentorReviews.length;
    if (total === 0) {
      return { average: 5.0, total: 0, distribution: [0, 0, 0, 0, 0] };
    }
    const sum = mentorReviews.reduce((acc, r) => acc + Number(r.rating), 0);
    const average = Number((sum / total).toFixed(1));

    const distribution = [5, 4, 3, 2, 1].map((star) => {
      const count = mentorReviews.filter((r) => r.rating === star).length;
      const percentage = Math.round((count / total) * 100);
      return { star, count, percentage };
    });

    return { average, total, distribution };
  }, [mentorReviews]);

  // ── MENTEE DATA: Reviews submitted by this mentee ─────────────────────────
  const menteeSubmittedReviews = useMemo(() => {
    return reviews
      .filter((r) => r.menteeId === currentUser?.id)
      .map((r) => ({
        ...r,
        mentor: getMentorById(r.mentorId) || getUserById(r.mentorId),
        session: sessions.find((s) => s.id === r.sessionId),
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [reviews, currentUser, getMentorById, getUserById, sessions]);

  // Completed sessions for this mentee awaiting review
  const menteeUnreviewedSessions = useMemo(() => {
    const reviewedSessionIds = new Set(
      reviews.filter((r) => r.menteeId === currentUser?.id).map((r) => r.sessionId)
    );
    return sessions
      .filter((s) => s.menteeId === currentUser?.id && s.status === 'completed' && !reviewedSessionIds.has(s.id))
      .map((s) => ({
        ...s,
        mentor: getMentorById(s.mentorId) || getUserById(s.mentorId),
      }));
  }, [sessions, reviews, currentUser, getMentorById, getUserById]);

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
    });
    setModalOpen(true);
  };

  const handleSaveModal = (e) => {
    e.preventDefault();
    setModalError('');

    if (!modalData.comment.trim()) {
      setModalError('Please enter a written review comment.');
      return;
    }

    if (modalData.isEdit) {
      updateReview(modalData.reviewId, {
        rating: modalData.rating,
        comment: modalData.comment,
      });
      setModalOpen(false);
    } else {
      const res = addReview({
        sessionId: modalData.sessionId,
        mentorId: modalData.mentorId,
        menteeId: currentUser.id,
        rating: modalData.rating,
        comment: modalData.comment,
      });

      if (res.success) {
        setModalOpen(false);
        setActiveTab('submitted');
      } else {
        setModalError(res.error);
      }
    }
  };

  const handleDeletePrompt = (reviewId) => {
    setConfirmDialog({ open: true, reviewId });
  };

  const handleConfirmDelete = () => {
    if (confirmDialog.reviewId) {
      deleteReview(confirmDialog.reviewId);
    }
    setConfirmDialog({ open: false, reviewId: null });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title="Reviews & Ratings"
        subtitle={
          isMentor
            ? 'Track your student session feedback, overall score breakdown, and rating distribution.'
            : 'Review completed mentoring sessions, provide constructive feedback, and manage your evaluations.'
        }
        breadcrumbs={[currentRole || 'User', 'Reviews']}
      />

      {/* ── MENTOR VIEW ─────────────────────────────────────────────────── */}
      {isMentor && (
        <div className="space-y-6">
          {/* Analytics Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Big Score Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center justify-center text-center shadow-xs">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Overall Average Rating
              </span>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-4xl font-black text-navy-900">{mentorAnalytics.average}</span>
                <span className="text-lg text-slate-400 font-normal">/ 5.0</span>
              </div>
              <div className="flex items-center gap-1 my-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-5 h-5 ${
                      s <= Math.round(mentorAnalytics.average)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-500">
                Calculated dynamically from <strong className="text-navy-900">{mentorAnalytics.total}</strong> reviews
              </p>
            </div>

            {/* Rating Breakdown Distribution Bar */}
            <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Rating Distribution
              </span>
              <div className="space-y-2">
                {mentorAnalytics.distribution.map((d) => (
                  <div key={d.star} className="flex items-center gap-3 text-xs">
                    <span className="w-8 font-semibold text-slate-600 flex items-center gap-1">
                      {d.star} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-300"
                        style={{ width: `${d.percentage}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-slate-500 text-[11px]">
                      {d.count} ({d.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* List of Written Reviews */}
          <Card
            title="Student Reviews & Feedback"
            subtitle="All verified mentee feedback for completed sessions"
          >
            {mentorReviews.length > 0 ? (
              <div className="space-y-4">
                {mentorReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <Avatar user={rev.mentee} size="sm" />
                        <div>
                          <p className="text-xs font-bold text-navy-900">{rev.mentee?.name}</p>
                          <p className="text-[10px] text-slate-500">
                            {rev.mentee?.year || rev.mentee?.department} · Session: {rev.session?.title || '1-on-1 Mentorship'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
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
                        <span className="text-[10px] text-slate-400">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 italic leading-relaxed pt-1">
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-500">
                No student reviews received yet.
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ── MENTEE VIEW ─────────────────────────────────────────────────── */}
      {isMentee && (
        <div className="space-y-6">
          {/* Mentee Tabs */}
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

          {/* Tab 1: Submitted Reviews (Editable & Deletable) */}
          {activeTab === 'submitted' && (
            <div className="space-y-4">
              {menteeSubmittedReviews.length > 0 ? (
                menteeSubmittedReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <Avatar user={rev.mentor} size="lg" />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-navy-900">{rev.mentor?.name}</h4>
                          <span className="text-xs text-brand-700 font-medium">({rev.mentor?.department})</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                              }`}
                            />
                          ))}
                          <span className="text-xs font-bold text-slate-700 ml-1">{rev.rating} of 5</span>
                        </div>
                        <p className="text-xs text-slate-700 italic pt-1">"{rev.comment}"</p>
                        <p className="text-[10px] text-slate-400 pt-1">
                          Reviewed on {new Date(rev.createdAt).toLocaleDateString()}
                          {rev.session && ` · Topic: ${rev.session.title}`}
                        </p>
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
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500">
                  You have not submitted any mentor reviews yet.
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Sessions Awaiting Review */}
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
                          Mentor: <strong className="text-navy-900">{session.mentor?.name}</strong> ({session.mentor?.department})
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                          <Calendar className="w-3 h-3" />
                          <span>Completed on {session.date}</span>
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
                  <h3 className="text-sm font-bold text-navy-900">All completed sessions reviewed!</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                    You have evaluated all completed mentorship sessions. Check your active sessions to schedule upcoming meetings.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── COORDINATOR / HOD / ADMIN VIEW ──────────────────────────────── */}
      {!isMentor && !isMentee && (
        <Card title="All Platform Reviews" subtitle="Student ratings and written feedback across the department">
          <div className="space-y-4">
            {reviews.map((rev) => {
              const mentor = getMentorById(rev.mentorId);
              const mentee = getUserById(rev.menteeId);
              return (
                <div key={rev.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-4 text-xs">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-navy-900">{mentee?.name}</span>
                      <span className="text-slate-400">reviewed</span>
                      <span className="font-bold text-brand-700">{mentor?.name}</span>
                    </div>
                    <div className="flex items-center gap-1 my-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                          }`}
                        />
                      ))}
                      <span className="text-[11px] text-slate-500 ml-1">({rev.rating} of 5)</span>
                    </div>
                    <p className="text-slate-700 italic mt-1">"{rev.comment}"</p>
                  </div>
                  <span className="text-[10px] text-slate-400 flex-shrink-0">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Review Modal (Create / Edit) */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalData.isEdit ? 'Edit Review' : 'Leave Mentorship Review'}
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

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Rating Score</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((starVal) => (
                <button
                  key={starVal}
                  type="button"
                  onClick={() => setModalData({ ...modalData, rating: starVal })}
                  className="p-1 hover:scale-110 transition-transform"
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

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Feedback Comments <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={modalData.comment}
              onChange={(e) => setModalData({ ...modalData, comment: e.target.value })}
              required
              placeholder="Describe your session experience and how this guidance impacted your academic milestones..."
              className="w-full p-3 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none leading-relaxed"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" size="sm" type="button" onClick={() => setModalOpen(false)}>
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
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
