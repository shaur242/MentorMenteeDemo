import React, { useState, useMemo } from 'react';
import {
  UserCog,
  Plus,
  Search,
  Edit2,
  CheckCircle2,
  XCircle,
  Users,
  UserCheck,
  Calendar,
  Star,
  ArrowRight,
  ShieldAlert,
  AlertCircle,
  RefreshCw,
  Mail,
  Phone,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function HODCoordinatorsPage() {
  const {
    coordinators,
    mentors,
    mentees,
    sessions,
    addCoordinator,
    updateCoordinator,
    toggleCoordinatorStatus,
    reassignAllFromCoordinator,
    getCoordinatorMentors,
    getCoordinatorMentees,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'active' | 'inactive'

  // Modal State: Add / Edit Coordinator
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    title: '',
    cohort: '',
    phone: '',
    bio: '',
  });
  const [formError, setFormError] = useState('');

  // Modal State: Reassign Mentors & Mentees from a Coordinator
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [reassignSourceCoord, setReassignSourceCoord] = useState(null);
  const [reassignTargetCoordId, setReassignTargetCoordId] = useState('');
  const [reassignSuccessMsg, setReassignSuccessMsg] = useState('');

  // Confirmation dialog state for toggle status
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    action: null,
    danger: false,
  });

  // Filtered Coordinators List
  const filteredCoordinators = useMemo(() => {
    return coordinators.filter((c) => {
      if (filterStatus === 'active' && c.status !== 'active') return false;
      if (filterStatus === 'inactive' && c.status !== 'inactive') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = c.name?.toLowerCase().includes(q);
        const matchCohort = c.cohort?.toLowerCase().includes(q);
        const matchEmail = c.email?.toLowerCase().includes(q);
        return matchName || matchCohort || matchEmail;
      }
      return true;
    });
  }, [coordinators, filterStatus, searchQuery]);

  // Open Add Modal
  const handleOpenAddModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      name: '',
      email: '',
      title: 'Program Coordinator',
      cohort: 'New Academic Cohort',
      phone: '+91 98765 00055',
      bio: 'Responsible for student mentorship allocation and cohort monitoring.',
    });
    setFormError('');
    setModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (coord) => {
    setIsEditing(true);
    setEditingId(coord.id);
    setFormData({
      name: coord.name,
      email: coord.email,
      title: coord.title || '',
      cohort: coord.cohort || '',
      phone: coord.phone || '',
      bio: coord.bio || '',
    });
    setFormError('');
    setModalOpen(true);
  };

  // Save Add/Edit
  const handleSaveCoordinator = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      setFormError('Please enter coordinator name and valid email address.');
      return;
    }

    if (isEditing) {
      updateCoordinator(editingId, {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        title: formData.title.trim(),
        cohort: formData.cohort.trim(),
        phone: formData.phone.trim(),
        bio: formData.bio.trim(),
      });
    } else {
      const res = addCoordinator(formData);
      if (!res.success) {
        setFormError(res.error || 'Failed to add coordinator.');
        return;
      }
    }

    setModalOpen(false);
  };

  // Toggle Active / Deactivate Status
  const handleToggleStatusPrompt = (coord) => {
    const isDeactivating = coord.status === 'active';
    const groupMentors = getCoordinatorMentors(coord.id);
    const groupMentees = getCoordinatorMentees(coord.id);

    setConfirmDialog({
      open: true,
      title: isDeactivating
        ? `Deactivate Coordinator: ${coord.name}?`
        : `Activate Coordinator: ${coord.name}?`,
      message: isDeactivating
        ? `Deactivating ${coord.name} will not delete any historical sessions, connections, or reviews. However, their ${groupMentors.length} mentors and ${groupMentees.length} mentees should be reassigned to an active coordinator.`
        : `Activate ${coord.name} to allow them to manage mentors, mentees, and cohort sessions.`,
      danger: isDeactivating,
      action: () => {
        toggleCoordinatorStatus(coord.id);
        if (isDeactivating && (groupMentors.length > 0 || groupMentees.length > 0)) {
          // Offer quick reassign
          handleOpenReassignModal(coord);
        }
      },
    });
  };

  // Open Reassign Modal
  const handleOpenReassignModal = (coord) => {
    setReassignSourceCoord(coord);
    const otherActiveCoords = coordinators.filter(
      (c) => c.id !== coord.id && c.status === 'active'
    );
    setReassignTargetCoordId(otherActiveCoords[0]?.id || '');
    setReassignSuccessMsg('');
    setReassignModalOpen(true);
  };

  // Execute Reassignment
  const handleExecuteReassign = () => {
    if (!reassignTargetCoordId) return;
    reassignAllFromCoordinator(reassignSourceCoord.id, reassignTargetCoordId);
    const target = coordinators.find((c) => c.id === reassignTargetCoordId);
    setReassignSuccessMsg(
      `Successfully transferred all mentors and mentees from ${reassignSourceCoord.name} to ${target?.name}!`
    );
    setTimeout(() => {
      setReassignModalOpen(false);
      setReassignSuccessMsg('');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Coordinator Management"
        subtitle="Overview and governance of department cohort coordinators"
        breadcrumbs={['HOD', 'Coordinators']}
      >
        <Button variant="primary" size="sm" onClick={handleOpenAddModal} icon={Plus}>
          Add Coordinator
        </Button>
      </PageHeader>

      {/* Hierarchy Info Banner */}
      <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 flex items-start gap-3">
        <UserCog className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 leading-relaxed">
          <p className="font-bold text-navy-900 mb-0.5">Department Hierarchy Structure</p>
          <p>
            Under the university governance policy, exactly one <strong>HOD</strong> presides over the Computer Science & Engineering department. Multiple <strong>Coordinators</strong> manage dedicated cohorts. Faculty Mentors and Mentees belong to their assigned coordinator group. When a coordinator is deactivated, historical sessions and reviews remain preserved while mentors and mentees can be seamlessly reassigned.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterStatus === 'all'
                ? 'bg-navy-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Coordinators ({coordinators.length})
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterStatus === 'active'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Active ({coordinators.filter((c) => c.status === 'active').length})
          </button>
          <button
            onClick={() => setFilterStatus('inactive')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterStatus === 'inactive'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Inactive ({coordinators.filter((c) => c.status === 'inactive').length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, cohort, or email..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Coordinators Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCoordinators.map((coord) => {
          const groupMentors = getCoordinatorMentors(coord.id);
          const groupMentees = getCoordinatorMentees(coord.id);
          const mentorIds = new Set(groupMentors.map((m) => m.id));
          const menteeIds = new Set(groupMentees.map((m) => m.id));

          const groupSessions = sessions.filter(
            (s) => mentorIds.has(s.mentorId) || menteeIds.has(s.menteeId)
          );
          const completedSessions = groupSessions.filter((s) => s.status === 'completed').length;

          const avgRating =
            groupMentors.length > 0
              ? (
                  groupMentors.reduce((acc, m) => acc + (Number(m.rating) || 0), 0) /
                  groupMentors.length
                ).toFixed(1)
              : '0.0';

          const isActive = coord.status === 'active';

          return (
            <div
              key={coord.id}
              className={`bg-white rounded-2xl border transition-all p-5 shadow-xs flex flex-col justify-between ${
                isActive
                  ? 'border-slate-200 hover:border-slate-300'
                  : 'border-rose-200 bg-rose-50/20'
              }`}
            >
              {/* Header Info */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3">
                    <Avatar user={coord} size="lg" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-navy-900">{coord.name}</h3>
                        <Badge variant={isActive ? 'success' : 'neutral'} size="xs">
                          {isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-xs font-semibold text-brand-600 mt-0.5">{coord.cohort}</p>
                      <p className="text-xs text-slate-500">{coord.title}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(coord)}
                      className="p-1.5 text-slate-400 hover:text-navy-900 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Edit Coordinator Details"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                  {coord.bio || 'Responsible for cohort mentorship allocation and monitoring.'}
                </p>

                {/* Contact info pills */}
                <div className="flex flex-wrap gap-2 text-[11px] text-slate-500 mb-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100">
                    <Mail className="w-3 h-3 text-slate-400" />
                    {coord.email}
                  </span>
                  {coord.phone && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {coord.phone}
                    </span>
                  )}
                </div>

                {/* Metric Summary Grid */}
                <div className="grid grid-cols-4 gap-2 text-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div>
                    <span className="block text-xs font-black text-navy-900">
                      {groupMentors.length}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">Mentors</span>
                  </div>
                  <div>
                    <span className="block text-xs font-black text-navy-900">
                      {groupMentees.length}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">Mentees</span>
                  </div>
                  <div>
                    <span className="block text-xs font-black text-navy-900">
                      {completedSessions}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">Completed</span>
                  </div>
                  <div>
                    <span className="block text-xs font-black text-amber-700 flex items-center justify-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {avgRating}
                    </span>
                    <span className="text-[10px] text-amber-600 font-medium">Avg Rating</span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <Button
                  variant="secondary"
                  size="xs"
                  onClick={() => handleOpenReassignModal(coord)}
                  icon={RefreshCw}
                >
                  Reassign Group
                </Button>

                <Button
                  variant={isActive ? 'ghost' : 'success'}
                  size="xs"
                  onClick={() => handleToggleStatusPrompt(coord)}
                  className={isActive ? 'text-rose-600 hover:bg-rose-50' : ''}
                >
                  {isActive ? 'Deactivate' : 'Activate Coordinator'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add / Edit Coordinator */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? 'Edit Coordinator Profile' : 'Add New Coordinator'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSaveCoordinator} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Prof. David Vance"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="coordinator@university.edu"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Designation / Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Undergraduate Coordinator"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assigned Cohort
              </label>
              <input
                type="text"
                value={formData.cohort}
                onChange={(e) => setFormData({ ...formData, cohort: e.target.value })}
                placeholder="e.g. CSE 3rd & 4th Year Cohort"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 98765 00000"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Biography & Responsibilities
            </label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Oversees student capstone projects and mentor workload..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" size="sm" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {isEditing ? 'Save Changes' : 'Create Coordinator'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Bulk Reassign Mentors & Mentees */}
      <Modal
        open={reassignModalOpen}
        onClose={() => setReassignModalOpen(false)}
        title={`Reassign Group: ${reassignSourceCoord?.name}`}
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Transfer all mentors and mentees currently belonging to{' '}
            <strong>{reassignSourceCoord?.name}</strong> to another active coordinator. All past
            sessions and ratings will remain fully intact.
          </p>

          {reassignSuccessMsg && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{reassignSuccessMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Coordinator <span className="text-rose-500">*</span>
            </label>
            <select
              value={reassignTargetCoordId}
              onChange={(e) => setReassignTargetCoordId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            >
              {coordinators
                .filter((c) => c.id !== reassignSourceCoord?.id && c.status === 'active')
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.cohort})
                  </option>
                ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setReassignModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleExecuteReassign}
              disabled={!reassignTargetCoordId}
              icon={RefreshCw}
            >
              Confirm Reassignment
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={() => {
          confirmDialog.action?.();
          setConfirmDialog({ ...confirmDialog, open: false });
        }}
        onCancel={() => setConfirmDialog({ ...confirmDialog, open: false })}
        danger={confirmDialog.danger}
      />
    </div>
  );
}
