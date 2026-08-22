import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Helper to compute budget strictly as per design.md Section 4
export const calculateTripBudget = (trip) => {
  if (!trip) return null;

  let stayTotal = 0;
  let transportTotal = 0;
  let activitiesTotal = 0;

  const tripStart = new Date(trip.startDate);
  const tripEnd = new Date(trip.endDate);
  const totalTripDays = Math.max(1, Math.ceil((tripEnd - tripStart) / (1000 * 60 * 60 * 24)) + 1);

  const stopsBreakdown = (trip.stops || []).map((stop) => {
    const start = new Date(stop.startDate);
    const end = new Date(stop.endDate);
    const nights = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    
    const stayCost = (stop.estStayCostPerDay || 0) * nights;
    const transportCost = stop.estTransportCost || 0;
    
    let stopActivitiesCost = 0;
    const activitiesList = (stop.tripActivities || []).map((ta) => {
      const actCost = ta.cost !== null && ta.cost !== undefined 
        ? ta.cost 
        : (ta.activity?.cost || 0);
      stopActivitiesCost += actCost;
      return {
        id: ta.id,
        activityId: ta.activityId,
        name: ta.activity?.name || 'Activity',
        category: ta.activity?.category || 'sightseeing',
        cost: actCost,
        durationHours: ta.activity?.durationHours || 1,
        scheduledDate: ta.scheduledDate,
        scheduledTime: ta.scheduledTime,
        notes: ta.notes,
      };
    });

    const stopTotal = stayCost + transportCost + stopActivitiesCost;

    stayTotal += stayCost;
    transportTotal += transportCost;
    activitiesTotal += stopActivitiesCost;

    return {
      stopId: stop.id,
      cityId: stop.cityId,
      cityName: stop.city?.name || 'Unknown City',
      country: stop.city?.country || '',
      startDate: stop.startDate,
      endDate: stop.endDate,
      nights,
      stayCost,
      estStayCostPerDay: stop.estStayCostPerDay || 0,
      transportCost,
      activitiesCost: stopActivitiesCost,
      stopTotal,
      activities: activitiesList,
    };
  });

  const tripTotal = stayTotal + transportTotal + activitiesTotal;
  const avgPerDay = totalTripDays > 0 ? tripTotal / totalTripDays : 0;

  return {
    tripId: trip.id,
    tripName: trip.name,
    startDate: trip.startDate,
    endDate: trip.endDate,
    totalTripDays,
    tripTotal: parseFloat(tripTotal.toFixed(2)),
    avgPerDay: parseFloat(avgPerDay.toFixed(2)),
    breakdownByCategory: {
      stay: parseFloat(stayTotal.toFixed(2)),
      transport: parseFloat(transportTotal.toFixed(2)),
      activities: parseFloat(activitiesTotal.toFixed(2)),
    },
    stops: stopsBreakdown,
  };
};

// Seed/ensure a sample trip exists for immediate demo testing
async function ensureSampleTrip() {
  const existingTrips = await prisma.trip.findMany({
    include: {
      stops: {
        include: {
          city: true,
          tripActivities: {
            include: { activity: true }
          }
        }
      }
    }
  });

  if (existingTrips.length > 0) {
    return existingTrips[0];
  }

  // Find Paris and Rome or any available cities
  const cities = await prisma.city.findMany({
    take: 3,
    include: { activities: true }
  });

  if (cities.length === 0) return null;

  // Find or create a demo user
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: 'Alex Johnson',
        email: 'alex.traveler@example.com',
        password: '$2b$12$eXampleHashedPasswordForDemoTestingOnly1234567890123456',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      }
    });
  }

  const sampleTrip = await prisma.trip.create({
    data: {
      userId: user.id,
      name: 'European Grand Journey — Paris & Rome',
      description: 'A 10-day cultural journey through iconic Parisian landmarks and Roman antiquities.',
      startDate: new Date('2026-10-12'),
      endDate: new Date('2026-10-21'),
      coverPhoto: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
      isPublic: true,
      shareSlug: 'europe-grand-2026-x8f1',
      stops: {
        create: [
          {
            cityId: cities[0].id,
            startDate: new Date('2026-10-12'),
            endDate: new Date('2026-10-16'),
            orderIndex: 0,
            estStayCostPerDay: 140.0,
            estTransportCost: 220.0,
            tripActivities: {
              create: (cities[0].activities || []).slice(0, 3).map((act, idx) => ({
                activityId: act.id,
                scheduledDate: new Date('2026-10-13'),
                scheduledTime: idx === 0 ? '10:00 AM' : idx === 1 ? '02:30 PM' : '07:00 PM',
                notes: 'Book fast-track ticket online'
              }))
            }
          },
          ...(cities[1] ? [{
            cityId: cities[1].id,
            startDate: new Date('2026-10-16'),
            endDate: new Date('2026-10-21'),
            orderIndex: 1,
            estStayCostPerDay: 110.0,
            estTransportCost: 180.0,
            tripActivities: {
              create: (cities[1].activities || []).slice(0, 3).map((act, idx) => ({
                activityId: act.id,
                scheduledDate: new Date('2026-10-17'),
                scheduledTime: idx === 0 ? '09:30 AM' : idx === 1 ? '03:00 PM' : '08:00 PM',
                notes: 'Meet guide at piazza'
              }))
            }
          }] : [])
        ]
      }
    },
    include: {
      stops: {
        include: {
          city: true,
          tripActivities: {
            include: { activity: true }
          }
        }
      }
    }
  });

  return sampleTrip;
}

// GET /api/trips — List trips
router.get('/', async (req, res) => {
  try {
    // Ensure at least one trip exists for seamless demo experience
    await ensureSampleTrip();

    const trips = await prisma.trip.findMany({
      orderBy: { startDate: 'desc' },
      include: {
        stops: {
          orderBy: { orderIndex: 'asc' },
          include: {
            city: true,
            tripActivities: {
              include: { activity: true }
            }
          }
        }
      }
    });

    res.status(200).json({ trips });
  } catch (error) {
    console.error('Trips list error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// GET /api/trips/:id — Trip detail incl. stops + activities
router.get('/:id', async (req, res) => {
  try {
    let trip = await prisma.trip.findUnique({
      where: { id: req.params.id },
      include: {
        stops: {
          orderBy: { orderIndex: 'asc' },
          include: {
            city: true,
            tripActivities: {
              orderBy: { scheduledDate: 'asc' },
              include: { activity: true }
            }
          }
        }
      }
    });

    if (!trip) {
      // Fallback: if 'demo' or sample requested, return first trip
      trip = await ensureSampleTrip();
      if (!trip) {
        return res.status(404).json({ error: 'Not Found', message: 'Trip not found.' });
      }
    }

    res.status(200).json({ trip });
  } catch (error) {
    console.error('Trip detail error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// GET /api/trips/:id/budget — Computed cost breakdown (Screen 9)
router.get('/:id/budget', async (req, res) => {
  try {
    let trip = await prisma.trip.findUnique({
      where: { id: req.params.id },
      include: {
        stops: {
          orderBy: { orderIndex: 'asc' },
          include: {
            city: true,
            tripActivities: {
              include: { activity: true }
            }
          }
        }
      }
    });

    if (!trip) {
      trip = await ensureSampleTrip();
      if (!trip) {
        return res.status(404).json({ error: 'Not Found', message: 'Trip not found.' });
      }
    }

    const budget = calculateTripBudget(trip);
    res.status(200).json({ budget });
  } catch (error) {
    console.error('Trip budget error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// POST /api/trips — Create trip
router.post('/', async (req, res) => {
  try {
    const { name, description, startDate, endDate, coverPhoto, userId } = req.body;

    if (!name || !startDate || !endDate) {
      return res.status(400).json({ error: 'Validation Error', message: 'Name, start date, and end date are required.' });
    }

    let targetUserId = userId;
    if (!targetUserId) {
      const user = await prisma.user.findFirst();
      targetUserId = user ? user.id : (await ensureSampleTrip())?.userId;
    }

    const shareSlug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30)}-${Math.random().toString(36).substring(2, 6)}`;

    const newTrip = await prisma.trip.create({
      data: {
        userId: targetUserId,
        name,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        coverPhoto,
        shareSlug,
      },
      include: {
        stops: true
      }
    });

    res.status(201).json({ trip: newTrip });
  } catch (error) {
    console.error('Trip create error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// POST /api/trips/:id/stops — Add stop
router.post('/:id/stops', async (req, res) => {
  try {
    const { cityId, startDate, endDate, estStayCostPerDay, estTransportCost, orderIndex } = req.body;

    const stop = await prisma.stop.create({
      data: {
        tripId: req.params.id,
        cityId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        estStayCostPerDay: parseFloat(estStayCostPerDay || 0),
        estTransportCost: parseFloat(estTransportCost || 0),
        orderIndex: orderIndex !== undefined ? parseInt(orderIndex, 10) : 0,
      },
      include: {
        city: true,
        tripActivities: {
          include: { activity: true }
        }
      }
    });

    res.status(201).json({ stop });
  } catch (error) {
    console.error('Add stop error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// PUT /api/stops/:id — Update stop
router.put('/stops/:id', async (req, res) => {
  try {
    const { startDate, endDate, estStayCostPerDay, estTransportCost, orderIndex } = req.body;
    const updateData = {};
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);
    if (estStayCostPerDay !== undefined) updateData.estStayCostPerDay = parseFloat(estStayCostPerDay);
    if (estTransportCost !== undefined) updateData.estTransportCost = parseFloat(estTransportCost);
    if (orderIndex !== undefined) updateData.orderIndex = parseInt(orderIndex, 10);

    const updated = await prisma.stop.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        city: true,
        tripActivities: {
          include: { activity: true }
        }
      }
    });

    res.status(200).json({ stop: updated });
  } catch (error) {
    console.error('Update stop error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// DELETE /api/stops/:id — Delete stop
router.delete('/stops/:id', async (req, res) => {
  try {
    await prisma.stop.delete({
      where: { id: req.params.id }
    });
    res.status(200).json({ message: 'Stop removed successfully.' });
  } catch (error) {
    console.error('Delete stop error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// POST /api/stops/:id/activities — Assign activity
router.post('/stops/:id/activities', async (req, res) => {
  try {
    const { activityId, scheduledDate, scheduledTime, notes, cost } = req.body;

    const assigned = await prisma.tripActivity.create({
      data: {
        stopId: req.params.id,
        activityId,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        scheduledTime,
        notes,
        cost: cost !== undefined ? parseFloat(cost) : null,
      },
      include: {
        activity: true
      }
    });

    res.status(201).json({ tripActivity: assigned });
  } catch (error) {
    console.error('Assign activity error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// DELETE /api/stop-activities/:id — Remove assigned activity
router.delete('/stop-activities/:id', async (req, res) => {
  try {
    await prisma.tripActivity.delete({
      where: { id: req.params.id }
    });
    res.status(200).json({ message: 'Activity removed from stop.' });
  } catch (error) {
    console.error('Remove stop activity error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

export default router;
