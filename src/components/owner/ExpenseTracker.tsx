import React, { useState } from 'react';
import { Expense, Payment, LibrarySettings } from '../../types';
import { DollarSign, TrendingDown, Plus, TrendingUp, Calendar, CreditCard } from 'lucide-react';

interface ExpenseTrackerProps {
  expenses: Expense[];
  payments: Payment[];
  settings: LibrarySettings;
  onAddExpense: (expense: Partial<Expense>) => void;
}

export const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({
  expenses,
  payments,
  settings,
  onAddExpense
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    category: 'rent' as any,
    title: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    vendorName: '',
    paymentMethod: 'upi' as any,
    notes: ''
  });

  const totalRevenue = payments.reduce((sum, p) => sum + p.totalAmount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netIncome = totalRevenue - totalExpenses;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddExpense(formData);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header & Net Income Summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center">
            <TrendingDown className="w-6 h-6 text-rose-600 mr-2" />
            Library Expenses & Profit Calculator
          </h1>
          <p className="text-xs text-slate-500">
            Track rent, electricity, fiber internet, staff salary, maintenance & calculate net library profit.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-500/20"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          + Record New Expense
        </button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-500">Total Collections (Income)</span>
          <div className="text-2xl font-extrabold text-emerald-600">
            {settings.currencySymbol}{totalRevenue.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-500">Total Operating Expenses</span>
          <div className="text-2xl font-extrabold text-rose-600">
            {settings.currencySymbol}{totalExpenses.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-900 to-blue-950 text-white shadow-xl space-y-2">
          <span className="text-xs font-semibold text-blue-300">Net Profit / Income</span>
          <div className="text-2xl font-extrabold text-emerald-400">
            {settings.currencySymbol}{netIncome.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Expense Log Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase">
                <th className="p-4">Date</th>
                <th className="p-4">Title & Category</th>
                <th className="p-4">Vendor Name</th>
                <th className="p-4">Payment Mode</th>
                <th className="p-4">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="p-4 text-slate-500 font-medium">{exp.date}</td>
                  <td className="p-4">
                    <span className="font-bold text-slate-900 dark:text-white block">{exp.title}</span>
                    <span className="text-[10px] font-semibold uppercase text-rose-600 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded-md">
                      {exp.category}
                    </span>
                  </td>
                  <td className="p-4 text-slate-700 dark:text-slate-300">{exp.vendorName || 'N/A'}</td>
                  <td className="p-4 uppercase text-[10px] font-bold text-slate-600">{exp.paymentMethod}</td>
                  <td className="p-4 font-extrabold text-rose-600 text-sm">
                    {settings.currencySymbol}{exp.amount.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Record Operating Expense</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Expense Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="rent">Building Rent</option>
                  <option value="electricity">Electricity / Power Bill</option>
                  <option value="internet">High Speed Fiber Internet</option>
                  <option value="salary">Staff Salary</option>
                  <option value="tea_coffee">Tea, Coffee & Water</option>
                  <option value="cleaning">Sanitation & Cleaning Supplies</option>
                  <option value="maintenance">Furniture & AC Repairs</option>
                  <option value="other">Other Expenses</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Expense Title / Description *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Airtel Fiber WiFi Bill July"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Amount ({settings.currencySymbol}) *</label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Vendor / Payee Name</label>
                <input
                  type="text"
                  value={formData.vendorName}
                  onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                  placeholder="e.g. Airtel Broadband"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  Save Expense
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
