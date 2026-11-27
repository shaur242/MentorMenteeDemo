import React from 'react';
import { Clock } from 'lucide-react';
import Card from '../../components/common/Card';
import PageHeader from '../../components/common/PageHeader';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';

/**
 * Generic placeholder page – pass icon, title, description, role, breadcrumbs.
 * Used for every nav item that isn't implemented yet.
 */
export default function PlaceholderPage({
  icon: Icon = Clock,
  title = 'Coming Soon',
  description = 'This section will be implemented in an upcoming step.',
  role,
  breadcrumbs = [],
  features = [],
}) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} subtitle={description} breadcrumbs={breadcrumbs}>
        <Badge variant="default" size="sm">Coming in next step</Badge>
      </PageHeader>

      <Card noPad>
        <EmptyState
          icon={Icon}
          title={`${title} Module`}
          description={description}
        />
      </Card>

      {features.length > 0 && (
        <Card title="Planned Features for this Section">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {features.map((f, i) => (
              <li key={i} className="flex items-start gap-2 p-3 rounded-lg bg-slate-50 border border-slate-100 text-sm text-slate-600">
                <Clock className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
