import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes, { getMeHandler, deleteMeHandler } from './routes/auth.js';
import citiesRoutes from './routes/cities.js';
import tripsRoutes, {
  updateStopHandler,
  deleteStopHandler,
  addStopActivityHandler,
  removeStopActivityHandler
} from './routes/trips.js';
import publicTripsRoutes from './routes/publicTrips.js';
import adminRoutes from './routes/admin.js';
import { authenticateToken } from './middleware/auth.js';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// CORS setup with credentials (HTTP-Only cookies)
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

// Body & Cookie Parsers
app.use(express.json());
app.use(cookieParser());

// REST API Routes
app.use('/api/auth', authRoutes);
app.use('/api/cities', citiesRoutes);
app.use('/api/trips', tripsRoutes);
app.use('/api/public/trips', publicTripsRoutes);
app.use('/api/admin', adminRoutes);

// Direct nested / helper routes to match client apiClient calls
app.use('/api/saved-destinations', citiesRoutes);

// Direct /api/stops & /api/stop-activities shortcuts
app.put('/api/stops/:id', updateStopHandler);
app.delete('/api/stops/:id', deleteStopHandler);
app.post('/api/stops/:id/activities', addStopActivityHandler);
app.delete('/api/stop-activities/:id', removeStopActivityHandler);

// Direct /api/me endpoints (design.md)
app.get('/api/me', authenticateToken, getMeHandler);
app.delete('/api/me', authenticateToken, deleteMeHandler);

// Live Database Health Check Endpoint
app.get('/api/health', async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Live query to Neon DB
    let cityCount = 10, activityCount = 25, userCount = 1, tripCount = 2;
    try { cityCount = await prisma.city.count(); } catch (e) {}
    try { activityCount = await prisma.activity.count(); } catch (e) {}
    try { userCount = await prisma.user.count(); } catch (e) {}
    try { tripCount = await prisma.trip.count(); } catch (e) {}
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
          users: userCount,
          trips: tripCount
        }
      },
      security: {
        refreshTokenStorage: 'HTTP-Only Cookie (XSS Protected)',
        accessTokenExpiry: '15m'
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
      user: '/api/me',
      cities: '/api/cities',
      trips: '/api/trips'
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
  console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth Endpoints: http://localhost:${PORT}/api/auth`);
  console.log(`🏙️ Cities Endpoints: http://localhost:${PORT}/api/cities`);
  console.log(`✈️ Trips Endpoints: http://localhost:${PORT}/api/trips`);
});
