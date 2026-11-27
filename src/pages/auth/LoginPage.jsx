import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
  GraduationCap,
  Eye,
  EyeOff,
  Lock,
  Mail,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { mockUsers } from '../../data/mockData';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';

export default function LoginPage() {
  const { login, loginAsUser, isAuthenticated, currentRole, coordinators, mentors, mentees } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  // If already logged in, redirect straight to their dashboard
  if (isAuthenticated && currentRole) {
    const destination = location.state?.from?.pathname || `/${currentRole.toLowerCase()}/overview`;
    return <Navigate to={destination} replace />;
  }

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Demo selector tabs state
  const [activeDemoRole, setActiveDemoRole] = useState('Mentor');
  const demoRoles = ['HOD', 'Coordinator', 'Mentor', 'Mentee', 'Admin'];

  const getAccountsForRole = (role) => {
    if (role === 'Coordinator') return coordinators || [];
    if (role === 'Mentor') return mentors || [];
    if (role === 'Mentee') return mentees || [];
    return mockUsers.filter((u) => u.role === role);
  };

  // Filter users by active tab
  const accountsForRole = getAccountsForRole(activeDemoRole);
  const [selectedDemoUser, setSelectedDemoUser] = useState(accountsForRole[0] || mockUsers[0]);

  // When tab changes, pick first user of that role
  const handleRoleTabChange = (role) => {
    setActiveDemoRole(role);
    const users = getAccountsForRole(role);
    if (users.length > 0) {
      setSelectedDemoUser(users[0]);
    }
  };

  const handleManualLogin = (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your university email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = login(email, password, rememberMe);
      setLoading(false);
      if (res.success) {
        const dest = location.state?.from?.pathname || `/${res.user.role.toLowerCase()}/overview`;
        navigate(dest, { replace: true });
      } else {
        setError(res.error);
      }
    }, 250);
  };

  const handleInstantDemoLogin = (user) => {
    setError('');
    setLoading(true);
    setTimeout(() => {
      const res = loginAsUser(user);
      setLoading(false);
      if (res.success) {
        const dest = location.state?.from?.pathname || `/${user.role.toLowerCase()}/overview`;
        navigate(dest, { replace: true });
      }
    }, 150);
  };

  const handleFillCredentials = (user) => {
    setEmail(user.email);
    setPassword(user.password);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      {/* Top Banner Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-navy-900 flex items-center justify-center text-white shadow-sm">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base text-navy-900 leading-tight">MentorHub</h1>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
              University Learning Platform
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <Badge variant="navy" size="sm">Demo Environment</Badge>
          <span className="text-xs text-slate-400">All 5 Academic Roles Configured</span>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Login Form */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="mb-6">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200 mb-3">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                Sign In to Platform
              </span>
              <h2 className="text-2xl font-bold text-navy-900 tracking-tight">Welcome Back</h2>
              <p className="text-sm text-slate-500 mt-1">
                Enter your credentials or choose a quick demo account to access your dashboard.
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <form onSubmit={handleManualLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  University Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. mentor.chen@university.edu"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  <span className="text-[11px] text-slate-400 font-normal">
                    Demo: <span className="font-mono text-slate-600">password123</span>
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-600 border-slate-300 focus:ring-brand-500"
                  />
                  <span className="text-xs text-slate-600">Remember session</span>
                </label>
                <button
                  type="button"
                  onClick={() => handleFillCredentials(mockUsers.find(u => u.role === activeDemoRole) || mockUsers[0])}
                  className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                >
                  Auto-fill demo
                </button>
              </div>

              <Button
                type="submit"
                variant="navy"
                size="md"
                loading={loading}
                className="w-full py-2.5 mt-2"
                iconRight={ArrowRight}
              >
                Sign In to Platform
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                Need demo assistance? Select any of the 16 pre-configured roles on the right to sign in instantly.
              </p>
            </div>
          </div>

          {/* Right Column: Demo Accounts Hub */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  Instant Demo Login (No Typing Required)
                </div>
                <h3 className="text-lg font-bold text-navy-900">Select Role & Demo Account</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Switch between 16 academic profiles across all 5 user tiers.
                </p>
              </div>
              <Badge variant="navy">{accountsForRole.length} Account{accountsForRole.length > 1 ? 's' : ''}</Badge>
            </div>

            {/* Role Tabs */}
            <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-xl mb-5">
              {demoRoles.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleRoleTabChange(role)}
                  className={`flex-1 min-w-[80px] py-2 px-3 text-xs font-semibold rounded-lg transition-all text-center ${
                    activeDemoRole === role
                      ? 'bg-white text-navy-900 shadow-sm'
                      : 'text-slate-600 hover:text-navy-900 hover:bg-slate-200/60'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            {/* User List for this Role */}
            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
              {accountsForRole.map((account) => {
                const isSelected = selectedDemoUser?.id === account.id;
                return (
                  <div
                    key={account.id}
                    onClick={() => setSelectedDemoUser(account)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/40 ring-1 ring-brand-500'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar user={account} size="md" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-navy-900 truncate">
                            {account.name}
                          </p>
                          <Badge role={account.role} size="sm">
                            {account.role}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {account.email}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {account.title || account.year || account.cohort || account.department}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFillCredentials(account);
                        }}
                        className="hidden sm:inline-flex px-2.5 py-1.5 text-xs text-slate-600 hover:text-navy-900 hover:bg-slate-100 rounded-lg border border-slate-200 font-medium transition-colors"
                        title="Fill login form fields"
                      >
                        Fill Form
                      </button>
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInstantDemoLogin(account);
                        }}
                        loading={loading && selectedDemoUser?.id === account.id}
                        iconRight={ArrowRight}
                      >
                        Sign In
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected User Details Banner */}
            {selectedDemoUser && (
              <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-semibold text-navy-900">Selected: {selectedDemoUser.name}</span>
                  <p className="text-slate-500 mt-0.5">
                    {selectedDemoUser.bio || selectedDemoUser.goals || selectedDemoUser.department}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <Button
                    variant="navy"
                    size="sm"
                    onClick={() => handleInstantDemoLogin(selectedDemoUser)}
                    loading={loading}
                    iconRight={ArrowRight}
                  >
                    Quick Sign In as {selectedDemoUser.role}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        MentorHub · Mentor–Mentee University Learning Platform · Frontend Demonstration (Mock State & Local Storage)
      </footer>
    </div>
  );
}
