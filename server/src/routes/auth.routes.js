import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

// POST /api/auth/login
router.post('/login', authLimiter, async (req, res) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Please provide a valid email and password.' });
    }

    const { email, password } = parseResult.data;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        barberProfile: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is deactivated. Contact the administrator.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'million_barber_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      forcePasswordChange: user.forcePasswordChange,
      barberProfile: user.barberProfile,
    };

    return res.json({
      message: 'Login successful',
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  return res.json({ message: 'Logged out successfully.' });
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  return res.json({ user: req.user });
});

// POST /api/auth/change-password
router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const parseResult = changePasswordSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors[0]?.message || 'Invalid input' });
    }

    const { currentPassword, newPassword } = parseResult.data;

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    const hashedNew = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedNew,
        forcePasswordChange: false, // Reset force password flag
      },
    });

    return res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ error: 'Failed to update password.' });
  }
});

export default router;
