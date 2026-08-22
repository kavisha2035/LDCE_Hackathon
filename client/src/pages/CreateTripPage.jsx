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
    <div className="w-full max-w-[1600px] mx-auto px-6 sm:px-12 py-6 space-y-8 font-sans">
      
      {/* Header Document Notice */}
      <div className="bg-white border border-gray-200 rounded-3xl p-8 sm:p-10 shadow-xl space-y-4 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[#1E232A] text-[#F5B800] rounded-full text-xs font-extrabold uppercase tracking-widest shadow">
              ROUTE INITIATION
            </span>
            <span className="px-3 py-1 bg-gray-100 border border-gray-300 text-[#1E232A] rounded-full text-xs font-extrabold uppercase">
              NEW ITINERARY DRAFT
            </span>
          </div>

          <button
            onClick={() => onNavigate('my-trips')}
            className="text-xs text-gray-600 hover:text-[#1E232A] font-extrabold uppercase flex items-center gap-1.5 cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to My Trips
          </button>
        </div>

        <div>
          <span className="font-script text-[#F5B800] text-4xl block">craft your itinerary</span>
          <h1 className="text-4xl sm:text-5xl font-black font-serif tracking-wide text-[#1E232A]">
            PLAN A NEW JOURNEY
          </h1>
          <p className="text-sm text-gray-600 font-sans font-medium max-w-2xl mt-2 leading-relaxed">
            Initialize your itinerary route sheet with dates and notes. You will assemble individual ticket stubs, stops, and activities in the Itinerary Builder next.
          </p>
        </div>
      </div>

      {/* Main Creation Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {error && (
          <div className="p-5 bg-red-50 border border-red-200 text-red-700 font-sans text-xs font-bold rounded-2xl flex items-center gap-3 shadow">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Section 1: Trip Identity */}
        <div className="bg-white border border-gray-200 rounded-3xl p-8 sm:p-10 shadow-xl space-y-6">
          <div className="border-b border-gray-200 pb-3">
            <h2 className="text-2xl font-serif font-black text-[#1E232A] uppercase tracking-wide">
              1. JOURNEY IDENTITY & DATES
            </h2>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="block font-sans text-xs font-extrabold text-[#1E232A] uppercase tracking-wider">
              Route Name / Trip Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. European Grand Journey — Paris & Rome"
              className="w-full bg-gray-50 border border-gray-300 rounded-full px-6 py-3.5 font-sans text-sm text-[#1E232A] placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#F5B800] transition shadow-inner"
            />
            <div className="flex flex-wrap items-center gap-2 pt-1 font-sans text-xs text-gray-500">
              <span className="font-bold">Suggestions:</span>
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
                  className="px-3 py-1 bg-gray-100 hover:bg-[#F5B800] hover:text-[#1E232A] rounded-full text-xs font-semibold transition cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Dates Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block font-sans text-xs font-extrabold text-[#1E232A] uppercase tracking-wider">
                Departure Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full bg-gray-50 border border-gray-300 rounded-full px-6 py-3.5 font-sans text-sm text-[#1E232A] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#F5B800] transition shadow-inner"
              />
            </div>

            <div className="space-y-2">
              <label className="block font-sans text-xs font-extrabold text-[#1E232A] uppercase tracking-wider">
                Return Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full bg-gray-50 border border-gray-300 rounded-full px-6 py-3.5 font-sans text-sm text-[#1E232A] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#F5B800] transition shadow-inner"
              />
            </div>
          </div>

          {/* Computed Duration Banner */}
          {duration && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between font-sans text-xs font-bold">
              <span className="text-gray-600">Calculated Route Duration:</span>
              <span className="px-3 py-1 bg-[#1E232A] text-[#F5B800] rounded-full uppercase tracking-wider shadow">
                {duration.days} DAYS &bull; {duration.nights} NIGHTS
              </span>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <label className="block font-sans text-xs font-extrabold text-[#1E232A] uppercase tracking-wider">
              Trip Mission & Overview Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Cultural tour focusing on classical monuments, local gastronomy, and high-speed rail connections."
              className="w-full bg-gray-50 border border-gray-300 rounded-2xl p-5 font-sans text-sm text-[#1E232A] placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#F5B800] transition shadow-inner"
            />
          </div>
        </div>

        {/* Section 2: Cover Imagery Presets */}
        <div className="bg-white border border-gray-200 rounded-3xl p-8 sm:p-10 shadow-xl space-y-6">
          <div className="border-b border-gray-200 pb-3">
            <h2 className="text-2xl font-serif font-black text-[#1E232A] uppercase tracking-wide">
              2. COVER PHOTOGRAPH PRESET
            </h2>
            <p className="text-xs text-gray-500 font-sans font-medium mt-1">
              Select a destination cover theme or enter a direct image URL.
            </p>
          </div>

          {/* Preset Chips Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {COVER_PRESETS.map((preset) => {
              const isSelected = formData.coverPhoto === preset.url;
              return (
                <div
                  key={preset.name}
                  onClick={() => setFormData({ ...formData, coverPhoto: preset.url })}
                  className={`rounded-2xl border-2 cursor-pointer transition relative group overflow-hidden shadow-md ${
                    isSelected
                      ? 'border-[#F5B800] ring-4 ring-[#F5B800]/20'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="h-24 w-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="p-2 bg-white font-sans text-xs font-bold text-[#1E232A] truncate text-center">
                    {preset.name}
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-[#F5B800] text-[#1E232A] p-1 rounded-full shadow">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Custom URL Input */}
          <div className="space-y-2 pt-2">
            <label className="block font-sans text-xs font-extrabold text-gray-700 uppercase tracking-wider">
              Custom Image URL:
            </label>
            <input
              type="url"
              value={formData.coverPhoto}
              onChange={(e) => setFormData({ ...formData, coverPhoto: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-gray-50 border border-gray-300 rounded-full px-6 py-3 font-sans text-xs text-[#1E232A] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#F5B800] transition"
            />
          </div>
        </div>

        {/* Section 3: Optional Initial Stop */}
        <div className="bg-white border border-gray-200 rounded-3xl p-8 sm:p-10 shadow-xl space-y-6">
          <div className="border-b border-gray-200 pb-3">
            <div className="flex items-center gap-3">
              <MapPin className="h-6 w-6 text-[#F5B800]" />
              <h2 className="text-2xl font-serif font-black text-[#1E232A] uppercase tracking-wide">
                3. INITIAL DESTINATION STOP (OPTIONAL)
              </h2>
            </div>
            <p className="text-xs text-gray-500 font-sans font-medium mt-1">
              Optionally kickstart your route with your first destination city.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block font-sans text-xs font-extrabold text-[#1E232A] uppercase tracking-wider">
                Starting City
              </label>
              <select
                value={formData.initialCityId}
                onChange={(e) => setFormData({ ...formData, initialCityId: e.target.value })}
                className="w-full bg-gray-50 border border-gray-300 rounded-full px-6 py-3.5 font-sans text-xs font-bold text-[#1E232A] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#F5B800] transition shadow-inner"
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
                <div className="space-y-2">
                  <label className="block font-sans text-xs font-extrabold text-[#1E232A] uppercase tracking-wider">
                    Est. Stay / Day (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.estStayCostPerDay}
                    onChange={(e) => setFormData({ ...formData, estStayCostPerDay: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-full px-6 py-3.5 font-sans text-xs font-bold text-[#1E232A] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#F5B800] transition shadow-inner"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block font-sans text-xs font-extrabold text-[#1E232A] uppercase tracking-wider">
                    Est. Transport (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.estTransportCost}
                    onChange={(e) => setFormData({ ...formData, estTransportCost: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-full px-6 py-3.5 font-sans text-xs font-bold text-[#1E232A] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#F5B800] transition shadow-inner"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <button
            type="button"
            onClick={() => onNavigate('my-trips')}
            className="w-full sm:w-auto px-8 py-3.5 bg-gray-100 hover:bg-gray-200 text-[#1E232A] border border-gray-300 font-sans text-xs font-extrabold uppercase transition rounded-full cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-10 py-4 bg-[#F5B800] hover:bg-[#E0A600] text-[#1E232A] font-sans text-xs font-extrabold uppercase transition rounded-full shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
