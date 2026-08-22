import React from 'react';
import CostDots from './CostDots';
import { Plus, Bookmark, Loader2, Sparkles, MapPin } from 'lucide-react';

export default function CityResultRow({ city, onAdd, onSave, saving = false }) {
  const costIdx = city.cost_index ?? city.costIndex ?? 1;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 px-6 hover:bg-[#FAF9F6] transition-colors border-b border-gray-100 last:border-b-0 font-sans">
      
      {/* City & Region Info */}
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <h4 className="font-serif font-bold text-lg text-[#1E232A] truncate">
            {city.name}
          </h4>
          {city.region && (
            <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-sans font-bold uppercase rounded-full border border-gray-200">
              {city.region}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 font-medium truncate flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5 text-[#F5B800]" />
          <span>{city.country?.toUpperCase() || 'WORLD'}</span>
        </p>
      </div>

      {/* Cost Indicators */}
      <div className="shrink-0 flex items-center gap-4">
        <CostDots costIndex={costIdx} />

        {/* Popularity Badge */}
        <div className="shrink-0 text-right min-w-[70px]">
          <span className="font-sans font-extrabold text-sm text-[#1E232A] block leading-none">
            {city.popularity || 90}%
          </span>
          <span className="text-[10px] font-sans font-semibold text-gray-400 uppercase tracking-wider">
            POPULARITY
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="shrink-0 flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => onSave?.(city)}
          disabled={saving}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#1E232A] text-xs font-bold uppercase tracking-wider rounded-full border border-gray-200 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-[#F5B800]" />
          ) : (
            <Bookmark className="h-3.5 w-3.5 text-gray-500" />
          )}
          <span>Save</span>
        </button>

        {onAdd && (
          <button
            type="button"
            onClick={() => onAdd(city)}
            className="px-5 py-2 bg-[#F5B800] hover:bg-[#E0A600] text-[#1E232A] text-xs font-extrabold uppercase tracking-wider rounded-full transition shadow-md hover:shadow-lg flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add to Trip</span>
          </button>
        )}
      </div>

    </div>
  );
}
