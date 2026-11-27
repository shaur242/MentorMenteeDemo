import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Menu, User, Settings, LogOut } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { roleNavConfig } from '../../config/navConfig';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import RoleSwitcher from './RoleSwitcher';
import NotificationPanel from '../common/NotificationPanel';
import Dropdown, { DropdownItem } from '../common/Dropdown';

export default function Navbar() {
  const { currentUser, currentRole, unreadCount, setMobileSidebarOpen, logout } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);

  // Derive current page title from nav config
  const navItems = roleNavConfig[currentRole] || [];
  const activeItem = navItems.find(
    (item) => location.pathname === item.path || location.pathname.startsWith(item.path + '/')
  );
  const pageTitle = activeItem?.label || 'Dashboard';

  // Breadcrumbs
  const pathParts = location.pathname.split('/').filter(Boolean);

  const handleProfileClick = () => {
    if (currentRole === 'Mentor') {
      navigate('/mentor/profile');
    } else if (currentRole === 'Mentee') {
      navigate('/mentee/profile');
    } else {
      navigate(`/${currentRole?.toLowerCase() || 'hod'}/overview`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 lg:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 flex-shrink-0">
      {/* Left: Mobile menu + Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          className="lg:hidden p-2 text-slate-500 hover:text-navy-900 hover:bg-slate-100 rounded-lg transition-colors"
          onClick={() => setMobileSidebarOpen(true)}
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-navy-900 truncate">{pageTitle}</h2>
          {pathParts.length > 1 && (
            <p className="text-[10px] text-slate-400 capitalize hidden sm:block">
              {pathParts.map((p) => p.replace(/-/g, ' ')).join(' › ')}
            </p>
          )}
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Role Switcher */}
        <RoleSwitcher />

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className="relative p-2 text-slate-500 hover:text-navy-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full ring-2 ring-white" />
            )}
          </button>
          <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
        </div>

        {/* Profile Dropdown */}
        <Dropdown
          align="right"
          trigger={
            <button className="flex items-center gap-2.5 p-1.5 hover:bg-slate-100 rounded-xl transition-colors text-left">
              <Avatar user={currentUser} size="sm" />
              <div className="hidden md:block">
                <p className="text-xs font-semibold text-navy-900 leading-tight truncate max-w-[120px]">
                  {currentUser?.name || 'User'}
                </p>
                <p className="text-[10px] text-slate-500 leading-tight truncate max-w-[120px]">
                  {currentUser?.email || ''}
                </p>
              </div>
            </button>
          }
        >
          <div className="px-4 py-3 border-b border-slate-100">
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="text-xs font-semibold text-navy-900 truncate">{currentUser?.name}</p>
              {currentRole && <Badge role={currentRole} size="sm">{currentRole}</Badge>}
            </div>
            <p className="text-[10px] text-slate-500 truncate">{currentUser?.email}</p>
            {currentUser?.department && (
              <p className="text-[10px] text-slate-400 truncate mt-0.5">{currentUser.department}</p>
            )}
          </div>
          <DropdownItem icon={User} onClick={handleProfileClick}>
            My Profile
          </DropdownItem>
          <div className="border-t border-slate-100 my-1" />
          <DropdownItem icon={LogOut} danger onClick={handleLogout}>
            Sign Out
          </DropdownItem>
        </Dropdown>
      </div>
    </header>
  );
}
