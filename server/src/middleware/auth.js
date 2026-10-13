import jwt from 'jsonwebtoken';
import prisma from '../prisma.js';

export const requireAuth = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ error: 'Authentication required. Please log in.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'million_barber_secret');

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        barberProfile: true,
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or account is deactivated.' });
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      forcePasswordChange: user.forcePasswordChange,
      barberProfile: user.barberProfile,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ error: 'Invalid authentication token.' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Access forbidden. Administrator privileges required.' });
  }
  next();
};

export const requireBarber = (req, res, next) => {
  if (!req.user || (req.user.role !== 'BARBER' && req.user.role !== 'ADMIN')) {
    return res.status(403).json({ error: 'Access forbidden. Barber access required.' });
  }
  next();
};
