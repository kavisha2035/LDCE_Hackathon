export default function DateRangePicker({ startDate, endDate, onChange, error }) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-caption text-ink/60">Start date</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onChange({ start: e.target.value, end: endDate })}
            className="px-3 py-2 rounded-sm border border-ink/25 bg-paper font-mono text-body-sm focus:outline-none focus:border-route-blue"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-caption text-ink/60">End date</span>
          <input
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => onChange({ start: startDate, end: e.target.value })}
            className="px-3 py-2 rounded-sm border border-ink/25 bg-paper font-mono text-body-sm focus:outline-none focus:border-route-blue"
          />
        </label>
      </div>
      {error && <p className="mt-2 text-body-sm text-stamp-red">{error}</p>}
    </div>
  );
}
