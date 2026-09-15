import React, { useState } from 'react';
import {
  UserCheck,
  QrCode,
  CheckCircle,
  Clock,
  Search,
  Download,
  Calendar as CalendarIcon,
  XCircle,
  AlertCircle,
  Camera
} from 'lucide-react';
import { AttendanceRecord, Student, LibrarySettings } from '../../types';
import { QRScannerModal } from '../student/QRScannerModal';

interface AttendanceTrackerProps {
  attendance: AttendanceRecord[];
  students: Student[];
  settings: LibrarySettings;
  onMarkAttendance: (data: { studentId?: string; studentCode?: string; status?: string; mode?: string; notes?: string }) => void;
}

export const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({
  attendance,
  students,
  settings,
  onMarkAttendance
}) => {
  const [activeTab, setActiveTab] = useState<'log' | 'qr_kiosk' | 'manual'>('log');
  const [qrCodeInput, setQrCodeInput] = useState('');
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showScannerModal, setShowScannerModal] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecords = attendance.filter((a) => a.date === todayStr);

  const presentTodayCount = todayRecords.filter((a) => a.status === 'present' || a.status === 'late').length;

  const handleQrScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrCodeInput.trim()) return;

    onMarkAttendance({
      studentCode: qrCodeInput.trim(),
      status: 'present',
      mode: 'qr_scan'
    });

    setScanMessage(`Success: Attendance marked for ${qrCodeInput}!`);
    setQrCodeInput('');

    setTimeout(() => {
      setScanMessage(null);
    }, 3000);
  };

  const handleManualMark = (studentId: string, status: string) => {
    onMarkAttendance({
      studentId,
      status,
      mode: 'manual'
    });
  };

  const filteredLogs = attendance.filter((record) =>
    record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.studentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (record.seatNumber && record.seatNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center">
            <UserCheck className="w-6 h-6 text-emerald-600 mr-2" />
            Attendance Management & QR Kiosk
          </h1>
          <p className="text-xs text-slate-500">
            QR code attendance scanning, manual check-in, monthly attendance calendar & logs.
          </p>
        </div>

        {/* Today Summary */}
        <div className="flex items-center space-x-3 text-xs font-bold">
          <div className="px-3.5 py-2 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
            Today Present: {presentTodayCount} Students
          </div>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-700 pb-2">
        <button
          onClick={() => setActiveTab('log')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-colors ${
            activeTab === 'log'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Attendance Logs
        </button>

        <button
          onClick={() => setActiveTab('qr_kiosk')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-colors flex items-center space-x-1.5 ${
            activeTab === 'qr_kiosk'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>QR Scanner Kiosk</span>
        </button>

        <button
          onClick={() => setActiveTab('manual')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-colors ${
            activeTab === 'manual'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Quick Manual Check-in
        </button>
      </div>

      {/* Mode 1: Attendance Log Table */}
      {activeTab === 'log' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-sm flex items-center justify-between gap-4 text-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter logs by student name or ID..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
            <span className="text-slate-500">Total Records: {filteredLogs.length}</span>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase">
                    <th className="p-4">Date</th>
                    <th className="p-4">Student</th>
                    <th className="p-4">Seat #</th>
                    <th className="p-4">Check-in Time</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Scan Mode</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                      <td className="p-4 font-semibold text-slate-900 dark:text-white">{log.date}</td>
                      <td className="p-4">
                        <span className="font-bold text-slate-900 dark:text-white block">{log.studentName}</span>
                        <span className="text-[11px] font-mono text-blue-600">{log.studentCode}</span>
                      </td>
                      <td className="p-4 font-bold">{log.seatNumber || 'N/A'}</td>
                      <td className="p-4 font-medium text-slate-700 dark:text-slate-300">{log.checkInTime}</td>
                      <td className="p-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 capitalize">
                          {log.status}
                        </span>
                      </td>
                      <td className="p-4 uppercase text-[10px] font-semibold tracking-wide text-slate-500">
                        {log.mode}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: QR Scanner Kiosk */}
      {activeTab === 'qr_kiosk' && (
        <div className="max-w-xl mx-auto p-8 rounded-3xl bg-slate-900 text-white shadow-2xl space-y-6 text-center border border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/20 text-blue-400 mx-auto flex items-center justify-center">
            <QrCode className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-extrabold">Student QR Attendance Kiosk</h3>
            <p className="text-xs text-slate-400">
              Scan student ID card QR code or enter student code (e.g. SZ-2026-001) below to log instant attendance.
            </p>
          </div>

          {scanMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs animate-bounce">
              {scanMessage}
            </div>
          )}

          <form onSubmit={handleQrScanSubmit} className="space-y-4">
            <button
              type="button"
              onClick={() => setShowScannerModal(true)}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/25 cursor-pointer active:scale-95 transition-all"
            >
              <Camera className="w-4 h-4" />
              <span>Launch Live Camera QR Scanner</span>
            </button>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-700"></div>
              <span className="flex-shrink mx-3 text-[10px] uppercase font-extrabold text-slate-500 tracking-wider">or enter manually / scan USB reader</span>
              <div className="flex-grow border-t border-slate-700"></div>
            </div>

            <input
              type="text"
              autoFocus
              value={qrCodeInput}
              onChange={(e) => setQrCodeInput(e.target.value)}
              placeholder="Scan or type Student Code (e.g. SZ-2026-001)..."
              className="w-full px-4 py-3.5 rounded-2xl bg-slate-800 border border-slate-700 text-white text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 cursor-pointer"
            >
              Record Attendance Check-in
            </button>
          </form>

          <p className="text-[11px] text-slate-500">
            Tip: Connect USB Barcode/QR Scanner to kiosk PC for automatic hands-free scanning.
          </p>
        </div>
      )}

      {/* Mode 3: Quick Manual Check-in Directory */}
      {activeTab === 'manual' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">One-Click Student Attendance Check-in</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {students.map((st) => {
              const isCheckedIn = todayRecords.some((a) => a.studentId === st.id);
              return (
                <div key={st.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">{st.name}</span>
                    <span className="text-[11px] text-slate-500 font-mono">{st.studentCode} • Seat {st.seatNumber || 'N/A'}</span>
                  </div>

                  {isCheckedIn ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Checked In
                    </span>
                  ) : (
                    <button
                      onClick={() => handleManualMark(st.id, 'present')}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors"
                    >
                      Mark Present
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* QR Scanner Modal */}
      {showScannerModal && students.length > 0 && (
        <QRScannerModal
          isOpen={showScannerModal}
          onClose={() => setShowScannerModal(false)}
          currentStudent={students[0]}
          allStudents={students}
          onMarkAttendance={(data) => {
            onMarkAttendance({
              ...data,
              mode: 'qr_scan'
            });
            setScanMessage(`Success: Attendance recorded via QR scan!`);
            setTimeout(() => setScanMessage(null), 3500);
          }}
        />
      )}

    </div>
  );
};
