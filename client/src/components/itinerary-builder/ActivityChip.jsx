import { formatCurrency, formatDuration } from '../../lib/format';

export default function ActivityChip({ stopActivity, onRemove }) {
  const { activity } = stopActivity;
  return (
    <span className="inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-sm border border-ink/25 bg-ink/[0.03] text-body-sm">
      <span className="font-body text-ink">{activity.name}</span>
      <span className="font-mono text-caption text-ochre">{formatCurrency(activity.cost)}</span>
      <span className="font-mono text-caption text-ink/50">{formatDuration(activity.duration_hours)}</span>
      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(stopActivity.id)}
          aria-label={`Remove ${activity.name}`}
          className="text-ink/40 hover:text-stamp-red transition-colors leading-none text-body"
        >
          ×
        </button>
      )}
    </span>
  );
}
