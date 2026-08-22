import React, { useState } from 'react';
import { useCities } from '../../hooks/useCities';
import { useSaveDestination } from '../../hooks/useSaveDestination';
import CityResultRow from './CityResultRow';

const REGIONS = ['Europe', 'Asia', 'Africa', 'North America', 'South America', 'Oceania'];
const COST_LEVELS = [1, 2, 3, 4, 5];

/**
 * Screen 7 — City Search. Standalone: any screen that needs city discovery
 * (Screen 5's Add Stop flow, Dashboard's recommendations) imports and
 * embeds this directly rather than duplicating it.
 */
export default function CitySearch({ onAddToTrip, embedded = false }) {
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('');
  const [costIndex, setCostIndex] = useState('');

  const { data: cities = [], isLoading } = useCities({ search, region, costIndex });
  const saveMutation = useSaveDestination();

  return (
    <div className={embedded ? '' : 'max-w-3xl mx-auto'}>
      {!embedded && (
        <div className="flex items-center justify-between border-b-2 border-dashed border-ink pb-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold font-display tracking-tight text-ink leading-none">CITY SEARCH</h1>
            <span className="text-[10px] font-mono uppercase tracking-widest text-route-blue">Screen 7 &bull; Discovery</span>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="e.g. Lisbon, Portugal"
          className="flex-1 bg-paper border border-ink px-3 py-2 font-mono text-sm text-ink placeholder-ink/40 focus:outline-none focus:ring-2 focus:ring-route-blue"
        />
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="bg-paper border border-ink px-3 py-2 text-sm font-mono text-ink focus:outline-none focus:ring-2 focus:ring-route-blue"
        >
          <option value="">All regions</option>
          {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select
          value={costIndex}
          onChange={(e) => setCostIndex(e.target.value)}
          className="bg-paper border border-ink px-3 py-2 text-sm font-mono text-ink focus:outline-none focus:ring-2 focus:ring-route-blue"
        >
          <option value="">Any cost</option>
          {COST_LEVELS.map((c) => <option key={c} value={c}>Cost index {c}</option>)}
        </select>
      </div>

      <div className="border border-ink bg-white shadow-[3px_3px_0px_0px_#1F2B2E]">
        {isLoading ? (
          <p className="py-8 text-center text-sm font-mono text-ink/50">Searching…</p>
        ) : cities.length === 0 ? (
          <p className="py-8 text-center text-sm font-mono text-ink/50">
            No cities found — try a different search.
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
