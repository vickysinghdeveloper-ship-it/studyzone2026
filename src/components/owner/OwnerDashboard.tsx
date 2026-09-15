import React from 'react';
import {
  DollarSign,
  Users,
  Armchair,
  AlertTriangle,
  TrendingUp,
  UserCheck,
  Calendar,
  Plus,
  CreditCard,
  QrCode,
  Download,
  BellRing,
  Sparkles,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { LibrarySettings, Student, Seat, Payment, AttendanceRecord, MembershipPlan } from '../../types';

interface OwnerDashboardProps {
  settings: LibrarySettings;
  students: Student[];
  seats: Seat[];
  payments: Payment[];
  attendance: AttendanceRecord[];
  plans: MembershipPlan[];
  onNavigateTab: (tab: string) => void;
  onOpenAddStudent: () => void;
  onOpenCollectFee: () => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({
  settings,
  students,
  seats,
  payments,
  attendance,
  plans,
  onNavigateTab,
  onOpenAddStudent,
  onOpenCollectFee
}) => {
  // Calculated Executive Stats
  const todayStr = new Date().toISOString().split('T')[0];

  const todayPayments = payments.filter((p) => p.paymentDate === todayStr);
  const todayRevenue = todayPayments.reduce((sum, p) => sum + p.totalAmount, 0);
  const monthlyRevenue = payments.reduce((sum, p) => sum + p.totalAmount, 0);

  const totalStudentsCount = students.length;
  const activeStudentsCount = students.filter((s) => s.status === 'active').length;
  const pendingDueStudentsCount = students.filter((s) => s.status === 'pending_due' || s.pendingFee > 0).length;
  const totalPendingFee = students.reduce((sum, s) => sum + (s.pendingFee || 0), 0);

  const totalSeatsCount = seats.length;
  const occupiedSeatsCount = seats.filter((s) => s.status === 'occupied').length;
  const availableSeatsCount = seats.filter((s) => s.status === 'available').length;
  const reservedSeatsCount = seats.filter((s) => s.status === 'reserved').length;
  const occupancyPercent = totalSeatsCount > 0 ? Math.round((occupiedSeatsCount / totalSeatsCount) * 100) : 0;

  const todayPresentAttendance = attendance.filter((a) => a.date === todayStr && (a.status === 'present' || a.status === 'late')).length;

  // Chart Data
  const revenueChartData = [
    { month: 'Feb', collection: 42000 },
    { month: 'Mar', collection: 58000 },
    { month: 'Apr', collection: 62000 },
    { month: 'May', collection: 71000 },
    { month: 'Jun', collection: 85000 },
    { month: 'Jul', collection: monthlyRevenue > 0 ? monthlyRevenue : 92000 }
  ];

  const seatPieData = [
    { name: 'Occupied', value: occupiedSeatsCount || 6, color: '#2563eb' },
    { name: 'Available', value: availableSeatsCount || 4, color: '#10b981' },
    { name: 'Reserved', value: reservedSeatsCount || 2, color: '#f59e0b' },
    { name: 'Maintenance', value: seats.filter((s) => s.status === 'maintenance').length || 1, color: '#94a3b8' }
  ];

  const shiftData = [
    { name: 'Morning', count: seats.filter((s) => s.shiftAssigned === 'morning').length || 8 },
    { name: 'Evening', count: seats.filter((s) => s.shiftAssigned === 'evening').length || 6 },
    { name: 'Night', count: seats.filter((s) => s.shiftAssigned === 'night').length || 5 },
    { name: 'Full Day', count: seats.filter((s) => s.shiftAssigned === 'fullday').length || 12 }
  ];

  return (
    <div className="space-y-8 pb-12">
      
      {/* Top Banner & Quick Actions */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart Library Control Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {settings.libraryName} Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Real-time seat occupancy, daily revenue collections, student dues, and attendance tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={onOpenAddStudent}
            className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add New Student
          </button>

          <button
            onClick={onOpenCollectFee}
            className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all"
          >
            <CreditCard className="w-4 h-4 mr-1.5" />
            Collect Fee
          </button>

          <button
            onClick={() => onNavigateTab('settings')}
            className="inline-flex items-center justify-center p-2.5 rounded-xl bg-slate-800/90 border border-slate-700 hover:bg-slate-700 text-slate-200 transition-colors"
            title="Hostinger PHP Export"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Today's Revenue */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Today's Revenue</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {settings.currencySymbol}{todayRevenue.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] font-medium text-emerald-600 flex items-center">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            {todayPayments.length} receipts generated today
          </span>
        </div>

        {/* Total Monthly Revenue */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Monthly Revenue</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {settings.currencySymbol}{monthlyRevenue.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Total collections recorded
          </span>
        </div>

        {/* Seat Occupancy */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Seat Occupancy</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
              <Armchair className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{occupancyPercent}%</span>
            <span className="text-xs text-slate-500 font-medium">({occupiedSeatsCount}/{totalSeatsCount} Seats)</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${occupancyPercent}%` }} />
          </div>
        </div>

        {/* Pending Fee Dues */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending Fees</span>
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {settings.currencySymbol}{totalPendingFee.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-rose-600 font-semibold flex items-center">
            {pendingDueStudentsCount} students with due balance
          </span>
        </div>

      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Revenue Collection Trend Area Chart */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Revenue Collection Trend</h3>
              <p className="text-xs text-slate-500">Monthly library fee collections in {settings.currencySymbol}</p>
            </div>
            <button
              onClick={() => onNavigateTab('payments')}
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center"
            >
              View Payments <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                  formatter={(value: any) => [`₹ ${Number(value).toLocaleString('en-IN')}`, 'Collection']}
                />
                <Area type="monotone" dataKey="collection" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Seat Occupancy Breakdown Donut Chart */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Seat Distribution</h3>
            <p className="text-xs text-slate-500">Real-time status breakdown</p>
          </div>

          <div className="h-48 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={seatPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {seatPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold text-slate-900 dark:text-white">{occupiedSeatsCount}</span>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Occupied</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {seatPieData.map((item) => (
              <div key={item.name} className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 dark:text-slate-400 font-medium">{item.name}:</span>
                <span className="font-bold text-slate-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigateTab('seats')}
            className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-200 transition-colors"
          >
            Open Visual Floor Map →
          </button>
        </div>

      </div>

      {/* Lists & Feeds Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recent Admissions & Payments Table */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Payments</h3>
            <button
              onClick={() => onNavigateTab('payments')}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500">
                  <th className="pb-3 font-semibold">Receipt #</th>
                  <th className="pb-3 font-semibold">Student Name</th>
                  <th className="pb-3 font-semibold">Plan</th>
                  <th className="pb-3 font-semibold">Amount</th>
                  <th className="pb-3 font-semibold">Mode</th>
                  <th className="pb-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {payments.slice(0, 5).map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="py-3 font-bold text-blue-600">{pay.receiptNumber}</td>
                    <td className="py-3 font-medium text-slate-900 dark:text-white">{pay.studentName}</td>
                    <td className="py-3 text-slate-600 dark:text-slate-300">{pay.planName}</td>
                    <td className="py-3 font-bold text-emerald-600">{settings.currencySymbol}{pay.totalAmount}</td>
                    <td className="py-3 uppercase text-[10px] font-semibold tracking-wide">{pay.paymentMethod}</td>
                    <td className="py-3 text-slate-500">{pay.paymentDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick System Alerts & Today's Attendance */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center">
            <UserCheck className="w-4 h-4 text-emerald-500 mr-2" />
            Today's Attendance Status
          </h3>

          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-900 dark:text-emerald-200">
              <span>Logged In Today</span>
              <span>{todayPresentAttendance} Students</span>
            </div>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
              Recorded via QR Code Scan & Manual Kiosk
            </p>
            <button
              onClick={() => onNavigateTab('attendance')}
              className="w-full mt-2 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
            >
              Mark Attendance / QR Scanner
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60 space-y-2">
            <div className="flex items-center space-x-2 text-amber-900 dark:text-amber-200 font-bold text-xs">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Pending Dues Action</span>
            </div>
            <p className="text-[11px] text-amber-800 dark:text-amber-300">
              {pendingDueStudentsCount} students have pending fee balances requiring WhatsApp reminders.
            </p>
            <button
              onClick={() => onNavigateTab('students')}
              className="w-full py-1.5 rounded-lg bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors"
            >
              Send Reminders
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
