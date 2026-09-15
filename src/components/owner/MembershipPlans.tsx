import React, { useState } from 'react';
import { MembershipPlan, LibrarySettings } from '../../types';
import { Plus, Clock, Edit3, Trash2, Zap, CheckCircle2, Info, Building2 } from 'lucide-react';

interface MembershipPlansProps {
  plans: MembershipPlan[];
  settings: LibrarySettings;
  onSavePlan: (plan: Partial<MembershipPlan>) => void;
  onDeletePlan?: (planId: string) => void;
}

export const MembershipPlans: React.FC<MembershipPlansProps> = ({
  plans,
  settings,
  onSavePlan,
  onDeletePlan
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    shiftTiming: '06:00 - 12:00',
    price: 500,
    days: 'All Days',
    durationDays: 30,
    description: '',
    isActive: true
  });

  const handleOpenAdd = () => {
    setEditingPlan(null);
    setFormData({
      title: '',
      shiftTiming: '06:00 - 12:00',
      price: 500,
      days: 'All Days',
      durationDays: 30,
      description: 'Standard monthly study time slot.',
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (plan: MembershipPlan) => {
    setEditingPlan(plan);
    setFormData({
      title: plan.title,
      shiftTiming: plan.shiftTiming,
      price: plan.price,
      days: plan.days || 'All Days',
      durationDays: plan.durationDays || 30,
      description: plan.description || '',
      isActive: plan.isActive
    });
    setIsModalOpen(true);
  };

  const handleToggleActive = (plan: MembershipPlan) => {
    onSavePlan({
      ...plan,
      isActive: !plan.isActive
    });
  };

  const handleDelete = (planId: string, title: string) => {
    if (confirm(`Are you sure you want to delete slot "${title}"?`)) {
      if (onDeletePlan) {
        onDeletePlan(planId);
      }
    }
  };

  const handleCreateQuickSlots = () => {
    const quickSlots = [
      { id: 'slot_morning', title: 'Morning', shiftTiming: '06:00 - 23:00', price: 500, days: 'All Days' },
      { id: 'slot_fullday', title: 'Full Day', shiftTiming: '06:00 - 22:00', price: 1200, days: 'All Days' },
      { id: 'slot_noon_evening', title: 'Noon + Evening', shiftTiming: '11:00 - 22:00', price: 1000, days: 'All Days' },
      { id: 'slot_afternoon', title: 'Afternoon', shiftTiming: '11:00 - 16:00', price: 700, days: 'All Days' },
      { id: 'slot_evening', title: 'Evening', shiftTiming: '16:00 - 22:00', price: 700, days: 'All Days' },
      { id: 'slot_night', title: 'Night', shiftTiming: '22:00 - 06:00 (Next Day)', price: 500, days: 'All Days' }
    ];

    quickSlots.forEach((s) => {
      onSavePlan({
        id: s.id,
        title: s.title,
        shift: 'custom',
        shiftTiming: s.shiftTiming,
        days: s.days,
        price: s.price,
        durationDays: 30,
        isActive: true,
        features: ['WiFi Access', 'Power Socket', 'RO Water']
      });
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePlan({
      ...(editingPlan ? { id: editingPlan.id } : {}),
      title: formData.title,
      shift: 'custom',
      shiftTiming: formData.shiftTiming,
      days: formData.days,
      durationDays: Number(formData.durationDays),
      price: Number(formData.price),
      description: formData.description,
      isActive: formData.isActive
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header & Quick Action Bar */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center">
              <Clock className="w-6 h-6 text-indigo-600 mr-2.5" />
              Time Slots
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Configure library shifts, time ranges, monthly fees, and active slot statuses.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Select Library */}
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Select Library
              </span>
              <select className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="main">{settings.libraryName.toUpperCase()} LIBRARY</option>
                <option value="branch1">STUDY ZONE - BRANCH 1</option>
                <option value="branch2">STUDY ZONE - CENTRAL BRANCH</option>
              </select>
            </div>

            {/* Create Quick Slots Button */}
            <button
              onClick={handleCreateQuickSlots}
              className="inline-flex items-center px-4 py-2.5 mt-4 sm:mt-0 rounded-xl text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all cursor-pointer"
              title="Generate standard library slots (Morning, Afternoon, Evening, Night, Full Day)"
            >
              Create Quick Slots
            </button>

            {/* Add Slot Button */}
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center px-4 py-2.5 mt-4 sm:mt-0 rounded-xl text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all cursor-pointer"
            >
              + Add Slot
            </button>
          </div>
        </div>
      </div>

      {/* Time Slots Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-4 px-6">SLOT NAME</th>
                <th className="py-4 px-6">TIME RANGE</th>
                <th className="py-4 px-6">MONTHLY FEE</th>
                <th className="py-4 px-6">DAY</th>
                <th className="py-4 px-6">STATUS</th>
                <th className="py-4 px-6 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs font-medium text-slate-800 dark:text-slate-200">
              {plans.map((slot) => {
                const isOvernight = slot.shiftTiming.toLowerCase().includes('next day');
                return (
                  <tr key={slot.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                    
                    {/* Slot Name */}
                    <td className="py-4 px-6 font-extrabold text-sm text-slate-900 dark:text-white">
                      {slot.title}
                    </td>

                    {/* Time Range */}
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {slot.shiftTiming}
                        </span>
                        {isOvernight && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-extrabold">
                            Overnight
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Monthly Fee */}
                    <td className="py-4 px-6 font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                      {settings.currencySymbol}{slot.price.toLocaleString('en-IN')}
                    </td>

                    {/* Day */}
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-400">
                      {slot.days || 'All Days'}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      {slot.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right space-x-3">
                      <button
                        onClick={() => handleOpenEdit(slot)}
                        className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        Edit
                      </button>
                      
                      <button
                        onClick={() => handleToggleActive(slot)}
                        className={`font-bold cursor-pointer ${
                          slot.isActive ? 'text-amber-600 hover:underline' : 'text-emerald-600 hover:underline'
                        }`}
                      >
                        {slot.isActive ? 'Deactivate' : 'Activate'}
                      </button>

                      <button
                        onClick={() => handleDelete(slot.id, slot.title)}
                        className="font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* How Slots Work Explanation Card */}
      <div className="bg-blue-50/80 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 rounded-3xl p-6 border border-blue-200/90 dark:border-blue-900/60 shadow-sm space-y-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg">💡</span>
          <h3 className="text-base font-extrabold text-blue-900 dark:text-blue-200">
            How Slots Work
          </h3>
        </div>

        <ul className="space-y-2 text-xs leading-relaxed text-blue-950 dark:text-slate-300">
          <li className="flex items-start space-x-2">
            <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
            <span><strong className="text-blue-900 dark:text-white font-extrabold">Single Slot Mode:</strong> One student per seat for the whole day</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
            <span><strong className="text-blue-900 dark:text-white font-extrabold">Multiple Slot Mode:</strong> Different students can use the same seat in different time slots</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
            <span><strong className="text-blue-900 dark:text-white font-extrabold">Quick Slots:</strong> Creates 4 default slots (Morning, Afternoon, Evening, Night)</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
            <span><strong className="text-blue-900 dark:text-white font-extrabold">Day-specific:</strong> You can create slots for specific days or all days</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
            <span><strong className="text-blue-900 dark:text-white font-extrabold">Overnight Slots:</strong> Slots can cross midnight (e.g., 6:00 AM to 5:59 AM next day) - marked as "Next Day"</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
            <span><strong className="text-blue-900 dark:text-white font-extrabold">Example:</strong> Seat M-01 can have Student A in Morning slot and Student B in Evening slot</span>
          </li>
        </ul>
      </div>

      {/* Add / Edit Time Slot Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                {editingPlan ? 'Edit Time Slot' : 'Add Time Slot'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Slot Name *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Morning, Full Day, Night"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Time Range *</label>
                <input
                  type="text"
                  required
                  value={formData.shiftTiming}
                  onChange={(e) => setFormData({ ...formData, shiftTiming: e.target.value })}
                  placeholder="e.g. 06:00 - 23:00 or 22:00 - 06:00 (Next Day)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Monthly Fee ({settings.currencySymbol}) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-bold text-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Day *</label>
                  <select
                    value={formData.days}
                    onChange={(e) => setFormData({ ...formData, days: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-medium"
                  >
                    <option value="All Days">All Days</option>
                    <option value="Monday - Friday">Monday - Friday</option>
                    <option value="Saturday - Sunday">Saturday - Sunday</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Short slot details"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-medium"
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
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md"
                >
                  Save Time Slot
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
