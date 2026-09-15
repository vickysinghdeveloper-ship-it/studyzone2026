var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_vite = require("vite");

// src/data/initialData.ts
var initialSettings = {
  libraryName: "StudyZone Library",
  tagline: "Smart Library & Study Center Management System",
  ownerName: "Vikram Singh",
  phone: "6209332827",
  email: "contact@studyzone.com",
  whatsappNumber: "6209332827",
  upiId: "6209332827zbl@ybl",
  address: "Behind Vishveshwaraya Bhawan, Near Hartali More, Boring Road",
  city: "Patna",
  state: "Bihar",
  pincode: "800001",
  logoUrl: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=150&q=80",
  currencySymbol: "\u20B9",
  workingHours: "24 Hours Open (3 Shifts)",
  gstNumber: "10AABCS1234F1ZB",
  receiptPrefix: "SZ-REC",
  wifiName: "StudyZone_5G_HighSpeed",
  wifiPassword: "StudyQuiet@2026",
  enableSmsNotifications: true,
  enableWhatsappNotifications: true,
  enableAutoLateFee: true,
  lateFeePerDay: 50,
  gracePeriodDays: 3,
  mapEmbedUrl: "https://maps.google.com/maps?q=StudyZone%20Library%2C%20Behind%20Vishveshwaraya%20Bhawan%2C%20Near%20Hartali%20More%2C%20Boring%20Road%2C%20Patna%2C%20Bihar%20800001&t=&z=15&ie=UTF8&iwloc=&output=embed"
};
var initialPlans = [
  {
    id: "slot_morning",
    title: "Morning",
    shift: "morning",
    shiftTiming: "06:00 - 23:00",
    days: "All Days",
    durationDays: 30,
    price: 500,
    availableSeats: 25,
    totalSeats: 30,
    description: "Early morning reading slot.",
    lateFinePerDay: 50,
    gracePeriodDays: 3,
    isActive: true,
    features: ["Reserved Desk", "WiFi Access", "RO Water"]
  },
  {
    id: "slot_fullday",
    title: "Full Day",
    shift: "fullday",
    shiftTiming: "06:00 - 22:00",
    days: "All Days",
    durationDays: 30,
    price: 1200,
    availableSeats: 15,
    totalSeats: 30,
    description: "Whole day uninterrupted study access.",
    lateFinePerDay: 50,
    gracePeriodDays: 3,
    isActive: true,
    features: ["Reserved Personal Desk", "Locker Facility", "High Speed WiFi", "AC Hall"]
  },
  {
    id: "slot_noon_evening",
    title: "Noon + Evening",
    shift: "custom",
    shiftTiming: "11:00 - 22:00",
    days: "All Days",
    durationDays: 30,
    price: 1e3,
    availableSeats: 20,
    totalSeats: 30,
    description: "Combined mid-day and evening pass.",
    lateFinePerDay: 50,
    gracePeriodDays: 3,
    isActive: true,
    features: ["Dedicated Desk", "AC Access", "WiFi"]
  },
  {
    id: "slot_afternoon",
    title: "Afternoon",
    shift: "evening",
    shiftTiming: "11:00 - 16:00",
    days: "All Days",
    durationDays: 30,
    price: 700,
    availableSeats: 20,
    totalSeats: 30,
    description: "Post-noon study slot.",
    lateFinePerDay: 50,
    gracePeriodDays: 3,
    isActive: true,
    features: ["Quiet Zone", "Power Plug"]
  },
  {
    id: "slot_evening",
    title: "Evening",
    shift: "evening",
    shiftTiming: "16:00 - 22:00",
    days: "All Days",
    durationDays: 30,
    price: 700,
    availableSeats: 18,
    totalSeats: 30,
    description: "Evening revision slot.",
    lateFinePerDay: 50,
    gracePeriodDays: 3,
    isActive: true,
    features: ["Standard Desk", "WiFi", "Tea Point"]
  },
  {
    id: "slot_night",
    title: "Night",
    shift: "night",
    shiftTiming: "22:00 - 06:00 (Next Day)",
    days: "All Days",
    durationDays: 30,
    price: 500,
    availableSeats: 22,
    totalSeats: 30,
    description: "Overnight night-owl study slot.",
    lateFinePerDay: 50,
    gracePeriodDays: 3,
    isActive: true,
    features: ["24/7 Security", "CCTV Guaranteed", "Power Backup"]
  }
];
var generateSeatsForRange = (zone, start, end, zonePrefix, occupiedSlotsInfo) => {
  const seats = [];
  for (let i = start; i <= end; i++) {
    const numPadded = String(i).padStart(2, "0");
    const seatNumber = `${zonePrefix}-${numPadded}`;
    const slotMap = occupiedSlotsInfo?.[i] || {};
    const slotBookings = {};
    Object.keys(slotMap).forEach((slotId) => {
      const info = slotMap[slotId];
      let slotName = "Slot";
      if (slotId === "slot_morning") slotName = "Morning";
      else if (slotId === "slot_fullday") slotName = "Full Day";
      else if (slotId === "slot_noon_evening") slotName = "Noon + Evening";
      else if (slotId === "slot_afternoon") slotName = "Afternoon";
      else if (slotId === "slot_evening") slotName = "Evening";
      else if (slotId === "slot_night") slotName = "Night";
      slotBookings[slotId] = {
        slotId,
        slotName,
        studentId: info.studentId,
        studentName: info.name,
        studentPhone: info.phone,
        expiryDate: info.expiry || "2026-08-15"
      };
    });
    const hasAnyBooking = Object.keys(slotBookings).length > 0;
    seats.push({
      id: `seat_${zone}_${i}`,
      seatNumber,
      floorZone: zone,
      status: hasAnyBooking ? "occupied" : "available",
      slotBookings,
      currentStudentId: hasAnyBooking ? Object.values(slotMap)[0]?.studentId : void 0,
      currentStudentName: hasAnyBooking ? Object.values(slotMap)[0]?.name : void 0,
      currentStudentPhone: hasAnyBooking ? Object.values(slotMap)[0]?.phone : void 0,
      isPowerPlugAvailable: true,
      isLockerAttached: i % 2 === 0
    });
  }
  return seats;
};
var initialSeats = [
  // Room A (1 to 25) -> Prefix ROOM-A
  ...generateSeatsForRange("room_a", 1, 25, "ROOM-A"),
  // Room B (26 to 49) -> Prefix ROOM-B
  ...generateSeatsForRange("room_b", 26, 49, "ROOM-B"),
  // Room C (50 to 75) -> Prefix ROOM-C
  ...generateSeatsForRange("room_c", 50, 75, "ROOM-C"),
  // Hall A (76 to 107) -> Prefix HALL-A
  ...generateSeatsForRange("hall_a", 76, 107, "HALL-A"),
  // Office Room (148 to 159) -> Prefix OFF
  ...generateSeatsForRange("office_room", 148, 159, "OFF")
];
var initialStudents = [];
var initialPayments = [];
var initialAttendance = [];
var initialExpenses = [
  {
    id: "exp_1",
    category: "rent",
    title: "Building Rent - July 2026",
    amount: 35e3,
    date: "2026-07-05",
    vendorName: "Sharma Complex Pvt Ltd",
    paymentMethod: "bank_transfer",
    receiptNo: "RENT-JULY-01",
    notes: "Ground & 1st Floor premises rent"
  },
  {
    id: "exp_2",
    category: "electricity",
    title: "Commercial Electricity Bill (NPCL)",
    amount: 14200,
    date: "2026-07-12",
    vendorName: "Noida Power Corporation",
    paymentMethod: "upi",
    receiptNo: "NPCL-99012"
  },
  {
    id: "exp_3",
    category: "internet",
    title: "Airtel Dual Fiber 200 Mbps Connection",
    amount: 2360,
    date: "2026-07-02",
    vendorName: "Airtel Broadband",
    paymentMethod: "upi",
    receiptNo: "AIR-8812"
  },
  {
    id: "exp_4",
    category: "tea_coffee",
    title: "Tea Coffee Vending Powder & Milk",
    amount: 3500,
    date: "2026-07-18",
    vendorName: "Nestle Refreshments",
    paymentMethod: "cash"
  }
];
var initialNotices = [
  {
    id: "not_1",
    title: "Maintenance Alert: AC Service on Sunday",
    content: "All AC units in Reading Hall and First Floor will undergo scheduled maintenance this Sunday from 02:00 PM to 04:00 PM. Backup fans will be operating.",
    category: "maintenance",
    isPinned: true,
    postedDate: "2026-07-20",
    postedBy: "Admin Team"
  },
  {
    id: "not_2",
    title: "Independence Day Special Library Hours",
    content: "StudyZone will remain open 24x7 on 15th August. Special tea & snacks will be served in the cafeteria zone at 10:00 AM.",
    category: "announcement",
    isPinned: true,
    postedDate: "2026-07-15",
    postedBy: "Management"
  },
  {
    id: "not_3",
    title: "Motivational Quote of the Week",
    content: '"Success is not final, failure is not fatal: it is the courage to continue that counts." \u2014 Keep grinding for your dream exam!',
    category: "quote",
    isPinned: false,
    postedDate: "2026-07-21",
    postedBy: "StudyZone Mentors"
  }
];
var initialComplaints = [];
var initialVisitors = [
  {
    id: "vis_1",
    passNumber: "VIS-101",
    name: "Vikash Chaurasia",
    phone: "9711002233",
    purpose: "New Admission Inquiry for UPSC 24hr seat",
    entryTime: "11:30 AM",
    exitTime: "12:00 PM",
    date: "2026-07-22",
    notes: "Interested in Ground Floor AC room seat."
  }
];
var initialInventory = [
  { id: "inv_1", name: "Ergonomic Mesh Study Chairs", category: "furniture", quantity: 65, condition: "excellent", location: "All Study Halls" },
  { id: "inv_2", name: "Individual Reading Desks with LED", category: "furniture", quantity: 65, condition: "excellent", location: "All Study Halls" },
  { id: "inv_3", name: "Carrier 2.0 Ton Inverter Split AC", category: "appliances", quantity: 6, condition: "good", lastServiceDate: "2026-06-10", location: "Reading Halls" },
  { id: "inv_4", name: "Cisco Fiber Router & Access Points", category: "it_network", quantity: 4, condition: "excellent", location: "Main Hub" },
  { id: "inv_5", name: "Personal Storage Lockers", category: "furniture", quantity: 40, condition: "good", location: "Locker Alley" }
];
var initialStaff = [
  { id: "stf_1", name: "Rajesh Kumar", role: "manager", phone: "9810102030", email: "rajesh@studyzone.com", shiftTiming: "08:00 AM - 05:00 PM", monthlySalary: 22e3, joinedDate: "2025-06-01", status: "active" },
  { id: "stf_2", name: "Sunita Devi", role: "cleaner", phone: "9810102031", email: "sunita@studyzone.com", shiftTiming: "06:00 AM - 02:00 PM", monthlySalary: 12e3, joinedDate: "2025-07-15", status: "active" }
];

// server.ts
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json({ limit: "10mb" }));
var DB_FILE = import_path.default.join(process.cwd(), "data", "studyzone_db.json");
if (!import_fs.default.existsSync(import_path.default.join(process.cwd(), "data"))) {
  import_fs.default.mkdirSync(import_path.default.join(process.cwd(), "data"), { recursive: true });
}
function loadDB() {
  if (!import_fs.default.existsSync(DB_FILE)) {
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
    import_fs.default.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), "utf-8");
    return initialData;
  }
  try {
    const fileContent = import_fs.default.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(fileContent);
  } catch (err) {
    console.error("Error reading DB file, resetting to initial seed:", err);
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
    import_fs.default.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), "utf-8");
    return initialData;
  }
}
function saveDB(data) {
  try {
    import_fs.default.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving DB file:", err);
  }
}
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "StudyZone Smart Library Backend", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
app.get("/api/db/all", (req, res) => {
  const db = loadDB();
  res.json({ status: "success", data: db });
});
app.post("/api/reset-db", (req, res) => {
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
  res.json({ status: "success", message: "Database reset to initial clean seed state", data: initialData });
});
app.post("/api/settings", (req, res) => {
  const db = loadDB();
  db.settings = { ...db.settings, ...req.body };
  saveDB(db);
  res.json({ status: "success", data: db.settings });
});
app.post("/api/students", (req, res) => {
  const db = loadDB();
  const studentData = req.body;
  if (studentData.id) {
    const idx = db.students.findIndex((s) => s.id === studentData.id);
    if (idx !== -1) {
      db.students[idx] = { ...db.students[idx], ...studentData };
    } else {
      db.students.unshift(studentData);
    }
  } else {
    const newStudent = {
      id: `std_${Date.now()}`,
      studentCode: `SZ-${(/* @__PURE__ */ new Date()).getFullYear()}-${String(db.students.length + 1).padStart(3, "0")}`,
      joinedDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      totalPaid: Number(studentData.totalPaid || 0),
      pendingFee: Number(studentData.pendingFee || 0),
      status: "active",
      ...studentData
    };
    if (newStudent.seatId) {
      const seat = db.seats.find((s) => s.id === newStudent.seatId);
      if (seat) {
        seat.status = "occupied";
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
  res.json({ status: "success", data: db });
});
app.delete("/api/students/:id", (req, res) => {
  const db = loadDB();
  const { id } = req.params;
  const seat = db.seats.find((s) => s.currentStudentId === id);
  if (seat) {
    seat.status = "available";
    seat.currentStudentId = void 0;
    seat.currentStudentName = void 0;
    seat.currentStudentPhone = void 0;
    seat.shiftAssigned = void 0;
    seat.expiryDate = void 0;
  }
  db.students = db.students.filter((s) => s.id !== id);
  saveDB(db);
  res.json({ status: "success", data: db });
});
app.post("/api/seats/assign", (req, res) => {
  const db = loadDB();
  const { seatId, studentId, action, newStatus } = req.body;
  const seat = db.seats.find((s) => s.id === seatId);
  if (!seat) {
    return res.status(404).json({ status: "error", message: "Seat not found" });
  }
  if (action === "assign" && studentId) {
    const student = db.students.find((s) => s.id === studentId);
    if (student) {
      const prevSeat = db.seats.find((s) => s.currentStudentId === studentId);
      if (prevSeat) {
        prevSeat.status = "available";
        prevSeat.currentStudentId = void 0;
        prevSeat.currentStudentName = void 0;
      }
      seat.status = "occupied";
      seat.currentStudentId = student.id;
      seat.currentStudentName = student.name;
      seat.currentStudentPhone = student.phone;
      seat.shiftAssigned = student.shift;
      seat.expiryDate = student.expiryDate;
      student.seatId = seat.id;
      student.seatNumber = seat.seatNumber;
      student.floorZone = seat.floorZone;
    }
  } else if (action === "release") {
    if (seat.currentStudentId) {
      const student = db.students.find((s) => s.id === seat.currentStudentId);
      if (student) {
        student.seatId = void 0;
        student.seatNumber = void 0;
      }
    }
    seat.status = "available";
    seat.currentStudentId = void 0;
    seat.currentStudentName = void 0;
    seat.currentStudentPhone = void 0;
    seat.shiftAssigned = void 0;
    seat.expiryDate = void 0;
  } else if (action === "change_status" && newStatus) {
    seat.status = newStatus;
  }
  saveDB(db);
  res.json({ status: "success", data: db });
});
app.post("/api/payments", (req, res) => {
  const db = loadDB();
  const paymentData = req.body;
  const student = db.students.find((s) => s.id === paymentData.studentId);
  const receiptNo = `${db.settings.receiptPrefix || "SZ-REC"}-${1e3 + db.payments.length + 1}`;
  const newPayment = {
    id: `pay_${Date.now()}`,
    receiptNumber: receiptNo,
    studentId: paymentData.studentId,
    studentName: student ? student.name : paymentData.studentName,
    studentCode: student ? student.studentCode : "SZ-UNKNOWN",
    studentPhone: student ? student.phone : paymentData.studentPhone,
    planId: paymentData.planId,
    planName: paymentData.planName,
    amount: Number(paymentData.amount || 0),
    discount: Number(paymentData.discount || 0),
    lateFine: Number(paymentData.lateFine || 0),
    totalAmount: Number(paymentData.totalAmount || paymentData.amount),
    paymentMethod: paymentData.paymentMethod || "cash",
    transactionRef: paymentData.transactionRef,
    paymentDate: paymentData.paymentDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    status: "paid",
    notes: paymentData.notes,
    collectedBy: paymentData.collectedBy || db.settings.ownerName
  };
  db.payments.unshift(newPayment);
  if (student) {
    student.totalPaid = (Number(student.totalPaid) || 0) + newPayment.totalAmount;
    if (student.pendingFee > 0) {
      student.pendingFee = Math.max(0, student.pendingFee - newPayment.totalAmount);
      if (student.pendingFee === 0) {
        student.status = "active";
      }
    }
  }
  saveDB(db);
  res.json({ status: "success", data: db, receipt: newPayment });
});
app.post("/api/attendance", (req, res) => {
  const db = loadDB();
  const { studentId, studentCode, status, mode, notes } = req.body;
  let student = db.students.find((s) => s.id === studentId || s.studentCode === studentCode);
  if (!student && studentCode) {
    student = db.students.find((s) => s.studentCode.toLowerCase() === studentCode.toLowerCase());
  }
  if (!student) {
    return res.status(404).json({ status: "error", message: "Student ID or QR Code not found" });
  }
  const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const nowTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  const existingIndex = db.attendance.findIndex((a) => a.studentId === student.id && a.date === todayStr);
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
      seatNumber: student.seatNumber || "N/A",
      date: todayStr,
      checkInTime: nowTime,
      status: status || "present",
      mode: mode || "manual",
      notes
    };
    db.attendance.unshift(newRecord);
  }
  saveDB(db);
  res.json({ status: "success", data: db, studentName: student.name });
});
app.post("/api/expenses", (req, res) => {
  const db = loadDB();
  const newExp = {
    id: `exp_${Date.now()}`,
    ...req.body,
    amount: Number(req.body.amount || 0)
  };
  db.expenses.unshift(newExp);
  saveDB(db);
  res.json({ status: "success", data: db });
});
app.post("/api/notices", (req, res) => {
  const db = loadDB();
  const newNotice = {
    id: `not_${Date.now()}`,
    postedDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    postedBy: db.settings.ownerName,
    ...req.body
  };
  db.notices.unshift(newNotice);
  saveDB(db);
  res.json({ status: "success", data: db });
});
app.post("/api/complaints", (req, res) => {
  const db = loadDB();
  const { action, id, studentId, subject, description, category, ownerReply, status } = req.body;
  if (action === "create") {
    const student = db.students.find((s) => s.id === studentId);
    const newComplaint = {
      id: `cmp_${Date.now()}`,
      studentId: student ? student.id : "std_guest",
      studentName: student ? student.name : "Student",
      studentCode: student ? student.studentCode : "SZ-APP",
      studentPhone: student ? student.phone : "",
      seatNumber: student ? student.seatNumber : "N/A",
      category: category || "other",
      subject,
      description,
      status: "pending",
      createdAt: (/* @__PURE__ */ new Date()).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })
    };
    db.complaints.unshift(newComplaint);
  } else if (action === "reply" && id) {
    const complaint = db.complaints.find((c) => c.id === id);
    if (complaint) {
      if (ownerReply) complaint.ownerReply = ownerReply;
      if (status) complaint.status = status;
      if (status === "resolved" || status === "closed") {
        complaint.resolvedAt = (/* @__PURE__ */ new Date()).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
      }
    }
  }
  saveDB(db);
  res.json({ status: "success", data: db });
});
app.post("/api/visitors", (req, res) => {
  const db = loadDB();
  const newVisitor = {
    id: `vis_${Date.now()}`,
    passNumber: `VIS-${100 + db.visitors.length + 1}`,
    date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    entryTime: (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
    ...req.body
  };
  db.visitors.unshift(newVisitor);
  saveDB(db);
  res.json({ status: "success", data: db, visitor: newVisitor });
});
app.post("/api/plans", (req, res) => {
  const db = loadDB();
  const planData = req.body;
  if (planData.id) {
    const idx = db.plans.findIndex((p) => p.id === planData.id);
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
  res.json({ status: "success", data: db });
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`StudyZone Smart Library Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
