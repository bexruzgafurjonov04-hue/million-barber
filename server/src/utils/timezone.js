import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);

export const TIMEZONE = 'Asia/Tashkent';

/**
 * Returns current dayjs instance in Tashkent timezone
 */
export function getTashkentNow() {
  return dayjs().tz(TIMEZONE);
}

/**
 * Parses a date string (YYYY-MM-DD) and time string (HH:mm) in Tashkent timezone
 * into a standard JS Date object (which will have the correct UTC epoch).
 */
export function parseTashkentDateTime(dateStr, timeStr) {
  // ISO format in Tashkent: YYYY-MM-DDTHH:mm:00+05:00
  // Tashkent is UTC+5 without DST
  const isoStr = `${dateStr}T${timeStr}:00+05:00`;
  return new Date(isoStr);
}

/**
 * Checks whether two time intervals [start1, end1) and [start2, end2) overlap
 */
export function areIntervalsOverlapping(start1, end1, start2, end2) {
  return start1 < end2 && end1 > start2;
}

/**
 * Converts "HH:mm" to minutes since midnight
 */
export function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Converts minutes since midnight back to "HH:mm"
 */
export function minutesToTime(totalMinutes) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Generates available appointment slots for a specific date and barber
 * taking into account:
 * 1. Working schedule for the day of week (start, end, break)
 * 2. Blocked dates / holidays
 * 3. Existing non-cancelled appointments
 * 4. Past time cutoff if the date is today
 */
export function generateAvailableSlots({
  targetDate, // "YYYY-MM-DD"
  schedule,   // WorkingSchedule object
  blockedTimes = [],
  existingAppointments = [],
  slotDurationMinutes = 45,
}) {
  if (!schedule || !schedule.isWorking) {
    return [];
  }

  // Check full-day blocks
  const fullDayBlock = blockedTimes.find((b) => b.isFullDay);
  if (fullDayBlock) {
    return [];
  }

  const workStartMin = timeToMinutes(schedule.startTime);
  const workEndMin = timeToMinutes(schedule.endTime);

  let breakStartMin = null;
  let breakEndMin = null;
  if (schedule.breakStartTime && schedule.breakEndTime) {
    breakStartMin = timeToMinutes(schedule.breakStartTime);
    breakEndMin = timeToMinutes(schedule.breakEndTime);
  }

  const nowTashkent = getTashkentNow();
  const isToday = nowTashkent.format('YYYY-MM-DD') === targetDate;
  const currentMinutesToday = nowTashkent.hour() * 60 + nowTashkent.minute();

  const slots = [];

  for (let current = workStartMin; current + slotDurationMinutes <= workEndMin; current += slotDurationMinutes) {
    const slotStartMin = current;
    const slotEndMin = current + slotDurationMinutes;
    const slotStartTime = minutesToTime(slotStartMin);
    const slotEndTime = minutesToTime(slotEndMin);

    // 1. If today, check if slot is already in the past (+ 15 min buffer)
    if (isToday && slotStartMin <= currentMinutesToday + 15) {
      continue;
    }

    // 2. Check if overlaps with lunch / break
    if (breakStartMin !== null && breakEndMin !== null) {
      if (areIntervalsOverlapping(slotStartMin, slotEndMin, breakStartMin, breakEndMin)) {
        continue;
      }
    }

    // 3. Check partial day blocked times
    const isBlocked = blockedTimes.some((block) => {
      if (block.startTime && block.endTime) {
        const bStart = timeToMinutes(block.startTime);
        const bEnd = timeToMinutes(block.endTime);
        return areIntervalsOverlapping(slotStartMin, slotEndMin, bStart, bEnd);
      }
      return false;
    });

    if (isBlocked) {
      continue;
    }

    // 4. Check existing appointments (excluding CANCELLED)
    const hasConflict = existingAppointments.some((appt) => {
      if (appt.status === 'CANCELLED') return false;
      const apptStart = timeToMinutes(appt.startTime);
      const apptEnd = timeToMinutes(appt.endTime);
      return areIntervalsOverlapping(slotStartMin, slotEndMin, apptStart, apptEnd);
    });

    if (hasConflict) {
      continue;
    }

    slots.push({
      time: slotStartTime,
      endTime: slotEndTime,
      formattedTime: slotStartTime,
      available: true,
    });
  }

  return slots;
}
