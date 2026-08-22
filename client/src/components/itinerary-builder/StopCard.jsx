import { useState } from 'react';
import TicketCard from '../ticket/TicketCard';
import ActivityChip from './ActivityChip';
import ActivitySearchScoped from './ActivitySearchScoped';
import { formatCurrency } from '../../lib/format';

export default function StopCard({
  stop,
  isFirst,
  isLast,
  isNew,
  onMoveUp,
  onMoveDown,
  onRemoveStop,
  onAddActivity,
  onRemoveActivity,
}) {
  const [addingActivity, setAddingActivity] = useState(false);

  return (
    <TicketCard
      cityName={stop.city.name}
      country={stop.city.country}
      startDate={stop.start_date}
      endDate={stop.end_date}
      mode="edit"
      isNew={isNew}
      headerActions={
        <>
          <button
            type="button"
            onClick={onMoveUp}
            disabled={isFirst}
            aria-label="Move stop earlier"
            className="w-7 h-7 flex items-center justify-center rounded-sm border border-ink/25 text-ink/70 hover:border-route-blue hover:text-route-blue disabled:opacity-30 disabled:hover:border-ink/25 disabled:hover:text-ink/70 transition-colors"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={isLast}
            aria-label="Move stop later"
            className="w-7 h-7 flex items-center justify-center rounded-sm border border-ink/25 text-ink/70 hover:border-route-blue hover:text-route-blue disabled:opacity-30 disabled:hover:border-ink/25 disabled:hover:text-ink/70 transition-colors"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={onRemoveStop}
            aria-label={`Remove ${stop.city.name} stop`}
            className="w-7 h-7 flex items-center justify-center rounded-sm border border-ink/25 text-ink/50 hover:border-stamp-red hover:text-stamp-red transition-colors"
          >
            ×
          </button>
        </>
      }
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-2 font-mono text-caption text-ink/60">
        <span>stay <span className="text-ochre">{formatCurrency(stop.est_stay_cost_per_day)}</span>/day</span>
        <span>transport <span className="text-ochre">{formatCurrency(stop.est_transport_cost)}</span></span>
      </div>

      <div className="flex flex-wrap gap-2">
        {stop.activities.map((sa) => (
          <ActivityChip key={sa.id} stopActivity={sa} onRemove={onRemoveActivity} />
        ))}
        <button
          type="button"
          onClick={() => setAddingActivity((v) => !v)}
          className="inline-flex items-center px-3 py-1.5 rounded-sm border border-dashed border-ink/30 text-body-sm text-ink/60 hover:border-route-blue hover:text-route-blue transition-colors"
        >
          + Add activity
        </button>
      </div>

      {addingActivity && (
        <ActivitySearchScoped
          cityId={stop.city_id}
          onAdd={(activityId) => {
            onAddActivity(activityId);
          }}
          onClose={() => setAddingActivity(false)}
        />
      )}
    </TicketCard>
  );
}
