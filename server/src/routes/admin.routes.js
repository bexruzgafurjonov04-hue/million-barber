import express from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '../prisma.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { uploadImage } from '../middleware/upload.js';
import { getTashkentNow } from '../utils/timezone.js';

const router = express.Router();

// Middleware: all routes here require Admin auth
router.use(requireAuth, requireAdmin);

// GET /api/admin/stats - Overview metrics
router.get('/stats', async (req, res) => {
  try {
    const todayStr = getTashkentNow().format('YYYY-MM-DD');

    const [
      totalBarbers,
      todayBookings,
      upcomingBookings,
      completedBookings,
      cancelledBookings,
      recentMessages,
      recentAppointments,
    ] = await Promise.all([
      prisma.barberProfile.count({ where: { user: { isActive: true } } }),
      prisma.appointment.count({ where: { date: todayStr, status: { not: 'CANCELLED' } } }),
      prisma.appointment.count({ where: { date: { gte: todayStr }, status: 'CONFIRMED' } }),
      prisma.appointment.count({ where: { status: 'COMPLETED' } }),
      prisma.appointment.count({ where: { status: 'CANCELLED' } }),
      prisma.contactMessage.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.appointment.findMany({
        take: 8,
        orderBy: [{ date: 'desc' }, { startTime: 'desc' }],
        include: {
          barber: { include: { user: { select: { name: true } } } },
          service: true,
        },
      }),
    ]);

    return res.json({
      stats: {
        totalBarbers,
        todayBookings,
        upcomingBookings,
        completedBookings,
        cancelledBookings,
      },
      recentMessages,
      recentAppointments,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return res.status(500).json({ error: 'Failed to load stats.' });
  }
});

// --- BARBER MANAGEMENT ---

// GET /api/admin/barbers - List all barbers
router.get('/barbers', async (req, res) => {
  try {
    const barbers = await prisma.barberProfile.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, isActive: true } },
        _count: { select: { appointments: true, portfolioImages: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return res.json({ barbers });
  } catch (error) {
    console.error('Admin get barbers error:', error);
    return res.status(500).json({ error: 'Failed to retrieve barbers.' });
  }
});

const createBarberSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please provide a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional().nullable().or(z.literal('')),
  title: z.string().optional().nullable().or(z.literal('')).default('Master Barber'),
  bioUz: z.string().optional().nullable().or(z.literal('')).default(''),
  bioRu: z.string().optional().nullable().or(z.literal('')).default(''),
  bioEn: z.string().optional().nullable().or(z.literal('')).default(''),
  experienceYears: z.union([z.number(), z.string()]).transform((v) => Number(v) || 0).default(5),
  specialties: z.string().optional().nullable().or(z.literal('')).default('Classic Cut, Beard Styling'),
  avatarUrl: z.string().optional().nullable().or(z.literal('')),
});

// POST /api/admin/barbers - Create new barber
router.post('/barbers', async (req, res) => {
  try {
    const parseResult = createBarberSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors[0]?.message || 'Invalid barber data.' });
    }

    const data = parseResult.data;

    // Check email uniqueness
    const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase().trim() } });
    if (existing) {
      return res.status(400).json({ error: 'A user with this email already exists.' });
    }

    // Slug generation
    let slug = data.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    if (!slug) slug = `barber-${Date.now().toString().slice(-4)}`;
    const existingSlug = await prisma.barberProfile.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const bioUz = data.bioUz?.trim() || `${data.name} - Professional master barber.`;
    const bioRu = data.bioRu?.trim() || bioUz;
    const bioEn = data.bioEn?.trim() || bioUz;
    const specialties = data.specialties?.trim() || 'Classic Cut, Beard Styling, Fade';
    const title = data.title?.trim() || 'Master Barber';
    const avatarUrl = data.avatarUrl?.trim() || '/images/default-barber.jpg';
    const phone = data.phone?.trim() || null;

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: data.name.trim(),
          email: data.email.toLowerCase().trim(),
          phone,
          passwordHash: hashedPassword,
          role: 'BARBER',
          isActive: true,
          forcePasswordChange: false,
        },
      });

      const profile = await tx.barberProfile.create({
        data: {
          userId: user.id,
          slug,
          title,
          bioUz,
          bioRu,
          bioEn,
          experienceYears: data.experienceYears,
          specialties,
          avatarUrl,
          phone,
          slotDurationMinutes: 45,
          isAcceptingBookings: true,
        },
      });

      // Create default schedules (Mon-Sat 09:00 - 20:00)
      for (let day = 0; day <= 6; day++) {
        await tx.workingSchedule.create({
          data: {
            barberId: profile.id,
            dayOfWeek: day,
            isWorking: day !== 0,
            startTime: '09:00',
            endTime: '20:00',
            breakStartTime: '13:00',
            breakEndTime: '14:00',
          },
        });
      }

      return { ...profile, user };
    });

    return res.status(201).json({ message: 'Barber created successfully.', barber: result });
  } catch (error) {
    console.error('Create barber error:', error);
    return res.status(500).json({ error: 'Failed to create barber.' });
  }
});

// PUT /api/admin/barbers/:id - Edit barber
router.put('/barbers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      title,
      bioUz,
      bioRu,
      bioEn,
      experienceYears,
      specialties,
      isActive,
      isAcceptingBookings,
      avatarUrl,
    } = req.body;

    const profile = await prisma.barberProfile.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Barber not found.' });
    }

    if (email && email.toLowerCase().trim() !== profile.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });
      if (existingUser) {
        return res.status(400).json({ error: 'A user with this email already exists.' });
      }
    }

    if (name || email || phone !== undefined || isActive !== undefined) {
      await prisma.user.update({
        where: { id: profile.userId },
        data: {
          ...(name && { name: name.trim() }),
          ...(email && { email: email.toLowerCase().trim() }),
          ...(phone !== undefined && { phone: phone?.trim() || null }),
          ...(isActive !== undefined && { isActive }),
        },
      });
    }

    const updatedProfile = await prisma.barberProfile.update({
      where: { id },
      data: {
        ...(title && { title: title.trim() }),
        ...(bioUz !== undefined && { bioUz }),
        ...(bioRu !== undefined && { bioRu }),
        ...(bioEn !== undefined && { bioEn }),
        ...(experienceYears !== undefined && { experienceYears: Number(experienceYears) || 0 }),
        ...(specialties !== undefined && { specialties }),
        ...(isAcceptingBookings !== undefined && { isAcceptingBookings }),
        ...(avatarUrl && { avatarUrl }),
        ...(phone !== undefined && { phone: phone?.trim() || null }),
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, isActive: true } },
      },
    });

    return res.json({ message: 'Barber updated successfully.', barber: updatedProfile });
  } catch (error) {
    console.error('Update barber error:', error);
    return res.status(500).json({ error: 'Failed to update barber.' });
  }
});

// POST /api/admin/barbers/:id/reset-password - Reset password
router.post('/barbers/:id/reset-password', async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const profile = await prisma.barberProfile.findUnique({ where: { id } });
    if (!profile) {
      return res.status(404).json({ error: 'Barber not found.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: profile.userId },
      data: { passwordHash: hashedPassword },
    });

    return res.json({ message: 'Barber password has been reset.' });
  } catch (error) {
    console.error('Reset barber password error:', error);
    return res.status(500).json({ error: 'Failed to reset password.' });
  }
});

// --- APPOINTMENTS MANAGEMENT ---

// GET /api/admin/appointments - List all appointments
router.get('/appointments', async (req, res) => {
  try {
    const { date, barberId, status } = req.query;
    const where = {};

    if (date) where.date = String(date);
    if (barberId) where.barberId = String(barberId);
    if (status) where.status = String(status);

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        barber: { include: { user: { select: { name: true, email: true } } } },
        service: true,
      },
      orderBy: [{ date: 'desc' }, { startTime: 'desc' }],
    });

    return res.json({ appointments });
  } catch (error) {
    console.error('Admin appointments error:', error);
    return res.status(500).json({ error: 'Failed to load appointments.' });
  }
});

// PATCH /api/admin/appointments/:id/status
router.patch('/appointments/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, cancelReason } = req.body;

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        status,
        ...(cancelReason && { cancelReason }),
      },
    });

    return res.json({ message: 'Appointment status updated.', appointment: updated });
  } catch (error) {
    console.error('Admin appointment status error:', error);
    return res.status(500).json({ error: 'Failed to update status.' });
  }
});

// --- PORTFOLIO MODERATION ---

// GET /api/admin/portfolio - All portfolio images
router.get('/portfolio', async (req, res) => {
  try {
    const items = await prisma.portfolioImage.findMany({
      include: {
        barber: { include: { user: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ portfolio: items });
  } catch (error) {
    console.error('Admin get portfolio error:', error);
    return res.status(500).json({ error: 'Failed to load portfolio.' });
  }
});

// PATCH /api/admin/portfolio/:id/toggle - Toggle approve / hide
router.patch('/portfolio/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved, isFeatured } = req.body;

    const updated = await prisma.portfolioImage.update({
      where: { id },
      data: {
        ...(isApproved !== undefined && { isApproved }),
        ...(isFeatured !== undefined && { isFeatured }),
      },
    });

    return res.json({ message: 'Portfolio item updated.', item: updated });
  } catch (error) {
    console.error('Admin toggle portfolio error:', error);
    return res.status(500).json({ error: 'Failed to update portfolio.' });
  }
});

// DELETE /api/admin/portfolio/:id - Admin delete
router.delete('/portfolio/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.portfolioImage.delete({ where: { id } });
    return res.json({ message: 'Portfolio item deleted.' });
  } catch (error) {
    console.error('Admin delete portfolio error:', error);
    return res.status(500).json({ error: 'Failed to delete portfolio item.' });
  }
});

// --- CONTACT MESSAGES ---

// GET /api/admin/messages
router.get('/messages', async (req, res) => {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ messages });
  } catch (error) {
    console.error('Admin get messages error:', error);
    return res.status(500).json({ error: 'Failed to load messages.' });
  }
});

// PATCH /api/admin/messages/:id/read
router.patch('/messages/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { isRead: true },
    });
    return res.json({ message: 'Marked as read.', item: updated });
  } catch (error) {
    console.error('Mark read error:', error);
    return res.status(500).json({ error: 'Failed to update message.' });
  }
});

// DELETE /api/admin/messages/:id
router.delete('/messages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.contactMessage.delete({ where: { id } });
    return res.json({ message: 'Message deleted.' });
  } catch (error) {
    console.error('Delete message error:', error);
    return res.status(500).json({ error: 'Failed to delete message.' });
  }
});

// --- BUSINESS SETTINGS ---

// GET /api/admin/settings
router.get('/settings', async (req, res) => {
  try {
    const settings = await prisma.businessSettings.findUnique({
      where: { id: 'default' },
    });
    return res.json({ settings });
  } catch (error) {
    console.error('Get settings error:', error);
    return res.status(500).json({ error: 'Failed to load settings.' });
  }
});

// PUT /api/admin/settings
router.put('/settings', async (req, res) => {
  try {
    const settings = await prisma.businessSettings.upsert({
      where: { id: 'default' },
      update: req.body,
      create: {
        id: 'default',
        ...req.body,
      },
    });
    return res.json({ message: 'Settings saved.', settings });
  } catch (error) {
    console.error('Save settings error:', error);
    return res.status(500).json({ error: 'Failed to save settings.' });
  }
});

// --- SHOP IMAGES ---

// GET /api/admin/shop-images
router.get('/shop-images', async (req, res) => {
  try {
    const images = await prisma.shopImage.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return res.json({ images });
  } catch (error) {
    console.error('Admin shop images error:', error);
    return res.status(500).json({ error: 'Failed to load shop images.' });
  }
});

// POST /api/admin/shop-images
router.post('/shop-images', uploadImage.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded.' });
    }
    const { captionUz, captionRu, captionEn, isFeatured } = req.body;
    const imageUrl = `/uploads/shop/${req.file.filename}`;

    const created = await prisma.shopImage.create({
      data: {
        imageUrl,
        captionUz: captionUz || '',
        captionRu: captionRu || '',
        captionEn: captionEn || '',
        isFeatured: Boolean(isFeatured),
      },
    });

    return res.status(201).json({ message: 'Shop image uploaded.', image: created });
  } catch (error) {
    console.error('Upload shop image error:', error);
    return res.status(500).json({ error: 'Failed to upload shop image.' });
  }
});

// DELETE /api/admin/shop-images/:id
router.delete('/shop-images/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.shopImage.delete({ where: { id } });
    return res.json({ message: 'Shop image removed.' });
  } catch (error) {
    console.error('Delete shop image error:', error);
    return res.status(500).json({ error: 'Failed to remove shop image.' });
  }
});

export default router;
