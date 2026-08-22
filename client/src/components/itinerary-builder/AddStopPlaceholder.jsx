import { useState } from 'react';
import CitySearch from '../city-search/CitySearch';
import DateRangePicker from './DateRangePicker';
import { rangesOverlap } from '../../lib/format';

/**
 * "A blank ticket waiting to be filled in" — dashed-outline card the same
 * shape as TicketCard, not a generic + button. Clicking it embeds Screen 7
 * (city search) then a date range picker.
 */
export default function AddStopPlaceholder({ existingStops, onAddStop, isSubmitting }) {
  const [open, setOpen] = useState(false);
  const [city, setCity] = useState(null);
  const [dates, setDates] = useState({ start: '', end: '' });
  const [error, setError] = useState('');

  function reset() {
    setOpen(false);
    setCity(null);
    setDates({ start: '', end: '' });
    setError('');
  }

  function handlePickCity(pickedCity) {
    setCity(pickedCity);
    setError('');
  }

  function handleDatesChange(next) {
    setDates(next);
    setError('');
  }

  function handleSubmit() {
    if (!city) return;
    if (!dates.start || !dates.end) {
      setError('Pick a start and end date for this stop.');
      return;
    }
    if (dates.end < dates.start) {
      setError('End date has to be after the start date.');
      return;
    }
    const overlapping = existingStops.find((s) => rangesOverlap(dates.start, dates.end, s.start_date, s.end_date));
    if (overlapping) {
      setError(`That date range overlaps your ${overlapping.city.name} stop. Adjust the dates or remove it first.`);
      return;
    }
    onAddStop({
      city_id: city.id,
      start_date: dates.start,
      end_date: dates.end,
      est_stay_cost_per_day: 0,
      est_transport_cost: 0,
    });
    reset();
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full border-2 border-dashed border-ink/30 rounded-sm px-5 py-6 flex items-center justify-center
          gap-2 text-ink/50 hover:text-route-blue hover:border-route-blue transition-colors font-body text-body-sm"
      >
        <span className="font-display text-subhead leading-none">+</span>
        Add stop
      </button>
    );
  }

  return (
    <div className="border-2 border-dashed border-route-blue/60 rounded-sm px-5 py-5 bg-route-blue/[0.03]">
      {!city ? (
        <>
          <p className="text-body-sm text-ink/60 mb-3">Pick a city for this stop.</p>
          <CitySearch embedded onAddToTrip={handlePickCity} />
        </>
      ) : (
        <>
          <div className="flex items-center justify-between mb-3">
            <p className="font-display font-semibold text-subhead text-ink">{city.name}, {city.country}</p>
            <button type="button" onClick={() => setCity(null)} className="text-caption text-ink/50 hover:text-ink">
              Change city
            </button>
          </div>
          <DateRangePicker
            startDate={dates.start}
            endDate={dates.end}
            onChange={handleDatesChange}
            error={error}
          />
          <div className="flex items-center gap-2 mt-4">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-sm bg-route-blue text-paper text-body-sm font-body hover:bg-route-blue/90 transition-colors disabled:opacity-50"
            >
              Add stop
            </button>
            <button type="button" onClick={reset} className="px-4 py-2 rounded-sm text-body-sm text-ink/60 hover:text-ink">
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}
