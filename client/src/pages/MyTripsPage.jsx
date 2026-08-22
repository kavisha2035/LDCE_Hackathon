import React, { useState, useEffect } from 'react';
import { fetchTrips, deleteTrip, shareTrip } from '../api/tripsApi';
import { useAuth } from '../context/AuthContext';
import {
  Compass, Plus, Calendar, MapPin, DollarSign, Layers,
  Share2, Trash2, Edit3, Eye, Search, Filter, Check,
  ExternalLink, AlertCircle, Sparkles, Globe, Clock, Loader2,
  Lock, Unlock, ArrowRight
} from 'lucide-react';

export default function MyTripsPage({ onNavigate }) {
  const { user, isAuthenticated } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'public', 'private'
  const [deletingId, setDeletingId] = useState(null);
  const [sharingId, setSharingId] = useState(null);

  const loadTrips = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchTrips();
      setTrips(data || []);
    } catch (err) {
      console.error('Load trips error:', err);
      setError('Failed to load trips. Showing cached itineraries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, []);

  const handleDelete = async (tripId, tripName) => {
    if (!window.confirm(`Are you sure you want to delete "${tripName}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(tripId);
    try {
      await deleteTrip(tripId);
      setTrips(prev => prev.filter(t => t.id !== tripId));
    } catch (err) {
      console.error('Delete error:', err);
      alert(err.message || 'Failed to delete trip');
    } finally {
      setDeletingId(null);
    }
  };

  const handleShareToggle = async (trip) => {
    setSharingId(trip.id);
    try {
      const newStatus = !trip.isPublic;
      const res = await shareTrip(trip.id, newStatus);
      setTrips(prev => prev.map(t => {
        if (t.id === trip.id) {
          return { ...t, isPublic: newStatus, shareSlug: res.shareSlug || t.shareSlug };
        }
        return t;
      }));
    } catch (err) {
      console.error('Share toggle error:', err);
      alert('Failed to update share setting');
    } finally {
      setSharingId(null);
    }
  };

  // Filter trips
  const filteredTrips = trips.filter(trip => {
    const matchesSearch = trip.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (trip.description && trip.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (trip.stops && trip.stops.some(s => s.city?.name?.toLowerCase().includes(searchQuery.toLowerCase())));

    if (!matchesSearch) return false;
    if (filterStatus === 'public') return trip.isPublic;
    if (filterStatus === 'private') return !trip.isPublic;
    return true;
  });

  // Calculate summary metrics
  const totalTrips = trips.length;
  const totalStops = trips.reduce((acc, t) => acc + (t.stops?.length || 0), 0);
  const totalPublic = trips.filter(t => t.isPublic).length;

  return (
    <div className="space-y-8 py-4">

      {/* Header & Wallet Banner */}
      <div className="bg-white border-2 border-[#1F2B2E] p-6 sm:p-8 shadow-[4px_4px_0px_0px_#1F2B2E] space-y-4 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-dashed border-[#1F2B2E]/20 pb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-[#2C5F7C] text-[#F6F3EC] font-mono text-xs font-bold uppercase">
              SCREEN 04 &bull; TICKET WALLET
            </span>
            <span className="px-2.5 py-0.5 bg-[#F6F3EC] border border-[#1F2B2E] font-mono text-xs text-[#1F2B2E] font-bold uppercase">
              {isAuthenticated ? `${user?.name?.toUpperCase()}'S ITINERARIES` : 'PASSENGER ITINERARIES'}
            </span>
          </div>

          <button
            onClick={() => onNavigate('create-trip')}
            className="px-4 py-2 bg-[#2C5F7C] hover:bg-[#1F2B2E] text-white border-2 border-[#1F2B2E] font-mono text-xs font-bold uppercase transition shadow-[3px_3px_0px_0px_#1F2B2E] flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            + PLAN NEW TRIP
          </button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-[#1F2B2E]">
              MY ROUTE SHEETS & ITINERARIES
            </h1>
            <p className="text-sm text-[#1F2B2E]/80 font-body max-w-2xl mt-1">
              Your collection of travel route documents, ticket stubs, budget calculations, and shareable boarding passes.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3 bg-[#F6F3EC] border border-[#1F2B2E] text-center font-mono min-w-[90px]">
              <span className="text-[10px] text-[#1F2B2E]/60 uppercase block">TRIPS</span>
              <strong className="text-lg text-[#2C5F7C]">{totalTrips}</strong>
            </div>
            <div className="p-3 bg-[#F6F3EC] border border-[#1F2B2E] text-center font-mono min-w-[90px]">
              <span className="text-[10px] text-[#1F2B2E]/60 uppercase block">TOTAL STOPS</span>
              <strong className="text-lg text-[#1F2B2E]">{totalStops}</strong>
            </div>
            <div className="p-3 bg-[#F6F3EC] border border-[#1F2B2E] text-center font-mono min-w-[90px]">
              <span className="text-[10px] text-[#1F2B2E]/60 uppercase block">PUBLIC</span>
              <strong className="text-lg text-[#7FA69C]">{totalPublic}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1F2B2E]/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search trips by name, city, or description..."
            className="w-full bg-white border-2 border-[#1F2B2E] pl-10 pr-4 py-2.5 font-mono text-xs text-[#1F2B2E] placeholder-[#1F2B2E]/40 focus:outline-none focus:ring-2 focus:ring-[#2C5F7C]"
          />
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          {['all', 'public', 'private'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-2 border border-[#1F2B2E] uppercase font-bold transition cursor-pointer ${
                filterStatus === status
                  ? 'bg-[#1F2B2E] text-white shadow-[2px_2px_0px_0px_#2C5F7C]'
                  : 'bg-white text-[#1F2B2E] hover:bg-[#F6F3EC]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Trips Vertical List (Wallet Format per frontend-design.md) */}
      {loading ? (
        <div className="bg-white border-2 border-[#1F2B2E] p-12 text-center font-mono text-sm space-y-2">
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#2C5F7C]" />
          <span>Retrieving travel route documents...</span>
        </div>
      ) : filteredTrips.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-[#1F2B2E] p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-[#F6F3EC] border-2 border-[#1F2B2E] rounded-full mx-auto flex items-center justify-center">
            <Compass className="h-8 w-8 text-[#2C5F7C]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold font-display text-[#1F2B2E]">
              NO TRIPS YET — PLAN YOUR FIRST ROUTE.
            </h3>
            <p className="text-xs text-[#1F2B2E]/70 font-body max-w-md mx-auto">
              You have no active itinerary sheets matching your criteria. Start drafting a multi-city journey now.
            </p>
          </div>
          <button
            onClick={() => onNavigate('create-trip')}
            className="px-6 py-3 bg-[#2C5F7C] hover:bg-[#1F2B2E] text-white border-2 border-[#1F2B2E] font-mono text-xs font-bold uppercase transition shadow-[3px_3px_0px_0px_#1F2B2E] inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            CREATE FIRST TRIP
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredTrips.map((trip) => {
            const stopsCount = trip.stops?.length || 0;
            const isDeleting = deletingId === trip.id;
            const isSharing = sharingId === trip.id;

            return (
              <div
                key={trip.id}
                className="ticket-stub flex flex-col lg:flex-row overflow-hidden shadow-[4px_4px_0px_0px_#1F2B2E] border-2 border-[#1F2B2E] bg-white group hover:translate-y-[-2px] transition duration-150"
              >
                {/* Left Ticket Stub (City & Departure Info) */}
                <div className="bg-[#1F2B2E] text-[#F6F3EC] p-6 lg:w-72 shrink-0 flex flex-col justify-between relative border-b lg:border-b-0 lg:border-r-2 border-dashed border-[#F6F3EC]/40">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono text-[#7FA69C] uppercase tracking-wider">
                      <span>VOYAGE SHEET</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-[#B8823A] text-white font-bold">
                        {stopsCount} {stopsCount === 1 ? 'STOP' : 'STOPS'}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold font-display tracking-tight text-[#F6F3EC] leading-tight group-hover:text-[#7FA69C] transition">
                        {trip.name}
                      </h3>
                      <div className="text-xs font-mono text-[#F6F3EC]/80 mt-1">
                        🗓 {trip.start_date || trip.startDate ? new Date(trip.start_date || trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'OCT 12, 2026'} &bull; {trip.end_date || trip.endDate ? new Date(trip.end_date || trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'OCT 21, 2026'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#F6F3EC]/20 flex items-center justify-between font-mono text-xs">
                    <button
                      onClick={() => handleShareToggle(trip)}
                      disabled={isSharing}
                      className={`px-2 py-0.5 text-[10px] font-bold border uppercase flex items-center gap-1 transition cursor-pointer ${
                        trip.isPublic
                          ? 'bg-[#7FA69C] text-[#1F2B2E] border-[#7FA69C]'
                          : 'bg-transparent text-[#F6F3EC]/80 border-[#F6F3EC]/40 hover:text-white'
                      }`}
                    >
                      {trip.isPublic ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                      {trip.isPublic ? 'PUBLIC PASS' : 'PRIVATE'}
                    </button>

                    <span className="text-[#B8823A] font-bold text-sm">
                      ACTIVE ROUTE
                    </span>
                  </div>

                  {/* Decorative Ticket Notches */}
                  <div className="hidden lg:block absolute -top-2.5 -right-2.5 w-5 h-5 bg-[#F6F3EC] rounded-full border border-[#1F2B2E]"></div>
                  <div className="hidden lg:block absolute -bottom-2.5 -right-2.5 w-5 h-5 bg-[#F6F3EC] rounded-full border border-[#1F2B2E]"></div>
                </div>

                {/* Right Ticket Body */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    
                    {/* Header Row on Right */}
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <p className="text-xs sm:text-sm text-[#1F2B2E]/80 font-body leading-relaxed max-w-xl">
                        {trip.description || 'Custom multi-city journey with scheduled destination stops, curated activities, and budget calculation.'}
                      </p>

                      {trip.coverPhoto && (
                        <img
                          src={trip.coverPhoto}
                          alt={trip.name}
                          className="h-16 w-24 object-cover border border-[#1F2B2E] rounded-sm hidden sm:block shrink-0 shadow-sm"
                        />
                      )}
                    </div>

                    {/* Stops Ordered Timeline Chips */}
                    <div className="space-y-1.5 pt-1">
                      <span className="font-mono text-[10px] text-[#1F2B2E]/60 uppercase font-bold block">
                        Destinations & Stops ({stopsCount}):
                      </span>

                      {stopsCount > 0 ? (
                        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                          {trip.stops.map((stop, idx) => (
                            <div key={stop.id || idx} className="flex items-center gap-1.5">
                              <span className="px-2.5 py-1 bg-[#F6F3EC] border border-[#1F2B2E] text-[#1F2B2E] font-bold flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-[#2C5F7C]" />
                                {stop.city?.name || stop.cityName || `Stop ${idx + 1}`}
                              </span>
                              {idx < trip.stops.length - 1 && (
                                <span className="text-[#1F2B2E]/40 font-bold">➔</span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="font-mono text-xs text-[#1F2B2E]/50 italic">
                          No stops added yet. Click "Edit in Builder" to add cities.
                        </span>
                      )}
                    </div>

                  </div>

                  {/* Action Buttons Toolbar */}
                  <div className="pt-4 border-t border-[#1F2B2E]/15 flex flex-wrap items-center justify-between gap-3">
                    
                    {/* Left Quick Navigation Actions */}
                    <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                      <button
                        onClick={() => onNavigate('itinerary', { tripId: trip.id })}
                        className="px-3 py-1.5 bg-[#1F2B2E] hover:bg-[#2C5F7C] text-white border border-[#1F2B2E] font-bold uppercase transition flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View Itinerary
                      </button>

                      <button
                        onClick={() => onNavigate('builder', { tripId: trip.id })}
                        className="px-3 py-1.5 bg-[#F6F3EC] hover:bg-[#2C5F7C] hover:text-white border border-[#1F2B2E] font-bold uppercase transition flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="h-3.5 w-3.5 text-[#2C5F7C]" />
                        Builder
                      </button>

                      <button
                        onClick={() => onNavigate('budget', { tripId: trip.id })}
                        className="px-3 py-1.5 bg-[#F6F3EC] hover:bg-[#B8823A] hover:text-white border border-[#1F2B2E] font-bold uppercase transition flex items-center gap-1 cursor-pointer"
                      >
                        <DollarSign className="h-3.5 w-3.5 text-[#B8823A]" />
                        Budget
                      </button>

                      <button
                        onClick={() => onNavigate('calendar', { tripId: trip.id })}
                        className="px-3 py-1.5 bg-[#F6F3EC] hover:bg-[#2C5F7C] hover:text-white border border-[#1F2B2E] font-bold uppercase transition flex items-center gap-1 cursor-pointer"
                      >
                        <Calendar className="h-3.5 w-3.5 text-[#2C5F7C]" />
                        Calendar
                      </button>

                      {trip.isPublic && (
                        <button
                          onClick={() => onNavigate('share', { slug: trip.shareSlug })}
                          className="px-3 py-1.5 bg-[#7FA69C]/20 hover:bg-[#7FA69C] hover:text-white text-[#1F2B2E] border border-[#7FA69C] font-bold uppercase transition flex items-center gap-1 cursor-pointer"
                        >
                          <Globe className="h-3.5 w-3.5 text-[#7FA69C]" />
                          Share Link
                        </button>
                      )}
                    </div>

                    {/* Delete Trigger */}
                    <button
                      onClick={() => handleDelete(trip.id, trip.name)}
                      disabled={isDeleting}
                      title="Delete Trip"
                      className="p-1.5 bg-white border border-[#1F2B2E] text-[#1F2B2E] hover:bg-[#B84A3E] hover:text-white transition cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
