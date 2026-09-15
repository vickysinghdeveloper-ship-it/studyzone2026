import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Armchair,
  Clock,
  UserCheck,
  CreditCard,
  TrendingDown,
  Bell,
  MessageSquare,
  UserPlus,
  Package,
  FileSpreadsheet,
  Settings,
  LogOut,
  Menu,
  X,
  Server,
  Building2,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Crown
} from 'lucide-react';
import { LibrarySettings, User, AdminPermission } from '../../types';

interface DashboardLayoutProps {
  settings: LibrarySettings;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onLogout: () => void;
  currentUser: User | null;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  settings,
  activeTab,
  onSelectTab,
  onLogout,
  currentUser,
  children
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isOwner = currentUser?.role === 'owner';
  const isAdmin = currentUser?.role === 'admin';

  const allNavItems = [
    { id: 'dashboard', label: 'Executive Overview', icon: LayoutDashboard },
    ...(isOwner ? [{ id: 'admins', label: 'Admin Management', icon: ShieldCheck, isNew: true }] : []),
    { id: 'students', label: 'Student Directory', icon: Users },
    { id: 'plans', label: 'Time Slots', icon: Clock },
    { id: 'seats', label: 'Visual Seat Map', icon: Armchair },
    { id: 'attendance', label: 'Attendance & QR', icon: UserCheck },
    { id: 'payments', label: 'Fee Collections', icon: CreditCard },
    { id: 'expenses', label: 'Library Expenses', icon: TrendingDown },
    { id: 'notices', label: 'Notice Board', icon: Bell },
    { id: 'complaints', label: 'Student Complaints', icon: MessageSquare },
    { id: 'visitors', label: 'Visitor Logs', icon: UserPlus },
    { id: 'inventory', label: 'Assets & Inventory', icon: Package },
    { id: 'reports', label: 'Reports & Export', icon: FileSpreadsheet },
    { id: 'settings', label: 'Hostinger Export & Config', icon: Settings }
  ];

  // Filter based on admin's permissions
  const navItems = isOwner
    ? allNavItems
    : allNavItems.filter((item) => {
        if (item.id === 'admins') return false; // Normal admins never access Admin Management
        return (currentUser?.permissions || []).includes(item.id as AdminPermission);
      });

  // If currently active tab is not in allowed nav items, redirect to first allowed tab
  useEffect(() => {
    if (navItems.length > 0 && !navItems.some((item) => item.id === activeTab)) {
      onSelectTab(navItems[0].id);
    }
  }, [activeTab, navItems, onSelectTab]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between transition-transform duration-300 ease-in-out border-r border-slate-800 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 space-y-6 overflow-y-auto">
          {/* Brand Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg ${
                  isOwner
                    ? 'bg-gradient-to-tr from-amber-500 to-amber-600 shadow-amber-500/25'
                    : 'bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-blue-500/30'
                }`}
              >
                {isOwner ? <Crown className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
              </div>
              <div className="min-w-0">
                <h2 className="font-extrabold text-sm text-white truncate max-w-[130px]">
                  {settings.libraryName}
                </h2>
                <span
                  className={`text-[10px] font-extrabold block uppercase tracking-wider ${
                    isOwner ? 'text-amber-400' : 'text-blue-400'
                  }`}
                >
                  {isOwner ? 'Library Owner' : `Admin: ${currentUser?.name?.split(' ')[0] || 'Staff'}`}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Role Status Tag */}
          <div
            className={`p-2.5 rounded-2xl border text-xs flex items-center justify-between ${
              isOwner
                ? 'bg-amber-950/40 border-amber-800/60 text-amber-200'
                : 'bg-indigo-950/40 border-indigo-800/60 text-indigo-200'
            }`}
          >
            <div className="flex items-center space-x-2 truncate">
              {isOwner ? (
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-indigo-400 shrink-0" />
              )}
              <span className="truncate font-bold">
                {isOwner ? 'Full Master Access' : `${navItems.length} Modules Permitted`}
              </span>
            </div>
          </div>

          {/* Nav List */}
          <nav className="space-y-1 text-xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isAdminsTab = item.id === 'admins';

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-semibold transition-all cursor-pointer ${
                    isActive
                      ? isAdminsTab
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30'
                        : 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : isAdminsTab
                      ? 'bg-slate-800/60 hover:bg-slate-800 text-blue-300 font-bold border border-blue-900/40'
                      : 'hover:bg-slate-800 hover:text-white text-slate-400'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isAdminsTab && !isActive ? 'text-blue-400' : ''
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {item.isNew && !isActive && (
                      <span className="px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-[9px] font-black uppercase">
                        Owner
                      </span>
                    )}
                    {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center space-x-2 text-[11px]">
            <Server className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="truncate">
              <span className="block font-bold text-white">Hostinger PHP Ready</span>
              <span className="text-[10px] text-slate-400">Zero Cloud Dependency</span>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 font-bold text-xs transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out ({isOwner ? 'Owner' : currentUser?.name || 'Admin'})</span>
          </button>
        </div>
      </aside>

      {/* Main Content Shell */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black text-slate-700 dark:text-slate-200">
                {settings.libraryName}
              </span>
              <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>
              <span className="text-xs text-slate-500 hidden sm:inline">
                {isOwner ? 'Owner Master Administration' : `Staff Admin Portal (${currentUser?.email})`}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            {isAdmin && (
              <span className="px-2.5 py-1 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] border border-indigo-200 dark:border-indigo-800">
                Restricted Admin Account
              </span>
            )}
            <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-slate-600 dark:text-slate-300 hidden sm:block">
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </div>
          </div>
        </header>

        {/* Dynamic View Children */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
};
