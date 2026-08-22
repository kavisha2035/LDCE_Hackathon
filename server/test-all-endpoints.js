import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes, { getMeHandler, deleteMeHandler } from './src/routes/auth.js';
import citiesRoutes from './src/routes/cities.js';
import tripsRoutes from './src/routes/trips.js';
import publicTripsRoutes from './src/routes/publicTrips.js';
import { authenticateToken } from './src/middleware/auth.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Mount routes identically to index.js
app.use('/api/auth', authRoutes);
app.use('/api/cities', citiesRoutes);
app.use('/api/trips', tripsRoutes);
app.use('/api/public/trips', publicTripsRoutes);
app.use('/api/stops', tripsRoutes);
app.use('/api/stop-activities', tripsRoutes);
app.use('/api/saved-destinations', citiesRoutes);

app.get('/api/me', authenticateToken, getMeHandler);
app.delete('/api/me', authenticateToken, deleteMeHandler);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API online' });
});

async function runTests() {
  const server = app.listen(5009);
  const BASE = 'http://127.0.0.1:5009';
  
  console.log('\n======================================================');
  console.log('  GLOBETROTTER END-TO-END API ROUTE AUDIT & TEST SUITE');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;
  let authToken = '';

  const assertEndpoint = async (name, url, options = {}, expectedStatus = [200, 201]) => {
    const start = Date.now();
    try {
      const res = await fetch(`${BASE}${url}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          ...options.headers
        }
      });
      const duration = Date.now() - start;
      const data = await res.json().catch(() => null);
      
      const isExpected = Array.isArray(expectedStatus) 
        ? expectedStatus.includes(res.status) 
        : res.status === expectedStatus;

      if (isExpected) {
        console.log(`  [PASS] ${res.status} | ${name.padEnd(45)} (${duration}ms)`);
        passed++;
        return data;
      } else {
        console.error(`  [FAIL] ${res.status} (expected ${expectedStatus}) | ${name.padEnd(45)} (${duration}ms)`);
        console.error(`         Response:`, data);
        failed++;
        return data;
      }
    } catch (err) {
      console.error(`  [ERR]  ${name.padEnd(45)}: ${err.message}`);
      failed++;
      return null;
    }
  };

  try {
    // 1. Health
    await assertEndpoint('GET /api/health', '/api/health');

    // 2. Auth - Signup
    const testEmail = `tester_${Date.now()}@example.com`;
    const signupData = await assertEndpoint('POST /api/auth/signup', '/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Passenger',
        email: testEmail,
        password: 'password123',
        languagePref: 'en'
      })
    }, 201);

    if (signupData?.accessToken || signupData?.token) {
      authToken = signupData.accessToken || signupData.token;
    }

    // 3. Auth - Login
    const loginData = await assertEndpoint('POST /api/auth/login', '/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: testEmail,
        password: 'password123'
      })
    }, 200);

    if (loginData?.accessToken || loginData?.token) {
      authToken = loginData.accessToken || loginData.token;
    }

    // 4. Auth - Forgot Password
    await assertEndpoint('POST /api/auth/forgot-password', '/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: 'alex@example.com' })
    }, 200);

    // 5. Auth - Me & Profile
    await assertEndpoint('GET /api/auth/me (Protected)', '/api/auth/me');
    await assertEndpoint('GET /api/me (Direct Alias)', '/api/me');
    await assertEndpoint('PUT /api/auth/profile (Update Profile)', '/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ name: 'Updated Passenger Name' })
    });

    // 6. Cities - All, filterable & search
    await assertEndpoint('GET /api/cities (All Cities)', '/api/cities');
    await assertEndpoint('GET /api/cities?search=Paris (Search)', '/api/cities?search=Paris');
    await assertEndpoint('GET /api/cities?region=Europe&costIndex=4', '/api/cities?region=Europe&costIndex=4');
    await assertEndpoint('GET /api/cities?sortBy=popularity', '/api/cities?sortBy=popularity');
    await assertEndpoint('GET /api/cities/city-paris (Single City)', '/api/cities/city-paris');

    // 7. Activities for a City
    await assertEndpoint('GET /api/cities/city-paris/activities', '/api/cities/city-paris/activities');
    await assertEndpoint('GET /api/cities/city-paris/activities?category=sightseeing', '/api/cities/city-paris/activities?category=sightseeing');

    // 8. Saved Destinations
    await assertEndpoint('POST /api/saved-destinations', '/api/saved-destinations', {
      method: 'POST',
      body: JSON.stringify({ city_id: 'city-paris' })
    }, 201);

    // 9. Trips & Budget
    await assertEndpoint('GET /api/trips (List Trips)', '/api/trips');
    await assertEndpoint('GET /api/trips/trip-demo-europe-2026', '/api/trips/trip-demo-europe-2026');
    await assertEndpoint('GET /api/trips/trip-demo-europe-2026/budget', '/api/trips/trip-demo-europe-2026/budget');

    // 10. Trip Creation
    const createTripData = await assertEndpoint('POST /api/trips (Create Trip)', '/api/trips', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Autumn in Kyoto & Tokyo',
        startDate: '2026-11-01',
        endDate: '2026-11-10',
        description: 'Testing trip creation flow'
      })
    }, 201);

    const createdTripId = createTripData?.trip?.id || 'trip-demo-europe-2026';

    // 11. Stop Management
    const stopData = await assertEndpoint('POST /api/trips/:id/stops (Add Stop)', `/api/trips/${createdTripId}/stops`, {
      method: 'POST',
      body: JSON.stringify({
        cityId: 'city-tokyo',
        startDate: '2026-11-01',
        endDate: '2026-11-05',
        estStayCostPerDay: 120,
        estTransportCost: 200,
        orderIndex: 0
      })
    }, 201);

    const stopId = stopData?.stop?.id || 'stop-tokyo-01';

    // 12. Stop Update & Activity Assign
    await assertEndpoint('PUT /api/stops/:id (Update Stop)', `/api/stops/${stopId}`, {
      method: 'PUT',
      body: JSON.stringify({
        estStayCostPerDay: 135,
        estTransportCost: 210
      })
    }, 200);

    const actData = await assertEndpoint('POST /api/stops/:id/activities (Assign Activity)', `/api/stops/${stopId}/activities`, {
      method: 'POST',
      body: JSON.stringify({
        activityId: 'act-paris-1',
        scheduledDate: '2026-11-02',
        scheduledTime: '10:00 AM',
        cost: 35
      })
    }, 201);

    const actId = actData?.tripActivity?.id || 'act-sample-id';

    // 13. Stop Activity Delete & Stop Delete
    await assertEndpoint('DELETE /api/stop-activities/:id', `/api/stop-activities/${actId}`, { method: 'DELETE' });
    await assertEndpoint('DELETE /api/stops/:id', `/api/stops/${stopId}`, { method: 'DELETE' });

    // 14. Public Trip Sharing (Screen 11)
    await assertEndpoint('GET /api/public/trips/europe-grand-2026-x8f1', '/api/public/trips/europe-grand-2026-x8f1');
    await assertEndpoint('POST /api/public/trips/:slug/copy', '/api/public/trips/europe-grand-2026-x8f1/copy', {
      method: 'POST',
      body: JSON.stringify({ userId: 'demo-user-1' })
    }, 201);

    // 15. Auth - Logout
    await assertEndpoint('POST /api/auth/logout', '/api/auth/logout', { method: 'POST' });

  } finally {
    server.close();
  }

  console.log('\n------------------------------------------------------');
  console.log(`  TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('------------------------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
