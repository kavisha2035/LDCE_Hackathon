import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import TicketCard from '../components/TicketCard';
import {
  Compass, Plus, MapPin, Calendar, ShieldCheck, Sparkles,
  ArrowRight, Globe, DollarSign, Clock, Search, Layers,
  PieChart, Share2, Bookmark, CheckCircle2, ChevronRight,
  ExternalLink, SlidersHorizontal, User, Heart, Tag, Eye,
  Plane, Camera, Utensils, Mountain, Palette, Moon
} from 'lucide-react';

const FEATURED_CITIES = [
  {
    name: 'Tokyo',
    country: 'Japan',
    region: 'Asia',
    costIndex: 4,
    popularity: 96,
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=600&q=80',
    description: 'Futuristic skyline, ancient shrines, and world-class culinary mastery.',
    highlights: ['Senso-ji', 'Shibuya Sky', 'Tsukiji Market']
  },
  {
    name: 'Paris',
    country: 'France',
    region: 'Europe',
    costIndex: 4,
    popularity: 98,
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80',
    description: 'The City of Light, romantic boulevards, world-class art and gastronomy.',
    highlights: ['Eiffel Tower', 'Louvre Museum', 'Montmartre']
  },
  {
    name: 'Rome',
    country: 'Italy',
    region: 'Europe',
    costIndex: 3,
    popularity: 94,
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80',
    description: 'Living museum of classical ruins, piazzas, and authentic Italian espresso.',
    highlights: ['Colosseum', 'Vatican City', 'Trevi Fountain']
  },
  {
    name: 'Barcelona',
    country: 'Spain',
    region: 'Europe',
    costIndex: 3,
    popularity: 91,
    image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=600&q=80',
    description: 'Gaudí marvels, Mediterranean beaches, and vibrant tapas nightlife.',
    highlights: ['Sagrada Familia', 'Park Güell', 'Gothic Quarter']
  },
  {
    name: 'Kyoto',
    country: 'Japan',
    region: 'Asia',
    costIndex: 3,
    popularity: 92,
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80',
    description: 'Traditional wooden houses, bamboo groves, and sacred vermilion shrines.',
    highlights: ['Fushimi Inari', 'Arashiyama', 'Kinkaku-ji']
  },
  {
    name: 'Bali',
    country: 'Indonesia',
    region: 'Asia',
    costIndex: 2,
    popularity: 93,
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80',
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

export default function HomePage({
  onNavigate,
  onSelectCity,
  onSelectActivity
}) {
  const { user, isAuthenticated } = useAuth();
  const [heroSearch, setHeroSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [savedCities, setSavedCities] = useState(['Tokyo', 'Paris']);

  const toggleSaveCity = (cityName) => {
    setSavedCities(prev =>
      prev.includes(cityName) ? prev.filter(c => c !== cityName) : [...prev, cityName]
    );
  };

  const filteredCities = selectedRegion === 'All'
    ? FEATURED_CITIES
    : FEATURED_CITIES.filter(c => c.region === selectedRegion);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!heroSearch.trim()) return;
    onNavigate('cities', { search: heroSearch.trim() });
  };

  return (
    <div className="space-y-12 py-4">

      {/* 1. HERO BANNER: The Passenger Terminal Document */}
      <section className="bg-white border-2 border-[#1F2B2E] p-6 sm:p-8 md:p-10 shadow-[5px_5px_0px_0px_#1F2B2E] relative overflow-hidden">
        
        {/* Background Watermark Stamp Motif */}
        <div className="absolute -right-16 -bottom-16 opacity-5 select-none pointer-events-none hidden md:block">
          <div className="w-96 h-96 rounded-full border-8 border-dashed border-[#1F2B2E] flex items-center justify-center font-display font-black text-6xl text-center rotate-12">
            GLOBETROTTER
            <br />
            VOYAGE PASS
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          
          {/* Header Metadata Chips */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-dashed border-[#1F2B2E]/20 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-[#1F2B2E] text-[#F6F3EC] font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#2C5F7C]">
                <Compass className="h-3.5 w-3.5 text-[#7FA69C]" />
                ROUTE DOCUMENT NO. GT-2026-X8
              </span>
              <span className="px-2.5 py-1 bg-[#F6F3EC] border border-[#1F2B2E] font-mono text-[11px] font-bold text-[#2C5F7C] uppercase">
                NEON POSTGRESQL SYNCED
              </span>
              <span className="px-2.5 py-1 bg-[#7FA69C]/20 border border-[#7FA69C] font-mono text-[11px] font-bold text-[#1F2B2E] uppercase">
                ● VOYAGE READY
              </span>
            </div>

            <div className="font-mono text-xs text-[#1F2B2E]/70 flex items-center gap-2">
              <span>DEPARTURE HUB:</span>
              <span className="font-bold text-[#1F2B2E]">GLOBAL TERMINAL</span>
            </div>
          </div>

          {/* Headline & Mission */}
          <div className="max-w-3xl space-y-3">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold font-display tracking-tight text-[#1F2B2E] leading-none">
              JOURNEYS MAPPED AS <span className="text-[#2C5F7C] underline decoration-[#B8823A] decoration-4">LIVING DOCUMENTS</span>.
            </h1>
            <p className="text-[#1F2B2E]/80 text-base sm:text-lg font-body leading-relaxed max-w-2xl">
              Construct multi-city itineraries, perforated ticket stubs, real-time cost ledgers, and day-by-day timeline schedules — all synced in one cohesive travel sheet.
            </p>
          </div>

          {/* Interactive Search & Quick Action Launchpad */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-2">
            <form onSubmit={handleSearchSubmit} className="lg:col-span-8 flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1F2B2E]/50" />
                <input
                  type="text"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  placeholder="Search destinations (e.g. Tokyo, Paris, Rome, Bali)..."
                  className="w-full bg-[#F6F3EC] border-2 border-[#1F2B2E] pl-10 pr-4 py-3 font-mono text-sm text-[#1F2B2E] placeholder-[#1F2B2E]/40 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#2C5F7C] transition shadow-[2px_2px_0px_0px_#1F2B2E]"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-[#2C5F7C] hover:bg-[#1F2B2E] text-[#F6F3EC] border-2 border-[#1F2B2E] font-mono text-xs font-bold uppercase transition shadow-[3px_3px_0px_0px_#1F2B2E] flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <Search className="h-4 w-4" />
                EXPLORE CITY
              </button>
            </form>

            <div className="lg:col-span-4 flex items-center gap-2">
              <button
                onClick={() => onNavigate('create-trip')}
                className="w-full px-5 py-3 bg-[#B8823A] hover:bg-[#1F2B2E] text-white border-2 border-[#1F2B2E] font-mono text-xs font-bold uppercase transition shadow-[3px_3px_0px_0px_#1F2B2E] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                PLAN NEW JOURNEY
              </button>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#1F2B2E]/10">
            <div className="p-3 bg-[#F6F3EC] border border-[#1F2B2E] flex flex-col">
              <span className="font-mono text-[10px] text-[#1F2B2E]/60 uppercase">ACTIVE STOPS</span>
              <span className="font-mono font-bold text-lg text-[#2C5F7C]">3 STOPS (18 DAYS)</span>
            </div>
            <div className="p-3 bg-[#F6F3EC] border border-[#1F2B2E] flex flex-col">
              <span className="font-mono text-[10px] text-[#1F2B2E]/60 uppercase">SCHEDULED ACTIVITIES</span>
              <span className="font-mono font-bold text-lg text-[#1F2B2E]">11 EXPERIENCES</span>
            </div>
            <div className="p-3 bg-[#F6F3EC] border border-[#1F2B2E] flex flex-col">
              <span className="font-mono text-[10px] text-[#1F2B2E]/60 uppercase">ESTIMATED LEDGER</span>
              <span className="font-mono font-bold text-lg text-[#B8823A]">₹1,18,700 TOTAL</span>
            </div>
            <div className="p-3 bg-[#F6F3EC] border border-[#1F2B2E] flex flex-col">
              <span className="font-mono text-[10px] text-[#1F2B2E]/60 uppercase">PUBLIC SHARING</span>
              <span className="font-mono font-bold text-lg text-[#7FA69C]">PASS LIVE ⚡</span>
            </div>
          </div>

        </div>
      </section>

      {/* 2. ACTIVE ROUTE SHEET WORKSPACE (Interactive Trip Deck) */}
      <section className="space-y-4">
        
        {/* Section Heading & Sub-Tab Control */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#1F2B2E] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 bg-[#2C5F7C] rounded-full animate-pulse"></span>
              <span className="font-mono text-xs font-bold uppercase text-[#2C5F7C]">ACTIVE MASTER TRIP</span>
            </div>
            <h2 className="text-3xl font-extrabold font-display tracking-tight text-[#1F2B2E]">
              GRAND CONTINENTAL ODYSSEY 2026
            </h2>
            <div className="font-mono text-xs text-[#1F2B2E]/70 flex flex-wrap items-center gap-3 mt-1">
              <span>🗓 OCT 12 — NOV 05, 2026</span>
              <span>•</span>
              <span>📍 PARIS ➔ TOKYO ➔ ROME</span>
              <span>•</span>
              <span className="text-[#B8823A] font-bold">₹1,18,700 ESTIMATE</span>
            </div>
          </div>

          {/* Quick Action Switchers */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <button
              onClick={() => onNavigate('my-trips')}
              className="px-3 py-1.5 bg-[#1F2B2E] hover:bg-[#2C5F7C] text-white border-2 border-[#1F2B2E] font-bold uppercase transition flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#2C5F7C] cursor-pointer"
            >
              <Layers className="h-3.5 w-3.5 text-[#7FA69C]" />
              MY TRIPS WALLET
            </button>
            <button
              onClick={() => onNavigate('builder')}
              className="px-3 py-1.5 bg-white hover:bg-[#F6F3EC] text-[#1F2B2E] border-2 border-[#1F2B2E] font-bold uppercase transition flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#1F2B2E] cursor-pointer"
            >
              <Layers className="h-3.5 w-3.5 text-[#2C5F7C]" />
              EDIT IN BUILDER
            </button>
            <button
              onClick={() => onNavigate('budget')}
              className="px-3 py-1.5 bg-white hover:bg-[#F6F3EC] text-[#1F2B2E] border-2 border-[#1F2B2E] font-bold uppercase transition flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#1F2B2E] cursor-pointer"
            >
              <DollarSign className="h-3.5 w-3.5 text-[#B8823A]" />
              BUDGET LEDGER
            </button>
            <button
              onClick={() => onNavigate('calendar')}
              className="px-3 py-1.5 bg-white hover:bg-[#F6F3EC] text-[#1F2B2E] border-2 border-[#1F2B2E] font-bold uppercase transition flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#1F2B2E] cursor-pointer"
            >
              <Calendar className="h-3.5 w-3.5 text-[#2C5F7C]" />
              TIMELINE VIEW
            </button>
            <button
              onClick={() => onNavigate('share')}
              className="px-3 py-1.5 bg-[#7FA69C] hover:bg-[#1F2B2E] text-white border-2 border-[#1F2B2E] font-bold uppercase transition flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#1F2B2E] cursor-pointer"
            >
              <Share2 className="h-3.5 w-3.5" />
              SHARE LINK
            </button>
          </div>
        </div>

        {/* Stops Ticket Stubs Deck */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

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
                  className="px-2.5 py-1 bg-[#F6F3EC] border border-[#1F2B2E] hover:bg-[#2C5F7C] hover:text-white font-mono text-[11px] font-bold uppercase transition cursor-pointer"
                >
                  + Add Activity
                </button>
                <button
                  onClick={() => onNavigate('itinerary')}
                  className="px-2.5 py-1 bg-[#1F2B2E] text-white border border-[#1F2B2E] font-mono text-[11px] font-bold uppercase transition cursor-pointer"
                >
                  View Details
                </button>
              </div>
            }
          >
            <p className="text-xs text-[#1F2B2E] font-body mb-3">
              The City of Light: summiting the Eiffel Tower, Louvre masterpieces, and walking the historic alleys of Montmartre.
            </p>
            <div className="space-y-1.5 mb-3 font-mono text-[11px]">
              <div className="flex items-center justify-between text-[#1F2B2E]/80 bg-[#F6F3EC] px-2 py-1 border border-[#1F2B2E]/10">
                <span>🏨 4 Nights Stay</span>
                <span className="font-bold">₹18,000</span>
              </div>
              <div className="flex items-center justify-between text-[#1F2B2E]/80 bg-[#F6F3EC] px-2 py-1 border border-[#1F2B2E]/10">
                <span>🎯 4 Activities</span>
                <span className="font-bold">₹8,700</span>
              </div>
              <div className="flex items-center justify-between text-[#1F2B2E]/80 bg-[#F6F3EC] px-2 py-1 border border-[#1F2B2E]/10">
                <span>🚆 Eurostar Rail</span>
                <span className="font-bold">₹5,800</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2 py-0.5 bg-[#F6F3EC] border border-[#1F2B2E] font-mono text-[10px] text-[#2C5F7C] font-bold">#sightseeing</span>
              <span className="px-2 py-0.5 bg-[#F6F3EC] border border-[#1F2B2E] font-mono text-[10px] text-[#B8823A] font-bold">#culture</span>
              <span className="px-2 py-0.5 bg-[#F6F3EC] border border-[#1F2B2E] font-mono text-[10px] text-[#7FA69C] font-bold">#food</span>
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
                  className="px-2.5 py-1 bg-[#F6F3EC] border border-[#1F2B2E] hover:bg-[#2C5F7C] hover:text-white font-mono text-[11px] font-bold uppercase transition cursor-pointer"
                >
                  + Add Activity
                </button>
                <button
                  onClick={() => onNavigate('itinerary')}
                  className="px-2.5 py-1 bg-[#1F2B2E] text-white border border-[#1F2B2E] font-mono text-[11px] font-bold uppercase transition cursor-pointer"
                >
                  View Details
                </button>
              </div>
            }
          >
            <p className="text-xs text-[#1F2B2E] font-body mb-3">
              Ultra-modern neon metropolis blended with ancient Senso-ji temple, Shibuya skyline, and Tsukiji market street food.
            </p>
            <div className="space-y-1.5 mb-3 font-mono text-[11px]">
              <div className="flex items-center justify-between text-[#1F2B2E]/80 bg-[#F6F3EC] px-2 py-1 border border-[#1F2B2E]/10">
                <span>🏨 8 Nights Stay</span>
                <span className="font-bold">₹28,000</span>
              </div>
              <div className="flex items-center justify-between text-[#1F2B2E]/80 bg-[#F6F3EC] px-2 py-1 border border-[#1F2B2E]/10">
                <span>🎯 4 Activities</span>
                <span className="font-bold">₹8,000</span>
              </div>
              <div className="flex items-center justify-between text-[#1F2B2E]/80 bg-[#F6F3EC] px-2 py-1 border border-[#1F2B2E]/10">
                <span>✈️ Int'l Airfare</span>
                <span className="font-bold">₹12,000</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2 py-0.5 bg-[#F6F3EC] border border-[#1F2B2E] font-mono text-[10px] text-[#2C5F7C] font-bold">#culture</span>
              <span className="px-2 py-0.5 bg-[#F6F3EC] border border-[#1F2B2E] font-mono text-[10px] text-[#7FA69C] font-bold">#food</span>
              <span className="px-2 py-0.5 bg-[#F6F3EC] border border-[#1F2B2E] font-mono text-[10px] text-[#B8823A] font-bold">#tech</span>
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
                  className="px-2.5 py-1 bg-[#F6F3EC] border border-[#1F2B2E] hover:bg-[#2C5F7C] hover:text-white font-mono text-[11px] font-bold uppercase transition cursor-pointer"
                >
                  + Add Activity
                </button>
                <button
                  onClick={() => onNavigate('itinerary')}
                  className="px-2.5 py-1 bg-[#1F2B2E] text-white border border-[#1F2B2E] font-mono text-[11px] font-bold uppercase transition cursor-pointer"
                >
                  View Details
                </button>
              </div>
            }
          >
            <p className="text-xs text-[#1F2B2E] font-body mb-3">
              Imperial history and vibrant piazza life: Colosseum underground, Vatican museums, and evening pasta in Trastevere.
            </p>
            <div className="space-y-1.5 mb-3 font-mono text-[11px]">
              <div className="flex items-center justify-between text-[#1F2B2E]/80 bg-[#F6F3EC] px-2 py-1 border border-[#1F2B2E]/10">
                <span>🏨 7 Nights Stay</span>
                <span className="font-bold">₹22,000</span>
              </div>
              <div className="flex items-center justify-between text-[#1F2B2E]/80 bg-[#F6F3EC] px-2 py-1 border border-[#1F2B2E]/10">
                <span>🎯 3 Activities</span>
                <span className="font-bold">₹9,200</span>
              </div>
              <div className="flex items-center justify-between text-[#1F2B2E]/80 bg-[#F6F3EC] px-2 py-1 border border-[#1F2B2E]/10">
                <span>🚆 Frecciarossa Rail</span>
                <span className="font-bold">₹7,000</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2 py-0.5 bg-[#F6F3EC] border border-[#1F2B2E] font-mono text-[10px] text-[#2C5F7C] font-bold">#history</span>
              <span className="px-2 py-0.5 bg-[#F6F3EC] border border-[#1F2B2E] font-mono text-[10px] text-[#B8823A] font-bold">#sightseeing</span>
              <span className="px-2 py-0.5 bg-[#F6F3EC] border border-[#1F2B2E] font-mono text-[10px] text-[#7FA69C] font-bold">#food</span>
            </div>
          </TicketCard>

        </div>

      </section>

      {/* 3. CURATED DESTINATION STAMPS (Screen 7 Discovery Showcase) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#1F2B2E] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-[#2C5F7C]" />
              <span className="font-mono text-xs font-bold uppercase text-[#2C5F7C]">SCREEN 7 • DISCOVERY</span>
            </div>
            <h2 className="text-3xl font-extrabold font-display tracking-tight text-[#1F2B2E]">
              RECOMMENDED DESTINATIONS (PASSPORT STAMPS)
            </h2>
            <p className="text-xs text-[#1F2B2E]/70 font-body">
              Seeded reference cities with cost indices, popularity ratings, and activity catalogs.
            </p>
          </div>

          {/* Region Filters */}
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
            {['All', 'Europe', 'Asia'].map((reg) => (
              <button
                key={reg}
                onClick={() => setSelectedRegion(reg)}
                className={`px-3 py-1 border border-[#1F2B2E] uppercase font-bold transition cursor-pointer ${
                  selectedRegion === reg ? 'bg-[#1F2B2E] text-white' : 'bg-white text-[#1F2B2E] hover:bg-[#F6F3EC]'
                }`}
              >
                {reg}
              </button>
            ))}
            <button
              onClick={() => onNavigate('cities')}
              className="px-3 py-1 bg-[#2C5F7C] text-white border border-[#1F2B2E] uppercase font-bold transition hover:bg-[#1F2B2E] flex items-center gap-1 cursor-pointer"
            >
              All Cities <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Destination Stamp Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCities.map((city) => {
            const isSaved = savedCities.includes(city.name);
            return (
              <div
                key={city.name}
                className="bg-white border-2 border-[#1F2B2E] shadow-[4px_4px_0px_0px_#1F2B2E] overflow-hidden flex flex-col justify-between group hover:translate-y-[-2px] transition duration-150"
              >
                <div>
                  {/* Card Image Banner */}
                  <div className="relative h-44 overflow-hidden border-b-2 border-[#1F2B2E]">
                    <img
                      src={city.image}
                      alt={city.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1F2B2E]/80 via-transparent to-transparent"></div>
                    
                    {/* Floating Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-[#1F2B2E] text-white font-mono text-[10px] font-bold uppercase border border-[#F6F3EC]">
                        {city.country}
                      </span>
                    </div>

                    <button
                      onClick={() => toggleSaveCity(city.name)}
                      title={isSaved ? "Saved to Bucket List" : "Save destination"}
                      className={`absolute top-3 right-3 p-2 rounded-full border border-[#1F2B2E] transition cursor-pointer ${
                        isSaved ? 'bg-[#B84A3E] text-white' : 'bg-white/90 text-[#1F2B2E] hover:bg-white'
                      }`}
                    >
                      <Heart className={`h-3.5 w-3.5 ${isSaved ? 'fill-white' : ''}`} />
                    </button>

                    {/* Bottom Title on Image */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                      <div>
                        <h3 className="text-2xl font-bold font-display tracking-tight text-white leading-none">
                          {city.name}
                        </h3>
                        <span className="font-mono text-[11px] text-[#7FA69C] uppercase font-bold">
                          {city.region} Region
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 bg-[#B8823A] text-white font-mono text-[10px] font-bold uppercase">
                          Index {city.costIndex}/5
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3">
                    <p className="text-xs text-[#1F2B2E]/80 font-body leading-relaxed">
                      {city.description}
                    </p>

                    <div className="space-y-1">
                      <span className="font-mono text-[10px] text-[#1F2B2E]/60 uppercase font-bold block">
                        Signature Highlights:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {city.highlights.map((h) => (
                          <span
                            key={h}
                            className="px-2 py-0.5 bg-[#F6F3EC] border border-[#1F2B2E]/30 font-mono text-[10px] text-[#2C5F7C] font-bold"
                          >
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-4 pt-0 border-t border-[#1F2B2E]/10 flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] text-[#1F2B2E]/70">
                    Popularity: <strong className="text-[#1F2B2E]">{city.popularity}%</strong>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onNavigate('activities', { city: city.name })}
                      className="px-2.5 py-1.5 bg-[#F6F3EC] hover:bg-[#2C5F7C] hover:text-white border border-[#1F2B2E] font-mono text-xs font-bold uppercase transition flex items-center gap-1 cursor-pointer"
                    >
                      Activities
                    </button>
                    <button
                      onClick={() => onNavigate('cities', { search: city.name })}
                      className="px-2.5 py-1.5 bg-[#1F2B2E] hover:bg-[#2C5F7C] text-white border border-[#1F2B2E] font-mono text-xs font-bold uppercase transition flex items-center gap-1 cursor-pointer"
                    >
                      Details <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. CURATED EXPERIENCES & ACTIVITIES SHOWCASE (Screen 8 Preview) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#1F2B2E] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-[#2C5F7C]" />
              <span className="font-mono text-xs font-bold uppercase text-[#2C5F7C]">SCREEN 8 • CURATED EXPERIENCES</span>
            </div>
            <h2 className="text-3xl font-extrabold font-display tracking-tight text-[#1F2B2E]">
              FEATURED ROUTE ACTIVITIES
            </h2>
            <p className="text-xs text-[#1F2B2E]/70 font-body">
              Filterable by category (sightseeing, food, adventure, culture, nightlife) and duration.
            </p>
          </div>

          <button
            onClick={() => onNavigate('activities')}
            className="px-4 py-2 bg-[#2C5F7C] hover:bg-[#1F2B2E] text-white border-2 border-[#1F2B2E] font-mono text-xs font-bold uppercase transition shadow-[2px_2px_0px_0px_#1F2B2E] flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Search className="h-3.5 w-3.5" />
            OPEN FULL ACTIVITY CATALOG
          </button>
        </div>

        {/* Activity Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED_ACTIVITIES.map((act) => (
            <div
              key={act.id}
              className="bg-white border-2 border-[#1F2B2E] shadow-[4px_4px_0px_0px_#1F2B2E] p-4 flex flex-col justify-between space-y-4 hover:translate-y-[-2px] transition duration-150"
            >
              <div className="space-y-3">
                <div className="relative h-36 border border-[#1F2B2E] overflow-hidden">
                  <img
                    src={act.imageUrl}
                    alt={act.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#1F2B2E] text-white font-mono text-[10px] font-bold uppercase">
                    {act.cityName}, {act.country}
                  </div>
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-[#B8823A] text-white font-mono text-[10px] font-bold uppercase">
                    {act.cost > 0 ? `₹${act.cost}` : 'FREE'}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-[#2C5F7C] font-bold mb-1">
                    <span className="uppercase">#{act.category}</span>
                    <span>⏱ {act.durationHours} hrs</span>
                  </div>
                  <h4 className="font-bold text-lg font-display text-[#1F2B2E] leading-tight">
                    {act.name}
                  </h4>
                  <p className="text-xs text-[#1F2B2E]/70 font-body mt-1 line-clamp-2">
                    {act.description}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-[#1F2B2E]/10 flex items-center justify-between">
                <span className="font-mono text-xs text-[#B8823A] font-bold">
                  {act.cost > 0 ? `₹${act.cost.toLocaleString('en-IN')}` : 'Included (Free)'}
                </span>
                <button
                  onClick={() => onNavigate('activities', { search: act.name })}
                  className="px-3 py-1 bg-[#F6F3EC] hover:bg-[#2C5F7C] hover:text-white border border-[#1F2B2E] font-mono text-xs font-bold uppercase transition cursor-pointer"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. DUAL INTELLIGENCE PANELS: Budget Calculation & Public Share Preview */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Panel A: Budget Breakdown Ledger (Screen 9) */}
        <div className="bg-white border-2 border-[#1F2B2E] p-6 shadow-[4px_4px_0px_0px_#1F2B2E] space-y-4">
          <div className="flex items-center justify-between border-b-2 border-[#1F2B2E]/20 pb-3">
            <div>
              <span className="font-mono text-[10px] font-bold uppercase text-[#B8823A]">SCREEN 9 • SERVER ARITHMETIC</span>
              <h3 className="text-2xl font-bold font-display text-[#1F2B2E] uppercase">
                TRIP BUDGET & COST LEDGER
              </h3>
            </div>
            <button
              onClick={() => onNavigate('budget')}
              className="px-3 py-1.5 bg-[#B8823A] hover:bg-[#1F2B2E] text-white border border-[#1F2B2E] font-mono text-xs font-bold uppercase transition cursor-pointer"
            >
              Open Ledger ➔
            </button>
          </div>

          <p className="text-xs text-[#1F2B2E]/80 font-body">
            Budget is dynamically calculated from <code className="font-mono bg-[#F6F3EC] px-1 py-0.5 border border-[#1F2B2E]/20 text-[#2C5F7C]">stay_cost × nights + transport + Σ activities</code> — guaranteed to never drift out of sync.
          </p>

          {/* Mini Visual Bar */}
          <div className="space-y-2">
            <div className="flex justify-between font-mono text-xs font-bold">
              <span>Total Estimated Spend</span>
              <span className="text-[#B8823A]">₹1,18,700 (₹4,945 / day)</span>
            </div>
            <div className="h-4 bg-[#F6F3EC] border border-[#1F2B2E] flex overflow-hidden">
              <div style={{ width: '52%' }} title="Accommodations (52%)" className="bg-[#2C5F7C] h-full"></div>
              <div style={{ width: '28%' }} title="Transport (28%)" className="bg-[#B8823A] h-full"></div>
              <div style={{ width: '20%' }} title="Activities (20%)" className="bg-[#7FA69C] h-full"></div>
            </div>
            <div className="flex flex-wrap gap-4 font-mono text-[11px] text-[#1F2B2E]/80">
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 bg-[#2C5F7C] inline-block border border-[#1F2B2E]"></span> Stay: ₹68,000 (52%)
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 bg-[#B8823A] inline-block border border-[#1F2B2E]"></span> Transport: ₹24,800 (28%)
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 bg-[#7FA69C] inline-block border border-[#1F2B2E]"></span> Activities: ₹25,900 (20%)
              </span>
            </div>
          </div>

          <div className="p-3 bg-[#7FA69C]/10 border border-[#7FA69C] flex items-center justify-between text-xs font-mono">
            <span className="text-[#1F2B2E] font-bold">● WITHIN ESTIMATED THRESHOLD</span>
            <span className="text-[#2C5F7C] font-bold">₹31,300 REMAINING BUFFER</span>
          </div>
        </div>

        {/* Panel B: Public Share & Boarding Pass (Screen 11) */}
        <div className="bg-white border-2 border-[#1F2B2E] p-6 shadow-[4px_4px_0px_0px_#1F2B2E] space-y-4">
          <div className="flex items-center justify-between border-b-2 border-[#1F2B2E]/20 pb-3">
            <div>
              <span className="font-mono text-[10px] font-bold uppercase text-[#7FA69C]">SCREEN 11 • PUBLIC PASS</span>
              <h3 className="text-2xl font-bold font-display text-[#1F2B2E] uppercase">
                SHAREABLE ITINERARY PASS
              </h3>
            </div>
            <button
              onClick={() => onNavigate('share')}
              className="px-3 py-1.5 bg-[#7FA69C] hover:bg-[#1F2B2E] text-white border border-[#1F2B2E] font-mono text-xs font-bold uppercase transition cursor-pointer"
            >
              View Pass ➔
            </button>
          </div>

          <p className="text-xs text-[#1F2B2E]/80 font-body">
            Generate an authenticated public URL with no login required for travel companions, family, or social sharing.
          </p>

          <div className="p-3 bg-[#F6F3EC] border border-[#1F2B2E] font-mono text-xs flex items-center justify-between gap-2">
            <div className="truncate text-[#2C5F7C] font-bold">
              https://globetrotter.io/share/europe-grand-2026-x8f1
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText('https://globetrotter.io/share/europe-grand-2026-x8f1');
                alert('Public link copied to clipboard!');
              }}
              className="px-2.5 py-1 bg-white border border-[#1F2B2E] hover:bg-[#1F2B2E] hover:text-white font-bold uppercase text-[10px] transition cursor-pointer shrink-0"
            >
              Copy Link
            </button>
          </div>

          <div className="border border-dashed border-[#1F2B2E] p-3 flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-[#1F2B2E]/70 block text-[10px]">ONE-CLICK CLONE</span>
              <strong className="text-[#1F2B2E]">"Copy Trip" directly into Viewer's Account</strong>
            </div>
            <span className="px-2 py-0.5 bg-[#1F2B2E] text-white font-bold text-[10px]">READY</span>
          </div>
        </div>

      </section>

      {/* 6. PASSENGER PASSPORT FOOTER CALLOUT */}
      <section className="bg-[#1F2B2E] text-[#F6F3EC] border-2 border-[#1F2B2E] p-8 shadow-[5px_5px_0px_0px_#2C5F7C] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#B8823A] text-white font-mono text-[10px] font-bold uppercase">
            <span>OFFICIAL PASSENGER LEDGER</span>
            <span>&bull;</span>
            <span>CUSTOMS & PASSPORT EMBED</span>
          </div>
          <h3 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-[#F6F3EC]">
            READY TO PLAN YOUR NEXT EXPEDITION?
          </h3>
          <p className="text-[#F6F3EC]/80 text-sm font-body">
            Build your route sheet from scratch or clone our curated destination templates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('builder')}
            className="px-6 py-3 bg-[#F6F3EC] text-[#1F2B2E] hover:bg-[#7FA69C] hover:text-white border-2 border-[#F6F3EC] font-mono text-xs font-bold uppercase transition shadow-[3px_3px_0px_0px_#2C5F7C] flex items-center gap-2 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            START TRIP BUILDER
          </button>
          {isAuthenticated ? (
            <button
              onClick={() => onNavigate('profile')}
              className="px-6 py-3 bg-transparent text-[#F6F3EC] hover:bg-[#F6F3EC]/10 border-2 border-[#F6F3EC] font-mono text-xs font-bold uppercase transition flex items-center gap-2 cursor-pointer"
            >
              <User className="h-4 w-4" />
              VIEW PASSPORT PROFILE
            </button>
          ) : (
            <button
              onClick={() => onNavigate('auth')}
              className="px-6 py-3 bg-[#2C5F7C] text-white hover:bg-white hover:text-[#1F2B2E] border-2 border-[#2C5F7C] font-mono text-xs font-bold uppercase transition flex items-center gap-2 cursor-pointer"
            >
              <User className="h-4 w-4" />
              SIGN IN / REGISTER
            </button>
          )}
        </div>
      </section>

    </div>
  );
}
