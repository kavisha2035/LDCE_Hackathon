import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api/apiClient';
import {
  Calendar as CalendarIcon, Clock, MapPin, DollarSign,
  ChevronLeft, ChevronRight, ArrowLeft, RefreshCw, LayoutGrid,
  List, Tag, Sparkles, Compass, AlertCircle, Plus, Eye
} from 'lucide-react';

export default function TripCalendarPage({ tripId, onBack, onNavigateToBudget, onNavigateToActivities }) {
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState(tripId || null);
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // View mode toggle: 'timeline' (horizontal timeline) vs 'calendar' (month grid) vs 'agenda' (day-by-day vertical)
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline', 'calendar', 'agenda'

  // Selected date/day for drill-down view
  const [selectedDateKey, setSelectedDateKey] = useState(null);

  // Fetch available trips
  useEffect(() => {
    apiFetch('/trips')
      .then(data => {
        const list = data?.trips || [];
        setTrips(list);
        if (!selectedTripId && list.length > 0) {
          setSelectedTripId(list[0].id);
        }
      })
      .catch(err => {
        console.error('Trips list error:', err);
        setTrips([]);
      });
  }, []);

  // Fetch full trip details (including stops and activities)
  const fetchTripDetails = () => {
    if (!selectedTripId) return;
    setLoading(true);
    setError('');

    apiFetch(`/trips/${selectedTripId}`)
      .then(data => {
        if (data?.trip) {
          setTrip(data.trip);
          // Default selected date to start date of trip
          if (data.trip.startDate) {
            setSelectedDateKey(new Date(data.trip.startDate).toISOString().split('T')[0]);
          }
        } else {
          setError('Trip details could not be found.');
        }
      })
      .catch(err => {
        console.error('Trip fetch error:', err);
        setError(err.message || 'Error loading trip details');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTripDetails();
  }, [selectedTripId]);

  // Build day-by-day map of stops and activities
  const generateDaysSchedule = () => {
    if (!trip || !trip.startDate || !trip.endDate) return [];

    const days = [];
    const current = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    let dayIndex = 1;

    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      const dateCopy = new Date(current);

      // Find which stop corresponds to this date
      const stop = (trip.stops || []).find(s => {
        const sStart = new Date(s.startDate);
        const sEnd = new Date(s.endDate);
        return current >= sStart && current <= sEnd;
      });

      // Find activities scheduled on this day
      const activitiesOnDay = [];
      (trip.stops || []).forEach(s => {
        (s.tripActivities || []).forEach(ta => {
          if (ta.scheduledDate) {
            const taDate = new Date(ta.scheduledDate).toISOString().split('T')[0];
            if (taDate === dateStr) {
              activitiesOnDay.push({
                ...ta,
                stopName: s.city?.name || 'Stop'
              });
            }
          }
        });
      });

      // If no explicit scheduledDate, but stop is active, attach activities
      if (activitiesOnDay.length === 0 && stop && stop.tripActivities) {
        stop.tripActivities.forEach(ta => {
          if (!ta.scheduledDate) {
            activitiesOnDay.push({
              ...ta,
              stopName: stop.city?.name || 'Stop'
            });
          }
        });
      }

      days.push({
        dayIndex,
        date: dateCopy,
        dateKey: dateStr,
        stop,
        activities: activitiesOnDay
      });

      current.setDate(current.getDate() + 1);
      dayIndex++;
    }

    return days;
  };

  const scheduleDays = generateDaysSchedule();
  const activeDay = scheduleDays.find(d => d.dateKey === selectedDateKey) || scheduleDays[0];

  return (
    <div className="space-y-8 font-body">

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-[#1F2B2E] pb-6">
        <div>
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 font-mono text-xs text-[#2C5F7C] font-bold uppercase mb-2 hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              BACK TO OVERVIEW
            </button>
          )}
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-0.5 bg-[#2C5F7C] text-[#F6F3EC] font-mono text-xs font-bold uppercase">
              SCREEN 10
            </span>
            <span className="font-mono text-xs text-[#2C5F7C] uppercase tracking-widest">
              HORIZONTAL TIMELINE & CALENDAR
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-[#1F2B2E] mt-1">
            TRIP CALENDAR & TIMELINE
          </h1>
        </div>

        {/* Action Controls & View Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Trip Switcher */}
          {trips.length > 1 && (
            <div className="bg-white border-2 border-[#1F2B2E] px-3 py-1.5 shadow-[2px_2px_0px_0px_#1F2B2E]">
              <label className="block font-mono text-[9px] uppercase tracking-widest text-[#1F2B2E]/60 font-bold">
                SELECT TRIP
              </label>
              <select
                value={selectedTripId || ''}
                onChange={(e) => setSelectedTripId(e.target.value)}
                className="bg-transparent font-mono text-xs font-bold text-[#1F2B2E] focus:outline-none cursor-pointer"
              >
                {trips.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* View Mode Buttons */}
          <div className="flex bg-white border-2 border-[#1F2B2E] shadow-[2px_2px_0px_0px_#1F2B2E] font-mono text-xs">
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1.5 font-bold uppercase flex items-center gap-1.5 transition ${
                viewMode === 'timeline' ? 'bg-[#1F2B2E] text-[#F6F3EC]' : 'text-[#1F2B2E] hover:bg-[#F6F3EC]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              TIMELINE
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 font-bold uppercase flex items-center gap-1.5 border-l border-[#1F2B2E] transition ${
                viewMode === 'calendar' ? 'bg-[#1F2B2E] text-[#F6F3EC]' : 'text-[#1F2B2E] hover:bg-[#F6F3EC]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              CALENDAR GRID
            </button>
          </div>

          <button
            onClick={fetchTripDetails}
            disabled={loading}
            title="Refresh Timeline"
            className="p-2.5 bg-white border-2 border-[#1F2B2E] shadow-[2px_2px_0px_0px_#1F2B2E] hover:bg-[#F6F3EC] transition"
          >
            <RefreshCw className={`w-4 h-4 text-[#1F2B2E] ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Loading & Error */}
      {loading && (
        <div className="bg-white border-2 border-[#1F2B2E] p-12 text-center shadow-[4px_4px_0px_0px_#1F2B2E]">
          <RefreshCw className="w-8 h-8 text-[#2C5F7C] animate-spin mx-auto mb-3" />
          <p className="font-mono text-sm uppercase text-[#1F2B2E] font-bold">
            RENDERING TIMELINE ROUTE SCHEDULE...
          </p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-white border-2 border-[#B84A3E] p-6 shadow-[4px_4px_0px_0px_#B84A3E]">
          <div className="flex items-center gap-3 text-[#B84A3E]">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div className="font-mono text-xs font-bold uppercase">{error}</div>
          </div>
        </div>
      )}

      {!loading && !error && trip && (
        <>
          {/* Trip Summary Document Ribbon */}
          <div className="bg-white border-2 border-[#1F2B2E] p-5 shadow-[4px_4px_0px_0px_#1F2B2E] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="font-mono text-[10px] uppercase text-[#2C5F7C] font-bold tracking-widest">
                ACTIVE ITINERARY
              </span>
              <h2 className="text-2xl font-bold font-display text-[#1F2B2E] tracking-tight uppercase">
                {trip.name}
              </h2>
              <div className="flex items-center gap-3 mt-1 font-mono text-xs text-[#1F2B2E]/70">
                <span className="flex items-center gap-1">
                  <CalendarIcon className="w-3.5 h-3.5 text-[#B8823A]" />
                  {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  {' — '}
                  {new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span>&bull;</span>
                <span className="font-bold text-[#1F2B2E]">{scheduleDays.length} DAYS</span>
                <span>&bull;</span>
                <span className="font-bold text-[#2C5F7C]">{trip.stops?.length || 0} STOPS</span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex items-center gap-2 font-mono text-xs">
              {onNavigateToBudget && (
                <button
                  onClick={onNavigateToBudget}
                  className="px-3 py-1.5 bg-[#F6F3EC] border border-[#1F2B2E] font-bold text-[#B8823A] uppercase hover:bg-[#B8823A] hover:text-white transition shadow-[2px_2px_0px_0px_#1F2B2E]"
                >
                  <DollarSign className="w-3.5 h-3.5 inline mr-1" />
                  VIEW BUDGET (SCR 9)
                </button>
              )}
              {onNavigateToActivities && (
                <button
                  onClick={onNavigateToActivities}
                  className="px-3 py-1.5 bg-[#2C5F7C] text-white border border-[#1F2B2E] font-bold uppercase hover:bg-[#1F2B2E] transition shadow-[2px_2px_0px_0px_#1F2B2E]"
                >
                  <Plus className="w-3.5 h-3.5 inline mr-1" />
                  FIND ACTIVITIES (SCR 8)
                </button>
              )}
            </div>
          </div>

          {/* VIEW MODE 1: HORIZONTAL TIMELINE (Per Frontend-Design.md) */}
          {viewMode === 'timeline' && (
            <div className="space-y-6">
              
              {/* Horizontal Timeline Scroll Track */}
              <div className="bg-white border-2 border-[#1F2B2E] p-6 shadow-[4px_4px_0px_0px_#1F2B2E] overflow-hidden">
                <div className="flex items-center justify-between border-b border-[#1F2B2E]/20 pb-3 mb-6">
                  <div className="font-display text-lg font-bold text-[#1F2B2E] uppercase flex items-center gap-2">
                    <Compass className="w-5 h-5 text-[#2C5F7C]" />
                    ROUTE TIMELINE TRACK
                  </div>
                  <span className="font-mono text-[10px] text-[#1F2B2E]/60 uppercase">
                    CLICK ANY DAY SEGMENT TO DRILL DOWN
                  </span>
                </div>

                {/* Horizontal Timeline Rule */}
                <div className="relative overflow-x-auto pb-4 pt-2">
                  
                  {/* The Horizontal Line Track */}
                  <div className="absolute top-10 left-0 right-0 h-1 bg-[#1F2B2E] z-0" />

                  {/* Day Nodes */}
                  <div className="flex items-start gap-4 min-w-[700px] relative z-10 px-2">
                    {scheduleDays.map((day) => {
                      const isSelected = selectedDateKey === day.dateKey;
                      const hasActivities = day.activities?.length > 0;

                      return (
                        <div
                          key={day.dateKey}
                          onClick={() => setSelectedDateKey(day.dateKey)}
                          className={`
                            flex-1 min-w-[120px] cursor-pointer transition-all duration-150 flex flex-col items-center
                            ${isSelected ? 'scale-105' : 'hover:scale-[1.02]'}
                          `}
                        >
                          {/* Top Marker Pin */}
                          <div className={`
                            w-7 h-7 rounded-full border-2 border-[#1F2B2E] flex items-center justify-center font-mono text-[10px] font-bold shadow-[2px_2px_0px_0px_#1F2B2E] mb-3 transition
                            ${isSelected 
                              ? 'bg-[#B8823A] text-white ring-4 ring-[#B8823A]/30' 
                              : hasActivities ? 'bg-[#2C5F7C] text-white' : 'bg-white text-[#1F2B2E]'
                            }
                          `}>
                            {day.dayIndex}
                          </div>

                          {/* Day Card */}
                          <div className={`
                            w-full p-3 border-2 transition shadow-[2px_2px_0px_0px_#1F2B2E] text-center
                            ${isSelected
                              ? 'bg-[#1F2B2E] text-[#F6F3EC] border-[#1F2B2E]'
                              : 'bg-[#F6F3EC] text-[#1F2B2E] border-[#1F2B2E] hover:bg-white'
                            }
                          `}>
                            <div className="font-mono text-[10px] uppercase font-bold tracking-widest text-[#B8823A]">
                              DAY {day.dayIndex}
                            </div>
                            <div className="font-mono text-xs font-bold my-0.5">
                              {day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                            <div className={`text-[11px] font-bold truncate uppercase ${isSelected ? 'text-[#7FA69C]' : 'text-[#2C5F7C]'}`}>
                              {day.stop?.city?.name || 'Transit / Day'}
                            </div>

                            {/* Activity Count Indicator */}
                            <div className="mt-2 pt-1 border-t border-[#1F2B2E]/20 font-mono text-[10px] flex items-center justify-center gap-1">
                              <Sparkles className="w-2.5 h-2.5 text-[#B8823A]" />
                              <span>{day.activities.length} acts</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Day Drill-Down Detail Card (Boarding Pass / Schedule Slip) */}
              {activeDay && (
                <div className="bg-white border-2 border-[#1F2B2E] p-6 shadow-[4px_4px_0px_0px_#1F2B2E] space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#1F2B2E] pb-4">
                    <div>
                      <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#1F2B2E] text-[#F6F3EC] font-mono text-xs font-bold uppercase mb-1">
                        <span>DAY {activeDay.dayIndex} SCHEDULE</span>
                        <span>&bull;</span>
                        <span>{activeDay.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <h3 className="text-2xl font-bold font-display text-[#1F2B2E] uppercase">
                        {activeDay.stop?.city?.name ? `${activeDay.stop.city.name}, ${activeDay.stop.city.country}` : 'Transit & Open Exploration'}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="p-2 bg-[#F6F3EC] border border-[#1F2B2E] font-bold text-[#2C5F7C]">
                        {activeDay.activities.length} EXPERIENCES SCHEDULED
                      </span>
                    </div>
                  </div>

                  {/* Activities List on Active Day */}
                  {activeDay.activities.length === 0 ? (
                    <div className="p-8 bg-[#F6F3EC] border border-[#1F2B2E] text-center space-y-2">
                      <Compass className="w-6 h-6 text-[#1F2B2E]/40 mx-auto" />
                      <p className="font-mono text-xs text-[#1F2B2E]/70 uppercase font-bold">
                        No activities scheduled for this day yet.
                      </p>
                      {onNavigateToActivities && (
                        <button
                          onClick={onNavigateToActivities}
                          className="px-3 py-1.5 bg-[#2C5F7C] text-white font-mono text-xs font-bold uppercase border border-[#1F2B2E] hover:bg-[#1F2B2E] transition shadow-[2px_2px_0px_0px_#1F2B2E]"
                        >
                          + ADD EXPERIENCES FROM SCREEN 8
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {activeDay.activities.map((act, i) => (
                        <div
                          key={act.id || i}
                          className="bg-white border-2 border-[#1F2B2E] p-4 shadow-[3px_3px_0px_0px_#1F2B2E] flex flex-col justify-between space-y-3"
                        >
                          <div>
                            {/* Time & Category Tag */}
                            <div className="flex items-center justify-between font-mono text-xs mb-2">
                              <span className="px-2 py-0.5 bg-[#1F2B2E] text-[#F6F3EC] font-bold text-[10px]">
                                {act.scheduledTime || `${10 + i * 2}:00 AM`}
                              </span>
                              <span className="px-2 py-0.5 bg-[#F6F3EC] border border-[#1F2B2E] text-[#2C5F7C] font-bold text-[10px] uppercase">
                                #{act.activity?.category || 'sightseeing'}
                              </span>
                            </div>

                            {/* Name */}
                            <h4 className="font-display font-bold text-lg text-[#1F2B2E] leading-snug">
                              {act.activity?.name || act.name || 'Activity'}
                            </h4>

                            {/* Description or Notes */}
                            <p className="text-xs text-[#1F2B2E]/70 font-body mt-1.5 line-clamp-2">
                              {act.activity?.description || act.notes || 'Curated itinerary experience.'}
                            </p>
                          </div>

                          {/* Cost & Duration Row in Mono */}
                          <div className="pt-2 border-t border-[#1F2B2E]/20 flex items-center justify-between font-mono text-xs">
                            <span className="font-bold text-[#B8823A] flex items-center gap-1">
                              <DollarSign className="w-3.5 h-3.5" />
                              {act.activity?.cost > 0 ? `$${act.activity.cost}` : 'Free'}
                            </span>
                            <span className="text-[#1F2B2E]/70 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {act.activity?.durationHours ? `${act.activity.durationHours}h` : '1.5h'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

          {/* VIEW MODE 2: CALENDAR MONTH GRID */}
          {viewMode === 'calendar' && (
            <div className="bg-white border-2 border-[#1F2B2E] p-6 shadow-[4px_4px_0px_0px_#1F2B2E] space-y-4">
              <div className="flex items-center justify-between border-b border-[#1F2B2E]/20 pb-3">
                <div className="font-display text-xl font-bold text-[#1F2B2E] uppercase">
                  MONTHLY EXPEDITION CALENDAR GRID
                </div>
                <span className="font-mono text-xs text-[#2C5F7C] font-bold uppercase">
                  OCTOBER 2026
                </span>
              </div>

              {/* 7-column Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                  <div key={day} className="p-2 bg-[#1F2B2E] text-[#F6F3EC] font-mono text-[11px] font-bold text-center uppercase">
                    {day}
                  </div>
                ))}

                {scheduleDays.map(d => {
                  const isSelected = selectedDateKey === d.dateKey;
                  return (
                    <div
                      key={d.dateKey}
                      onClick={() => { setSelectedDateKey(d.dateKey); setViewMode('timeline'); }}
                      className={`
                        min-h-[100px] p-2 border-2 transition cursor-pointer flex flex-col justify-between
                        ${isSelected ? 'border-[#B8823A] bg-[#B8823A]/10 shadow-[2px_2px_0px_0px_#B84A3E]' : 'border-[#1F2B2E] bg-[#F6F3EC] hover:bg-white'}
                      `}
                    >
                      <div className="flex items-center justify-between font-mono text-xs font-bold">
                        <span className="text-[#1F2B2E]">{d.date.getDate()}</span>
                        <span className="text-[9px] px-1 bg-[#1F2B2E] text-white">D{d.dayIndex}</span>
                      </div>

                      <div className="my-1">
                        <div className="font-mono text-[10px] text-[#2C5F7C] font-bold uppercase truncate">
                          {d.stop?.city?.name || 'Transit'}
                        </div>
                      </div>

                      <div className="font-mono text-[10px] text-[#B8823A] font-bold">
                        {d.activities.length > 0 ? `${d.activities.length} acts` : '—'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </>
      )}

    </div>
  );
}
