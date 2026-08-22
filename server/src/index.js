import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'GlobeTrotter API is up and running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Default root endpoint
app.get('/', (req, res) => {
  res.json({
    app: 'GlobeTrotter API',
    version: '1.0.0',
    documentation: '/api/health'
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
  console.log(`💚 Health Check endpoint: http://localhost:${PORT}/api/health`);
});
