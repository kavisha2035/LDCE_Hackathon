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
      setTrips(prev => prev.map(t => t.id === trip.id ? { ...t, isPublic: newStatus } : t));
    } catch (err) {
      console.error('Share toggle error:', err);
      alert(err.message || 'Failed to update share status');
    } finally {
      setSharingId(null);
    }
  };

  const filteredTrips = trips.filter(trip => {
    const matchesSearch =
      trip.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (trip.description && trip.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (trip.stops && trip.stops.some(s => s.cityName.toLowerCase().includes(searchQuery.toLowerCase())));

    if (!matchesSearch) return false;

    if (filterStatus === 'public') return trip.isPublic;
    if (filterStatus === 'private') return !trip.isPublic;
    return true;
  });

  const totalTrips = trips.length;
  const totalStops = trips.reduce((acc, t) => acc + (t.stops ? t.stops.length : 0), 0);
  const totalPublic = trips.filter(t => t.isPublic).length;

  return (
    <div className="w-full px-6 sm:px-12 lg:px-16 py-6 space-y-8 font-sans bg-[#FAF9F6] text-[#1E232A]">
      
      {/* Header Section */}
      <div className="bg-white border border-gray-200 p-8 shadow-xl relative overflow-hidden bg-map-pattern">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <span className="font-script text-[#F5B800] text-3xl block">my journeys</span>
            <h1 className="text-4xl sm:text-5xl font-serif font-bold text-[#1E232A] uppercase tracking-wide">
              MY TRIPS WALLET
            </h1>
            <p className="text-sm text-gray-600 font-sans max-w-2xl mt-1">
              Your personal collection of travel itineraries, ticket stubs, budget ledgers, and shareable boarding passes.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="p-4 bg-gray-50 border border-gray-200 text-center min-w-[100px]">
              <span className="text-[10px] text-gray-500 uppercase font-bold block">TRIPS</span>
              <strong className="text-2xl font-serif font-bold text-[#1E232A]">{totalTrips}</strong>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200 text-center min-w-[100px]">
              <span className="text-[10px] text-gray-500 uppercase font-bold block">TOTAL STOPS</span>
              <strong className="text-2xl font-serif font-bold text-[#F5B800]">{totalStops}</strong>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200 text-center min-w-[100px]">
              <span className="text-[10px] text-gray-500 uppercase font-bold block">PUBLIC PASSES</span>
              <strong className="text-2xl font-serif font-bold text-[#1E232A]">{totalPublic}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search trips by title, destination, or description..."
            className="w-full bg-white border border-gray-300 pl-11 pr-4 py-3 text-xs text-[#1E232A] font-semibold focus:outline-none focus:ring-2 focus:ring-[#F5B800]"
          />
        </div>

        <div className="flex items-center gap-2 font-sans text-xs">
          {['all', 'public', 'private'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-3 uppercase font-bold tracking-wider transition cursor-pointer ${
                filterStatus === status
                  ? 'bg-[#1E232A] text-[#F5B800]'
                  : 'bg-white text-[#1E232A] border border-gray-300 hover:bg-gray-100'
              }`}
            >
              {status}
            </button>
          ))}

          <button
            onClick={() => onNavigate('create-trip')}
            className="px-5 py-3 bg-[#F5B800] hover:bg-[#E0A600] text-[#1E232A] font-bold text-xs tracking-widest uppercase transition flex items-center gap-1.5 cursor-pointer shadow-md shrink-0"
          >
            <Plus className="h-4 w-4" />
            PLAN NEW JOURNEY
          </button>
        </div>
      </div>

      {/* Content Display */}
      {loading ? (
        <div className="p-16 text-center bg-white border border-gray-200 space-y-4">
          <Loader2 className="h-8 w-8 text-[#F5B800] animate-spin mx-auto" />
          <p className="text-xs font-mono font-bold text-gray-500 uppercase">
            SYNCING ITINERARIES WITH NEON POSTGRESQL...
          </p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 text-red-700 text-xs font-sans flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : filteredTrips.length === 0 ? (
        <div className="p-16 text-center bg-white border border-gray-200 space-y-4">
          <Globe className="h-12 w-12 text-gray-300 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-2xl font-serif font-bold text-[#1E232A]">NO ITINERARIES FOUND</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              {searchQuery ? 'No trips matched your search filter.' : 'You have not created any trip route documents yet.'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('create-trip')}
            className="px-6 py-3 bg-[#F5B800] hover:bg-[#E0A600] text-[#1E232A] font-bold text-xs uppercase tracking-widest transition cursor-pointer"
          >
            CREATE YOUR FIRST TRIP NOW
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTrips.map((trip) => {
            const stopsCount = trip.stops ? trip.stops.length : 0;
            const coverImage = trip.coverPhoto || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80';
            
            return (
              <div
                key={trip.id}
                className="bg-[#1A1D23] text-white border border-gray-800 rounded-3xl shadow-xl hover:shadow-2xl overflow-hidden flex flex-col justify-between group transition duration-300 min-h-[480px]"
              >
                <div>
                  {/* Card Cover Header */}
                  <div className="relative h-64 sm:h-72 overflow-hidden">
                    <img
                      src={coverImage}
                      alt={trip.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                    {/* Status Badges */}
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <span className={`px-3 py-1 text-xs font-extrabold uppercase tracking-widest rounded-full shadow-md ${
                        trip.isPublic ? 'bg-[#F5B800] text-[#1E232A]' : 'bg-[#1E232A] text-white'
                      }`}>
                        {trip.isPublic ? 'PUBLIC PASS' : 'PRIVATE'}
                      </span>
                    </div>

                    {/* Delete & Share Buttons */}
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <button
                        onClick={() => handleShareToggle(trip)}
                        disabled={sharingId === trip.id}
                        title={trip.isPublic ? "Make Private" : "Share Publicly"}
                        className="p-2.5 bg-white/90 hover:bg-white text-[#1E232A] rounded-full shadow transition cursor-pointer"
                      >
                        {sharingId === trip.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : trip.isPublic ? (
                          <Share2 className="h-4 w-4 text-[#F5B800]" />
                        ) : (
                          <Lock className="h-4 w-4" />
                        )}
                      </button>

                      <button
                        onClick={() => handleDelete(trip.id, trip.name)}
                        disabled={deletingId === trip.id}
                        title="Delete Trip"
                        className="p-2.5 bg-white/90 hover:bg-red-500 hover:text-white text-gray-700 rounded-full shadow transition cursor-pointer"
                      >
                        {deletingId === trip.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {/* Trip Title Overlay */}
                    <div className="absolute bottom-4 left-5 right-5 text-white">
                      <h3 className="text-2xl font-serif font-black tracking-wide leading-snug line-clamp-2">
                        {trip.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-[#F5B800] font-sans font-bold mt-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{trip.startDate} — {trip.endDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="p-6 space-y-4 font-sans">
                    {trip.description && (
                      <p className="text-xs text-gray-600 leading-relaxed font-medium line-clamp-3">
                        {trip.description}
                      </p>
                    )}

                    <div className="space-y-1.5 pt-2 border-t border-gray-100">
                      <span className="text-[10px] text-gray-400 uppercase font-extrabold tracking-widest block">
                        STOPS ROUTE:
                      </span>
                      {stopsCount > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {trip.stops.map((stop, idx) => (
                            <span
                              key={stop.id || idx}
                              className="px-3 py-1 bg-gray-100 text-gray-800 font-sans text-xs font-bold rounded-full border border-gray-200"
                            >
                              📍 {stop.cityName}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 font-semibold italic">No stops added yet</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-6 pt-0 flex items-center gap-2">
                  <button
                    onClick={() => onNavigate('builder', { tripId: trip.id })}
                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#1E232A] font-extrabold text-xs uppercase tracking-wider transition rounded-full flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    BUILDER
                  </button>
                  <button
                    onClick={() => onNavigate('itinerary', { tripId: trip.id })}
                    className="flex-1 py-2.5 bg-[#F5B800] hover:bg-[#E0A600] text-[#1E232A] font-extrabold text-xs uppercase tracking-wider transition rounded-full shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    VIEW
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
