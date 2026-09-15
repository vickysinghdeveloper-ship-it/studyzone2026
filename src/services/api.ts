import { LibrarySettings, Student, Seat, MembershipPlan, Payment, AttendanceRecord, Expense, Notice, Complaint, Visitor, InventoryItem, StaffMember } from '../types';

export async function fetchFullDatabase() {
  try {
    const res = await fetch('/api/db/all');
    if (!res.ok) throw new Error('API request failed');
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('API fetch error, using local fallback:', err);
    return null;
  }
}

export async function saveStudent(studentData: Partial<Student>) {
  const res = await fetch('/api/students', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(studentData)
  });
  return res.json();
}

export async function deleteStudent(studentId: string) {
  const res = await fetch(`/api/students/${studentId}`, {
    method: 'DELETE'
  });
  return res.json();
}

export async function updateSeat(seatId: string, action: 'assign' | 'release' | 'change_status', studentId?: string, newStatus?: string) {
  const res = await fetch('/api/seats/assign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ seatId, action, studentId, newStatus })
  });
  return res.json();
}

export async function recordPayment(paymentData: any) {
  const res = await fetch('/api/payments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paymentData)
  });
  return res.json();
}

export async function markAttendance(attendanceData: { studentId?: string; studentCode?: string; status?: string; mode?: string; notes?: string }) {
  const res = await fetch('/api/attendance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(attendanceData)
  });
  return res.json();
}

export async function addExpense(expenseData: Partial<Expense>) {
  const res = await fetch('/api/expenses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(expenseData)
  });
  return res.json();
}

export async function addNotice(noticeData: Partial<Notice>) {
  const res = await fetch('/api/notices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(noticeData)
  });
  return res.json();
}

export async function submitComplaintOrReply(payload: any) {
  const res = await fetch('/api/complaints', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function logVisitor(visitorData: Partial<Visitor>) {
  const res = await fetch('/api/visitors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(visitorData)
  });
  return res.json();
}

export async function saveSettings(settings: Partial<LibrarySettings>) {
  const res = await fetch('/api/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings)
  });
  return res.json();
}

export async function savePlan(plan: Partial<MembershipPlan>) {
  const res = await fetch('/api/plans', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(plan)
  });
  return res.json();
}

export async function resetDatabase() {
  const res = await fetch('/api/reset-db', {
    method: 'POST'
  });
  return res.json();
}
