import express from 'express';
import { z } from 'zod';
import prisma from '../prisma.js';

const router = express.Router();

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(7, 'Valid phone number required'),
  email: z.string().email().optional().or(z.literal('')),
  subject: z.string().optional(),
  message: z.string().min(5, 'Message must be at least 5 characters'),
});

// POST /api/contact - Public contact message submission
router.post('/', async (req, res) => {
  try {
    const parseResult = contactSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: parseResult.error.errors[0]?.message || 'Please fill in all required fields.',
      });
    }

    const { name, phone, email, subject, message } = parseResult.data;

    const savedMessage = await prisma.contactMessage.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        email: email ? email.trim() : null,
        subject: subject ? subject.trim() : 'General Inquiry',
        message: message.trim(),
        isRead: false,
      },
    });

    return res.status(201).json({
      message: 'Message sent successfully! Our team will contact you shortly.',
      id: savedMessage.id,
    });
  } catch (error) {
    console.error('Contact submit error:', error);
    return res.status(500).json({ error: 'Failed to send message.' });
  }
});

export default router;
