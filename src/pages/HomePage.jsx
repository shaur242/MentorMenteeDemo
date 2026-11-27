import React from 'react';
import {
  CheckCircle2,
  Layers,
  ShieldCheck,
  Users,
  Compass,
  Calendar,
  Sparkles,
  ArrowRight,
  Code2,
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { Link } from 'react-router-dom';

export default function HomePage() {
  const setupChecklist = [
    { title: 'Vite + React.js Project Initialized', status: 'Completed', detail: 'Fast modern build tooling with React 19' },
    { title: 'Tailwind CSS Configured', status: 'Completed', detail: 'Custom navy/blue academic theme and design tokens' },
    { title: 'React Router v7 Configured', status: 'Completed', detail: 'Multi-page architecture with nested layouts' },
    { title: 'Lucide React Icons Integrated', status: 'Completed', detail: 'Clean, consistent SVG icon set' },
    { title: 'Modular Architecture Created', status: 'Completed', detail: 'Components, layouts, pages, hooks, data, utils' },
    { title: 'Mock State & Local Storage Ready', status: 'Completed', detail: 'Prepared for client-side persistence' },
  ];

  const roles = [
    { name: 'HOD', desc: 'Department-wide oversight, allocations, and high-level reports', badge: 'purple' },
    { name: 'Coordinator', desc: 'Mentor approvals, cohort tracking, and scheduling management', badge: 'navy' },
    { name: 'Mentor', desc: 'Profile details, availability, session requests, and ratings', badge: 'success' },
    { name: 'Mentee', desc: 'Mentor discovery, session booking, progress tracking', badge: 'warning' },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-brand-900 rounded-2xl p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-200 border border-brand-400/30 text-xs font-medium mb-4">
            <Sparkles className="w-3.5 h-3.5 text-brand-300" />
            Project Setup Verified & Active
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            Mentor–Mentee Learning Platform
          </h1>
          <p className="text-navy-200 text-sm leading-relaxed mb-6">
            A modern, frontend-first SaaS platform designed for university academic departments.
            Built with React, Vite, Tailwind CSS, and React Router to power streamlined mentorship,
            session scheduling, and departmental monitoring.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/dashboard">
              <Button variant="primary" icon={ArrowRight}>
                Explore Route Architecture
              </Button>
            </Link>
            <div className="text-xs text-navy-300 flex items-center gap-2 px-3 py-2 bg-navy-950/40 rounded-lg border border-navy-700/50">
              <Code2 className="w-4 h-4 text-brand-300" />
              <span>Ready for Phase 2 Workflows</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Setup Checklist & Role Readiness */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Setup Verification Checklist */}
        <div className="lg:col-span-2">
          <Card
            title="Setup Verification Checklist"
            subtitle="Core foundational setup and dependency status"
          >
            <div className="space-y-4">
              {setupChecklist.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between p-3.5 rounded-lg bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-navy-900">{item.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{item.detail}</p>
                    </div>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* User Roles Prepared */}
        <div>
          <Card
            title="Supported User Roles"
            subtitle="Multi-role architecture for future dashboards"
          >
            <div className="space-y-3">
              {roles.map((role, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-slate-100 bg-white">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-navy-900">{role.name}</span>
                    <Badge variant={role.badge}>{role.name}</Badge>
                  </div>
                  <p className="text-xs text-slate-500">{role.desc}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Architecture Highlights */}
      <Card title="Modular Project Structure">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
            <Layers className="w-5 h-5 text-brand-600 mb-2" />
            <h4 className="text-sm font-semibold text-navy-900">Components & Layouts</h4>
            <p className="text-xs text-slate-500 mt-1">
              Reusable UI atoms (Cards, Badges, Buttons) and responsive master layouts with sidebar and topbar.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
            <Compass className="w-5 h-5 text-brand-600 mb-2" />
            <h4 className="text-sm font-semibold text-navy-900">React Router v7</h4>
            <p className="text-xs text-slate-500 mt-1">
              Configured client-side routing ready for seamless page transitions and deep navigation.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
            <ShieldCheck className="w-5 h-5 text-brand-600 mb-2" />
            <h4 className="text-sm font-semibold text-navy-900">State & Persistence</h4>
            <p className="text-xs text-slate-500 mt-1">
              Custom `useLocalStorage` hooks and mock data schemas structured for easy eventual backend integration.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
