import React from 'react';
import { formatCurrency, formatDuration } from '../../lib/format';
import { Loader2, X, Clock, Tag } from 'lucide-react';

export default function ActivityChip({ stopActivity, onRemove, isRemoving = false }) {
  const activity = stopActivity?.activity || {
    name: 'Scheduled Activity',
    cost: stopActivity?.cost || 0,
    duration_hours: 2,
  };

  const cost = activity.cost ?? stopActivity?.cost ?? 0;
  const duration = activity.duration_hours ?? activity.durationHours ?? 2;

  return (
    <span
      className={`inline-flex items-center gap-2.5 pl-3.5 pr-2.5 py-1.5 rounded-full border border-gray-200 bg-gray-50 hover:bg-white hover:border-[#F5B800] text-xs font-sans font-medium text-[#1E232A] transition shadow-xs group ${
        isRemoving ? 'opacity-50 pointer-events-none' : ''
      }`}
    >
      <span className="font-bold text-[#1E232A] text-xs truncate max-w-[180px] sm:max-w-[240px]">
        {activity.name}
      </span>

      {cost > 0 && (
        <span className="inline-flex items-center gap-1 font-sans text-[11px] font-bold text-[#B8823A] bg-[#F5B800]/15 px-2 py-0.5 rounded-full">
          {formatCurrency(cost)}
        </span>
      )}

      <span className="text-gray-400 text-[10px] font-sans font-semibold">
        {formatDuration(duration)}
      </span>

      {onRemove && (
        <button
          type="button"
          disabled={isRemoving}
          onClick={() => onRemove(stopActivity.id)}
          aria-label={`Remove ${activity.name}`}
          className="p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
        >
          {isRemoving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-red-500" />
          ) : (
            <X className="h-3.5 w-3.5" />
          )}
        </button>
      )}
    </span>
  );
}
