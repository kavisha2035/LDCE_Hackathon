import { useState } from 'react';
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

  if (isLoading || !trip) {
    return <p className="text-body-sm text-ink/50 py-12 text-center">Loading itinerary…</p>;
  }

  const stops = [...trip.stops].sort((a, b) => a.order_index - b.order_index);

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
    <div className="max-w-3xl mx-auto">
      <header className="mb-8 border-b-2 border-dashed border-ink pb-4">
        <p className="text-[10px] font-mono uppercase tracking-widest text-route-blue mb-1">Screen 5 &bull; Itinerary Builder</p>
        <h1 className="text-3xl font-extrabold font-display tracking-tight text-ink leading-none">{trip.name}</h1>
        <p className="font-mono text-body-sm text-ink/60 mt-2">
          {trip.start_date} – {trip.end_date}
        </p>
      </header>

      <div className="relative pl-8">
        <div className="absolute left-[11px] top-2 bottom-2 w-px bg-ink/20" aria-hidden="true" />

        <div className="flex flex-col gap-6">
          {stops.map((stop, i) => (
            <div key={stop.id} className="relative">
              <span
                className="absolute -left-8 top-6 w-[22px] h-[22px] rounded-full bg-route-blue text-paper
                  font-mono text-caption flex items-center justify-center"
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <StopCard
                stop={stop}
                isFirst={i === 0}
                isLast={i === stops.length - 1}
                isNew={stop.id === lastAddedStopId}
                onMoveUp={() => handleMove(stop, -1)}
                onMoveDown={() => handleMove(stop, 1)}
                onRemoveStop={() => deleteStop.mutate(stop.id)}
                onAddActivity={(activityId) =>
                  addActivity.mutate({ stopId: stop.id, payload: { activity_id: activityId } })
                }
                onRemoveActivity={(stopActivityId) => removeActivity.mutate(stopActivityId)}
              />
            </div>
          ))}

          <div className="relative">
            <span
              className="absolute -left-8 top-6 w-[22px] h-[22px] rounded-full border-2 border-dashed border-ink/30"
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
