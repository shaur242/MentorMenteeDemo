// Admin Pages
import React from 'react';
import PlaceholderPage from '../shared/PlaceholderPage';
import { Users, Shield } from 'lucide-react';

export function AdminUsersPage() {
  return (
    <PlaceholderPage
      icon={Users}
      title="Users"
      description="View and manage all user accounts across the platform."
      breadcrumbs={['Admin', 'Users']}
      features={[
        'Search and filter users by role and status',
        'Create, edit, and deactivate accounts',
        'Reset user passwords',
        'View user activity logs',
      ]}
    />
  );
}

export function AdminAccountsPage() {
  return (
    <PlaceholderPage
      icon={Shield}
      title="Account Management"
      description="Configure roles, permissions, and system-wide account settings."
      breadcrumbs={['Admin', 'Account Management']}
      features={[
        'Role and permission configuration',
        'Bulk user operations',
        'Account audit and security logs',
        'System settings and configuration',
      ]}
    />
  );
}
