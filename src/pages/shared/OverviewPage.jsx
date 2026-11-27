import React from 'react';
import { useApp } from '../../context/AppContext';
import { mockStats } from '../../data/mockData';
import { roleNavConfig } from '../../config/navConfig';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import PageHeader from '../../components/common/PageHeader';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import {
  Users, Calendar, TrendingUp, Clock, CheckCircle2, AlertCircle,
  BarChart2, UserCheck, FileText, Layers,
} from 'lucide-react';

const statIcons = [
  { icon: Users, iconColor: 'text-blue-600', iconBg: 'bg-blue-50' },
  { icon: UserCheck, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50' },
  { icon: Calendar, iconColor: 'text-purple-600', iconBg: 'bg-purple-50' },
  { icon: TrendingUp, iconColor: 'text-amber-600', iconBg: 'bg-amber-50' },
];

const recentActivity = [
  { id: 1, action: 'New connection request submitted', user: 'Alex Johnson', time: '5 min ago', type: 'request' },
  { id: 2, action: 'Session completed successfully', user: 'Dr. Emily Chen', time: '1 hr ago', type: 'session' },
  { id: 3, action: 'Monthly report generated', user: 'Prof. David Vance', time: '3 hr ago', type: 'report' },
  { id: 4, action: 'New mentee allocated', user: 'System Admin', time: 'Yesterday', type: 'allocation' },
  { id: 5, action: 'Review submitted by mentee', user: 'Alex Johnson', time: 'Yesterday', type: 'review' },
];

const typeConfig = {
  request: { color: 'bg-blue-100 text-blue-700', label: 'Request' },
  session: { color: 'bg-emerald-100 text-emerald-700', label: 'Session' },
  report: { color: 'bg-purple-100 text-purple-700', label: 'Report' },
  allocation: { color: 'bg-amber-100 text-amber-700', label: 'Allocation' },
  review: { color: 'bg-rose-100 text-rose-700', label: 'Review' },
};

import HODDashboard from '../hod/HODDashboard';
import CoordinatorDashboard from '../coordinator/CoordinatorDashboard';

export default function OverviewPage() {
  const { currentRole, currentUser } = useApp();

  if (currentRole === 'HOD') {
    return <HODDashboard />;
  }

  if (currentRole === 'Coordinator') {
    return <CoordinatorDashboard />;
  }

  const stats = mockStats[currentRole] || [];

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting()}, ${currentUser?.name?.split(' ')[0] ?? 'User'}`}
        subtitle={`${currentRole} Dashboard · ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`}
        breadcrumbs={[currentRole, 'Overview']}
      >
        <Badge role={currentRole} size="lg">{currentRole}</Badge>
      </PageHeader>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const ic = statIcons[i % statIcons.length];
          return (
            <StatCard
              key={i}
              label={stat.label}
              value={stat.value}
              change={stat.change}
              trend={stat.trend}
              icon={ic.icon}
              iconColor={ic.iconColor}
              iconBg={ic.iconBg}
            />
          );
        })}
      </div>

      {/* Activity + Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card
          title="Recent Activity"
          subtitle="Latest events across the platform"
          className="lg:col-span-2"
          noPad
        >
          <div className="divide-y divide-slate-100">
            {recentActivity.map((item) => {
              const tc = typeConfig[item.type] || typeConfig.request;
              return (
                <div key={item.id} className="flex items-start gap-3 px-6 py-3.5">
                  <div className={`mt-0.5 px-2 py-0.5 rounded text-[10px] font-semibold flex-shrink-0 ${tc.color}`}>
                    {tc.label}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-navy-900 font-medium truncate">{item.action}</p>
                    <p className="text-xs text-slate-400 mt-0.5">by {item.user}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 flex-shrink-0 mt-0.5">{item.time}</span>
                </div>
              );
            })}
          </div>
          <div className="px-6 py-3 border-t border-slate-100">
            <button className="text-xs text-brand-600 hover:text-brand-700 font-medium">View all activity →</button>
          </div>
        </Card>

        {/* Quick Info Panel */}
        <div className="space-y-4">
          <Card title="Your Profile">
            <div className="flex flex-col items-center text-center gap-3">
              <Avatar user={currentUser} size="xl" />
              <div>
                <p className="text-sm font-semibold text-navy-900">{currentUser?.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{currentUser?.department}</p>
                <Badge role={currentRole} size="sm" className="mt-2">{currentRole}</Badge>
              </div>
              <div className="w-full border-t border-slate-100 pt-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Email</span>
                  <span className="text-slate-700 font-medium truncate max-w-[140px]">{currentUser?.email}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Joined</span>
                  <span className="text-slate-700 font-medium">{currentUser?.joinedYear}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Platform Status">
            <div className="space-y-2.5">
              {[
                { label: 'API Status', status: 'Operational', ok: true },
                { label: 'Database', status: 'Connected', ok: true },
                { label: 'Storage', status: 'Available', ok: true },
                { label: 'Notifications', status: 'Active', ok: true },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-xs text-slate-600">{s.label}</span>
                  <span className={`flex items-center gap-1 text-xs font-medium ${s.ok ? 'text-emerald-600' : 'text-rose-600'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${s.ok ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
