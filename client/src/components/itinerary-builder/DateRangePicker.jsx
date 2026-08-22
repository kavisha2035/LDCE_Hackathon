import React from 'react';
import { Calendar } from 'lucide-react';

export default function DateRangePicker({ startDate, endDate, onChange, error }) {
  return (
    <div className="space-y-2 font-sans">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-[#F5B800]" />
            Arrival Date
          </span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onChange({ start: e.target.value, end: endDate })}
            className="w-full px-4 py-2.5 rounded-full border border-gray-300 bg-white font-sans text-xs text-[#1E232A] focus:outline-none focus:ring-2 focus:ring-[#F5B800] transition"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-[#F5B800]" />
            Departure Date
          </span>
          <input
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => onChange({ start: startDate, end: e.target.value })}
            className="w-full px-4 py-2.5 rounded-full border border-gray-300 bg-white font-sans text-xs text-[#1E232A] focus:outline-none focus:ring-2 focus:ring-[#F5B800] transition"
          />
        </label>
      </div>

      {error && (
        <p className="text-xs text-red-500 font-semibold bg-red-50 p-2 rounded-xl border border-red-100">
          {error}
        </p>
      )}
    </div>
  );
}
