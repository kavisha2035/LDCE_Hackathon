import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

function toMonthKey(date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

function buildTripTrend(trips) {
  const now = new Date();
  const buckets = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    buckets.push({
      key: toMonthKey(d),
      month: d.toLocaleString('en-GB', { month: 'short' }),
      trips: 0,
    });
  }

  const bucketMap = new Map(buckets.map((b) => [b.key, b]));
  for (const trip of trips) {
    const key = toMonthKey(new Date(trip.createdAt));
    const hit = bucketMap.get(key);
    if (hit) hit.trips += 1;
  }

  return buckets.map(({ month, trips }) => ({ month, trips }));
}

async function requireAdmin(req, res, next) {
  try {
    let user = null;
    try {
      user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { id: true, isAdmin: true, email: true },
      });
    } catch (err) {
      user = null;
    }

    // Preserve demo behavior if DB is temporarily unavailable.
    const isAdminByEmail = (req.user?.email || '').toLowerCase().includes('admin');
    const isAdmin = Boolean(user?.isAdmin) || (!user && isAdminByEmail);

    if (!isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Admin access is required for this resource.',
      });
    }

    return next();
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}

router.get('/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [
      usersRaw,
      cities,
      activitiesRaw,
      languageBreakdownRaw,
      trips,
      topCityStopCounts,
    ] = await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          isAdmin: true,
          createdAt: true,
          _count: { select: { trips: true } },
        },
      }),
      prisma.city.findMany({
        orderBy: { popularity: 'desc' },
        include: { _count: { select: { activities: true } } },
      }),
      prisma.activity.findMany({
        include: {
          city: { select: { name: true } },
          _count: { select: { tripActivities: true } },
        },
      }),
      prisma.user.groupBy({
        by: ['languagePref'],
        _count: { _all: true },
      }),
      prisma.trip.findMany({
        select: { createdAt: true },
      }),
      prisma.stop.groupBy({
        by: ['cityId'],
        _count: { cityId: true },
        orderBy: { _count: { cityId: 'desc' } },
        take: 5,
      }),
    ]);

    const users = usersRaw.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      avatar: u.avatar,
      joinDate: u.createdAt,
      totalTrips: u._count.trips,
      status: u._count.trips > 0 ? 'active' : 'inactive',
      isAdmin: u.isAdmin,
    }));

    const activities = activitiesRaw
      .map((a) => ({
        id: a.id,
        name: a.name,
        cityName: a.city?.name || 'Unknown',
        category: a.category,
        cost: a.cost,
        durationHours: a.durationHours,
        tripCount: a._count.tripActivities,
        imageUrl: a.imageUrl,
        description: a.description,
      }))
      .sort((a, b) => b.tripCount - a.tripCount || a.name.localeCompare(b.name));

    const totalUsers = users.length;
    const langPrefs = totalUsers
      ? languageBreakdownRaw
          .map((item) => {
            const count = item._count._all || 0;
            const label = item.languagePref ? String(item.languagePref).toUpperCase() : 'OTHER';
            return {
              name: label,
              value: Math.round((count / totalUsers) * 100),
              count,
            };
          })
          .sort((a, b) => b.count - a.count)
          .map(({ name, value }) => ({ name, value }))
      : [];

    const cityIds = topCityStopCounts.map((c) => c.cityId);
    const topCitiesRaw = cityIds.length
      ? await prisma.city.findMany({
          where: { id: { in: cityIds } },
          select: { id: true, name: true },
        })
      : [];
    const cityNameById = new Map(topCitiesRaw.map((c) => [c.id, c.name]));

    const topCities = topCityStopCounts.map((item) => ({
      city: cityNameById.get(item.cityId) || 'Unknown',
      visits: item._count.cityId,
    }));

    return res.status(200).json({
      users,
      cities,
      activities,
      analytics: {
        langPrefs,
        tripTrends: buildTripTrend(trips),
        topCities,
      },
    });
  } catch (error) {
    console.error('Admin dashboard aggregation failed:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to load admin dashboard data.',
    });
  }
});

export default router;