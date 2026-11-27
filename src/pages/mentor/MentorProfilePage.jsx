import React, { useState, useEffect } from 'react';
import {
  Save,
  CheckCircle2,
  Plus,
  X,
  User,
  Briefcase,
  GraduationCap,
  Calendar,
  Globe,
  ExternalLink,
  Eye,
  AlertCircle,
  Building,
  Clock,
  Sparkles,
} from 'lucide-react';
import { LinkedInIcon, GitHubIcon, TwitterIcon } from '../../components/common/SocialIcons';
import { useApp } from '../../context/AppContext';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { useNavigate } from 'react-router-dom';

export default function MentorProfilePage() {
  const { currentUser, currentRole, mentors, updateMentorProfile } = useApp();
  const navigate = useNavigate();

  // Find mentor record (either currentUser or fallback to first mentor in dataset)
  const currentMentor =
    mentors.find((m) => m.id === currentUser?.id) ||
    mentors.find((m) => m.role === 'Mentor') ||
    mentors[0];

  // Editable Form State
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    company: '',
    department: '',
    yearsOfExperience: 10,
    phone: '',
    email: '',
    biography: '',
    sessionDuration: '45 minutes',
    sessionPricing: 'Free / Institutional Mentorship',
    availabilityDays: [],
    availabilityHours: '',
    availabilityMode: '',
    slotsPerWeek: 5,
    socialLinkedin: '',
    socialGithub: '',
    socialWebsite: '',
    socialTwitter: '',
  });

  const [expertiseList, setExpertiseList] = useState([]);
  const [newExpertiseInput, setNewExpertiseInput] = useState('');

  const [skillsList, setSkillsList] = useState([]);
  const [newSkillInput, setNewSkillInput] = useState('');

  const [qualificationsList, setQualificationsList] = useState([]);
  const [newQualificationInput, setNewQualificationInput] = useState('');

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available days of week choices
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Initialize state when currentMentor changes
  useEffect(() => {
    if (currentMentor) {
      setFormData({
        name: currentMentor.name || '',
        title: currentMentor.title || '',
        company: currentMentor.company || '',
        department: currentMentor.department || '',
        yearsOfExperience: currentMentor.yearsOfExperience || 8,
        phone: currentMentor.phone || '',
        email: currentMentor.email || '',
        biography: currentMentor.biography || '',
        sessionDuration: currentMentor.sessionDuration || '45 minutes',
        sessionPricing: currentMentor.sessionPricing || 'Free / Institutional Mentorship',
        availabilityDays: currentMentor.availability?.days || ['Monday', 'Wednesday'],
        availabilityHours: currentMentor.availability?.hours || '02:00 PM – 05:00 PM',
        availabilityMode: currentMentor.availability?.mode || 'Hybrid (Campus / Google Meet)',
        slotsPerWeek: currentMentor.availability?.slotsPerWeek || 5,
        socialLinkedin: currentMentor.socialLinks?.linkedin || '',
        socialGithub: currentMentor.socialLinks?.github || '',
        socialWebsite: currentMentor.socialLinks?.website || '',
        socialTwitter: currentMentor.socialLinks?.twitter || '',
      });

      setExpertiseList(currentMentor.areasOfExpertise || []);
      setSkillsList(currentMentor.skills || []);
      setQualificationsList(currentMentor.qualifications || []);
    }
  }, [currentMentor]);

  // Handle generic input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Toggle availability day
  const handleToggleDay = (day) => {
    setFormData((prev) => {
      const exists = prev.availabilityDays.includes(day);
      const updatedDays = exists
        ? prev.availabilityDays.filter((d) => d !== day)
        : [...prev.availabilityDays, day];
      return { ...prev, availabilityDays: updatedDays };
    });
  };

  // Add / Remove Expertise
  const handleAddExpertise = () => {
    if (newExpertiseInput.trim() && !expertiseList.includes(newExpertiseInput.trim())) {
      setExpertiseList([...expertiseList, newExpertiseInput.trim()]);
      setNewExpertiseInput('');
    }
  };

  const handleRemoveExpertise = (tag) => {
    setExpertiseList(expertiseList.filter((item) => item !== tag));
  };

  // Add / Remove Skill
  const handleAddSkill = () => {
    if (newSkillInput.trim() && !skillsList.includes(newSkillInput.trim())) {
      setSkillsList([...skillsList, newSkillInput.trim()]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setSkillsList(skillsList.filter((item) => item !== skill));
  };

  // Add / Remove Qualification
  const handleAddQualification = () => {
    if (newQualificationInput.trim()) {
      setQualificationsList([...qualificationsList, newQualificationInput.trim()]);
      setNewQualificationInput('');
    }
  };

  const handleRemoveQualification = (index) => {
    setQualificationsList(qualificationsList.filter((_, i) => i !== index));
  };

  // Handle Save
  const handleSaveProfile = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const updatedData = {
      name: formData.name,
      title: formData.title,
      company: formData.company,
      department: formData.department,
      yearsOfExperience: Number(formData.yearsOfExperience) || 0,
      phone: formData.phone,
      biography: formData.biography,
      sessionDuration: formData.sessionDuration,
      sessionPricing: formData.sessionPricing,
      areasOfExpertise: expertiseList,
      skills: skillsList,
      qualifications: qualificationsList,
      availability: {
        days: formData.availabilityDays,
        hours: formData.availabilityHours,
        mode: formData.availabilityMode,
        slotsPerWeek: Number(formData.slotsPerWeek) || 5,
      },
      socialLinks: {
        linkedin: formData.socialLinkedin,
        github: formData.socialGithub,
        website: formData.socialWebsite,
        twitter: formData.socialTwitter,
      },
      profileCompletion: 98,
    };

    updateMentorProfile(currentMentor.id, updatedData);

    setTimeout(() => {
      setIsSubmitting(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    }, 200);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <PageHeader
        title="My Mentor Profile"
        subtitle="Manage your public academic profile, expertise tags, availability schedule, and session preferences."
        breadcrumbs={['Mentor', 'My Profile']}
      >
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/mentor/mentors/${currentMentor.id}`)}
            icon={Eye}
          >
            Preview Public Profile
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSaveProfile}
            loading={isSubmitting}
            icon={Save}
          >
            Save Changes
          </Button>
        </div>
      </PageHeader>

      {/* Success Notification Banner */}
      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-2xs animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-emerald-900">Profile Changes Saved Successfully!</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Your updated profile has been saved to localStorage and is immediately visible in the student Mentor Directory.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSavedSuccess(false)}
            className="text-emerald-700 hover:text-emerald-900 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Profile Card Summary Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <Avatar user={currentMentor} size="xl" className="ring-2 ring-slate-100 flex-shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-navy-900">{formData.name || currentMentor.name}</h2>
                <Badge role="Mentor" size="sm">Mentor</Badge>
              </div>
              <p className="text-xs text-slate-600 font-medium">{formData.title || currentMentor.title}</p>
              <p className="text-xs text-slate-400 mt-0.5">{formData.department} · {formData.company}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
            <div className="text-right">
              <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
                Profile Completeness
              </span>
              <p className="text-sm font-bold text-brand-600">98% Complete</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Section 1: Basic & Professional Information */}
        <Card title="Personal & Professional Information" subtitle="Your identification details shown in the student directory">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Professional Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g. Associate Professor & Systems Architect"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Institution / Lab / Company
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="e.g. University Advanced Cloud Systems Lab"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Years of Professional / Academic Experience
              </label>
              <input
                type="number"
                name="yearsOfExperience"
                value={formData.yearsOfExperience}
                onChange={handleChange}
                min={0}
                max={50}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address (Read-only System Identifier)
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>
        </Card>

        {/* Section 2: Biography */}
        <Card title="Biography & Research Statement" subtitle="Detailed overview of your academic background and mentoring philosophy">
          <div>
            <textarea
              name="biography"
              rows={5}
              value={formData.biography}
              onChange={handleChange}
              placeholder="Describe your background, ongoing research projects, industry experience, and what students can expect from your mentorship sessions..."
              className="w-full p-3 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none leading-relaxed"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Markdown formatting is supported. This will appear prominently on your public profile page.
            </p>
          </div>
        </Card>

        {/* Section 3: Expertise & Skills Tag Managers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Areas of Expertise */}
          <Card title="Areas of Expertise" subtitle="High-level academic and research domains">
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newExpertiseInput}
                  onChange={(e) => setNewExpertiseInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddExpertise();
                    }
                  }}
                  placeholder="e.g. Distributed Systems"
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
                <Button type="button" variant="secondary" size="sm" onClick={handleAddExpertise} icon={Plus}>
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-1.5 min-h-[48px] p-2 rounded-lg bg-slate-50 border border-slate-100">
                {expertiseList.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-navy-800 text-white"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveExpertise(tag)}
                      className="hover:text-rose-300 p-0.5 rounded transition-colors"
                      title="Remove tag"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </Card>

          {/* Technical Skills */}
          <Card title="Technical Skills" subtitle="Specific tools, frameworks, and programming languages">
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  placeholder="e.g. Kubernetes, Go, PyTorch"
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
                <Button type="button" variant="secondary" size="sm" onClick={handleAddSkill} icon={Plus}>
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-1.5 min-h-[48px] p-2 rounded-lg bg-slate-50 border border-slate-100">
                {skillsList.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-white text-slate-700 border border-slate-300 shadow-2xs"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-slate-400 hover:text-rose-600 p-0.5 transition-colors"
                      title="Remove skill"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Section 4: Qualifications & Degrees */}
        <Card title="Qualifications & Certifications" subtitle="Academic degrees, university honors, and industry credentials">
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newQualificationInput}
                onChange={(e) => setNewQualificationInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddQualification();
                  }
                }}
                placeholder="e.g. Ph.D. in Computer Science – Stanford University (2017)"
                className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
              <Button type="button" variant="secondary" size="sm" onClick={handleAddQualification} icon={Plus}>
                Add Qualification
              </Button>
            </div>

            <div className="space-y-2">
              {qualificationsList.map((qual, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800"
                >
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-brand-600 flex-shrink-0" />
                    <span>{qual}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveQualification(idx)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded"
                    title="Delete qualification"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Section 5: Availability Schedule & Session Settings */}
        <Card title="Availability & Session Settings" subtitle="Configure your office hours, available days, and default session duration">
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Available Meeting Days
              </label>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map((day) => {
                  const isSelected = formData.availabilityDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleToggleDay(day)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {day} {isSelected && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Available Hours
                </label>
                <input
                  type="text"
                  name="availabilityHours"
                  value={formData.availabilityHours}
                  onChange={handleChange}
                  placeholder="e.g. 02:00 PM – 05:00 PM"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Default Session Duration
                </label>
                <select
                  name="sessionDuration"
                  value={formData.sessionDuration}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="30 minutes">30 minutes</option>
                  <option value="45 minutes">45 minutes</option>
                  <option value="60 minutes">60 minutes</option>
                  <option value="90 minutes">90 minutes</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Weekly Mentee Capacity (Slots)
                </label>
                <input
                  type="number"
                  name="slotsPerWeek"
                  value={formData.slotsPerWeek}
                  onChange={handleChange}
                  min={1}
                  max={20}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Session Meeting Mode / Location Note
                </label>
                <input
                  type="text"
                  name="availabilityMode"
                  value={formData.availabilityMode}
                  onChange={handleChange}
                  placeholder="e.g. Hybrid (Campus Cabin 304 / Google Meet)"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Section 6: Social & Professional Links */}
        <Card title="Social & Academic Links" subtitle="External links displayed to prospective mentees">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <LinkedInIcon className="w-3.5 h-3.5 text-blue-600" />
                LinkedIn URL
              </label>
              <input
                type="url"
                name="socialLinkedin"
                value={formData.socialLinkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <GitHubIcon className="w-3.5 h-3.5 text-slate-800" />
                GitHub URL
              </label>
              <input
                type="url"
                name="socialGithub"
                value={formData.socialGithub}
                onChange={handleChange}
                placeholder="https://github.com/..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-brand-600" />
                Personal / Academic Website
              </label>
              <input
                type="url"
                name="socialWebsite"
                value={formData.socialWebsite}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <TwitterIcon className="w-3.5 h-3.5 text-sky-500" />
                Twitter (X) Profile
              </label>
              <input
                type="url"
                name="socialTwitter"
                value={formData.socialTwitter}
                onChange={handleChange}
                placeholder="https://twitter.com/..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>
        </Card>

        {/* Bottom Save Action Bar */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500">
            Changes will be stored locally and update your entry across all student and coordinator dashboards.
          </p>
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={isSubmitting}
            icon={Save}
          >
            Save Profile Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
