import express from 'express';
import { z } from 'zod';
import prisma from '../prisma.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/services - Public list of services
router.get('/', async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    return res.json({ services });
  } catch (error) {
    console.error('Fetch services error:', error);
    return res.status(500).json({ error: 'Failed to retrieve services.' });
  }
});

const serviceSchema = z.object({
  nameUz: z.string().min(2),
  nameRu: z.string().min(2),
  nameEn: z.string().min(2),
  descriptionUz: z.string().optional().default(''),
  descriptionRu: z.string().optional().default(''),
  descriptionEn: z.string().optional().default(''),
  price: z.number().min(0),
  durationMinutes: z.number().min(15).max(180).default(45),
  category: z.string().default('Haircut'),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
});

// POST /api/services - Admin create service
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const parseResult = serviceSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors[0]?.message || 'Invalid input' });
    }

    const created = await prisma.service.create({
      data: parseResult.data,
    });

    return res.status(201).json({ message: 'Service created.', service: created });
  } catch (error) {
    console.error('Create service error:', error);
    return res.status(500).json({ error: 'Failed to create service.' });
  }
});

// PUT /api/services/:id - Admin update service
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await prisma.service.update({
      where: { id },
      data: req.body,
    });
    return res.json({ message: 'Service updated.', service: updated });
  } catch (error) {
    console.error('Update service error:', error);
    return res.status(500).json({ error: 'Failed to update service.' });
  }
});

// DELETE /api/services/:id - Admin delete service
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.service.delete({ where: { id } });
    return res.json({ message: 'Service deleted.' });
  } catch (error) {
    console.error('Delete service error:', error);
    return res.status(500).json({ error: 'Failed to delete service.' });
  }
});

export default router;
