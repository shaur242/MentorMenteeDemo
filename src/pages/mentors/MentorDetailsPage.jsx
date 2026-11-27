import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  Building,
  Briefcase,
  Clock,
  Calendar,
  Globe,
  ExternalLink,
  Award,
  GraduationCap,
  CheckCircle2,
  Send,
  ShieldCheck,
  UserCheck,
  UserPlus,
  XCircle,
  AlertCircle,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LinkedInIcon, GitHubIcon, TwitterIcon } from '../../components/common/SocialIcons';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

export default function MentorDetailsPage() {
  const { mentorId } = useParams();
  const navigate = useNavigate();
  const {
    getMentorById,
    currentUser,
    currentRole,
    getUserById,
    getMentorReviews,
    getConnectionBetween,
    isUserConnected,
    sendConnectionRequest,
    cancelConnectionRequest,
    getMenteeAllocation,
    getMenteeAllocations,
    requestMentorAllocation,
  } = useApp();

  const mentor = getMentorById(mentorId);

  // Live reviews from centralized dataset
  const mentorReviews = useMemo(() => {
    if (!mentor) return [];
    return getMentorReviews(mentor.id).map((r) => ({
      ...r,
      mentee: getUserById(r.menteeId),
    }));
  }, [mentor, getMentorReviews, getUserById]);

  // Live rating calculation from centralized reviews
  const liveStats = useMemo(() => {
    if (!mentor) return { rating: 5.0, totalReviews: 0 };
    if (mentorReviews.length === 0) {
      return { rating: (mentor.totalReviews && mentor.totalReviews > 0) ? (mentor.rating || 0) : 0, totalReviews: mentor.totalReviews || 0 };
    }
    const sum = mentorReviews.reduce((acc, r) => acc + Number(r.rating), 0);
    const avg = Number((sum / mentorReviews.length).toFixed(1));
    return { rating: avg, totalReviews: mentorReviews.length };
  }, [mentor, mentorReviews]);

  // Live connection status between logged-in user (mentee) and this mentor
  const connection = useMemo(() => {
    if (!currentUser || !mentor) return null;
    return getConnectionBetween(currentUser.id, mentor.id);
  }, [currentUser, mentor, getConnectionBetween]);

  const isConnected = useMemo(() => {
    if (!currentUser || !mentor) return false;
    return isUserConnected(currentUser.id, mentor.id);
  }, [currentUser, mentor, isUserConnected]);

  // Live allocation status
  const menteeActiveAllocation = useMemo(() => {
    if (!currentUser || currentRole !== 'Mentee') return null;
    return getMenteeAllocation(currentUser.id);
  }, [currentUser, currentRole, getMenteeAllocation]);

  const menteeRequests = useMemo(() => {
    if (!currentUser || currentRole !== 'Mentee') return [];
    return getMenteeAllocations(currentUser.id);
  }, [currentUser, currentRole, getMenteeAllocations]);

  const allocationRequestForThisMentor = useMemo(() => {
    if (!mentor) return null;
    return menteeRequests.find((r) => r.mentorId === mentor.id && r.status === 'pending');
  }, [menteeRequests, mentor]);

  const isOfficiallyAssignedMentor = menteeActiveAllocation?.mentorId === mentor?.id;

  // Modal State for "Request as My Mentor"
  const [allocModalOpen, setAllocModalOpen] = useState(false);
  const [allocMessage, setAllocMessage] = useState('');
  const [allocFeedback, setAllocFeedback] = useState({ success: false, error: '' });

  // Express Interest / Connection Request Modal State
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [menteeNote, setMenteeNote] = useState('');
  const [modalFeedback, setModalFeedback] = useState({ success: false, error: '' });

  // Return navigation target based on role
  const backTarget = currentRole ? `/${currentRole.toLowerCase()}/mentors` : '/mentee/find-mentors';

  if (!mentor) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-xl mx-auto my-12">
        <h3 className="text-lg font-bold text-navy-900 mb-2">Mentor Not Found</h3>
        <p className="text-sm text-slate-500 mb-6">
          The mentor profile you are looking for could not be found or may have been removed.
        </p>
        <Button variant="primary" onClick={() => navigate(backTarget)} icon={ArrowLeft}>
          Back to Directory
        </Button>
      </div>
    );
  }

  const handleSendConnection = (e) => {
    e.preventDefault();
    setModalFeedback({ success: false, error: '' });

    const res = sendConnectionRequest({
      requesterId: currentUser.id,
      recipientId: mentor.id,
      note: menteeNote,
    });

    if (res.success) {
      setModalFeedback({ success: true, error: '' });
      setTimeout(() => {
        setConnectModalOpen(false);
        setModalFeedback({ success: false, error: '' });
        setMenteeNote('');
      }, 1500);
    } else {
      setModalFeedback({ success: false, error: res.error });
    }
  };

  const handleCancelRequest = () => {
    if (connection) {
      cancelConnectionRequest(connection.id);
    }
  };

  const handleRequestAllocation = (e) => {
    e.preventDefault();
    setAllocFeedback({ success: false, error: '' });

    const res = requestMentorAllocation({
      menteeId: currentUser.id,
      mentorId: mentor.id,
      requestMessage: allocMessage,
    });

    if (res.success) {
      setAllocFeedback({ success: true, error: '' });
      setTimeout(() => {
        setAllocModalOpen(false);
        setAllocFeedback({ success: false, error: '' });
        setAllocMessage('');
      }, 1500);
    } else {
      setAllocFeedback({ success: false, error: res.error || 'Request failed' });
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Back to directory button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-navy-900 transition-colors py-1 px-2 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Mentors Directory</span>
        </button>
      </div>

      {/* Profile Header Hero Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Banner Top strip */}
        <div className="h-24 bg-gradient-to-r from-navy-950 via-navy-800 to-brand-800 relative">
          <div className="absolute right-6 top-4 hidden sm:flex items-center gap-2 text-white/90 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-xs border border-white/20 font-medium">
              Profile Completion: {mentor.profileCompletion}%
            </span>
          </div>
        </div>

        <div className="px-6 pb-6 pt-0">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-12 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              <Avatar
                user={mentor}
                size="xl"
                className="w-24 h-24 text-2xl ring-4 ring-white shadow-md flex-shrink-0"
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-navy-900 leading-tight">
                    {mentor.name}
                  </h1>
                  <Badge role="Mentor" size="md">
                    Verified Mentor
                  </Badge>
                  {/* Connection Status Pill for Mentee */}
                  {currentRole === 'Mentee' && (
                    <>
                      {isOfficiallyAssignedMentor ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          My Official Mentor
                        </span>
                      ) : allocationRequestForThisMentor ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          Allocation Requested
                        </span>
                      ) : isConnected ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                          Connected
                        </span>
                      ) : connection?.status === 'pending' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          Connection Pending
                        </span>
                      ) : null}
                    </>
                  )}
                </div>
                <p className="text-sm font-semibold text-brand-700">
                  {mentor.title}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                  <span className="flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    {mentor.company || mentor.department}
                  </span>
                  <span>•</span>
                  <span>Coordinator: <strong className="text-slate-700 font-medium">{mentor.coordinatorName}</strong></span>
                </div>
              </div>
            </div>

            {/* Actions for Mentee */}
            <div className="flex-shrink-0 flex items-center gap-2.5">
              {currentRole === 'Mentee' && (
                <>
                  {isOfficiallyAssignedMentor ? (
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => navigate(`/mentee/sessions?bookMentorId=${mentor.id}`)}
                      icon={Calendar}
                      className="shadow-sm"
                    >
                      Book Mentorship Session
                    </Button>
                  ) : allocationRequestForThisMentor ? (
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={() => navigate('/mentee/requests')}
                      icon={Clock}
                    >
                      View Allocation Request
                    </Button>
                  ) : menteeActiveAllocation ? (
                    <Button
                      variant="secondary"
                      size="md"
                      disabled
                      title="You already have an active allocated mentor."
                    >
                      Already Have Allocated Mentor
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => setAllocModalOpen(true)}
                      icon={UserCheck}
                      className="shadow-sm"
                    >
                      Request as My Mentor
                    </Button>
                  )}

                  {!isConnected && !isOfficiallyAssignedMentor && connection?.status !== 'pending' && (
                    <Button
                      variant="ghost"
                      size="md"
                      onClick={() => setConnectModalOpen(true)}
                      icon={UserPlus}
                    >
                      Connect
                    </Button>
                  )}
                </>
              )}

              {currentRole !== 'Mentee' && (
                <div className="text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                  Viewing in {currentRole} Mode
                </div>
              )}
            </div>
          </div>

          {/* Key Metric Highlights Strip with Live Rating Calculation */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 border-t border-slate-100">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Rating & Reviews
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-base font-bold text-navy-900">{liveStats.rating}</span>
                <span className="text-xs text-slate-500">({liveStats.totalReviews} reviews)</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Experience
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <Briefcase className="w-4 h-4 text-brand-600" />
                <span className="text-base font-bold text-navy-900">{mentor.yearsOfExperience} Years</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Session Length
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <Clock className="w-4 h-4 text-brand-600" />
                <span className="text-base font-bold text-navy-900">{mentor.sessionDuration}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Pricing / Status
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <Award className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-bold text-emerald-700 truncate">Academic / Free</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Biography, Expertise, Skills, Qualifications, Reviews */}
        <div className="lg:col-span-2 space-y-6">
          {/* Biography */}
          <Card title="About & Biography">
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {mentor.biography}
            </p>
          </Card>

          {/* Areas of Expertise & Technical Skills */}
          <Card title="Expertise & Skills">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Core Focus Areas
                </p>
                <div className="flex flex-wrap gap-2">
                  {mentor.areasOfExpertise?.map((area, idx) => (
                    <Badge key={idx} variant="navy" size="md">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Technical Skills & Frameworks
                </p>
                <div className="flex flex-wrap gap-2">
                  {mentor.skills?.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Academic Qualifications & Certifications */}
          <Card title="Academic Qualifications & Certifications">
            <ul className="space-y-3">
              {mentor.qualifications?.map((qual, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                  <div className="w-6 h-6 rounded-full bg-blue-50 text-brand-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <GraduationCap className="w-3.5 h-3.5" />
                  </div>
                  <span className="leading-relaxed">{qual}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Ratings & Reviews Section - Centralized */}
          <Card
            title="Mentee Feedback & Reviews"
            subtitle={`Overall rating: ${liveStats.rating} out of 5 based on ${liveStats.totalReviews} student sessions`}
          >
            <div className="space-y-4">
              {mentorReviews.length > 0 ? (
                mentorReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Avatar user={rev.mentee} size="sm" />
                        <div>
                          <p className="text-xs font-bold text-navy-900">{rev.mentee?.name || 'Verified Mentee'}</p>
                          <p className="text-[10px] text-slate-400">
                            {new Date(rev.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i <= rev.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed italic">
                      "{rev.comment}"
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 py-4 text-center">
                  No written reviews submitted yet for this mentor.
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Availability, Scheduling, Social Links */}
        <div className="space-y-6">
          {/* Availability Card */}
          <Card title="Mentoring Availability">
            <div className="space-y-3.5 text-xs">
              <div>
                <span className="font-semibold text-slate-500 uppercase tracking-wider block mb-1 text-[10px]">
                  Available Days
                </span>
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
              </div>

              <div>
                <span className="font-semibold text-slate-500 uppercase tracking-wider block mb-1 text-[10px]">
                  Hours
                </span>
                <p className="text-slate-800 font-medium">{mentor.availability?.hours}</p>
              </div>

              <div>
                <span className="font-semibold text-slate-500 uppercase tracking-wider block mb-1 text-[10px]">
                  Meeting Mode
                </span>
                <p className="text-slate-800 font-medium">{mentor.availability?.mode}</p>
              </div>

              <div>
                <span className="font-semibold text-slate-500 uppercase tracking-wider block mb-1 text-[10px]">
                  Weekly Capacity
                </span>
                <p className="text-slate-800 font-medium">
                  {mentor.availability?.slotsPerWeek || 5} cohort slots per week
                </p>
              </div>
            </div>
          </Card>

          {/* Social Profiles Card */}
          <Card title="Social & Academic Profiles">
            <div className="space-y-2.5">
              {mentor.socialLinks?.linkedin && (
                <a
                  href={mentor.socialLinks.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-brand-300 hover:bg-slate-50 transition-colors text-xs text-slate-700 font-medium"
                >
                  <span className="flex items-center gap-2">
                    <LinkedInIcon className="w-4 h-4 text-blue-600" />
                    LinkedIn Profile
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
              )}

              {mentor.socialLinks?.github && (
                <a
                  href={mentor.socialLinks.github}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-brand-300 hover:bg-slate-50 transition-colors text-xs text-slate-700 font-medium"
                >
                  <span className="flex items-center gap-2">
                    <GitHubIcon className="w-4 h-4 text-slate-800" />
                    GitHub Repositories
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
              )}

              {mentor.socialLinks?.website && (
                <a
                  href={mentor.socialLinks.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-brand-300 hover:bg-slate-50 transition-colors text-xs text-slate-700 font-medium"
                >
                  <span className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-brand-600" />
                    Academic Website / Lab
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
              )}

              {mentor.socialLinks?.twitter && (
                <a
                  href={mentor.socialLinks.twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-brand-300 hover:bg-slate-50 transition-colors text-xs text-slate-700 font-medium"
                >
                  <span className="flex items-center gap-2">
                    <TwitterIcon className="w-4 h-4 text-sky-500" />
                    Research Twitter (X)
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Request as My Mentor Modal */}
      <Modal
        open={allocModalOpen}
        onClose={() => setAllocModalOpen(false)}
        title="Request as My Official Mentor"
        size="md"
      >
        {allocFeedback.success ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-navy-900">Allocation Request Submitted!</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your request to have <strong>{mentor.name}</strong> as your official mentor has been
              forwarded to your cohort coordinator for review and approval.
            </p>
          </div>
        ) : (
          <form onSubmit={handleRequestAllocation} className="space-y-4 text-xs">
            {allocFeedback.error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{allocFeedback.error}</span>
              </div>
            )}

            <div className="p-3 rounded-xl bg-brand-50 border border-brand-200 text-brand-800">
              <div className="flex items-center gap-2 font-semibold text-sm text-brand-900 mb-1">
                <UserCheck className="w-4 h-4 text-brand-600" />
                Selected Mentor: {mentor.name}
              </div>
              <p className="text-xs text-brand-700">
                {mentor.title} · {mentor.department}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Coordinator responsible for approval:{' '}
                <strong>{currentUser?.coordinatorName || 'Cohort Coordinator'}</strong>
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Request Message / Statement of Interest (Optional)
              </label>
              <textarea
                rows={3}
                value={allocMessage}
                onChange={(e) => setAllocMessage(e.target.value)}
                placeholder="Explain why you would like Dr./Prof. to mentor you, your research or learning goals..."
                className="w-full p-3 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="secondary"
                size="sm"
                type="button"
                onClick={() => setAllocModalOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" icon={Send}>
                Submit Request to Coordinator
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Connect / Express Interest Modal */}
      <Modal
        open={connectModalOpen}
        onClose={() => setConnectModalOpen(false)}
        title="Send Connection Request"
        size="md"
      >
        {modalFeedback.success ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-navy-900">Connection Request Sent!</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your connection request has been queued in <strong>{mentor.name}</strong>'s incoming connections.
              Once accepted, you will be able to schedule 1-on-1 sessions.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSendConnection} className="space-y-4 text-xs">
            {modalFeedback.error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{modalFeedback.error}</span>
              </div>
            )}

            <div className="p-3 rounded-xl bg-brand-50 border border-brand-200 text-brand-800">
              <div className="flex items-center gap-2 font-semibold text-sm text-brand-900 mb-1">
                <UserCheck className="w-4 h-4 text-brand-600" />
                Recipient: {mentor.name}
              </div>
              <p className="text-xs text-brand-700">
                {mentor.title} · {mentor.department}
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Introduction / Mentorship Goals Note
              </label>
              <textarea
                rows={3}
                value={menteeNote}
                onChange={(e) => setMenteeNote(e.target.value)}
                placeholder="Briefly state your learning objectives, capstone focus, or areas where you need guidance..."
                className="w-full p-3 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] leading-relaxed">
              <strong>Workflow Note:</strong> Formal mentor allocation and coordinator cohort approval will be implemented in Step 5. Sending this request establishes an interactive connection between you and the mentor.
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="secondary" size="sm" type="button" onClick={() => setConnectModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" icon={Send}>
                Send Connection Request
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
