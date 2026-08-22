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
import { Loader2, CheckCircle2, Layers, Compass, Sparkles, Plus, ArrowRight } from 'lucide-react';

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
      <div className="py-16 text-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#2C5F7C]" />
        <p className="font-mono text-sm text-[#1F2B2E]/70">Retrieving travel itinerary document…</p>
      </div>
    );
  }

  if (!effectiveTripId || !trip) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center bg-white border border-[#1F2B2E] p-8 shadow-[4px_4px_0px_0px_#1F2B2E] space-y-4 font-sans">
        <Compass className="h-12 w-12 text-[#2C5F7C] mx-auto animate-pulse" />
        <h2 className="text-2xl font-serif font-bold text-[#1E232A]">NO ACTIVE JOURNEY SELECTED</h2>
        <p className="text-xs text-gray-600">
          Select an itinerary from your passport wallet or create a new voyage to start organizing destination stops and activities.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {onNavigate && (
            <>
              <button
                onClick={() => onNavigate('my-trips')}
                className="w-full sm:w-auto px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#1E232A] font-bold text-xs uppercase tracking-wider transition cursor-pointer"
              >
                OPEN MY TRIPS
              </button>
              <button
                onClick={() => onNavigate('create-trip')}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#F5B800] hover:bg-[#E0A600] text-[#1E232A] font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-md flex items-center justify-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
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
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Header with Live Sync Activity Indicator */}
      <header className="border-b-2 border-dashed border-[#1F2B2E] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#2C5F7C] font-bold">
              ITINERARY BUILDER
            </span>
            {userTrips.length > 1 && (
              <select
                value={effectiveTripId}
                onChange={(e) => setSelectedTripId(e.target.value)}
                className="text-[11px] font-mono bg-white border border-[#1F2B2E] px-2 py-0.5"
              >
                {userTrips.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            )}
          </div>
          <h1 className="text-3xl font-extrabold font-display tracking-tight text-[#1F2B2E] leading-none">
            {trip.name}
          </h1>
          <p className="font-mono text-xs text-[#1F2B2E]/70 mt-1.5 flex items-center gap-2">
            <span>🗓 {trip.start_date || trip.startDate} – {trip.end_date || trip.endDate}</span>
            <span>&bull;</span>
            <span>{stops.length} {stops.length === 1 ? 'DESTINATION STOP' : 'DESTINATION STOPS'}</span>
          </p>
        </div>

        {/* Realtime Action Indicator */}
        <div className="shrink-0 flex items-center gap-2">
          {onNavigate && (
            <button
              onClick={() => onNavigate('itinerary', { tripId: effectiveTripId })}
              className="px-3 py-1.5 bg-[#F5B800] hover:bg-[#E0A600] text-[#1E232A] font-mono text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <span>VIEW ITINERARY</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          )}
          {isSyncing ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#2C5F7C] text-white border-2 border-[#1F2B2E] font-mono text-xs font-bold shadow-[2px_2px_0px_0px_#1F2B2E] animate-pulse">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>SAVING...</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#7FA69C]/20 text-[#1F2B2E] border border-[#7FA69C] font-mono text-xs font-bold">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#7FA69C]" />
              <span>SAVED</span>
            </div>
          )}
        </div>
      </header>

      {/* Vertical Timeline Rule & Stops */}
      <div className="relative pl-8">
        <div className="absolute left-[11px] top-2 bottom-2 w-px bg-[#1F2B2E]/20" aria-hidden="true" />

        <div className="flex flex-col gap-6">
          {stops.map((stop, i) => (
            <div key={stop.id} className="relative">
              <span
                className="absolute -left-8 top-6 w-[22px] h-[22px] rounded-full bg-[#2C5F7C] text-[#F6F3EC]
                  font-mono text-[11px] font-bold flex items-center justify-center border border-[#1F2B2E]"
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
                      scheduled_date: stop.start_date
                    }
                  })
                }
                onRemoveActivity={(stopActivityId) => removeActivity.mutate(stopActivityId)}
              />
            </div>
          ))}

          {/* Add Stop Box */}
          <div className="relative">
            <span
              className="absolute -left-8 top-6 w-[22px] h-[22px] rounded-full border-2 border-dashed border-[#1F2B2E]/40"
              aria-hidden="true"
            />
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
