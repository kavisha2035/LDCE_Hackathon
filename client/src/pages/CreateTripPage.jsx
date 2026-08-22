import React, { useState, useEffect } from 'react';
import { createTrip } from '../api/tripsApi';
import { useAuth } from '../context/AuthContext';
import {
  Compass, Calendar, MapPin, DollarSign, Plus, ArrowLeft,
  Sparkles, Image, Check, AlertCircle, Loader2, Globe, FileText
} from 'lucide-react';

const COVER_PRESETS = [
  {
    name: 'Paris & Europe',
    url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'Tokyo Skyline',
    url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'Ancient Rome',
    url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'Kyoto Shrines',
    url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'Barcelona Gaudí',
    url: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'Bali Tropical',
    url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80'
  }
];

export default function CreateTripPage({ onNavigate, onTripCreated }) {
  const { user, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '2026-10-12',
    endDate: '2026-10-21',
    coverPhoto: COVER_PRESETS[0].url,
    initialCityId: '',
    estStayCostPerDay: 120,
    estTransportCost: 200,
  });

  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch cities for optional initial stop
  useEffect(() => {
    fetch('/api/cities')
      .then(res => res.json())
      .then(data => {
        setCities(data.cities || []);
      })
      .catch(err => console.error('Cities load error:', err))
      .finally(() => setLoadingCities(false));
  }, []);

  // Compute duration in days & nights
  const getDuration = () => {
    if (!formData.startDate || !formData.endDate) return null;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    if (isNaN(start) || isNaN(end) || end < start) return null;
    const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);
    const nights = Math.max(0, days - 1);
    return { days, nights };
  };

  const duration = getDuration();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Please provide a trip name or route title.');
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      setError('Please specify both departure and return dates.');
      return;
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setError('Return date cannot be earlier than departure date.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        coverPhoto: formData.coverPhoto.trim() || COVER_PRESETS[0].url,
        userId: user?.id,
        initialCityId: formData.initialCityId || undefined,
        estStayCostPerDay: formData.initialCityId ? parseFloat(formData.estStayCostPerDay || 0) : undefined,
        estTransportCost: formData.initialCityId ? parseFloat(formData.estTransportCost || 0) : undefined,
      };

      const newTrip = await createTrip(payload);

      if (onTripCreated) {
        onTripCreated(newTrip);
      } else {
        // Navigate straight to builder for the new trip
        onNavigate('builder', { tripId: newTrip.id });
      }
    } catch (err) {
      console.error('Failed to create trip:', err);
      setError(err.message || 'Error creating trip. Please verify inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-8">
      
      {/* Header Document Notice */}
      <div className="bg-white border-2 border-[#1F2B2E] p-6 sm:p-8 shadow-[4px_4px_0px_0px_#1F2B2E] space-y-3 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-dashed border-[#1F2B2E]/20 pb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-[#2C5F7C] text-[#F6F3EC] font-mono text-xs font-bold uppercase">
              SCREEN 03 &bull; ROUTE INITIATION
            </span>
            <span className="px-2.5 py-0.5 bg-[#F6F3EC] border border-[#1F2B2E] font-mono text-xs text-[#1F2B2E] font-bold uppercase">
              NEW ITINERARY DRAFT
            </span>
          </div>

          <button
            onClick={() => onNavigate('my-trips')}
            className="font-mono text-xs text-[#2C5F7C] hover:text-[#1F2B2E] font-bold flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to My Trips
          </button>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-[#1F2B2E]">
          PLAN A NEW JOURNEY
        </h1>
        <p className="text-sm text-[#1F2B2E]/80 font-body max-w-2xl">
          Initialize your itinerary route sheet with dates and notes. You will assemble individual ticket stubs, stops, and activities in the Itinerary Builder next.
        </p>
      </div>

      {/* Main Creation Form (Document Styled per frontend-design.md) */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {error && (
          <div className="p-4 bg-[#B84A3E]/10 border-2 border-[#B84A3E] text-[#B84A3E] font-mono text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Section 1: Trip Identity */}
        <div className="bg-white border-2 border-[#1F2B2E] p-6 sm:p-8 shadow-[4px_4px_0px_0px_#1F2B2E] space-y-6">
          <div className="border-b border-[#1F2B2E]/20 pb-2">
            <h2 className="text-xl font-bold font-display text-[#1F2B2E] uppercase">
              1. JOURNEY IDENTITY & DATES
            </h2>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="block font-mono text-xs font-bold text-[#1F2B2E] uppercase">
              Route Name / Trip Title <span className="text-[#B84A3E]">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. European Grand Journey — Paris & Rome"
              className="w-full bg-[#F6F3EC] border-2 border-[#1F2B2E] px-4 py-3 font-mono text-sm text-[#1F2B2E] placeholder-[#1F2B2E]/40 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#2C5F7C] transition"
            />
            <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px] text-[#1F2B2E]/60">
              <span>Suggestions:</span>
              {[
                'Autumn in Kyoto & Tokyo',
                'Mediterranean Coastal Escapade',
                'Southeast Asia Explorer',
                'Scandinavian Northern Lights'
              ].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setFormData({ ...formData, name: s })}
                  className="underline hover:text-[#2C5F7C] cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Dates Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-mono text-xs font-bold text-[#1F2B2E] uppercase">
                Departure Date <span className="text-[#B84A3E]">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full bg-[#F6F3EC] border-2 border-[#1F2B2E] px-4 py-2.5 font-mono text-sm text-[#1F2B2E] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#2C5F7C] transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block font-mono text-xs font-bold text-[#1F2B2E] uppercase">
                Return Date <span className="text-[#B84A3E]">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full bg-[#F6F3EC] border-2 border-[#1F2B2E] px-4 py-2.5 font-mono text-sm text-[#1F2B2E] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#2C5F7C] transition"
                />
              </div>
            </div>
          </div>

          {/* Computed Duration Banner */}
          {duration && (
            <div className="p-3 bg-[#F6F3EC] border border-[#1F2B2E] flex items-center justify-between font-mono text-xs">
              <span className="text-[#1F2B2E]/80">Calculated Route Duration:</span>
              <span className="font-bold text-[#2C5F7C]">
                {duration.days} DAYS &bull; {duration.nights} NIGHTS
              </span>
            </div>
          )}

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block font-mono text-xs font-bold text-[#1F2B2E] uppercase">
              Trip Mission & Overview Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Cultural tour focusing on classical monuments, local gastronomy, and high-speed rail connections."
              className="w-full bg-[#F6F3EC] border-2 border-[#1F2B2E] px-4 py-2.5 font-mono text-sm text-[#1F2B2E] placeholder-[#1F2B2E]/40 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#2C5F7C] transition"
            />
          </div>
        </div>

        {/* Section 2: Cover Imagery Presets */}
        <div className="bg-white border-2 border-[#1F2B2E] p-6 sm:p-8 shadow-[4px_4px_0px_0px_#1F2B2E] space-y-4">
          <div className="border-b border-[#1F2B2E]/20 pb-2">
            <h2 className="text-xl font-bold font-display text-[#1F2B2E] uppercase">
              2. COVER PHOTOGRAPH PRESET
            </h2>
            <p className="text-xs text-[#1F2B2E]/70 font-body">
              Select a destination cover theme or enter a direct image URL.
            </p>
          </div>

          {/* Preset Chips Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {COVER_PRESETS.map((preset) => {
              const isSelected = formData.coverPhoto === preset.url;
              return (
                <div
                  key={preset.name}
                  onClick={() => setFormData({ ...formData, coverPhoto: preset.url })}
                  className={`border-2 cursor-pointer transition relative group overflow-hidden ${
                    isSelected
                      ? 'border-[#2C5F7C] shadow-[3px_3px_0px_0px_#2C5F7C]'
                      : 'border-[#1F2B2E]/30 hover:border-[#1F2B2E]'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="h-20 w-full object-cover"
                  />
                  <div className="p-1.5 bg-white font-mono text-[10px] font-bold text-[#1F2B2E] truncate text-center">
                    {preset.name}
                  </div>
                  {isSelected && (
                    <div className="absolute top-1 right-1 bg-[#2C5F7C] text-white p-0.5 rounded-full">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Custom URL Input */}
          <div className="space-y-1 pt-2">
            <label className="block font-mono text-[11px] font-bold text-[#1F2B2E]/80 uppercase">
              Custom Image URL:
            </label>
            <input
              type="url"
              value={formData.coverPhoto}
              onChange={(e) => setFormData({ ...formData, coverPhoto: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-[#F6F3EC] border border-[#1F2B2E] px-3 py-2 font-mono text-xs text-[#1F2B2E] focus:outline-none focus:bg-white"
            />
          </div>
        </div>

        {/* Section 3: Optional Initial Stop */}
        <div className="bg-white border-2 border-[#1F2B2E] p-6 sm:p-8 shadow-[4px_4px_0px_0px_#1F2B2E] space-y-4">
          <div className="border-b border-[#1F2B2E]/20 pb-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#2C5F7C]" />
              <h2 className="text-xl font-bold font-display text-[#1F2B2E] uppercase">
                3. INITIAL DESTINATION STOP (OPTIONAL)
              </h2>
            </div>
            <p className="text-xs text-[#1F2B2E]/70 font-body">
              Optionally kickstart your route with your first destination city.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block font-mono text-xs font-bold text-[#1F2B2E] uppercase">
                Starting City
              </label>
              <select
                value={formData.initialCityId}
                onChange={(e) => setFormData({ ...formData, initialCityId: e.target.value })}
                className="w-full bg-[#F6F3EC] border-2 border-[#1F2B2E] px-3 py-2.5 font-mono text-xs text-[#1F2B2E] focus:outline-none focus:bg-white"
              >
                <option value="">-- Add later in Builder --</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}, {c.country} (Cost Index {c.costIndex}/5)
                  </option>
                ))}
              </select>
            </div>

            {formData.initialCityId && (
              <>
                <div className="space-y-1.5">
                  <label className="block font-mono text-xs font-bold text-[#1F2B2E] uppercase">
                    Est. Stay / Day (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.estStayCostPerDay}
                    onChange={(e) => setFormData({ ...formData, estStayCostPerDay: e.target.value })}
                    className="w-full bg-[#F6F3EC] border-2 border-[#1F2B2E] px-3 py-2.5 font-mono text-xs text-[#1F2B2E] focus:outline-none focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-mono text-xs font-bold text-[#1F2B2E] uppercase">
                    Est. Transport (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.estTransportCost}
                    onChange={(e) => setFormData({ ...formData, estTransportCost: e.target.value })}
                    className="w-full bg-[#F6F3EC] border-2 border-[#1F2B2E] px-3 py-2.5 font-mono text-xs text-[#1F2B2E] focus:outline-none focus:bg-white"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={() => onNavigate('my-trips')}
            className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-[#F6F3EC] text-[#1F2B2E] border-2 border-[#1F2B2E] font-mono text-xs font-bold uppercase transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3 bg-[#2C5F7C] hover:bg-[#1F2B2E] text-white border-2 border-[#1F2B2E] font-mono text-xs font-bold uppercase transition shadow-[4px_4px_0px_0px_#1F2B2E] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                INITIATING ROUTE SHEET...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                CREATE TRIP & OPEN BUILDER ➔
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}
