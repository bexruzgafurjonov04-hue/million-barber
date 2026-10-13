import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes.js';
import barbersRoutes from './routes/barbers.routes.js';
import appointmentsRoutes from './routes/appointments.routes.js';
import barberDashboardRoutes from './routes/barberDashboard.routes.js';
import adminRoutes from './routes/admin.routes.js';
import servicesRoutes from './routes/services.routes.js';
import portfolioRoutes from './routes/portfolio.routes.js';
import shopRoutes from './routes/shop.routes.js';
import contactRoutes from './routes/contact.routes.js';
import timeRoutes from './routes/time.routes.js';
import { apiLimiter } from './middleware/rateLimiter.js';

dotenv.config();

const app = express();

// Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration
const allowedOrigins = [
  process.env.CORS_ORIGIN || 'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive for local testing while supporting credentials
      }
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// General API rate limiter
app.use('/api', apiLimiter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    shop: 'MILLION BARBER',
    timestamp: new Date().toISOString(),
  });
});

// Route Mounts
app.use('/api/auth', authRoutes);
app.use('/api/barbers', barbersRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/barber', barberDashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/time', timeRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  const status = err.status || 500;
  const message = err.message || 'An unexpected error occurred.';
  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

export default app;
