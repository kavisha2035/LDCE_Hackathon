import { formatCurrency, formatDateShort, formatDuration } from '../../lib/format';

function groupByDate(activities = []) {
  const groups = new Map();
  [...(activities || [])]
    .sort((a, b) => {
      const dateA = String(a.scheduled_date || a.scheduledDate || '');
      const dateB = String(b.scheduled_date || b.scheduledDate || '');
      const timeA = String(a.scheduled_time || a.scheduledTime || '');
      const timeB = String(b.scheduled_time || b.scheduledTime || '');
      return (dateA + timeA).localeCompare(dateB + timeB);
    })
    .forEach((sa) => {
      const key = sa.scheduled_date || sa.scheduledDate || 'Unscheduled';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(sa);
    });
  return [...groups.entries()];
}

/**
 * Read-only, day-grouped activity list for Screen 6
 */
export default function ActivityDayList({ activities = [] }) {
  const actList = activities || [];
  if (actList.length === 0) {
    return <p className="text-body-sm text-ink/45">No activities scheduled for this stop yet.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {groupByDate(actList).map(([date, dayActivities]) => (
        <div key={date}>
          <p className="font-mono text-caption text-route-blue uppercase tracking-wide mb-1">
            {date === 'Unscheduled' ? 'Scheduled Activities' : formatDateShort(date)}
          </p>
          <ul className="flex flex-col divide-y divide-ink/10 border-l-2 border-sea/40 pl-3">
            {dayActivities.map((sa) => {
              const actName = sa.activity?.name || sa.name || 'Activity';
              const actCost = sa.activity?.cost ?? sa.cost ?? 0;
              const actDuration = sa.activity?.duration_hours ?? sa.activity?.durationHours ?? sa.durationHours ?? sa.duration_hours ?? 2;
              const time = sa.scheduled_time || sa.scheduledTime || '10:00 AM';

              return (
                <li key={sa.id || Math.random()} className="flex items-center justify-between gap-3 py-1.5">
                  <div className="min-w-0 flex items-baseline gap-2">
                    <span className="font-mono text-caption text-ink/50 shrink-0">{time}</span>
                    <span className="text-body-sm text-ink truncate">{actName}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 font-mono text-caption text-ink/60">
                    <span className="text-ochre">{formatCurrency(actCost)}</span>
                    <span>{formatDuration(actDuration)}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
