import React, { useState } from 'react';
import {
  Bell,
  MessageSquare,
  UserCheck,
  Package,
  FileSpreadsheet,
  Plus,
  Send,
  CheckCircle,
  Clock,
  Printer,
  Download,
  Pin
} from 'lucide-react';
import { Notice, Complaint, Visitor, InventoryItem, LibrarySettings } from '../../types';

interface OtherModulesProps {
  moduleName: 'notices' | 'complaints' | 'visitors' | 'inventory' | 'reports';
  notices: Notice[];
  complaints: Complaint[];
  visitors: Visitor[];
  inventory: InventoryItem[];
  settings: LibrarySettings;
  onAddNotice: (notice: Partial<Notice>) => void;
  onReplyComplaint: (id: string, reply: string, status: string) => void;
  onLogVisitor: (visitor: Partial<Visitor>) => void;
}

export const OtherModules: React.FC<OtherModulesProps> = ({
  moduleName,
  notices,
  complaints,
  visitors,
  inventory,
  settings,
  onAddNotice,
  onReplyComplaint,
  onLogVisitor
}) => {
  // Notice Form
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeCategory, setNoticeCategory] = useState<any>('announcement');

  // Complaint Reply
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [replyText, setReplyText] = useState('');

  // Visitor Form
  const [visName, setVisName] = useState('');
  const [visPhone, setVisPhone] = useState('');
  const [visPurpose, setVisPurpose] = useState('');

  const handleNoticeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle || !noticeContent) return;
    onAddNotice({
      title: noticeTitle,
      content: noticeContent,
      category: noticeCategory,
      isPinned: true
    });
    setNoticeTitle('');
    setNoticeContent('');
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    onReplyComplaint(selectedComplaint.id, replyText, 'resolved');
    setSelectedComplaint(null);
    setReplyText('');
  };

  const handleVisitorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visName || !visPhone) return;
    onLogVisitor({
      name: visName,
      phone: visPhone,
      purpose: visPurpose
    });
    setVisName('');
    setVisPhone('');
    setVisPurpose('');
  };

  const exportCSV = (data: any[], filename: string) => {
    if (!data.length) return;
    const keys = Object.keys(data[0]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [keys.join(','), ...data.map((row) => keys.map((k) => `"${row[k] || ''}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Notice Board Module */}
      {moduleName === 'notices' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center">
                <Bell className="w-6 h-6 text-blue-600 mr-2" />
                Library Notice Board & Holiday Announcements
              </h1>
              <p className="text-xs text-slate-500">Publish notices, holiday alerts, maintenance schedules & motivational quotes.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Create Notice Form */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Publish New Announcement</h3>
              <form onSubmit={handleNoticeSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Notice Category</label>
                  <select
                    value={noticeCategory}
                    onChange={(e) => setNoticeCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  >
                    <option value="announcement">General Announcement</option>
                    <option value="holiday">Holiday Notice</option>
                    <option value="maintenance">Maintenance Alert</option>
                    <option value="quote">Motivational Quote</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={noticeTitle}
                    onChange={(e) => setNoticeTitle(e.target.value)}
                    placeholder="e.g. Library Schedule on 15th August"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Content / Details *</label>
                  <textarea
                    rows={4}
                    required
                    value={noticeContent}
                    onChange={(e) => setNoticeContent(e.target.value)}
                    placeholder="Write details for students..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-500/20"
                >
                  Publish Notice to Student Dashboard
                </button>
              </form>
            </div>

            {/* Published Notices Feed */}
            <div className="lg:col-span-7 space-y-4">
              {notices.map((not) => (
                <div key={not.id} className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2 relative">
                  {not.isPinned && (
                    <span className="absolute top-4 right-4 flex items-center text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950 px-2.5 py-1 rounded-full">
                      <Pin className="w-3 h-3 mr-1" /> Pinned
                    </span>
                  )}
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    {not.category}
                  </span>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">{not.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{not.content}</p>
                  <span className="block text-[10px] text-slate-400 pt-1">
                    Posted on {not.postedDate} by {not.postedBy}
                  </span>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* Complaints Resolver Module */}
      {moduleName === 'complaints' && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center">
              <MessageSquare className="w-6 h-6 text-amber-600 mr-2" />
              Student Complaints & Feedback Resolver
            </h1>
            <p className="text-xs text-slate-500">Track student tickets regarding WiFi, AC, cleanliness or seat issues.</p>
          </div>

          <div className="space-y-4">
            {complaints.map((cmp) => (
              <div key={cmp.id} className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{cmp.studentName}</span>
                    <span className="text-xs text-slate-400 font-mono">({cmp.studentCode} • Seat {cmp.seatNumber || 'N/A'})</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                    cmp.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {cmp.status}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{cmp.subject}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl">{cmp.description}</p>

                {cmp.ownerReply && (
                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 text-xs text-blue-900 dark:text-blue-200">
                    <strong>Owner Reply:</strong> {cmp.ownerReply}
                  </div>
                )}

                {cmp.status !== 'resolved' && (
                  <button
                    onClick={() => setSelectedComplaint(cmp)}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
                  >
                    Reply & Resolve Ticket
                  </button>
                )}
              </div>
            ))}
          </div>

          {selectedComplaint && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-6 space-y-4 border border-slate-200 dark:border-slate-700">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Reply to {selectedComplaint.studentName}</h3>
                <textarea
                  rows={3}
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type resolution reply..."
                  className="w-full p-3 rounded-xl border text-xs"
                />
                <div className="flex justify-end space-x-2">
                  <button onClick={() => setSelectedComplaint(null)} className="px-4 py-2 text-xs font-semibold text-slate-500">Cancel</button>
                  <button onClick={handleReplySubmit} className="px-5 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl">Resolve Ticket</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Visitor Management */}
      {moduleName === 'visitors' && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center">
              <UserCheck className="w-6 h-6 text-indigo-600 mr-2" />
              Walk-in Visitor Management
            </h1>
            <p className="text-xs text-slate-500">Log walk-in visitor inquiries, parent visits & print visitor passes.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Log Walk-In Visitor</h3>
              <form onSubmit={handleVisitorSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Visitor Name *</label>
                  <input
                    type="text"
                    required
                    value={visName}
                    onChange={(e) => setVisName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Mobile Phone *</label>
                  <input
                    type="tel"
                    required
                    value={visPhone}
                    onChange={(e) => setVisPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Purpose of Visit</label>
                  <input
                    type="text"
                    value={visPurpose}
                    onChange={(e) => setVisPurpose(e.target.value)}
                    placeholder="e.g. New Admission Inquiry"
                    className="w-full p-2.5 rounded-xl border"
                  />
                </div>
                <button type="submit" className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs">
                  Save Visitor Entry
                </button>
              </form>
            </div>

            <div className="lg:col-span-7 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Today's Visitors</h3>
              <div className="space-y-3">
                {visitors.map((vis) => (
                  <div key={vis.id} className="p-4 rounded-2xl border flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold block text-slate-900 dark:text-white">{vis.name} ({vis.passNumber})</span>
                      <span className="text-slate-500">Ph: {vis.phone} • {vis.purpose}</span>
                    </div>
                    <span className="text-slate-400 font-mono">{vis.entryTime}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Management */}
      {moduleName === 'inventory' && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center">
              <Package className="w-6 h-6 text-blue-600 mr-2" />
              Library Assets & Inventory
            </h1>
            <p className="text-xs text-slate-500">Track chairs, reading desks, AC units, fiber routers & maintenance schedules.</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/60 border-b text-slate-500 font-bold uppercase">
                  <th className="p-4">Item Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Quantity</th>
                  <th className="p-4">Condition</th>
                  <th className="p-4">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {inventory.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{inv.name}</td>
                    <td className="p-4 capitalize text-slate-500">{inv.category}</td>
                    <td className="p-4 font-bold text-blue-600">{inv.quantity} units</td>
                    <td className="p-4 capitalize text-emerald-600 font-semibold">{inv.condition}</td>
                    <td className="p-4 text-slate-500">{inv.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reports Export Hub */}
      {moduleName === 'reports' && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center">
              <FileSpreadsheet className="w-6 h-6 text-emerald-600 mr-2" />
              Reports & Data Export Center
            </h1>
            <p className="text-xs text-slate-500">Export student directory, collections, attendance logs & expenses to CSV / Excel.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Student Directory Report</h3>
              <p className="text-xs text-slate-500">Export full student list with contact numbers, assigned seats & dues.</p>
              <button
                onClick={() => exportCSV(settings ? [] : [], 'StudyZone_Students')}
                className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs"
              >
                Export CSV Report
              </button>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Fee Collections Report</h3>
              <p className="text-xs text-slate-500">Export payment receipts with mode, transaction ID & total revenue.</p>
              <button
                onClick={() => exportCSV([], 'StudyZone_Payments')}
                className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs"
              >
                Export CSV Report
              </button>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Attendance Logs Report</h3>
              <p className="text-xs text-slate-500">Export monthly student attendance timestamps and scan modes.</p>
              <button
                onClick={() => exportCSV([], 'StudyZone_Attendance')}
                className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs"
              >
                Export CSV Report
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
