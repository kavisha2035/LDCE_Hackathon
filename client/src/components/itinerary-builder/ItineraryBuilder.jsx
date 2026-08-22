import React, { useState } from 'react';
import { useTrip } from '../../hooks/useTrip';
import {
  useAddStop,
  useUpdateStop,
  useDeleteStop,
  useAddStopActivity,
  useRemoveStopActivity,
} from '../../hooks/useTripMutations';
import StopCard from './StopCard';
import AddStopPlaceholder from './AddStopPlaceholder';
import { Loader2, CheckCircle2, Layers, Compass, Sparkles } from 'lucide-react';

/**
 * Screen 5 — Itinerary Builder. Vertical timeline rule down the left edge
 * connects stop cards in order_index order; this is the one screen where a
 * numbered structural device is earned — it's a real ordered trip.
 */
export default function ItineraryBuilder({ tripId }) {
  const { data: trip, isLoading } = useTrip(tripId);
  const [lastAddedStopId, setLastAddedStopId] = useState(null);

  const addStop = useAddStop(tripId);
  const updateStop = useUpdateStop(tripId);
  const deleteStop = useDeleteStop(tripId);
  const addActivity = useAddStopActivity(tripId);
  const removeActivity = useRemoveStopActivity(tripId);

  const isSyncing = addStop.isPending || updateStop.isPending || deleteStop.isPending || addActivity.isPending || removeActivity.isPending;

  if (isLoading || !trip) {
    return (
      <div className="py-16 text-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#2C5F7C]" />
        <p className="font-mono text-sm text-[#1F2B2E]/70">Retrieving travel itinerary document…</p>
      </div>
    );
  }

  const stops = [...(trip.stops || [])].sort((a, b) => a.order_index - b.order_index);

  function handleAddStop(payload) {
    addStop.mutate(payload, {
      onSuccess: (newStop) => setLastAddedStopId(newStop.id),
    });
  }

  function handleMove(stop, direction) {
    const idx = stops.findIndex((s) => s.id === stop.id);
    const swapWith = stops[idx + direction];
    if (!swapWith) return;
    updateStop.mutate({ stopId: stop.id, payload: { order_index: swapWith.order_index } });
    updateStop.mutate({ stopId: swapWith.id, payload: { order_index: stop.order_index } });
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Header with Live Sync Activity Indicator */}
      <header className="border-b-2 border-dashed border-[#1F2B2E] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#2C5F7C] font-bold">
              SCREEN 5 &bull; ITINERARY BUILDER
            </span>
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
        <div className="shrink-0">
          {isSyncing ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#2C5F7C] text-white border-2 border-[#1F2B2E] font-mono text-xs font-bold shadow-[2px_2px_0px_0px_#1F2B2E] animate-pulse">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>SAVING CHANGES...</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#7FA69C]/20 text-[#1F2B2E] border border-[#7FA69C] font-mono text-xs font-bold">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#7FA69C]" />
              <span>CHANGES SAVED</span>
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
