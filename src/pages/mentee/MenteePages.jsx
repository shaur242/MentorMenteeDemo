// Mentee Pages
import React from 'react';
import PlaceholderPage from '../shared/PlaceholderPage';
import { User, UserCheck, Target } from 'lucide-react';
import MentorDirectoryPage from '../mentors/MentorDirectoryPage';
import ConnectionsPage from '../connections/ConnectionsPage';
import SessionsPage from '../sessions/SessionsPage';
import ReviewsPage from '../reviews/ReviewsPage';
export { default as MenteeMyMentorPage } from './MenteeMyMentorPage';
export { default as MenteeRequestsPage } from './MenteeRequestsPage';
export { default as MenteeProgressPage } from './MenteeProgressPage';
export { default as MenteeProfilePage } from './MenteeProfilePage';
export { default as MenteeReviewsPage } from './MenteeReviewsPage';
export { default as MenteeGoalsPage } from './MenteeGoalsPage';

export function MenteeFindMentorsPage() {
  return (
    <MentorDirectoryPage
      pageTitle="Find Mentors"
      pageSubtitle="Browse faculty mentors, explore research specialties, filter by technical skills, and express interest in mentorship."
    />
  );
}

export function MenteeConnectionsPage() {
  return <ConnectionsPage />;
}

export function MenteeSessionsPage() {
  return <SessionsPage />;
}
