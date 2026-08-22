import React, { useState } from 'react';
import { useTrip } from '../../hooks/useTrip';
import { useTrips } from '../../hooks/useTrips';
import {
  useAddStop,
  useUpdateStop,
  useDeleteStop,
  useAddStopActivity,
  useRemoveStopActivity,
} from '../../hooks/useTripMutations';
import StopCard from './StopCard';
import AddStopPlaceholder from './AddStopPlaceholder';
import { Loader2, CheckCircle2, Layers, Compass, Sparkles, Plus, ArrowRight, Calendar, MapPin, ChevronDown } from 'lucide-react';

export default function ItineraryBuilder({ tripId: propTripId, onNavigate }) {
  const { data: userTrips = [], isLoading: loadingTrips } = useTrips();
  const [selectedTripId, setSelectedTripId] = useState(propTripId || '');

  const effectiveTripId = propTripId || selectedTripId || (userTrips[0]?.id || '');
  const { data: trip, isLoading: loadingTrip } = useTrip(effectiveTripId);
  const [lastAddedStopId, setLastAddedStopId] = useState(null);

  const addStop = useAddStop(effectiveTripId);
  const updateStop = useUpdateStop(effectiveTripId);
  const deleteStop = useDeleteStop(effectiveTripId);
  const addActivity = useAddStopActivity(effectiveTripId);
  const removeActivity = useRemoveStopActivity(effectiveTripId);

  const isSyncing = addStop.isPending || updateStop.isPending || deleteStop.isPending || addActivity.isPending || removeActivity.isPending;

  if (loadingTrips || (effectiveTripId && loadingTrip)) {
    return (
      <div className="py-24 text-center space-y-4 max-w-md mx-auto font-sans">
        <div className="h-16 w-16 bg-[#F5B800]/15 text-[#1E232A] rounded-full flex items-center justify-center mx-auto shadow-inner">
          <Loader2 className="h-8 w-8 animate-spin text-[#F5B800]" />
        </div>
        <div className="space-y-1">
          <span className="font-script text-[#F5B800] text-3xl block">loading your route</span>
          <h3 className="font-serif font-black text-xl text-[#1E232A]">Retrieving Travel Workspace</h3>
          <p className="text-xs text-gray-500 font-sans">Preparing destination stops and scheduled activities…</p>
        </div>
      </div>
    );
  }

  if (!effectiveTripId || !trip) {
    return (
      <div className="max-w-xl mx-auto py-16 px-8 text-center bg-white border border-gray-200 rounded-3xl shadow-xl space-y-6 font-sans">
        <div className="h-16 w-16 bg-[#F5B800]/20 text-[#1E232A] rounded-full flex items-center justify-center mx-auto shadow-md">
          <Compass className="h-8 w-8 text-[#F5B800]" />
        </div>
        <div className="space-y-2">
          <span className="font-script text-[#F5B800] text-3xl block">ready to build?</span>
          <h2 className="text-3xl font-serif font-black text-[#1E232A] uppercase">
            No Active Journey Selected
          </h2>
          <p className="text-xs text-gray-500 leading-relaxed max-w-md mx-auto">
            Select an itinerary from your passport wallet or initialize a brand new journey to organize destination stops, hotels, and custom activities.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {onNavigate && (
            <>
              <button
                onClick={() => onNavigate('my-trips')}
                className="w-full sm:w-auto px-6 py-3 bg-gray-100 hover:bg-gray-200 text-[#1E232A] font-extrabold text-xs uppercase tracking-wider rounded-full transition cursor-pointer"
              >
                OPEN MY TRIPS
              </button>
              <button
                onClick={() => onNavigate('create-trip')}
                className="w-full sm:w-auto px-6 py-3 bg-[#F5B800] hover:bg-[#E0A600] text-[#1E232A] font-extrabold text-xs uppercase tracking-wider rounded-full transition cursor-pointer shadow-md flex items-center justify-center gap-1.5"
              >
                <Plus className="h-4 w-4" />
                CREATE NEW TRIP
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  const stops = [...(trip.stops || [])].sort((a, b) => (a.order_index ?? a.orderIndex ?? 0) - (b.order_index ?? b.orderIndex ?? 0));

  function handleAddStop(payload) {
    addStop.mutate(payload, {
      onSuccess: (newStop) => setLastAddedStopId(newStop?.id),
    });
  }

  function handleMove(stop, direction) {
    const idx = stops.findIndex((s) => s.id === stop.id);
    const swapWith = stops[idx + direction];
    if (!swapWith) return;
    updateStop.mutate({ stopId: stop.id, payload: { order_index: swapWith.order_index ?? swapWith.orderIndex ?? 0 } });
    updateStop.mutate({ stopId: swapWith.id, payload: { order_index: stop.order_index ?? stop.orderIndex ?? 0 } });
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 font-sans">
      
      {/* Header Card with Wanderers Gold Accents & Live Sync */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-script text-[#F5B800] text-3xl block leading-none">
              route orchestrator
            </span>

            {userTrips.length > 1 && (
              <div className="relative inline-block">
                <select
                  value={effectiveTripId}
                  onChange={(e) => setSelectedTripId(e.target.value)}
                  className="appearance-none pl-3.5 pr-8 py-1.5 bg-[#FAF9F6] border border-gray-300 rounded-full font-sans text-xs font-bold text-[#1E232A] focus:outline-none focus:ring-2 focus:ring-[#F5B800] transition cursor-pointer"
                >
                  {userTrips.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500 pointer-events-none" />
              </div>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-[#1E232A] leading-tight">
            {trip.name}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 font-sans">
            <span className="inline-flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full text-[#1E232A] font-semibold">
              <Calendar className="h-3.5 w-3.5 text-[#F5B800]" />
              {trip.start_date || trip.startDate} &ndash; {trip.end_date || trip.endDate}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full text-[#1E232A] font-semibold">
              <MapPin className="h-3.5 w-3.5 text-[#F5B800]" />
              {stops.length} {stops.length === 1 ? 'DESTINATION STOP' : 'DESTINATION STOPS'}
            </span>
          </div>
        </div>

        {/* Realtime Action Indicator & View Itinerary CTA */}
        <div className="shrink-0 flex flex-wrap items-center gap-3">
          {isSyncing ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E232A] text-[#F5B800] font-sans text-xs font-extrabold rounded-full shadow-sm animate-pulse">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>SAVING CHANGES...</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 font-sans text-xs font-bold rounded-full">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>SYNCED</span>
            </div>
          )}

          {onNavigate && (
            <button
              onClick={() => onNavigate('itinerary', { tripId: effectiveTripId })}
              className="px-6 py-2.5 bg-[#F5B800] hover:bg-[#E0A600] text-[#1E232A] font-sans text-xs font-extrabold uppercase tracking-wider transition flex items-center gap-2 cursor-pointer rounded-full shadow-md hover:shadow-lg"
            >
              <span>VIEW ITINERARY</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Vertical Milestone Timeline */}
      <div className="relative pl-10 sm:pl-12">
        {/* Timeline Connecting Bar */}
        <div className="absolute left-[19px] sm:left-[23px] top-6 bottom-6 w-1 bg-gradient-to-b from-[#F5B800] via-[#1E232A]/30 to-gray-300 rounded-full" aria-hidden="true" />

        <div className="flex flex-col gap-8">
          {stops.map((stop, i) => (
            <div key={stop.id} className="relative">
              {/* Gold Milestone Ring Badge */}
              <span
                className="absolute -left-10 sm:-left-12 top-6 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1E232A] text-[#F5B800] border-2 border-[#F5B800]
                  font-serif font-black text-sm flex items-center justify-center shadow-lg z-10"
                aria-hidden="true"
              >
                {i + 1}
              </span>

              <StopCard
                stop={stop}
                isFirst={i === 0}
                isLast={i === stops.length - 1}
                isNew={stop.id === lastAddedStopId}
                isDeleting={deleteStop.isPending && deleteStop.variables === stop.id}
                isUpdating={updateStop.isPending && updateStop.variables?.stopId === stop.id}
                isAddingActivity={addActivity.isPending && addActivity.variables?.stopId === stop.id}
                removingActivityId={removeActivity.isPending ? removeActivity.variables : null}
                onMoveUp={() => handleMove(stop, -1)}
                onMoveDown={() => handleMove(stop, 1)}
                onRemoveStop={() => deleteStop.mutate(stop.id)}
                onAddActivity={(activityId, activityObj) =>
                  addActivity.mutate({
                    stopId: stop.id,
                    payload: {
                      activity_id: activityId,
                      name: activityObj?.name,
                      category: activityObj?.category,
                      cost: activityObj?.cost,
                      scheduled_date: stop.start_date || stop.startDate
                    }
                  })
                }
                onRemoveActivity={(stopActivityId) => removeActivity.mutate(stopActivityId)}
              />
            </div>
          ))}

          {/* Add Stop Milestone Box */}
          <div className="relative">
            <span
              className="absolute -left-10 sm:-left-12 top-8 w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-dashed border-gray-400 bg-white text-gray-400 font-bold text-xs flex items-center justify-center z-10"
              aria-hidden="true"
            >
              +
            </span>
            <AddStopPlaceholder
              existingStops={stops}
              onAddStop={handleAddStop}
              isSubmitting={addStop.isPending}
            />
          </div>
        </div>
      </div>

    </div>
  );
}
