import express from 'express';
import prisma from '../prisma.js';

const router = express.Router();

// GET /api/portfolio - Public works gallery with category filtering
router.get('/', async (req, res) => {
  try {
    const { category, barberId, limit = 24, page = 1 } = req.query;

    const where = {
      isApproved: true,
      barber: { user: { isActive: true } },
    };

    if (category && category !== 'ALL') {
      where.category = String(category).toUpperCase();
    }

    if (barberId) {
      where.barberId = String(barberId);
    }

    const take = Math.min(Number(limit) || 24, 50);
    const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

    const [items, total] = await Promise.all([
      prisma.portfolioImage.findMany({
        where,
        include: {
          barber: {
            include: { user: { select: { name: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.portfolioImage.count({ where }),
    ]);

    return res.json({
      portfolio: items.map((item) => ({
        id: item.id,
        imageUrl: item.imageUrl,
        titleUz: item.titleUz,
        titleRu: item.titleRu,
        titleEn: item.titleEn,
        category: item.category,
        barberId: item.barberId,
        barberName: item.barber.user.name,
        barberSlug: item.barber.slug,
        isFeatured: item.isFeatured,
      })),
      total,
      page: Number(page),
      totalPages: Math.ceil(total / take),
    });
  } catch (error) {
    console.error('Fetch portfolio error:', error);
    return res.status(500).json({ error: 'Failed to retrieve portfolio gallery.' });
  }
});

export default router;
