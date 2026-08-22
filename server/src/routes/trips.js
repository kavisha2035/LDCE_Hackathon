import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Helper to compute budget strictly as per design.md Section 4
export const calculateTripBudget = (trip) => {
  if (!trip) return null;

  let stayTotal = 0;
  let transportTotal = 0;
  let activitiesTotal = 0;

  const tripStart = new Date(trip.startDate || trip.start_date);
  const tripEnd = new Date(trip.endDate || trip.end_date);
  const totalTripDays = Math.max(1, Math.ceil((tripEnd - tripStart) / (1000 * 60 * 60 * 24)) + 1);

  const stopsBreakdown = (trip.stops || []).map((stop) => {
    const start = new Date(stop.startDate || stop.start_date);
    const end = new Date(stop.endDate || stop.end_date);
    const nights = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));

    const stayCost = (stop.estStayCostPerDay || stop.est_stay_cost_per_day || 0) * nights;
    const transportCost = stop.estTransportCost || stop.est_transport_cost || 0;

    let stopActivitiesCost = 0;
    const rawActs = stop.tripActivities || stop.activities || [];
    const activitiesList = rawActs.map((ta) => {
      const actCost = ta.cost !== null && ta.cost !== undefined
        ? ta.cost
        : (ta.activity?.cost || 0);
      stopActivitiesCost += actCost;
      return {
        id: ta.id,
        activityId: ta.activityId || ta.activity_id,
        name: ta.activity?.name || ta.name || 'Activity',
        category: ta.activity?.category || ta.category || 'sightseeing',
        cost: actCost,
        durationHours: ta.activity?.durationHours || ta.duration_hours || 1,
        scheduledDate: ta.scheduledDate || ta.scheduled_date,
        scheduledTime: ta.scheduledTime || ta.scheduled_time,
        notes: ta.notes,
      };
    });

    const stopTotal = stayCost + transportCost + stopActivitiesCost;

    stayTotal += stayCost;
    transportTotal += transportCost;
    activitiesTotal += stopActivitiesCost;

    return {
      stopId: stop.id,
      cityId: stop.cityId || stop.city_id,
      cityName: stop.city?.name || 'Unknown City',
      country: stop.city?.country || '',
      startDate: stop.startDate || stop.start_date,
      endDate: stop.endDate || stop.end_date,
      nights,
      stayCost,
      estStayCostPerDay: stop.estStayCostPerDay || stop.est_stay_cost_per_day || 0,
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
    startDate: trip.startDate || trip.start_date,
    endDate: trip.endDate || trip.end_date,
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

// GET /api/trips — List only the logged-in user's trips (Screen 4)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const dbTrips = await prisma.trip.findMany({
      where: { userId },
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

    return res.status(200).json({ trips: dbTrips });
  } catch (error) {
    console.error('Fetch user trips error:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// GET /api/trips/:id — Trip detail incl. stops + activities
router.get('/:id', async (req, res) => {
  try {
    const dbTrip = await prisma.trip.findUnique({
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

    if (!dbTrip) {
      return res.status(404).json({ error: 'Not Found', message: 'Trip itinerary not found.' });
    }

    return res.status(200).json({ trip: dbTrip });
  } catch (error) {
    console.error('Fetch trip detail error:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// GET /api/trips/:id/budget — Computed cost breakdown (Screen 9)
router.get('/:id/budget', async (req, res) => {
  try {
    const trip = await prisma.trip.findUnique({
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
      return res.status(404).json({ error: 'Not Found', message: 'Trip not found.' });
    }

    const budget = calculateTripBudget(trip);
    return res.status(200).json({ budget });
  } catch (error) {
    console.error('Trip budget error:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// POST /api/trips — Create trip for logged-in user (Screen 3)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, description, startDate, endDate, coverPhoto, initialCityId, estStayCostPerDay, estTransportCost } = req.body;

    if (!name || !startDate || !endDate) {
      return res.status(400).json({ error: 'Validation Error', message: 'Name, start date, and end date are required.' });
    }

    const shareSlug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30)}-${Math.random().toString(36).substring(2, 6)}`;

    const tripData = {
      userId,
      name,
      description: description || '',
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      coverPhoto: coverPhoto || null,
      shareSlug,
    };

    if (initialCityId) {
      tripData.stops = {
        create: [
          {
            cityId: initialCityId,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            orderIndex: 0,
            estStayCostPerDay: parseFloat(estStayCostPerDay || 100),
            estTransportCost: parseFloat(estTransportCost || 150)
          }
        ]
      };
    }

    const newTrip = await prisma.trip.create({
      data: tripData,
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

    return res.status(201).json({ trip: newTrip });
  } catch (error) {
    console.error('Trip create error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// PUT /api/trips/:id — Update trip metadata (Ownership Protected)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, description, startDate, endDate, coverPhoto, isPublic } = req.body;

    // Verify ownership
    const existing = await prisma.trip.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Not Found', message: 'Trip not found.' });
    }
    if (existing.userId !== userId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Forbidden', message: 'You do not have permission to modify this trip.' });
    }

    const updated = await prisma.trip.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(coverPhoto !== undefined && { coverPhoto }),
        ...(isPublic !== undefined && { isPublic }),
      },
      include: {
        stops: {
          include: { city: true, tripActivities: { include: { activity: true } } }
        }
      }
    });

    return res.status(200).json({ trip: updated });
  } catch (error) {
    console.error('Update trip error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// DELETE /api/trips/:id — Delete trip (Ownership Protected)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const existing = await prisma.trip.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Not Found', message: 'Trip not found.' });
    }
    if (existing.userId !== userId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Forbidden', message: 'You do not have permission to delete this trip.' });
    }

    await prisma.trip.delete({
      where: { id: req.params.id }
    });

    return res.status(200).json({ message: 'Trip deleted successfully', id: req.params.id });
  } catch (error) {
    console.error('Delete trip error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// PATCH /api/trips/:id/share — Share toggle (Ownership Protected)
router.patch('/:id/share', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { isPublic = true } = req.body;

    const trip = await prisma.trip.findUnique({ where: { id: req.params.id } });
    if (!trip) {
      return res.status(404).json({ error: 'Not Found', message: 'Trip not found.' });
    }
    if (trip.userId !== userId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Forbidden', message: 'You do not have permission to share this trip.' });
    }

    let shareSlug = trip.shareSlug;
    if (!shareSlug) {
      shareSlug = `${trip.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30)}-${Math.random().toString(36).substring(2, 6)}`;
    }

    const updated = await prisma.trip.update({
      where: { id: req.params.id },
      data: {
        isPublic,
        shareSlug
      }
    });

    return res.status(200).json({
      trip: updated,
      isPublic: updated.isPublic,
      shareSlug: updated.shareSlug,
      shareUrl: `/share/${updated.shareSlug}`
    });
  } catch (error) {
    console.error('Share trip error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// POST /api/trips/:id/stops — Add stop (Ownership Protected)
router.post('/:id/stops', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { cityId, startDate, endDate, estStayCostPerDay, estTransportCost, orderIndex } = req.body;

    const trip = await prisma.trip.findUnique({ where: { id: req.params.id } });
    if (!trip) {
      return res.status(404).json({ error: 'Not Found', message: 'Trip not found.' });
    }
    if (trip.userId !== userId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Forbidden', message: 'You do not have permission to add stops to this trip.' });
    }

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

    return res.status(201).json({ stop });
  } catch (error) {
    console.error('Add stop error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// Handler for updating a stop (Ownership Protected)
export const updateStopHandler = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { startDate, endDate, estStayCostPerDay, estTransportCost, orderIndex } = req.body;

    const existingStop = await prisma.stop.findUnique({
      where: { id: req.params.id },
      include: { trip: true }
    });

    if (!existingStop) {
      return res.status(404).json({ error: 'Not Found', message: 'Stop not found.' });
    }
    if (existingStop.trip.userId !== userId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Forbidden', message: 'You do not have permission to modify this stop.' });
    }

    const updated = await prisma.stop.update({
      where: { id: req.params.id },
      data: {
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(estStayCostPerDay !== undefined && { estStayCostPerDay: parseFloat(estStayCostPerDay) }),
        ...(estTransportCost !== undefined && { estTransportCost: parseFloat(estTransportCost) }),
        ...(orderIndex !== undefined && { orderIndex: parseInt(orderIndex, 10) }),
      },
      include: {
        city: true,
        tripActivities: { include: { activity: true } }
      }
    });

    return res.status(200).json({ stop: updated });
  } catch (error) {
    console.error('Update stop error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

// Handler for deleting a stop (Ownership Protected)
export const deleteStopHandler = async (req, res) => {
  try {
    const userId = req.user.userId;

    const existingStop = await prisma.stop.findUnique({
      where: { id: req.params.id },
      include: { trip: true }
    });

    if (!existingStop) {
      return res.status(404).json({ error: 'Not Found', message: 'Stop not found.' });
    }
    if (existingStop.trip.userId !== userId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Forbidden', message: 'You do not have permission to delete this stop.' });
    }

    await prisma.stop.delete({
      where: { id: req.params.id }
    });

    return res.status(200).json({ message: 'Stop deleted successfully', id: req.params.id });
  } catch (error) {
    console.error('Delete stop error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

// Handler for adding activity to stop (Ownership Protected)
export const addStopActivityHandler = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { activityId, scheduledDate, scheduledTime, notes, cost, name, category } = req.body;
    const stopId = req.params.id;

    if (!activityId && !name) {
      return res.status(400).json({ error: 'Validation Error', message: 'activityId or name is required.' });
    }

    const targetStop = await prisma.stop.findUnique({
      where: { id: stopId },
      include: { trip: true }
    });

    if (!targetStop) {
      return res.status(404).json({ error: 'Not Found', message: 'Destination stop not found.' });
    }
    if (targetStop.trip.userId !== userId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Forbidden', message: 'You do not have permission to add activities to this trip.' });
    }

    // Resolve or find activity
    let targetActivity = null;
    if (activityId) {
      targetActivity = await prisma.activity.findUnique({ where: { id: activityId } }).catch(() => null);
      if (!targetActivity) {
        targetActivity = await prisma.activity.findFirst({
          where: {
            OR: [
              { id: activityId },
              { name: { contains: (name || activityId).replace(/^act-/, ''), mode: 'insensitive' } }
            ]
          }
        }).catch(() => null);
      }
    }

    if (!targetActivity) {
      targetActivity = await prisma.activity.create({
        data: {
          cityId: targetStop.cityId,
          name: name || `Activity ${activityId || 'Excursion'}`,
          category: category || 'sightseeing',
          cost: cost !== undefined ? parseFloat(cost) : 25.0,
          durationHours: 2.0,
          description: notes || 'Scheduled journey activity.'
        }
      });
    }

    const assigned = await prisma.tripActivity.create({
      data: {
        stopId: stopId,
        activityId: targetActivity.id,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        scheduledTime: scheduledTime || '10:00 AM',
        notes: notes || '',
      },
      include: {
        activity: true
      }
    });

    return res.status(201).json({ tripActivity: assigned });
  } catch (error) {
    console.error('Assign activity error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

// Handler for removing activity from stop (Ownership Protected)
export const removeStopActivityHandler = async (req, res) => {
  try {
    const userId = req.user.userId;
    const actId = req.params.id;

    const existing = await prisma.tripActivity.findUnique({
      where: { id: actId },
      include: { stop: { include: { trip: true } } }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Not Found', message: 'Activity not found on stop.' });
    }
    if (existing.stop.trip.userId !== userId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Forbidden', message: 'You do not have permission to remove activities from this trip.' });
    }

    await prisma.tripActivity.delete({
      where: { id: actId }
    });

    return res.status(200).json({ message: 'Activity removed from stop successfully', id: actId });
  } catch (error) {
    console.error('Remove stop activity error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

// Alias for removeStopActivityHandler
export const deleteStopActivityHandler = removeStopActivityHandler;

// POST /api/trips/:id/activities — add activity directly to a trip's active stop
router.post('/:id/activities', authenticateToken, addStopActivityHandler);

export default router;
