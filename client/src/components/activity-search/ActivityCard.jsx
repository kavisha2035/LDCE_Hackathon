import { useState } from 'react';
import { formatCurrency, formatDuration } from '../../lib/format';
import { categoryColor } from './categoryColor';

export default function ActivityCard({ activity, onAdd }) {
  const [expanded, setExpanded] = useState(false);
  const color = categoryColor(activity.category);

  return (
    <div className="bg-white border border-ink shadow-[3px_3px_0px_0px_#1F2B2E] flex flex-col overflow-hidden">
      <div className="h-32 bg-ink/10 overflow-hidden">
        {activity.image_url && (
          <img src={activity.image_url} alt={activity.name} className="w-full h-full object-cover" loading="lazy" />
        )}
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-bold text-lg text-ink leading-tight">{activity.name}</h3>
          <span className={`shrink-0 px-2 py-0.5 border ${color.border} ${color.text} text-[10px] font-mono font-bold uppercase`}>
            {activity.category}
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs text-ink/70">
          <span className="text-ochre font-bold">{formatCurrency(activity.cost)}</span>
          <span>{formatDuration(activity.duration_hours)}</span>
        </div>

        {activity.description && (
          <p className={`text-xs font-body text-ink/70 leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
            {activity.description}
          </p>
        )}
        {activity.description && activity.description.length > 80 && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-[11px] font-mono text-route-blue self-start hover:underline"
          >
            {expanded ? 'Show less' : 'Quick view'}
          </button>
        )}

        {onAdd && (
          <button
            type="button"
            onClick={() => onAdd(activity)}
            className="mt-auto pt-2 w-full py-2 bg-route-blue border border-ink text-paper text-xs font-mono font-bold uppercase hover:bg-ink transition"
          >
            Add activity
          </button>
        )}
      </div>
    </div>
  );
}
