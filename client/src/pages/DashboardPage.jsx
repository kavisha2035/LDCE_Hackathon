import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TicketCard from '../components/TicketCard';
import { Compass, Plus, MapPin, Calendar, ShieldCheck, Sparkles, ArrowRight, Globe } from 'lucide-react';

const RECOMMENDED_CITIES = [
  { name: 'Tokyo', country: 'Japan', costIndex: 4, popularity: 96, image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=400&q=80' },
  { name: 'Paris', country: 'France', costIndex: 4, popularity: 98, image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80' },
  { name: 'Barcelona', country: 'Spain', costIndex: 3, popularity: 91, image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=400&q=80' },
  { name: 'Bali', country: 'Indonesia', costIndex: 2, popularity: 93, image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=400&q=80' },
  { name: 'Rome', country: 'Italy', costIndex: 3, popularity: 94, image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=400&q=80' },
];

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="space-y-10 py-6 max-w-7xl mx-auto px-6">
      
      {/* Welcome Banner Card */}
      <section className="bg-white border-2 border-[#1F2B2E] p-8 shadow-[4px_4px_0px_0px_#1F2B2E] relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#2C5F7C] text-white font-mono text-xs font-bold uppercase">
              <span>PASSENGER DASHBOARD</span>
              <span>&bull;</span>
              <span>SCREEN 02</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold font-display tracking-tight text-[#1F2B2E]">
              WELCOME BACK, {isAuthenticated ? user.name.toUpperCase() : 'EXPLORER'}
            </h1>
            <p className="text-[#1F2B2E]/80 text-sm font-body leading-relaxed">
              Organize your travel route sheets, manage ticket stubs, and explore curated destination activities.
            </p>
          </div>

          <RouterLink
            to={isAuthenticated ? "/trips/new" : "/login"}
            className="px-6 py-3 bg-[#2C5F7C] hover:bg-[#1F2B2E] text-[#F6F3EC] border-2 border-[#1F2B2E] font-mono text-xs font-bold uppercase transition shadow-[3px_3px_0px_0px_#1F2B2E] flex items-center gap-2 shrink-0"
          >
            <Plus className="h-4 w-4" />
            PLAN NEW TRIP
          </RouterLink>
        </div>
      </section>

      {/* Recommended Destinations (Passport Stamp Chips) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b-2 border-[#1F2B2E]/20 pb-2">
          <h2 className="text-2xl font-bold font-display text-[#1F2B2E] uppercase flex items-center gap-2">
            <Globe className="h-5 w-5 text-[#2C5F7C]" />
            RECOMMENDED DESTINATIONS (POPULARITY STAMPS)
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {RECOMMENDED_CITIES.map((c) => (
            <div 
              key={c.name}
              className="bg-white border-2 border-[#1F2B2E] p-3 shadow-[2px_2px_0px_0px_#1F2B2E] flex flex-col items-center text-center space-y-2 group hover:translate-y-[-2px] transition"
            >
              <img 
                src={c.image} 
                alt={c.name} 
                className="h-16 w-16 rounded-full object-cover border-2 border-[#1F2B2E] shadow-inner"
              />
              <div>
                <h4 className="font-bold font-display text-lg text-[#1F2B2E] leading-tight group-hover:text-[#2C5F7C]">
                  {c.name}
                </h4>
                <span className="text-[10px] font-mono text-[#1F2B2E]/60 uppercase block">
                  {c.country}
                </span>
              </div>
              <span className="px-2 py-0.5 bg-[#F6F3EC] border border-[#1F2B2E] font-mono text-[10px] text-[#B8823A] font-bold">
                INDEX {c.costIndex}/5
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Ticket Stubs Showcase */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold font-display text-[#1F2B2E] uppercase">
          YOUR FEATURED ITINERARY STUBS
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TicketCard
            city="PARIS"
            country="FRANCE"
            dates="OCT 12 — OCT 16, 2026"
            cost={32500}
            activitiesCount={4}
            badge="UPCOMING"
          >
            <p className="text-xs text-[#1F2B2E] font-body mb-3">
              The City of Light, featuring Eiffel Tower summit tour, Seine river evening cruise, and Montmartre food tastings.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-0.5 bg-[#F6F3EC] border border-[#1F2B2E] font-mono text-[10px] text-[#2C5F7C] font-bold">
                #sightseeing
              </span>
              <span className="px-2 py-0.5 bg-[#F6F3EC] border border-[#1F2B2E] font-mono text-[10px] text-[#B8823A] font-bold">
                #culture
              </span>
            </div>
          </TicketCard>

          <TicketCard
            city="TOKYO"
            country="JAPAN"
            dates="NOV 02 — NOV 08, 2026"
            cost={48000}
            activitiesCount={4}
            badge="UPCOMING"
          >
            <p className="text-xs text-[#1F2B2E] font-body mb-3">
              Ultra-modern metropolis blending neon skyscrapers with historic Senso-ji temple and Tsukiji market sushi.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-0.5 bg-[#F6F3EC] border border-[#1F2B2E] font-mono text-[10px] text-[#2C5F7C] font-bold">
                #culture
              </span>
              <span className="px-2 py-0.5 bg-[#F6F3EC] border border-[#1F2B2E] font-mono text-[10px] text-[#7FA69C] font-bold">
                #food
              </span>
            </div>
          </TicketCard>
        </div>
      </section>

    </div>
  );
}
