// HOD Pages
import React from 'react';
import PlaceholderPage from '../shared/PlaceholderPage';
import { UserCog } from 'lucide-react';
import MentorDirectoryPage from '../mentors/MentorDirectoryPage';
import SessionsPage from '../sessions/SessionsPage';

export { default as HODCoordinatorsPage } from './HODCoordinatorsPage';
export { default as HODMentorsPage } from './HODMentorsPage';
export { default as HODMenteesPage } from './HODMenteesPage';
export { default as HODAllocationsPage } from './HODAllocationsPage';
export { default as HODReportsPage } from './HODReportsPage';
export { default as HODGoalsPage } from './HODGoalsPage';

export function HODSessionsPage() {
  return <SessionsPage />;
}

export function HODAnalyticsPage() {
  return (
    <PlaceholderPage
      icon={UserCog}
      title="Analytics"
      description="In-depth analytics and trends for the department."
      breadcrumbs={['HOD', 'Analytics']}
      features={[
        'Engagement trends over time',
        'Session frequency charts',
        'Mentor–mentee ratio analysis',
        'Department comparison dashboards',
      ]}
    />
  );
}
