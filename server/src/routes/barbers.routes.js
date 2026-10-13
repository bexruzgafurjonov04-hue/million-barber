import express from 'express';
import dayjs from 'dayjs';
import prisma from '../prisma.js';
import { generateAvailableSlots, getTashkentNow } from '../utils/timezone.js';

const router = express.Router();

// GET /api/barbers - List all public barbers
router.get('/', async (req, res) => {
  try {
    const barbers = await prisma.barberProfile.findMany({
      where: {
        user: { isActive: true },
      },
      include: {
        user: {
          select: { name: true, email: true },
        },
        portfolioImages: {
          where: { isApproved: true },
          take: 3,
        },
        schedules: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const nowTashkent = getTashkentNow();
    const todayStr = nowTashkent.format('YYYY-MM-DD');
    const todayDayOfWeek = nowTashkent.day();

    // Check today's availability for each barber
    const barbersWithAvailability = await Promise.all(
      barbers.map(async (barber) => {
        const todaySchedule = barber.schedules.find((s) => s.dayOfWeek === todayDayOfWeek);
        const blockedTimes = await prisma.blockedTime.findMany({
          where: { barberId: barber.id, date: todayStr },
        });
        const todayAppointments = await prisma.appointment.findMany({
          where: { barberId: barber.id, date: todayStr, status: { not: 'CANCELLED' } },
        });

        const availableSlots = generateAvailableSlots({
          targetDate: todayStr,
          schedule: todaySchedule,
          blockedTimes,
          existingAppointments: todayAppointments,
          slotDurationMinutes: barber.slotDurationMinutes,
        });

        let statusText = 'available';
        if (!barber.isAcceptingBookings) {
          statusText = 'unavailable';
        } else if (!todaySchedule || !todaySchedule.isWorking || blockedTimes.some((b) => b.isFullDay)) {
          statusText = 'off_today';
        } else if (availableSlots.length === 0) {
          statusText = 'fully_booked';
        }

        return {
          id: barber.id,
          userId: barber.userId,
          slug: barber.slug,
          name: barber.user.name,
          title: barber.title,
          bioUz: barber.bioUz,
          bioRu: barber.bioRu,
          bioEn: barber.bioEn,
          experienceYears: barber.experienceYears,
          specialties: barber.specialties,
          avatarUrl: barber.avatarUrl,
          phone: barber.phone,
          instagram: barber.instagram,
          slotDurationMinutes: barber.slotDurationMinutes,
          isAcceptingBookings: barber.isAcceptingBookings,
          todayAvailability: statusText,
          availableSlotsCount: availableSlots.length,
          samplePortfolio: barber.portfolioImages,
        };
      })
    );

    return res.json({ barbers: barbersWithAvailability });
  } catch (error) {
    console.error('Fetch barbers error:', error);
    return res.status(500).json({ error: 'Failed to retrieve barbers.' });
  }
});

// GET /api/barbers/:slugOrId - Barber details
router.get('/:slugOrId', async (req, res) => {
  try {
    const { slugOrId } = req.params;

    const barber = await prisma.barberProfile.findFirst({
      where: {
        OR: [{ id: slugOrId }, { slug: slugOrId }],
        user: { isActive: true },
      },
      include: {
        user: {
          select: { name: true, email: true },
        },
        schedules: {
          orderBy: { dayOfWeek: 'asc' },
        },
        portfolioImages: {
          where: { isApproved: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!barber) {
      return res.status(404).json({ error: 'Barber profile not found.' });
    }

    return res.json({
      barber: {
        id: barber.id,
        userId: barber.userId,
        slug: barber.slug,
        name: barber.user.name,
        title: barber.title,
        bioUz: barber.bioUz,
        bioRu: barber.bioRu,
        bioEn: barber.bioEn,
        experienceYears: barber.experienceYears,
        specialties: barber.specialties,
        avatarUrl: barber.avatarUrl,
        phone: barber.phone,
        instagram: barber.instagram,
        slotDurationMinutes: barber.slotDurationMinutes,
        isAcceptingBookings: barber.isAcceptingBookings,
        schedules: barber.schedules,
        portfolio: barber.portfolioImages,
      },
    });
  } catch (error) {
    console.error('Fetch barber detail error:', error);
    return res.status(500).json({ error: 'Failed to load barber details.' });
  }
});

// GET /api/barbers/:id/slots - Available appointment time slots for a given date
router.get('/:id/slots', async (req, res) => {
  try {
    const { id } = req.params;
    const { date, serviceId, duration } = req.query; // YYYY-MM-DD

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Valid date query parameter (YYYY-MM-DD) is required.' });
    }

    const barber = await prisma.barberProfile.findUnique({
      where: { id },
      include: { schedules: true },
    });

    if (!barber || !barber.isAcceptingBookings) {
      return res.status(404).json({ error: 'Barber not found or not accepting bookings.' });
    }

    let durationMinutes = barber.slotDurationMinutes || 45;
    if (duration) {
      const parsedDur = parseInt(duration, 10);
      if (!isNaN(parsedDur) && parsedDur > 0) durationMinutes = parsedDur;
    } else if (serviceId) {
      const srv = await prisma.service.findUnique({ where: { id: serviceId } });
      if (srv?.durationMinutes) durationMinutes = srv.durationMinutes;
    }

    // Determine day of week for target date (0=Sun, 1=Mon, ..., 6=Sat)
    const targetDayOfWeek = dayjs(date).day();

    const schedule = barber.schedules.find((s) => s.dayOfWeek === targetDayOfWeek);

    const blockedTimes = await prisma.blockedTime.findMany({
      where: { barberId: id, date: String(date) },
    });

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        barberId: id,
        date: String(date),
        status: { not: 'CANCELLED' },
      },
    });

    const slots = generateAvailableSlots({
      targetDate: String(date),
      schedule,
      blockedTimes,
      existingAppointments,
      slotDurationMinutes: durationMinutes,
    });

    return res.json({
      date,
      barberId: id,
      slotDurationMinutes: durationMinutes,
      isWorkingDay: !!schedule && schedule.isWorking,
      isFullyBlocked: blockedTimes.some((b) => b.isFullDay),
      slots,
    });
  } catch (error) {
    console.error('Slot generation error:', error);
    return res.status(500).json({ error: 'Failed to generate available slots.' });
  }
});

export default router;
