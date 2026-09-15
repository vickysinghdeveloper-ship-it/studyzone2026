import React, { useState, useEffect } from 'react';
import {
  Student,
  LibrarySettings,
  Payment,
  AttendanceRecord,
  Notice,
  Complaint,
  Seat,
  MembershipPlan
} from '../../types';
import {
  QrCode,
  Armchair,
  Clock,
  Calendar,
  CreditCard,
  Download,
  Bell,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  UserCheck,
  Send,
  LogOut,
  Phone,
  Mail,
  User,
  Sparkles,
  MapPin,
  Flame,
  Check,
  X,
  Wifi,
  Zap,
  DollarSign,
  FileText,
  Copy,
  ChevronRight,
  ShieldCheck,
  Layers,
  Lock,
  Eye,
  EyeOff,
  Key,
  Edit3,
  Camera
} from 'lucide-react';
import { downloadStudentCardPDF, downloadPaymentReceiptPDF } from '../../utils/pdfGenerator';
import { QRScannerModal } from './QRScannerModal';

interface StudentPortalProps {
  student: Student;
  settings: LibrarySettings;
  payments: Payment[];
  attendance: AttendanceRecord[];
  notices: Notice[];
  complaints: Complaint[];
  seats?: Seat[];
  plans?: MembershipPlan[];
  onLogout: () => void;
  onSubmitComplaint: (subject: string, description: string) => void;
  onMarkAttendance?: (data: { studentId?: string; studentCode?: string; status?: string; mode?: string }) => void;
  onUpdateProfile?: (updatedData: Partial<Student>) => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  student,
  settings,
  payments,
  attendance,
  notices,
  complaints,
  seats = [],
  plans = [],
  onLogout,
  onSubmitComplaint,
  onMarkAttendance,
  onUpdateProfile
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'receipts' | 'attendance' | 'notices' | 'complaint' | 'profile'>('overview');
  const [showCardModal, setShowCardModal] = useState(false);
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Security & Password State
  const [showPass, setShowPass] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSuccessMsg, setEditSuccessMsg] = useState('');
  const [editData, setEditData] = useState({
    name: student.name || '',
    phone: student.phone || '',
    email: student.email || '',
    password: student.password || '123456',
    targetExam: student.targetExam || '',
    emergencyContact: student.emergencyContact || ''
  });

  const handleOpenEditModal = () => {
    setEditData({
      name: student.name || '',
      phone: student.phone || '',
      email: student.email || '',
      password: student.password || '123456',
      targetExam: student.targetExam || '',
      emergencyContact: student.emergencyContact || ''
    });
    setEditSuccessMsg('');
    setShowEditModal(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateProfile) {
      onUpdateProfile({
        id: student.id,
        name: editData.name,
        phone: editData.phone,
        email: editData.email,
        password: editData.password,
        targetExam: editData.targetExam,
        emergencyContact: editData.emergencyContact
      });
      setEditSuccessMsg('Profile and login password updated successfully!');
      setTimeout(() => {
        setShowEditModal(false);
        setEditSuccessMsg('');
      }, 1500);
    }
  };

  // Complaint form state
  const [compSubject, setCompSubject] = useState('');
  const [compDesc, setCompDesc] = useState('');
  const [compCategory, setCompCategory] = useState<'wifi' | 'ac' | 'cleanliness' | 'seat' | 'other'>('wifi');
  const [compSuccess, setCompSuccess] = useState(false);

  // Live Study Session Timer state
  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayRecord = attendance.find(
    (a) => (a.studentId === student.id || a.studentCode === student.studentCode) && a.date === todayDateStr
  );

  const [sessionSeconds, setSessionSeconds] = useState<number>(0);
  const [isStudying, setIsStudying] = useState<boolean>(!!todayRecord);

  useEffect(() => {
    let interval: any = null;
    if (isStudying) {
      interval = setInterval(() => {
        setSessionSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isStudying]);

  const formatTimer = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelfCheckIn = () => {
    if (onMarkAttendance) {
      onMarkAttendance({
        studentId: student.id,
        studentCode: student.studentCode,
        status: 'present',
        mode: 'kiosk'
      });
      setIsStudying(true);
    }
  };

  const studentPayments = payments.filter((p) => p.studentId === student.id || p.studentCode === student.studentCode);
  const studentAttendance = attendance.filter((a) => a.studentId === student.id || a.studentCode === student.studentCode);
  const studentComplaints = complaints.filter((c) => c.studentId === student.id || c.studentCode === student.studentCode);

  // Days remaining calculation
  const getDaysRemaining = (expiryStr?: string) => {
    if (!expiryStr) return null;
    const exp = new Date(expiryStr);
    const today = new Date();
    const diffTime = exp.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining(student.expiryDate);

  // Seat info lookup
  const assignedSeatObj = seats.find((s) => s.id === student.seatId || s.seatNumber === student.seatNumber);

  // Plan info lookup
  const studentPlanObj = plans.find((p) => p.shift === student.shift || p.title.toLowerCase().includes(student.shift.toLowerCase()));

  const handleComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compSubject || !compDesc) return;
    onSubmitComplaint(`[${compCategory.toUpperCase()}] ${compSubject}`, compDesc);
    setCompSubject('');
    setCompDesc('');
    setCompSuccess(true);
    setTimeout(() => setCompSuccess(false), 4000);
  };

  const copyUpiId = () => {
    const upi = settings.upiId || '6209332827zbl@ybl';
    navigator.clipboard.writeText(upi);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans pb-16">
      
      {/* Student Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={student.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
              alt={student.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-indigo-600 shadow-sm"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h2 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">{student.name}</h2>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 uppercase">
                {student.studentCode}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {settings.libraryName}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          {student.pendingFee > 0 && (
            <button
              onClick={() => setShowUpiModal(true)}
              className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold shadow-sm cursor-pointer transition-all active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 mr-1" />
              <span>Pay Fee (₹{student.pendingFee})</span>
            </button>
          )}

          <button
            onClick={() => setShowScannerModal(true)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-500/20 cursor-pointer transition-all active:scale-95"
            title="Scan ID Card QR for Daily Attendance"
          >
            <Camera className="w-4 h-4" />
            <span>Scan ID QR</span>
          </button>

          <button
            onClick={() => setShowCardModal(true)}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center space-x-1.5 shadow-md shadow-indigo-500/20 cursor-pointer transition-all active:scale-95"
          >
            <QrCode className="w-4 h-4" />
            <span className="hidden sm:inline">Smart ID Card</span>
          </button>

          <button
            onClick={onLogout}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        
        {/* Welcome Banner & Quick Info */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800 relative overflow-hidden">
          {/* Subtle Background Glow */}
          <div className="absolute -right-12 -top-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2 z-10">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30 inline-flex items-center">
                <Sparkles className="w-3 h-3 mr-1 text-amber-400" /> Student Learning Portal
              </span>
              {daysRemaining !== null && (
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                  daysRemaining <= 5
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {daysRemaining > 0 ? `${daysRemaining} Days Left` : 'Expired'}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Welcome back, {student.name}!</h1>
            <p className="text-xs sm:text-sm text-slate-300 flex items-center flex-wrap gap-2">
              <span>📍 {settings.libraryName}</span>
              <span>•</span>
              <span>🪑 Seat: <strong className="text-emerald-400 font-extrabold">{student.seatNumber || 'Unassigned'}</strong></span>
              <span>•</span>
              <span>⏰ Shift: <strong className="capitalize text-indigo-300 font-bold">{student.shift}</strong></span>
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto z-10">
            {/* Membership Box */}
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-xs space-y-1 flex-1 md:flex-none min-w-[170px]">
              <span className="text-slate-300 block text-[11px]">Membership Status</span>
              <div className="text-sm font-extrabold text-emerald-400 flex items-center">
                <CheckCircle className="w-4 h-4 mr-1.5 shrink-0" /> Valid Until {student.expiryDate || 'N/A'}
              </div>
              {student.pendingFee > 0 ? (
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-amber-300 font-bold text-[11px]">Due: ₹{student.pendingFee}</span>
                  <button
                    onClick={() => setShowUpiModal(true)}
                    className="text-[10px] bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold px-2 py-0.5 rounded cursor-pointer transition-colors"
                  >
                    Pay Now
                  </button>
                </div>
              ) : (
                <span className="text-emerald-300 text-[10px] font-semibold block">All Fees Clear ✓</span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200 dark:border-slate-800">
          {[
            { id: 'overview', label: 'Overview', icon: Layers },
            { id: 'receipts', label: 'Payment Receipts', icon: CreditCard },
            { id: 'attendance', label: 'My Attendance', icon: UserCheck },
            { id: 'notices', label: 'Notice Board', icon: Bell },
            { id: 'complaint', label: 'Support & Tickets', icon: MessageSquare },
            { id: 'profile', label: 'My Profile', icon: User }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center space-x-2 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Daily Check-In & Live Study Session Banner */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                  todayRecord
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  <Flame className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      {todayRecord ? "Today's Study Session Logged" : "Have you checked in today?"}
                    </h3>
                    {todayRecord && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        Present
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {todayRecord
                      ? `Checked in at ${todayRecord.checkInTime} via ${todayRecord.mode || 'Kiosk'}`
                      : 'Mark your daily attendance or start your self-study timer'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4 w-full md:w-auto justify-between md:justify-end">
                {isStudying && (
                  <div className="text-center px-4 py-2 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Session Timer</span>
                    <span className="font-mono text-base font-extrabold text-indigo-600 dark:text-indigo-400">
                      {formatTimer(sessionSeconds)}
                    </span>
                  </div>
                )}

                {!todayRecord ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setShowScannerModal(true)}
                      className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center space-x-2 shadow-md shadow-indigo-600/20 cursor-pointer active:scale-95 transition-all"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Scan ID Card QR</span>
                    </button>
                    <button
                      onClick={handleSelfCheckIn}
                      className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center space-x-2 shadow-md shadow-emerald-600/20 cursor-pointer active:scale-95 transition-all"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Touch Check-In</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsStudying(!isStudying)}
                    className={`px-4 py-2.5 rounded-2xl font-extrabold text-xs flex items-center space-x-2 cursor-pointer transition-all ${
                      isStudying
                        ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 dark:bg-amber-950 dark:text-amber-200'
                        : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    <span>{isStudying ? 'Pause Timer' : 'Resume Timer'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Seat & Room Info */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Assigned Seat</span>
                  <Armchair className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    {student.seatNumber || 'Unassigned'}
                  </span>
                  <span className="block text-xs text-slate-500 font-medium mt-1">
                    Room / Category: {assignedSeatObj?.category || 'General Reading Room'}
                  </span>
                </div>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-700 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span>Shift Timing:</span>
                    <strong className="capitalize text-indigo-600 dark:text-indigo-400 font-extrabold">
                      {studentPlanObj?.shiftTiming || `${student.shift} Shift`}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span>Locker Assigned:</span>
                    <strong className="text-slate-900 dark:text-white font-bold">
                      {student.lockerNumber ? `Locker #${student.lockerNumber}` : 'None'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Attendance Summary */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Attendance Stats</span>
                  <UserCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                      {studentAttendance.length}
                    </span>
                    <span className="text-xs text-slate-500 font-bold">Days Check-in</span>
                  </div>
                  <span className="block text-xs text-slate-500 font-medium mt-1">
                    Monthly Target: 26 Days
                  </span>
                </div>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-700 text-xs space-y-1">
                  <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, (studentAttendance.length / 26) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 text-right font-bold pt-0.5">
                    {Math.round((studentAttendance.length / 26) * 100)}% Monthly Goal Met
                  </p>
                </div>
              </div>

              {/* Smart ID & Actions */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Digital Identity</span>
                    <QrCode className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Printable Student ID Pass</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Show your ID card at the entrance gate or scan for attendance.
                  </p>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => setShowScannerModal(true)}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center justify-center space-x-2 cursor-pointer transition-all active:scale-95 shadow-sm"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Scan ID for Attendance</span>
                  </button>
                  <button
                    onClick={() => downloadStudentCardPDF(student, settings)}
                    className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-extrabold text-xs flex items-center justify-center space-x-2 cursor-pointer transition-all active:scale-95 shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download ID Card PDF</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Recent Notices Section */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center">
                  <Bell className="w-4 h-4 mr-2 text-indigo-600" />
                  Important Announcements & Rules
                </h3>
                <button
                  onClick={() => setActiveTab('notices')}
                  className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"
                >
                  <span>View All Notices</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </button>
              </div>

              {notices.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                  No notice board announcements published yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {notices.slice(0, 2).map((not) => (
                    <div key={not.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700/60 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full border border-indigo-200/50">
                          {not.category}
                        </span>
                        <span className="text-[10px] text-slate-400">{not.postedDate}</span>
                      </div>
                      <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">{not.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{not.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: RECEIPTS & PAYMENTS */}
        {activeTab === 'receipts' && (
          <div className="space-y-6">
            
            {/* Fee Summary Banner */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Fee & Payment Records</h3>
                <p className="text-xs text-slate-500">
                  Total Paid: <strong className="text-emerald-600 dark:text-emerald-400">₹{student.totalPaid || 0}</strong> • Pending Balance: <strong className={student.pendingFee > 0 ? 'text-amber-600' : 'text-slate-600'}>₹{student.pendingFee || 0}</strong>
                </p>
              </div>

              {student.pendingFee > 0 && (
                <button
                  onClick={() => setShowUpiModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs flex items-center space-x-2 shadow-md cursor-pointer transition-all active:scale-95"
                >
                  <Zap className="w-4 h-4" />
                  <span>Pay Due Fee via UPI QR</span>
                </button>
              )}
            </div>

            {/* Receipts Table */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700/80 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700/80 flex items-center justify-between">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500">Official Payment History</h4>
                <span className="text-xs font-bold text-slate-400">{studentPayments.length} Receipts Found</span>
              </div>

              {studentPayments.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No payment receipts generated yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-700/80 text-slate-500 font-extrabold uppercase tracking-wider">
                        <th className="p-4">Receipt #</th>
                        <th className="p-4">Plan / Duration</th>
                        <th className="p-4">Amount Paid</th>
                        <th className="p-4">Payment Method</th>
                        <th className="p-4">Date</th>
                        <th className="p-4 text-right">Download PDF</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                      {studentPayments.map((pay) => (
                        <tr key={pay.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                          <td className="p-4 font-mono font-extrabold text-indigo-600 dark:text-indigo-400">{pay.receiptNumber}</td>
                          <td className="p-4 font-bold text-slate-900 dark:text-white">{pay.planName}</td>
                          <td className="p-4 font-extrabold text-emerald-600 dark:text-emerald-400">₹{pay.totalAmount}</td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 font-extrabold text-[10px] uppercase text-slate-700 dark:text-slate-300">
                              {pay.paymentMethod}
                            </span>
                          </td>
                          <td className="p-4 text-slate-500 font-medium">{pay.paymentDate}</td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => downloadPaymentReceiptPDF(pay, settings)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-100 font-extrabold text-xs inline-flex items-center space-x-1 cursor-pointer transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Receipt PDF</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 3: MY ATTENDANCE */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            
            {/* Header card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Attendance Log & History</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Your daily library check-ins are recorded automatically via Smart ID QR scan or Kiosk.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowScannerModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center space-x-2 shadow-md shadow-indigo-600/20 cursor-pointer transition-all active:scale-95"
                >
                  <Camera className="w-4 h-4" />
                  <span>Scan ID Card QR</span>
                </button>
                {!todayRecord && (
                  <button
                    onClick={handleSelfCheckIn}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center space-x-2 shadow-md cursor-pointer transition-all active:scale-95"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Quick Check-In</span>
                  </button>
                )}
              </div>
            </div>

            {/* Attendance list */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700/80 shadow-sm p-6 space-y-4">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500">Check-in Logs</h4>

              {studentAttendance.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No attendance records logged yet. Use the check-in button above when studying!
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  {studentAttendance.map((a) => (
                    <div key={a.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold flex items-center justify-center">
                          <Check className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 dark:text-white">{a.date}</div>
                          <div className="text-[10px] text-slate-400 font-medium">Check-in time: {a.checkInTime}</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold text-[10px] uppercase">
                          {a.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 4: NOTICE BOARD */}
        {activeTab === 'notices' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Official Library Notice Board</h3>
              <span className="text-xs text-slate-500 font-bold">{notices.length} Active Notices</span>
            </div>

            {notices.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                No active announcements at this time. Check back later!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notices.map((not) => (
                  <div key={not.id} className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-full border border-indigo-200/50">
                        {not.category}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">{not.postedDate}</span>
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">{not.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{not.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: COMPLAINTS & SUPPORT */}
        {activeTab === 'complaint' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Submit Ticket Form */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Submit Ticket / Support Request</h3>
              
              {compSuccess && (
                <div className="p-3.5 rounded-2xl bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 font-extrabold text-xs flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>Ticket submitted successfully! The owner will review it soon.</span>
                </div>
              )}

              <form onSubmit={handleComplaintSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-extrabold mb-1 text-slate-700 dark:text-slate-300">
                    Category *
                  </label>
                  <select
                    value={compCategory}
                    onChange={(e) => setCompCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-semibold"
                  >
                    <option value="wifi">WiFi / Internet Connectivity</option>
                    <option value="ac">Air Conditioning / Temperature</option>
                    <option value="cleanliness">Cleanliness & Hygiene</option>
                    <option value="seat">Seat / Lighting Issue</option>
                    <option value="other">General Feedback / Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-extrabold mb-1 text-slate-700 dark:text-slate-300">
                    Subject *
                  </label>
                  <input
                    type="text"
                    required
                    value={compSubject}
                    onChange={(e) => setCompSubject(e.target.value)}
                    placeholder="e.g. WiFi signal weak in Quiet Zone 2"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block font-extrabold mb-1 text-slate-700 dark:text-slate-300">
                    Issue Details *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={compDesc}
                    onChange={(e) => setCompDesc(e.target.value)}
                    placeholder="Provide details about the issue..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-medium"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md cursor-pointer transition-all active:scale-95"
                >
                  Submit Ticket to Owner
                </button>
              </form>
            </div>

            {/* Ticket History */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Your Previous Tickets</h3>

              {studentComplaints.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
                  You have not submitted any support tickets yet.
                </div>
              ) : (
                studentComplaints.map((c) => (
                  <div key={c.id} className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">{c.subject}</h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        c.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {c.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{c.description}</p>
                    
                    {c.ownerReply && (
                      <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-xs text-indigo-950 dark:text-indigo-200 border border-indigo-100 dark:border-indigo-900/40 mt-2">
                        <strong className="block font-extrabold mb-0.5">Management Reply:</strong>
                        <span>{c.ownerReply}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

          </div>
        )}

        {/* TAB 6: MY PROFILE */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Personal Details Card */}
            <div className="md:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={student.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-600 shadow-md"
                  />
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{student.name}</h3>
                    <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-bold">Student ID: {student.studentCode}</p>
                    <p className="text-xs text-slate-500 font-medium capitalize">Shift: {student.shift} Shift</p>
                  </div>
                </div>
                <button
                  onClick={handleOpenEditModal}
                  className="px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 font-extrabold text-xs flex items-center space-x-1.5 transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block mb-0.5">Mobile Phone</span>
                  <div className="font-extrabold text-slate-900 dark:text-white flex items-center">
                    <Phone className="w-3.5 h-3.5 mr-1.5 text-indigo-600" /> {student.phone}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block mb-0.5">Email Address</span>
                  <div className="font-extrabold text-slate-900 dark:text-white flex items-center">
                    <Mail className="w-3.5 h-3.5 mr-1.5 text-indigo-600" /> {student.email || 'Not Provided'}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block mb-0.5">Father / Guardian</span>
                  <div className="font-extrabold text-slate-900 dark:text-white">
                    {student.guardianName || 'N/A'} ({student.guardianPhone || 'N/A'})
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block mb-0.5">Gender</span>
                  <div className="font-extrabold text-slate-900 dark:text-white capitalize">
                    {student.gender || 'Male'}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block mb-0.5">Joining Date</span>
                  <div className="font-extrabold text-slate-900 dark:text-white">
                    {student.joinDate || 'N/A'}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block mb-0.5">Valid Till</span>
                  <div className="font-extrabold text-emerald-600 dark:text-emerald-400">
                    {student.expiryDate || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Login Credentials & Security Box */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-extrabold text-slate-800 dark:text-slate-200">
                    <Key className="w-4 h-4 text-blue-600" />
                    <span>Login Credentials & Account Security</span>
                  </div>
                  <button
                    onClick={() => {
                      setEditData({
                        name: student.name || '',
                        phone: student.phone || '',
                        email: student.email || '',
                        password: student.password || '123456',
                        targetExam: student.targetExam || '',
                        emergencyContact: student.emergencyContact || ''
                      });
                      setEditSuccessMsg('');
                      setShowEditModal(true);
                    }}
                    className="text-[11px] text-blue-600 dark:text-blue-400 font-extrabold hover:underline cursor-pointer"
                  >
                    Change Password
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold text-[10px] block">Login Phone / Code</span>
                    <span className="font-mono font-extrabold text-slate-900 dark:text-white">
                      {student.phone} ({student.studentCode})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold text-[10px] block">Account Password</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-extrabold text-slate-900 dark:text-white">
                        {showPass ? student.password || '123456' : '••••••••'}
                      </span>
                      <button
                        onClick={() => setShowPass(!showPass)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                      >
                        {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Library Details Side Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-4">
              <h4 className="font-extrabold text-xs uppercase text-slate-400 tracking-wider">Library Center Info</h4>
              
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">Center Name</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{settings.libraryName}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">Address</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {settings.address}, {settings.city} - {settings.pincode}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">Helpline / Manager</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    📞 {settings.phone} ({settings.ownerName})
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
                  <button
                    onClick={() => downloadStudentCardPDF(student, settings)}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center justify-center space-x-2 cursor-pointer transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download ID Card</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* MODAL 1: Digital Smart ID Card */}
      {showCardModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-6 space-y-4 border border-slate-200 dark:border-slate-700 text-center relative animate-in fade-in zoom-in duration-150">
            <button
              onClick={() => setShowCardModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Digital Smart Student ID</h3>
            
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white space-y-3 shadow-xl border border-slate-800 relative overflow-hidden">
              <div className="text-left">
                <span className="text-[10px] font-extrabold uppercase text-indigo-300 tracking-wider block">{settings.libraryName}</span>
                <span className="text-[9px] text-slate-300">Smart Member Pass • {student.shift} Shift</span>
              </div>

              <div className="flex items-center space-x-3 text-left pt-1">
                <img
                  src={student.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
                  className="w-14 h-14 rounded-full object-cover border-2 border-indigo-400"
                />
                <div>
                  <h4 className="font-extrabold text-sm text-white">{student.name}</h4>
                  <p className="text-[11px] text-indigo-300 font-mono font-bold">{student.studentCode}</p>
                  <p className="text-[10px] text-slate-300 font-medium">Seat: {student.seatNumber || 'Unassigned'}</p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-white/10 text-[10px]">
                <span>Valid: {student.expiryDate || 'N/A'}</span>
                <span className="font-mono bg-white text-slate-900 px-2 py-0.5 rounded font-extrabold">
                  {student.studentCode}
                </span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => downloadStudentCardPDF(student, settings)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center justify-center space-x-1 cursor-pointer transition-all"
              >
                <Download className="w-4 h-4 mr-1" />
                <span>Download PDF</span>
              </button>
              <button
                onClick={() => setShowCardModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:text-white text-slate-600 text-xs font-extrabold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: UPI Fee Payment Modal */}
      {showUpiModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-6 space-y-4 border border-slate-200 dark:border-slate-700 relative animate-in fade-in zoom-in duration-150">
            <button
              onClick={() => setShowUpiModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-300 flex items-center justify-center mx-auto">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Pay Library Due Fee</h3>
              <p className="text-xs text-slate-500">
                Scan UPI QR code or pay to the UPI ID below
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-amber-700 dark:text-amber-400 block">
                  Pending Due Amount
                </span>
                <span className="text-2xl font-extrabold text-amber-900 dark:text-amber-100">
                  ₹{student.pendingFee}
                </span>
              </div>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
                {student.name} ({student.studentCode})
              </span>
            </div>

            {/* QR Payment Box */}
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 text-center space-y-3 border border-slate-200 dark:border-slate-700">
              <div className="bg-white p-3 rounded-2xl inline-block shadow-md border border-slate-200">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                    `upi://pay?pa=${settings.upiId || '6209332827zbl@ybl'}&pn=${encodeURIComponent(
                      settings.libraryName
                    )}&am=${student.pendingFee || 0}&cu=INR&tn=Fee%20Payment%20${encodeURIComponent(student.studentCode)}`
                  )}`}
                  alt="UPI QR Code"
                  className="w-48 h-48 mx-auto rounded-xl"
                />
              </div>

              <div className="flex items-center justify-center space-x-2">
                <span className="font-mono text-xs font-extrabold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
                  UPI ID: {settings.upiId || '6209332827zbl@ybl'}
                </span>
                <button
                  onClick={copyUpiId}
                  className="p-2 rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 hover:bg-indigo-200 text-xs font-bold cursor-pointer transition-colors shadow-xs"
                  title="Copy UPI ID"
                >
                  {copiedUpi ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Direct UPI App Trigger */}
              <a
                href={`upi://pay?pa=${settings.upiId || '6209332827zbl@ybl'}&pn=${encodeURIComponent(
                  settings.libraryName
                )}&am=${student.pendingFee || 0}&cu=INR&tn=Fee%20Payment%20${encodeURIComponent(student.studentCode)}`}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center justify-center space-x-2 shadow-md cursor-pointer transition-all active:scale-95"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>Pay via UPI App (PhonePe / GPay / Paytm)</span>
              </a>
            </div>

            <div className="text-[11px] text-slate-500 space-y-1 leading-normal">
              <p><strong>Steps to complete payment:</strong></p>
              <p>1. Scan the QR code using PhonePe, Google Pay, Paytm or any UPI app.</p>
              <p>2. Pay the exact due amount: <strong>₹{student.pendingFee}</strong></p>
              <p>3. After payment, click the button below to send your receipt / screenshot on WhatsApp to <strong>6209332827</strong>.</p>
            </div>

            {/* WhatsApp Receipt Share Button */}
            <div className="pt-2 space-y-2">
              <a
                href={`https://wa.me/91${(settings.whatsappNumber || settings.phone || '6209332827').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `Hi StudyZone Library Owner,\n\nI have completed my fee payment of ₹${student.pendingFee} to UPI ID: ${settings.upiId || '6209332827zbl@ybl'}.\n\nName: ${student.name}\nStudent ID: ${student.studentCode}\nSeat: ${student.seatNumber || 'Unassigned'}\n\nPlease verify and update my account status. Sending payment receipt screenshot below:`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/25 cursor-pointer transition-all active:scale-95"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Share Payment Receipt on WhatsApp (6209332827)</span>
              </a>

              <button
                onClick={() => setShowUpiModal(false)}
                className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-extrabold text-xs cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Edit Profile & Password Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-6 space-y-4 border border-slate-200 dark:border-slate-700 relative animate-in fade-in zoom-in duration-150">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center mx-auto">
                <Edit3 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Edit Profile & Password</h3>
              <p className="text-xs text-slate-500">
                Update your personal info and login credentials
              </p>
            </div>

            {editSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{editSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={editData.phone}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Account Password</label>
                <input
                  type="text"
                  required
                  value={editData.password}
                  onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                  placeholder="Set login password"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Target Exam / Goal</label>
                <input
                  type="text"
                  value={editData.targetExam}
                  onChange={(e) => setEditData({ ...editData, targetExam: e.target.value })}
                  placeholder="e.g. UPSC, CA, NEET"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Emergency Contact Phone</label>
                <input
                  type="tel"
                  value={editData.emergencyContact}
                  onChange={(e) => setEditData({ ...editData, emergencyContact: e.target.value })}
                  placeholder="Guardian / Emergency contact"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: QR Scanner Modal */}
      <QRScannerModal
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        currentStudent={student}
        onMarkAttendance={(data) => {
          if (onMarkAttendance) {
            onMarkAttendance(data);
            setIsStudying(true);
          }
        }}
        todayRecord={todayRecord}
      />

    </div>
  );
};
