import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Phone,
  QrCode,
  Download,
  CreditCard,
  AlertCircle,
  CheckCircle,
  FileText,
  UserCheck,
  Shield,
  MessageSquare,
  Key,
  Copy,
  Check,
  Share2,
  EyeOff,
  RefreshCw,
  Lock,
  Sparkles
} from 'lucide-react';
import { Student, MembershipPlan, Seat, LibrarySettings } from '../../types';
import { downloadStudentCardPDF } from '../../utils/pdfGenerator';
import { generateQRCodeDataUrl } from '../../utils/qrGenerator';

interface StudentManagementProps {
  students: Student[];
  plans: MembershipPlan[];
  seats: Seat[];
  settings: LibrarySettings;
  onSaveStudent: (student: Partial<Student>) => void;
  onDeleteStudent: (id: string) => void;
  onOpenCollectFee: (studentId?: string) => void;
  onNavigateTab: (tab: string) => void;
  validateSeatAvailability?: (seatId?: string, planId?: string, studentId?: string) => { valid: boolean; reason?: string };
}

export const StudentManagement: React.FC<StudentManagementProps> = ({
  students,
  plans,
  seats,
  settings,
  onSaveStudent,
  onDeleteStudent,
  onOpenCollectFee,
  onNavigateTab,
  validateSeatAvailability
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [shiftFilter, setShiftFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const [selectedStudentForView, setSelectedStudentForView] = useState<Student | null>(null);
  const [printCardStudent, setPrintCardStudent] = useState<Student | null>(null);
  const [cardQrUrl, setCardQrUrl] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Credential Copy & Password View States
  const [copiedStudentId, setCopiedStudentId] = useState<string | null>(null);
  const [showPasswordInForm, setShowPasswordInForm] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '123456',
    gender: 'male' as 'male' | 'female' | 'other',
    aadhaarNumber: '',
    guardianName: '',
    guardianPhone: '',
    emergencyContact: '',
    address: '',
    collegeOrWork: '',
    targetExam: '',
    planId: plans[0]?.id || '',
    shift: 'morning' as any,
    seatId: '',
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    totalPaid: 1200,
    pendingFee: 0,
    notes: ''
  });

  const generateRandomPassword = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';
    let pass = '';
    for (let i = 0; i < 6; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  const getStudentCredentialMessage = (
    studentName: string,
    phone: string,
    studentCode: string,
    pass: string,
    libraryName: string
  ) => {
    return `Hi ${studentName} 👋\n\nWelcome to ${libraryName} Student Portal!\n\nHere are your Student Portal Login Credentials:\n\n📱 Login Mobile: ${phone}\n🆔 Student Code: ${studentCode || 'SZ-2026-001'}\n🔑 Password: ${pass}\n\nYou can log into your Student Portal to view your desk assignment, active shift, fee receipts & attendance records!\n\nThank you!`;
  };

  const handleCopyCredentials = (student: { name: string; phone: string; studentCode: string; password?: string }) => {
    const pass = student.password || '123456';
    const msg = getStudentCredentialMessage(student.name, student.phone, student.studentCode, pass, settings.libraryName);
    navigator.clipboard.writeText(msg);
    setCopiedStudentId(student.studentCode || 'copied');
    setTimeout(() => setCopiedStudentId(null), 2500);
  };

  // Filter logic
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.phone.includes(searchTerm) ||
      (student.seatNumber && student.seatNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesShift = shiftFilter === 'all' || student.shift === shiftFilter;
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;

    return matchesSearch && matchesShift && matchesStatus;
  });

  // Only show seats that are AVAILABLE for the selected plan / time slot!
  const availableSeatsForForm = seats.filter((s) => {
    if ((s as any).status === 'blocked' || (s as any).status === 'maintenance') return false;
    if (validateSeatAvailability) {
      const check = validateSeatAvailability(s.id, formData.planId, editingStudent?.id);
      return check.valid;
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setShowPasswordInForm(false);
    setFormData({
      name: '',
      phone: '',
      email: '',
      password: '123456',
      gender: 'male',
      aadhaarNumber: '',
      guardianName: '',
      guardianPhone: '',
      emergencyContact: '',
      address: '',
      collegeOrWork: '',
      targetExam: 'UPSC / Competitive Exams',
      planId: plans[0]?.id || '',
      shift: 'morning',
      seatId: '',
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      totalPaid: plans[0]?.price || 1200,
      pendingFee: 0,
      notes: ''
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setShowPasswordInForm(false);
    const matchedSeat = seats.find(
      (s) => s.id === student.seatId || (student.seatNumber && s.seatNumber === student.seatNumber)
    );
    setFormData({
      name: student.name,
      phone: student.phone,
      email: student.email,
      password: student.password || '123456',
      gender: student.gender || 'male',
      aadhaarNumber: student.aadhaarNumber || '',
      guardianName: student.guardianName || '',
      guardianPhone: student.guardianPhone || '',
      emergencyContact: student.emergencyContact || '',
      address: student.address || '',
      collegeOrWork: student.collegeOrWork || '',
      targetExam: student.targetExam || '',
      planId: student.planId || plans[0]?.id || '',
      shift: student.shift,
      seatId: matchedSeat ? matchedSeat.id : (student.seatId || ''),
      expiryDate: student.expiryDate,
      totalPaid: student.totalPaid || 0,
      pendingFee: student.pendingFee || 0,
      notes: student.notes || ''
    });
    setIsAddModalOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.seatId && validateSeatAvailability) {
      const check = validateSeatAvailability(formData.seatId, formData.planId, editingStudent?.id);
      if (!check.valid) {
        alert(check.reason);
        return;
      }
    }
    const selectedPlan = plans.find((p) => p.id === formData.planId);
    
    onSaveStudent({
      ...(editingStudent ? { id: editingStudent.id, studentCode: editingStudent.studentCode } : {}),
      ...formData,
      password: formData.password || '123456',
      planName: selectedPlan ? selectedPlan.title : 'Monthly Plan'
    });

    setIsAddModalOpen(false);
  };

  const handleOpenPrintCardModal = async (student: Student) => {
    setPrintCardStudent(student);
    try {
      const qrData = JSON.stringify({
        code: student.studentCode,
        name: student.name,
        seat: student.seatNumber || 'Unassigned',
        phone: student.phone
      });
      const url = await generateQRCodeDataUrl(qrData);
      setCardQrUrl(url);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadCard = async (student: Student) => {
    await downloadStudentCardPDF(student, settings);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center">
            <Users className="w-6 h-6 text-blue-600 mr-2" />
            Student Directory ({students.length})
          </h1>
          <p className="text-xs text-slate-500">
            Manage student profiles, seat assignments, ID cards & fee dues.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          + Add New Student
        </button>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
        
        {/* Search Field */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, code, phone or seat (e.g. G-01)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>

        {/* Shift Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={shiftFilter}
            onChange={(e) => setShiftFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-medium"
          >
            <option value="all">All Shifts</option>
            <option value="morning">Morning Shift</option>
            <option value="evening">Evening Shift</option>
            <option value="night">Night Shift</option>
            <option value="fullday">Full Day Pass</option>
          </select>
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-medium"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active Members</option>
          <option value="pending_due">Pending Dues</option>
          <option value="expired">Expired Memberships</option>
        </select>

      </div>

      {/* Students Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase tracking-wider">
                <th className="p-4">Student</th>
                <th className="p-4">Shift & Seat</th>
                <th className="p-4">Target Exam</th>
                <th className="p-4">Expiry Date</th>
                <th className="p-4">Status & Dues</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-sm">
                    No students found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((std) => (
                  <tr key={std.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    
                    {/* Student Info */}
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={std.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
                          alt={std.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block text-sm">{std.name}</span>
                          <span className="text-[11px] font-mono text-blue-600 dark:text-blue-400">{std.studentCode} • Ph: {std.phone}</span>
                          <div className="mt-1 flex items-center space-x-1.5">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-[10px] font-mono font-bold border border-blue-200/60 dark:border-blue-800/60">
                              <Key className="w-2.5 h-2.5 mr-0.5 text-blue-500" />
                              Pass: {std.password || '123456'}
                            </span>
                            <button
                              onClick={() => handleCopyCredentials(std)}
                              className="text-[10px] font-bold text-slate-500 hover:text-blue-600 inline-flex items-center space-x-0.5 cursor-pointer bg-slate-100 dark:bg-slate-700/60 px-1.5 py-0.5 rounded"
                              title="Copy Login Credentials Message"
                            >
                              {copiedStudentId === std.studentCode ? (
                                <span className="text-emerald-600 flex items-center">
                                  <Check className="w-2.5 h-2.5 mr-0.5" /> Copied
                                </span>
                              ) : (
                                <span className="flex items-center">
                                  <Copy className="w-2.5 h-2.5 mr-0.5 text-slate-400" /> Copy Login
                                </span>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Shift & Seat */}
                    <td className="p-4">
                      <div>
                        <span className="inline-block font-bold text-xs px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300 capitalize mb-0.5">
                          {std.shift}
                        </span>
                        <span className="block text-[11px] font-medium text-slate-600 dark:text-slate-300">
                          Seat: <strong className="text-slate-900 dark:text-white">{std.seatNumber || 'Unassigned'}</strong>
                        </span>
                      </div>
                    </td>

                    {/* Target Exam */}
                    <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">
                      {std.targetExam || 'N/A'}
                    </td>

                    {/* Expiry Date */}
                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      {std.expiryDate}
                    </td>

                    {/* Status & Dues */}
                    <td className="p-4">
                      {std.pendingFee > 0 ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
                            Due: {settings.currencySymbol}{std.pendingFee}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                          Active
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        
                        <button
                          onClick={() => setSelectedStudentForView(std)}
                          className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                          title="View Profile & Smart ID Card"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDownloadCard(std)}
                          className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                          title="Download Smart Printable ID Card PDF"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onOpenCollectFee(std.id)}
                          className="p-2 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                          title="Collect Fee / Record Receipt"
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>

                        <a
                          href={`https://wa.me/${std.phone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(std.name)},%20this%20is%20a%20reminder%20from%20${encodeURIComponent(settings.libraryName)}%20regarding%20your%20membership.`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50"
                          title="Send WhatsApp Reminder"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </a>

                        <button
                          onClick={() => handleOpenEdit(std)}
                          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                          title="Edit Student"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onDeleteStudent(std.id)}
                          className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                          title="Delete Student"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Student Drawer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingStudent ? 'Edit Student Details' : 'Add New Student Admission'}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">✕</button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Full Student Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Aadhaar Card Number</label>
                  <input
                    type="text"
                    placeholder="xxxx-xxxx-xxxx"
                    value={formData.aadhaarNumber}
                    onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Target Exam / College</label>
                  <input
                    type="text"
                    placeholder="e.g. UPSC / NEET / CA / GATE"
                    value={formData.targetExam}
                    onChange={(e) => setFormData({ ...formData, targetExam: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Guardian Name & Contact</label>
                  <input
                    type="text"
                    placeholder="Guardian Name & Phone"
                    value={formData.guardianName}
                    onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Emergency Contact Number</label>
                  <input
                    type="text"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Membership Plan *</label>
                  <select
                    value={formData.planId}
                    onChange={(e) => {
                      const p = plans.find((pl) => pl.id === e.target.value);
                      setFormData({
                        ...formData,
                        planId: e.target.value,
                        shift: p ? p.shift : 'morning',
                        totalPaid: p ? p.price : 1200
                      });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({settings.currencySymbol}{p.price} - {p.shiftTiming})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Assign Seat Number</label>
                  <select
                    value={formData.seatId}
                    onChange={(e) => setFormData({ ...formData, seatId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  >
                    <option value="">No Seat / Unassigned</option>
                    {availableSeatsForForm.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.seatNumber} ({s.floorZone.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Membership Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Fee Amount Paid ({settings.currencySymbol})</label>
                  <input
                    type="number"
                    value={formData.totalPaid}
                    onChange={(e) => setFormData({ ...formData, totalPaid: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Address</label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Local address"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              {/* Portal Login Credentials Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-blue-950/40 p-4 rounded-2xl border border-blue-200/80 dark:border-blue-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded-lg bg-blue-600 text-white">
                      <Key className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                        Student Portal Login Credentials
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Student logs in using Mobile Number / Student Code and this Password.
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                    Portal Enabled
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                      Login ID
                    </label>
                    <div className="px-3 py-2.5 rounded-xl bg-white/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono text-xs flex items-center justify-between">
                      <span className="font-bold">{formData.phone || 'Enter mobile above'}</span>
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">({editingStudent?.studentCode || 'Code Auto-Gen'})</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                      Portal Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswordInForm ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Password (default 123456)"
                        className="w-full pl-3 pr-20 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs font-bold"
                      />
                      <div className="absolute right-2 top-2 flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => setShowPasswordInForm(!showPasswordInForm)}
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          title={showPasswordInForm ? 'Hide Password' : 'Show Password'}
                        >
                          {showPasswordInForm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, password: generateRandomPassword() })}
                          className="p-1 text-blue-600 hover:text-blue-700 font-bold text-[10px]"
                          title="Generate Random Password"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Share Credentials Actions inside Form */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-blue-200/50 dark:border-blue-900/50">
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">
                    💡 Initial default password is <code className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border text-blue-600 dark:text-blue-400 font-bold font-mono">123456</code>.
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        const msg = getStudentCredentialMessage(
                          formData.name || 'Student',
                          formData.phone || 'N/A',
                          editingStudent?.studentCode || 'SZ-2026-001',
                          formData.password || '123456',
                          settings.libraryName
                        );
                        navigator.clipboard.writeText(msg);
                        setCopiedStudentId('form_copied');
                        setTimeout(() => setCopiedStudentId(null), 2500);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold flex items-center space-x-1 cursor-pointer shadow-xs"
                    >
                      {copiedStudentId === 'form_copied' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Copied Info!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-blue-600" />
                          <span>Copy Login Info</span>
                        </>
                      )}
                    </button>

                    {formData.phone && (
                      <a
                        href={`https://wa.me/${formData.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          getStudentCredentialMessage(
                            formData.name || 'Student',
                            formData.phone,
                            editingStudent?.studentCode || 'SZ-2026-001',
                            formData.password || '123456',
                            settings.libraryName
                          )
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center space-x-1 shadow-sm"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Send via WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20"
                >
                  Save Student
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Student View Profile Modal */}
      {selectedStudentForView && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
              <div className="flex items-center space-x-3">
                <img src={selectedStudentForView.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedStudentForView.name}</h3>
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-mono">{selectedStudentForView.studentCode}</span>
                </div>
              </div>
              <button onClick={() => setSelectedStudentForView(null)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900">
                <div>
                  <span className="text-slate-400 block font-semibold">Assigned Seat</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{selectedStudentForView.seatNumber || 'None'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Shift Timing</span>
                  <span className="text-sm font-bold capitalize text-blue-600">{selectedStudentForView.shift}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Target Exam</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedStudentForView.targetExam || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Valid Until</span>
                  <span className="font-bold text-emerald-600">{selectedStudentForView.expiryDate}</span>
                </div>
              </div>

              {/* Dedicated Portal Credentials Card in Profile Modal */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-blue-950/60 border border-blue-200/80 dark:border-blue-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded-lg bg-blue-600 text-white">
                      <Key className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                        Student Portal Login Credentials
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Provided to student to access their Student Portal
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    Active
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="bg-white/80 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Login Identifier</span>
                    <span className="font-extrabold text-slate-900 dark:text-white font-mono">{selectedStudentForView.phone}</span>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold block">or Code: {selectedStudentForView.studentCode}</span>
                  </div>

                  <div className="bg-white/80 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Portal Password</span>
                      <span className="font-extrabold text-slate-900 dark:text-white font-mono">
                        {selectedStudentForView.password || '123456'}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedStudentForView.password || '123456');
                        setCopiedStudentId(`pass_${selectedStudentForView.id}`);
                        setTimeout(() => setCopiedStudentId(null), 2000);
                      }}
                      className="p-1 text-slate-400 hover:text-blue-600 cursor-pointer"
                      title="Copy Password"
                    >
                      {copiedStudentId === `pass_${selectedStudentForView.id}` ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => handleCopyCredentials(selectedStudentForView)}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center space-x-1.5 shadow-xs cursor-pointer"
                  >
                    {copiedStudentId === selectedStudentForView.studentCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied Message!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-blue-600" />
                        <span>Copy Login Credentials</span>
                      </>
                    )}
                  </button>

                  <a
                    href={`https://wa.me/${selectedStudentForView.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      getStudentCredentialMessage(
                        selectedStudentForView.name,
                        selectedStudentForView.phone,
                        selectedStudentForView.studentCode,
                        selectedStudentForView.password || '123456',
                        settings.libraryName
                      )
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Send Login Details via WhatsApp</span>
                  </a>
                </div>
              </div>

              <div className="space-y-1.5 text-slate-700 dark:text-slate-300">
                <p><strong>Mobile Phone:</strong> {selectedStudentForView.phone}</p>
                <p><strong>Aadhaar Number:</strong> {selectedStudentForView.aadhaarNumber || 'N/A'}</p>
                <p><strong>Emergency Contact:</strong> {selectedStudentForView.emergencyContact || 'N/A'}</p>
                <p><strong>Address:</strong> {selectedStudentForView.address || 'N/A'}</p>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => handleOpenPrintCardModal(selectedStudentForView)}
                className="flex-1 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/20"
              >
                <QrCode className="w-4 h-4" />
                <span>Print ID Card</span>
              </button>
              <button
                onClick={() => handleDownloadCard(selectedStudentForView)}
                className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Print Smart ID Card Modal */}
      {printCardStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="flex items-center space-x-2">
                <QrCode className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Smart Library ID Card</h3>
              </div>
              <button
                onClick={() => setPrintCardStudent(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Rendered ID Card Box */}
            <div id="printable-id-card" className="mx-auto w-[280px] bg-slate-900 text-white rounded-2xl overflow-hidden shadow-xl border border-slate-700 p-4 space-y-3">
              {/* Card Header */}
              <div className="text-center pb-2 border-b border-slate-800">
                <p className="text-xs font-black uppercase tracking-wider text-blue-400">{settings.libraryName}</p>
                <p className="text-[10px] text-slate-400">{settings.tagline}</p>
              </div>

              {/* Student Header */}
              <div className="flex items-center space-x-3">
                <img
                  src={printCardStudent.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
                  className="w-12 h-12 rounded-full object-cover border-2 border-blue-500"
                  alt={printCardStudent.name}
                />
                <div>
                  <h4 className="text-sm font-bold">{printCardStudent.name}</h4>
                  <p className="text-[11px] font-mono text-emerald-400">{printCardStudent.studentCode}</p>
                  <p className="text-[10px] text-slate-300">Exam: {printCardStudent.targetExam || 'N/A'}</p>
                </div>
              </div>

              {/* Details List */}
              <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-800/80 rounded-xl p-2.5">
                <div>
                  <span className="text-slate-400 block">SEAT NO</span>
                  <span className="font-bold text-yellow-400 text-xs">{printCardStudent.seatNumber || 'Unassigned'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">SHIFT</span>
                  <span className="font-bold text-blue-300 capitalize">{printCardStudent.shift}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">PHONE</span>
                  <span className="font-bold">{printCardStudent.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">VALID TILL</span>
                  <span className="font-bold text-emerald-400">{printCardStudent.expiryDate}</span>
                </div>
              </div>

              {/* QR Code Block */}
              <div className="flex flex-col items-center justify-center pt-1">
                {cardQrUrl ? (
                  <img src={cardQrUrl} className="w-24 h-24 rounded-lg bg-white p-1 shadow-md" alt="Student QR Code" />
                ) : (
                  <div className="w-24 h-24 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] text-slate-400">
                    Generating...
                  </div>
                )}
                <p className="text-[9px] text-slate-400 mt-1">Scan for Fast Gate Check-In</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs flex items-center justify-center space-x-2"
              >
                <span>Print ID Card</span>
              </button>
              <button
                onClick={() => handleDownloadCard(printCardStudent)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
