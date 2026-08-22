// Seed data shaped like the real Neon Postgres rows (see design.md Section 4
// and the live `cities`/`activities` tables) — Person A's /api/cities and
// /api/cities/:id/activities routes aren't built yet, so Screens 7-9 run
// against this until USE_MOCK flips off.

export const CITIES = [
  { id: 'city-1', name: 'Paris', country: 'France', region: 'Europe', cost_index: 4, popularity: 97, image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80', description: 'The City of Light — Eiffel Tower, the Louvre, and riverside cafés.' },
  { id: 'city-2', name: 'London', country: 'UK', region: 'Europe', cost_index: 5, popularity: 96, image_url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80', description: 'Historic capital with world-class museums and royal palaces.' },
  { id: 'city-3', name: 'Barcelona', country: 'Spain', region: 'Europe', cost_index: 3, popularity: 90, image_url: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=800&q=80', description: 'Gaudí architecture, Mediterranean beaches, and late-night tapas.' },
  { id: 'city-4', name: 'Lisbon', country: 'Portugal', region: 'Europe', cost_index: 2, popularity: 84, image_url: 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?auto=format&fit=crop&w=800&q=80', description: 'Hillside trams, pastel façades, and fado music at night.' },
  { id: 'city-5', name: 'Kyoto', country: 'Japan', region: 'Asia', cost_index: 3, popularity: 92, image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80', description: 'Cultural heart of Japan — temples, gardens, and geisha districts.' },
  { id: 'city-6', name: 'Tokyo', country: 'Japan', region: 'Asia', cost_index: 4, popularity: 99, image_url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80', description: 'Neon skyscrapers, ancient shrines, and unmatched food culture.' },
  { id: 'city-7', name: 'Bangkok', country: 'Thailand', region: 'Asia', cost_index: 1, popularity: 88, image_url: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80', description: 'Street food, gilded temples, and a river that never sleeps.' },
  { id: 'city-8', name: 'Bali', country: 'Indonesia', region: 'Asia', cost_index: 2, popularity: 89, image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80', description: 'Rice terraces, surf breaks, and cliffside temples.' },
  { id: 'city-9', name: 'New York', country: 'USA', region: 'North America', cost_index: 5, popularity: 95, image_url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80', description: 'The Big Apple — iconic skyline, Broadway, vibrant neighborhoods.' },
  { id: 'city-10', name: 'Mexico City', country: 'Mexico', region: 'North America', cost_index: 2, popularity: 80, image_url: 'https://images.unsplash.com/photo-1518659526054-190340b32735?auto=format&fit=crop&w=800&q=80', description: 'Ancient ruins, mural-covered streets, and a legendary food scene.' },
  { id: 'city-11', name: 'Marrakesh', country: 'Morocco', region: 'Africa', cost_index: 2, popularity: 76, image_url: 'https://images.unsplash.com/photo-1597212720158-3b1b2e5a8e0a?auto=format&fit=crop&w=800&q=80', description: 'Souks, riads, and the foothills of the Atlas Mountains.' },
  { id: 'city-12', name: 'Cape Town', country: 'South Africa', region: 'Africa', cost_index: 2, popularity: 78, image_url: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=800&q=80', description: 'Table Mountain, coastal drives, and world-class vineyards.' },
  { id: 'city-13', name: 'Buenos Aires', country: 'Argentina', region: 'South America', cost_index: 2, popularity: 71, image_url: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?auto=format&fit=crop&w=800&q=80', description: 'Tango halls, steakhouses, and grand European-style avenues.' },
  { id: 'city-14', name: 'Rio de Janeiro', country: 'Brazil', region: 'South America', cost_index: 2, popularity: 82, image_url: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=800&q=80', description: 'Beaches, Carnival energy, and Christ the Redeemer overlooking it all.' },
];

export const ACTIVITIES = [
  { id: 'act-1-1', city_id: 'city-1', name: 'Louvre Museum Guided Walk', category: 'culture', cost: 2200, duration_hours: 3, description: 'Explore the Mona Lisa and thousands of world-famous masterpieces.', image_url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=600&q=80' },
  { id: 'act-1-2', city_id: 'city-1', name: 'Montmartre Food Tour', category: 'food', cost: 3800, duration_hours: 2, description: 'Sample fresh croissants, cheeses, and wine in Montmartre.', image_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80' },
  { id: 'act-1-3', city_id: 'city-1', name: 'Seine Evening Cruise', category: 'sightseeing', cost: 2900, duration_hours: 1.5, description: 'Drift past the landmarks as the city lights come on.', image_url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=600&q=80' },
  { id: 'act-1-4', city_id: 'city-1', name: 'Le Marais Bar Hop', category: 'nightlife', cost: 2000, duration_hours: 3, description: 'Cocktail bars scattered through the old Jewish quarter.', image_url: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=600&q=80' },
  { id: 'act-5-1', city_id: 'city-5', name: 'Fushimi Inari Sunrise Hike', category: 'adventure', cost: 0, duration_hours: 2.5, description: 'Thousands of vermillion torii gates up the mountain trail.', image_url: 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?auto=format&fit=crop&w=600&q=80' },
  { id: 'act-5-2', city_id: 'city-5', name: 'Tea Ceremony Experience', category: 'culture', cost: 3200, duration_hours: 1.5, description: 'A traditional matcha ceremony led by a certified host.', image_url: 'https://images.unsplash.com/photo-1536584754829-12214d404f32?auto=format&fit=crop&w=600&q=80' },
  { id: 'act-5-3', city_id: 'city-5', name: 'Gion District Food Crawl', category: 'food', cost: 4100, duration_hours: 3, description: 'Small plates through the historic geisha district.', image_url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=600&q=80' },
  { id: 'act-9-1', city_id: 'city-9', name: 'Statue of Liberty & Ellis Island', category: 'sightseeing', cost: 2500, duration_hours: 3, description: 'Ferry ride and historic monument access.', image_url: 'https://images.unsplash.com/photo-1605130284535-11dd9eedc58a?auto=format&fit=crop&w=600&q=80' },
  { id: 'act-9-2', city_id: 'city-9', name: 'Broadway Show Night', category: 'nightlife', cost: 9800, duration_hours: 3, description: 'A front-row seat to the best of Broadway.', image_url: 'https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=600&q=80' },
  { id: 'act-9-3', city_id: 'city-9', name: 'Central Park Bike Tour', category: 'adventure', cost: 3000, duration_hours: 2, description: 'Pedal through the park\'s landmarks with a local guide.', image_url: 'https://images.unsplash.com/photo-1591491634153-8f0f8a6f5f4a?auto=format&fit=crop&w=600&q=80' },
  { id: 'act-3-1', city_id: 'city-3', name: 'Sagrada Família Skip-the-Line', category: 'sightseeing', cost: 2800, duration_hours: 2, description: 'Gaudí\'s unfinished basilica, guided entry.', image_url: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=600&q=80' },
  { id: 'act-3-2', city_id: 'city-3', name: 'Tapas & Vermouth Crawl', category: 'food', cost: 3300, duration_hours: 3, description: 'Small plates across three Gràcia bars.', image_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=600&q=80' },
  { id: 'act-3-3', city_id: 'city-3', name: 'Razzmatazz Club Night', category: 'nightlife', cost: 1600, duration_hours: 4, description: 'Five rooms, five genres, one legendary club.', image_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80' },
];

export const TRIP_ID = 'trip-1';

export const TRIP = {
  id: TRIP_ID,
  user_id: 'user-1',
  name: 'Paris & Barcelona Loop',
  description: 'A week split between two icons of Southern Europe.',
  start_date: '2026-10-12',
  end_date: '2026-10-21',
  cover_photo_url: null,
  is_public: false,
  share_slug: null,
  created_at: '2026-08-01T09:00:00.000Z',
  stops: [
    {
      id: 'stop-1',
      trip_id: TRIP_ID,
      city_id: 'city-1',
      start_date: '2026-10-12',
      end_date: '2026-10-16',
      order_index: 0,
      est_stay_cost_per_day: 8500,
      est_transport_cost: 12000,
      city: CITIES.find((c) => c.id === 'city-1'),
      activities: [
        {
          id: 'sa-1', trip_stop_id: 'stop-1', activity_id: 'act-1-1',
          scheduled_date: '2026-10-13', scheduled_time: '10:00', notes: '',
          activity: ACTIVITIES.find((a) => a.id === 'act-1-1'),
        },
        {
          id: 'sa-2', trip_stop_id: 'stop-1', activity_id: 'act-1-3',
          scheduled_date: '2026-10-13', scheduled_time: '19:00', notes: '',
          activity: ACTIVITIES.find((a) => a.id === 'act-1-3'),
        },
        {
          id: 'sa-3', trip_stop_id: 'stop-1', activity_id: 'act-1-2',
          scheduled_date: '2026-10-14', scheduled_time: '09:30', notes: '',
          activity: ACTIVITIES.find((a) => a.id === 'act-1-2'),
        },
      ],
    },
    {
      id: 'stop-2',
      trip_id: TRIP_ID,
      city_id: 'city-3',
      start_date: '2026-10-16',
      end_date: '2026-10-21',
      order_index: 1,
      est_stay_cost_per_day: 6200,
      est_transport_cost: 7000,
      city: CITIES.find((c) => c.id === 'city-3'),
      activities: [
        {
          id: 'sa-4', trip_stop_id: 'stop-2', activity_id: 'act-3-1',
          scheduled_date: '2026-10-17', scheduled_time: '09:30', notes: '',
          activity: ACTIVITIES.find((a) => a.id === 'act-3-1'),
        },
        {
          id: 'sa-5', trip_stop_id: 'stop-2', activity_id: 'act-3-2',
          scheduled_date: '2026-10-17', scheduled_time: '19:00', notes: '',
          activity: ACTIVITIES.find((a) => a.id === 'act-3-2'),
        },
      ],
    },
  ],
};

export const TRIP_BUDGET = {
  trip_id: TRIP_ID,
  trip_name: 'Iberian Loop',
  trip_total: 187400,
  avg_per_day: 13385,
  breakdown_by_category: [
    { category: 'stay', amount: 76000 },
    { category: 'transport', amount: 28500 },
    { category: 'food', amount: 34200 },
    { category: 'sightseeing', amount: 22800 },
    { category: 'nightlife', amount: 12900 },
    { category: 'adventure', amount: 13000 },
  ],
  per_stop: [
    { stop_id: 'stop-1', city_name: 'Lisbon', amount: 61200 },
    { stop_id: 'stop-2', city_name: 'Barcelona', amount: 72800 },
    { stop_id: 'stop-3', city_name: 'Paris', amount: 53400 },
  ],
};
