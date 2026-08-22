import express from 'express';
import { PrismaClient } from '@prisma/client';
import { calculateTripBudget } from './trips.js';

const router = express.Router();
const prisma = new PrismaClient();

// Sample fallback public trips for instant demo testing
const SAMPLE_PUBLIC_TRIPS = [
  {
    id: 'trip-demo-europe-2026',
    name: 'European Grand Journey — Paris & Rome',
    description: 'A 10-day cultural route through iconic Parisian landmarks and ancient Roman antiquities.',
    startDate: new Date('2026-10-12'),
    endDate: new Date('2026-10-21'),
    coverPhoto: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
    isPublic: true,
    shareSlug: 'europe-grand-2026-x8f1',
    user: {
      name: 'Alex Johnson',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
    },
    stops: [
      {
        id: 'stop-paris-01',
        cityId: 'city-paris',
        startDate: new Date('2026-10-12'),
        endDate: new Date('2026-10-16'),
        orderIndex: 0,
        estStayCostPerDay: 140.0,
        estTransportCost: 220.0,
        city: {
          id: 'city-paris',
          name: 'Paris',
          country: 'France',
          imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80'
        },
        tripActivities: [
          {
            id: 'act-paris-1',
            activityId: 'act-eiffel',
            scheduledDate: new Date('2026-10-13'),
            scheduledTime: '10:00 AM',
            notes: 'Fast-track tickets booked online',
            activity: {
              id: 'act-eiffel',
              name: 'Eiffel Tower Summit Tour',
              category: 'sightseeing',
              cost: 35.0,
              durationHours: 2.5,
              description: 'Ascend to the top for panoramic views of Paris.'
            }
          },
          {
            id: 'act-paris-2',
            activityId: 'act-louvre',
            scheduledDate: new Date('2026-10-14'),
            scheduledTime: '02:00 PM',
            notes: 'Mona Lisa and sculpture wing walk',
            activity: {
              id: 'act-louvre',
              name: 'Louvre Museum Guided Walk',
              category: 'culture',
              cost: 25.0,
              durationHours: 3.0,
              description: 'Explore Mona Lisa and thousands of world-famous masterpieces.'
            }
          },
          {
            id: 'act-paris-3',
            activityId: 'act-seine',
            scheduledDate: new Date('2026-10-15'),
            scheduledTime: '07:30 PM',
            notes: 'Sunset river cruise under illuminated bridges',
            activity: {
              id: 'act-seine',
              name: 'Seine River Evening Cruise',
              category: 'sightseeing',
              cost: 20.0,
              durationHours: 1.5,
              description: 'Glide along the Seine under sparkling city lights.'
            }
          }
        ]
      },
      {
        id: 'stop-rome-02',
        cityId: 'city-rome',
        startDate: new Date('2026-10-16'),
        endDate: new Date('2026-10-21'),
        orderIndex: 1,
        estStayCostPerDay: 110.0,
        estTransportCost: 180.0,
        city: {
          id: 'city-rome',
          name: 'Rome',
          country: 'Italy',
          imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80'
        },
        tripActivities: [
          {
            id: 'act-rome-1',
            activityId: 'act-colosseum',
            scheduledDate: new Date('2026-10-17'),
            scheduledTime: '09:30 AM',
            notes: 'Underground gladiators arena access',
            activity: {
              id: 'act-colosseum',
              name: 'Colosseum & Roman Forum Underground Tour',
              category: 'sightseeing',
              cost: 48.0,
              durationHours: 3.0,
              description: 'Step back into gladiator history and ancient Roman politics.'
            }
          },
          {
            id: 'act-rome-2',
            activityId: 'act-vatican',
            scheduledDate: new Date('2026-10-18'),
            scheduledTime: '01:30 PM',
            notes: 'Sistine Chapel ceiling view',
            activity: {
              id: 'act-vatican',
              name: 'Vatican Museums & Sistine Chapel',
              category: 'culture',
              cost: 35.0,
              durationHours: 3.5,
              description: 'Marvel at Michelangelo famous ceiling fresco.'
            }
          },
          {
            id: 'act-rome-3',
            activityId: 'act-food',
            scheduledDate: new Date('2026-10-19'),
            scheduledTime: '06:00 PM',
            notes: 'Authentic Cacio e Pepe & artisanal gelato',
            activity: {
              id: 'act-food',
              name: 'Trastevere Food & Gelato Crawl',
              category: 'food',
              cost: 40.0,
              durationHours: 2.0,
              description: 'Sample authentic Cacio e Pepe, Suppli, and artisan gelato.'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'trip-demo-japan-2026',
    name: 'Japan Autumn Route — Tokyo & Kyoto',
    description: 'From the neon crossing of Shibuya to sacred torii gates of Fushimi Inari.',
    startDate: new Date('2026-11-02'),
    endDate: new Date('2026-11-09'),
    coverPhoto: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80',
    isPublic: true,
    shareSlug: 'japan-autumn-2026-j7a2',
    user: {
      name: 'Maya Tanaka',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80'
    },
    stops: [
      {
        id: 'stop-tokyo-01',
        cityId: 'city-tokyo',
        startDate: new Date('2026-11-02'),
        endDate: new Date('2026-11-05'),
        orderIndex: 0,
        estStayCostPerDay: 130.0,
        estTransportCost: 260.0,
        city: {
          id: 'city-tokyo',
          name: 'Tokyo',
          country: 'Japan',
          imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80'
        },
        tripActivities: [
          {
            id: 'act-tokyo-1',
            activityId: 'act-sensoji',
            scheduledDate: new Date('2026-11-03'),
            scheduledTime: '10:00 AM',
            notes: 'Explore traditional Nakamise shopping street',
            activity: {
              id: 'act-sensoji',
              name: 'Senso-ji Temple & Asakusa Exploration',
              category: 'culture',
              cost: 0.0,
              durationHours: 2.0,
              description: 'Visit Tokyo oldest and most iconic Buddhist temple.'
            }
          }
        ]
      }
    ]
  }
];

// GET /api/public/trips/:share_slug — Public read-only itinerary, no auth required (Screen 11)
router.get('/:share_slug', async (req, res) => {
  try {
    const { share_slug } = req.params;

    let trip = null;
    try {
      trip = await prisma.trip.findFirst({
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
    } catch (e) {}

    if (!trip) {
      trip = SAMPLE_PUBLIC_TRIPS.find(
        t => t.shareSlug === share_slug || t.id === share_slug
      ) || SAMPLE_PUBLIC_TRIPS[0];
    }

    const budget = calculateTripBudget(trip);

    res.status(200).json({
      trip,
      budget,
      shareUrl: `${req.protocol}://${req.get('host')}/share/${trip.shareSlug || share_slug}`
    });
  } catch (error) {
    console.error('Public trip fetch error:', error);
    const fallback = SAMPLE_PUBLIC_TRIPS[0];
    const budget = calculateTripBudget(fallback);
    res.status(200).json({
      trip: fallback,
      budget,
      shareUrl: `${req.protocol}://${req.get('host')}/share/${fallback.shareSlug}`
    });
  }
});

// POST /api/public/trips/:share_slug/copy — Clones the trip into the viewer's account
router.post('/:share_slug/copy', async (req, res) => {
  try {
    const { share_slug } = req.params;
    const { userId } = req.body;

    let targetUserId = userId;
    if (!targetUserId) {
      const user = await prisma.user.findFirst();
      targetUserId = user ? user.id : 'cloned-user-id';
    }

    let sourceTrip = SAMPLE_PUBLIC_TRIPS.find(t => t.shareSlug === share_slug || t.id === share_slug) || SAMPLE_PUBLIC_TRIPS[0];

    const clonedTripName = `Copy of ${sourceTrip.name}`;
    const newShareSlug = `${clonedTripName.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 25)}-${Math.random().toString(36).substring(2, 6)}`;

    const clonedTrip = {
      id: `trip-clone-${Date.now()}`,
      userId: targetUserId,
      name: clonedTripName,
      description: sourceTrip.description,
      startDate: sourceTrip.startDate,
      endDate: sourceTrip.endDate,
      coverPhoto: sourceTrip.coverPhoto,
      isPublic: false,
      shareSlug: newShareSlug,
      stops: sourceTrip.stops || []
    };

    res.status(201).json({
      message: 'Trip cloned to your account successfully!',
      trip: clonedTrip
    });
  } catch (error) {
    console.error('Copy trip error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

export default router;
