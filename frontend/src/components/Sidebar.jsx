import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: 'dashboard' },
  { label: 'Customers', to: '/customers', icon: 'customers' },
  { label: 'Jobs', to: '/jobs', icon: 'jobs' },
  { label: 'Quotations', to: '/quotations', icon: 'quotations' },
  { label: 'Finance', to: '/finance', icon: 'finance' },
  { label: 'Reports', to: '/reports', icon: 'reports' },
];

const iconMap = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path d="M4 4.5h7v7H4zm9 0h7v4.5h-7zm0 8.5h7V19h-7zM4 13.5h7V19H4z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  customers: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.5 18.5v-1a4 4 0 0 1 4-4h3a4 4 0 0 1 4 4v1" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16.5 9.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.5 18.5v-1a3 3 0 0 0-2.4-2.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  jobs: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path d="M7 4.5h10a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6.5a2 2 0 0 1 2-2Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 3.5v3M15 3.5v3M7 10.5h10M9.5 14.5h5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  quotations: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path d="M8 3.5h6l5 5V18a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5.5a2 2 0 0 1 2-2Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 3.5V9h5M8 13h8M8 17h6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  finance: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path d="M4 18.5h16" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 15V9.5M12 15V6M17 15v-5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 9.5c0-1.7 1.3-3 3-3h4c1.7 0 3 1.3 3 3v1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  reports: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path d="M5 17.5V10m7 7.5V5m7 12.5v-8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.5 19.5h17" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 10h4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

const Sidebar = ({ user, onLogout }) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const username = user?.username || 'User';
  const profileName = username.replace(/\d+$/, '') || username;
  const email = user?.email || 'No email available';
  const initials = profileName.slice(0, 2).toUpperCase();

  return (
    <aside
      className={[
        'relative flex h-screen flex-col border-r border-slate-200 bg-[#f4f4f5] p-4 text-slate-700 shadow-sm transition-all duration-200',
        collapsed ? 'w-[88px]' : 'w-[280px]',
      ].join(' ')}
    >
      <div className="flex items-center gap-3 px-2 py-2">
        {collapsed ? (
          <div className="flex w-full items-center justify-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500 text-lg font-bold text-white shadow-sm">
              W
            </div>
          </div>
        ) : (
          <>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500 text-lg font-bold text-white shadow-sm">
              W
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-slate-800">WELD CRM</div>
              <div className="text-[15px] text-slate-500">Sarath</div>
            </div>
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 shadow-sm"
              aria-label="Collapse sidebar"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
                <path d="M15 7l-5 5 5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </>
        )}

        {collapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            className="absolute right-2 top-4 z-10 flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 shadow-sm"
            aria-label="Expand sidebar"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
              <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>

      {!collapsed && (
        <div className="relative mt-5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400">
            <circle cx="11" cy="11" r="5.5" />
            <path d="M16 16l4 4" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value="Search"
            readOnly
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-500 outline-none ring-0"
          />
        </div>
      )}

      <nav className={['mt-5 space-y-1.5', collapsed ? 'flex flex-col items-center' : ''].join(' ')}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.to || (item.to === '/dashboard' && location.pathname === '/');

          return (
            <Link
              key={item.to}
              to={item.to}
              title={collapsed ? item.label : undefined}
              className={[
                'flex items-center rounded-xl text-sm font-medium transition-all',
                collapsed ? 'h-11 w-11 justify-center px-0' : 'gap-3 px-3 py-2.5',
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200/80 hover:text-slate-800',
              ].join(' ')}
            >
              <span className={isActive ? 'text-white' : 'text-slate-500'}>{iconMap[item.icon]}</span>
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && item.label === 'Dashboard' && (
                <span className="ml-auto rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700">
                  10
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="relative mt-auto pb-2">
        {collapsed ? (
          <button
            type="button"
            onClick={() => setProfileOpen((prev) => !prev)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-200 to-amber-400 text-xs font-bold text-slate-700 shadow-sm"
            aria-label="User menu"
          >
            {initials}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setProfileOpen((prev) => !prev)}
            className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm"
            aria-label="Open profile menu"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-200 to-amber-400 text-xs font-bold text-slate-700">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-slate-800">{profileName}</div>
              <div className="truncate text-[11px] text-slate-500">{email}</div>
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
                <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </button>
        )}

        {profileOpen && (
          <div className="absolute bottom-[calc(100%+12px)] left-0 z-10 w-44 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
            <button
              type="button"
              onClick={() => {
                setProfileOpen(false);
                onLogout?.();
              }}
              className="flex w-full items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;