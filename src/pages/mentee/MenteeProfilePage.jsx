import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Building,
  Calendar,
  Award,
  CheckCircle2,
  Edit,
  Shield,
  Layers,
  Star,
  FileText,
  UserCheck,
  AlertCircle,
  ExternalLink,
  BookOpen,
  Lock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

export default function MenteeProfilePage() {
  const {
    currentUser,
    mentees,
    mentors,
    updateMenteeProfile,
    getCoordinatorById,
    getMentorById,
    sessions,
    reviews,
    allocations,
  } = useApp();

  const navigate = useNavigate();

  // Find authoritative mentee record
  const mentee = useMemo(() => {
    if (!currentUser) return null;
    return mentees.find((m) => m.id === currentUser.id) || currentUser;
  }, [currentUser, mentees]);

  // Derived mentoring information
  const activeAllocation = useMemo(() => {
    if (!mentee) return null;
    return (
      allocations.find((a) => a.menteeId === mentee.id && a.status === 'approved') ||
      allocations.find((a) => a.menteeId === mentee.id && a.status === 'pending') ||
      null
    );
  }, [allocations, mentee]);

  const assignedMentor = useMemo(() => {
    if (!mentee) return null;
    const mentorId = activeAllocation?.status === 'approved' ? activeAllocation.mentorId : mentee.mentorId;
    if (!mentorId) return null;
    return getMentorById(mentorId);
  }, [mentee, activeAllocation, getMentorById]);

  const coordinator = useMemo(() => {
    if (!mentee || !mentee.coordinatorId) return null;
    return getCoordinatorById(mentee.coordinatorId);
  }, [mentee, getCoordinatorById]);

  const completedSessionsCount = useMemo(() => {
    if (!mentee) return 0;
    return sessions.filter((s) => s.menteeId === mentee.id && s.status === 'completed').length;
  }, [sessions, mentee]);

  const submittedReviewsCount = useMemo(() => {
    if (!mentee) return 0;
    return reviews.filter((r) => r.menteeId === mentee.id).length;
  }, [reviews, mentee]);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
    department: '',
    year: '',
    goals: '',
    avatarColor: 'bg-amber-500',
  });
  const [validationError, setValidationError] = useState('');
  const [successToast, setSuccessToast] = useState('');

  const openEditModal = () => {
    if (!mentee) return;
    setValidationError('');
    setEditFormData({
      name: mentee.name || '',
      phone: mentee.phone || '',
      department: mentee.department || 'Computer Science & Engineering',
      year: mentee.year || '3rd Year Undergraduate (B.Tech)',
      goals: mentee.goals || '',
      avatarColor: mentee.avatarColor || 'bg-amber-500',
    });
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!editFormData.name.trim()) {
      setValidationError('Full name is required.');
      return;
    }

    if (editFormData.name.trim().length < 2) {
      setValidationError('Full name must be at least 2 characters long.');
      return;
    }

    const res = updateMenteeProfile(mentee.id, {
      name: editFormData.name.trim(),
      phone: editFormData.phone.trim(),
      department: editFormData.department.trim(),
      year: editFormData.year.trim(),
      goals: editFormData.goals.trim(),
      avatarColor: editFormData.avatarColor,
    });

    if (res && res.success) {
      setIsEditModalOpen(false);
      setSuccessToast('Profile updated successfully! All changes have been saved.');
      setTimeout(() => {
        setSuccessToast('');
      }, 5000);
    } else {
      setValidationError(res?.error || 'Failed to update profile. Please try again.');
    }
  };

  const availableAvatarColors = [
    { label: 'Amber', value: 'bg-amber-500' },
    { label: 'Emerald', value: 'bg-emerald-600' },
    { label: 'Indigo', value: 'bg-indigo-600' },
    { label: 'Rose', value: 'bg-rose-500' },
    { label: 'Purple', value: 'bg-purple-600' },
    { label: 'Sky', value: 'bg-sky-500' },
  ];

  if (!mentee) {
    return (
      <div className="p-8 text-center text-sm text-slate-500">
        Please log in as a Mentee to view and manage your profile.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <PageHeader
        title="My Profile"
        subtitle="Manage your personal details, academic standing, and mentoring relationships."
        breadcrumbs={['Mentee', 'My Profile']}
      >
        <Button variant="primary" size="sm" onClick={openEditModal} icon={Edit}>
          Edit Profile
        </Button>
      </PageHeader>

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

      {/* ── Main Profile Hero Card ─────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <Avatar user={mentee} size="2xl" />
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-bold text-navy-900">{mentee.name}</h2>
                <Badge variant="amber" size="sm">
                  {mentee.role}
                </Badge>
                {activeAllocation?.status === 'approved' ? (
                  <Badge variant="success" size="sm">
                    Mentor Assigned
                  </Badge>
                ) : activeAllocation?.status === 'pending' ? (
                  <Badge variant="warning" size="sm">
                    Allocation Pending
                  </Badge>
                ) : (
                  <Badge variant="neutral" size="sm">
                    Unallocated
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-500">
                {mentee.department} · {mentee.year || mentee.company}
              </p>
              <p className="text-xs text-slate-400 font-mono">
                Student ID: <span className="text-slate-600 font-semibold">{mentee.id}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" onClick={openEditModal} icon={Edit}>
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Quick Highlights Metric Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[11px] font-semibold uppercase tracking-wider">
              Completed Sessions
            </span>
            <span className="text-lg font-bold text-navy-900 mt-0.5 block">
              {completedSessionsCount}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[11px] font-semibold uppercase tracking-wider">
              Reviews Submitted
            </span>
            <span className="text-lg font-bold text-navy-900 mt-0.5 block">
              {submittedReviewsCount}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[11px] font-semibold uppercase tracking-wider">
              Faculty Mentor
            </span>
            <span className="text-xs font-bold text-navy-900 mt-1 block truncate">
              {assignedMentor ? assignedMentor.name : 'Unassigned'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[11px] font-semibold uppercase tracking-wider">
              Cohort Coordinator
            </span>
            <span className="text-xs font-bold text-navy-900 mt-1 block truncate">
              {coordinator ? coordinator.name : mentee.coordinatorName || 'Assigned Coordinator'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Two Column Grid: Personal & Academic ───────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal & Contact Information */}
        <Card
          title="Personal Information"
          subtitle="Identity credentials and official contact details"
          headerRight={<User className="w-4 h-4 text-slate-400" />}
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-start justify-between py-2 border-b border-slate-100">
              <div className="space-y-0.5">
                <span className="text-slate-400 font-medium">Full Name</span>
                <p className="text-navy-900 font-semibold text-sm">{mentee.name}</p>
              </div>
              <Badge variant="neutral" size="xs">
                Verified
              </Badge>
            </div>

            <div className="flex items-start justify-between py-2 border-b border-slate-100">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Institutional Email</span>
                </div>
                <p className="text-navy-900 font-semibold">{mentee.email}</p>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <Lock className="w-3 h-3" />
                <span>Read-only</span>
              </div>
            </div>

            <div className="flex items-start justify-between py-2 border-b border-slate-100">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                  <Phone className="w-3.5 h-3.5" />
                  <span>Contact Number</span>
                </div>
                <p className="text-navy-900 font-semibold">{mentee.phone || 'Not provided'}</p>
              </div>
            </div>

            <div className="flex items-start justify-between py-2 border-b border-slate-100">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Account Identifier</span>
                </div>
                <p className="text-navy-900 font-mono font-semibold">{mentee.id}</p>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <Lock className="w-3 h-3" />
                <span>Permanent</span>
              </div>
            </div>

            <div className="flex items-start justify-between pt-1">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Enrolment Year</span>
                </div>
                <p className="text-navy-900 font-semibold">{mentee.joinedYear || 2023}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Academic Information */}
        <Card
          title="Academic Program"
          subtitle="Departmental affiliation and academic curriculum details"
          headerRight={<GraduationCap className="w-4 h-4 text-slate-400" />}
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-start justify-between py-2 border-b border-slate-100">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                  <Building className="w-3.5 h-3.5" />
                  <span>Academic Department</span>
                </div>
                <p className="text-navy-900 font-semibold">{mentee.department}</p>
              </div>
            </div>

            <div className="flex items-start justify-between py-2 border-b border-slate-100">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Program Cohort</span>
                </div>
                <p className="text-navy-900 font-semibold">
                  {mentee.company || 'Undergraduate Student Cohort'}
                </p>
              </div>
            </div>

            <div className="flex items-start justify-between py-2 border-b border-slate-100">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Current Academic Year</span>
                </div>
                <p className="text-navy-900 font-semibold">{mentee.year || '3rd Year Undergraduate (B.Tech)'}</p>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-slate-400 font-medium block mb-1">
                Mentoring Goals & Focus Areas
              </span>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 leading-relaxed italic">
                {mentee.goals ? `"${mentee.goals}"` : 'No specific mentoring goals specified yet.'}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Mentoring & Faculty Oversight Overview ───────────────────────── */}
      <Card
        title="Mentorship & Cohort Oversight"
        subtitle="Current faculty guidance, cohort coordinator, and administrative allocation status"
        headerRight={<Layers className="w-4 h-4 text-slate-400" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Assigned Mentor Card */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-brand-600" />
                Assigned Faculty Mentor
              </span>
              {assignedMentor ? (
                <Badge variant="success" size="xs">
                  Active
                </Badge>
              ) : (
                <Badge variant="neutral" size="xs">
                  Not Assigned
                </Badge>
              )}
            </div>

            {assignedMentor ? (
              <div className="flex items-center justify-between gap-4 pt-1">
                <div className="flex items-center gap-3">
                  <Avatar user={assignedMentor} size="md" />
                  <div>
                    <h4 className="text-sm font-bold text-navy-900">{assignedMentor.name}</h4>
                    <p className="text-[11px] text-slate-500">{assignedMentor.title || assignedMentor.department}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-[11px] font-bold text-slate-700">{assignedMentor.rating || 5.0}</span>
                      <span className="text-[10px] text-slate-400">({assignedMentor.totalReviews || 0} reviews)</span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  size="xs"
                  onClick={() => navigate(`/mentee/find-mentors/${assignedMentor.id}`)}
                  icon={ExternalLink}
                >
                  View Profile
                </Button>
              </div>
            ) : (
              <div className="space-y-2 py-2">
                <p className="text-slate-500 text-xs">
                  You do not have an officially assigned faculty mentor yet.
                </p>
                <Button
                  variant="primary"
                  size="xs"
                  onClick={() => navigate('/mentee/find-mentors')}
                  icon={ExternalLink}
                >
                  Find a Mentor
                </Button>
              </div>
            )}
          </div>

          {/* Assigned Coordinator Card */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                Cohort Coordinator
              </span>
              <Badge variant="blue" size="xs">
                Oversight
              </Badge>
            </div>

            {coordinator ? (
              <div className="flex items-center justify-between gap-4 pt-1">
                <div className="flex items-center gap-3">
                  <Avatar user={coordinator} size="md" />
                  <div>
                    <h4 className="text-sm font-bold text-navy-900">{coordinator.name}</h4>
                    <p className="text-[11px] text-slate-500">
                      {coordinator.designation || 'Cohort Coordinator'} · {coordinator.department}
                    </p>
                    <p className="text-[10px] text-slate-400">{coordinator.email}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-2 text-slate-500 text-xs">
                {mentee.coordinatorName || 'Departmental Cohort Coordinator'}
              </div>
            )}
          </div>
        </div>

        {/* Allocation Status Alert Banner */}
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="font-bold text-navy-900 block">Current Allocation Lifecycle Status</span>
            <p className="text-slate-500">
              {activeAllocation
                ? activeAllocation.status === 'approved'
                  ? `Officially allocated via ${activeAllocation.method === 'self_selected' ? 'student request approval' : 'direct coordinator assignment'}.`
                  : 'Pending approval from your departmental coordinator.'
                : 'No active allocation record found. Request a mentor to start formal sessions.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="xs"
              onClick={() => navigate('/mentee/requests')}
              icon={FileText}
            >
              My Requests
            </Button>
            <Button
              variant="secondary"
              size="xs"
              onClick={() => navigate('/mentee/my-mentor')}
              icon={UserCheck}
            >
              My Mentor
            </Button>
          </div>
        </div>
      </Card>

      {/* ── Edit Profile Modal ───────────────────────────────────────────── */}
      <Modal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Mentee Profile"
        description="Update your contact number, academic details, and mentoring focus."
        size="lg"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          {validationError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                placeholder="e.g. Alex Johnson"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="text"
                value={editFormData.phone}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                placeholder="+91 98765 00021"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Department */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department</label>
              <select
                value={editFormData.department}
                onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics & Communication">Electronics & Communication</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Data Science & AI">Data Science & AI</option>
              </select>
            </div>

            {/* Academic Standing / Year */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Academic Year</label>
              <select
                value={editFormData.year}
                onChange={(e) => setEditFormData({ ...editFormData, year: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="1st Year Undergraduate (B.Tech)">1st Year Undergraduate (B.Tech)</option>
                <option value="2nd Year Undergraduate (B.Tech)">2nd Year Undergraduate (B.Tech)</option>
                <option value="3rd Year Undergraduate (B.Tech)">3rd Year Undergraduate (B.Tech)</option>
                <option value="4th Year Undergraduate (B.Tech)">4th Year Undergraduate (B.Tech)</option>
                <option value="Postgraduate (M.Tech)">Postgraduate (M.Tech)</option>
              </select>
            </div>
          </div>

          {/* Read-only system values notice */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-500">
            <div>
              <span className="font-semibold block text-slate-600">Institutional Email:</span>
              <span className="font-mono">{mentee.email}</span>
            </div>
            <div>
              <span className="font-semibold block text-slate-600">Student ID / System Key:</span>
              <span className="font-mono">{mentee.id}</span>
            </div>
          </div>

          {/* Mentoring Goals */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Mentoring Goals & Focus Areas
            </label>
            <textarea
              rows={3}
              value={editFormData.goals}
              onChange={(e) => setEditFormData({ ...editFormData, goals: e.target.value })}
              placeholder="Outline your primary technical interests, capstone project goals, or career objectives..."
              className="w-full p-3 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 leading-relaxed"
            />
          </div>

          {/* Avatar Color Theme */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Avatar Accent Color</label>
            <div className="flex items-center gap-2">
              {availableAvatarColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setEditFormData({ ...editFormData, avatarColor: color.value })}
                  className={`w-7 h-7 rounded-full ${color.value} flex items-center justify-center transition-transform ${
                    editFormData.avatarColor === color.value
                      ? 'ring-2 ring-offset-2 ring-brand-500 scale-110'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  title={color.label}
                >
                  {editFormData.avatarColor === color.value && (
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
