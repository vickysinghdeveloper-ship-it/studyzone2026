import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  UserPlus,
  Users,
  Search,
  Filter,
  Check,
  X,
  Edit2,
  Trash2,
  KeyRound,
  Lock,
  Mail,
  Phone,
  LayoutDashboard,
  Clock,
  Armchair,
  UserCheck,
  CreditCard,
  TrendingDown,
  Bell,
  MessageSquare,
  Package,
  FileSpreadsheet,
  Settings,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { AdminAccount, AdminPermission } from '../../types';

interface AdminManagementProps {
  admins: AdminAccount[];
  onAddAdmin: (admin: Omit<AdminAccount, 'id' | 'createdAt'>) => void;
  onUpdateAdmin: (id: string, updates: Partial<AdminAccount>) => void;
  onDeleteAdmin: (id: string) => void;
  onToggleAdminStatus: (id: string) => void;
}

export const PERMISSION_MODULES: {
  id: AdminPermission;
  label: string;
  category: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: 'dashboard',
    label: 'Executive Overview',
    category: 'Analytics',
    description: 'View occupancy stats, revenue summaries, and quick metric widgets.',
    icon: LayoutDashboard
  },
  {
    id: 'students',
    label: 'Student Directory',
    category: 'Operations',
    description: 'Add, view, edit student profiles and generate printable QR ID cards.',
    icon: Users
  },
  {
    id: 'seats',
    label: 'Visual Seat Map',
    category: 'Operations',
    description: 'Allocate seats across rooms/floors and monitor desk occupancy.',
    icon: Armchair
  },
  {
    id: 'plans',
    label: 'Time Slots & Plans',
    category: 'Operations',
    description: 'Manage morning/evening/night shifts and monthly fee structures.',
    icon: Clock
  },
  {
    id: 'attendance',
    label: 'Attendance & QR Scanner',
    category: 'Daily Desk',
    description: 'Mark student in/out attendance and scan student QR cards.',
    icon: UserCheck
  },
  {
    id: 'payments',
    label: 'Fee Collections',
    category: 'Finance',
    description: 'Collect fees, verify UPI payments, and generate digital receipts.',
    icon: CreditCard
  },
  {
    id: 'expenses',
    label: 'Library Expenses',
    category: 'Finance',
    description: 'Record utility bills, maintenance, internet, and office expenses.',
    icon: TrendingDown
  },
  {
    id: 'notices',
    label: 'Notice Board',
    category: 'Communication',
    description: 'Publish announcements, holiday schedules, and rules to students.',
    icon: Bell
  },
  {
    id: 'complaints',
    label: 'Student Complaints',
    category: 'Communication',
    description: 'Resolve WiFi, AC, noise, or desk issues reported by students.',
    icon: MessageSquare
  },
  {
    id: 'visitors',
    label: 'Visitor Logs',
    category: 'Daily Desk',
    description: 'Record front-desk visitor walk-ins, phone inquiries, and follow-ups.',
    icon: UserPlus
  },
  {
    id: 'inventory',
    label: 'Assets & Inventory',
    category: 'Facility',
    description: 'Track desks, ergonomic chairs, ACs, routers, and safety equipment.',
    icon: Package
  },
  {
    id: 'reports',
    label: 'Reports & Analytics',
    category: 'Analytics',
    description: 'Export financial audits, occupancy data, and student directories.',
    icon: FileSpreadsheet
  },
  {
    id: 'settings',
    label: 'Settings & Hostinger',
    category: 'System',
    description: 'Access core library contact info, UPI settings, and Hostinger export.',
    icon: Settings
  }
];

export const AdminManagement: React.FC<AdminManagementProps> = ({
  admins,
  onAddAdmin,
  onUpdateAdmin,
  onDeleteAdmin,
  onToggleAdminStatus
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'restricted'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminAccount | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    password: string;
    status: 'active' | 'restricted';
    permissions: AdminPermission[];
  }>({
    name: '',
    email: '',
    phone: '',
    password: '',
    status: 'active',
    permissions: ['dashboard', 'students', 'seats', 'attendance', 'payments']
  });

  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  // Reset Password Modal
  const [passwordResetAdmin, setPasswordResetAdmin] = useState<AdminAccount | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState('');
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);

  // Delete Confirmation
  const [deleteConfirmAdmin, setDeleteConfirmAdmin] = useState<AdminAccount | null>(null);

  // Filtered Admins
  const filteredAdmins = admins.filter((admin) => {
    const matchesSearch =
      admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.phone.includes(searchQuery);

    const matchesStatus =
      statusFilter === 'all' || admin.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const openCreateModal = () => {
    setEditingAdmin(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      status: 'active',
      permissions: ['dashboard', 'students', 'seats', 'attendance', 'payments']
    });
    setFormError('');
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const openEditModal = (admin: AdminAccount) => {
    setEditingAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      password: admin.password,
      status: admin.status,
      permissions: [...admin.permissions]
    });
    setFormError('');
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const togglePermission = (permId: AdminPermission) => {
    setFormData((prev) => {
      const exists = prev.permissions.includes(permId);
      const newPerms = exists
        ? prev.permissions.filter((p) => p !== permId)
        : [...prev.permissions, permId];
      return { ...prev, permissions: newPerms };
    });
  };

  const selectAllPermissions = () => {
    setFormData((prev) => ({
      ...prev,
      permissions: PERMISSION_MODULES.map((m) => m.id)
    }));
  };

  const clearAllPermissions = () => {
    setFormData((prev) => ({
      ...prev,
      permissions: []
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const cleanEmail = formData.email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }

    if (!formData.name.trim()) {
      setFormError('Please enter the admin name.');
      return;
    }

    if (!formData.phone.trim()) {
      setFormError('Please enter a contact phone number.');
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.permissions.length === 0) {
      setFormError('Please select at least one feature permission for this admin.');
      return;
    }

    // Check duplicate email
    const duplicate = admins.find(
      (a) => a.email.toLowerCase() === cleanEmail && a.id !== editingAdmin?.id
    );
    if (duplicate) {
      setFormError('An admin account with this email already exists.');
      return;
    }

    if (editingAdmin) {
      onUpdateAdmin(editingAdmin.id, {
        name: formData.name.trim(),
        email: cleanEmail,
        phone: formData.phone.trim(),
        password: formData.password,
        status: formData.status,
        permissions: formData.permissions
      });
    } else {
      onAddAdmin({
        name: formData.name.trim(),
        email: cleanEmail,
        phone: formData.phone.trim(),
        password: formData.password,
        status: formData.status,
        permissions: formData.permissions
      });
    }

    setIsModalOpen(false);
  };

  const handlePasswordResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordResetAdmin || !newPasswordValue || newPasswordValue.length < 6) {
      return;
    }

    onUpdateAdmin(passwordResetAdmin.id, { password: newPasswordValue });
    setPasswordResetSuccess(true);
    setTimeout(() => {
      setPasswordResetSuccess(false);
      setPasswordResetAdmin(null);
      setNewPasswordValue('');
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Admin & Staff Access Management
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Create and manage sub-admin login accounts. Check the specific feature boxes to restrict or allow access to modules. Admins can log in directly from the home screen.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Create New Admin</span>
        </button>
      </div>

      {/* KPI Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Admins</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">{admins.length}</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Active Accounts</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {admins.filter((a) => a.status === 'active').length}
            </span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Restricted / Blocked</span>
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {admins.filter((a) => a.status === 'restricted').length}
            </span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Permission Modules</span>
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
              {PERMISSION_MODULES.length} Features
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email or phone..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-400 flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </span>
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              All ({admins.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                statusFilter === 'active'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Active ({admins.filter((a) => a.status === 'active').length})
            </button>
            <button
              onClick={() => setStatusFilter('restricted')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                statusFilter === 'restricted'
                  ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Restricted ({admins.filter((a) => a.status === 'restricted').length})
            </button>
          </div>
        </div>
      </div>

      {/* Admin Accounts List */}
      {filteredAdmins.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 p-12 text-center rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-900 text-slate-400 mx-auto flex items-center justify-center">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white">No Admin Accounts Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? 'No admin matches your search criteria. Try modifying your search.'
              : 'Create your first staff or branch manager admin account by clicking the button above.'}
          </p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
          >
            + Create First Admin
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredAdmins.map((admin) => {
            const isRestricted = admin.status === 'restricted';
            return (
              <div
                key={admin.id}
                className={`bg-white dark:bg-slate-800 rounded-3xl border p-6 space-y-5 transition-all shadow-xs ${
                  isRestricted
                    ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10'
                    : 'border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800'
                }`}
              >
                {/* Admin Header Card */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-3.5">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base shadow-sm ${
                        isRestricted
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                          : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-blue-500/20'
                      }`}
                    >
                      {admin.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {admin.name}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                            isRestricted
                              ? 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-900'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-900'
                          }`}
                        >
                          {isRestricted ? (
                            <>
                              <XCircle className="w-2.5 h-2.5 mr-1 text-rose-600" />
                              Restricted
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-2.5 h-2.5 mr-1 text-emerald-600" />
                              Active
                            </>
                          )}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 font-mono block mt-0.5">
                        User ID: <strong>{admin.email}</strong>
                      </span>
                    </div>
                  </div>

                  {/* 1-Click Status Toggle */}
                  <button
                    onClick={() => onToggleAdminStatus(admin.id)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-colors cursor-pointer border ${
                      isRestricted
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-xs'
                        : 'bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                    }`}
                    title={isRestricted ? 'Re-activate this admin' : 'Block / Restrict this admin from logging in'}
                  >
                    {isRestricted ? 'Re-Activate' : 'Restrict Access'}
                  </button>
                </div>

                {/* Contact and Meta Info */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 truncate">
                    <Phone className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="truncate">{admin.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 truncate">
                    <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="truncate">{admin.email}</span>
                  </div>
                </div>

                {/* Permissions Breakdown */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                      <Shield className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Allowed Feature Access ({admin.permissions.length}/{PERMISSION_MODULES.length})</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                    {admin.permissions.map((permId) => {
                      const mod = PERMISSION_MODULES.find((m) => m.id === permId);
                      if (!mod) return null;
                      const Icon = mod.icon;
                      return (
                        <span
                          key={permId}
                          className="inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-bold bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/60"
                        >
                          <Icon className="w-3 h-3 mr-1 opacity-70" />
                          {mod.label}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openEditModal(admin)}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Access</span>
                    </button>

                    <button
                      onClick={() => {
                        setPasswordResetAdmin(admin);
                        setNewPasswordValue('');
                        setPasswordResetSuccess(false);
                      }}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-bold transition-colors cursor-pointer border border-indigo-100 dark:border-indigo-900"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Reset Pass</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setDeleteConfirmAdmin(admin)}
                    className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors cursor-pointer"
                    title="Delete Admin Account"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT ADMIN MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden my-auto animate-in zoom-in-95">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold">
                    {editingAdmin ? 'Edit Admin Permissions & Account' : 'Create New Admin Account'}
                  </h3>
                  <p className="text-xs text-blue-100">
                    Assign specific feature permissions by checking the boxes below.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
              {formError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 font-semibold flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Admin Basic Info */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider text-[11px] text-blue-600 dark:text-blue-400">
                  1. Admin Account Credentials
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Rahul Verma - Reception Desk"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                      Email Address (Login User ID) *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. rahul@studyzone.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. 9876543210"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                      Account Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Min 6 characters"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-medium pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Initial Status</label>
                  <div className="flex space-x-3">
                    <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                      <input
                        type="radio"
                        name="status"
                        checked={formData.status === 'active'}
                        onChange={() => setFormData({ ...formData, status: 'active' })}
                        className="text-blue-600"
                      />
                      <span className="font-bold text-emerald-600">Active (Can Log In)</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                      <input
                        type="radio"
                        name="status"
                        checked={formData.status === 'restricted'}
                        onChange={() => setFormData({ ...formData, status: 'restricted' })}
                        className="text-blue-600"
                      />
                      <span className="font-bold text-rose-600">Restricted (Login Suspended)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Feature Permissions Checkboxes */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider text-[11px] text-blue-600 dark:text-blue-400">
                      2. Feature Access Checkboxes
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Check each box to give this admin access to that specific module.
                    </p>
                  </div>
                  <div className="flex space-x-2 text-[11px]">
                    <button
                      type="button"
                      onClick={selectAllPermissions}
                      className="text-blue-600 hover:underline font-bold"
                    >
                      Select All
                    </button>
                    <span className="text-slate-400">•</span>
                    <button
                      type="button"
                      onClick={clearAllPermissions}
                      className="text-slate-500 hover:underline font-bold"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PERMISSION_MODULES.map((mod) => {
                    const isChecked = formData.permissions.includes(mod.id);
                    const Icon = mod.icon;
                    return (
                      <div
                        key={mod.id}
                        onClick={() => togglePermission(mod.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start space-x-3 ${
                          isChecked
                            ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800'
                            : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-700/80 hover:border-slate-300'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${
                            isChecked
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5" />}
                        </div>

                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center space-x-1.5">
                            <Icon className={`w-3.5 h-3.5 ${isChecked ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                            <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                              {mod.label}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                            {mod.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  {editingAdmin ? 'Update Admin Account & Permissions' : 'Create & Authorize Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK RESET PASSWORD MODAL */}
      {passwordResetAdmin && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
                <KeyRound className="w-5 h-5" />
                <h3 className="font-black text-sm text-slate-900 dark:text-white">
                  Reset Password for {passwordResetAdmin.name}
                </h3>
              </div>
              <button
                onClick={() => setPasswordResetAdmin(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {passwordResetSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 text-xs font-bold text-center">
                ✅ Password updated successfully!
              </div>
            ) : (
              <form onSubmit={handlePasswordResetSubmit} className="space-y-4 text-xs">
                <p className="text-slate-500 text-[11px]">
                  Enter a new secure password for <strong>{passwordResetAdmin.email}</strong>. The admin will use this to sign in.
                </p>

                <div>
                  <label className="block font-bold mb-1">New Password</label>
                  <input
                    type="text"
                    required
                    value={newPasswordValue}
                    onChange={(e) => setNewPasswordValue(e.target.value)}
                    placeholder="Enter new password (min 6 chars)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 font-mono font-bold"
                  />
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setPasswordResetAdmin(null)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-extrabold shadow-md"
                  >
                    Set Password
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmAdmin && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Delete Admin Account?
              </h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to permanently delete <strong>{deleteConfirmAdmin.name}</strong> ({deleteConfirmAdmin.email})? This action cannot be undone.
              </p>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmAdmin(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteAdmin(deleteConfirmAdmin.id);
                  setDeleteConfirmAdmin(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-md shadow-rose-600/20"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
