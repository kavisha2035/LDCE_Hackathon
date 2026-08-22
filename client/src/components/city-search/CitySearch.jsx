import React, { useState } from 'react';
import { useCities } from '../../hooks/useCities';
import { useSaveDestination } from '../../hooks/useSaveDestination';
import CityResultRow from './CityResultRow';
import { Search, MapPin, Globe } from 'lucide-react';

const REGIONS = ['Europe', 'Asia', 'Africa', 'North America', 'South America', 'Oceania'];
const COST_LEVELS = [1, 2, 3, 4, 5];

export default function CitySearch({ onAddToTrip, embedded = false, initialSearch = '' }) {
  const [search, setSearch] = useState(initialSearch);
  const [region, setRegion] = useState('');
  const [costIndex, setCostIndex] = useState('');

  const { data: cities = [], isLoading } = useCities({ search, region, costIndex });
  const saveMutation = useSaveDestination();

  return (
    <div className={embedded ? 'w-full' : 'w-full max-w-[1600px] mx-auto px-6 sm:px-12 py-8 font-sans space-y-6'}>
      {!embedded && (
        <div className="bg-white border border-gray-200 p-8 rounded-3xl shadow-xl space-y-2">
          <span className="font-script text-[#F5B800] text-3xl block">explore destinations</span>
          <h1 className="text-4xl font-serif font-bold text-[#1E232A] uppercase tracking-wide">
            CITY DISCOVERY & SEARCH
          </h1>
          <p className="text-xs text-gray-500 font-sans">
            Filter reference cities with cost indices, popularity ratings, and activity catalogs.
          </p>
        </div>
      )}

      {/* Curvy Search & Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by city or country (e.g. Paris, Tokyo, Italy)..."
            className="w-full bg-white border border-gray-300 rounded-full pl-11 pr-4 py-3 text-sm font-semibold text-[#1E232A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F5B800] shadow-sm"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-full px-5 py-3 text-sm font-semibold text-[#1E232A] focus:outline-none focus:ring-2 focus:ring-[#F5B800] shadow-sm cursor-pointer"
          >
            <option value="">All Regions</option>
            {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={costIndex}
            onChange={(e) => setCostIndex(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-full px-5 py-3 text-sm font-semibold text-[#1E232A] focus:outline-none focus:ring-2 focus:ring-[#F5B800] shadow-sm cursor-pointer"
          >
            <option value="">Any Cost Index</option>
            {COST_LEVELS.map((c) => <option key={c} value={c}>Cost Index {c} / 5</option>)}
          </select>
        </div>
      </div>

      {/* Results Container */}
      <div className="bg-white border border-gray-200 rounded-3xl shadow-xl overflow-hidden divide-y divide-gray-100">
        {isLoading ? (
          <p className="py-16 text-center text-sm font-bold uppercase tracking-wider text-gray-400">Searching destinations...</p>
        ) : cities.length === 0 ? (
          <p className="py-16 text-center text-sm font-semibold text-gray-500">
            No cities match your search filter — try a different city name.
          </p>
        ) : (
          cities.map((city) => (
            <CityResultRow
              key={city.id}
              city={city}
              onAdd={onAddToTrip}
              onSave={(c) => saveMutation.mutate(c.id)}
              saving={saveMutation.isPending && saveMutation.variables === city.id}
            />
          ))
        )}
      </div>
    </div>
  );
}
