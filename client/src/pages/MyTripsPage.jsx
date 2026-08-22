import React, { useState, useEffect } from 'react';
import { fetchTrips, deleteTrip, shareTrip } from '../api/tripsApi';
import { useAuth } from '../context/AuthContext';
import { formatDateShort } from '../lib/format';
import {
  Compass, Plus, Calendar, MapPin, DollarSign, Layers,
  Share2, Trash2, Edit3, Eye, Search, Filter, Check,
  ExternalLink, AlertCircle, Sparkles, Globe, Clock, Loader2,
  Lock, Unlock, ArrowRight, CheckCircle2, Navigation, History
} from 'lucide-react';

export const getTripTemporalStatus = (trip) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const startStr = trip.start_date || trip.startDate;
  const endStr = trip.end_date || trip.endDate;

  if (!startStr || !endStr) return 'upcoming';

  const start = new Date(startStr);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endStr);
  end.setHours(23, 59, 59, 999);

  if (end < now) {
    return 'completed';
  }
  if (start > now) {
    return 'upcoming';
  }
  return 'ongoing';
};

export default function MyTripsPage({ onNavigate }) {
  const { user, isAuthenticated } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'ongoing', 'upcoming', 'completed'
  const [visibilityFilter, setVisibilityFilter] = useState('all'); // 'all', 'public', 'private'
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
      setError('Failed to load trips.');
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
      await shareTrip(trip.id, newStatus);
      setTrips(prev => prev.map(t => t.id === trip.id ? { ...t, isPublic: newStatus } : t));
    } catch (err) {
      console.error('Share toggle error:', err);
      alert(err.message || 'Failed to update share status');
    } finally {
      setSharingId(null);
    }
  };

  // Classify and filter trips
  const tripsWithStatus = trips.map(t => ({
    ...t,
    temporalStatus: getTripTemporalStatus(t)
  }));

  const ongoingTrips = tripsWithStatus.filter(t => t.temporalStatus === 'ongoing');
  const upcomingTrips = tripsWithStatus.filter(t => t.temporalStatus === 'upcoming');
  const completedTrips = tripsWithStatus.filter(t => t.temporalStatus === 'completed');

  const filteredTrips = tripsWithStatus.filter(trip => {
    const matchesSearch =
      trip.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (trip.description && trip.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (trip.stops && trip.stops.some(s => s.cityName?.toLowerCase().includes(searchQuery.toLowerCase())));

    if (!matchesSearch) return false;

    if (statusFilter !== 'all' && trip.temporalStatus !== statusFilter) return false;

    if (visibilityFilter === 'public') return trip.isPublic;
    if (visibilityFilter === 'private') return !trip.isPublic;
    return true;
  });

  const totalTrips = trips.length;

  const renderTripCard = (trip) => {
    const stopsCount = trip.stops ? trip.stops.length : 0;
    const coverImage = trip.coverPhoto || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80';
    const status = trip.temporalStatus;

    return (
      <div
        key={trip.id}
        className="bg-[#1A1D23] text-white border border-gray-800 rounded-3xl shadow-xl hover:shadow-2xl overflow-hidden flex flex-col justify-between group transition duration-300 min-h-[490px]"
      >
        <div>
          {/* Card Cover Header */}
          <div className="relative h-64 sm:h-72 overflow-hidden">
            <img
              src={coverImage}
              alt={trip.name}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"></div>

            {/* Status & Timing Badges */}
            <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
              {/* Ongoing / Upcoming / Completed Indicator */}
              {status === 'ongoing' && (
                <span className="px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest rounded-full bg-emerald-500 text-black shadow-lg flex items-center gap-1.5 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-black"></span>
                  ONGOING NOW
                </span>
              )}
              {status === 'upcoming' && (
                <span className="px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest rounded-full bg-sky-500 text-black shadow-md flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  UPCOMING
                </span>
              )}
              {status === 'completed' && (
                <span className="px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest rounded-full bg-gray-600 text-gray-200 shadow-md flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  COMPLETED
                </span>
              )}

              {/* Public/Private Badge */}
              <span className={`px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest rounded-full shadow-md ${
                trip.isPublic ? 'bg-[#F5B800] text-[#1E232A]' : 'bg-[#1E232A]/80 text-gray-300 border border-gray-700'
              }`}>
                {trip.isPublic ? 'PUBLIC' : 'PRIVATE'}
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
                <span>{formatDateShort(trip.startDate || trip.start_date)} — {formatDateShort(trip.endDate || trip.end_date)}</span>
              </div>
            </div>
          </div>

          {/* Body Details */}
          <div className="p-6 space-y-4 font-sans">
            {trip.description && (
              <p className="text-xs text-gray-400 leading-relaxed font-medium line-clamp-2">
                {trip.description}
              </p>
            )}

            <div className="space-y-1.5 pt-2 border-t border-gray-800">
              <span className="text-[10px] text-gray-500 uppercase font-extrabold tracking-widest block">
                DESTINATION STOPS:
              </span>
              {stopsCount > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {trip.stops.map((stop, idx) => (
                    <span
                      key={stop.id || idx}
                      className="px-2.5 py-0.5 bg-gray-800 text-gray-200 font-sans text-xs font-semibold rounded-full border border-gray-700"
                    >
                      📍 {stop.cityName || stop.city?.name || 'City'}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-gray-500 italic">No stops added yet</span>
              )}
            </div>
          </div>
        </div>

        {/* Card Action Footer */}
        <div className="p-6 pt-0 flex items-center gap-2">
          <button
            onClick={() => onNavigate('builder', { tripId: trip.id })}
            className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-extrabold text-xs uppercase tracking-wider transition rounded-full flex items-center justify-center gap-1.5 cursor-pointer border border-gray-700"
          >
            <Edit3 className="h-3.5 w-3.5 text-[#F5B800]" />
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
  };

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
              Your categorized collection of ongoing, upcoming, and completed travel itineraries.
            </p>
          </div>

          {/* Quick Status Pill Stats */}
          <div className="grid grid-cols-3 gap-3 shrink-0">
            <div
              onClick={() => setStatusFilter('ongoing')}
              className="p-3.5 bg-emerald-50 border border-emerald-200 text-center min-w-[90px] cursor-pointer hover:bg-emerald-100 transition rounded-sm"
            >
              <span className="text-[10px] text-emerald-800 uppercase font-extrabold block">ONGOING</span>
              <strong className="text-2xl font-serif font-bold text-emerald-700">{ongoingTrips.length}</strong>
            </div>
            <div
              onClick={() => setStatusFilter('upcoming')}
              className="p-3.5 bg-sky-50 border border-sky-200 text-center min-w-[90px] cursor-pointer hover:bg-sky-100 transition rounded-sm"
            >
              <span className="text-[10px] text-sky-800 uppercase font-extrabold block">UPCOMING</span>
              <strong className="text-2xl font-serif font-bold text-sky-700">{upcomingTrips.length}</strong>
            </div>
            <div
              onClick={() => setStatusFilter('completed')}
              className="p-3.5 bg-gray-100 border border-gray-300 text-center min-w-[90px] cursor-pointer hover:bg-gray-200 transition rounded-sm"
            >
              <span className="text-[10px] text-gray-700 uppercase font-extrabold block">COMPLETED</span>
              <strong className="text-2xl font-serif font-bold text-gray-800">{completedTrips.length}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Date Status & Visibility Filter Tabs */}
      <div className="space-y-4">
        {/* Timing Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition rounded-full cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-[#1E232A] text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
              }`}
            >
              ALL TRIPS ({totalTrips})
            </button>
            <button
              onClick={() => setStatusFilter('ongoing')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition rounded-full flex items-center gap-1.5 cursor-pointer ${
                statusFilter === 'ongoing'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              ONGOING ({ongoingTrips.length})
            </button>
            <button
              onClick={() => setStatusFilter('upcoming')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition rounded-full flex items-center gap-1.5 cursor-pointer ${
                statusFilter === 'upcoming'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'bg-white text-sky-700 border border-sky-200 hover:bg-sky-50'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              UPCOMING ({upcomingTrips.length})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition rounded-full flex items-center gap-1.5 cursor-pointer ${
                statusFilter === 'completed'
                  ? 'bg-gray-700 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              COMPLETED ({completedTrips.length})
            </button>
          </div>

          {/* Visibility filter */}
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest mr-1">VISIBILITY:</span>
            {['all', 'public', 'private'].map((vis) => (
              <button
                key={vis}
                onClick={() => setVisibilityFilter(vis)}
                className={`px-2.5 py-1 uppercase text-[11px] font-bold rounded cursor-pointer transition ${
                  visibilityFilter === vis
                    ? 'bg-[#F5B800] text-[#1E232A]'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {vis}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar & Action Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by trip name, destination city, or notes..."
              className="w-full bg-white border border-gray-300 pl-11 pr-4 py-3 text-xs text-[#1E232A] font-semibold focus:outline-none focus:ring-2 focus:ring-[#F5B800]"
            />
          </div>

          <button
            onClick={() => onNavigate('create-trip')}
            className="px-6 py-3 bg-[#F5B800] hover:bg-[#E0A600] text-[#1E232A] font-bold text-xs tracking-widest uppercase transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shrink-0"
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
            SYNCING ITINERARIES WITH DATABASE...
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
              {searchQuery 
                ? `No ${statusFilter !== 'all' ? statusFilter : ''} trips matched "${searchQuery}".` 
                : statusFilter === 'ongoing' 
                ? 'You do not have any active journeys in progress today.'
                : statusFilter === 'upcoming'
                ? 'You do not have any upcoming journeys scheduled.'
                : statusFilter === 'completed'
                ? 'You do not have any past completed journeys in your passport archive.'
                : 'You have not created any trip route documents yet.'
              }
            </p>
          </div>
          <button
            onClick={() => onNavigate('create-trip')}
            className="px-6 py-3 bg-[#F5B800] hover:bg-[#E0A600] text-[#1E232A] font-bold text-xs uppercase tracking-widest transition cursor-pointer"
          >
            CREATE YOUR FIRST TRIP NOW
          </button>
        </div>
      ) : statusFilter === 'all' && !searchQuery ? (
        /* Sectioned View for All Trips */
        <div className="space-y-12">
          {/* Ongoing Section */}
          {ongoingTrips.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b-2 border-emerald-500 pb-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
                <h2 className="font-serif font-bold text-xl text-[#1E232A] uppercase tracking-wide">
                  ONGOING EXPEDITIONS ({ongoingTrips.length})
                </h2>
                <span className="text-xs text-gray-500 font-mono">Active Journeys Today</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {ongoingTrips.map(renderTripCard)}
              </div>
            </div>
          )}

          {/* Upcoming Section */}
          {upcomingTrips.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b-2 border-sky-500 pb-2">
                <Clock className="w-5 h-5 text-sky-600" />
                <h2 className="font-serif font-bold text-xl text-[#1E232A] uppercase tracking-wide">
                  UPCOMING JOURNEYS ({upcomingTrips.length})
                </h2>
                <span className="text-xs text-gray-500 font-mono">Scheduled Future Voyages</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {upcomingTrips.map(renderTripCard)}
              </div>
            </div>
          )}

          {/* Completed Section */}
          {completedTrips.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b-2 border-gray-400 pb-2">
                <History className="w-5 h-5 text-gray-600" />
                <h2 className="font-serif font-bold text-xl text-[#1E232A] uppercase tracking-wide">
                  COMPLETED VOYAGES ({completedTrips.length})
                </h2>
                <span className="text-xs text-gray-500 font-mono">Passport Travel Archive</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {completedTrips.map(renderTripCard)}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Filtered Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTrips.map(renderTripCard)}
        </div>
      )}

    </div>
  );
}
