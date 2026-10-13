import express from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import dayjs from 'dayjs';
import prisma from '../prisma.js';
import { requireAuth, requireBarber } from '../middleware/auth.js';
import { bookingLimiter } from '../middleware/rateLimiter.js';
import {
  parseTashkentDateTime,
  timeToMinutes,
  minutesToTime,
  areIntervalsOverlapping,
} from '../utils/timezone.js';

const router = express.Router();

const createAppointmentSchema = z.object({
  barberId: z.string().uuid(),
  serviceId: z.string().optional(),
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  customerPhone: z.string().min(7, 'Valid phone number required'),
  customerEmail: z.string().email().optional().or(z.literal('')),
  customerNotes: z.string().max(500).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:mm'),
});

// Helper to generate a unique readable booking reference
function generateBookingReference() {
  const code = crypto.randomInt(10000, 99999);
  return `MB-${code}`;
}

// POST /api/appointments - Book a new appointment with transaction & double-booking prevention
router.post('/', bookingLimiter, async (req, res) => {
  try {
    const parseResult = createAppointmentSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: parseResult.error.errors[0]?.message || 'Invalid booking data.',
      });
    }

    const {
      barberId,
      serviceId,
      customerName,
      customerPhone,
      customerEmail,
      customerNotes,
      date,
      startTime,
    } = parseResult.data;

    // 1. Fetch barber profile and schedule
    const barber = await prisma.barberProfile.findUnique({
      where: { id: barberId },
      include: {
        user: { select: { name: true, isActive: true } },
        schedules: true,
      },
    });

    if (!barber || !barber.user.isActive || !barber.isAcceptingBookings) {
      return res.status(400).json({ error: 'This barber is currently not accepting bookings.' });
    }

    // 2. Fetch service if provided
    let service = null;
    let serviceName = 'Klassik Xizmat / Classic Service';
    let servicePrice = 70000;
    let durationMinutes = barber.slotDurationMinutes || 45;

    if (serviceId) {
      service = await prisma.service.findUnique({
        where: { id: serviceId },
      });
      if (service) {
        serviceName = service.nameUz;
        servicePrice = service.price;
        if (service.durationMinutes) {
          durationMinutes = service.durationMinutes;
        }
      }
    }

    // Calculate end time
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = startMinutes + durationMinutes;
    const endTime = minutesToTime(endMinutes);

    // Compute UTC Date objects representing Tashkent local time
    const startDateTime = parseTashkentDateTime(date, startTime);
    const endDateTime = parseTashkentDateTime(date, endTime);

    // Verify day of week working hours & break
    const targetDayOfWeek = dayjs(date).day();
    const daySchedule = barber.schedules.find((s) => s.dayOfWeek === targetDayOfWeek);

    if (!daySchedule || !daySchedule.isWorking) {
      return res.status(400).json({ error: 'The barber is not working on the selected date.' });
    }

    const workStartMin = timeToMinutes(daySchedule.startTime);
    const workEndMin = timeToMinutes(daySchedule.endTime);

    if (startMinutes < workStartMin || endMinutes > workEndMin) {
      return res.status(400).json({
        error: `Selected slot is outside of barber working hours (${daySchedule.startTime} - ${daySchedule.endTime}).`,
      });
    }

    if (daySchedule.breakStartTime && daySchedule.breakEndTime) {
      const breakStart = timeToMinutes(daySchedule.breakStartTime);
      const breakEnd = timeToMinutes(daySchedule.breakEndTime);
      if (areIntervalsOverlapping(startMinutes, endMinutes, breakStart, breakEnd)) {
        return res.status(400).json({ error: 'Selected time slot overlaps with the barber break time.' });
      }
    }

    // 3. Database Transaction with Strict Overlap Check and Concurrency Locking
    const appointment = await prisma.$transaction(async (tx) => {
      // 1. Pessimistic row locking on BarberProfile to serialize concurrent booking attempts for this barber
      await tx.$executeRaw`SELECT id FROM "BarberProfile" WHERE id = ${barberId} FOR UPDATE`;

      // 2. Advisory transaction lock for barber + date
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${barberId} || '_' || ${date}))`;

      // Check full day or partial blocked times
      const blocked = await tx.blockedTime.findFirst({
        where: {
          barberId,
          date,
        },
      });

      if (blocked) {
        if (blocked.isFullDay) {
          throw new Error('Usta ushbu sanada qabul qilmaydi / The barber is unavailable on this date.');
        }
        if (blocked.startTime && blocked.endTime) {
          const bStart = timeToMinutes(blocked.startTime);
          const bEnd = timeToMinutes(blocked.endTime);
          if (areIntervalsOverlapping(startMinutes, endMinutes, bStart, bEnd)) {
            throw new Error('Bu vaqt oralig‘i usta tomonidan band qilingan.');
          }
        }
      }

      // Check for overlapping non-cancelled appointment
      // Overlap condition: existing.start < new.end AND existing.end > new.start
      const conflict = await tx.appointment.findFirst({
        where: {
          barberId,
          status: { not: 'CANCELLED' },
          startDateTime: { lt: endDateTime },
          endDateTime: { gt: startDateTime },
        },
      });

      if (conflict) {
        throw new Error('Bu vaqt boshqa mijoz tomonidan band qilindi. Boshqa vaqtni tanlang.');
      }

      // Generate unique reference
      let bookingReference = generateBookingReference();
      let exists = await tx.appointment.findUnique({ where: { bookingReference } });
      while (exists) {
        bookingReference = generateBookingReference();
        exists = await tx.appointment.findUnique({ where: { bookingReference } });
      }

      const newAppt = await tx.appointment.create({
        data: {
          bookingReference,
          barberId,
          serviceId: service ? service.id : null,
          serviceName,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail?.trim() || null,
          customerNotes: customerNotes?.trim() || null,
          date,
          startTime,
          endTime,
          startDateTime,
          endDateTime,
          totalPrice: servicePrice,
          status: 'CONFIRMED',
        },
        include: {
          barber: {
            include: { user: { select: { name: true } } },
          },
          service: true,
        },
      });

      return newAppt;
    });

    return res.status(201).json({
      message: 'Appointment booked successfully!',
      booking: {
        id: appointment.id,
        bookingReference: appointment.bookingReference,
        barberName: appointment.barber.user.name,
        serviceName: appointment.serviceName,
        date: appointment.date,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        totalPrice: appointment.totalPrice,
        status: appointment.status,
        customerName: appointment.customerName,
        customerPhone: appointment.customerPhone,
      },
    });
  } catch (error) {
    console.error('Appointment booking error:', error);
    return res.status(400).json({ error: error.message || 'Failed to book appointment.' });
  }
});

// GET /api/appointments/lookup - Look up existing booking by reference & phone
router.get('/lookup', async (req, res) => {
  try {
    const { reference, phone } = req.query;

    if (!reference) {
      return res.status(400).json({ error: 'Booking reference is required.' });
    }

    const whereClause = {
      bookingReference: String(reference).trim().toUpperCase(),
    };

    if (phone) {
      whereClause.customerPhone = { contains: String(phone).trim() };
    }

    const appointment = await prisma.appointment.findFirst({
      where: whereClause,
      include: {
        barber: {
          include: { user: { select: { name: true } } },
        },
        service: true,
      },
    });

    if (!appointment) {
      return res.status(404).json({ error: 'No booking found matching your details.' });
    }

    return res.json({
      booking: {
        id: appointment.id,
        bookingReference: appointment.bookingReference,
        barberName: appointment.barber.user.name,
        barberSlug: appointment.barber.slug,
        serviceName: appointment.serviceName,
        date: appointment.date,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        totalPrice: appointment.totalPrice,
        status: appointment.status,
        customerName: appointment.customerName,
        createdAt: appointment.createdAt,
      },
    });
  } catch (error) {
    console.error('Booking lookup error:', error);
    return res.status(500).json({ error: 'Failed to find appointment.' });
  }
});

// POST /api/appointments/:id/cancel - Cancel booking
router.post('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { bookingReference, customerPhone, reason } = req.body;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: { barber: true },
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    if (appointment.status === 'CANCELLED') {
      return res.status(400).json({ error: 'This appointment is already cancelled.' });
    }

    // Verify ownership via guest credentials or barber/admin auth
    const isGuestOwner =
      bookingReference &&
      appointment.bookingReference === bookingReference.trim() &&
      (!customerPhone || appointment.customerPhone.includes(customerPhone.trim()));

    let isAuthorized = isGuestOwner;

    // Check header auth if provided
    if (!isAuthorized && req.headers.authorization) {
      // User or Admin
      try {
        const token = req.headers.authorization.split(' ')[1];
        const jwt = (await import('jsonwebtoken')).default;
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'million_barber_secret');
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          include: { barberProfile: true },
        });

        if (user) {
          if (user.role === 'ADMIN' || (user.barberProfile && user.barberProfile.id === appointment.barberId)) {
            isAuthorized = true;
          }
        }
      } catch (e) {
        // Auth failed
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({ error: 'Unauthorized to cancel this booking.' });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelReason: reason || 'Cancelled by customer',
      },
    });

    return res.json({
      message: 'Appointment cancelled successfully.',
      booking: updated,
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    return res.status(500).json({ error: 'Failed to cancel appointment.' });
  }
});

// POST /api/appointments/:id/reschedule - Reschedule booking with conflict check & locking
router.post('/:id/reschedule', async (req, res) => {
  try {
    const { id } = req.params;
    const { newDate, newStartTime, bookingReference, customerPhone } = req.body;

    if (!newDate || !newStartTime) {
      return res.status(400).json({ error: 'New date and start time are required.' });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        barber: {
          include: {
            schedules: true,
          },
        },
        service: true,
      },
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    if (appointment.status === 'CANCELLED') {
      return res.status(400).json({ error: 'Cannot reschedule a cancelled appointment.' });
    }

    // Check authorization
    const isGuestOwner =
      bookingReference &&
      appointment.bookingReference === bookingReference.trim() &&
      (!customerPhone || appointment.customerPhone.includes(customerPhone.trim()));

    let isAuthorized = isGuestOwner;
    if (!isAuthorized && req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const jwt = (await import('jsonwebtoken')).default;
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'million_barber_secret');
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          include: { barberProfile: true },
        });
        if (user && (user.role === 'ADMIN' || user.barberProfile?.id === appointment.barberId)) {
          isAuthorized = true;
        }
      } catch (e) {
        // Auth failed
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({ error: 'Unauthorized to reschedule this appointment.' });
    }

    let durationMinutes = appointment.barber.slotDurationMinutes || 45;
    if (appointment.service?.durationMinutes) {
      durationMinutes = appointment.service.durationMinutes;
    }

    const startMinutes = timeToMinutes(newStartTime);
    const endMinutes = startMinutes + durationMinutes;
    const newEndTime = minutesToTime(endMinutes);

    const newStartDateTime = parseTashkentDateTime(newDate, newStartTime);
    const newEndDateTime = parseTashkentDateTime(newDate, newEndTime);

    const targetDayOfWeek = dayjs(newDate).day();
    const daySchedule = appointment.barber.schedules.find((s) => s.dayOfWeek === targetDayOfWeek);

    if (!daySchedule || !daySchedule.isWorking) {
      return res.status(400).json({ error: 'The barber is not working on the selected date.' });
    }

    const workStartMin = timeToMinutes(daySchedule.startTime);
    const workEndMin = timeToMinutes(daySchedule.endTime);

    if (startMinutes < workStartMin || endMinutes > workEndMin) {
      return res.status(400).json({
        error: `Selected slot is outside of barber working hours (${daySchedule.startTime} - ${daySchedule.endTime}).`,
      });
    }

    if (daySchedule.breakStartTime && daySchedule.breakEndTime) {
      const breakStart = timeToMinutes(daySchedule.breakStartTime);
      const breakEnd = timeToMinutes(daySchedule.breakEndTime);
      if (areIntervalsOverlapping(startMinutes, endMinutes, breakStart, breakEnd)) {
        return res.status(400).json({ error: 'Selected time slot overlaps with the barber break time.' });
      }
    }

    // Atomic transaction with pessimistic row lock and advisory lock
    const updated = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT id FROM "BarberProfile" WHERE id = ${appointment.barberId} FOR UPDATE`;
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${appointment.barberId} || '_' || ${newDate}))`;

      const blocked = await tx.blockedTime.findFirst({
        where: { barberId: appointment.barberId, date: newDate },
      });
      if (blocked) {
        if (blocked.isFullDay) {
          throw new Error('Usta ushbu sanada qabul qilmaydi / The barber is unavailable on this date.');
        }
        if (blocked.startTime && blocked.endTime) {
          const bStart = timeToMinutes(blocked.startTime);
          const bEnd = timeToMinutes(blocked.endTime);
          if (areIntervalsOverlapping(startMinutes, endMinutes, bStart, bEnd)) {
            throw new Error('Bu vaqt oralig‘i usta tomonidan band qilingan.');
          }
        }
      }

      const conflict = await tx.appointment.findFirst({
        where: {
          barberId: appointment.barberId,
          id: { not: appointment.id },
          status: { not: 'CANCELLED' },
          startDateTime: { lt: newEndDateTime },
          endDateTime: { gt: newStartDateTime },
        },
      });

      if (conflict) {
        throw new Error('Bu vaqt boshqa mijoz tomonidan band qilindi. Boshqa vaqtni tanlang.');
      }

      return await tx.appointment.update({
        where: { id: appointment.id },
        data: {
          date: newDate,
          startTime: newStartTime,
          endTime: newEndTime,
          startDateTime: newStartDateTime,
          endDateTime: newEndDateTime,
        },
      });
    });

    return res.json({
      message: 'Appointment rescheduled successfully.',
      booking: updated,
    });
  } catch (error) {
    console.error('Reschedule appointment error:', error);
    return res.status(400).json({ error: error.message || 'Failed to reschedule appointment.' });
  }
});

// GET /api/appointments/barber/me - Barber's own bookings
router.get('/barber/me', requireAuth, requireBarber, async (req, res) => {
  try {
    const barberProfile = req.user.barberProfile;
    if (!barberProfile && req.user.role !== 'ADMIN') {
      return res.status(404).json({ error: 'Barber profile not found for this account.' });
    }

    const { date, status } = req.query;
    const where = {};

    if (req.user.role === 'BARBER') {
      where.barberId = barberProfile.id;
    } else if (req.query.barberId) {
      where.barberId = req.query.barberId;
    }

    if (date) {
      where.date = String(date);
    }
    if (status) {
      where.status = String(status);
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        service: true,
        barber: {
          include: { user: { select: { name: true } } },
        },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    return res.json({ appointments });
  } catch (error) {
    console.error('Fetch barber bookings error:', error);
    return res.status(500).json({ error: 'Failed to load bookings.' });
  }
});

// PATCH /api/appointments/barber/:id/status - Update booking status
router.patch('/barber/:id/status', requireAuth, requireBarber, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, cancelReason } = req.body;

    const validStatuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid appointment status.' });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: { barber: true },
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }

    // Check permission: Must be the assigned barber or admin
    if (req.user.role !== 'ADMIN') {
      if (!req.user.barberProfile || req.user.barberProfile.id !== appointment.barberId) {
        return res.status(403).json({ error: 'You cannot modify appointments for other barbers.' });
      }
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        status,
        cancelReason: cancelReason || appointment.cancelReason,
      },
    });

    return res.json({ message: 'Status updated successfully.', appointment: updated });
  } catch (error) {
    console.error('Update appointment status error:', error);
    return res.status(500).json({ error: 'Failed to update status.' });
  }
});

export default router;
