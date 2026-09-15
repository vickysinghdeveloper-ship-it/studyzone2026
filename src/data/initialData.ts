import {
  LibrarySettings,
  MembershipPlan,
  Seat,
  Student,
  Payment,
  AttendanceRecord,
  Expense,
  Notice,
  Complaint,
  Visitor,
  InventoryItem,
  StaffMember,
  Notification,
  AdminAccount
} from '../types';

export const FIXED_OWNER_EMAIL = 'vickysingh.developer@gmail.com';
export const DEFAULT_OWNER_PASSWORD = '@Study@2011';

export const initialAdmins: AdminAccount[] = [
  {
    id: 'adm_1',
    name: 'Shift In-Charge Admin',
    email: 'admin@studyzone.com',
    phone: '6209332827',
    password: 'admin@study2026',
    status: 'active',
    permissions: ['dashboard', 'students', 'seats', 'attendance', 'payments'],
    createdAt: '2026-06-01',
    createdBy: 'vickysingh.developer@gmail.com'
  }
];

export const initialSettings: LibrarySettings = {
  libraryName: 'StudyZone Library',
  tagline: 'Smart Library & Study Center Management System',
  ownerName: 'Vikram Singh',
  phone: '6209332827',
  email: 'contact@studyzone.com',
  whatsappNumber: '6209332827',
  upiId: '6209332827zbl@ybl',
  address: 'Behind Vishveshwaraya Bhawan, Near Hartali More, Boring Road',
  city: 'Patna',
  state: 'Bihar',
  pincode: '800001',
  logoUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=150&q=80',
  currencySymbol: '₹',
  workingHours: '24 Hours Open (3 Shifts)',
  gstNumber: '10AABCS1234F1ZB',
  receiptPrefix: 'SZ-REC',
  wifiName: 'StudyZone_5G_HighSpeed',
  wifiPassword: 'StudyQuiet@2026',
  enableSmsNotifications: true,
  enableWhatsappNotifications: true,
  enableAutoLateFee: true,
  lateFeePerDay: 50,
  gracePeriodDays: 3,
  mapEmbedUrl: 'https://maps.google.com/maps?q=StudyZone%20Library%2C%20Behind%20Vishveshwaraya%20Bhawan%2C%20Near%20Hartali%20More%2C%20Boring%20Road%2C%20Patna%2C%20Bihar%20800001&t=&z=15&ie=UTF8&iwloc=&output=embed'
};

export const initialPlans: MembershipPlan[] = [
  {
    id: 'slot_morning',
    title: 'Morning',
    shift: 'morning',
    shiftTiming: '06:00 - 23:00',
    days: 'All Days',
    durationDays: 30,
    price: 500,
    availableSeats: 25,
    totalSeats: 30,
    description: 'Early morning reading slot.',
    lateFinePerDay: 50,
    gracePeriodDays: 3,
    isActive: true,
    features: ['Reserved Desk', 'WiFi Access', 'RO Water']
  },
  {
    id: 'slot_fullday',
    title: 'Full Day',
    shift: 'fullday',
    shiftTiming: '06:00 - 22:00',
    days: 'All Days',
    durationDays: 30,
    price: 1200,
    availableSeats: 15,
    totalSeats: 30,
    description: 'Whole day uninterrupted study access.',
    lateFinePerDay: 50,
    gracePeriodDays: 3,
    isActive: true,
    features: ['Reserved Personal Desk', 'Locker Facility', 'High Speed WiFi', 'AC Hall']
  },
  {
    id: 'slot_noon_evening',
    title: 'Noon + Evening',
    shift: 'custom',
    shiftTiming: '11:00 - 22:00',
    days: 'All Days',
    durationDays: 30,
    price: 1000,
    availableSeats: 20,
    totalSeats: 30,
    description: 'Combined mid-day and evening pass.',
    lateFinePerDay: 50,
    gracePeriodDays: 3,
    isActive: true,
    features: ['Dedicated Desk', 'AC Access', 'WiFi']
  },
  {
    id: 'slot_afternoon',
    title: 'Afternoon',
    shift: 'evening',
    shiftTiming: '11:00 - 16:00',
    days: 'All Days',
    durationDays: 30,
    price: 700,
    availableSeats: 20,
    totalSeats: 30,
    description: 'Post-noon study slot.',
    lateFinePerDay: 50,
    gracePeriodDays: 3,
    isActive: true,
    features: ['Quiet Zone', 'Power Plug']
  },
  {
    id: 'slot_evening',
    title: 'Evening',
    shift: 'evening',
    shiftTiming: '16:00 - 22:00',
    days: 'All Days',
    durationDays: 30,
    price: 700,
    availableSeats: 18,
    totalSeats: 30,
    description: 'Evening revision slot.',
    lateFinePerDay: 50,
    gracePeriodDays: 3,
    isActive: true,
    features: ['Standard Desk', 'WiFi', 'Tea Point']
  },
  {
    id: 'slot_night',
    title: 'Night',
    shift: 'night',
    shiftTiming: '22:00 - 06:00 (Next Day)',
    days: 'All Days',
    durationDays: 30,
    price: 500,
    availableSeats: 22,
    totalSeats: 30,
    description: 'Overnight night-owl study slot.',
    lateFinePerDay: 50,
    gracePeriodDays: 3,
    isActive: true,
    features: ['24/7 Security', 'CCTV Guaranteed', 'Power Backup']
  }
];

const generateSeatsForRange = (
  zone: string,
  start: number,
  end: number,
  zonePrefix: string,
  occupiedSlotsInfo?: Record<number, Record<string, { studentId: string; name: string; phone: string; expiry?: string }>>
): Seat[] => {
  const seats: Seat[] = [];
  for (let i = start; i <= end; i++) {
    const numPadded = String(i).padStart(2, '0');
    const seatNumber = `${zonePrefix}-${numPadded}`;
    const slotMap = occupiedSlotsInfo?.[i] || {};
    
    // Construct slotBookings object
    const slotBookings: Record<string, any> = {};
    Object.keys(slotMap).forEach((slotId) => {
      const info = slotMap[slotId];
      let slotName = 'Slot';
      if (slotId === 'slot_morning') slotName = 'Morning';
      else if (slotId === 'slot_fullday') slotName = 'Full Day';
      else if (slotId === 'slot_noon_evening') slotName = 'Noon + Evening';
      else if (slotId === 'slot_afternoon') slotName = 'Afternoon';
      else if (slotId === 'slot_evening') slotName = 'Evening';
      else if (slotId === 'slot_night') slotName = 'Night';

      slotBookings[slotId] = {
        slotId,
        slotName,
        studentId: info.studentId,
        studentName: info.name,
        studentPhone: info.phone,
        expiryDate: info.expiry || '2026-08-15'
      };
    });

    const hasAnyBooking = Object.keys(slotBookings).length > 0;

    seats.push({
      id: `seat_${zone}_${i}`,
      seatNumber,
      floorZone: zone,
      status: hasAnyBooking ? 'occupied' : 'available',
      slotBookings,
      currentStudentId: hasAnyBooking ? Object.values(slotMap)[0]?.studentId : undefined,
      currentStudentName: hasAnyBooking ? Object.values(slotMap)[0]?.name : undefined,
      currentStudentPhone: hasAnyBooking ? Object.values(slotMap)[0]?.phone : undefined,
      isPowerPlugAvailable: true,
      isLockerAttached: i % 2 === 0
    });
  }
  return seats;
};

export const initialSeats: Seat[] = [
  // Room A (1 to 25) -> Prefix ROOM-A
  ...generateSeatsForRange('room_a', 1, 25, 'ROOM-A'),
  // Room B (26 to 49) -> Prefix ROOM-B
  ...generateSeatsForRange('room_b', 26, 49, 'ROOM-B'),
  // Room C (50 to 75) -> Prefix ROOM-C
  ...generateSeatsForRange('room_c', 50, 75, 'ROOM-C'),
  // Hall A (76 to 107) -> Prefix HALL-A
  ...generateSeatsForRange('hall_a', 76, 107, 'HALL-A'),
  // Office Room (148 to 159) -> Prefix OFF
  ...generateSeatsForRange('office_room', 148, 159, 'OFF')
];

export const initialStudents: Student[] = [];

export const initialPayments: Payment[] = [];

export const initialAttendance: AttendanceRecord[] = [];

export const initialExpenses: Expense[] = [
  {
    id: 'exp_1',
    category: 'rent',
    title: 'Building Rent - July 2026',
    amount: 35000,
    date: '2026-07-05',
    vendorName: 'Sharma Complex Pvt Ltd',
    paymentMethod: 'bank_transfer',
    receiptNo: 'RENT-JULY-01',
    notes: 'Ground & 1st Floor premises rent'
  },
  {
    id: 'exp_2',
    category: 'electricity',
    title: 'Commercial Electricity Bill (NPCL)',
    amount: 14200,
    date: '2026-07-12',
    vendorName: 'Noida Power Corporation',
    paymentMethod: 'upi',
    receiptNo: 'NPCL-99012'
  },
  {
    id: 'exp_3',
    category: 'internet',
    title: 'Airtel Dual Fiber 200 Mbps Connection',
    amount: 2360,
    date: '2026-07-02',
    vendorName: 'Airtel Broadband',
    paymentMethod: 'upi',
    receiptNo: 'AIR-8812'
  },
  {
    id: 'exp_4',
    category: 'tea_coffee',
    title: 'Tea Coffee Vending Powder & Milk',
    amount: 3500,
    date: '2026-07-18',
    vendorName: 'Nestle Refreshments',
    paymentMethod: 'cash'
  }
];

export const initialNotices: Notice[] = [
  {
    id: 'not_1',
    title: 'Maintenance Alert: AC Service on Sunday',
    content: 'All AC units in Reading Hall and First Floor will undergo scheduled maintenance this Sunday from 02:00 PM to 04:00 PM. Backup fans will be operating.',
    category: 'maintenance',
    isPinned: true,
    postedDate: '2026-07-20',
    postedBy: 'Admin Team'
  },
  {
    id: 'not_2',
    title: 'Independence Day Special Library Hours',
    content: 'StudyZone will remain open 24x7 on 15th August. Special tea & snacks will be served in the cafeteria zone at 10:00 AM.',
    category: 'announcement',
    isPinned: true,
    postedDate: '2026-07-15',
    postedBy: 'Management'
  },
  {
    id: 'not_3',
    title: 'Motivational Quote of the Week',
    content: '"Success is not final, failure is not fatal: it is the courage to continue that counts." — Keep grinding for your dream exam!',
    category: 'quote',
    isPinned: false,
    postedDate: '2026-07-21',
    postedBy: 'StudyZone Mentors'
  }
];

export const initialComplaints: Complaint[] = [];

export const initialVisitors: Visitor[] = [
  {
    id: 'vis_1',
    passNumber: 'VIS-101',
    name: 'Vikash Chaurasia',
    phone: '9711002233',
    purpose: 'New Admission Inquiry for UPSC 24hr seat',
    entryTime: '11:30 AM',
    exitTime: '12:00 PM',
    date: '2026-07-22',
    notes: 'Interested in Ground Floor AC room seat.'
  }
];

export const initialInventory: InventoryItem[] = [
  { id: 'inv_1', name: 'Ergonomic Mesh Study Chairs', category: 'furniture', quantity: 65, condition: 'excellent', location: 'All Study Halls' },
  { id: 'inv_2', name: 'Individual Reading Desks with LED', category: 'furniture', quantity: 65, condition: 'excellent', location: 'All Study Halls' },
  { id: 'inv_3', name: 'Carrier 2.0 Ton Inverter Split AC', category: 'appliances', quantity: 6, condition: 'good', lastServiceDate: '2026-06-10', location: 'Reading Halls' },
  { id: 'inv_4', name: 'Cisco Fiber Router & Access Points', category: 'it_network', quantity: 4, condition: 'excellent', location: 'Main Hub' },
  { id: 'inv_5', name: 'Personal Storage Lockers', category: 'furniture', quantity: 40, condition: 'good', location: 'Locker Alley' }
];

export const initialStaff: StaffMember[] = [
  { id: 'stf_1', name: 'Rajesh Kumar', role: 'manager', phone: '9810102030', email: 'rajesh@studyzone.com', shiftTiming: '08:00 AM - 05:00 PM', monthlySalary: 22000, joinedDate: '2025-06-01', status: 'active' },
  { id: 'stf_2', name: 'Sunita Devi', role: 'cleaner', phone: '9810102031', email: 'sunita@studyzone.com', shiftTiming: '06:00 AM - 02:00 PM', monthlySalary: 12000, joinedDate: '2025-07-15', status: 'active' }
];
