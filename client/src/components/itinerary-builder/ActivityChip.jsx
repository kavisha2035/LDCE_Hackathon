import React from 'react';
import { formatCurrency, formatDuration } from '../../lib/format';
import { Loader2 } from 'lucide-react';

export default function ActivityChip({ stopActivity, onRemove, isRemoving = false }) {
  const activity = stopActivity?.activity || {
    name: 'Scheduled Activity',
    cost: stopActivity?.cost || 0,
    duration_hours: 2,
  };

  const cost = activity.cost ?? stopActivity?.cost ?? 0;
  const duration = activity.duration_hours ?? activity.durationHours ?? 2;

  return (
    <span className={`inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-sm border border-[#1F2B2E]/25 bg-[#1F2B2E]/[0.03] text-xs font-mono transition shadow-xs ${
      isRemoving ? 'opacity-50 pointer-events-none' : ''
    }`}>
      <span className="font-body text-[#1F2B2E] text-xs font-bold">{activity.name}</span>
      <span className="font-mono text-caption text-[#B8823A] font-bold">{formatCurrency(cost)}</span>
      <span className="font-mono text-caption text-[#1F2B2E]/50">{formatDuration(duration)}</span>
      {onRemove && (
        <button
          type="button"
          disabled={isRemoving}
          onClick={() => onRemove(stopActivity.id)}
          aria-label={`Remove ${activity.name}`}
          className="text-[#1F2B2E]/40 hover:text-[#B84A3E] transition leading-none text-sm font-bold cursor-pointer ml-1"
        >
          {isRemoving ? <Loader2 className="h-3 w-3 animate-spin text-[#B84A3E]" /> : '×'}
        </button>
      )}
    </span>
  );
}
