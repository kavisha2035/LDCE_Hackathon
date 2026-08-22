import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes, { getMeHandler, deleteMeHandler } from './routes/auth.js';
import { authenticateToken } from './middleware/auth.js';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Auth & User routes
app.use('/api/auth', authRoutes);

// Direct /api/me endpoints
app.get('/api/me', authenticateToken, getMeHandler);
app.delete('/api/me', authenticateToken, deleteMeHandler);

// Live Database Health Check Endpoint
app.get('/api/health', async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Live query to Neon DB
    const cityCount = await prisma.city.count();
    const activityCount = await prisma.activity.count();
    const userCount = await prisma.user.count();
    const dbTime = Date.now() - startTime;

    res.status(200).json({
      status: 'ok',
      message: 'GlobeTrotter API & Neon DB are fully connected and online!',
      database: {
        provider: 'Neon PostgreSQL (Cloud)',
        host: 'ep-summer-salad-axui8sry.c-4.us-east-2.aws.neon.tech',
        latencyMs: dbTime,
        counts: {
          cities: cityCount,
          activities: activityCount,
          users: userCount
        }
      },
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('Database connection error in /api/health:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to connect to Neon PostgreSQL database',
      error: error.message
    });
  }
});

// Default root endpoint
app.get('/', (req, res) => {
  res.json({
    app: 'GlobeTrotter API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      user: '/api/me'
    }
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'Something went wrong on the server'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 GlobeTrotter Server running on http://localhost:${PORT}`);
  console.log(`💚 Health & Neon DB Check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth Endpoints: http://localhost:${PORT}/api/auth`);
});
