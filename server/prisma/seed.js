import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CITIES_DATA = [
  {
    name: 'Paris',
    country: 'France',
    costIndex: 1.4,
    popularity: 98,
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
    description: 'The City of Light, famous for art, fashion, gastronomy, and culture.',
    activities: [
      { name: 'Eiffel Tower Summit Tour', type: 'sightseeing', cost: 35.0, duration: 150, description: 'Ascend to the top for panoramic views of Paris.', imageUrl: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=600&q=80' },
      { name: 'Louvre Museum Guided Walk', type: 'culture', cost: 25.0, duration: 180, description: 'Explore Mona Lisa and thousands of world-famous masterpieces.', imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=600&q=80' },
      { name: 'Seine River Evening Cruise', type: 'sightseeing', cost: 20.0, duration: 75, description: 'Glide along the Seine under sparkling city lights.', imageUrl: 'https://images.unsplash.com/photo-1549144511-f099e773c147?auto=format&fit=crop&w=600&q=80' },
      { name: 'Montmartre & Sacré-Cœur Food Tour', type: 'food', cost: 65.0, duration: 120, description: 'Sample fresh croissants, cheeses, and wines in Montmartre.', imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80' },
    ]
  },
  {
    name: 'Tokyo',
    country: 'Japan',
    costIndex: 1.3,
    popularity: 96,
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80',
    description: 'Ultra-modern metropolis blending neon skyscrapers with historic temples.',
    activities: [
      { name: 'Senso-ji Temple & Asakusa Exploration', type: 'culture', cost: 0.0, duration: 120, description: 'Visit Tokyo oldest and most iconic Buddhist temple.', imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80' },
      { name: 'Shibuya Crossing & Harajuku Walk', type: 'sightseeing', cost: 0.0, duration: 90, description: 'Experience the world busiest pedestrian crossing and pop culture.', imageUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=600&q=80' },
      { name: 'Tsukiji Outer Market Food Tasting', type: 'food', cost: 45.0, duration: 150, description: 'Savor fresh sushi, wagyu skewers, and tamagoyaki.', imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80' },
      { name: 'teamLab Planets Digital Art Museum', type: 'culture', cost: 32.0, duration: 120, description: 'Immersive body-on digital art installation experience.', imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80' },
    ]
  },
  {
    name: 'New York',
    country: 'USA',
    costIndex: 1.6,
    popularity: 95,
    imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80',
    description: 'The Big Apple, featuring iconic skyline, Broadway, and vibrant neighborhoods.',
    activities: [
      { name: 'Statue of Liberty & Ellis Island Tour', type: 'sightseeing', cost: 30.0, duration: 180, description: 'Ferry ride and historic monument access.', imageUrl: 'https://images.unsplash.com/photo-1605130284535-11dd9eedc58a?auto=format&fit=crop&w=600&q=80' },
      { name: 'Central Park Bike & Stroll', type: 'adventure', cost: 18.0, duration: 120, description: 'Explore Betheseda Terrace, Strawberry Fields, and Bow Bridge.', imageUrl: 'https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?auto=format&fit=crop&w=600&q=80' },
      { name: 'Broadway Musical Show', type: 'culture', cost: 110.0, duration: 160, description: 'Enjoy world-class theatrical performance in Times Square.', imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80' },
    ]
  },
  {
    name: 'Rome',
    country: 'Italy',
    costIndex: 1.2,
    popularity: 94,
    imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80',
    description: 'The Eternal City packed with ancient ruins, Vatican art, and authentic pasta.',
    activities: [
      { name: 'Colosseum & Roman Forum Underground Tour', type: 'sightseeing', cost: 48.0, duration: 180, description: 'Step back into gladiator history and ancient Roman politics.', imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80' },
      { name: 'Vatican Museums & Sistine Chapel', type: 'culture', cost: 35.0, duration: 210, description: 'Marvel at Michelangelo famous ceiling fresco and St. Peter Basilica.', imageUrl: 'https://images.unsplash.com/photo-1548625361-185b31bf7280?auto=format&fit=crop&w=600&q=80' },
      { name: 'Trastevere Food & Gelato Crawl', type: 'food', cost: 40.0, duration: 120, description: 'Sample authentic Cacio e Pepe, Suppli, and artisan gelato.', imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80' },
    ]
  },
  {
    name: 'Kyoto',
    country: 'Japan',
    costIndex: 1.1,
    popularity: 92,
    imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
    description: 'Cultural heart of Japan known for classical Buddhist temples, gardens, and geishas.',
    activities: [
      { name: 'Fushimi Inari 10,000 Torii Gates Hike', type: 'sightseeing', cost: 0.0, duration: 150, description: 'Hike through sacred vermilion torii gate pathways.', imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80' },
      { name: 'Arashiyama Bamboo Grove & Monkey Park', type: 'adventure', cost: 10.0, duration: 120, description: 'Towering bamboo stalks and scenic mountain views.', imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80' },
    ]
  },
  {
    name: 'Barcelona',
    country: 'Spain',
    costIndex: 1.1,
    popularity: 91,
    imageUrl: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=800&q=80',
    description: 'Catalan seaside capital famed for Gaudí architecture and tapas bars.',
    activities: [
      { name: 'Sagrada Família Fast-Track Tour', type: 'culture', cost: 34.0, duration: 90, description: 'Gaudí unfinished architectural masterpiece.', imageUrl: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=600&q=80' },
      { name: 'Park Güell Mosaic Walk', type: 'sightseeing', cost: 15.0, duration: 90, description: 'Colorful mosaic park overlooking the Mediterranean Sea.', imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a771deda?auto=format&fit=crop&w=600&q=80' },
    ]
  },
  {
    name: 'Bali',
    country: 'Indonesia',
    costIndex: 0.6,
    popularity: 93,
    imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
    description: 'Island of the Gods featuring lush rice terraces, beaches, and spiritual temples.',
    activities: [
      { name: 'Uluwatu Sunset Temple & Kecak Fire Dance', type: 'culture', cost: 15.0, duration: 150, description: 'Clifftop temple view and traditional Balinese dance performance.', imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80' },
      { name: 'Tegallalang Rice Terrace & Jungle Swing', type: 'adventure', cost: 12.0, duration: 120, description: 'Iconic green terraces and soaring jungle swing.', imageUrl: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=600&q=80' },
    ]
  },
  {
    name: 'London',
    country: 'UK',
    costIndex: 1.5,
    popularity: 97,
    imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
    description: 'Historic capital with world-class museums, royal palaces, and West End theatre.',
    activities: [
      { name: 'Tower of London & Crown Jewels', type: 'sightseeing', cost: 38.0, duration: 150, description: 'Explore 1,000 years of royal history and guards.', imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&q=80' },
      { name: 'British Museum World Artifacts Walk', type: 'culture', cost: 0.0, duration: 180, description: 'See the Rosetta Stone and Egyptian mummies for free.', imageUrl: 'https://images.unsplash.com/photo-1568700942090-19dc36fab0c4?auto=format&fit=crop&w=600&q=80' },
    ]
  },
  {
    name: 'Sydney',
    country: 'Australia',
    costIndex: 1.4,
    popularity: 89,
    imageUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80',
    description: 'Harbor city famous for Sydney Opera House, Bondi Beach, and coastal walks.',
    activities: [
      { name: 'Sydney Opera House Guided Architectural Tour', type: 'culture', cost: 28.0, duration: 60, description: 'Step inside the world-famous sails-shaped landmark.', imageUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=600&q=80' },
      { name: 'Bondi to Coogee Coastal Walk', type: 'adventure', cost: 0.0, duration: 150, description: 'Breathtaking ocean views along cliffside beaches.', imageUrl: 'https://images.unsplash.com/photo-1528072164453-f4e8ef0d475a?auto=format&fit=crop&w=600&q=80' },
    ]
  },
  {
    name: 'Dubai',
    country: 'UAE',
    costIndex: 1.5,
    popularity: 90,
    imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
    description: 'Futuristic desert oasis known for luxury shopping, ultramodern architecture, and nightlife.',
    activities: [
      { name: 'Burj Khalifa 124th Floor Observation Deck', type: 'sightseeing', cost: 45.0, duration: 90, description: 'Stand atop the tallest building in the world.', imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80' },
      { name: 'Desert Safari with Dune Bashing & BBQ', type: 'adventure', cost: 60.0, duration: 300, description: '4x4 desert adventure, camel riding, and starlit buffet dinner.', imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80' },
    ]
  },
  {
    name: 'Cairo',
    country: 'Egypt',
    costIndex: 0.5,
    popularity: 85,
    imageUrl: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=800&q=80',
    description: 'Ancient Nile metropolis home to the Great Pyramids and Egyptian Museum.',
    activities: [
      { name: 'Giza Pyramids & Sphinx Camel Tour', type: 'sightseeing', cost: 25.0, duration: 180, description: 'Marvel at the last remaining Wonder of the Ancient World.', imageUrl: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=600&q=80' },
    ]
  },
  {
    name: 'Rio de Janeiro',
    country: 'Brazil',
    costIndex: 0.7,
    popularity: 86,
    imageUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=800&q=80',
    description: 'Vibrant coastal city famed for Copacabana, Sugarloaf Mountain, and Christ the Redeemer.',
    activities: [
      { name: 'Christ the Redeemer & Corcovado Train', type: 'sightseeing', cost: 22.0, duration: 120, description: 'Visit the majestic Art Deco statue overlooking Rio.', imageUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=600&q=80' },
    ]
  },
  {
    name: 'Bangkok',
    country: 'Thailand',
    costIndex: 0.6,
    popularity: 94,
    imageUrl: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80',
    description: 'Energetic street life, ornate shrines, and famous night markets.',
    activities: [
      { name: 'Grand Palace & Emerald Buddha Temple', type: 'culture', cost: 16.0, duration: 150, description: 'Sacred royal ceremonial complex with dazzling golden spires.', imageUrl: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=600&q=80' },
      { name: 'Jodd Fairs Street Food Tour', type: 'food', cost: 20.0, duration: 120, description: 'Savor spicy volcano ribs, mango sticky rice, and thai tea.', imageUrl: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=600&q=80' },
    ]
  },
  {
    name: 'Amsterdam',
    country: 'Netherlands',
    costIndex: 1.3,
    popularity: 89,
    imageUrl: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=800&q=80',
    description: 'Picturesque canal ring, bicycle culture, and golden age art museums.',
    activities: [
      { name: 'Rijksmuseum & Van Gogh Museum Pass', type: 'culture', cost: 42.0, duration: 210, description: 'See Rembrandt Night Watch and Van Gogh Sunflowers.', imageUrl: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=600&q=80' },
    ]
  },
  {
    name: 'Prague',
    country: 'Czech Republic',
    costIndex: 0.8,
    popularity: 88,
    imageUrl: 'https://images.unsplash.com/photo-1541849546-216549ae216d?auto=format&fit=crop&w=800&q=80',
    description: 'City of a Hundred Spires featuring Gothic churches, medieval clock, and Charles Bridge.',
    activities: [
      { name: 'Prague Castle & Saint Vitus Cathedral Walk', type: 'culture', cost: 12.0, duration: 150, description: 'Explore the largest ancient castle complex in the world.', imageUrl: 'https://images.unsplash.com/photo-1541849546-216549ae216d?auto=format&fit=crop&w=600&q=80' },
    ]
  }
];

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data for a fresh seed
  await prisma.tripActivity.deleteMany();
  await prisma.stop.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.city.deleteMany();

  let cityCount = 0;
  let activityCount = 0;

  for (const cityData of CITIES_DATA) {
    const { activities, ...cityFields } = cityData;
    const city = await prisma.city.create({
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

  console.log(`✅ Seeding complete! Created ${cityCount} cities and ${activityCount} activities.`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
