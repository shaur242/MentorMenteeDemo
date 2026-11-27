import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import OverviewPage from './pages/shared/OverviewPage';
import MentorDetailsPage from './pages/mentors/MentorDetailsPage';

// HOD Pages
import {
  HODCoordinatorsPage,
  HODMentorsPage,
  HODMenteesPage,
  HODAllocationsPage,
  HODSessionsPage,
  HODReportsPage,
  HODAnalyticsPage,
  HODGoalsPage,
} from './pages/hod/HodPages';

// Coordinator Pages
import {
  CoordMentorsPage,
  CoordMenteesPage,
  CoordRequestsPage,
  CoordAssignPage,
  CoordAllocationsPage,
  CoordSessionsPage,
  CoordReportsPage,
  CoordPerformancePage,
  CoordinatorGoalsPage,
} from './pages/coordinator/CoordinatorPages';

// Mentor Pages
import {
  MentorProfilePage,
  MentorMenteesPage,
  MentorConnectionsPage,
  MentorSessionsPage,
  MentorSessionReportsPage,
  MentorReviewsPage,
  MentorGoalsPage,
} from './pages/mentor/MentorPages';

// Mentee Pages
import {
  MenteeProfilePage,
  MenteeFindMentorsPage,
  MenteeMyMentorPage,
  MenteeProgressPage,
  MenteeRequestsPage,
  MenteeConnectionsPage,
  MenteeSessionsPage,
  MenteeReviewsPage,
  MenteeGoalsPage,
} from './pages/mentee/MenteePages';

// Admin Pages
import {
  AdminUsersPage,
  AdminAccountsPage,
} from './pages/admin/AdminPages';

/**
 * RootRoute component determines whether to send user to login or their role dashboard
 */
function RootRoute() {
  const { isAuthenticated, currentRole } = useApp();
  if (!isAuthenticated || !currentRole) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={`/${currentRole.toLowerCase()}/overview`} replace />;
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Root Route: Auto-redirects to dashboard or login */}
          <Route path="/" element={<RootRoute />} />

          {/* Protected Routes wrapper - requires authentication */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>

              {/* ── 1. HOD Routes (Role: HOD) ─────────────────────────── */}
              <Route element={<ProtectedRoute allowedRoles={['HOD']} />}>
                <Route path="hod/overview" element={<OverviewPage />} />
                <Route path="hod/coordinators" element={<HODCoordinatorsPage />} />
                <Route path="hod/mentors" element={<HODMentorsPage />} />
                <Route path="hod/mentors/:mentorId" element={<MentorDetailsPage />} />
                <Route path="hod/mentees" element={<HODMenteesPage />} />
                <Route path="hod/goals" element={<HODGoalsPage />} />
                <Route path="hod/allocations" element={<HODAllocationsPage />} />
                <Route path="hod/sessions" element={<HODSessionsPage />} />
                <Route path="hod/reports" element={<HODReportsPage />} />
                <Route path="hod/analytics" element={<HODAnalyticsPage />} />
              </Route>

              {/* ── 2. Coordinator Routes (Role: Coordinator) ─────────── */}
              <Route element={<ProtectedRoute allowedRoles={['Coordinator']} />}>
                <Route path="coordinator/overview" element={<OverviewPage />} />
                <Route path="coordinator/mentors" element={<CoordMentorsPage />} />
                <Route path="coordinator/mentors/:mentorId" element={<MentorDetailsPage />} />
                <Route path="coordinator/mentees" element={<CoordMenteesPage />} />
                <Route path="coordinator/goals" element={<CoordinatorGoalsPage />} />
                <Route path="coordinator/requests" element={<CoordRequestsPage />} />
                <Route path="coordinator/assign" element={<CoordAssignPage />} />
                <Route path="coordinator/allocations" element={<CoordAllocationsPage />} />
                <Route path="coordinator/sessions" element={<CoordSessionsPage />} />
                <Route path="coordinator/reports" element={<CoordReportsPage />} />
                <Route path="coordinator/performance" element={<CoordPerformancePage />} />
              </Route>

              {/* ── 3. Mentor Routes (Role: Mentor) ───────────────────── */}
              <Route element={<ProtectedRoute allowedRoles={['Mentor']} />}>
                <Route path="mentor/overview" element={<OverviewPage />} />
                <Route path="mentor/profile" element={<MentorProfilePage />} />
                <Route path="mentor/mentors/:mentorId" element={<MentorDetailsPage />} />
                <Route path="mentor/mentees" element={<MentorMenteesPage />} />
                <Route path="mentor/goals" element={<MentorGoalsPage />} />
                <Route path="mentor/connections" element={<MentorConnectionsPage />} />
                <Route path="mentor/sessions" element={<MentorSessionsPage />} />
                <Route path="mentor/session-reports" element={<MentorSessionReportsPage />} />
                <Route path="mentor/reviews" element={<MentorReviewsPage />} />
              </Route>

              {/* ── 4. Mentee Routes (Role: Mentee) ───────────────────── */}
              <Route element={<ProtectedRoute allowedRoles={['Mentee']} />}>
                <Route path="mentee/overview" element={<OverviewPage />} />
                <Route path="mentee/profile" element={<MenteeProfilePage />} />
                <Route path="mentee/find-mentors" element={<MenteeFindMentorsPage />} />
                <Route path="mentee/find-mentors/:mentorId" element={<MentorDetailsPage />} />
                <Route path="mentee/mentors/:mentorId" element={<MentorDetailsPage />} />
                <Route path="mentee/my-mentor" element={<MenteeMyMentorPage />} />
                <Route path="mentee/progress" element={<MenteeProgressPage />} />
                <Route path="mentee/goals" element={<MenteeGoalsPage />} />
                <Route path="mentee/requests" element={<MenteeRequestsPage />} />
                <Route path="mentee/connections" element={<MenteeConnectionsPage />} />
                <Route path="mentee/sessions" element={<MenteeSessionsPage />} />
                <Route path="mentee/reviews" element={<MenteeReviewsPage />} />
              </Route>

              {/* ── 5. Admin Routes (Role: Admin) ─────────────────────── */}
              <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
                <Route path="admin/overview" element={<OverviewPage />} />
                <Route path="admin/users" element={<AdminUsersPage />} />
                <Route path="admin/mentors/:mentorId" element={<MentorDetailsPage />} />
                <Route path="admin/accounts" element={<AdminAccountsPage />} />
              </Route>

            </Route>
          </Route>

          {/* 404 Fallback for any unknown path */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
