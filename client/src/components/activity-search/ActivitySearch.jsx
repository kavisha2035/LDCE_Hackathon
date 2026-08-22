import { useState } from 'react';
import { useCities } from '../../hooks/useCities';
import { useCityActivities } from '../../hooks/useCityActivities';
import ActivityCard from './ActivityCard';

const CATEGORIES = ['sightseeing', 'food', 'adventure', 'culture', 'nightlife'];
const COST_CAPS = [
  { label: 'Any cost', value: '' },
  { label: 'Under ₹2,000', value: '2000' },
  { label: 'Under ₹4,000', value: '4000' },
  { label: 'Under ₹8,000', value: '8000' },
];

/**
 * Screen 8 — Activity Search. Standalone here (city picker up top); when
 * embedded inside a Screen 5 stop, the host passes a fixed `cityId` and
 * hides the picker instead.
 */
export default function ActivitySearch({ cityId: fixedCityId, onAdd, embedded = false }) {
  const { data: cities = [] } = useCities();
  const [pickedCityId, setPickedCityId] = useState(fixedCityId || '');
  const cityId = fixedCityId || pickedCityId || (cities[0]?.id || '');
  const [category, setCategory] = useState('');
  const [maxCost, setMaxCost] = useState('');

  const { data: activities = [], isLoading } = useCityActivities(cityId, { category, maxCost });
  const city = cities.find((c) => c.id === cityId);

  return (
    <div className={embedded ? '' : 'max-w-5xl mx-auto'}>
      {!embedded && (
        <div className="flex items-center justify-between border-b-2 border-dashed border-ink pb-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold font-display tracking-tight text-ink leading-none">ACTIVITY SEARCH</h1>
            <span className="text-[10px] font-mono uppercase tracking-widest text-route-blue">Screen 8 &bull; Discovery</span>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {!fixedCityId && (
          <select
            value={pickedCityId}
            onChange={(e) => setPickedCityId(e.target.value)}
            className="bg-paper border border-ink px-3 py-2 text-sm font-mono text-ink focus:outline-none focus:ring-2 focus:ring-route-blue"
          >
            {cities.map((c) => <option key={c.id} value={c.id}>{c.name}, {c.country}</option>)}
          </select>
        )}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-paper border border-ink px-3 py-2 text-sm font-mono text-ink focus:outline-none focus:ring-2 focus:ring-route-blue"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={maxCost}
          onChange={(e) => setMaxCost(e.target.value)}
          className="bg-paper border border-ink px-3 py-2 text-sm font-mono text-ink focus:outline-none focus:ring-2 focus:ring-route-blue"
        >
          {COST_CAPS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      {city && !embedded && (
        <p className="text-xs font-mono text-ink/50 uppercase tracking-wide mb-4">
          Showing activities in {city.name}, {city.country}
        </p>
      )}

      {isLoading ? (
        <p className="py-8 text-center text-sm font-mono text-ink/50">Loading activities…</p>
      ) : activities.length === 0 ? (
        <p className="py-8 text-center text-sm font-mono text-ink/50 border border-dashed border-ink/30">
          No activities found — try a different filter.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} onAdd={onAdd} />
          ))}
        </div>
      )}
    </div>
  );
}
