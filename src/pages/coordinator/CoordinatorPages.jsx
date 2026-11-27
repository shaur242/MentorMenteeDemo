// Coordinator Pages
import React from 'react';
import PlaceholderPage from '../shared/PlaceholderPage';
import { Link2, FileText } from 'lucide-react';
import ConnectionsPage from '../connections/ConnectionsPage';
import SessionsPage from '../sessions/SessionsPage';

export { default as CoordMentorsPage } from './CoordMentorsPage';
export { default as CoordMenteesPage } from './CoordMenteesPage';
export { default as CoordPerformancePage } from './CoordPerformancePage';
export { default as CoordRequestsPage } from './CoordRequestsPage';
export { default as CoordAssignPage } from './CoordAssignPage';
export { default as CoordAllocationsPage } from './CoordAllocationsPage';
export { default as CoordReportsPage } from './CoordReportsPage';
export { default as CoordinatorGoalsPage } from './CoordinatorGoalsPage';

export function CoordSessionsPage() {
  return <SessionsPage />;
}
