import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CITIES_DATA = [
  {
    name: 'Paris',
    country: 'France',
    region: 'Europe',
    costIndex: 4,
    popularity: 98,
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
    description: 'The City of Light, famous for art, fashion, gastronomy, and culture.',
    activities: [
      { name: 'Eiffel Tower Summit Tour', category: 'sightseeing', cost: 35.0, durationHours: 2.5, description: 'Ascend to the top for panoramic views of Paris.', imageUrl: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=600&q=80' },
      { name: 'Louvre Museum Guided Walk', category: 'culture', cost: 25.0, durationHours: 3.0, description: 'Explore Mona Lisa and thousands of world-famous masterpieces.', imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=600&q=80' },
      { name: 'Seine River Evening Cruise', category: 'sightseeing', cost: 20.0, durationHours: 1.5, description: 'Glide along the Seine under sparkling city lights.', imageUrl: 'https://images.unsplash.com/photo-1549144511-f099e773c147?auto=format&fit=crop&w=600&q=80' },
      { name: 'Montmartre & Sacré-Cœur Food Tour', category: 'food', cost: 65.0, durationHours: 2.0, description: 'Sample fresh croissants, cheeses, and wines in Montmartre.', imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80' },
    ]
  },
  {
    name: 'Tokyo',
    country: 'Japan',
    region: 'Asia',
    costIndex: 4,
    popularity: 96,
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80',
    description: 'Ultra-modern metropolis blending neon skyscrapers with historic temples.',
    activities: [
      { name: 'Senso-ji Temple & Asakusa Exploration', category: 'culture', cost: 0.0, durationHours: 2.0, description: 'Visit Tokyo oldest and most iconic Buddhist temple.', imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80' },
      { name: 'Shibuya Crossing & Harajuku Walk', category: 'sightseeing', cost: 0.0, durationHours: 1.5, description: 'Experience the world busy pedestrian crossing and pop culture.', imageUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=600&q=80' },
      { name: 'Tsukiji Outer Market Food Tasting', category: 'food', cost: 45.0, durationHours: 2.5, description: 'Savor fresh sushi, wagyu skewers, and tamagoyaki.', imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80' },
      { name: 'teamLab Planets Digital Art Museum', category: 'culture', cost: 32.0, durationHours: 2.0, description: 'Immersive body-on digital art installation experience.', imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80' },
    ]
  },
  {
    name: 'New York',
    country: 'USA',
    region: 'North America',
    costIndex: 5,
    popularity: 95,
    imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80',
    description: 'The Big Apple, featuring iconic skyline, Broadway, and vibrant neighborhoods.',
    activities: [
      { name: 'Statue of Liberty & Ellis Island Tour', category: 'sightseeing', cost: 30.0, durationHours: 3.0, description: 'Ferry ride and historic monument access.', imageUrl: 'https://images.unsplash.com/photo-1605130284535-11dd9eedc58a?auto=format&fit=crop&w=600&q=80' },
      { name: 'Central Park Bike & Stroll', category: 'adventure', cost: 18.0, durationHours: 2.0, description: 'Explore Bethesda Terrace, Strawberry Fields, and Bow Bridge.', imageUrl: 'https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?auto=format&fit=crop&w=600&q=80' },
      { name: 'Broadway Musical Show', category: 'culture', cost: 110.0, durationHours: 2.5, description: 'Enjoy world-class theatrical performance in Times Square.', imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80' },
    ]
  },
  {
    name: 'Rome',
    country: 'Italy',
    region: 'Europe',
    costIndex: 3,
    popularity: 94,
    imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80',
    description: 'The Eternal City packed with ancient ruins, Vatican art, and authentic pasta.',
    activities: [
      { name: 'Colosseum & Roman Forum Underground Tour', category: 'sightseeing', cost: 48.0, durationHours: 3.0, description: 'Step back into gladiator history and ancient Roman politics.', imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80' },
      { name: 'Vatican Museums & Sistine Chapel', category: 'culture', cost: 35.0, durationHours: 3.5, description: 'Marvel at Michelangelo famous ceiling fresco.', imageUrl: 'https://images.unsplash.com/photo-1548625361-185b31bf7280?auto=format&fit=crop&w=600&q=80' },
      { name: 'Trastevere Food & Gelato Crawl', category: 'food', cost: 40.0, durationHours: 2.0, description: 'Sample authentic Cacio e Pepe, Suppli, and artisan gelato.', imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80' },
    ]
  },
  {
    name: 'Kyoto',
    country: 'Japan',
    region: 'Asia',
    costIndex: 3,
    popularity: 92,
    imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
    description: 'Cultural heart of Japan known for classical Buddhist temples, gardens, and geishas.',
    activities: [
      { name: 'Fushimi Inari 10,000 Torii Gates Hike', category: 'sightseeing', cost: 0.0, durationHours: 2.5, description: 'Hike through sacred vermilion torii gate pathways.', imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80' },
      { name: 'Arashiyama Bamboo Grove & Monkey Park', category: 'adventure', cost: 10.0, durationHours: 2.0, description: 'Towering bamboo stalks and scenic mountain views.', imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80' },
    ]
  },
  {
    name: 'Barcelona',
    country: 'Spain',
    region: 'Europe',
    costIndex: 3,
    popularity: 91,
    imageUrl: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=800&q=80',
    description: 'Catalan seaside capital famed for Gaudí architecture and tapas bars.',
    activities: [
      { name: 'Sagrada Família Fast-Track Tour', category: 'culture', cost: 34.0, durationHours: 1.5, description: 'Gaudí unfinished architectural masterpiece.', imageUrl: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=600&q=80' },
      { name: 'Park Güell Mosaic Walk', category: 'sightseeing', cost: 15.0, durationHours: 1.5, description: 'Colorful mosaic park overlooking the Mediterranean Sea.', imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a771deda?auto=format&fit=crop&w=600&q=80' },
    ]
  },
  {
    name: 'Bali',
    country: 'Indonesia',
    region: 'Asia',
    costIndex: 2,
    popularity: 93,
    imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
    description: 'Island of the Gods featuring lush rice terraces, beaches, and spiritual temples.',
    activities: [
      { name: 'Uluwatu Sunset Temple & Kecak Fire Dance', category: 'culture', cost: 15.0, durationHours: 2.5, description: 'Clifftop temple view and traditional Balinese dance performance.', imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80' },
      { name: 'Tegallalang Rice Terrace & Jungle Swing', category: 'adventure', cost: 12.0, durationHours: 2.0, description: 'Iconic green terraces and soaring jungle swing.', imageUrl: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=600&q=80' },
    ]
  },
  {
    name: 'London',
    country: 'UK',
    region: 'Europe',
    costIndex: 5,
    popularity: 97,
    imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
    description: 'Historic capital with world-class museums, royal palaces, and West End theatre.',
    activities: [
      { name: 'Tower of London & Crown Jewels', category: 'sightseeing', cost: 38.0, durationHours: 2.5, description: 'Explore 1,000 years of royal history and guards.', imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&q=80' },
      { name: 'British Museum World Artifacts Walk', category: 'culture', cost: 0.0, durationHours: 3.0, description: 'See the Rosetta Stone and Egyptian mummies for free.', imageUrl: 'https://images.unsplash.com/photo-1568700942090-19dc36fab0c4?auto=format&fit=crop&w=600&q=80' },
    ]
  },
  {
    name: 'Cairo',
    country: 'Egypt',
    region: 'Africa',
    costIndex: 1,
    popularity: 85,
    imageUrl: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=800&q=80',
    description: 'Ancient Nile metropolis home to the Great Pyramids and Egyptian Museum.',
    activities: [
      { name: 'Giza Pyramids & Sphinx Camel Tour', category: 'sightseeing', cost: 25.0, durationHours: 3.0, description: 'Marvel at the last remaining Wonder of the Ancient World.', imageUrl: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=600&q=80' },
    ]
  },
  {
    name: 'Bangkok',
    country: 'Thailand',
    region: 'Asia',
    costIndex: 2,
    popularity: 94,
    imageUrl: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80',
    description: 'Energetic street life, ornate shrines, and famous night markets.',
    activities: [
      { name: 'Grand Palace & Emerald Buddha Temple', category: 'culture', cost: 16.0, durationHours: 2.5, description: 'Sacred royal ceremonial complex with dazzling golden spires.', imageUrl: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=600&q=80' },
      { name: 'Jodd Fairs Street Food Tour', category: 'food', cost: 20.0, durationHours: 2.0, description: 'Savor spicy volcano ribs, mango sticky rice, and thai tea.', imageUrl: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=600&q=80' },
    ]
  }
];

async function main() {
  console.log('🌱 Seeding database for updated design.md schema...');

  // Clean existing data
  await prisma.savedDestination.deleteMany();
  await prisma.tripActivity.deleteMany();
  await prisma.stop.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.city.deleteMany();

  let cityCount = 0;
  let activityCount = 0;

  for (const cityData of CITIES_DATA) {
    const { activities, ...cityFields } = cityData;
    await prisma.city.create({
      data: {
        ...cityFields,
        activities: {
          create: activities
        }
      }
    });
    cityCount++;
    activityCount += activities.length;
  }

  console.log(`✅ Seeding complete! Populated ${cityCount} cities and ${activityCount} activities.`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
