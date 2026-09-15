import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import {
  initialSettings,
  initialPlans,
  initialSeats,
  initialStudents,
  initialPayments,
  initialAttendance,
  initialExpenses,
  initialNotices,
  initialComplaints,
  initialVisitors,
  initialInventory,
  initialStaff
} from './src/data/initialData.js';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// File-backed persistence path
const DB_FILE = path.join(process.cwd(), 'data', 'studyzone_db.json');

// Ensure data folder exists
if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
  fs.mkdirSync(path.join(process.cwd(), 'data'), { recursive: true });
}

// Load or initialize DB
function loadDB() {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      settings: initialSettings,
      plans: initialPlans,
      seats: initialSeats,
      students: initialStudents,
      payments: initialPayments,
      attendance: initialAttendance,
      expenses: initialExpenses,
      notices: initialNotices,
      complaints: initialComplaints,
      visitors: initialVisitors,
      inventory: initialInventory,
      staff: initialStaff,
      notifications: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
  try {
    const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(fileContent);
  } catch (err) {
    console.error('Error reading DB file, resetting to initial seed:', err);
    const initialData = {
      settings: initialSettings,
      plans: initialPlans,
      seats: initialSeats,
      students: initialStudents,
      payments: initialPayments,
      attendance: initialAttendance,
      expenses: initialExpenses,
      notices: initialNotices,
      complaints: initialComplaints,
      visitors: initialVisitors,
      inventory: initialInventory,
      staff: initialStaff,
      notifications: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
}

function saveDB(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving DB file:', err);
  }
}

// --- REST API ROUTES ---

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'StudyZone Smart Library Backend', timestamp: new Date().toISOString() });
});

// Get all DB state
app.get('/api/db/all', (req, res) => {
  const db = loadDB();
  res.json({ status: 'success', data: db });
});

// Reset DB to clean initial state
app.post('/api/reset-db', (req, res) => {
  const initialData = {
    settings: initialSettings,
    plans: initialPlans,
    seats: initialSeats,
    students: initialStudents,
    payments: initialPayments,
    attendance: initialAttendance,
    expenses: initialExpenses,
    notices: initialNotices,
    complaints: initialComplaints,
    visitors: initialVisitors,
    inventory: initialInventory,
    staff: initialStaff,
    notifications: []
  };
  saveDB(initialData);
  res.json({ status: 'success', message: 'Database reset to initial clean seed state', data: initialData });
});

// Update Settings
app.post('/api/settings', (req, res) => {
  const db = loadDB();
  db.settings = { ...db.settings, ...req.body };
  saveDB(db);
  res.json({ status: 'success', data: db.settings });
});

// Add or Edit Student
app.post('/api/students', (req, res) => {
  const db = loadDB();
  const studentData = req.body;
  if (studentData.id) {
    // Edit
    const idx = db.students.findIndex((s: any) => s.id === studentData.id);
    if (idx !== -1) {
      db.students[idx] = { ...db.students[idx], ...studentData };
    } else {
      db.students.unshift(studentData);
    }
  } else {
    // Create
    const newStudent = {
      id: `std_${Date.now()}`,
      studentCode: `SZ-${new Date().getFullYear()}-${String(db.students.length + 1).padStart(3, '0')}`,
      joinedDate: new Date().toISOString().split('T')[0],
      totalPaid: Number(studentData.totalPaid || 0),
      pendingFee: Number(studentData.pendingFee || 0),
      status: 'active',
      ...studentData
    };

    // Auto assign seat if seatId provided
    if (newStudent.seatId) {
      const seat = db.seats.find((s: any) => s.id === newStudent.seatId);
      if (seat) {
        seat.status = 'occupied';
        seat.currentStudentId = newStudent.id;
        seat.currentStudentName = newStudent.name;
        seat.currentStudentPhone = newStudent.phone;
        seat.shiftAssigned = newStudent.shift;
        seat.expiryDate = newStudent.expiryDate;
        newStudent.seatNumber = seat.seatNumber;
        newStudent.floorZone = seat.floorZone;
      }
    }

    db.students.unshift(newStudent);
  }
  saveDB(db);
  res.json({ status: 'success', data: db });
});

// Delete Student
app.delete('/api/students/:id', (req, res) => {
  const db = loadDB();
  const { id } = req.params;
  
  // Free assigned seat if any
  const seat = db.seats.find((s: any) => s.currentStudentId === id);
  if (seat) {
    seat.status = 'available';
    seat.currentStudentId = undefined;
    seat.currentStudentName = undefined;
    seat.currentStudentPhone = undefined;
    seat.shiftAssigned = undefined;
    seat.expiryDate = undefined;
  }

  db.students = db.students.filter((s: any) => s.id !== id);
  saveDB(db);
  res.json({ status: 'success', data: db });
});

// Update Seat Status or Assign Student
app.post('/api/seats/assign', (req, res) => {
  const db = loadDB();
  const { seatId, studentId, action, newStatus } = req.body;
  const seat = db.seats.find((s: any) => s.id === seatId);
  if (!seat) {
    return res.status(404).json({ status: 'error', message: 'Seat not found' });
  }

  if (action === 'assign' && studentId) {
    const student = db.students.find((s: any) => s.id === studentId);
    if (student) {
      // Clear previous seat if student had one
      const prevSeat = db.seats.find((s: any) => s.currentStudentId === studentId);
      if (prevSeat) {
        prevSeat.status = 'available';
        prevSeat.currentStudentId = undefined;
        prevSeat.currentStudentName = undefined;
      }

      seat.status = 'occupied';
      seat.currentStudentId = student.id;
      seat.currentStudentName = student.name;
      seat.currentStudentPhone = student.phone;
      seat.shiftAssigned = student.shift;
      seat.expiryDate = student.expiryDate;

      student.seatId = seat.id;
      student.seatNumber = seat.seatNumber;
      student.floorZone = seat.floorZone;
    }
  } else if (action === 'release') {
    if (seat.currentStudentId) {
      const student = db.students.find((s: any) => s.id === seat.currentStudentId);
      if (student) {
        student.seatId = undefined;
        student.seatNumber = undefined;
      }
    }
    seat.status = 'available';
    seat.currentStudentId = undefined;
    seat.currentStudentName = undefined;
    seat.currentStudentPhone = undefined;
    seat.shiftAssigned = undefined;
    seat.expiryDate = undefined;
  } else if (action === 'change_status' && newStatus) {
    seat.status = newStatus;
  }

  saveDB(db);
  res.json({ status: 'success', data: db });
});

// Record Payment
app.post('/api/payments', (req, res) => {
  const db = loadDB();
  const paymentData = req.body;
  
  const student = db.students.find((s: any) => s.id === paymentData.studentId);
  
  const receiptNo = `${db.settings.receiptPrefix || 'SZ-REC'}-${1000 + db.payments.length + 1}`;
  
  const newPayment = {
    id: `pay_${Date.now()}`,
    receiptNumber: receiptNo,
    studentId: paymentData.studentId,
    studentName: student ? student.name : paymentData.studentName,
    studentCode: student ? student.studentCode : 'SZ-UNKNOWN',
    studentPhone: student ? student.phone : paymentData.studentPhone,
    planId: paymentData.planId,
    planName: paymentData.planName,
    amount: Number(paymentData.amount || 0),
    discount: Number(paymentData.discount || 0),
    lateFine: Number(paymentData.lateFine || 0),
    totalAmount: Number(paymentData.totalAmount || paymentData.amount),
    paymentMethod: paymentData.paymentMethod || 'cash',
    transactionRef: paymentData.transactionRef,
    paymentDate: paymentData.paymentDate || new Date().toISOString().split('T')[0],
    status: 'paid',
    notes: paymentData.notes,
    collectedBy: paymentData.collectedBy || db.settings.ownerName
  };

  db.payments.unshift(newPayment);

  // Update student financial balance & extend expiry if renewal
  if (student) {
    student.totalPaid = (Number(student.totalPaid) || 0) + newPayment.totalAmount;
    if (student.pendingFee > 0) {
      student.pendingFee = Math.max(0, student.pendingFee - newPayment.totalAmount);
      if (student.pendingFee === 0) {
        student.status = 'active';
      }
    }
  }

  saveDB(db);
  res.json({ status: 'success', data: db, receipt: newPayment });
});

// Mark Attendance
app.post('/api/attendance', (req, res) => {
  const db = loadDB();
  const { studentId, studentCode, status, mode, notes } = req.body;
  
  let student = db.students.find((s: any) => s.id === studentId || s.studentCode === studentCode);
  if (!student && studentCode) {
    student = db.students.find((s: any) => s.studentCode.toLowerCase() === studentCode.toLowerCase());
  }

  if (!student) {
    return res.status(404).json({ status: 'error', message: 'Student ID or QR Code not found' });
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  // Check if attendance already marked today
  const existingIndex = db.attendance.findIndex((a: any) => a.studentId === student.id && a.date === todayStr);

  if (existingIndex !== -1) {
    db.attendance[existingIndex] = {
      ...db.attendance[existingIndex],
      checkOutTime: nowTime,
      status: status || db.attendance[existingIndex].status,
      notes: notes || db.attendance[existingIndex].notes
    };
  } else {
    const newRecord = {
      id: `att_${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      studentCode: student.studentCode,
      seatNumber: student.seatNumber || 'N/A',
      date: todayStr,
      checkInTime: nowTime,
      status: status || 'present',
      mode: mode || 'manual',
      notes
    };
    db.attendance.unshift(newRecord);
  }

  saveDB(db);
  res.json({ status: 'success', data: db, studentName: student.name });
});

// Add Expense
app.post('/api/expenses', (req, res) => {
  const db = loadDB();
  const newExp = {
    id: `exp_${Date.now()}`,
    ...req.body,
    amount: Number(req.body.amount || 0)
  };
  db.expenses.unshift(newExp);
  saveDB(db);
  res.json({ status: 'success', data: db });
});

// Add Notice
app.post('/api/notices', (req, res) => {
  const db = loadDB();
  const newNotice = {
    id: `not_${Date.now()}`,
    postedDate: new Date().toISOString().split('T')[0],
    postedBy: db.settings.ownerName,
    ...req.body
  };
  db.notices.unshift(newNotice);
  saveDB(db);
  res.json({ status: 'success', data: db });
});

// Add or Reply Complaint
app.post('/api/complaints', (req, res) => {
  const db = loadDB();
  const { action, id, studentId, subject, description, category, ownerReply, status } = req.body;

  if (action === 'create') {
    const student = db.students.find((s: any) => s.id === studentId);
    const newComplaint = {
      id: `cmp_${Date.now()}`,
      studentId: student ? student.id : 'std_guest',
      studentName: student ? student.name : 'Student',
      studentCode: student ? student.studentCode : 'SZ-APP',
      studentPhone: student ? student.phone : '',
      seatNumber: student ? student.seatNumber : 'N/A',
      category: category || 'other',
      subject,
      description,
      status: 'pending',
      createdAt: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
    };
    db.complaints.unshift(newComplaint);
  } else if (action === 'reply' && id) {
    const complaint = db.complaints.find((c: any) => c.id === id);
    if (complaint) {
      if (ownerReply) complaint.ownerReply = ownerReply;
      if (status) complaint.status = status;
      if (status === 'resolved' || status === 'closed') {
        complaint.resolvedAt = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
      }
    }
  }

  saveDB(db);
  res.json({ status: 'success', data: db });
});

// Add Visitor
app.post('/api/visitors', (req, res) => {
  const db = loadDB();
  const newVisitor = {
    id: `vis_${Date.now()}`,
    passNumber: `VIS-${100 + db.visitors.length + 1}`,
    date: new Date().toISOString().split('T')[0],
    entryTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
    ...req.body
  };
  db.visitors.unshift(newVisitor);
  saveDB(db);
  res.json({ status: 'success', data: db, visitor: newVisitor });
});

// Create Plan
app.post('/api/plans', (req, res) => {
  const db = loadDB();
  const planData = req.body;
  if (planData.id) {
    const idx = db.plans.findIndex((p: any) => p.id === planData.id);
    if (idx !== -1) db.plans[idx] = { ...db.plans[idx], ...planData };
  } else {
    const newPlan = {
      id: `plan_${Date.now()}`,
      isActive: true,
      availableSeats: Number(planData.totalSeats || 30),
      totalSeats: Number(planData.totalSeats || 30),
      ...planData
    };
    db.plans.push(newPlan);
  }
  saveDB(db);
  res.json({ status: 'success', data: db });
});

// Launch Vite or serve static assets
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StudyZone Smart Library Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
