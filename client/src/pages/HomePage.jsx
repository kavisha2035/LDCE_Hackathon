import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import TicketCard from '../components/TicketCard';
import { fetchSavedDestinations, saveDestination, removeSavedDestination } from '../api/citiesApi';
import {
  Compass, Plus, MapPin, Calendar, ShieldCheck, Sparkles,
  ArrowRight, Globe, DollarSign, Clock, Search, Layers,
  PieChart, Share2, Bookmark, CheckCircle2, ChevronRight,
  ExternalLink, SlidersHorizontal, User, Heart, Tag, Eye,
  Play, Star, X
} from 'lucide-react';

const FEATURED_CITIES = [
  {
    name: 'Tokyo',
    country: 'Japan',
    region: 'Asia',
    costIndex: 4,
    popularity: 96,
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80',
    description: 'Futuristic skyline, ancient shrines, and world-class culinary mastery.',
    highlights: ['Senso-ji', 'Shibuya Sky', 'Tsukiji Market']
  },
  {
    name: 'Paris',
    country: 'France',
    region: 'Europe',
    costIndex: 4,
    popularity: 98,
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
    description: 'The City of Light, romantic boulevards, world-class art and gastronomy.',
    highlights: ['Eiffel Tower', 'Louvre Museum', 'Montmartre']
  },
  {
    name: 'Rome',
    country: 'Italy',
    region: 'Europe',
    costIndex: 3,
    popularity: 94,
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80',
    description: 'Living museum of classical ruins, piazzas, and authentic Italian espresso.',
    highlights: ['Colosseum', 'Vatican City', 'Trevi Fountain']
  },
  {
    name: 'Barcelona',
    country: 'Spain',
    region: 'Europe',
    costIndex: 3,
    popularity: 91,
    image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=800&q=80',
    description: 'Gaudí marvels, Mediterranean beaches, and vibrant tapas nightlife.',
    highlights: ['Sagrada Familia', 'Park Güell', 'Gothic Quarter']
  },
  {
    name: 'Kyoto',
    country: 'Japan',
    region: 'Asia',
    costIndex: 3,
    popularity: 92,
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
    description: 'Traditional wooden houses, bamboo groves, and sacred vermilion shrines.',
    highlights: ['Fushimi Inari', 'Arashiyama', 'Kinkaku-ji']
  },
  {
    name: 'Bali',
    country: 'Indonesia',
    region: 'Asia',
    costIndex: 2,
    popularity: 93,
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
    description: 'Tropical paradise with lush terraced rice paddies and sacred temples.',
    highlights: ['Ubud Rice Terraces', 'Tanah Lot', 'Mount Batur']
  }
];

const FEATURED_ACTIVITIES = [
  {
    id: 'a1',
    name: 'Eiffel Tower Summit Tour',
    cityName: 'Paris',
    country: 'France',
    category: 'sightseeing',
    cost: 3500,
    durationHours: 2.5,
    imageUrl: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=600&q=80',
    description: 'Ascend to the summit for breathtaking panoramic views of the Seine and Parisian skyline.'
  },
  {
    id: 'a2',
    name: 'Senso-ji Temple & Asakusa Walk',
    cityName: 'Tokyo',
    country: 'Japan',
    category: 'culture',
    cost: 0,
    durationHours: 2.0,
    imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80',
    description: 'Experience Tokyo’s oldest Buddhist temple and shop traditional crafts on Nakamise-dori.'
  },
  {
    id: 'a3',
    name: 'Colosseum Underground & Gladiator Arena',
    cityName: 'Rome',
    country: 'Italy',
    category: 'sightseeing',
    cost: 4800,
    durationHours: 3.0,
    imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80',
    description: 'Walk through the restricted underground hypogeum where gladiators and beasts prepared.'
  },
  {
    id: 'a4',
    name: 'Fushimi Inari Torii Gate Sunrise Trek',
    cityName: 'Kyoto',
    country: 'Japan',
    category: 'adventure',
    cost: 0,
    durationHours: 2.5,
    imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80',
    description: 'Hike through thousands of vibrant orange torii gates wrapping up sacred Mount Inari.'
  },
  {
    id: 'a5',
    name: 'Montmartre Artisan Food & Wine Tasting',
    cityName: 'Paris',
    country: 'France',
    category: 'food',
    cost: 5200,
    durationHours: 3.0,
    imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
    description: 'Savor artisan French cheeses, warm baguettes, macarons, and regional vintage wines.'
  },
  {
    id: 'a6',
    name: 'Gaudi Sagrada Familia Architectural Tour',
    cityName: 'Barcelona',
    country: 'Spain',
    category: 'culture',
    cost: 3200,
    durationHours: 2.0,
    imageUrl: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=600&q=80',
    description: 'Marvel at the breathtaking stained glass light and organic forest columns inside the basilica.'
  }
];

const REVIEWS = [
  {
    author: 'KARIN THOMAS',
    location: 'Adventure Alaska',
    quote: 'GlobeTrotter provided us with the most seamless multi-city journey we have ever experienced. The automated itinerary and day-by-day scheduler made our trip to Alaska unforgettable!',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  },
  {
    author: 'MARCUS VANCE',
    location: 'Kyoto & Tokyo Expedition',
    quote: 'The live cost ledger and shared public pass allowed our travel group to stay completely synchronized without endless spreadsheets. Truly modern travel design!',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
  }
];

export default function HomePage({
  onNavigate,
  onSelectCity,
  onSelectActivity
}) {
  const { user, isAuthenticated } = useAuth();
  const [whereTo, setWhereTo] = useState('');
  const [whenDate, setWhenDate] = useState('');
  const [travelType, setTravelType] = useState('All');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [savedCities, setSavedCities] = useState(() => {
    try {
      const stored = localStorage.getItem('globetrotter_saved_destinations');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);

  // Sync saved destinations with backend when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchSavedDestinations().then((saved) => {
        if (Array.isArray(saved) && saved.length > 0) {
          const remoteNames = saved.map((s) => s.city?.name || s.cityId).filter(Boolean);
          setSavedCities((prev) => {
            const merged = Array.from(new Set([...prev, ...remoteNames]));
            try {
              localStorage.setItem('globetrotter_saved_destinations', JSON.stringify(merged));
            } catch (e) {}
            return merged;
          });
        }
      }).catch((err) => {
        console.error('Failed to fetch user saved destinations:', err);
      });
    }
  }, [isAuthenticated]);

  const toggleSaveCity = async (cityName) => {
    const isCurrentlySaved = savedCities.includes(cityName);
    const updated = isCurrentlySaved
      ? savedCities.filter((c) => c !== cityName)
      : [...savedCities, cityName];

    setSavedCities(updated);
    try {
      localStorage.setItem('globetrotter_saved_destinations', JSON.stringify(updated));
    } catch (e) {}

    if (isAuthenticated) {
      try {
        if (isCurrentlySaved) {
          await removeSavedDestination(cityName);
        } else {
          await saveDestination({ cityName, city_id: cityName });
        }
      } catch (err) {
        console.error('Failed to sync saved destination with server:', err);
      }
    }
  };

  const filteredCities = selectedRegion === 'All'
    ? FEATURED_CITIES
    : FEATURED_CITIES.filter(c => c.region === selectedRegion);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!whereTo.trim()) {
      onNavigate('cities');
      return;
    }
    onNavigate('cities', { search: whereTo.trim() });
  };

  return (
    <div className="space-y-16 pb-16 font-sans bg-[#FAF9F6] text-[#1E232A] w-full overflow-x-hidden">

      {/* 1. HERO SECTION WITH LIVE VIDEO BACKGROUND & WANDERERS SEARCH BAR */}
      <section className="relative w-full min-h-[90vh] flex flex-col justify-between overflow-hidden">
        
        {/* Live HD Video Background with Fallback */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover scale-105"
            poster="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1920&q=80"
          >
            <source src="https://assets.mixkit.co/videos/preview/mixkit-flying-over-a-mountain-lake-at-sunset-41484-large.mp4" type="video/mp4" />
            <source src="https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4" type="video/mp4" />
          </video>
          {/* Dark luxury overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0F141C]/60 via-[#0F141C]/40 to-[#0F141C]/80"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 pt-28 pb-20 flex-1 flex flex-col justify-center text-center items-center">
          
          {/* Yellow Handwritten Script Accent */}
          <span className="font-script text-[#F5B800] text-5xl sm:text-6xl md:text-7xl block mb-2 drop-shadow-md transform -rotate-2">
            adventurous
          </span>

          {/* Wanderers Serif Headline */}
          <h1 className="font-serif text-6xl sm:text-8xl md:text-9xl font-black text-white tracking-wide leading-none uppercase drop-shadow-lg mb-6">
            Your Journey Begins
          </h1>

          <p className="text-white/95 text-lg sm:text-2xl font-light max-w-3xl text-center leading-relaxed mb-12 drop-shadow">
            A journey of a 1000 miles starts with a single step. Plan multi-city itineraries, live cost ledgers, and day-by-day timeline schedules — all in one place.
          </p>

          {/* FLOATING WANDERERS QUICK SEARCH BAR */}
          <div className="w-full max-w-5xl bg-white shadow-2xl p-4 sm:p-6 border-t-4 border-[#F5B800]">
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              
              {/* WHERE TO? Input */}
              <div className="sm:col-span-4 border-b sm:border-b-0 sm:border-r border-gray-200 p-2 text-left">
                <label className="text-xs font-extrabold uppercase tracking-widest text-[#F5B800] flex items-center gap-2 mb-1.5">
                  <MapPin className="h-4 w-4 text-[#F5B800]" /> WHERE TO?
                </label>
                <input
                  type="text"
                  value={whereTo}
                  onChange={(e) => setWhereTo(e.target.value)}
                  placeholder="Tokyo, Paris, Rome, Bali..."
                  className="w-full font-serif text-base sm:text-lg font-bold text-[#1E232A] placeholder-gray-400 focus:outline-none bg-transparent"
                />
              </div>

              {/* WHEN? Select */}
              <div className="sm:col-span-3 border-b sm:border-b-0 sm:border-r border-gray-200 p-2 text-left">
                <label className="text-xs font-extrabold uppercase tracking-widest text-[#F5B800] flex items-center gap-2 mb-1.5">
                  <Calendar className="h-4 w-4 text-[#F5B800]" /> WHEN?
                </label>
                <select
                  value={whenDate}
                  onChange={(e) => setWhenDate(e.target.value)}
                  className="w-full font-serif text-base sm:text-lg font-bold text-[#1E232A] focus:outline-none bg-transparent cursor-pointer"
                >
                  <option value="">Select Season</option>
                  <option value="autumn-2026">Autumn 2026</option>
                  <option value="winter-2026">Winter 2026</option>
                  <option value="spring-2027">Spring 2027</option>
                  <option value="summer-2027">Summer 2027</option>
                </select>
              </div>

              {/* TRAVEL TYPE Select */}
              <div className="sm:col-span-3 border-b sm:border-b-0 sm:border-r border-gray-200 p-2 text-left">
                <label className="text-xs font-extrabold uppercase tracking-widest text-[#F5B800] flex items-center gap-2 mb-1.5">
                  <Compass className="h-4 w-4 text-[#F5B800]" /> TRAVEL TYPE
                </label>
                <select
                  value={travelType}
                  onChange={(e) => setTravelType(e.target.value)}
                  className="w-full font-serif text-base sm:text-lg font-bold text-[#1E232A] focus:outline-none bg-transparent cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  <option value="Culture">Culture & Shrines</option>
                  <option value="Sightseeing">Classic Landmarks</option>
                  <option value="Gastronomy">Food & Wine</option>
                  <option value="Adventure">Nature & Treks</option>
                </select>
              </div>

              {/* FIND NOW Gold Action Button */}
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full py-4 bg-[#F5B800] hover:bg-[#E0A600] text-[#1E232A] font-extrabold text-sm tracking-widest uppercase transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  FIND NOW
                </button>
              </div>

            </form>
          </div>

        </div>

      </section>

      {/* 2. FEATURE SECTION: "A SIMPLY PERFECT PLACE TO GET LOST" */}
      <section className="w-full max-w-[1600px] mx-auto px-6 sm:px-12 lg:px-16 py-6">
        <div className="bg-white border border-gray-200 rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0 items-center">
          
          {/* Left Side: Featured Video Thumbnail with Yellow Play Button */}
          <div className="lg:col-span-6 relative h-96 sm:h-[480px] overflow-hidden group">
            <img
              src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80"
              alt="The Beauty of Travel"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition"></div>
            
            {/* Cursive yellow accent tag */}
            <div className="absolute top-6 left-6 space-y-1">
              <span className="font-script text-[#F5B800] text-3xl block">new</span>
              <h3 className="font-serif text-2xl font-bold text-white uppercase tracking-wider">
                Watch Our Video
              </h3>
              <p className="text-white/80 text-xs font-sans">The Beauty of Global Discovery</p>
            </div>

            {/* Glowing Golden Play Button */}
            <button
              onClick={() => setIsVideoModalOpen(true)}
              className="absolute inset-0 m-auto h-20 w-20 rounded-full bg-[#F5B800] hover:bg-[#E0A600] text-[#1E232A] flex items-center justify-center shadow-2xl hover:scale-110 transition duration-300 cursor-pointer"
              title="Play Video Showcase"
            >
              <Play className="h-8 w-8 fill-[#1E232A] ml-1" />
            </button>
          </div>

          {/* Right Side: Wanderers Text Presentation */}
          <div className="lg:col-span-6 p-8 sm:p-12 md:p-16 space-y-6 bg-map-pattern">
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-[#1E232A] leading-tight">
              A Simply Perfect Place To Get Lost
            </h2>
            
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed font-sans">
              Treat yourself with a journey to your inner self. Visit sacred shrines, romantic Parisian boulevards, and vibrant Roman piazzas. We promise, you will enjoy every step you make with our smart multi-city travel tools.
            </p>

            <div className="pt-2 flex items-center gap-4">
              <button
                onClick={() => onNavigate('cities')}
                className="px-8 py-3.5 bg-[#F5B800] hover:bg-[#E0A600] text-[#1E232A] font-bold text-xs tracking-widest uppercase transition shadow-md cursor-pointer rounded-full"
              >
                SEE MORE
              </button>
              
              <button
                onClick={() => onNavigate('create-trip')}
                className="px-6 py-3.5 bg-transparent border-2 border-[#1E232A] text-[#1E232A] hover:bg-[#1E232A] hover:text-white font-bold text-xs tracking-widest uppercase transition cursor-pointer rounded-full"
              >
                BUILD ITINERARY
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 3. TESTIMONIAL SLIDER: "OUR TOP REVIEWS" (Dark Obsidian Theme) */}
      <section className="w-full max-w-[1600px] mx-auto px-6 sm:px-12 lg:px-16 py-4">
        <div className="bg-[#1A1D23] text-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0 relative">
          
          {/* Left Side: Full Height Traveler Image */}
          <div className="lg:col-span-6 h-80 sm:h-96 lg:h-[450px] relative">
            <img
              src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80"
              alt="Adventure Alaska"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#1A1D23] hidden lg:block"></div>
          </div>

          {/* Right Side: Review Content with Map Watermark */}
          <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-center space-y-6 bg-map-dark relative z-10">
            
            <div className="flex items-center gap-2">
              <MapPin className="h-6 w-6 text-[#F5B800]" />
              <span className="font-serif text-3xl font-bold text-white tracking-wide">
                Our Top Reviews
              </span>
            </div>

            <div className="space-y-3">
              <h4 className="font-serif text-xl font-bold text-[#F5B800]">
                {REVIEWS[activeReviewIndex].location}
              </h4>

              {/* Golden Stars */}
              <div className="flex items-center gap-1">
                {[...Array(REVIEWS[activeReviewIndex].rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-[#F5B800] text-[#F5B800]" />
                ))}
              </div>

              <p className="text-gray-300 text-sm sm:text-base italic leading-relaxed font-sans">
                "{REVIEWS[activeReviewIndex].quote}"
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="flex items-center gap-3">
                <img
                  src={REVIEWS[activeReviewIndex].avatar}
                  alt={REVIEWS[activeReviewIndex].author}
                  className="h-10 w-10 rounded-full object-cover border-2 border-[#F5B800]"
                />
                <div>
                  <span className="font-bold text-xs tracking-wider uppercase text-white block">
                    {REVIEWS[activeReviewIndex].author}
                  </span>
                  <span className="text-[10px] text-gray-400 font-sans uppercase">VERIFIED EXPLORER</span>
                </div>
              </div>

              {/* Carousel Indicators */}
              <div className="flex items-center gap-2">
                {REVIEWS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveReviewIndex(idx)}
                    className={`h-2.5 w-2.5 rounded-full transition cursor-pointer ${
                      activeReviewIndex === idx ? 'bg-[#F5B800] w-6' : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 4. ACTIVE MASTER TRIP WORKSPACE */}
      <section className="w-full px-6 sm:px-12 lg:px-16 pt-4 space-y-6">
        
        {/* Section Heading */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b-2 border-gray-300 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-3.5 w-3.5 bg-[#F5B800] rounded-full animate-pulse"></span>
              <span className="font-sans text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#1E232A]">ACTIVE MASTER TRIP</span>
            </div>
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-serif font-black text-[#1E232A] uppercase tracking-wide leading-none">
              GRAND CONTINENTAL ODYSSEY 2026
            </h2>
            <div className="font-sans text-sm sm:text-base font-bold text-gray-700 flex flex-wrap items-center gap-4 mt-3">
              <span>🗓 OCT 12 — NOV 05, 2026</span>
              <span>•</span>
              <span>📍 PARIS ➔ TOKYO ➔ ROME</span>
              <span>•</span>
              <span className="text-[#F5B800] font-extrabold bg-[#1E232A] px-3 py-1 rounded-full">₹1,18,700 ESTIMATE</span>
            </div>
          </div>

          {/* Quick Action Switchers */}
          <div className="flex flex-wrap items-center gap-2.5 font-sans text-xs sm:text-sm">
            <button
              onClick={() => onNavigate('my-trips')}
              className="px-5 py-2.5 bg-[#1E232A] hover:bg-[#F5B800] hover:text-[#1E232A] text-white font-extrabold uppercase transition flex items-center gap-2 cursor-pointer rounded-full shadow-md"
            >
              <Layers className="h-4 w-4" />
              MY TRIPS WALLET
            </button>
            <button
              onClick={() => onNavigate('builder')}
              className="px-5 py-2.5 bg-white hover:bg-gray-100 text-[#1E232A] border border-gray-300 font-extrabold uppercase transition flex items-center gap-2 cursor-pointer rounded-full shadow-md"
            >
              <Plus className="h-4 w-4 text-[#F5B800]" />
              EDIT IN BUILDER
            </button>
            <button
              onClick={() => onNavigate('budget')}
              className="px-5 py-2.5 bg-white hover:bg-gray-100 text-[#1E232A] border border-gray-300 font-extrabold uppercase transition flex items-center gap-2 cursor-pointer rounded-full shadow-md"
            >
              <DollarSign className="h-4 w-4 text-[#F5B800]" />
              BUDGET LEDGER
            </button>
            <button
              onClick={() => onNavigate('share')}
              className="px-5 py-2.5 bg-[#F5B800] hover:bg-[#E0A600] text-[#1E232A] font-extrabold uppercase transition flex items-center gap-2 cursor-pointer rounded-full shadow-md"
            >
              <Share2 className="h-4 w-4" />
              SHARE LINK
            </button>
          </div>
        </div>

        {/* Stops Ticket Stubs Deck */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* STOP 1: PARIS */}
          <TicketCard
            city="PARIS"
            country="FRANCE"
            dates="OCT 12 — OCT 16, 2026"
            cost={32500}
            activitiesCount={4}
            badge="STOP 01"
            actionButton={
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('activities', { city: 'Paris' })}
                  className="px-4 py-2 bg-gray-100 border border-gray-300 hover:bg-[#F5B800] hover:text-[#1E232A] font-sans text-xs font-extrabold uppercase transition rounded-full cursor-pointer"
                >
                  + Add Activity
                </button>
                <button
                  onClick={() => onNavigate('itinerary')}
                  className="px-4 py-2 bg-[#1E232A] text-white border border-[#1E232A] font-sans text-xs font-extrabold uppercase transition rounded-full cursor-pointer"
                >
                  View Details
                </button>
              </div>
            }
          >
            <p className="text-sm text-gray-700 font-sans mb-3 leading-relaxed">
              The City of Light: summiting the Eiffel Tower, Louvre masterpieces, and walking the historic alleys of Montmartre.
            </p>
            <div className="space-y-2 mb-3 font-sans text-xs sm:text-sm">
              <div className="flex items-center justify-between text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                <span>🏨 4 Nights Stay</span>
                <span className="font-extrabold">₹18,000</span>
              </div>
              <div className="flex items-center justify-between text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                <span>🎯 4 Activities</span>
                <span className="font-extrabold">₹8,700</span>
              </div>
              <div className="flex items-center justify-between text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                <span>🚆 Eurostar Rail</span>
                <span className="font-extrabold">₹5,800</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-3 py-1 bg-[#FFF9E6] rounded-full border border-[#F5B800]/40 font-sans text-xs text-[#1E232A] font-bold">#sightseeing</span>
              <span className="px-3 py-1 bg-[#FFF9E6] rounded-full border border-[#F5B800]/40 font-sans text-xs text-[#1E232A] font-bold">#culture</span>
              <span className="px-3 py-1 bg-[#FFF9E6] rounded-full border border-[#F5B800]/40 font-sans text-xs text-[#1E232A] font-bold">#food</span>
            </div>
          </TicketCard>

          {/* STOP 2: TOKYO */}
          <TicketCard
            city="TOKYO"
            country="JAPAN"
            dates="OCT 18 — OCT 26, 2026"
            cost={48000}
            activitiesCount={4}
            badge="STOP 02"
            actionButton={
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('activities', { city: 'Tokyo' })}
                  className="px-4 py-2 bg-gray-100 border border-gray-300 hover:bg-[#F5B800] hover:text-[#1E232A] font-sans text-xs font-extrabold uppercase transition rounded-full cursor-pointer"
                >
                  + Add Activity
                </button>
                <button
                  onClick={() => onNavigate('itinerary')}
                  className="px-4 py-2 bg-[#1E232A] text-white border border-[#1E232A] font-sans text-xs font-extrabold uppercase transition rounded-full cursor-pointer"
                >
                  View Details
                </button>
              </div>
            }
          >
            <p className="text-sm text-gray-700 font-sans mb-3 leading-relaxed">
              Ultra-modern neon metropolis blended with ancient Senso-ji temple, Shibuya skyline, and Tsukiji market street food.
            </p>
            <div className="space-y-2 mb-3 font-sans text-xs sm:text-sm">
              <div className="flex items-center justify-between text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                <span>🏨 8 Nights Stay</span>
                <span className="font-extrabold">₹28,000</span>
              </div>
              <div className="flex items-center justify-between text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                <span>🎯 4 Activities</span>
                <span className="font-extrabold">₹8,000</span>
              </div>
              <div className="flex items-center justify-between text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                <span>✈️ Int'l Airfare</span>
                <span className="font-extrabold">₹12,000</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-3 py-1 bg-[#FFF9E6] rounded-full border border-[#F5B800]/40 font-sans text-xs text-[#1E232A] font-bold">#culture</span>
              <span className="px-3 py-1 bg-[#FFF9E6] rounded-full border border-[#F5B800]/40 font-sans text-xs text-[#1E232A] font-bold">#food</span>
              <span className="px-3 py-1 bg-[#FFF9E6] rounded-full border border-[#F5B800]/40 font-sans text-xs text-[#1E232A] font-bold">#tech</span>
            </div>
          </TicketCard>

          {/* STOP 3: ROME */}
          <TicketCard
            city="ROME"
            country="ITALY"
            dates="OCT 28 — NOV 05, 2026"
            cost={38200}
            activitiesCount={3}
            badge="STOP 03"
            actionButton={
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('activities', { city: 'Rome' })}
                  className="px-4 py-2 bg-gray-100 border border-gray-300 hover:bg-[#F5B800] hover:text-[#1E232A] font-sans text-xs font-extrabold uppercase transition rounded-full cursor-pointer"
                >
                  + Add Activity
                </button>
                <button
                  onClick={() => onNavigate('itinerary')}
                  className="px-4 py-2 bg-[#1E232A] text-white border border-[#1E232A] font-sans text-xs font-extrabold uppercase transition rounded-full cursor-pointer"
                >
                  View Details
                </button>
              </div>
            }
          >
            <p className="text-sm text-gray-700 font-sans mb-3 leading-relaxed">
              Imperial history and vibrant piazza life: Colosseum underground, Vatican museums, and evening pasta in Trastevere.
            </p>
            <div className="space-y-2 mb-3 font-sans text-xs sm:text-sm">
              <div className="flex items-center justify-between text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                <span>🏨 7 Nights Stay</span>
                <span className="font-extrabold">₹22,000</span>
              </div>
              <div className="flex items-center justify-between text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                <span>🎯 3 Activities</span>
                <span className="font-extrabold">₹9,200</span>
              </div>
              <div className="flex items-center justify-between text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                <span>🚆 Frecciarossa Rail</span>
                <span className="font-extrabold">₹7,000</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-3 py-1 bg-[#FFF9E6] rounded-full border border-[#F5B800]/40 font-sans text-xs text-[#1E232A] font-bold">#history</span>
              <span className="px-3 py-1 bg-[#FFF9E6] rounded-full border border-[#F5B800]/40 font-sans text-xs text-[#1E232A] font-bold">#sightseeing</span>
              <span className="px-3 py-1 bg-[#FFF9E6] rounded-full border border-[#F5B800]/40 font-sans text-xs text-[#1E232A] font-bold">#food</span>
            </div>
          </TicketCard>

        </div>

      </section>

      {/* 5. RECOMMENDED DESTINATIONS LIST (Wanderers Grid Theme) */}
      <section className="w-full px-6 sm:px-12 lg:px-16 pt-6 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b-2 border-gray-300 pb-4">
          <div>
            <span className="font-script text-[#F5B800] text-4xl sm:text-5xl block">explore</span>
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-serif font-black text-[#1E232A] uppercase tracking-wide leading-none">
              DESTINATION LIST
            </h2>
            <p className="text-sm sm:text-base text-gray-600 font-sans font-medium mt-2">
              Showcase your destination offers with amazing places your itineraries can take you.
            </p>
          </div>

          {/* Region Filters */}
          <div className="flex flex-wrap items-center gap-3 font-sans text-xs sm:text-sm">
            {['All', 'Europe', 'Asia'].map((reg) => (
              <button
                key={reg}
                onClick={() => setSelectedRegion(reg)}
                className={`px-6 py-2.5 uppercase font-extrabold transition cursor-pointer rounded-full shadow-sm ${
                  selectedRegion === reg ? 'bg-[#1E232A] text-[#F5B800]' : 'bg-white text-[#1E232A] border border-gray-300 hover:bg-gray-100'
                }`}
              >
                {reg}
              </button>
            ))}
            <button
              onClick={() => onNavigate('cities')}
              className="px-6 py-2.5 bg-[#F5B800] text-[#1E232A] font-extrabold uppercase transition hover:bg-[#E0A600] flex items-center gap-2 cursor-pointer rounded-full shadow-md"
            >
              ALL CITIES <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Destination Stamp Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {filteredCities.map((city) => {
            const isSaved = savedCities.includes(city.name);
            return (
              <div
                key={city.name}
                className="bg-white border border-gray-200 rounded-3xl shadow-xl hover:shadow-2xl overflow-hidden flex flex-col justify-between group transition duration-300 min-h-[460px] sm:min-h-[520px] h-full"
              >
                <div>
                  {/* Card Image Banner */}
                  <div className="relative h-60 sm:h-72 lg:h-80 overflow-hidden">
                    <img
                      src={city.image}
                      alt={city.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"></div>
                    
                    {/* Country Badge */}
                    <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
                      <span className="px-3.5 py-1.5 bg-[#1E232A] text-[#F5B800] font-sans text-[11px] sm:text-xs font-extrabold uppercase tracking-widest rounded-full shadow-md">
                        {city.country}
                      </span>
                    </div>

                    <button
                      onClick={() => toggleSaveCity(city.name)}
                      title={isSaved ? "Saved to Bucket List" : "Save destination"}
                      className={`absolute top-4 right-4 sm:top-6 sm:right-6 p-2.5 sm:p-3 rounded-full shadow-lg transition cursor-pointer ${
                        isSaved ? 'bg-[#F5B800] text-[#1E232A]' : 'bg-white/90 text-[#1E232A] hover:bg-white'
                      }`}
                    >
                      <Heart className={`h-4 w-4 sm:h-5 sm:w-5 ${isSaved ? 'fill-[#1E232A]' : ''}`} />
                    </button>

                    {/* Bottom Title on Image */}
                    <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex items-end justify-between text-white gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black tracking-wide leading-tight truncate">
                          {city.name}
                        </h3>
                        <span className="text-[10px] sm:text-xs text-[#F5B800] uppercase font-extrabold tracking-widest block mt-0.5 truncate">
                          {city.region} REGION
                        </span>
                      </div>
                      <span className="px-2.5 py-1 sm:px-3.5 sm:py-1.5 bg-white/20 backdrop-blur-md text-white text-[10px] sm:text-xs font-extrabold uppercase rounded-full shrink-0">
                        INDEX {city.costIndex}/5
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 sm:p-8 space-y-4 sm:space-y-6">
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-sans font-medium line-clamp-3">
                      {city.description}
                    </p>

                    <div className="space-y-2">
                      <span className="text-[10px] text-gray-400 uppercase font-extrabold tracking-widest block">
                        SIGNATURE HIGHLIGHTS:
                      </span>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {city.highlights.map((h) => (
                          <span
                            key={h}
                            className="px-3 py-1 bg-gray-100 text-gray-700 font-sans text-[11px] sm:text-xs font-bold rounded-full border border-gray-200"
                          >
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-6 sm:p-8 pt-4 flex flex-col sm:flex-row sm:items-center justify-between border-t border-gray-100 bg-gray-50/50 gap-3">
                  <span className="text-xs text-gray-500 font-sans font-semibold">
                    Popularity: <strong className="text-[#1E232A] text-xs sm:text-sm font-black">{city.popularity}%</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onNavigate('activities', { city: city.name })}
                      className="flex-1 sm:flex-initial px-4 py-2 sm:px-5 sm:py-2.5 bg-gray-200 hover:bg-gray-300 text-[#1E232A] font-extrabold text-[11px] sm:text-xs uppercase tracking-wider transition cursor-pointer rounded-full text-center"
                    >
                      ACTIVITIES
                    </button>
                    <button
                      onClick={() => onNavigate('cities', { search: city.name })}
                      className="flex-1 sm:flex-initial px-5 py-2 sm:px-6 sm:py-2.5 bg-[#F5B800] hover:bg-[#E0A600] text-[#1E232A] font-extrabold text-[11px] sm:text-xs uppercase tracking-wider transition cursor-pointer rounded-full shadow-md text-center"
                    >
                      DETAILS &gt;
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. CALLOUT FOOTER BANNER */}
      <section className="w-full px-6 sm:px-12 lg:px-16 pt-6">
        <div className="bg-[#1A1D23] text-white p-8 sm:p-12 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 border-t-4 border-[#F5B800]">
          <div className="space-y-3 max-w-2xl text-center md:text-left">
            <span className="font-script text-[#F5B800] text-3xl block">ready to explore?</span>
            <h3 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-wide uppercase">
              START YOUR ADVENTURE TODAY
            </h3>
            <p className="text-gray-300 text-sm font-sans leading-relaxed">
              Build your route sheet from scratch or clone our curated destination templates. High performance travel planning made simple.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 shrink-0">
            <button
              onClick={() => onNavigate('create-trip')}
              className="px-8 py-4 bg-[#F5B800] hover:bg-[#E0A600] text-[#1E232A] font-bold text-xs tracking-widest uppercase transition shadow-lg cursor-pointer rounded-full"
            >
              PLAN NEW JOURNEY
            </button>
            {isAuthenticated ? (
              <button
                onClick={() => onNavigate('profile')}
                className="px-8 py-4 bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#1E232A] font-bold text-xs tracking-widest uppercase transition cursor-pointer rounded-full"
              >
                MY PASSPORT
              </button>
            ) : (
              <button
                onClick={() => onNavigate('auth')}
                className="px-8 py-4 bg-transparent border-2 border-[#F5B800] text-[#F5B800] hover:bg-[#F5B800] hover:text-[#1E232A] font-bold text-xs tracking-widest uppercase transition cursor-pointer rounded-full"
              >
                SIGN IN / REGISTER
              </button>
            )}
          </div>
        </div>
      </section>

      {/* VIDEO MODAL SHOWCASE */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl bg-black rounded-lg overflow-hidden shadow-2xl">
            <button
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 text-white/80 hover:text-white bg-black/50 rounded-full cursor-pointer"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="aspect-video w-full">
              <iframe
                className="w-full h-full"
                src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="Wanderers Video Showcase"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
