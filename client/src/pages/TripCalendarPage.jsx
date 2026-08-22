import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api/apiClient';
import { formatDateShort, formatCurrency } from '../lib/format';
import {
  Calendar as CalendarIcon, Clock, MapPin, DollarSign,
  ChevronLeft, ChevronRight, ArrowLeft, RefreshCw,
  Plus, Eye, Edit3, Compass, CheckCircle2, Sparkles, Globe, Tag
} from 'lucide-react';

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const TRIP_COLOR_PALETTES = [
  { bg: 'bg-[#1E232A] text-[#F5B800] border-[#1E232A]', cellBg: 'bg-[#FAF9F6]', tag: 'bg-[#1E232A]' },
  { bg: 'bg-[#F5B800] text-[#1E232A] border-[#F5B800]', cellBg: 'bg-amber-50/70', tag: 'bg-[#F5B800]' },
  { bg: 'bg-[#10B981] text-white border-[#10B981]', cellBg: 'bg-emerald-50/70', tag: 'bg-[#10B981]' },
  { bg: 'bg-[#6366F1] text-white border-[#6366F1]', cellBg: 'bg-indigo-50/70', tag: 'bg-[#6366F1]' },
  { bg: 'bg-[#EC4899] text-white border-[#EC4899]', cellBg: 'bg-pink-50/70', tag: 'bg-[#EC4899]' },
];

export default function TripCalendarPage({ tripId: propTripId, onBack, onNavigate, onNavigateToBudget, onNavigateToActivities }) {
  const [trips, setTrips] = useState([]);
  const [selectedTripFilter, setSelectedTripFilter] = useState(propTripId || 'all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Current calendar month view state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Load all user trips with their stops and activities
  const loadTrips = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/trips');
      const list = data?.trips || [];
      
      // Fetch full details for each trip
      const detailedTrips = await Promise.all(
        list.map(async (t) => {
          try {
            const detailRes = await apiFetch(`/trips/${t.id}`);
            return detailRes?.trip || t;
          } catch {
            return t;
          }
        })
      );
      
      setTrips(detailedTrips);

      // If propTripId was provided, jump calendar month to that trip's start date
      if (propTripId) {
        const found = detailedTrips.find(t => t.id === propTripId);
        if (found && (found.startDate || found.start_date)) {
          const tripDate = new Date(found.startDate || found.start_date);
          setCurrentDate(new Date(tripDate.getFullYear(), tripDate.getMonth(), 1));
          setSelectedDate(tripDate);
        }
      } else if (detailedTrips.length > 0 && detailedTrips[0].startDate) {
        const tripDate = new Date(detailedTrips[0].startDate);
        setCurrentDate(new Date(tripDate.getFullYear(), tripDate.getMonth(), 1));
      }
    } catch (err) {
      console.error('Failed to load trips calendar:', err);
      setError('Unable to load trip schedules from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, [propTripId]);

  const handleTripFilterChange = (tripId) => {
    setSelectedTripFilter(tripId);
    if (tripId === 'all') {
      if (trips.length > 0) {
        const targetTrip = trips.find(t => new Date(t.endDate || t.end_date) >= new Date()) || trips[0];
        if (targetTrip?.startDate || targetTrip?.start_date) {
          const tripDate = new Date(targetTrip.startDate || targetTrip.start_date);
          setCurrentDate(new Date(tripDate.getFullYear(), tripDate.getMonth(), 1));
          setSelectedDate(new Date(tripDate.getFullYear(), tripDate.getMonth(), tripDate.getDate()));
        }
      }
    } else {
      const selected = trips.find(t => t.id === tripId);
      if (selected && (selected.startDate || selected.start_date)) {
        const tripDate = new Date(selected.startDate || selected.start_date);
        setCurrentDate(new Date(tripDate.getFullYear(), tripDate.getMonth(), 1));
        setSelectedDate(new Date(tripDate.getFullYear(), tripDate.getMonth(), tripDate.getDate()));
      }
    }
  };

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  };

  const monthYearLabel = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  // Calculate calendar grid days
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  // Filter trips if a specific trip is selected
  const activeTrips = selectedTripFilter === 'all'
    ? trips
    : trips.filter(t => t.id === selectedTripFilter);

  // Helper to test if a given date falls inside a trip
  const getTripsForDate = (dateObj) => {
    const d = new Date(dateObj);
    d.setHours(0, 0, 0, 0);

    return activeTrips.map((trip, idx) => {
      const start = new Date(trip.startDate || trip.start_date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(trip.endDate || trip.end_date);
      end.setHours(23, 59, 59, 999);

      if (d >= start && d <= end) {
        const isStart = d.getTime() === start.getTime();
        const isEnd = d.getDate() === end.getDate() && d.getMonth() === end.getMonth() && d.getFullYear() === end.getFullYear();
        
        // Find stop on this day
        const stop = (trip.stops || []).find(s => {
          const sStart = new Date(s.startDate || s.start_date);
          sStart.setHours(0, 0, 0, 0);
          const sEnd = new Date(s.endDate || s.end_date);
          sEnd.setHours(23, 59, 59, 999);
          return d >= sStart && d <= sEnd;
        });

        // Find activities on this day
        const activities = [];
        (trip.stops || []).forEach(s => {
          (s.tripActivities || s.activities || []).forEach(a => {
            const aDate = a.scheduledDate ? new Date(a.scheduledDate) : null;
            if (aDate) {
              aDate.setHours(0, 0, 0, 0);
              if (aDate.getTime() === d.getTime()) {
                activities.push({ ...a, stopCity: s.cityName || s.city?.name });
              }
            } else if (stop && stop.id === s.id) {
              activities.push({ ...a, stopCity: s.cityName || s.city?.name });
            }
          });
        });

        const colorPalette = TRIP_COLOR_PALETTES[idx % TRIP_COLOR_PALETTES.length];

        return {
          trip,
          isStart,
          isEnd,
          stop,
          activities,
          color: colorPalette
        };
      }
      return null;
    }).filter(Boolean);
  };

  // Build grid calendar cells
  const calendarCells = [];

  // Previous month padding
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dayNum = prevMonthDays - i;
    const dateObj = new Date(year, month - 1, dayNum);
    calendarCells.push({
      dayNum,
      dateObj,
      isCurrentMonth: false,
      tripsOnDay: getTripsForDate(dateObj)
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    calendarCells.push({
      dayNum: d,
      dateObj,
      isCurrentMonth: true,
      tripsOnDay: getTripsForDate(dateObj)
    });
  }

  // Next month trailing days to complete 35 or 42 cells (7x5 or 7x6)
  const remaining = 35 - calendarCells.length;
  const totalCells = remaining >= 0 ? 35 : 42;
  const trailingCount = totalCells - calendarCells.length;
  for (let d = 1; d <= trailingCount; d++) {
    const dateObj = new Date(year, month + 1, d);
    calendarCells.push({
      dayNum: d,
      dateObj,
      isCurrentMonth: false,
      tripsOnDay: getTripsForDate(dateObj)
    });
  }

  // Selected date details
  const selectedTrips = getTripsForDate(selectedDate);
  const isToday = (d) => {
    const today = new Date();
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 font-sans">
      
      {/* Top Header Card */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="font-script text-[#F5B800] text-3xl block leading-none">
            schedule timeline
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-[#1E232A] leading-tight">
            Trip Calendar & Timeline
          </h1>
          <p className="text-xs text-gray-500 font-sans">
            Visual month grid tracking voyage dates, stopover segments, and daily scheduled experiences.
          </p>
        </div>

        {/* Action Controls & Trip Filter */}
        <div className="flex flex-wrap items-center gap-3">
          {trips.length > 0 && (
            <select
              value={selectedTripFilter}
              onChange={(e) => handleTripFilterChange(e.target.value)}
              className="px-4 py-2.5 bg-[#FAF9F6] border border-gray-300 rounded-full font-sans text-xs font-bold text-[#1E232A] focus:outline-none focus:ring-2 focus:ring-[#F5B800] transition cursor-pointer"
            >
              <option value="all">All Trips ({trips.length})</option>
              {trips.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          )}

          <button
            onClick={goToToday}
            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#1E232A] font-extrabold text-xs uppercase tracking-wider rounded-full transition cursor-pointer border border-gray-200"
          >
            TODAY
          </button>

          <button
            onClick={loadTrips}
            disabled={loading}
            title="Reload Calendar"
            className="p-2.5 bg-white border border-gray-300 rounded-full hover:bg-gray-100 transition cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 text-[#1E232A] ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Calendar Card */}
      <div className="bg-white border border-gray-200 rounded-3xl shadow-xl overflow-hidden">
        
        {/* Month Navigation Banner */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-gray-100 bg-white">
          <button
            onClick={prevMonth}
            className="p-2.5 hover:bg-gray-100 rounded-full transition cursor-pointer text-[#1E232A]"
            title="Previous Month"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#1E232A] tracking-tight">
            {monthYearLabel}
          </h2>

          <button
            onClick={nextMonth}
            className="p-2.5 hover:bg-gray-100 rounded-full transition cursor-pointer text-[#1E232A]"
            title="Next Month"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b border-gray-100 bg-[#FAF9F6] text-center">
          {WEEKDAYS.map((day) => (
            <div key={day} className="py-3 text-xs font-sans font-extrabold uppercase tracking-widest text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* 7-Column Calendar Days Grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-gray-100">
          {calendarCells.map((cell, index) => {
            const isSelected =
              selectedDate &&
              selectedDate.getDate() === cell.dateObj.getDate() &&
              selectedDate.getMonth() === cell.dateObj.getMonth() &&
              selectedDate.getFullYear() === cell.dateObj.getFullYear();

            const isCurrentToday = isToday(cell.dateObj);
            const hasTrips = cell.tripsOnDay.length > 0;
            const primaryTripMatch = cell.tripsOnDay[0];

            return (
              <div
                key={index}
                onClick={() => setSelectedDate(cell.dateObj)}
                className={`
                  min-h-[100px] sm:min-h-[120px] p-2 sm:p-3 flex flex-col justify-between transition-all duration-150 relative cursor-pointer
                  ${!cell.isCurrentMonth ? 'bg-gray-50/40 text-gray-300' : 'bg-white text-gray-900'}
                  ${hasTrips && cell.isCurrentMonth ? (primaryTripMatch?.color?.cellBg || 'bg-[#FAF9F6]') : ''}
                  ${isSelected ? 'ring-2 ring-inset ring-[#F5B800] bg-[#FAF9F6] z-10' : 'hover:bg-gray-50'}
                `}
              >
                {/* Day Number Header */}
                <div className="flex items-center justify-between">
                  <span
                    className={`
                      text-xs sm:text-sm font-bold font-sans inline-block
                      ${isCurrentToday ? 'bg-[#F5B800] text-[#1E232A] rounded-full w-6 h-6 flex items-center justify-center font-extrabold text-xs shadow-xs' : ''}
                      ${!cell.isCurrentMonth ? 'text-gray-300' : 'text-[#1E232A]'}
                    `}
                  >
                    {cell.dayNum}
                  </span>

                  {cell.tripsOnDay.length > 1 && (
                    <span className="text-[10px] font-sans font-extrabold bg-[#1E232A] text-[#F5B800] px-1.5 py-0.5 rounded-full">
                      +{cell.tripsOnDay.length}
                    </span>
                  )}
                </div>

                {/* Trip Event Badges / Banners inside the Cell */}
                <div className="mt-1 space-y-1 flex-1 flex flex-col justify-end">
                  {cell.tripsOnDay.map((tMatch, tIdx) => (
                    <div
                      key={tIdx}
                      className={`
                        px-2 py-1 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider truncate rounded-full shadow-xs leading-tight
                        ${tMatch.color.bg}
                      `}
                      title={`${tMatch.trip.name} (${tMatch.stop?.cityName || tMatch.stop?.city?.name || 'Stop'})`}
                    >
                      {tMatch.isStart ? (
                        <span>{tMatch.trip.name}</span>
                      ) : tMatch.stop?.cityName || tMatch.stop?.city?.name ? (
                        <span>{tMatch.stop?.cityName || tMatch.stop?.city?.name}</span>
                      ) : (
                        <span>{tMatch.trip.name}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Itinerary Details Inspector */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#F5B800]/20 text-[#1E232A] flex items-center justify-center font-bold">
              <CalendarIcon className="w-5 h-5 text-[#F5B800]" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-extrabold text-[#F5B800] tracking-widest block">
                SELECTED DATE INSPECTOR
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-black text-[#1E232A]">
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {selectedTrips.length > 0 && onNavigate && (
              <button
                onClick={() => onNavigate('builder', { tripId: selectedTrips[0].trip.id })}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#1E232A] font-extrabold text-xs uppercase tracking-wider rounded-full border border-gray-200 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                EDIT IN BUILDER
              </button>
            )}
            {selectedTrips.length > 0 && onNavigate && (
              <button
                onClick={() => onNavigate('itinerary', { tripId: selectedTrips[0].trip.id })}
                className="px-5 py-2 bg-[#F5B800] hover:bg-[#E0A600] text-[#1E232A] font-extrabold text-xs uppercase tracking-wider rounded-full transition flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Eye className="w-3.5 h-3.5" />
                VIEW ITINERARY
              </button>
            )}
          </div>
        </div>

        {/* Selected Date Content */}
        {selectedTrips.length === 0 ? (
          <div className="p-10 bg-[#FAF9F6] rounded-3xl border border-dashed border-gray-300 text-center space-y-2">
            <Compass className="w-8 h-8 text-gray-400 mx-auto animate-pulse" />
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">
              No trips or stopovers scheduled for this date.
            </p>
            <p className="text-xs text-gray-400">
              Click on any highlighted calendar day with a voyage pill to view itemized stops and experiences.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {selectedTrips.map((match, idx) => (
              <div key={idx} className="border border-gray-200 p-6 bg-[#FAF9F6] rounded-3xl space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-3">
                  <div>
                    <span className="text-[10px] font-sans font-extrabold uppercase tracking-widest text-[#F5B800] block">
                      ACTIVE EXPEDITION
                    </span>
                    <h4 className="text-xl font-serif font-black text-[#1E232A]">
                      {match.trip.name}
                    </h4>
                  </div>
                  <span className="text-xs font-sans font-bold text-gray-700 bg-white px-3.5 py-1.5 rounded-full border border-gray-200">
                    🗓 {formatDateShort(match.trip.startDate || match.trip.start_date)} &ndash; {formatDateShort(match.trip.endDate || match.trip.end_date)}
                  </span>
                </div>

                {/* Stop Info */}
                {match.stop && (
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1E232A]">
                    <MapPin className="w-4 h-4 text-[#F5B800]" />
                    <span>Destination Stop: <strong>{match.stop.cityName || match.stop.city?.name}</strong>, {match.stop.city?.country || ''}</span>
                  </div>
                )}

                {/* Activities on this Day */}
                {match.activities?.length > 0 ? (
                  <div className="space-y-3 pt-2">
                    <span className="text-[10px] uppercase font-extrabold text-gray-400 tracking-widest block">
                      SCHEDULED EXPERIENCES ({match.activities.length}):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {match.activities.map((act, aIdx) => (
                        <div
                          key={act.id || aIdx}
                          className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-3"
                        >
                          <div>
                            <div className="flex items-center justify-between text-[10px] font-sans text-gray-500 mb-1">
                              <span className="uppercase font-extrabold text-[#F5B800] bg-[#F5B800]/15 px-2 py-0.5 rounded-full">
                                {act.category || 'Experience'}
                              </span>
                              <span className="font-medium">{act.timeSlot || '10:00 AM'}</span>
                            </div>
                            <h5 className="font-bold text-xs text-[#1E232A] line-clamp-2">{act.name}</h5>
                          </div>
                          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs font-sans">
                            <span className="font-bold text-emerald-600">
                              {act.cost > 0 ? formatCurrency(act.cost) : 'Free'}
                            </span>
                            <span className="text-gray-400 text-[11px] flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-gray-400" />
                              {act.stopCity || 'City'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic">
                    No individual activities scheduled on this day. Explore destination sights or relax!
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
