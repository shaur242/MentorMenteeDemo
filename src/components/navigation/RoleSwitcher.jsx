import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Sparkles, Check, ChevronRight, RotateCcw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { mockUsers } from '../../data/mockData';
import Badge from '../common/Badge';
import Avatar from '../common/Avatar';

const ROLES = ['HOD', 'Coordinator', 'Mentor', 'Mentee'];

export default function RoleSwitcher() {
  const { currentRole, currentUser, switchDemoUser, coordinators, mentors, mentees, resetToInitialDemoData } = useApp();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(currentRole || 'Mentor');
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Keep tab aligned when role changes externally
  useEffect(() => {
    if (currentRole) setActiveTab(currentRole);
  }, [currentRole]);

  const handleSelectUser = (user) => {
    switchDemoUser(user);
    setOpen(false);
    navigate(`/${user.role.toLowerCase()}/overview`, { replace: true });
  };

  const usersForActiveTab =
    activeTab === 'Coordinator'
      ? coordinators || []
      : activeTab === 'Mentor'
      ? mentors || []
      : activeTab === 'Mentee'
      ? mentees || []
      : mockUsers.filter((u) => u.role === activeTab);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Trigger Button with clear DEMO badge */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-lg transition-all text-xs font-medium text-slate-700 shadow-sm"
        title="Demo Account Switcher (Testing Feature)"
      >
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wider">
          Demo
        </span>
        <span className="hidden sm:inline text-slate-500 font-normal">Switch:</span>
        {currentRole && <Badge role={currentRole} size="sm">{currentRole}</Badge>}
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {/* Popover Dropdown Panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-navy-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-white">
                  Demo Account Switcher
                </p>
                <p className="text-[10px] text-navy-300">
                  Switch active user & testing persona
                </p>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-navy-800 text-navy-200 border border-navy-700">
              16 Accounts
            </span>
          </div>

          {/* Role Filter Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50 p-1.5 gap-1 overflow-x-auto">
            {ROLES.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setActiveTab(role)}
                className={`flex-1 py-1 px-2 text-[11px] font-semibold rounded-md transition-colors text-center whitespace-nowrap ${
                  activeTab === role
                    ? 'bg-white text-navy-900 shadow-xs border border-slate-200'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          {/* Users List for Selected Role */}
          <div className="p-2 max-h-64 overflow-y-auto space-y-1 divide-y divide-slate-100">
            {usersForActiveTab.map((account) => {
              const isCurrent = currentUser?.id === account.id;
              return (
                <button
                  key={account.id}
                  onClick={() => handleSelectUser(account)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-left ${
                    isCurrent
                      ? 'bg-brand-50/80 border border-brand-200'
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar user={account} size="sm" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-semibold text-navy-900 truncate">
                          {account.name}
                        </p>
                        {isCurrent && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">
                        {account.email}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {account.title || account.year || account.cohort || account.department}
                      </p>
                    </div>
                  </div>

                  <div className="flex-shrink-0 ml-2">
                    {isCurrent ? (
                      <Check className="w-4 h-4 text-brand-600" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer Notice & Reset Option */}
          <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span>Instant demo role switching</span>
            <button
              onClick={() => {
                resetToInitialDemoData();
                setOpen(false);
              }}
              className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-800 font-semibold"
              title="Reset mock data to initial demo state"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
