import { useState } from 'react';
import { useCityActivities } from '../../hooks/useCityActivities';
import { formatCurrency, formatDuration } from '../../lib/format';

const CATEGORIES = ['sightseeing', 'food', 'adventure', 'culture', 'nightlife'];

/**
 * Stub for Screen 8 (Activity Search), scoped to one city and embedded
 * inline in a Screen 5 stop card's "Add Activity" flow. Full Screen 8
 * (quick-view, image, category/cost/duration filters together) lands later —
 * this covers the mock data + category filter needed for Screen 5 today.
 */
export default function ActivitySearchScoped({ cityId, onAdd, onClose }) {
  const [category, setCategory] = useState('');
  const { data: activities = [], isLoading } = useCityActivities(cityId, { category });

  return (
    <div className="mt-2 border border-ink/20 rounded-sm bg-ink/[0.02] p-3">
      <div className="flex items-center justify-between mb-2">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-2 py-1 rounded-sm border border-ink/25 bg-paper text-caption font-body focus:outline-none focus:border-route-blue"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button type="button" onClick={onClose} className="text-caption text-ink/50 hover:text-ink">
          Close
        </button>
      </div>

      {isLoading ? (
        <p className="text-body-sm text-ink/50 py-3 text-center">Loading activities…</p>
      ) : activities.length === 0 ? (
        <p className="text-body-sm text-ink/50 py-3 text-center">No activities found for this city yet.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-ink/10">
          {activities.map((activity) => (
            <li key={activity.id} className="flex items-center justify-between gap-3 py-2">
              <div className="min-w-0">
                <p className="text-body-sm font-body text-ink truncate">{activity.name}</p>
                <p className="text-caption text-ink/50 capitalize">{activity.category}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-mono text-caption text-ochre">{formatCurrency(activity.cost)}</span>
                <span className="font-mono text-caption text-ink/50">{formatDuration(activity.duration_hours)}</span>
                <button
                  type="button"
                  onClick={() => onAdd(activity.id)}
                  className="px-2.5 py-1 rounded-sm bg-route-blue text-paper text-caption font-body hover:bg-route-blue/90 transition-colors"
                >
                  Add
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
