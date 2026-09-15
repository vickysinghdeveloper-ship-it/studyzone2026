import { Seat, MembershipPlan, Student, SeatSlotBooking } from '../types';

export const isFullDayPlan = (plan?: MembershipPlan, slotId?: string, slotName?: string): boolean => {
  if (plan) {
    return plan.id === 'slot_fullday' || plan.shift === 'fullday' || plan.title.toLowerCase().includes('full day');
  }
  if (slotName) return slotName.toLowerCase().includes('full day');
  return slotId === 'slot_fullday';
};

export const isNightPlan = (plan?: MembershipPlan, slotId?: string, slotName?: string): boolean => {
  if (plan) {
    return plan.id === 'slot_night' || plan.shift === 'night' || plan.title.toLowerCase().includes('night');
  }
  if (slotName) return slotName.toLowerCase().includes('night');
  return slotId === 'slot_night';
};

export const areSlotsInConflict = (slotAId: string, slotBId: string, plans?: MembershipPlan[]): boolean => {
  if (slotAId === slotBId) return true;

  const planA = plans?.find((p) => p.id === slotAId);
  const planB = plans?.find((p) => p.id === slotBId);

  const isANight = isNightPlan(planA, slotAId, planA?.title);
  const isBNight = isNightPlan(planB, slotBId, planB?.title);

  // Night slot (22:00 - 06:00) does NOT conflict with ANY Day slot (Full Day, Morning, Noon, Afternoon, Evening)
  if (isANight !== isBNight) return false;
  // If both are night slots, they conflict with each other
  if (isANight && isBNight) return true;

  const isAFullDay = isFullDayPlan(planA, slotAId, planA?.title);
  const isBFullDay = isFullDayPlan(planB, slotBId, planB?.title);

  // Full Day conflicts with ALL Day slots
  if (isAFullDay || isBFullDay) return true;

  // Noon + Evening conflicts with Afternoon and Evening
  const isANoonEvg = slotAId === 'slot_noon_evening' || planA?.title.toLowerCase().includes('noon');
  const isBNoonEvg = slotBId === 'slot_noon_evening' || planB?.title.toLowerCase().includes('noon');

  const isAAfternoonOrEvg = slotAId === 'slot_afternoon' || slotAId === 'slot_evening';
  const isBAfternoonOrEvg = slotBId === 'slot_afternoon' || slotBId === 'slot_evening';

  if (isANoonEvg && isBAfternoonOrEvg) return true;
  if (isBNoonEvg && isAAfternoonOrEvg) return true;

  // Morning (06:00-11:00) does NOT conflict with Afternoon (11:00-16:00), Evening (16:00-22:00), or Night (22:00-06:00)
  // Afternoon (11:00-16:00) does NOT conflict with Morning or Evening (16:00-22:00)
  return false;
};

export const getSlotBookingDetails = (
  seat: Seat,
  slot: MembershipPlan,
  students: Student[],
  plans: MembershipPlan[]
): SeatSlotBooking | undefined => {
  // 1. Direct booking in seat.slotBookings
  if (seat.slotBookings?.[slot.id]) {
    const direct = seat.slotBookings[slot.id];
    if (direct && direct.studentName) return direct;
  }

  // 2. Conflicting booking in seat.slotBookings
  if (seat.slotBookings) {
    const conflicting = Object.values(seat.slotBookings).find((b) => {
      if (!b || !b.studentName) return false;
      return areSlotsInConflict(slot.id, b.slotId, plans);
    });
    if (conflicting) return conflicting;
  }

  // 3. Fallback from students list assigned to this seat
  const matchedStudent = students.find((st) => {
    const seatMatch = st.seatId === seat.id || (st.seatNumber && st.seatNumber === seat.seatNumber);
    if (!seatMatch) return false;
    const stSlotId = st.planId || 'slot_fullday';
    return areSlotsInConflict(slot.id, stSlotId, plans);
  });

  if (matchedStudent) {
    const stPlan = plans.find((p) => p.id === matchedStudent.planId);
    return {
      slotId: slot.id,
      slotName: matchedStudent.planName || stPlan?.title || 'Assigned Slot',
      studentId: matchedStudent.id,
      studentName: matchedStudent.name,
      studentPhone: matchedStudent.phone,
      expiryDate: matchedStudent.expiryDate
    };
  }

  return undefined;
};
