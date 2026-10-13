import express from 'express';
import prisma from '../prisma.js';

const router = express.Router();

// GET /api/shop/info - Public shop details, gallery, reviews, and settings
router.get('/info', async (req, res) => {
  try {
    const [settings, shopImages, reviews] = await Promise.all([
      prisma.businessSettings.findUnique({ where: { id: 'default' } }),
      prisma.shopImage.findMany({ orderBy: { sortOrder: 'asc' } }),
      prisma.review.findMany({ orderBy: { createdAt: 'desc' } }),
    ]);

    return res.json({
      settings: settings || {
        shopName: 'MILLION BARBER',
        phone: '+998 90 123 45 67',
        addressUz: 'Chust tumani, Namangan viloyati, O\'zbekiston',
        addressRu: 'Чустский район, Наманганская область, Узбекистан',
        addressEn: 'Chust district, Namangan region, Uzbekistan',
        workingHoursUz: 'Har kuni: 09:00 - 21:00',
        workingHoursRu: 'Ежедневно: 09:00 - 21:00',
        workingHoursEn: 'Daily: 09:00 - 21:00',
        timezone: 'Asia/Tashkent',
      },
      shopImages,
      reviews,
    });
  } catch (error) {
    console.error('Fetch shop info error:', error);
    return res.status(500).json({ error: 'Failed to retrieve shop info.' });
  }
});

export default router;
