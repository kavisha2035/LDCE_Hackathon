import React, { useState } from 'react';
import StopTicketCard from '../ticket/StopTicketCard';
import ActivityChip from './ActivityChip';
import ActivitySearchScoped from './ActivitySearchScoped';
import { formatCurrency } from '../../lib/format';
import { Loader2 } from 'lucide-react';

export default function StopCard({
  stop,
  isFirst,
  isLast,
  isNew,
  isDeleting,
  isUpdating,
  isAddingActivity,
  removingActivityId,
  onMoveUp,
  onMoveDown,
  onRemoveStop,
  onAddActivity,
  onRemoveActivity,
}) {
  const [addingActivity, setAddingActivity] = useState(false);

  return (
    <StopTicketCard
      cityName={stop.city?.name || 'Destination'}
      country={stop.city?.country || ''}
      startDate={stop.start_date || stop.startDate}
      endDate={stop.end_date || stop.endDate}
      mode="edit"
      isNew={isNew}
      headerActions={
        <>
          <button
            type="button"
            onClick={onMoveUp}
            disabled={isFirst || isUpdating || isDeleting}
            aria-label="Move stop earlier"
            className="w-7 h-7 flex items-center justify-center rounded-sm border border-[#1F2B2E]/25 text-[#1F2B2E]/70 hover:border-[#2C5F7C] hover:text-[#2C5F7C] disabled:opacity-30 disabled:hover:border-[#1F2B2E]/25 transition cursor-pointer"
          >
            {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : '↑'}
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={isLast || isUpdating || isDeleting}
            aria-label="Move stop later"
            className="w-7 h-7 flex items-center justify-center rounded-sm border border-[#1F2B2E]/25 text-[#1F2B2E]/70 hover:border-[#2C5F7C] hover:text-[#2C5F7C] disabled:opacity-30 disabled:hover:border-[#1F2B2E]/25 transition cursor-pointer"
          >
            {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : '↓'}
          </button>
          <button
            type="button"
            onClick={onRemoveStop}
            disabled={isDeleting}
            aria-label={`Remove ${stop.city?.name || 'stop'}`}
            className="w-7 h-7 flex items-center justify-center rounded-sm border border-[#1F2B2E]/25 text-[#1F2B2E]/50 hover:border-[#B84A3E] hover:text-[#B84A3E] transition cursor-pointer disabled:opacity-40"
          >
            {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin text-[#B84A3E]" /> : '×'}
          </button>
        </>
      }
    >
      {/* Cost Estimates */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-2 font-mono text-[11px] text-[#1F2B2E]/70">
        <span>stay <span className="text-[#B8823A] font-bold">{formatCurrency(stop.est_stay_cost_per_day || stop.estStayCostPerDay)}</span>/day</span>
        <span>transport <span className="text-[#B8823A] font-bold">{formatCurrency(stop.est_transport_cost || stop.estTransportCost)}</span></span>
      </div>

      {/* Activities Row */}
      <div className="flex flex-wrap items-center gap-2">
        {(stop.activities || []).map((sa) => (
          <ActivityChip
            key={sa.id}
            stopActivity={sa}
            isRemoving={removingActivityId === sa.id}
            onRemove={onRemoveActivity}
          />
        ))}

        {isAddingActivity && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#2C5F7C]/10 border border-[#2C5F7C] text-[#2C5F7C] font-mono text-[11px] font-bold rounded-sm animate-pulse">
            <Loader2 className="h-3 w-3 animate-spin" />
            Adding activity…
          </span>
        )}

        <button
          type="button"
          onClick={() => setAddingActivity((v) => !v)}
          className="inline-flex items-center px-3 py-1.5 rounded-sm border border-dashed border-[#1F2B2E]/40 text-xs font-mono text-[#1F2B2E]/70 hover:border-[#2C5F7C] hover:text-[#2C5F7C] hover:bg-white transition cursor-pointer"
        >
          + Add activity
        </button>
      </div>

      {/* Scoped Activity Search Modal */}
      {addingActivity && (
        <ActivitySearchScoped
          cityId={stop.city_id || stop.cityId || stop.city?.id || stop.city?.name}
          onAdd={(activityId, activityObj) => {
            onAddActivity(activityId, activityObj);
            setAddingActivity(false);
          }}
          onClose={() => setAddingActivity(false)}
        />
      )}
    </StopTicketCard>
  );
}
