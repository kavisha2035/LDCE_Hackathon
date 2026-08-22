import React, { useState } from 'react';
import StopTicketCard from '../ticket/StopTicketCard';
import ActivityChip from './ActivityChip';
import ActivitySearchScoped from './ActivitySearchScoped';
import { formatCurrency } from '../../lib/format';
import { Loader2, ArrowUp, ArrowDown, Trash2, Plus, Sparkles, BedDouble, Plane } from 'lucide-react';

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
      cityName={stop.city?.name || stop.cityName || 'Destination'}
      country={stop.city?.country || stop.country || ''}
      startDate={stop.start_date || stop.startDate}
      endDate={stop.end_date || stop.endDate}
      mode="edit"
      isNew={isNew}
      headerActions={
        <div className="flex items-center gap-1.5 bg-gray-50 p-1.5 rounded-full border border-gray-200">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={isFirst || isUpdating || isDeleting}
            aria-label="Move stop earlier"
            title="Move Earlier"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white hover:bg-[#1E232A] hover:text-[#F5B800] text-gray-700 disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-gray-700 transition cursor-pointer shadow-xs"
          >
            {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowUp className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={isLast || isUpdating || isDeleting}
            aria-label="Move stop later"
            title="Move Later"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white hover:bg-[#1E232A] hover:text-[#F5B800] text-gray-700 disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-gray-700 transition cursor-pointer shadow-xs"
          >
            {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowDown className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            onClick={onRemoveStop}
            disabled={isDeleting}
            aria-label={`Remove ${stop.city?.name || 'stop'}`}
            title="Remove Stop"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white hover:bg-red-600 hover:text-white text-red-500 transition cursor-pointer disabled:opacity-40 shadow-xs"
          >
            {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin text-red-500" /> : <Trash2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      }
      footer={
        addingActivity ? (
          <div className="w-full pt-1">
            <ActivitySearchScoped
              cityId={stop.city_id || stop.cityId || stop.city?.id || stop.city?.name}
              onAdd={(activityId, activityObj) => {
                onAddActivity(activityId, activityObj);
                setAddingActivity(false);
              }}
              onClose={() => setAddingActivity(false)}
            />
          </div>
        ) : null
      }
    >
      <div className="space-y-4 font-sans">
        {/* Cost Estimates & Segment Info */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-gray-700 font-semibold border border-gray-200">
            <BedDouble className="h-3.5 w-3.5 text-gray-500" />
            <span>Stay: <strong className="text-[#B8823A] font-bold">{formatCurrency(stop.est_stay_cost_per_day || stop.estStayCostPerDay || 0)}</strong>/day</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-gray-700 font-semibold border border-gray-200">
            <Plane className="h-3.5 w-3.5 text-gray-500" />
            <span>Transit: <strong className="text-[#B8823A] font-bold">{formatCurrency(stop.est_transport_cost || stop.estTransportCost || 0)}</strong></span>
          </div>
        </div>

        {/* Activities List / Row */}
        <div className="space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 block">
            SCHEDULED EXPERIENCES ({stop.activities?.length || 0})
          </span>

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
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F5B800]/15 border border-[#F5B800] text-[#1E232A] font-sans text-xs font-bold rounded-full animate-pulse">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#F5B800]" />
                Adding experience…
              </span>
            )}

            <button
              type="button"
              onClick={() => setAddingActivity((v) => !v)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-dashed border-gray-300 hover:border-[#F5B800] bg-gray-50 hover:bg-[#F5B800] text-[#1E232A] text-xs font-bold transition cursor-pointer shadow-xs"
            >
              <Plus className="h-3.5 w-3.5 text-[#F5B800] group-hover:text-[#1E232A]" />
              {addingActivity ? 'Close Activity Search' : 'Add Activity'}
            </button>
          </div>
        </div>
      </div>
    </StopTicketCard>
  );
}
