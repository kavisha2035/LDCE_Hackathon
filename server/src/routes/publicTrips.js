import express from 'express';
import { PrismaClient } from '@prisma/client';
import { calculateTripBudget } from './trips.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/public/trips/:share_slug — Public read-only itinerary, no auth required (Screen 11)
router.get('/:share_slug', async (req, res) => {
  try {
    const { share_slug } = req.params;

    const trip = await prisma.trip.findFirst({
      where: {
        OR: [
          { shareSlug: share_slug },
          { id: share_slug }
        ]
      },
      include: {
        user: {
          select: { name: true, avatar: true }
        },
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
      return res.status(404).json({ error: 'Not Found', message: 'Public itinerary not found.' });
    }

    const budget = calculateTripBudget(trip);

    res.status(200).json({
      trip,
      budget,
      shareUrl: `${req.protocol}://${req.get('host')}/share/${trip.shareSlug || share_slug}`
    });
  } catch (error) {
    console.error('Public trip fetch error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// POST /api/public/trips/:share_slug/copy — Clones the public trip into the authenticated user's account
router.post('/:share_slug/copy', authenticateToken, async (req, res) => {
  try {
    const { share_slug } = req.params;
    const targetUserId = req.user.userId;

    const sourceTrip = await prisma.trip.findFirst({
      where: {
        OR: [
          { shareSlug: share_slug },
          { id: share_slug }
        ]
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

    if (!sourceTrip) {
      return res.status(404).json({ error: 'Not Found', message: 'Source itinerary not found to clone.' });
    }

    const clonedTripName = `Copy of ${sourceTrip.name}`;
    const newShareSlug = `${clonedTripName.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 25)}-${Math.random().toString(36).substring(2, 6)}`;

    // Create cloned trip with nested stops and activities in database
    const cloned = await prisma.trip.create({
      data: {
        userId: targetUserId,
        name: clonedTripName,
        description: sourceTrip.description,
        startDate: new Date(sourceTrip.startDate || sourceTrip.start_date || new Date()),
        endDate: new Date(sourceTrip.endDate || sourceTrip.end_date || new Date(Date.now() + 7 * 86400000)),
        coverPhoto: sourceTrip.coverPhoto || sourceTrip.cover_photo_url,
        isPublic: false,
        shareSlug: newShareSlug,
        stops: {
          create: (sourceTrip.stops || []).map((s, idx) => ({
            cityId: s.cityId || s.city_id,
            startDate: new Date(s.startDate || s.start_date || new Date()),
            endDate: new Date(s.endDate || s.end_date || new Date()),
            orderIndex: s.orderIndex !== undefined ? s.orderIndex : idx,
            estStayCostPerDay: parseFloat(s.estStayCostPerDay || s.est_stay_cost_per_day || 0),
            estTransportCost: parseFloat(s.estTransportCost || s.est_transport_cost || 0),
            tripActivities: {
              create: (s.tripActivities || s.activities || []).map(ta => ({
                activityId: ta.activityId || ta.activity_id || ta.id,
                scheduledDate: ta.scheduledDate || ta.scheduled_date ? new Date(ta.scheduledDate || ta.scheduled_date) : null,
                scheduledTime: ta.scheduledTime || ta.scheduled_time || '10:00 AM',
                notes: ta.notes || ''
              }))
            }
          }))
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

    res.status(201).json({
      message: 'Trip cloned to your account successfully!',
      trip: cloned
    });
  } catch (error) {
    console.error('Copy trip error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

export default router;
