import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/cities — Search cities with optional filters
// Query params: search, country, minCost, maxCost, sortBy (popularity|name|costIndex)
router.get('/', async (req, res) => {
  try {
    const { search, country, minCost, maxCost, sortBy } = req.query;

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

    if (minCost || maxCost) {
      where.costIndex = {};
      if (minCost) where.costIndex.gte = parseFloat(minCost);
      if (maxCost) where.costIndex.lte = parseFloat(maxCost);
    }

    // Determine sort order
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
      return res.status(404).json({ error: 'Not Found', message: 'City not found.' });
    }

    res.status(200).json({ city });
  } catch (error) {
    console.error('City fetch error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// GET /api/cities/:id/activities — Activities for a city, filterable
// Query params: category, minCost, maxCost, maxDuration, search
router.get('/:id/activities', async (req, res) => {
  try {
    const { category, minCost, maxCost, maxDuration, search } = req.query;

    // Verify city exists
    const city = await prisma.city.findUnique({
      where: { id: req.params.id },
      select: { id: true, name: true, country: true, imageUrl: true },
    });

    if (!city) {
      return res.status(404).json({ error: 'Not Found', message: 'City not found.' });
    }

    const where = { cityId: req.params.id };

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
      where.name = { contains: search, mode: 'insensitive' };
    }

    const activities = await prisma.activity.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    // Get distinct categories for this city (for filter dropdowns)
    const allActivities = await prisma.activity.findMany({
      where: { cityId: req.params.id },
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

export default router;
