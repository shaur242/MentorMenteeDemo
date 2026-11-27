// Mentor Pages
import React from 'react';
import PlaceholderPage from '../shared/PlaceholderPage';
import { Users, FileText } from 'lucide-react';
export { default as MentorProfilePage } from './MentorProfilePage';
export { default as MentorMenteesPage } from './MentorMenteesPage';
export { default as MentorSessionReportsPage } from './MentorSessionReportsPage';
export { default as MentorGoalsPage } from './MentorGoalsPage';
import ConnectionsPage from '../connections/ConnectionsPage';
import SessionsPage from '../sessions/SessionsPage';
import ReviewsPage from '../reviews/ReviewsPage';

export function MentorConnectionsPage() {
  return <ConnectionsPage />;
}

export function MentorSessionsPage() {
  return <SessionsPage />;
}

export function MentorReviewsPage() {
  return <ReviewsPage />;
}
