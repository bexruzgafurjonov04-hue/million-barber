import express from 'express';
import { z } from 'zod';
import prisma from '../prisma.js';
import { requireAuth, requireBarber } from '../middleware/auth.js';
import { uploadImage } from '../middleware/upload.js';

const router = express.Router();

// Middleware: all routes here require Barber auth
router.use(requireAuth, requireBarber);

// Helper to get active barber profile from request
const getBarberProfile = (req) => {
  return req.user.barberProfile;
};

// GET /api/barber/profile - Get own profile
router.get('/profile', async (req, res) => {
  try {
    const profile = getBarberProfile(req);
    if (!profile) {
      return res.status(404).json({ error: 'Barber profile not found.' });
    }

    const barber = await prisma.barberProfile.findUnique({
      where: { id: profile.id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    return res.json({ profile: barber });
  } catch (error) {
    console.error('Get barber profile error:', error);
    return res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
});

// PUT /api/barber/profile - Update own profile
const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  title: z.string().min(2).optional(),
  bioUz: z.string().optional(),
  bioRu: z.string().optional(),
  bioEn: z.string().optional(),
  experienceYears: z.number().min(0).max(50).optional(),
  specialties: z.string().optional(),
  phone: z.string().optional(),
  instagram: z.string().optional(),
  slotDurationMinutes: z.number().min(15).max(180).optional(),
  isAcceptingBookings: z.boolean().optional(),
});

router.put('/profile', async (req, res) => {
  try {
    const profile = getBarberProfile(req);
    if (!profile) {
      return res.status(404).json({ error: 'Barber profile not found.' });
    }

    const parseResult = updateProfileSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors[0]?.message || 'Invalid input' });
    }

    const data = parseResult.data;

    // Update user name/phone if provided
    if (data.name || data.phone) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.phone && { phone: data.phone }),
        },
      });
    }

    // Update profile
    const updated = await prisma.barberProfile.update({
      where: { id: profile.id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.bioUz !== undefined && { bioUz: data.bioUz }),
        ...(data.bioRu !== undefined && { bioRu: data.bioRu }),
        ...(data.bioEn !== undefined && { bioEn: data.bioEn }),
        ...(data.experienceYears !== undefined && { experienceYears: data.experienceYears }),
        ...(data.specialties !== undefined && { specialties: data.specialties }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.instagram !== undefined && { instagram: data.instagram }),
        ...(data.slotDurationMinutes !== undefined && { slotDurationMinutes: data.slotDurationMinutes }),
        ...(data.isAcceptingBookings !== undefined && { isAcceptingBookings: data.isAcceptingBookings }),
      },
    });

    return res.json({ message: 'Profile updated successfully.', profile: updated });
  } catch (error) {
    console.error('Update barber profile error:', error);
    return res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// POST /api/barber/avatar - Upload profile photo
router.post('/avatar', uploadImage.single('avatar'), async (req, res) => {
  try {
    const profile = getBarberProfile(req);
    if (!profile) {
      return res.status(404).json({ error: 'Barber profile not found.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded.' });
    }

    const avatarUrl = `/uploads/barbers/${req.file.filename}`;

    const updated = await prisma.barberProfile.update({
      where: { id: profile.id },
      data: { avatarUrl },
    });

    return res.json({ message: 'Profile photo uploaded successfully.', avatarUrl, profile: updated });
  } catch (error) {
    console.error('Upload avatar error:', error);
    return res.status(500).json({ error: 'Failed to upload photo.' });
  }
});

// GET /api/barber/schedule - Get schedules
router.get('/schedule', async (req, res) => {
  try {
    const profile = getBarberProfile(req);
    if (!profile) {
      return res.status(404).json({ error: 'Barber profile not found.' });
    }

    const schedules = await prisma.workingSchedule.findMany({
      where: { barberId: profile.id },
      orderBy: { dayOfWeek: 'asc' },
    });

    return res.json({ schedules });
  } catch (error) {
    console.error('Get schedules error:', error);
    return res.status(500).json({ error: 'Failed to retrieve schedules.' });
  }
});

// PUT /api/barber/schedule - Update schedules
router.put('/schedule', async (req, res) => {
  try {
    const profile = getBarberProfile(req);
    if (!profile) {
      return res.status(404).json({ error: 'Barber profile not found.' });
    }

    const { schedules } = req.body;
    if (!Array.isArray(schedules)) {
      return res.status(400).json({ error: 'Schedules must be an array.' });
    }

    // Upsert each schedule for this barber
    for (const item of schedules) {
      if (item.dayOfWeek !== undefined) {
        await prisma.workingSchedule.upsert({
          where: {
            barberId_dayOfWeek: {
              barberId: profile.id,
              dayOfWeek: Number(item.dayOfWeek),
            },
          },
          update: {
            isWorking: Boolean(item.isWorking),
            startTime: item.startTime || '09:00',
            endTime: item.endTime || '20:00',
            breakStartTime: item.breakStartTime || null,
            breakEndTime: item.breakEndTime || null,
          },
          create: {
            barberId: profile.id,
            dayOfWeek: Number(item.dayOfWeek),
            isWorking: Boolean(item.isWorking),
            startTime: item.startTime || '09:00',
            endTime: item.endTime || '20:00',
            breakStartTime: item.breakStartTime || null,
            breakEndTime: item.breakEndTime || null,
          },
        });
      }
    }

    const updated = await prisma.workingSchedule.findMany({
      where: { barberId: profile.id },
      orderBy: { dayOfWeek: 'asc' },
    });

    return res.json({ message: 'Schedules updated successfully.', schedules: updated });
  } catch (error) {
    console.error('Update schedules error:', error);
    return res.status(500).json({ error: 'Failed to update schedule.' });
  }
});

// GET /api/barber/blocked-times - List blocked dates
router.get('/blocked-times', async (req, res) => {
  try {
    const profile = getBarberProfile(req);
    if (!profile) {
      return res.status(404).json({ error: 'Barber profile not found.' });
    }

    const blocked = await prisma.blockedTime.findMany({
      where: { barberId: profile.id },
      orderBy: { date: 'asc' },
    });

    return res.json({ blockedTimes: blocked });
  } catch (error) {
    console.error('Get blocked times error:', error);
    return res.status(500).json({ error: 'Failed to load blocked times.' });
  }
});

// POST /api/barber/blocked-times - Add holiday or break
router.post('/blocked-times', async (req, res) => {
  try {
    const profile = getBarberProfile(req);
    if (!profile) {
      return res.status(404).json({ error: 'Barber profile not found.' });
    }

    const { date, startTime, endTime, isFullDay, reason } = req.body;
    if (!date) {
      return res.status(400).json({ error: 'Date is required.' });
    }

    const created = await prisma.blockedTime.create({
      data: {
        barberId: profile.id,
        date,
        startTime: isFullDay ? null : startTime,
        endTime: isFullDay ? null : endTime,
        isFullDay: Boolean(isFullDay),
        reason: reason || 'Unavailable',
      },
    });

    return res.status(201).json({ message: 'Blocked time added.', blockedTime: created });
  } catch (error) {
    console.error('Add blocked time error:', error);
    return res.status(500).json({ error: 'Failed to block time.' });
  }
});

// DELETE /api/barber/blocked-times/:id - Remove blocked time
router.delete('/blocked-times/:id', async (req, res) => {
  try {
    const profile = getBarberProfile(req);
    const { id } = req.params;

    const existing = await prisma.blockedTime.findUnique({
      where: { id },
    });

    if (!existing || existing.barberId !== profile.id) {
      return res.status(404).json({ error: 'Blocked time record not found or not owned by you.' });
    }

    await prisma.blockedTime.delete({ where: { id } });

    return res.json({ message: 'Blocked time removed.' });
  } catch (error) {
    console.error('Delete blocked time error:', error);
    return res.status(500).json({ error: 'Failed to remove blocked time.' });
  }
});

// GET /api/barber/portfolio - Get barber's portfolio items
router.get('/portfolio', async (req, res) => {
  try {
    const profile = getBarberProfile(req);
    if (!profile) {
      return res.status(404).json({ error: 'Barber profile not found.' });
    }

    const items = await prisma.portfolioImage.findMany({
      where: { barberId: profile.id },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ portfolio: items });
  } catch (error) {
    console.error('Get portfolio error:', error);
    return res.status(500).json({ error: 'Failed to load portfolio items.' });
  }
});

// POST /api/barber/portfolio - Upload portfolio image
router.post('/portfolio', uploadImage.single('image'), async (req, res) => {
  try {
    const profile = getBarberProfile(req);
    if (!profile) {
      return res.status(404).json({ error: 'Barber profile not found.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Please upload an image.' });
    }

    const { titleUz, titleRu, titleEn, category } = req.body;
    const imageUrl = `/uploads/portfolio/${req.file.filename}`;

    const validCategories = ['FADE', 'CLASSIC', 'TEXTURED', 'BEARD', 'OTHER'];
    const chosenCategory = validCategories.includes(category) ? category : 'OTHER';

    const item = await prisma.portfolioImage.create({
      data: {
        barberId: profile.id,
        imageUrl,
        titleUz: titleUz || 'Yangi Turmak',
        titleRu: titleRu || 'Новая стрижка',
        titleEn: titleEn || 'New Hairstyle',
        category: chosenCategory,
        isApproved: true,
      },
    });

    return res.status(201).json({ message: 'Haircut photo uploaded successfully!', item });
  } catch (error) {
    console.error('Upload portfolio error:', error);
    return res.status(500).json({ error: 'Failed to upload portfolio item.' });
  }
});

// DELETE /api/barber/portfolio/:id - Delete portfolio item
router.delete('/portfolio/:id', async (req, res) => {
  try {
    const profile = getBarberProfile(req);
    const { id } = req.params;

    const item = await prisma.portfolioImage.findUnique({
      where: { id },
    });

    if (!item || item.barberId !== profile.id) {
      return res.status(404).json({ error: 'Portfolio item not found or unauthorized.' });
    }

    await prisma.portfolioImage.delete({ where: { id } });

    return res.json({ message: 'Portfolio item deleted successfully.' });
  } catch (error) {
    console.error('Delete portfolio item error:', error);
    return res.status(500).json({ error: 'Failed to delete portfolio item.' });
  }
});

export default router;
