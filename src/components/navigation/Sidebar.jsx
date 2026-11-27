import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { roleNavConfig } from '../../config/navConfig';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';

export default function Sidebar() {
  const {
    currentRole,
    currentUser,
    sidebarOpen,
    setSidebarOpen,
    mobileSidebarOpen,
    setMobileSidebarOpen,
    logout,
  } = useApp();
  const navItems = roleNavConfig[currentRole] || [];
  const navigate = useNavigate();

  const handleLogout = () => {
    setMobileSidebarOpen(false);
    logout();
    navigate('/login', { replace: true });
  };

  const NavItems = () => (
    <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setMobileSidebarOpen(false)}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
              ${isActive
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-navy-200 hover:text-white hover:bg-navy-800/70'
              }
              ${!sidebarOpen ? 'justify-center' : ''}`
            }
            title={!sidebarOpen ? item.label : undefined}
          >
            <Icon className="w-[18px] h-[18px] flex-shrink-0" />
            {sidebarOpen && <span className="truncate">{item.label}</span>}
          </NavLink>
        );
      })}
    </nav>
  );

  // Shared sidebar inner content
  const SidebarContent = ({ mobile = false }) => (
    <div
      className={`flex flex-col h-full bg-navy-900 ${
        mobile ? 'w-72' : sidebarOpen ? 'w-64' : 'w-[72px]'
      } transition-all duration-300`}
    >
      {/* Brand Header */}
      <div
        className={`h-16 flex items-center border-b border-navy-800 flex-shrink-0 ${
          sidebarOpen || mobile ? 'px-4 gap-3 justify-between' : 'justify-center'
        }`}
      >
        <div className={`flex items-center gap-3 ${!sidebarOpen && !mobile ? 'justify-center w-full' : ''}`}>
          <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          {(sidebarOpen || mobile) && (
            <div className="min-w-0">
              <h1 className="font-bold text-sm text-white leading-tight">MentorHub</h1>
              <p className="text-[10px] text-navy-400 font-medium tracking-wider uppercase leading-tight">
                Learning Platform
              </p>
            </div>
          )}
        </div>
        {/* Mobile close */}
        {mobile && (
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="p-1.5 text-navy-400 hover:text-white hover:bg-navy-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {/* Desktop collapse toggle */}
        {!mobile &&
          (sidebarOpen ? (
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 text-navy-400 hover:text-white hover:bg-navy-800 rounded-lg transition-colors"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          ) : null)}
      </div>

      {/* Role badge and User info */}
      {(sidebarOpen || mobile) && (
        <div className="px-4 pt-4 pb-2">
          <div className="bg-navy-800/60 rounded-lg px-3 py-2.5 flex items-center gap-2.5 border border-navy-700/50">
            <Avatar user={currentUser} size="sm" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{currentUser?.name || 'User'}</p>
              {currentRole && (
                <Badge role={currentRole} size="sm" className="mt-0.5">
                  {currentRole}
                </Badge>
              )}
            </div>
          </div>
        </div>
      )}
      {!sidebarOpen && !mobile && (
        <div className="px-3 pt-3 pb-1 flex justify-center">
          <Avatar user={currentUser} size="sm" />
        </div>
      )}

      {/* Nav section label */}
      {(sidebarOpen || mobile) && (
        <div className="px-6 pt-4 pb-1">
          <p className="text-[10px] font-semibold tracking-widest text-navy-500 uppercase">Menu</p>
        </div>
      )}

      <NavItems />

      {/* Footer / Logout */}
      <div
        className={`flex-shrink-0 border-t border-navy-800 ${
          sidebarOpen || mobile ? 'p-4' : 'p-3 flex justify-center'
        }`}
      >
        {sidebarOpen || mobile ? (
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-navy-400 hover:text-rose-400 transition-colors w-full px-2 py-2 rounded-lg hover:bg-navy-800/50 text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        ) : (
          <button
            onClick={handleLogout}
            className="p-2 text-navy-400 hover:text-rose-400 hover:bg-navy-800/50 rounded-lg transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-shrink-0 h-screen sticky top-0 overflow-hidden">
        <SidebarContent />
        {/* Expand button when collapsed */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute left-[52px] top-5 z-10 w-6 h-6 bg-navy-700 hover:bg-brand-600 rounded-full border border-navy-600 flex items-center justify-center transition-colors shadow"
            title="Expand sidebar"
          >
            <ChevronRight className="w-3 h-3 text-white" />
          </button>
        )}
      </div>

      {/* Mobile sidebar drawer */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative flex-shrink-0">
            <SidebarContent mobile />
          </div>
        </div>
      )}
    </>
  );
}
