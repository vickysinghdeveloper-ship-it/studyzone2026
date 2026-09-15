import React, { useState } from 'react';
import {
  CreditCard,
  Search,
  Plus,
  Download,
  FileText,
  DollarSign,
  MessageSquare,
  QrCode,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { Payment, Student, MembershipPlan, LibrarySettings, PaymentMethod } from '../../types';
import { downloadPaymentReceiptPDF } from '../../utils/pdfGenerator';

interface FeeManagementProps {
  payments: Payment[];
  students: Student[];
  plans: MembershipPlan[];
  settings: LibrarySettings;
  onRecordPayment: (paymentData: any) => void;
  defaultStudentIdForCollect?: string;
}

export const FeeManagement: React.FC<FeeManagementProps> = ({
  payments,
  students,
  plans,
  settings,
  onRecordPayment,
  defaultStudentIdForCollect
}) => {
  const [isModalOpen, setIsModalOpen] = useState(Boolean(defaultStudentIdForCollect));
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    studentId: defaultStudentIdForCollect || students[0]?.id || '',
    planId: plans[0]?.id || '',
    amount: plans[0]?.price || 1200,
    discount: 0,
    lateFine: 0,
    paymentMethod: 'upi' as PaymentMethod,
    transactionRef: '',
    notes: ''
  });

  const selectedStudent = students.find((s) => s.id === formData.studentId);
  const selectedPlan = plans.find((p) => p.id === formData.planId);

  const handleOpenCollect = () => {
    setIsModalOpen(true);
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const netTotal = Number(formData.amount) + Number(formData.lateFine) - Number(formData.discount);
    
    onRecordPayment({
      studentId: formData.studentId,
      planId: formData.planId,
      planName: selectedPlan ? selectedPlan.title : 'Monthly Plan',
      amount: Number(formData.amount),
      discount: Number(formData.discount),
      lateFine: Number(formData.lateFine),
      totalAmount: netTotal,
      paymentMethod: formData.paymentMethod,
      transactionRef: formData.transactionRef,
      notes: formData.notes
    });

    setIsModalOpen(false);
  };

  const filteredPayments = payments.filter((pay) =>
    pay.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pay.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pay.studentCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center">
            <CreditCard className="w-6 h-6 text-emerald-600 mr-2" />
            Fee Collection & PDF Receipt Generator
          </h1>
          <p className="text-xs text-slate-500">
            Record payments (UPI, Cash, Card, Bank Transfer), generate PDF receipts & send WhatsApp fee reminders.
          </p>
        </div>

        <button
          onClick={handleOpenCollect}
          className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          + Collect Fee / Record Receipt
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-sm flex items-center justify-between gap-4 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search receipts by receipt #, student name or code..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>
        <span className="text-slate-500 font-medium">Total Receipts: {filteredPayments.length}</span>
      </div>

      {/* Receipts Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase">
                <th className="p-4">Receipt #</th>
                <th className="p-4">Student Name</th>
                <th className="p-4">Plan Description</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Payment Mode</th>
                <th className="p-4">Payment Date</th>
                <th className="p-4 text-right">Receipt Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {filteredPayments.map((pay) => (
                <tr key={pay.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="p-4 font-bold text-blue-600 font-mono">{pay.receiptNumber}</td>
                  <td className="p-4">
                    <span className="font-bold text-slate-900 dark:text-white block">{pay.studentName}</span>
                    <span className="text-[11px] text-slate-500 font-mono">{pay.studentCode}</span>
                  </td>
                  <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">{pay.planName}</td>
                  <td className="p-4 font-extrabold text-emerald-600 text-sm">
                    {settings.currencySymbol}{pay.totalAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="p-4 uppercase text-[10px] font-bold tracking-wide text-slate-600">
                    {pay.paymentMethod}
                  </td>
                  <td className="p-4 text-slate-500">{pay.paymentDate}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => downloadPaymentReceiptPDF(pay, settings)}
                        className="inline-flex items-center px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs"
                        title="Download PDF Receipt"
                      >
                        <Download className="w-3.5 h-3.5 mr-1" />
                        PDF Receipt
                      </button>

                      <a
                        href={`https://wa.me/${pay.studentPhone?.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(pay.studentName)},%20here%20is%20your%20payment%20receipt%20${encodeURIComponent(pay.receiptNumber)}%20for%20${settings.currencySymbol}${pay.totalAmount}%20at%20${encodeURIComponent(settings.libraryName)}.`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-xl text-emerald-600 hover:bg-emerald-50"
                        title="Send Receipt via WhatsApp"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Collect Fee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Record New Fee Payment</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleSubmitPayment} className="space-y-4 text-xs">
              
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Select Student *</label>
                <select
                  required
                  value={formData.studentId}
                  onChange={(e) => {
                    const st = students.find((s) => s.id === e.target.value);
                    setFormData({ ...formData, studentId: e.target.value });
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-medium"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.studentCode} • Ph: {s.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Select Membership Plan *</label>
                <select
                  required
                  value={formData.planId}
                  onChange={(e) => {
                    const p = plans.find((pl) => pl.id === e.target.value);
                    setFormData({
                      ...formData,
                      planId: e.target.value,
                      amount: p ? p.price : 1200
                    });
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-medium"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({settings.currencySymbol}{p.price})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Plan Fee</label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Discount</label>
                  <input
                    type="number"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Late Fine</label>
                  <input
                    type="number"
                    value={formData.lateFine}
                    onChange={(e) => setFormData({ ...formData, lateFine: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-medium"
                  >
                    <option value="upi">UPI / PayTM / PhonePe</option>
                    <option value="cash">Cash</option>
                    <option value="card">Debit / Credit Card</option>
                    <option value="bank_transfer">Bank Transfer (NEFT/IMPS)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Txn / Reference ID</label>
                  <input
                    type="text"
                    placeholder="e.g. UPI/12345/PayTM"
                    value={formData.transactionRef}
                    onChange={(e) => setFormData({ ...formData, transactionRef: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              {/* UPI Payment QR display if UPI selected */}
              {formData.paymentMethod === 'upi' && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2 text-center">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Scan QR to Collect Fee via UPI:</span>
                    <span className="font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200">
                      {settings.upiId || '6209332827zbl@ybl'}
                    </span>
                  </div>
                  <div className="bg-white p-2 rounded-xl inline-block shadow-sm border border-slate-200">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                        `upi://pay?pa=${settings.upiId || '6209332827zbl@ybl'}&pn=${encodeURIComponent(
                          settings.libraryName
                        )}&am=${Number(formData.amount) + Number(formData.lateFine) - Number(formData.discount)}&cu=INR`
                      )}`}
                      alt="Fee Collection UPI QR"
                      className="w-36 h-36 mx-auto rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* Net Payable Summary */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 flex items-center justify-between">
                <span className="font-bold text-emerald-900 dark:text-emerald-200">Net Total to Record:</span>
                <span className="text-xl font-extrabold text-emerald-600">
                  {settings.currencySymbol}{(Number(formData.amount) + Number(formData.lateFine) - Number(formData.discount)).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-500/20"
                >
                  Generate Receipt PDF & Save
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
