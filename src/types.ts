export type Role = 'owner' | 'admin' | 'student' | 'staff';

export type AdminPermission =
  | 'dashboard'
  | 'students'
  | 'plans'
  | 'seats'
  | 'attendance'
  | 'payments'
  | 'expenses'
  | 'notices'
  | 'complaints'
  | 'visitors'
  | 'inventory'
  | 'reports'
  | 'settings';

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  status: 'active' | 'restricted';
  permissions: AdminPermission[];
  createdAt: string;
  lastLogin?: string;
  createdBy?: string;
}

export type ShiftType = 'morning' | 'evening' | 'night' | 'fullday' | 'custom';

export type SeatStatus = 'available' | 'occupied' | 'reserved' | 'maintenance' | 'cleaning';

export type ZoneFloor = 'room_a' | 'room_b' | 'room_c' | 'hall_a' | 'office_room' | 'ground' | 'first' | 'reading_hall' | 'ac_room' | 'silent_zone' | 'girls_section' | string;

export type PaymentMethod = 'cash' | 'upi' | 'bank_transfer' | 'card';

export type PaymentStatus = 'paid' | 'pending' | 'partial' | 'refunded';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'early_exit';

export type ComplaintStatus = 'pending' | 'in_progress' | 'resolved' | 'closed';

export type ComplaintCategory = 'ac_heating' | 'wifi_internet' | 'cleanliness' | 'noise' | 'lighting' | 'furniture' | 'other';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  permissions?: AdminPermission[];
  studentId?: string;
  avatar?: string;
}

export interface Student {
  id: string;
  studentCode: string; // e.g. SZ-2026-001
  name: string;
  phone: string;
  email: string;
  gender: 'male' | 'female' | 'other';
  photoUrl?: string;
  aadhaarNumber: string;
  guardianName: string;
  guardianPhone: string;
  emergencyContact: string;
  address: string;
  collegeOrWork: string;
  targetExam: string; // e.g. UPSC, CA, NEET, JEE, Banking, GATE
  joinedDate: string;
  planId: string;
  planName: string;
  shift: ShiftType;
  seatId?: string;
  seatNumber?: string;
  floorZone?: ZoneFloor;
  expiryDate: string;
  status: 'active' | 'inactive' | 'expired' | 'pending_due';
  totalPaid: number;
  pendingFee: number;
  notes?: string;
  aadhaarDocUrl?: string;
  qrCodeUrl?: string;
  password?: string;
}

export interface SeatSlotBooking {
  slotId: string;
  slotName: string;
  studentId: string;
  studentName: string;
  studentPhone?: string;
  studentCode?: string;
  expiryDate?: string;
}

export interface Seat {
  id: string;
  seatNumber: string; // e.g. ROOM-A-01, G-01
  floorZone: ZoneFloor;
  status: SeatStatus;
  slotBookings?: Record<string, SeatSlotBooking>; // keyed by slotId or slotName
  currentStudentId?: string;
  currentStudentName?: string;
  currentStudentPhone?: string;
  shiftAssigned?: ShiftType;
  expiryDate?: string;
  isPowerPlugAvailable?: boolean;
  isLockerAttached?: boolean;
  positionX?: number;
  positionY?: number;
  allowedSlotIds?: string[];
}

export interface MembershipPlan {
  id: string;
  title: string; // Slot Name e.g. "Morning", "Full Day", "Noon + Evening", "Afternoon", "Evening", "Night"
  shift: ShiftType;
  shiftTiming: string; // e.g. "06:00 - 23:00" or "22:00 - 06:00 (Next Day)"
  days?: string; // "All Days"
  durationDays: number; // e.g. 30
  price: number; // Monthly Fee in ₹
  availableSeats?: number;
  totalSeats?: number;
  description?: string;
  lateFinePerDay?: number;
  gracePeriodDays?: number;
  isActive: boolean;
  features?: string[];
}

export interface Payment {
  id: string;
  receiptNumber: string; // e.g. REC-2026-1001
  studentId: string;
  studentName: string;
  studentCode: string;
  studentPhone: string;
  planId: string;
  planName: string;
  amount: number;
  discount: number;
  lateFine: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  transactionRef?: string;
  paymentDate: string;
  dueDate?: string;
  status: PaymentStatus;
  notes?: string;
  collectedBy: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  seatNumber?: string;
  date: string; // YYYY-MM-DD
  checkInTime: string; // HH:mm:ss
  checkOutTime?: string;
  status: AttendanceStatus;
  mode: 'manual' | 'qr_scan' | 'student_app';
  notes?: string;
}

export interface Expense {
  id: string;
  category: 'rent' | 'electricity' | 'internet' | 'water' | 'salary' | 'maintenance' | 'tea_coffee' | 'cleaning' | 'furniture' | 'books' | 'other';
  title: string;
  amount: number;
  date: string;
  vendorName?: string;
  paymentMethod: PaymentMethod;
  receiptNo?: string;
  notes?: string;
}

export interface Notification {
  id: string;
  type: 'sms' | 'whatsapp' | 'email' | 'in_app';
  recipientType: 'single' | 'filtered' | 'all';
  targetStudentId?: string;
  targetStudentName?: string;
  subject: string;
  message: string;
  sentAt: string;
  sentBy: string;
  status: 'sent' | 'failed' | 'pending';
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  category: 'announcement' | 'holiday' | 'maintenance' | 'exam_update' | 'quote';
  isPinned: boolean;
  postedDate: string;
  postedBy: string;
}

export interface Complaint {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  studentPhone: string;
  seatNumber?: string;
  category: ComplaintCategory;
  subject: string;
  description: string;
  status: ComplaintStatus;
  createdAt: string;
  resolvedAt?: string;
  ownerReply?: string;
}

export interface Visitor {
  id: string;
  passNumber: string;
  name: string;
  phone: string;
  purpose: string; // e.g. "New Admission Query", "Parent Visit", "Vendor"
  entryTime: string;
  exitTime?: string;
  date: string;
  assignedSeatNumber?: string;
  photoUrl?: string;
  notes?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'furniture' | 'appliances' | 'it_network' | 'sanitation' | 'safety';
  quantity: number;
  condition: 'excellent' | 'good' | 'needs_repair' | 'damaged';
  lastServiceDate?: string;
  nextServiceDue?: string;
  location: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: 'manager' | 'receptionist' | 'cleaner' | 'librarian' | 'security';
  phone: string;
  email: string;
  shiftTiming: string;
  monthlySalary: number;
  joinedDate: string;
  status: 'active' | 'inactive';
}

export interface LibrarySettings {
  libraryName: string;
  tagline: string;
  ownerName: string;
  phone: string;
  email: string;
  whatsappNumber: string;
  upiId?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  logoUrl: string;
  currencySymbol: string;
  workingHours: string;
  gstNumber: string;
  receiptPrefix: string;
  wifiName: string;
  wifiPassword: string;
  enableSmsNotifications: boolean;
  enableWhatsappNotifications: boolean;
  enableAutoLateFee: boolean;
  lateFeePerDay: number;
  gracePeriodDays: number;
  mapEmbedUrl?: string;
}
