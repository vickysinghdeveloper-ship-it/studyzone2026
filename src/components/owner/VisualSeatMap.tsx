import React, { useState } from 'react';
import {
  Armchair,
  CheckCircle,
  Zap,
  Lock,
  Search,
  Plus,
  Trash2,
  Edit,
  X,
  UserCheck,
  Building2,
  Filter,
  Clock,
  UserPlus,
  Users,
  Check
} from 'lucide-react';
import { Seat, Student, MembershipPlan, SeatStatus, SeatSlotBooking } from '../../types';
import { getSlotBookingDetails, areSlotsInConflict } from '../../utils/slotUtils';

interface VisualSeatMapProps {
  seats: Seat[];
  students: Student[];
  plans: MembershipPlan[];
  onUpdateSeatSlot: (
    seatId: string,
    slotId: string,
    action: 'assign' | 'release',
    studentId?: string,
    slotName?: string
  ) => void;
  onCreateSingleSeat: (seat: Partial<Seat>) => void;
  onUpdateSeat?: (seatId: string, seatData: Partial<Seat>) => void;
  onCreateBulkSeats: (bulkData: {
    zone: string;
    startNum: number;
    endNum: number;
    prefix: string;
    powerPlug: boolean;
    locker: boolean;
    status: SeatStatus;
  }) => void;
  onDeleteSeats: (seatIds: string[]) => void;
  onSavePlan?: (plan: Partial<MembershipPlan>) => void;
  onSaveStudent?: (studentData: Partial<Student>) => Student;
  validateSeatAvailability?: (seatId?: string, planId?: string, studentId?: string) => { valid: boolean; reason?: string };
}

export const VisualSeatMap: React.FC<VisualSeatMapProps> = ({
  seats,
  students,
  plans,
  onUpdateSeatSlot,
  onCreateSingleSeat,
  onUpdateSeat,
  onCreateBulkSeats,
  onDeleteSeats,
  onSavePlan,
  onSaveStudent,
  validateSeatAvailability
}) => {
  // Filters State
  const [selectedSlotFilter, setSelectedSlotFilter] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Bulk Selection & Delete Mode State
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<string[]>([]);

  // Slot Action Modal State
  const [activeSlotModal, setActiveSlotModal] = useState<{
    seat: Seat;
    slot: MembershipPlan;
    booking?: SeatSlotBooking;
  } | null>(null);
  const [assignStudentId, setAssignStudentId] = useState<string>('');
  const [bookingTab, setBookingTab] = useState<'search' | 'create'>('search');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [newStudentForm, setNewStudentForm] = useState({
    name: '',
    phone: '',
    email: '',
    gender: 'male' as 'male' | 'female' | 'other',
    guardianName: '',
    guardianPhone: '',
    initialPaid: 0
  });

  // Creation Modals State
  const [isSingleSeatModalOpen, setIsSingleSeatModalOpen] = useState(false);
  const [isBulkSeatsModalOpen, setIsBulkSeatsModalOpen] = useState(false);

  // Edit Seat State
  const [editingSeat, setEditingSeat] = useState<Seat | null>(null);
  const [editFormData, setEditFormData] = useState({
    seatNumber: '',
    roomZone: 'room_a',
    customRoomName: '',
    status: 'available' as SeatStatus,
    selectedSlotIds: [] as string[],
    isPowerPlugAvailable: true,
    isLockerAttached: false
  });
  const [editSlotBookings, setEditSlotBookings] = useState<Record<string, string>>({});

  // Single Seat Form State
  const [singleFormData, setSingleFormData] = useState({
    seatNumber: '',
    roomZone: 'room_a',
    customRoomName: '',
    status: 'available' as SeatStatus,
    selectedSlotIds: plans.map((p) => p.id),
    floor: 'Ground',
    notes: '',
    isPowerPlugAvailable: true,
    isLockerAttached: false
  });

  // Bulk Seats Form State
  const [bulkFormData, setBulkFormData] = useState({
    roomZone: 'room_a',
    customRoomName: '',
    startNum: 160,
    endNum: 175,
    prefix: 'ROOM-A-',
    status: 'available' as SeatStatus,
    selectedSlotIds: plans.map((p) => p.id),
    floor: 'Ground',
    isPowerPlugAvailable: true,
    isLockerAttached: false
  });

  // Room / Category List
  const roomCategories = [
    { id: 'room_a', label: 'Room A (ROOM-A)' },
    { id: 'room_b', label: 'Room B (ROOM-B)' },
    { id: 'room_c', label: 'Room C (ROOM-C)' },
    { id: 'hall_a', label: 'Hall A (HALL-A)' },
    { id: 'office_room', label: 'Office Room (OFF)' }
  ];

  // Dynamically extract additional zones from seats
  const existingZones = Array.from(new Set<string>(seats.map((s) => s.floorZone)));
  const knownZoneIds = new Set(roomCategories.map((r) => r.id));
  const extraZones = existingZones
    .filter((z) => !knownZoneIds.has(z))
    .map((z) => ({
      id: z,
      label: z.replace(/_/g, ' ').toUpperCase()
    }));

  const allCategories = [...roomCategories, ...extraZones];

  // Filtering Logic for Seats
  const filteredSeats = seats.filter((seat) => {
    const assignedStudentsForSeat = students.filter(
      (st) => st.seatId === seat.id || (st.seatNumber && st.seatNumber === seat.seatNumber)
    );

    // Search Term Filter (seat number or student name/phone)
    const matchesSearch =
      seat.seatNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seat.currentStudentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignedStudentsForSeat.some(
        (st) =>
          st.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          st.phone.includes(searchTerm) ||
          st.studentCode.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      (Object.values(seat.slotBookings || {}) as SeatSlotBooking[]).some(
        (b) =>
          b.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (b.studentPhone && b.studentPhone.includes(searchTerm))
      );

    // Zone / Category Filter
    const matchesCategory =
      selectedCategoryFilter === 'all' || seat.floorZone === selectedCategoryFilter;

    // Status Filter (Occupied vs Vacant for selected slot or overall)
    const isAnySlotOccupied =
      Object.keys(seat.slotBookings || {}).length > 0 ||
      seat.status === 'occupied' ||
      assignedStudentsForSeat.length > 0;

    let matchesStatus = true;
    if (selectedStatusFilter === 'occupied') {
      if (selectedSlotFilter !== 'all') {
        const hasSlotBooking =
          Boolean(seat.slotBookings?.[selectedSlotFilter]?.studentName) ||
          assignedStudentsForSeat.some(
            (st) => st.planId === selectedSlotFilter || st.shift === selectedSlotFilter
          );
        matchesStatus = hasSlotBooking;
      } else {
        matchesStatus = isAnySlotOccupied;
      }
    } else if (selectedStatusFilter === 'vacant') {
      if (selectedSlotFilter !== 'all') {
        const hasSlotBooking =
          Boolean(seat.slotBookings?.[selectedSlotFilter]?.studentName) ||
          assignedStudentsForSeat.some(
            (st) => st.planId === selectedSlotFilter || st.shift === selectedSlotFilter
          );
        matchesStatus = !hasSlotBooking;
      } else {
        matchesStatus = !isAnySlotOccupied;
      }
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Displayed Slots
  const activePlans = plans.filter((p) => p.isActive);
  const displaySlots =
    selectedSlotFilter === 'all'
      ? activePlans
      : activePlans.filter((p) => p.id === selectedSlotFilter);

  // Handlers
  const handleSlotClick = (seat: Seat, slot: MembershipPlan, booking?: SeatSlotBooking) => {
    setActiveSlotModal({ seat, slot, booking });
    setAssignStudentId('');
    setStudentSearchQuery('');
    setBookingTab('search');
    setNewStudentForm({
      name: '',
      phone: '',
      email: '',
      gender: 'male',
      guardianName: '',
      guardianPhone: '',
      initialPaid: slot.price || 800
    });
  };

  const searchFilteredStudents = students.filter((st) => {
    if (!studentSearchQuery.trim()) return true;
    const q = studentSearchQuery.toLowerCase();
    return (
      st.name.toLowerCase().includes(q) ||
      st.phone.includes(q) ||
      (st.studentCode && st.studentCode.toLowerCase().includes(q))
    );
  });

  const handleBookSlotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSlotModal || !assignStudentId) return;

    if (validateSeatAvailability) {
      const check = validateSeatAvailability(activeSlotModal.seat.id, activeSlotModal.slot.id, assignStudentId);
      if (!check.valid) {
        alert(check.reason);
        return;
      }
    }

    onUpdateSeatSlot(
      activeSlotModal.seat.id,
      activeSlotModal.slot.id,
      'assign',
      assignStudentId,
      activeSlotModal.slot.title
    );
    setActiveSlotModal(null);
  };

  const handleQuickCreateStudentAndBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSlotModal) return;
    if (!newStudentForm.name.trim() || !newStudentForm.phone.trim()) return;

    let createdStudent: Student | undefined;
    if (onSaveStudent) {
      createdStudent = onSaveStudent({
        name: newStudentForm.name.trim(),
        phone: newStudentForm.phone.trim(),
        email: newStudentForm.email.trim(),
        gender: newStudentForm.gender,
        guardianName: newStudentForm.guardianName.trim(),
        guardianPhone: newStudentForm.guardianPhone.trim(),
        totalPaid: Number(newStudentForm.initialPaid) || activeSlotModal.slot.price || 800,
        shift: activeSlotModal.slot.shift || 'morning',
        seatId: activeSlotModal.seat.id,
        seatNumber: activeSlotModal.seat.seatNumber
      });
    }

    const newStudentId = createdStudent?.id || `std_${Date.now()}`;

    onUpdateSeatSlot(
      activeSlotModal.seat.id,
      activeSlotModal.slot.id,
      'assign',
      newStudentId,
      activeSlotModal.slot.title
    );

    setActiveSlotModal(null);
  };

  const handleReleaseSlot = () => {
    if (!activeSlotModal) return;
    onUpdateSeatSlot(
      activeSlotModal.seat.id,
      activeSlotModal.slot.id,
      'release'
    );
    setActiveSlotModal(null);
  };

  const handleDeleteSingleSeat = (seat: Seat) => {
    if (confirm(`Are you sure you want to delete ${seat.seatNumber}?`)) {
      onDeleteSeats([seat.id]);
    }
  };

  const handleToggleSelectForDelete = (seatId: string) => {
    if (selectedForDelete.includes(seatId)) {
      setSelectedForDelete(selectedForDelete.filter((id) => id !== seatId));
    } else {
      setSelectedForDelete([...selectedForDelete, seatId]);
    }
  };

  const handleExecuteBulkDelete = () => {
    if (selectedForDelete.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedForDelete.length} selected seat(s)?`)) {
      onDeleteSeats(selectedForDelete);
      setSelectedForDelete([]);
      setIsDeleteMode(false);
    }
  };

  // Slot Toggle Handlers for Modals
  const toggleSingleSlot = (slotId: string) => {
    if (singleFormData.selectedSlotIds.includes(slotId)) {
      setSingleFormData({
        ...singleFormData,
        selectedSlotIds: singleFormData.selectedSlotIds.filter((id) => id !== slotId)
      });
    } else {
      setSingleFormData({
        ...singleFormData,
        selectedSlotIds: [...singleFormData.selectedSlotIds, slotId]
      });
    }
  };

  const toggleAllSingleSlots = () => {
    if (singleFormData.selectedSlotIds.length === activePlans.length) {
      setSingleFormData({ ...singleFormData, selectedSlotIds: [] });
    } else {
      setSingleFormData({ ...singleFormData, selectedSlotIds: activePlans.map((p) => p.id) });
    }
  };

  const toggleBulkSlot = (slotId: string) => {
    if (bulkFormData.selectedSlotIds.includes(slotId)) {
      setBulkFormData({
        ...bulkFormData,
        selectedSlotIds: bulkFormData.selectedSlotIds.filter((id) => id !== slotId)
      });
    } else {
      setBulkFormData({
        ...bulkFormData,
        selectedSlotIds: [...bulkFormData.selectedSlotIds, slotId]
      });
    }
  };

  const toggleAllBulkSlots = () => {
    if (bulkFormData.selectedSlotIds.length === activePlans.length) {
      setBulkFormData({ ...bulkFormData, selectedSlotIds: [] });
    } else {
      setBulkFormData({ ...bulkFormData, selectedSlotIds: activePlans.map((p) => p.id) });
    }
  };

  const handleCreateSingleSeatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetZone =
      singleFormData.roomZone === 'custom'
        ? singleFormData.customRoomName.toLowerCase().replace(/\s+/g, '_')
        : singleFormData.roomZone;

    onCreateSingleSeat({
      seatNumber: singleFormData.seatNumber,
      floorZone: targetZone as any,
      status: singleFormData.status,
      isPowerPlugAvailable: singleFormData.isPowerPlugAvailable,
      isLockerAttached: singleFormData.isLockerAttached,
      allowedSlotIds: singleFormData.selectedSlotIds
    });

    setIsSingleSeatModalOpen(false);
    setSingleFormData({
      seatNumber: '',
      roomZone: 'room_a',
      customRoomName: '',
      status: 'available',
      selectedSlotIds: plans.map((p) => p.id),
      floor: 'Ground',
      notes: '',
      isPowerPlugAvailable: true,
      isLockerAttached: false
    });
  };

  const handleCreateBulkSeatsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetZone =
      bulkFormData.roomZone === 'custom'
        ? bulkFormData.customRoomName.toLowerCase().replace(/\s+/g, '_')
        : bulkFormData.roomZone;

    onCreateBulkSeats({
      zone: targetZone,
      startNum: Number(bulkFormData.startNum),
      endNum: Number(bulkFormData.endNum),
      prefix: bulkFormData.prefix,
      powerPlug: bulkFormData.isPowerPlugAvailable,
      locker: bulkFormData.isLockerAttached,
      status: bulkFormData.status,
      slotIds: bulkFormData.selectedSlotIds
    });

    setIsBulkSeatsModalOpen(false);
  };

  const handleOpenEditSeat = (seat: Seat, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSeat(seat);
    setEditFormData({
      seatNumber: seat.seatNumber,
      roomZone: seat.floorZone || 'room_a',
      customRoomName: '',
      status: seat.status || 'available',
      selectedSlotIds: seat.allowedSlotIds || activePlans.map((p) => p.id),
      isPowerPlugAvailable: seat.isPowerPlugAvailable ?? true,
      isLockerAttached: seat.isLockerAttached ?? false
    });

    const initialBookings: Record<string, string> = {};
    activePlans.forEach((plan) => {
      const b = getSlotBookingDetails(seat, plan, students, plans);
      initialBookings[plan.id] = b?.studentId || '';
    });
    setEditSlotBookings(initialBookings);
  };

  const handleSlotStudentChangeInEdit = (slotId: string, newStudentId: string) => {
    if (!editingSeat) return;

    if (!newStudentId) {
      setEditSlotBookings((prev) => ({ ...prev, [slotId]: '' }));
      return;
    }

    if (validateSeatAvailability) {
      const check = validateSeatAvailability(editingSeat.id, slotId, newStudentId);
      if (!check.valid) {
        alert(check.reason);
        return;
      }
    }

    for (const [sId, stId] of Object.entries(editSlotBookings)) {
      if (stId && stId !== newStudentId && areSlotsInConflict(slotId, sId, plans)) {
        const conflictingPlan = plans.find((p) => p.id === sId);
        const conflictingStudent = students.find((st) => st.id === stId);
        alert(
          `Cannot assign student to "${
            plans.find((p) => p.id === slotId)?.title || 'this slot'
          }". Conflict with "${conflictingPlan?.title || 'another slot'}" booked by ${
            conflictingStudent?.name || 'another student'
          }.`
        );
        return;
      }
    }

    setEditSlotBookings((prev) => ({ ...prev, [slotId]: newStudentId }));
  };

  const toggleEditSlot = (slotId: string) => {
    if (editFormData.selectedSlotIds.includes(slotId)) {
      setEditFormData({
        ...editFormData,
        selectedSlotIds: editFormData.selectedSlotIds.filter((id) => id !== slotId)
      });
    } else {
      setEditFormData({
        ...editFormData,
        selectedSlotIds: [...editFormData.selectedSlotIds, slotId]
      });
    }
  };

  const toggleAllEditSlots = () => {
    if (editFormData.selectedSlotIds.length === activePlans.length) {
      setEditFormData({ ...editFormData, selectedSlotIds: [] });
    } else {
      setEditFormData({ ...editFormData, selectedSlotIds: activePlans.map((p) => p.id) });
    }
  };

  const handleEditSeatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSeat) return;

    const targetZone =
      editFormData.roomZone === 'custom'
        ? editFormData.customRoomName.toLowerCase().replace(/\s+/g, '_')
        : editFormData.roomZone;

    if (onUpdateSeat) {
      onUpdateSeat(editingSeat.id, {
        seatNumber: editFormData.seatNumber,
        floorZone: targetZone as any,
        status: editFormData.status,
        isPowerPlugAvailable: editFormData.isPowerPlugAvailable,
        isLockerAttached: editFormData.isLockerAttached,
        allowedSlotIds: editFormData.selectedSlotIds
      });
    }

    // Process slot booking updates
    activePlans.forEach((plan) => {
      const origBooking = getSlotBookingDetails(editingSeat, plan, students, plans);
      const origStudentId = origBooking?.studentId || '';
      const newStudentId = editSlotBookings[plan.id] || '';

      if (origStudentId !== newStudentId) {
        if (newStudentId) {
          onUpdateSeatSlot(
            editingSeat.id,
            plan.id,
            'assign',
            newStudentId,
            plan.title
          );
        } else if (origStudentId) {
          onUpdateSeatSlot(
            editingSeat.id,
            plan.id,
            'release'
          );
        }
      }
    });

    setEditingSeat(null);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Filter Controls Bar (Matching Image 3) */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        
        {/* Left Filters Group */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
          
          {/* Dropdown 1: Slots Filter */}
          <div className="relative">
            <select
              value={selectedSlotFilter}
              onChange={(e) => setSelectedSlotFilter(e.target.value)}
              className="w-full pl-3.5 pr-8 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">All Slots</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.shiftTiming})
                </option>
              ))}
            </select>
          </div>

          {/* Dropdown 2: Categories / Rooms Filter */}
          <div className="relative">
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="w-full pl-3.5 pr-8 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">All Rooms</option>
              {allCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Dropdown 3: Status Filter */}
          <div className="relative">
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="w-full pl-3.5 pr-8 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">Occupied / Vacant (All)</option>
              <option value="occupied">Occupied Only</option>
              <option value="vacant">Vacant Only</option>
            </select>
          </div>

        </div>

        {/* Right Search & Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search seat, student..."
              className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Delete Mode Toggle Button */}
          <button
            onClick={() => {
              setIsDeleteMode(!isDeleteMode);
              setSelectedForDelete([]);
            }}
            className={`p-2.5 rounded-2xl text-xs font-bold transition-all border ${
              isDeleteMode
                ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-500/20'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:text-rose-600'
            }`}
            title="Toggle Delete Mode"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Bulk Create Button */}
          <button
            onClick={() => setIsBulkSeatsModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 hover:bg-blue-100 font-bold text-xs transition-all flex items-center"
          >
            <Plus className="w-4 h-4 mr-1" />
            + Bulk Create
          </button>

          {/* Add Seat Button */}
          <button
            onClick={() => setIsSingleSeatModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center"
          >
            <Plus className="w-4 h-4 mr-1" />
            + Add Seat
          </button>

        </div>

      </div>

      {/* Delete Bar Banner if Delete Mode is Active */}
      {isDeleteMode && (
        <div className="bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 p-4 rounded-2xl flex items-center justify-between text-xs font-bold text-rose-800 dark:text-rose-200">
          <span>Select seats to delete ({selectedForDelete.length} selected)</span>
          <button
            onClick={handleExecuteBulkDelete}
            disabled={selectedForDelete.length === 0}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md disabled:opacity-50 cursor-pointer"
          >
            Delete Selected Seats
          </button>
        </div>
      )}

      {/* Seats Cards Grid (Matching Image 3) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredSeats.map((seat) => (
          <div
            key={seat.id}
            className={`bg-white dark:bg-slate-800 rounded-2xl border ${
              selectedForDelete.includes(seat.id)
                ? 'border-rose-500 ring-2 ring-rose-500'
                : 'border-slate-200/80 dark:border-slate-700'
            } shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all`}
          >
            {/* Card Header: Seat Number Badge */}
            <div className="bg-slate-50 dark:bg-slate-900/60 px-4 py-3 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 font-bold">
                  <Armchair className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-sm text-slate-900 dark:text-white tracking-wide">
                  {seat.seatNumber}
                </span>
              </div>

              {isDeleteMode && (
                <input
                  type="checkbox"
                  checked={selectedForDelete.includes(seat.id)}
                  onChange={() => handleToggleSelectForDelete(seat.id)}
                  className="w-4 h-4 text-rose-600 rounded cursor-pointer"
                />
              )}
            </div>

            {/* Card Body: List of Time Slots */}
            <div className="p-3.5 space-y-2 flex-1 divide-y divide-slate-100 dark:divide-slate-700/50 text-xs">
              {displaySlots.map((slot) => {
                const booking = getSlotBookingDetails(seat, slot, students, plans);
                const isOccupied = Boolean(booking?.studentName);

                return (
                  <div
                    key={slot.id}
                    className="pt-2 first:pt-0"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-slate-800 dark:text-slate-200 text-[11px] uppercase tracking-wider">
                        {slot.title}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {slot.shiftTiming}
                      </span>
                    </div>

                    {isOccupied ? (
                      <div className="flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div className="min-w-0 pr-2">
                          <div className="font-extrabold text-slate-900 dark:text-white text-xs truncate">
                            {booking?.studentName}
                          </div>
                          <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                            📞 {booking?.studentPhone || 'No Phone'}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSlotClick(seat, slot, booking)}
                          className="px-2 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-extrabold cursor-pointer transition-colors shrink-0"
                        >
                          Details
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-950/20 p-2 rounded-xl border border-emerald-100/80 dark:border-emerald-900/30">
                        <div className="flex items-center font-extrabold text-emerald-600 dark:text-emerald-400 text-xs">
                          <CheckCircle className="w-3.5 h-3.5 mr-1 shrink-0" />
                          Vacant
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSlotClick(seat, slot, booking)}
                          className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-extrabold shadow-sm transition-all cursor-pointer active:scale-95"
                          title={`Quick Book ${slot.title} on ${seat.seatNumber}`}
                        >
                          <Zap className="w-3 h-3 mr-1 fill-current" />
                          Quick Book
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Card Footer Bar */}
            <div className="bg-slate-50/80 dark:bg-slate-900/40 px-3.5 py-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-slate-400">
              <div className="flex items-center space-x-2 text-[11px]">
                {seat.isPowerPlugAvailable && (
                  <Zap className="w-3.5 h-3.5 text-amber-500" title="Power Plug" />
                )}
                {seat.isLockerAttached && (
                  <Lock className="w-3.5 h-3.5 text-blue-500" title="Locker Attached" />
                )}
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={(e) => handleOpenEditSeat(seat, e)}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 text-[11px] font-extrabold flex items-center space-x-1 cursor-pointer transition-colors shadow-xs active:scale-95"
                  title="Edit seat configuration and slot bookings directly"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Seat Booking</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteSingleSeat(seat)}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  title="Delete Seat"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Slot Booking / Vacate Modal */}
      {activeSlotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Seat: {activeSlotModal.seat.seatNumber}
                </h3>
                <span className="text-xs font-bold text-blue-600">
                  Slot: {activeSlotModal.slot.title} ({activeSlotModal.slot.shiftTiming})
                </span>
              </div>
              <button
                onClick={() => setActiveSlotModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {activeSlotModal.booking?.studentName ? (
              /* Occupied State */
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold">Occupant Name:</span>
                    <strong className="text-slate-900 dark:text-white font-extrabold text-sm">
                      {activeSlotModal.booking.studentName}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold">Contact Phone:</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-semibold">
                      {activeSlotModal.booking.studentPhone || 'N/A'}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold">Validity Expiry:</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-semibold">
                      {activeSlotModal.booking.expiryDate || 'N/A'}
                    </strong>
                  </div>
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    onClick={() => setActiveSlotModal(null)}
                    className="px-4 py-2 rounded-xl text-slate-600 font-bold"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleReleaseSlot}
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md cursor-pointer"
                  >
                    Release / Vacate Slot
                  </button>
                </div>
              </div>
            ) : (
              /* Vacant State - Quick Booking Multi-Option Form */
              <div className="space-y-4 text-xs">
                {/* Option Tabs */}
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setBookingTab('search')}
                    className={`py-2 px-3 rounded-xl font-extrabold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                      bookingTab === 'search'
                        ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Search Student</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBookingTab('create')}
                    className={`py-2 px-3 rounded-xl font-extrabold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                      bookingTab === 'create'
                        ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ New Student</span>
                  </button>
                </div>

                {bookingTab === 'search' ? (
                  /* OPTION 1: SEARCH & SELECT EXISTING STUDENT FROM DIRECTORY */
                  <form onSubmit={handleBookSlotSubmit} className="space-y-3">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                        Search Student from Directory
                      </label>
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={studentSearchQuery}
                          onChange={(e) => setStudentSearchQuery(e.target.value)}
                          placeholder="Type name, phone, or code (e.g. Rahul, 987654...)"
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1.5">
                        Select Student ({searchFilteredStudents.length} available)
                      </span>
                      <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                        {searchFilteredStudents.length === 0 ? (
                          <div className="p-4 text-center text-slate-400 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                            <p>No student found matching "{studentSearchQuery}".</p>
                            <button
                              type="button"
                              onClick={() => setBookingTab('create')}
                              className="mt-2 inline-flex items-center text-indigo-600 dark:text-indigo-400 font-extrabold hover:underline cursor-pointer"
                            >
                              <UserPlus className="w-3.5 h-3.5 mr-1" />
                              Create new student instead
                            </button>
                          </div>
                        ) : (
                          searchFilteredStudents.map((st) => {
                            const isSelected = assignStudentId === st.id;
                            return (
                              <div
                                key={st.id}
                                onClick={() => setAssignStudentId(st.id)}
                                className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                                  isSelected
                                    ? 'bg-indigo-50/90 dark:bg-indigo-950/70 border-indigo-500 text-indigo-950 dark:text-indigo-100 ring-2 ring-indigo-500/30'
                                    : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-900'
                                }`}
                              >
                                <div className="flex items-center space-x-2.5 min-w-0">
                                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-extrabold flex items-center justify-center text-xs shrink-0">
                                    {st.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="truncate">
                                    <div className="font-extrabold text-slate-900 dark:text-white truncate">
                                      {st.name}
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-medium">
                                      {st.studentCode} • 📞 {st.phone}
                                    </div>
                                  </div>
                                </div>

                                <div className="shrink-0 pl-2">
                                  {isSelected ? (
                                    <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                                      <Check className="w-3.5 h-3.5" />
                                    </div>
                                  ) : (
                                    <span className="text-[10px] font-bold text-slate-400">Select</span>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end space-x-2 border-t border-slate-100 dark:border-slate-700/60">
                      <button
                        type="button"
                        onClick={() => setActiveSlotModal(null)}
                        className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!assignStudentId}
                        className={`px-5 py-2.5 rounded-xl font-bold text-white shadow-md transition-all ${
                          assignStudentId
                            ? 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer'
                            : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed opacity-60'
                        }`}
                      >
                        Confirm Quick Booking
                      </button>
                    </div>
                  </form>
                ) : (
                  /* OPTION 2: CREATE NEW STUDENT ON THE FLY & BOOK */
                  <form onSubmit={handleQuickCreateStudentAndBook} className="space-y-3">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                        Student Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={newStudentForm.name}
                        onChange={(e) =>
                          setNewStudentForm({ ...newStudentForm, name: e.target.value })
                        }
                        placeholder="e.g. Rahul Sharma"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                          Mobile Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={newStudentForm.phone}
                          onChange={(e) =>
                            setNewStudentForm({ ...newStudentForm, phone: e.target.value })
                          }
                          placeholder="e.g. 9876543210"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                          Gender *
                        </label>
                        <select
                          value={newStudentForm.gender}
                          onChange={(e) =>
                            setNewStudentForm({
                              ...newStudentForm,
                              gender: e.target.value as any
                            })
                          }
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                          Father / Guardian
                        </label>
                        <input
                          type="text"
                          value={newStudentForm.guardianName}
                          onChange={(e) =>
                            setNewStudentForm({
                              ...newStudentForm,
                              guardianName: e.target.value
                            })
                          }
                          placeholder="Guardian Name"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                          Initial Fee Paid (₹) *
                        </label>
                        <input
                          type="number"
                          required
                          value={newStudentForm.initialPaid}
                          onChange={(e) =>
                            setNewStudentForm({
                              ...newStudentForm,
                              initialPaid: Number(e.target.value)
                            })
                          }
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        value={newStudentForm.email}
                        onChange={(e) =>
                          setNewStudentForm({ ...newStudentForm, email: e.target.value })
                        }
                        placeholder="student@example.com"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-medium"
                      />
                    </div>

                    <div className="pt-2 flex justify-end space-x-2 border-t border-slate-100 dark:border-slate-700/60">
                      <button
                        type="button"
                        onClick={() => setActiveSlotModal(null)}
                        className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md cursor-pointer flex items-center"
                      >
                        <UserPlus className="w-4 h-4 mr-1.5" />
                        Create & Book Slot
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* Create Single Seat Modal */}
      {isSingleSeatModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 my-8">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Add New Seat
              </h3>
              <button
                onClick={() => setIsSingleSeatModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSingleSeatSubmit} className="space-y-4 text-xs">
              {/* Row 1: Seat Code, Category, Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Seat Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={singleFormData.seatNumber}
                    onChange={(e) =>
                      setSingleFormData({ ...singleFormData, seatNumber: e.target.value })
                    }
                    placeholder="e.g. A-01, M-12"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Category *
                  </label>
                  <select
                    value={singleFormData.roomZone}
                    onChange={(e) =>
                      setSingleFormData({ ...singleFormData, roomZone: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    {allCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                    <option value="custom">+ Custom Category</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Status *
                  </label>
                  <select
                    value={singleFormData.status}
                    onChange={(e) =>
                      setSingleFormData({
                        ...singleFormData,
                        status: e.target.value as SeatStatus
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-semibold text-emerald-600 dark:text-emerald-400 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="available">Available / Vacant</option>
                    <option value="occupied">Occupied</option>
                    <option value="reserved">Reserved</option>
                    <option value="maintenance">Maintenance / Blocked</option>
                  </select>
                </div>
              </div>

              {singleFormData.roomZone === 'custom' && (
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Custom Room Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={singleFormData.customRoomName}
                    onChange={(e) =>
                      setSingleFormData({ ...singleFormData, customRoomName: e.target.value })
                    }
                    placeholder="e.g. Hall A, Silent Suite"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-medium"
                  />
                </div>
              )}

              {/* Row 2: Floor */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Floor
                </label>
                <input
                  type="text"
                  value={singleFormData.floor}
                  onChange={(e) =>
                    setSingleFormData({ ...singleFormData, floor: e.target.value })
                  }
                  placeholder="e.g. Ground, 1st, 2nd"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-medium"
                />
              </div>

              {/* Select Slots Option Section */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-800 dark:text-slate-200 font-extrabold">
                    Select Active Slots ({singleFormData.selectedSlotIds.length}/{activePlans.length})
                  </label>
                  <button
                    type="button"
                    onClick={toggleAllSingleSlots}
                    className="text-[11px] font-bold text-blue-600 hover:underline"
                  >
                    {singleFormData.selectedSlotIds.length === activePlans.length
                      ? 'Deselect All'
                      : 'Select All'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                  {activePlans.map((plan) => {
                    const isChecked = singleFormData.selectedSlotIds.includes(plan.id);
                    return (
                      <label
                        key={plan.id}
                        onClick={() => toggleSingleSlot(plan.id)}
                        className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-400 text-blue-900 dark:text-blue-100 font-bold'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}} // handled by parent div
                            className="w-3.5 h-3.5 text-blue-600 rounded"
                          />
                          <span className="truncate">{plan.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-normal shrink-0 ml-1">
                          {plan.shiftTiming}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Amenities Checkboxes */}
              <div className="flex items-center space-x-4 pt-1">
                <label className="flex items-center space-x-2 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={singleFormData.isPowerPlugAvailable}
                    onChange={(e) =>
                      setSingleFormData({
                        ...singleFormData,
                        isPowerPlugAvailable: e.target.checked
                      })
                    }
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>Power Socket Available</span>
                </label>

                <label className="flex items-center space-x-2 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={singleFormData.isLockerAttached}
                    onChange={(e) =>
                      setSingleFormData({
                        ...singleFormData,
                        isLockerAttached: e.target.checked
                      })
                    }
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>Locker Attached</span>
                </label>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={singleFormData.notes}
                  onChange={(e) =>
                    setSingleFormData({ ...singleFormData, notes: e.target.value })
                  }
                  placeholder="e.g. Near AC unit, Quiet corner"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsSingleSeatModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md cursor-pointer"
                >
                  + Add Seat
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Bulk Seats Generator Modal */}
      {isBulkSeatsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 my-8">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Bulk Create Seats
              </h3>
              <button
                onClick={() => setIsBulkSeatsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBulkSeatsSubmit} className="space-y-4 text-xs">
              {/* Category & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Target Category / Room *
                  </label>
                  <select
                    value={bulkFormData.roomZone}
                    onChange={(e) =>
                      setBulkFormData({ ...bulkFormData, roomZone: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-medium"
                  >
                    {allCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                    <option value="custom">+ Custom Category</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Initial Status *
                  </label>
                  <select
                    value={bulkFormData.status}
                    onChange={(e) =>
                      setBulkFormData({
                        ...bulkFormData,
                        status: e.target.value as SeatStatus
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-semibold text-emerald-600 dark:text-emerald-400"
                  >
                    <option value="available">Available / Vacant</option>
                    <option value="occupied">Occupied</option>
                    <option value="reserved">Reserved</option>
                    <option value="maintenance">Maintenance / Blocked</option>
                  </select>
                </div>
              </div>

              {bulkFormData.roomZone === 'custom' && (
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Custom Room Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={bulkFormData.customRoomName}
                    onChange={(e) =>
                      setBulkFormData({ ...bulkFormData, customRoomName: e.target.value })
                    }
                    placeholder="e.g. Ground Floor AC Room"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-medium"
                  />
                </div>
              )}

              {/* Prefix, Start, End */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Prefix
                  </label>
                  <input
                    type="text"
                    value={bulkFormData.prefix}
                    onChange={(e) =>
                      setBulkFormData({ ...bulkFormData, prefix: e.target.value })
                    }
                    placeholder="e.g. ROOM-A-"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Start Number *
                  </label>
                  <input
                    type="number"
                    required
                    value={bulkFormData.startNum}
                    onChange={(e) =>
                      setBulkFormData({ ...bulkFormData, startNum: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    End Number *
                  </label>
                  <input
                    type="number"
                    required
                    value={bulkFormData.endNum}
                    onChange={(e) =>
                      setBulkFormData({ ...bulkFormData, endNum: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              {/* Select Slots Option Section */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-800 dark:text-slate-200 font-extrabold">
                    Select Active Slots ({bulkFormData.selectedSlotIds.length}/{activePlans.length})
                  </label>
                  <button
                    type="button"
                    onClick={toggleAllBulkSlots}
                    className="text-[11px] font-bold text-blue-600 hover:underline"
                  >
                    {bulkFormData.selectedSlotIds.length === activePlans.length
                      ? 'Deselect All'
                      : 'Select All'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                  {activePlans.map((plan) => {
                    const isChecked = bulkFormData.selectedSlotIds.includes(plan.id);
                    return (
                      <label
                        key={plan.id}
                        onClick={() => toggleBulkSlot(plan.id)}
                        className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-400 text-blue-900 dark:text-blue-100 font-bold'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}} // handled by parent div
                            className="w-3.5 h-3.5 text-blue-600 rounded"
                          />
                          <span className="truncate">{plan.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-normal shrink-0 ml-1">
                          {plan.shiftTiming}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Amenities */}
              <div className="flex items-center space-x-4 pt-1">
                <label className="flex items-center space-x-2 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bulkFormData.isPowerPlugAvailable}
                    onChange={(e) =>
                      setBulkFormData({
                        ...bulkFormData,
                        isPowerPlugAvailable: e.target.checked
                      })
                    }
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>Power Socket Available</span>
                </label>

                <label className="flex items-center space-x-2 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bulkFormData.isLockerAttached}
                    onChange={(e) =>
                      setBulkFormData({
                        ...bulkFormData,
                        isLockerAttached: e.target.checked
                      })
                    }
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>Locker Attached</span>
                </label>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsBulkSeatsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md cursor-pointer"
                >
                  + Generate Bulk Seats
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Edit Seat & Shift Bookings Modal */}
      {editingSeat && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-5 my-8">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600">
                  <Edit className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    Edit Seat & Shift Bookings: {editingSeat.seatNumber}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Manage seat properties, room location & direct student bookings for each shift slot.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingSeat(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSeatSubmit} className="space-y-5 text-xs">
              
              {/* Section 1: Seat Config */}
              <div className="bg-slate-50/80 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider flex items-center">
                  <Armchair className="w-4 h-4 mr-1.5 text-blue-500" />
                  Seat Configuration
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                      Seat Number / Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={editFormData.seatNumber}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, seatNumber: e.target.value })
                      }
                      placeholder="e.g. ROOM-A-101"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-medium focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                      Room / Zone *
                    </label>
                    <select
                      value={editFormData.roomZone}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, roomZone: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-medium focus:ring-2 focus:ring-blue-500"
                    >
                      {allCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.label}
                        </option>
                      ))}
                      <option value="custom">+ Custom Room</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                      Overall Status *
                    </label>
                    <select
                      value={editFormData.status}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          status: e.target.value as SeatStatus
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-medium focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="available">Available / Vacant</option>
                      <option value="reserved">Reserved</option>
                      <option value="occupied">Occupied</option>
                      <option value="maintenance">Maintenance / Out of Order</option>
                    </select>
                  </div>
                </div>

                {editFormData.roomZone === 'custom' && (
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                      Custom Room Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={editFormData.customRoomName}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, customRoomName: e.target.value })
                      }
                      placeholder="e.g. VIP Silent Hall"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-medium"
                    />
                  </div>
                )}

                {/* Amenities */}
                <div className="flex items-center space-x-6 pt-1">
                  <label className="flex items-center space-x-2 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editFormData.isPowerPlugAvailable}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          isPowerPlugAvailable: e.target.checked
                        })
                      }
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span>Power Socket Available</span>
                  </label>

                  <label className="flex items-center space-x-2 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editFormData.isLockerAttached}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          isLockerAttached: e.target.checked
                        })
                      }
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span>Locker Attached</span>
                  </label>
                </div>
              </div>

              {/* Section 2: Shift Slot Bookings Direct Management */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center">
                    <Zap className="w-4 h-4 mr-1.5 text-amber-500" />
                    Direct Shift Slot Bookings Management
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Select or change assigned student for any shift slot below
                  </span>
                </div>

                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {activePlans.map((plan) => {
                    const currentStudentId = editSlotBookings[plan.id] || '';
                    const assignedStudent = students.find((st) => st.id === currentStudentId);
                    const isOccupied = Boolean(assignedStudent);

                    return (
                      <div
                        key={plan.id}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          isOccupied
                            ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-200/80 dark:border-blue-800/60'
                            : 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/40'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-extrabold text-slate-900 dark:text-white text-xs">
                              {plan.title}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 bg-white/80 dark:bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-200/60 dark:border-slate-700">
                              {plan.shiftTiming}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            {isOccupied ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 dark:bg-blue-900/80 text-blue-700 dark:text-blue-300">
                                Booked
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300">
                                Vacant
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Slot Booking Action Bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-200/40 dark:border-slate-700/40">
                          {isOccupied ? (
                            <div className="flex-1 flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <div className="font-extrabold text-slate-900 dark:text-white truncate text-xs">
                                  👤 {assignedStudent?.name}
                                </div>
                                <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                                  📞 {assignedStudent?.phone || 'No phone'} | ID: {assignedStudent?.studentCode || 'N/A'}
                                </div>
                              </div>

                              <div className="flex items-center space-x-2 shrink-0">
                                <select
                                  value={currentStudentId}
                                  onChange={(e) => handleSlotStudentChangeInEdit(plan.id, e.target.value)}
                                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value={assignedStudent?.id}>
                                    Assigned: {assignedStudent?.name}
                                  </option>
                                  <option value="">-- Vacate Slot --</option>
                                  {students
                                    .filter((st) => st.id !== assignedStudent?.id)
                                    .map((st) => (
                                      <option key={st.id} value={st.id}>
                                        Reassign: {st.name} ({st.phone})
                                      </option>
                                    ))}
                                </select>

                                <button
                                  type="button"
                                  onClick={() => handleSlotStudentChangeInEdit(plan.id, '')}
                                  className="px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-600 dark:text-rose-400 font-bold text-xs cursor-pointer transition-colors"
                                  title="Vacate this slot"
                                >
                                  Vacate
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex-1 flex items-center justify-between gap-2">
                              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 italic">
                                Slot is currently vacant
                              </span>

                              <div className="shrink-0 flex items-center space-x-2">
                                <select
                                  value=""
                                  onChange={(e) => handleSlotStudentChangeInEdit(plan.id, e.target.value)}
                                  className="px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                                >
                                  <option value="">+ Assign Student to {plan.title}...</option>
                                  {students.map((st) => (
                                    <option key={st.id} value={st.id}>
                                      {st.name} ({st.phone}) - {st.studentCode || 'SZ'}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingSeat(null)}
                  className="px-5 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md cursor-pointer transition-all active:scale-95"
                >
                  Save Seat & Booking Changes
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
