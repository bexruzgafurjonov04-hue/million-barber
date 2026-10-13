import express from 'express';
import { getTashkentNow, TIMEZONE } from '../utils/timezone.js';

const router = express.Router();

// GET /api/time - Real-time Asia/Tashkent clock and date
router.get('/', (req, res) => {
  const now = getTashkentNow();
  return res.json({
    timezone: TIMEZONE,
    iso: now.toISOString(),
    formattedDate: now.format('YYYY-MM-DD'),
    formattedTime: now.format('HH:mm:ss'),
    hours: now.hour(),
    minutes: now.minute(),
    seconds: now.second(),
    dayOfWeek: now.day(),
    timestamp: now.valueOf(),
  });
});

export default router;
