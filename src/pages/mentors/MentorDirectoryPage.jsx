import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  X,
  Compass,
  Star,
  Briefcase,
  Users,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import MentorCard from '../../components/mentors/MentorCard';
import PageHeader from '../../components/common/PageHeader';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

export default function MentorDirectoryPage({ pageTitle = 'Find Mentors', pageSubtitle = 'Browse verified faculty mentors, explore research expertise, and discover session availability.' }) {
  const { mentors, currentRole } = useApp();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState('All');
  const [selectedSkill, setSelectedSkill] = useState('All');
  const [minExperience, setMinExperience] = useState('All');
  const [minRating, setMinRating] = useState('All');
  const [sortBy, setSortBy] = useState('rating'); // 'rating' | 'experience' | 'name'

  // Extract all unique areas of expertise and skills across the mentors dataset
  const allExpertiseOptions = useMemo(() => {
    const set = new Set();
    mentors.forEach((m) => {
      m.areasOfExpertise?.forEach((exp) => set.add(exp));
    });
    return Array.from(set).sort();
  }, [mentors]);

  const allSkillOptions = useMemo(() => {
    const set = new Set();
    mentors.forEach((m) => {
      m.skills?.forEach((skill) => set.add(skill));
    });
    return Array.from(set).sort();
  }, [mentors]);

  // Apply Search, Filters, and Sorting
  const filteredMentors = useMemo(() => {
    return mentors
      .filter((mentor) => {
        // Search query: name, title, company, skills
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesName = mentor.name.toLowerCase().includes(q);
          const matchesTitle = mentor.title?.toLowerCase().includes(q);
          const matchesCompany = (mentor.company || mentor.department)?.toLowerCase().includes(q);
          const matchesSkill = mentor.skills?.some((s) => s.toLowerCase().includes(q));
          const matchesExpertise = mentor.areasOfExpertise?.some((e) => e.toLowerCase().includes(q));

          if (!matchesName && !matchesTitle && !matchesCompany && !matchesSkill && !matchesExpertise) {
            return false;
          }
        }

        // Filter: Area of Expertise
        if (selectedExpertise !== 'All') {
          if (!mentor.areasOfExpertise?.includes(selectedExpertise)) {
            return false;
          }
        }

        // Filter: Skill
        if (selectedSkill !== 'All') {
          if (!mentor.skills?.includes(selectedSkill)) {
            return false;
          }
        }

        // Filter: Minimum Experience
        if (minExperience !== 'All') {
          const minYears = parseInt(minExperience, 10);
          if (mentor.yearsOfExperience < minYears) {
            return false;
          }
        }

        // Filter: Minimum Rating
        if (minRating !== 'All') {
          const minStars = parseFloat(minRating);
          if (mentor.rating < minStars) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') {
          return b.rating - a.rating;
        }
        if (sortBy === 'experience') {
          return b.yearsOfExperience - a.yearsOfExperience;
        }
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
  }, [mentors, searchQuery, selectedExpertise, selectedSkill, minExperience, minRating, sortBy]);

  const isFilterActive =
    searchQuery.trim() !== '' ||
    selectedExpertise !== 'All' ||
    selectedSkill !== 'All' ||
    minExperience !== 'All' ||
    minRating !== 'All';

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedExpertise('All');
    setSelectedSkill('All');
    setMinExperience('All');
    setMinRating('All');
    setSortBy('rating');
  };

  const getProfilePath = (mentorId) => {
    const rolePrefix = currentRole ? currentRole.toLowerCase() : 'mentee';
    return `/${rolePrefix}/mentors/${mentorId}`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={pageTitle}
        subtitle={pageSubtitle}
        breadcrumbs={[currentRole || 'Mentee', 'Find Mentors']}
      >
        <div className="flex items-center gap-2">
          <Badge variant="navy" size="md">
            {filteredMentors.length} Mentor{filteredMentors.length !== 1 ? 's' : ''} Available
          </Badge>
        </div>
      </PageHeader>

      {/* Search and Filters Hub */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        {/* Search Input Row */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by mentor name, professional title, institution, or technical skills (e.g. Kubernetes, Python)..."
            className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
          {/* Expertise Dropdown */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Area of Expertise
            </label>
            <select
              value={selectedExpertise}
              onChange={(e) => setSelectedExpertise(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="All">All Expertise</option>
              {allExpertiseOptions.map((exp) => (
                <option key={exp} value={exp}>
                  {exp}
                </option>
              ))}
            </select>
          </div>

          {/* Technical Skills Dropdown */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Technical Skill
            </label>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="All">All Skills</option>
              {allSkillOptions.map((skill) => (
                <option key={skill} value={skill}>
                  {skill}
                </option>
              ))}
            </select>
          </div>

          {/* Minimum Experience */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Min. Experience
            </label>
            <select
              value={minExperience}
              onChange={(e) => setMinExperience(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="All">Any Experience</option>
              <option value="8">8+ Years</option>
              <option value="10">10+ Years</option>
              <option value="12">12+ Years</option>
              <option value="14">14+ Years</option>
            </select>
          </div>

          {/* Minimum Rating */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Rating Filter
            </label>
            <select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="All">Any Rating</option>
              <option value="4.6">4.6★ and above</option>
              <option value="4.7">4.7★ and above</option>
              <option value="4.8">4.8★ and above</option>
              <option value="4.9">4.9★ and above</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Sort Mentors By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="rating">Highest Rated ★</option>
              <option value="experience">Most Experienced</option>
              <option value="name">Name (A – Z)</option>
            </select>
          </div>
        </div>

        {/* Filter Summary & Reset Action */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-navy-900">{filteredMentors.length}</strong> of{' '}
              <strong className="text-navy-900">{mentors.length}</strong> mentors
            </span>
            {isFilterActive && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 font-medium text-[11px]">
                Filtered Results
              </span>
            )}
          </div>

          {isFilterActive && (
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-800 font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset All Filters
            </button>
          )}
        </div>
      </div>

      {/* Mentors Grid / Empty State */}
      {filteredMentors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
          {filteredMentors.map((mentor) => (
            <MentorCard
              key={mentor.id}
              mentor={mentor}
              viewProfilePath={getProfilePath(mentor.id)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <Compass className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-navy-900 mb-1">No mentors match your criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5 leading-relaxed">
            We could not find any academic mentors matching your current search query and filters.
            Try adjusting your search terms or resetting filters.
          </p>
          <Button variant="secondary" size="sm" onClick={handleClearFilters} icon={RotateCcw}>
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
}
