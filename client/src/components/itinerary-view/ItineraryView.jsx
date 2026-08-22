import { useState } from 'react';
import { useTrip } from '../../hooks/useTrip';
import StopReadOnly from './StopReadOnly';
import ViewModeToggle from './ViewModeToggle';

/**
 * Screen 6 — Itinerary View. Read-optimized render of the same trip payload
 * Screen 5 uses — one shared hook, two renderings. Same vertical timeline
 * rule as Screen 5 for visual continuity, but no edit affordances and
 * activities render as a day-grouped list instead of chips.
 */
export default function ItineraryView({ tripId }) {
  const { data: trip, isLoading } = useTrip(tripId);
  const [mode, setMode] = useState('list');

  if (isLoading || !trip) {
    return <p className="text-body-sm text-ink/50 py-12 text-center">Loading itinerary…</p>;
  }

  const stops = [...trip.stops].sort((a, b) => a.order_index - b.order_index);

  return (
    <div className="max-w-3xl mx-auto">
      <header className="mb-8 flex items-start justify-between gap-4 border-b-2 border-dashed border-ink pb-4">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-route-blue mb-1">Screen 6 &bull; Itinerary View</p>
          <h1 className="text-3xl font-extrabold font-display tracking-tight text-ink leading-none">{trip.name}</h1>
          <p className="font-mono text-body-sm text-ink/60 mt-2">
            {trip.start_date} – {trip.end_date}
          </p>
        </div>
        <ViewModeToggle mode={mode} onChange={setMode} />
      </header>

      {mode === 'calendar' ? (
        <p className="text-body-sm text-ink/50 py-12 text-center border border-dashed border-ink/25 rounded-sm">
          Calendar view is coming soon.
        </p>
      ) : (
        <div className="relative pl-8">
          <div className="absolute left-[11px] top-2 bottom-2 w-px bg-ink/20" aria-hidden="true" />
          <div className="flex flex-col gap-6">
            {stops.map((stop, i) => (
              <div key={stop.id} className="relative">
                <span
                  className="absolute -left-8 top-6 w-[22px] h-[22px] rounded-full bg-sea text-ink border border-ink
                    font-mono text-caption font-bold flex items-center justify-center"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <StopReadOnly stop={stop} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
