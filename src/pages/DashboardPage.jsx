import React from 'react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import { LayoutDashboard, Clock } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Role-based analytics and management hub</p>
        </div>
        <Badge variant="navy">Ready for Implementation</Badge>
      </div>

      <Card>
        <div className="text-center py-12">
          <div className="w-12 h-12 bg-blue-50 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-navy-900 mb-1">Dashboard Route Ready</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
            This route is configured in React Router and will house the HOD, Coordinator, Mentor, and Mentee dashboards in upcoming steps.
          </p>
          <div className="inline-flex items-center gap-2 text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
            <Clock className="w-3.5 h-3.5" />
            <span>Awaiting Next Implementation Stage</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
