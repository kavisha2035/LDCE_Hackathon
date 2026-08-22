import { formatCurrency, formatDateShort, formatDuration } from '../../lib/format';

function groupByDate(activities) {
  const groups = new Map();
  [...activities]
    .sort((a, b) => (a.scheduled_date + a.scheduled_time).localeCompare(b.scheduled_date + b.scheduled_time))
    .forEach((sa) => {
      const key = sa.scheduled_date;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(sa);
    });
  return [...groups.entries()];
}

/**
 * Read-only, day-grouped activity list for Screen 6 — deliberately not the
 * chip layout Screen 5 uses in edit mode, so read/edit read as visibly
 * different, not just disabled inputs.
 */
export default function ActivityDayList({ activities }) {
  if (activities.length === 0) {
    return <p className="text-body-sm text-ink/45">No activities scheduled for this stop yet.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {groupByDate(activities).map(([date, dayActivities]) => (
        <div key={date}>
          <p className="font-mono text-caption text-route-blue uppercase tracking-wide mb-1">
            {formatDateShort(date)}
          </p>
          <ul className="flex flex-col divide-y divide-ink/10 border-l-2 border-sea/40 pl-3">
            {dayActivities.map((sa) => (
              <li key={sa.id} className="flex items-center justify-between gap-3 py-1.5">
                <div className="min-w-0 flex items-baseline gap-2">
                  <span className="font-mono text-caption text-ink/50 shrink-0">{sa.scheduled_time}</span>
                  <span className="text-body-sm text-ink truncate">{sa.activity.name}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0 font-mono text-caption text-ink/60">
                  <span className="text-ochre">{formatCurrency(sa.activity.cost)}</span>
                  <span>{formatDuration(sa.activity.duration_hours)}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
