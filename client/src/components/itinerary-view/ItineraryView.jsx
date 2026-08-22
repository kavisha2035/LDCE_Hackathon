import { useState } from 'react';
import { useTrip } from '../../hooks/useTrip';
import { useTrips } from '../../hooks/useTrips';
import StopReadOnly from './StopReadOnly';
import ViewModeToggle from './ViewModeToggle';
import { Loader2, Compass, Plus, Edit3 } from 'lucide-react';

export default function ItineraryView({ tripId: propTripId, onNavigate }) {
  const { data: userTrips = [], isLoading: loadingTrips } = useTrips();
  const [selectedTripId, setSelectedTripId] = useState(propTripId || '');

  const effectiveTripId = propTripId || selectedTripId || (userTrips[0]?.id || '');
  const { data: trip, isLoading: loadingTrip } = useTrip(effectiveTripId);
  const [mode, setMode] = useState('list');

  if (loadingTrips || (effectiveTripId && loadingTrip)) {
    return (
      <div className="py-16 text-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#2C5F7C]" />
        <p className="font-mono text-sm text-[#1F2B2E]/70">Retrieving travel itinerary view…</p>
      </div>
    );
  }

  if (!effectiveTripId || !trip) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center bg-white border border-[#1F2B2E] p-8 shadow-[4px_4px_0px_0px_#1F2B2E] space-y-4 font-sans">
        <Compass className="h-12 w-12 text-[#2C5F7C] mx-auto animate-pulse" />
        <h2 className="text-2xl font-serif font-bold text-[#1E232A]">NO ITINERARY TO VIEW</h2>
        <p className="text-xs text-gray-600">
          Select an itinerary from your passport wallet or create a journey to view its daily breakdown.
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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b-2 border-dashed border-ink pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-[10px] font-mono uppercase tracking-widest text-route-blue font-bold">
              ITINERARY VIEW
            </p>
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
          <h1 className="text-3xl font-extrabold font-display tracking-tight text-ink leading-none">
            {trip.name}
          </h1>
          <p className="font-mono text-body-sm text-ink/60 mt-2">
            {trip.start_date || trip.startDate} – {trip.end_date || trip.endDate}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onNavigate && (
            <button
              onClick={() => onNavigate('builder', { tripId: effectiveTripId })}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-[#1E232A] font-mono text-xs font-bold transition flex items-center gap-1 cursor-pointer border border-[#1F2B2E]"
            >
              <Edit3 className="h-3 w-3" />
              <span>EDIT IN BUILDER</span>
            </button>
          )}
          <ViewModeToggle mode={mode} onChange={setMode} />
        </div>
      </header>

      {mode === 'calendar' ? (
        <p className="text-body-sm text-ink/50 py-12 text-center border border-dashed border-ink/25 rounded-sm">
          Use the Calendar tab in the top navigation for the interactive full-month calendar grid.
        </p>
      ) : (
        <div className="relative pl-8">
          <div className="absolute left-[11px] top-2 bottom-2 w-px bg-ink/20" aria-hidden="true" />
          <div className="flex flex-col gap-6">
            {stops.map((stop, i) => (
              <div key={stop.id || i} className="relative">
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
