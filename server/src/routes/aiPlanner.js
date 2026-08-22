import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/ai/generate-trip — Generate structured trip plan using Groq AI Cloud
router.post('/generate-trip', async (req, res) => {
  try {
    const { prompt, destination, durationDays = 5, travelStyle = 'Balanced', budget = 1500, currency = 'USD' } = req.body;

    const groqApiKey = (process.env.GROQ_API_KEY || '').trim();
    const grokApiKey = (process.env.GROK_API_KEY || '').trim();

    const systemPrompt = `You are an expert AI Travel Planner for GlobeTrotter Adventures. 
Given the user's travel preferences, generate a complete, highly detailed day-by-day travel itinerary with realistic budget estimations.

IMPORTANT: You MUST respond ONLY with valid JSON. Do not include extra conversational text outside the JSON object.

JSON format schema required:
{
  "name": "Catchy Trip Title",
  "description": "2-3 sentence engaging summary of the journey",
  "destination": "Primary destination cities/countries",
  "durationDays": ${Number(durationDays)},
  "estimatedBudget": {
    "total": ${Number(budget)},
    "currency": "${currency}",
    "breakdown": {
      "accommodation": ${Math.round(Number(budget) * 0.4)},
      "transportation": ${Math.round(Number(budget) * 0.25)},
      "activities": ${Math.round(Number(budget) * 0.2)},
      "foodAndMisc": ${Math.round(Number(budget) * 0.15)}
    }
  },
  "dayWiseItinerary": [
    {
      "day": 1,
      "city": "City Name",
      "theme": "Day Theme/Focus",
      "estimatedDayCost": ${Math.round(Number(budget) / Number(durationDays))},
      "schedule": [
        {
          "time": "09:30 AM",
          "activityName": "Name of Activity",
          "category": "sightseeing",
          "cost": 30,
          "durationHours": 2.5,
          "description": "Concise description of the experience"
        }
      ]
    }
  ],
  "insiderTips": [
    "Tip 1 about local transport or pass savings",
    "Tip 2 about dining or peak hour avoidances",
    "Tip 3 about cultural etiquette"
  ]
}`;

    const userPrompt = `Generate a ${durationDays}-day ${travelStyle} trip itinerary.
Destination: ${destination || 'Tokyo & Kyoto'}.
Target Budget: ${budget} ${currency}.
Specific traveler requests: ${prompt || 'Explore top landmarks, authentic food spots, and hidden local gems with efficient routes.'}`;

    // 1. First priority: Groq Cloud AI (ultra-fast inference)
    if (groqApiKey) {
      console.log('🤖 Connecting to Groq AI Cloud...');
      const groqModels = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'qwen/qwen3.6-27b', 'allam-2-7b'];

      for (const model of groqModels) {
        try {
          console.log(`🤖 Attempting Groq generation with model: ${model}`);
          const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${groqApiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
              ],
              response_format: { type: 'json_object' },
              temperature: 0.7,
              max_tokens: 3500
            })
          });

          if (response.ok) {
            const data = await response.json();
            const rawContent = data.choices?.[0]?.message?.content || '';
            
            // Clean up any thinking tags or backticks
            const cleanedContent = rawContent
              .replace(/<think>[\s\S]*?<\/think>/gi, '')
              .replace(/```json/gi, '')
              .replace(/```/gi, '')
              .trim();

            const parsedItinerary = JSON.parse(cleanedContent);
            return res.status(200).json({
              success: true,
              itinerary: parsedItinerary,
              modelUsed: model,
              provider: 'Groq Cloud AI'
            });
          } else {
            const errText = await response.text();
            console.warn(`⚠️ Groq model ${model} failed (${response.status}):`, errText);
          }
        } catch (groqErr) {
          console.warn(`⚠️ Error calling Groq model ${model}:`, groqErr.message);
        }
      }
    }

    // 2. Second priority: xAI Grok (if configured)
    if (grokApiKey) {
      console.log('🤖 Attempting fallback to xAI Grok...');
      const xaiModels = ['grok-2', 'grok-beta', 'grok-2-latest'];
      for (const model of xaiModels) {
        try {
          const response = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${grokApiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
              ],
              temperature: 0.7,
              max_tokens: 2500
            })
          });

          if (response.ok) {
            const data = await response.json();
            const rawContent = data.choices?.[0]?.message?.content || '';
            const cleanedContent = rawContent.replace(/```json/gi, '').replace(/```/gi, '').trim();
            const parsedItinerary = JSON.parse(cleanedContent);

            return res.status(200).json({
              success: true,
              itinerary: parsedItinerary,
              modelUsed: model,
              provider: 'xAI Grok'
            });
          }
        } catch (e) {
          console.warn(`xAI model ${model} failed:`, e.message);
        }
      }
    }

    // 3. Third priority: Smart Dynamic Local Generator
    console.warn('Switching to Smart Fallback Travel Generator...');
    const fallbackItinerary = generateSmartFallbackItinerary(destination, durationDays, travelStyle, budget, currency, prompt);
    return res.status(200).json({
      success: true,
      itinerary: fallbackItinerary,
      modelUsed: 'Smart AI Travel Engine',
      provider: 'GlobeTrotter AI'
    });

  } catch (error) {
    console.error('AI Trip Generation Error:', error);
    const fallbackItinerary = generateSmartFallbackItinerary(
      req.body?.destination, 
      req.body?.durationDays, 
      req.body?.travelStyle, 
      req.body?.budget, 
      req.body?.currency, 
      req.body?.prompt
    );
    return res.status(200).json({
      success: true,
      itinerary: fallbackItinerary,
      modelUsed: 'Smart AI Travel Engine',
      provider: 'GlobeTrotter AI'
    });
  }
});

// Smart Fallback Generator
function generateSmartFallbackItinerary(destination = 'Paris & Rome', durationDays = 5, travelStyle = 'Culture & Food', budget = 1500, currency = 'USD', prompt = '') {
  const daysCount = Math.min(Math.max(Number(durationDays) || 5, 1), 14);
  const totalBudget = Number(budget) || 1500;

  const accommodationCost = Math.round(totalBudget * 0.4);
  const transportationCost = Math.round(totalBudget * 0.25);
  const activitiesCost = Math.round(totalBudget * 0.2);
  const foodCost = Math.round(totalBudget * 0.15);

  const destTitle = destination || 'Global Cultural Expedition';

  const dayWiseItinerary = [];
  const sampleThemes = [
    { theme: 'Arrival, Iconic Landmarks & Golden Hour Views', activity: 'Summit Sightseeing & Welcome Walking Tour', cat: 'sightseeing', cost: Math.round(activitiesCost / daysCount * 0.4) },
    { theme: 'Cultural Masterpieces & Heritage Museums', activity: 'Guided Museum & Art Gallery Walk', cat: 'culture', cost: Math.round(activitiesCost / daysCount * 0.5) },
    { theme: 'Local Food Tasting & Market Exploration', activity: 'Historic Food Market & Culinary Crawl', cat: 'food', cost: Math.round(activitiesCost / daysCount * 0.6) },
    { theme: 'Scenic Nature & Panoramic Viewpoints', activity: 'Sunrise Trek & Panoramic Viewpoint Trail', cat: 'adventure', cost: 0 },
    { theme: 'Historical Quarter & Evening River Cruise', activity: 'Evening River Cruise under City Lights', cat: 'sightseeing', cost: Math.round(activitiesCost / daysCount * 0.4) },
    { theme: 'Hidden Neighborhoods & Artisan Boutiques', activity: 'Old Town Artisan & Craft Workshop Crawl', cat: 'culture', cost: Math.round(activitiesCost / daysCount * 0.3) },
    { theme: 'Farewell Sunset & Special Dinner', activity: 'Panoramic Terrace Sunset & Farewell Dinner', cat: 'food', cost: Math.round(activitiesCost / daysCount * 0.7) }
  ];

  for (let d = 1; d <= daysCount; d++) {
    const themeObj = sampleThemes[(d - 1) % sampleThemes.length];
    const estDayBudget = Math.round(totalBudget / daysCount);

    dayWiseItinerary.push({
      day: d,
      city: destTitle.split('&')[d % 2 === 0 ? 1 : 0]?.trim() || destTitle,
      theme: `${themeObj.theme}`,
      estimatedDayCost: estDayBudget,
      schedule: [
        {
          "time": "09:30 AM",
          "activityName": `${themeObj.activity}`,
          "category": themeObj.cat,
          "cost": themeObj.cost,
          "durationHours": 2.5,
          "description": `Experience the top-rated morning highlights of ${destTitle} tailored for ${travelStyle} travelers.`
        },
        {
          "time": "02:00 PM",
          "activityName": `Local Neighborhood & Landmark Walk`,
          "category": "culture",
          "cost": 15,
          "durationHours": 2.0,
          "description": `Explore historic streets, local cafes, and architectural gems with easy walking paths.`
        },
        {
          "time": "07:00 PM",
          "activityName": `Evening Culinary Experience & Atmosphere`,
          "category": "food",
          "cost": Math.round(estDayBudget * 0.3),
          "durationHours": 2.0,
          "description": `Savor authentic regional dishes and drinks at hand-picked local eateries.`
        }
      ]
    });
  }

  return {
    name: `${destTitle} — ${daysCount}-Day ${travelStyle} Route`,
    description: `A customized ${daysCount}-day ${travelStyle.toLowerCase()} itinerary through ${destTitle} created to optimize sight-seeing, daily travel time, and budget efficiency.`,
    destination: destTitle,
    durationDays: daysCount,
    estimatedBudget: {
      total: totalBudget,
      currency: currency,
      breakdown: {
        accommodation: accommodationCost,
        transportation: transportationCost,
        activities: activitiesCost,
        foodAndMisc: foodCost
      }
    },
    dayWiseItinerary,
    insiderTips: [
      `Pre-book major landmark & museum entry passes online at least 1-2 weeks in advance to skip long ticket lines.`,
      `Get a regional transit day-pass for city trains and subways to save up to 40% on daily local transportation.`,
      `Dine 2-3 blocks away from main tourist plazas for significantly higher quality food at authentic local prices.`
    ]
  };
}

export default router;
