import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/cities — Search and filter cities directly from database
router.get('/', async (req, res) => {
  try {
    const { search, country, region, costIndex, minCost, maxCost, sortBy } = req.query;

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (country) {
      where.country = { equals: country, mode: 'insensitive' };
    }
    if (region) {
      where.region = { equals: region, mode: 'insensitive' };
    }
    if (costIndex) {
      where.costIndex = parseInt(costIndex, 10);
    } else if (minCost || maxCost) {
      where.costIndex = {};
      if (minCost) where.costIndex.gte = parseInt(minCost, 10);
      if (maxCost) where.costIndex.lte = parseInt(maxCost, 10);
    }

    let orderBy = { popularity: 'desc' };
    if (sortBy === 'name') orderBy = { name: 'asc' };
    if (sortBy === 'costIndex') orderBy = { costIndex: 'asc' };

    const cities = await prisma.city.findMany({
      where,
      orderBy,
      include: {
        _count: { select: { activities: true } },
      },
    });

    res.status(200).json({ cities });
  } catch (error) {
    console.error('Cities fetch error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// GET /api/cities/:id — Single city with all its activities
router.get('/:id', async (req, res) => {
  try {
    const city = await prisma.city.findUnique({
      where: { id: req.params.id },
      include: {
        activities: true,
        _count: { select: { activities: true } },
      },
    });

    if (!city) {
      return res.status(404).json({ error: 'Not Found', message: 'City not found' });
    }

    res.status(200).json({ city });
  } catch (error) {
    console.error('City fetch error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// GET /api/cities/:id/activities — Activity catalog scoped to a destination
router.get('/:id/activities', async (req, res) => {
  try {
    const { category, minCost, maxCost, maxDuration, search } = req.query;

    const city = await prisma.city.findUnique({
      where: { id: req.params.id },
    });

    if (!city) {
      return res.status(404).json({ error: 'Not Found', message: 'City not found' });
    }

    const where = { cityId: city.id };

    if (category && category !== 'all') {
      where.category = { equals: category, mode: 'insensitive' };
    }
    if (minCost || maxCost) {
      where.cost = {};
      if (minCost) where.cost.gte = parseFloat(minCost);
      if (maxCost) where.cost.lte = parseFloat(maxCost);
    }
    if (maxDuration) {
      where.durationHours = { lte: parseFloat(maxDuration) };
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const activities = await prisma.activity.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    const allActivities = await prisma.activity.findMany({
      where: { cityId: city.id },
      select: { category: true },
      distinct: ['category'],
    });

    const categories = allActivities.map((a) => a.category);

    res.status(200).json({ city, activities, categories });
  } catch (error) {
    console.error('Activities fetch error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// GET /api/saved-destinations (List saved destinations for logged-in user)
router.get('/saved-destinations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const saved = await prisma.savedDestination.findMany({
      where: { userId },
      include: { city: true }
    });
    return res.status(200).json({ saved });
  } catch (error) {
    console.error('Fetch saved destinations error:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// POST /api/saved-destinations (Save destination for user)
const saveDestinationHandler = async (req, res) => {
  try {
    const { city_id, cityId, cityName, name } = req.body;
    let targetCityId = city_id || cityId;
    const targetUserId = req.user?.userId;

    if (!targetUserId) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required to save destinations.' });
    }

    const nameToLookUp = cityName || name || (typeof targetCityId === 'string' && !targetCityId.includes('-') && isNaN(Number(targetCityId)) ? targetCityId : null);

    if (nameToLookUp) {
      const foundCity = await prisma.city.findFirst({
        where: { name: { equals: nameToLookUp, mode: 'insensitive' } }
      });
      if (foundCity) {
        targetCityId = foundCity.id;
      }
    }

    if (!targetCityId) {
      return res.status(400).json({ error: 'Validation Error', message: 'Valid city_id or cityName is required.' });
    }

    const saved = await prisma.savedDestination.upsert({
      where: {
        userId_cityId: {
          userId: targetUserId,
          cityId: targetCityId
        }
      },
      update: {},
      create: {
        userId: targetUserId,
        cityId: targetCityId
      }
    });
    return res.status(201).json({ message: 'Destination saved to passport.', saved });
  } catch (error) {
    console.error('Save destination error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

// DELETE /api/saved-destinations/:cityId (Remove saved destination)
router.delete('/saved-destinations/:cityId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const rawCityId = req.params.cityId;

    let targetCityId = rawCityId;
    const foundCity = await prisma.city.findFirst({
      where: { name: { equals: rawCityId, mode: 'insensitive' } }
    });
    if (foundCity) {
      targetCityId = foundCity.id;
    }

    await prisma.savedDestination.deleteMany({
      where: {
        userId,
        OR: [
          { cityId: targetCityId },
          { cityId: rawCityId }
        ]
      }
    });

    return res.status(200).json({ message: 'Destination removed from saved list.' });
  } catch (error) {
    console.error('Delete saved destination error:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

router.post('/saved-destinations', authenticateToken, saveDestinationHandler);

export default router;
