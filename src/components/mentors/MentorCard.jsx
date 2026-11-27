import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star,
  Building,
  Briefcase,
  Clock,
  Calendar,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import Button from '../common/Button';

export default function MentorCard({ mentor, viewProfilePath }) {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    if (viewProfilePath) {
      navigate(viewProfilePath);
    } else {
      navigate(`/mentee/mentors/${mentor.id}`);
    }
  };

  const visibleExpertise = mentor.areasOfExpertise?.slice(0, 3) || [];
  const extraExpertiseCount = (mentor.areasOfExpertise?.length || 0) - visibleExpertise.length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 hover:border-brand-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      {/* Top Banner Accent */}
      <div className="h-2 bg-gradient-to-r from-navy-800 via-brand-600 to-navy-900" />

      <div className="p-5 flex-1 flex flex-col justify-between">
        {/* Header: Avatar, Name, Title, Rating */}
        <div>
          <div className="flex items-start justify-between gap-3 mb-3.5">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar user={mentor} size="lg" className="ring-2 ring-slate-100 flex-shrink-0" />
              <div className="min-w-0">
                <h3 className="text-base font-bold text-navy-900 truncate group-hover:text-brand-700 transition-colors">
                  {mentor.name}
                </h3>
                <p className="text-xs text-slate-600 truncate font-medium">
                  {mentor.title}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 truncate mt-0.5">
                  <Building className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{mentor.company || mentor.department}</span>
                </div>
              </div>
            </div>

            {/* Rating pill */}
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex-shrink-0 shadow-2xs">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{mentor.rating}</span>
              <span className="text-[10px] text-amber-600/80 font-normal">({mentor.totalReviews})</span>
            </div>
          </div>

          {/* Experience & Department Meta tags */}
          <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-medium">
              <Briefcase className="w-3 h-3 text-slate-400" />
              {mentor.yearsOfExperience} years exp
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-brand-700 border border-blue-200 font-medium">
              <Clock className="w-3 h-3 text-brand-500" />
              {mentor.sessionDuration || '45 mins'}
            </span>
          </div>

          {/* Biography excerpt */}
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
            {mentor.biography}
          </p>

          {/* Areas of Expertise Tags */}
          <div className="mb-4">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Areas of Expertise
            </p>
            <div className="flex flex-wrap gap-1.5">
              {visibleExpertise.map((exp, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                >
                  {exp}
                </span>
              ))}
              {extraExpertiseCount > 0 && (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                  +{extraExpertiseCount} more
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer: Availability summary & View Profile Action */}
        <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <Calendar className="w-3 h-3 text-slate-400 flex-shrink-0" />
              <span className="truncate">
                {mentor.availability?.days?.join(', ') || 'Available on request'}
              </span>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleViewProfile}
            iconRight={ArrowRight}
            className="flex-shrink-0"
          >
            View Profile
          </Button>
        </div>
      </div>
    </div>
  );
}
