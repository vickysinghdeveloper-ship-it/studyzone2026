import React, { useState } from 'react';
import {
  initialSettings,
  initialStudents,
  initialSeats,
  initialPlans,
  initialPayments,
  initialAttendance,
  initialExpenses,
  initialNotices,
  initialComplaints,
  initialVisitors,
  initialInventory,
  initialAdmins,
  FIXED_OWNER_EMAIL,
  DEFAULT_OWNER_PASSWORD
} from './data/initialData';
import {
  Student,
  Seat,
  MembershipPlan,
  Payment,
  AttendanceRecord,
  Expense,
  Notice,
  Complaint,
  Visitor,
  InventoryItem,
  LibrarySettings,
  SeatSlotBooking,
  User,
  AdminAccount
} from './types';
import { isFullDayPlan, isNightPlan, areSlotsInConflict } from './utils/slotUtils';

// Public Components
import { LandingPage } from './components/public/LandingPage';
import { LoginModal } from './components/public/LoginModal';

// Owner Components
import { DashboardLayout } from './components/owner/DashboardLayout';
import { OwnerDashboard } from './components/owner/OwnerDashboard';
import { StudentManagement } from './components/owner/StudentManagement';
import { VisualSeatMap } from './components/owner/VisualSeatMap';
import { MembershipPlans } from './components/owner/MembershipPlans';
import { AttendanceTracker } from './components/owner/AttendanceTracker';
import { FeeManagement } from './components/owner/FeeManagement';
import { ExpenseTracker } from './components/owner/ExpenseTracker';
import { OtherModules } from './components/owner/OtherModules';
import { SettingsAndHostingerExport } from './components/owner/SettingsAndHostingerExport';
import { AdminManagement } from './components/owner/AdminManagement';

// Student Component
import { StudentPortal } from './components/student/StudentPortal';

export function App() {
  // Core View Routing: 'public' | 'owner' | 'student'
  const [viewMode, setViewMode] = useState<'public' | 'owner' | 'student'>('public');
  const [activeOwnerTab, setActiveOwnerTab] = useState<string>('dashboard');
  
  // Login Modals & Current User Session
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [activeLoginRole, setActiveLoginRole] = useState<'owner' | 'admin' | 'student'>('owner');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loggedStudent, setLoggedStudent] = useState<Student | null>(null);

  // Owner Password state with local persistence
  const [ownerPassword, setOwnerPassword] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('studyzone_owner_password');
      if (saved) return saved;
    } catch (e) {}
    return DEFAULT_OWNER_PASSWORD;
  });

  // Admin Accounts list with local persistence
  const [admins, setAdmins] = useState<AdminAccount[]>(() => {
    try {
      const saved = localStorage.getItem('studyzone_admins');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return initialAdmins;
  });

  // Sync admins to localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem('studyzone_admins', JSON.stringify(admins));
    } catch (e) {}
  }, [admins]);

  const handleUpdateOwnerPassword = (newPass: string) => {
    setOwnerPassword(newPass);
    try {
      localStorage.setItem('studyzone_owner_password', newPass);
    } catch (e) {}
  };

  const handleAddAdmin = (adminData: Omit<AdminAccount, 'id' | 'createdAt'>) => {
    const newAdmin: AdminAccount = {
      ...adminData,
      id: `adm_${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setAdmins((prev) => [newAdmin, ...prev]);
  };

  const handleUpdateAdmin = (id: string, updates: Partial<AdminAccount>) => {
    setAdmins((prev) =>
      prev.map((adm) => (adm.id === id ? { ...adm, ...updates } : adm))
    );
  };

  const handleDeleteAdmin = (id: string) => {
    setAdmins((prev) => prev.filter((adm) => adm.id !== id));
  };

  const handleToggleAdminStatus = (id: string) => {
    setAdmins((prev) =>
      prev.map((adm) =>
        adm.id === id
          ? { ...adm, status: adm.status === 'active' ? 'restricted' : 'active' }
          : adm
      )
    );
  };

  // Fee collection drawer trigger
  const [collectFeeStudentId, setCollectFeeStudentId] = useState<string | undefined>(undefined);

  // Global Application State (persisted in React memory & localStorage)
  const [settings, setSettings] = useState<LibrarySettings>(() => {
    try {
      const saved = localStorage.getItem('studyzone_settings');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialSettings;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem('studyzone_students');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return initialStudents;
  });

  const [seats, setSeats] = useState<Seat[]>(() => {
    try {
      const saved = localStorage.getItem('studyzone_seats');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return initialSeats;
  });

  const [plans, setPlans] = useState<MembershipPlan[]>(initialPlans);

  const [payments, setPayments] = useState<Payment[]>(() => {
    try {
      const saved = localStorage.getItem('studyzone_payments');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return initialPayments;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem('studyzone_attendance');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return initialAttendance;
  });

  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [notices, setNotices] = useState<Notice[]>(initialNotices);
  const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints);
  const [visitors, setVisitors] = useState<Visitor[]>(initialVisitors);
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);

  // Sync state changes to localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem('studyzone_students', JSON.stringify(students));
    } catch (e) {}
  }, [students]);

  React.useEffect(() => {
    try {
      localStorage.setItem('studyzone_seats', JSON.stringify(seats));
    } catch (e) {}
  }, [seats]);

  React.useEffect(() => {
    try {
      localStorage.setItem('studyzone_payments', JSON.stringify(payments));
    } catch (e) {}
  }, [payments]);

  React.useEffect(() => {
    try {
      localStorage.setItem('studyzone_attendance', JSON.stringify(attendance));
    } catch (e) {}
  }, [attendance]);

  // Handlers
  const handleOpenLogin = (role: 'owner' | 'admin' | 'student') => {
    setActiveLoginRole(role);
    setIsLoginModalOpen(true);
  };

  const handleLoginSuccess = (
    role: 'owner' | 'admin' | 'student',
    studentData?: Student,
    adminData?: AdminAccount
  ) => {
    setIsLoginModalOpen(false);

    if (role === 'owner') {
      const ownerUser: User = {
        id: 'usr_owner_main',
        name: settings.ownerName || 'Vicky Singh',
        email: FIXED_OWNER_EMAIL,
        phone: settings.phone || '6209332827',
        role: 'owner'
      };
      setCurrentUser(ownerUser);
      setViewMode('owner');
      setActiveOwnerTab('dashboard');
    } else if (role === 'admin' && adminData) {
      // Record admin last login timestamp
      handleUpdateAdmin(adminData.id, {
        lastLogin: new Date().toISOString().split('T')[0]
      });

      const adminUser: User = {
        id: adminData.id,
        name: adminData.name,
        email: adminData.email,
        phone: adminData.phone,
        role: 'admin',
        permissions: adminData.permissions
      };
      setCurrentUser(adminUser);
      setViewMode('owner');

      // Navigate to the first permitted tab or dashboard
      if (adminData.permissions.length > 0) {
        setActiveOwnerTab(adminData.permissions[0]);
      } else {
        setActiveOwnerTab('dashboard');
      }
    } else if (studentData) {
      setLoggedStudent(studentData);
      const studentUser: User = {
        id: studentData.id,
        name: studentData.name,
        email: studentData.email,
        phone: studentData.phone,
        role: 'student',
        studentId: studentData.id
      };
      setCurrentUser(studentUser);
      setViewMode('student');
    }
  };

  const handleLogout = () => {
    setViewMode('public');
    setLoggedStudent(null);
    setCurrentUser(null);
    setActiveOwnerTab('dashboard');
  };

  // Helper to check plan/slot types
  const isFullDayPlan = (plan?: MembershipPlan, slotId?: string, slotName?: string) => {
    if (plan) {
      return plan.id === 'slot_fullday' || plan.shift === 'fullday' || plan.title.toLowerCase().includes('full day');
    }
    if (slotName) return slotName.toLowerCase().includes('full day');
    return slotId === 'slot_fullday';
  };

  const isNightPlan = (plan?: MembershipPlan, slotId?: string, slotName?: string) => {
    if (plan) {
      return plan.id === 'slot_night' || plan.shift === 'night' || plan.title.toLowerCase().includes('night');
    }
    if (slotName) return slotName.toLowerCase().includes('night');
    return slotId === 'slot_night';
  };

  // Helper to validate seat availability against time slots
  const validateSeatAvailability = (
    seatId?: string,
    planId?: string,
    studentId?: string
  ): { valid: boolean; reason?: string } => {
    if (!seatId || !planId) return { valid: true };

    const targetSeat = seats.find((s) => s.id === seatId || s.seatNumber === seatId);
    if (!targetSeat) return { valid: true };

    const reqPlanId = planId;

    // Active bookings on target seat from slotBookings + students array
    const activeBookings: Array<{
      slotId: string;
      slotName: string;
      studentId: string;
      studentName: string;
    }> = [];

    if (targetSeat.slotBookings) {
      Object.entries(targetSeat.slotBookings).forEach(([sId, booking]) => {
        const b = booking as SeatSlotBooking;
        if (b && b.studentId && b.studentId !== studentId) {
          const bPlan = plans.find((p) => p.id === sId);
          activeBookings.push({
            slotId: sId,
            slotName: b.slotName || bPlan?.title || 'Slot',
            studentId: b.studentId,
            studentName: b.studentName
          });
        }
      });
    }

    students.forEach((st) => {
      if (
        st.id !== studentId &&
        (st.seatId === targetSeat.id || (st.seatNumber && st.seatNumber === targetSeat.seatNumber))
      ) {
        const stPlan = plans.find((p) => p.id === st.planId || p.shift === st.shift);
        const stSlotId = st.planId || stPlan?.id || 'slot_fullday';
        const existingEntry = activeBookings.find((b) => b.studentId === st.id && b.slotId === stSlotId);
        if (!existingEntry) {
          activeBookings.push({
            slotId: stSlotId,
            slotName: st.planName || stPlan?.title || 'Assigned Slot',
            studentId: st.id,
            studentName: st.name
          });
        }
      }
    });

    if (activeBookings.length === 0) {
      return { valid: true };
    }

    // Check conflict against every active booking
    for (const booking of activeBookings) {
      if (areSlotsInConflict(reqPlanId, booking.slotId, plans)) {
        return {
          valid: false,
          reason: `Seat ${targetSeat.seatNumber} is already booked for "${booking.slotName}" by ${booking.studentName}.`
        };
      }
    }

    return { valid: true };
  };

  // State Updates
  const handleSaveStudent = (studentData: Partial<Student>): Student => {
    // Look up target seat object if seatId or seatNumber was provided
    const targetSeat = studentData.seatId
      ? seats.find((st) => st.id === studentData.seatId || st.seatNumber === studentData.seatId)
      : undefined;
    const assignedSeatId = targetSeat ? targetSeat.id : studentData.seatId;
    const assignedSeatNumber = targetSeat ? targetSeat.seatNumber : undefined;

    // Find corresponding plan or slot ID
    const matchedPlan = plans.find(
      (p) => p.id === studentData.planId || p.shift === studentData.shift
    ) || plans[0];
    const slotIdToUse = matchedPlan ? matchedPlan.id : 'slot_fullday';
    const slotNameToUse = matchedPlan ? matchedPlan.title : 'Full Day';

    // Validate seat availability before proceeding
    if (assignedSeatId) {
      const validation = validateSeatAvailability(assignedSeatId, slotIdToUse, studentData.id);
      if (!validation.valid) {
        alert(validation.reason);
        throw new Error(validation.reason || 'Seat conflict');
      }
    }

    const isFullDay = isFullDayPlan(matchedPlan, slotIdToUse, slotNameToUse);
    const dayPlans = plans.filter((p) => !isNightPlan(p));

    let updatedStudent: Student;

    if (studentData.id) {
      // Edit existing
      const existing = students.find((s) => s.id === studentData.id);

      updatedStudent = {
        ...existing,
        ...studentData,
        password: studentData.password || existing?.password || '123456',
        seatId: assignedSeatId,
        seatNumber: assignedSeatId ? (assignedSeatNumber || existing?.seatNumber) : undefined,
        planName: matchedPlan ? matchedPlan.title : (studentData.planName || existing?.planName || 'Monthly Plan')
      } as Student;

      setStudents((prev) => prev.map((s) => (s.id === studentData.id ? updatedStudent : s)));
      if (loggedStudent && loggedStudent.id === updatedStudent.id) {
        setLoggedStudent(updatedStudent);
      }

      // Synchronize seats state
      setSeats((prevSeats) =>
        prevSeats.map((seat) => {
          const updatedBookings = { ...(seat.slotBookings || {}) };
          let bookingsChanged = false;

          // Remove previous bookings for this student on any seat
          Object.keys(updatedBookings).forEach((key) => {
            if (updatedBookings[key]?.studentId === updatedStudent.id) {
              delete updatedBookings[key];
              bookingsChanged = true;
            }
          });

          // If this is the newly assigned seat
          if (assignedSeatId && seat.id === assignedSeatId) {
            if (isFullDay) {
              // Assign all day slots to this student (excluding night)
              dayPlans.forEach((dp) => {
                updatedBookings[dp.id] = {
                  slotId: dp.id,
                  slotName: dp.title,
                  studentId: updatedStudent.id,
                  studentName: updatedStudent.name,
                  studentPhone: updatedStudent.phone,
                  studentCode: updatedStudent.studentCode,
                  expiryDate: updatedStudent.expiryDate || '2026-08-30'
                };
              });
            } else {
              // Assign specific time slot
              updatedBookings[slotIdToUse] = {
                slotId: slotIdToUse,
                slotName: slotNameToUse,
                studentId: updatedStudent.id,
                studentName: updatedStudent.name,
                studentPhone: updatedStudent.phone,
                studentCode: updatedStudent.studentCode,
                expiryDate: updatedStudent.expiryDate || '2026-08-30'
              };
            }

            return {
              ...seat,
              status: 'occupied',
              currentStudentId: updatedStudent.id,
              currentStudentName: updatedStudent.name,
              currentStudentPhone: updatedStudent.phone,
              shiftAssigned: updatedStudent.shift,
              expiryDate: updatedStudent.expiryDate,
              slotBookings: updatedBookings
            };
          }

          // If this was a seat where bookings were removed
          if (bookingsChanged) {
            const remainingBookings = Object.keys(updatedBookings).length;
            const isCurrentMatch = seat.currentStudentId === updatedStudent.id;
            return {
              ...seat,
              status: remainingBookings > 0 ? 'occupied' : 'available',
              currentStudentId: isCurrentMatch ? undefined : seat.currentStudentId,
              currentStudentName: isCurrentMatch ? undefined : seat.currentStudentName,
              currentStudentPhone: isCurrentMatch ? undefined : seat.currentStudentPhone,
              slotBookings: updatedBookings
            };
          }

          return seat;
        })
      );

      return updatedStudent;
    } else {
      // Add new student
      const newId = `std_${Date.now()}`;
      const newCode = `SZ-2026-${String(students.length + 1).padStart(3, '0')}`;
      updatedStudent = {
        id: newId,
        studentCode: newCode,
        name: studentData.name || 'New Student',
        phone: studentData.phone || '',
        email: studentData.email || '',
        gender: studentData.gender || 'male',
        aadhaarNumber: studentData.aadhaarNumber || '',
        guardianName: studentData.guardianName || '',
        guardianPhone: studentData.guardianPhone || '',
        emergencyContact: studentData.emergencyContact || '',
        address: studentData.address || '',
        collegeOrWork: studentData.collegeOrWork || '',
        targetExam: studentData.targetExam || '',
        planId: studentData.planId || matchedPlan?.id || '',
        planName: matchedPlan ? matchedPlan.title : 'Monthly Plan',
        shift: studentData.shift || 'morning',
        seatId: assignedSeatId,
        seatNumber: assignedSeatNumber,
        joinedDate: new Date().toISOString().split('T')[0],
        expiryDate: studentData.expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: studentData.status || 'active',
        totalPaid: studentData.totalPaid !== undefined ? studentData.totalPaid : 0,
        pendingFee: studentData.pendingFee !== undefined ? studentData.pendingFee : (matchedPlan?.price || 1500),
        photoUrl: studentData.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
        aadhaarDocUrl: studentData.aadhaarDocUrl || '',
        password: studentData.password || '123456',
        notes: studentData.notes || 'Online Self-Registration'
      };

      setStudents((prev) => [updatedStudent, ...prev]);

      // If seat assigned, update seat status and slotBookings
      if (assignedSeatId) {
        setSeats((prevSeats) =>
          prevSeats.map((seat) => {
            if (seat.id === assignedSeatId) {
              const updatedBookings = { ...(seat.slotBookings || {}) };
              if (isFullDay) {
                dayPlans.forEach((dp) => {
                  updatedBookings[dp.id] = {
                    slotId: dp.id,
                    slotName: dp.title,
                    studentId: updatedStudent.id,
                    studentName: updatedStudent.name,
                    studentPhone: updatedStudent.phone,
                    studentCode: updatedStudent.studentCode,
                    expiryDate: updatedStudent.expiryDate
                  };
                });
              } else {
                updatedBookings[slotIdToUse] = {
                  slotId: slotIdToUse,
                  slotName: slotNameToUse,
                  studentId: updatedStudent.id,
                  studentName: updatedStudent.name,
                  studentPhone: updatedStudent.phone,
                  studentCode: updatedStudent.studentCode,
                  expiryDate: updatedStudent.expiryDate
                };
              }
              return {
                ...seat,
                status: 'occupied',
                currentStudentId: updatedStudent.id,
                currentStudentName: updatedStudent.name,
                currentStudentPhone: updatedStudent.phone,
                shiftAssigned: updatedStudent.shift,
                expiryDate: updatedStudent.expiryDate,
                slotBookings: updatedBookings
              };
            }
            return seat;
          })
        );
      }

      return updatedStudent;
    }
  };

  const handleDeleteStudent = (studentId: string) => {
    if (confirm('Are you sure you want to remove this student?')) {
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
      setSeats((prevSeats) =>
        prevSeats.map((seat) => {
          const updatedBookings = { ...(seat.slotBookings || {}) };
          let changed = false;
          Object.keys(updatedBookings).forEach((key) => {
            if (updatedBookings[key]?.studentId === studentId) {
              delete updatedBookings[key];
              changed = true;
            }
          });
          const isCurrent = seat.currentStudentId === studentId;
          if (changed || isCurrent) {
            const remaining = Object.keys(updatedBookings).length;
            return {
              ...seat,
              status: remaining > 0 ? 'occupied' : 'available',
              currentStudentId: isCurrent ? undefined : seat.currentStudentId,
              currentStudentName: isCurrent ? undefined : seat.currentStudentName,
              slotBookings: updatedBookings
            };
          }
          return seat;
        })
      );
    }
  };

  const handleUpdateSeatSlot = (
    seatId: string,
    slotId: string,
    action: 'assign' | 'release',
    studentId?: string,
    slotName?: string
  ) => {
    const targetPlan = plans.find((p) => p.id === slotId);
    const isFullDay = isFullDayPlan(targetPlan, slotId, slotName);
    const dayPlans = plans.filter((p) => !isNightPlan(p));

    setSeats(
      seats.map((seat) => {
        if (seat.id !== seatId) return seat;

        const currentBookings = seat.slotBookings ? { ...seat.slotBookings } : {};

        if (action === 'assign' && studentId) {
          const student = students.find((st) => st.id === studentId);
          if (student) {
            setStudents(
              students.map((st) =>
                st.id === studentId
                  ? {
                      ...st,
                      seatId: seat.id,
                      seatNumber: seat.seatNumber,
                      planId: targetPlan?.id || slotId,
                      planName: targetPlan?.title || slotName || st.planName
                    }
                  : st
              )
            );

            if (isFullDay) {
              dayPlans.forEach((dp) => {
                currentBookings[dp.id] = {
                  slotId: dp.id,
                  slotName: dp.title,
                  studentId: student.id,
                  studentName: student.name,
                  studentPhone: student.phone,
                  studentCode: student.studentCode,
                  expiryDate: student.expiryDate || '2026-08-30'
                };
              });
            } else {
              currentBookings[slotId] = {
                slotId,
                slotName: slotName || targetPlan?.title || 'Slot',
                studentId: student.id,
                studentName: student.name,
                studentPhone: student.phone,
                studentCode: student.studentCode,
                expiryDate: student.expiryDate || '2026-08-30'
              };
            }

            return {
              ...seat,
              status: 'occupied',
              currentStudentId: student.id,
              currentStudentName: student.name,
              currentStudentPhone: student.phone,
              slotBookings: currentBookings
            };
          }
        } else if (action === 'release') {
          const releasedBooking = currentBookings[slotId];
          const relStudentId = releasedBooking?.studentId;

          if (relStudentId) {
            const isRelFullDay =
              isFullDay || (releasedBooking?.slotName && releasedBooking.slotName.toLowerCase().includes('full day'));

            if (isRelFullDay) {
              dayPlans.forEach((dp) => {
                if (currentBookings[dp.id]?.studentId === relStudentId) {
                  delete currentBookings[dp.id];
                }
              });
            } else {
              delete currentBookings[slotId];
            }

            // Check if student has remaining bookings on any seat
            const remainingForStudent = Object.values(currentBookings).some(
              (b) => (b as SeatSlotBooking)?.studentId === relStudentId
            );
            if (!remainingForStudent) {
              setStudents(
                students.map((st) =>
                  st.id === relStudentId
                    ? { ...st, seatId: undefined, seatNumber: undefined }
                    : st
                )
              );
            }
          } else {
            delete currentBookings[slotId];
          }

          const remainingBookings = Object.keys(currentBookings).length;

          return {
            ...seat,
            status: remainingBookings > 0 ? 'occupied' : 'available',
            currentStudentId: remainingBookings > 0 ? seat.currentStudentId : undefined,
            currentStudentName: remainingBookings > 0 ? seat.currentStudentName : undefined,
            slotBookings: currentBookings
          };
        }

        return seat;
      })
    );
  };

  const handleUpdateSeat = (
    seatId: string,
    action: 'assign' | 'release' | 'change_status',
    studentId?: string,
    newStatus?: string
  ) => {
    setSeats(
      seats.map((seat) => {
        if (seat.id !== seatId) return seat;

        if (action === 'assign' && studentId) {
          const student = students.find((st) => st.id === studentId);
          if (student) {
            // Update student's assigned seat
            setStudents(students.map((st) => (st.id === studentId ? { ...st, seatId: seat.id, seatNumber: seat.seatNumber } : st)));
            return {
              ...seat,
              status: 'occupied',
              currentStudentId: student.id,
              currentStudentName: student.name,
              shiftAssigned: student.shift,
              expiryDate: student.expiryDate
            };
          }
        } else if (action === 'release') {
          if (seat.currentStudentId) {
            setStudents(
              students.map((st) => (st.id === seat.currentStudentId ? { ...st, seatId: undefined, seatNumber: undefined } : st))
            );
          }
          return {
            ...seat,
            status: 'available',
            currentStudentId: undefined,
            currentStudentName: undefined,
            shiftAssigned: undefined,
            expiryDate: undefined
          };
        } else if (action === 'change_status' && newStatus) {
          return { ...seat, status: newStatus as any };
        }

        return seat;
      })
    );
  };

  const handleRecordPayment = (paymentData: any) => {
    const student = students.find((s) => s.id === paymentData.studentId);
    const receiptNo = `REC-${Date.now().toString().slice(-5)}`;
    
    const newPayment: Payment = {
      id: `pay_${Date.now()}`,
      receiptNumber: receiptNo,
      studentId: paymentData.studentId,
      studentName: student ? student.name : 'Student',
      studentCode: student ? student.studentCode : 'SZ-000',
      studentPhone: student ? student.phone : '',
      planId: paymentData.planId,
      planName: paymentData.planName,
      amount: paymentData.amount,
      discount: paymentData.discount,
      lateFine: paymentData.lateFine,
      totalAmount: paymentData.totalAmount,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: paymentData.paymentMethod,
      transactionRef: paymentData.transactionRef,
      status: 'paid',
      collectedBy: 'Owner',
      notes: paymentData.notes
    };

    setPayments([newPayment, ...payments]);

    // Update student paid amounts and clear pending fees
    if (student) {
      setStudents(
        students.map((st) =>
          st.id === student.id
            ? {
                ...st,
                totalPaid: (st.totalPaid || 0) + paymentData.totalAmount,
                pendingFee: 0,
                status: 'active'
              }
            : st
        )
      );
    }
  };

  const handleMarkAttendance = (data: { studentId?: string; studentCode?: string; status?: string; mode?: string }) => {
    let targetStudent = students.find((s) => s.id === data.studentId || s.studentCode === data.studentCode);
    if (!targetStudent) return;

    const newRec: AttendanceRecord = {
      id: `att_${Date.now()}`,
      studentId: targetStudent.id,
      studentName: targetStudent.name,
      studentCode: targetStudent.studentCode,
      seatNumber: targetStudent.seatNumber,
      date: new Date().toISOString().split('T')[0],
      checkInTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      status: (data.status as any) || 'present',
      mode: (data.mode as any) || 'qr_scan'
    };

    setAttendance([newRec, ...attendance]);
  };

  const handleSavePlan = (planData: Partial<MembershipPlan>) => {
    const exists = planData.id && plans.some((p) => p.id === planData.id);
    if (exists) {
      setPlans(plans.map((p) => (p.id === planData.id ? { ...p, ...planData } as MembershipPlan : p)));
    } else {
      const newPlan: MembershipPlan = {
        id: planData.id || `plan_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: planData.title || 'New Plan',
        shift: planData.shift || 'morning',
        shiftTiming: planData.shiftTiming || '06:00 AM - 12:00 PM',
        durationDays: planData.durationDays || 30,
        price: planData.price || 1200,
        totalSeats: planData.totalSeats || 30,
        availableSeats: planData.totalSeats || 30,
        description: planData.description || '',
        lateFinePerDay: planData.lateFinePerDay || 50,
        gracePeriodDays: planData.gracePeriodDays || 3,
        isActive: planData.isActive !== undefined ? planData.isActive : true,
        features: planData.features || ['Reserved Seat', 'High Speed WiFi']
      };
      setPlans((prev) => [...prev, newPlan]);
    }
  };

  const handleDeletePlan = (planIdToDelete: string) => {
    setPlans(plans.filter((p) => p.id !== planIdToDelete));
  };

  const handleUpdateSeatDetails = (seatId: string, updatedSeatData: Partial<Seat>) => {
    setSeats((prevSeats) =>
      prevSeats.map((s) => {
        if (s.id !== seatId) return s;
        const oldSeatNumber = s.seatNumber;
        const newSeatNumber = updatedSeatData.seatNumber || s.seatNumber;

        if (oldSeatNumber !== newSeatNumber) {
          setStudents((prevStudents) =>
            prevStudents.map((st) =>
              st.seatId === seatId || st.seatNumber === oldSeatNumber
                ? { ...st, seatNumber: newSeatNumber }
                : st
            )
          );
        }

        return { ...s, ...updatedSeatData };
      })
    );
  };

  const handleCreateSingleSeat = (seatData: Partial<Seat>) => {
    const newId = `seat_${Date.now()}`;
    const newSeat: Seat = {
      id: newId,
      seatNumber: seatData.seatNumber || `Seat ${seats.length + 1}`,
      floorZone: seatData.floorZone || 'room_a',
      status: seatData.status || 'available',
      isPowerPlugAvailable: seatData.isPowerPlugAvailable ?? true,
      isLockerAttached: seatData.isLockerAttached ?? false,
      allowedSlotIds: seatData.allowedSlotIds
    };
    setSeats([...seats, newSeat]);
  };

  const handleCreateBulkSeats = (bulkData: {
    zone: string;
    startNum: number;
    endNum: number;
    prefix: string;
    powerPlug: boolean;
    locker: boolean;
    status: any;
    slotIds?: string[];
  }) => {
    const newGeneratedSeats: Seat[] = [];
    for (let i = bulkData.startNum; i <= bulkData.endNum; i++) {
      const numStr = `${bulkData.prefix}${i}`;
      newGeneratedSeats.push({
        id: `seat_${bulkData.zone}_${i}_${Date.now()}`,
        seatNumber: numStr,
        floorZone: bulkData.zone,
        status: bulkData.status || 'available',
        isPowerPlugAvailable: bulkData.powerPlug,
        isLockerAttached: bulkData.locker,
        allowedSlotIds: bulkData.slotIds
      });
    }
    setSeats([...seats, ...newGeneratedSeats]);
  };

  const handleDeleteSeats = (seatIdsToDelete: string[]) => {
    setSeats(seats.filter((s) => !seatIdsToDelete.includes(s.id)));
    setStudents(
      students.map((st) => (st.seatId && seatIdsToDelete.includes(st.seatId) ? { ...st, seatId: undefined, seatNumber: undefined } : st))
    );
  };

  const handleAddExpense = (expenseData: Partial<Expense>) => {
    const newExp: Expense = {
      id: `exp_${Date.now()}`,
      category: expenseData.category || 'other',
      title: expenseData.title || 'Expense Item',
      amount: expenseData.amount || 0,
      date: expenseData.date || new Date().toISOString().split('T')[0],
      vendorName: expenseData.vendorName,
      paymentMethod: expenseData.paymentMethod || 'upi',
      notes: expenseData.notes
    };
    setExpenses([newExp, ...expenses]);
  };

  const handleAddNotice = (noticeData: Partial<Notice>) => {
    const newNot: Notice = {
      id: `not_${Date.now()}`,
      title: noticeData.title || 'Notice Title',
      content: noticeData.content || '',
      category: noticeData.category || 'announcement',
      postedDate: new Date().toISOString().split('T')[0],
      postedBy: 'Library Management',
      isPinned: noticeData.isPinned || false
    };
    setNotices([newNot, ...notices]);
  };

  const handleReplyComplaint = (id: string, reply: string, status: string) => {
    setComplaints(
      complaints.map((c) => (c.id === id ? { ...c, ownerReply: reply, status: status as any } : c))
    );
  };

  const handleLogVisitor = (visData: Partial<Visitor>) => {
    const newVis: Visitor = {
      id: `vis_${Date.now()}`,
      passNumber: `VP-${Date.now().toString().slice(-4)}`,
      name: visData.name || 'Visitor',
      phone: visData.phone || '',
      purpose: visData.purpose || 'Inquiry',
      entryTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toISOString().split('T')[0]
    };
    setVisitors([newVis, ...visitors]);
  };

  const handleSubmitStudentComplaint = (subject: string, description: string) => {
    if (!loggedStudent) return;
    const newCmp: Complaint = {
      id: `cmp_${Date.now()}`,
      studentId: loggedStudent.id,
      studentName: loggedStudent.name,
      studentCode: loggedStudent.studentCode,
      studentPhone: loggedStudent.phone,
      seatNumber: loggedStudent.seatNumber,
      category: 'other',
      subject,
      description,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setComplaints([newCmp, ...complaints]);
  };

  // Render View
  if (viewMode === 'student' && loggedStudent) {
    return (
      <StudentPortal
        student={loggedStudent}
        settings={settings}
        payments={payments}
        attendance={attendance}
        notices={notices}
        complaints={complaints}
        seats={seats}
        plans={plans}
        onLogout={handleLogout}
        onSubmitComplaint={handleSubmitStudentComplaint}
        onMarkAttendance={handleMarkAttendance}
        onUpdateProfile={handleSaveStudent}
      />
    );
  }

  if (viewMode === 'owner') {
    return (
      <DashboardLayout
        settings={settings}
        activeTab={activeOwnerTab}
        onSelectTab={setActiveOwnerTab}
        onLogout={handleLogout}
        currentUser={currentUser}
      >
        {activeOwnerTab === 'dashboard' && (
          <OwnerDashboard
            settings={settings}
            students={students}
            seats={seats}
            payments={payments}
            attendance={attendance}
            plans={plans}
            onNavigateTab={setActiveOwnerTab}
            onOpenAddStudent={() => setActiveOwnerTab('students')}
            onOpenCollectFee={() => setActiveOwnerTab('payments')}
          />
        )}

        {activeOwnerTab === 'students' && (
          <StudentManagement
            students={students}
            plans={plans}
            seats={seats}
            settings={settings}
            onSaveStudent={handleSaveStudent}
            onDeleteStudent={handleDeleteStudent}
            validateSeatAvailability={validateSeatAvailability}
            onOpenCollectFee={(studentId) => {
              setCollectFeeStudentId(studentId);
              setActiveOwnerTab('payments');
            }}
            onNavigateTab={setActiveOwnerTab}
          />
        )}

        {activeOwnerTab === 'seats' && (
          <VisualSeatMap
            seats={seats}
            students={students}
            plans={plans}
            onUpdateSeatSlot={handleUpdateSeatSlot}
            onCreateSingleSeat={handleCreateSingleSeat}
            onUpdateSeat={handleUpdateSeatDetails}
            onCreateBulkSeats={handleCreateBulkSeats}
            onDeleteSeats={handleDeleteSeats}
            onSavePlan={handleSavePlan}
            onSaveStudent={handleSaveStudent}
            validateSeatAvailability={validateSeatAvailability}
          />
        )}

        {activeOwnerTab === 'plans' && (
          <MembershipPlans
            plans={plans}
            settings={settings}
            onSavePlan={handleSavePlan}
            onDeletePlan={handleDeletePlan}
          />
        )}

        {activeOwnerTab === 'attendance' && (
          <AttendanceTracker
            attendance={attendance}
            students={students}
            settings={settings}
            onMarkAttendance={handleMarkAttendance}
          />
        )}

        {activeOwnerTab === 'payments' && (
          <FeeManagement
            payments={payments}
            students={students}
            plans={plans}
            settings={settings}
            onRecordPayment={handleRecordPayment}
            defaultStudentIdForCollect={collectFeeStudentId}
          />
        )}

        {activeOwnerTab === 'expenses' && (
          <ExpenseTracker
            expenses={expenses}
            payments={payments}
            settings={settings}
            onAddExpense={handleAddExpense}
          />
        )}

        {activeOwnerTab === 'admins' && currentUser?.role === 'owner' && (
          <AdminManagement
            admins={admins}
            onAddAdmin={handleAddAdmin}
            onUpdateAdmin={handleUpdateAdmin}
            onDeleteAdmin={handleDeleteAdmin}
            onToggleAdminStatus={handleToggleAdminStatus}
          />
        )}

        {['notices', 'complaints', 'visitors', 'inventory', 'reports'].includes(activeOwnerTab) && (
          <OtherModules
            moduleName={activeOwnerTab as any}
            notices={notices}
            complaints={complaints}
            visitors={visitors}
            inventory={inventory}
            settings={settings}
            onAddNotice={handleAddNotice}
            onReplyComplaint={handleReplyComplaint}
            onLogVisitor={handleLogVisitor}
          />
        )}

        {activeOwnerTab === 'settings' && (
          <SettingsAndHostingerExport
            settings={settings}
            onSaveSettings={setSettings}
          />
        )}
      </DashboardLayout>
    );
  }

  // Default: Public View
  return (
    <>
      <LandingPage
        settings={settings}
        plans={plans}
        seats={seats}
        onOpenLogin={handleOpenLogin}
        onSignUpStudent={handleSaveStudent}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        activeRole={activeLoginRole}
        onLoginSuccess={handleLoginSuccess}
        students={students}
        plans={plans}
        admins={admins}
        ownerPassword={ownerPassword}
        onUpdateOwnerPassword={handleUpdateOwnerPassword}
        onSignUpStudent={handleSaveStudent}
      />
    </>
  );
}

export default App;
