import React, { useState } from 'react';
import CitySearch from '../city-search/CitySearch';
import DateRangePicker from './DateRangePicker';
import { rangesOverlap } from '../../lib/format';
import { Plus, MapPin, Loader2, X, Sparkles } from 'lucide-react';

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
      setError('Pick arrival and departure dates for this stop.');
      return;
    }
    if (dates.end < dates.start) {
      setError('Departure date must be after the arrival date.');
      return;
    }
    const overlapping = existingStops.find((s) => rangesOverlap(dates.start, dates.end, s.start_date || s.startDate, s.end_date || s.endDate));
    if (overlapping) {
      setError(`That date range overlaps your ${overlapping.city?.name || 'existing'} stop. Adjust the dates or remove it first.`);
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
        className="w-full border-2 border-dashed border-gray-300 hover:border-[#F5B800] bg-white/70 hover:bg-white rounded-3xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-center gap-3 text-gray-500 hover:text-[#1E232A] transition-all duration-300 cursor-pointer group shadow-sm hover:shadow-xl"
      >
        <div className="h-12 w-12 rounded-full bg-gray-100 group-hover:bg-[#F5B800] text-gray-700 group-hover:text-[#1E232A] transition flex items-center justify-center shadow-sm">
          <Plus className="h-6 w-6 transform group-hover:rotate-90 transition-transform duration-300" />
        </div>
        <div className="text-center sm:text-left">
          <span className="font-serif font-bold text-lg text-[#1E232A] block">
            Add Next Destination Stop
          </span>
          <span className="text-xs text-gray-400 font-sans">
            Choose a city and schedule dates to extend this journey
          </span>
        </div>
      </button>
    );
  }

  return (
    <div className="border border-gray-200 rounded-3xl p-6 sm:p-8 bg-white shadow-xl space-y-6 font-sans">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-full bg-[#F5B800]/20 text-[#1E232A] flex items-center justify-center">
            <MapPin className="h-5 w-5 text-[#F5B800]" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-[#1E232A] leading-tight">
              Add Destination Stop
            </h3>
            <p className="text-xs text-gray-500">Pick destination and set stop schedule</p>
          </div>
        </div>

        <button
          type="button"
          onClick={reset}
          className="p-1.5 rounded-full text-gray-400 hover:text-[#1E232A] hover:bg-gray-100 transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {!city ? (
        <div className="space-y-4">
          <p className="text-xs font-semibold text-gray-600">
            Select a destination city for this segment:
          </p>
          <CitySearch embedded onAddToTrip={handlePickCity} />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-[#FAF9F6] p-4 rounded-2xl border border-gray-200">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#F5B800] block">
                SELECTED DESTINATION
              </span>
              <h4 className="font-serif font-black text-xl text-[#1E232A]">
                {city.name}, <span className="text-gray-500 font-sans text-sm font-medium">{city.country}</span>
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setCity(null)}
              className="px-3.5 py-1.5 bg-white hover:bg-gray-100 border border-gray-200 rounded-full text-xs font-bold text-[#1E232A] transition cursor-pointer"
            >
              Change City
            </button>
          </div>

          <DateRangePicker
            startDate={dates.start}
            endDate={dates.end}
            onChange={handleDatesChange}
            error={error}
          />

          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-3 rounded-full bg-[#F5B800] hover:bg-[#E0A600] text-[#1E232A] text-xs font-extrabold uppercase tracking-wider transition disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-md"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  ADDING STOP TO ROUTE...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  CONFIRM & ADD STOP
                </>
              )}
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={reset}
              className="px-5 py-3 rounded-full text-xs font-bold text-gray-500 hover:text-[#1E232A] hover:bg-gray-100 uppercase transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
