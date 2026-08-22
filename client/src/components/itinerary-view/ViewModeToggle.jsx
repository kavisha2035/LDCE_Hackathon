export default function ViewModeToggle({ mode, onChange }) {
  return (
    <div className="inline-flex border border-ink rounded-sm overflow-hidden">
      <button
        type="button"
        onClick={() => onChange('list')}
        className={`px-3 py-1.5 text-body-sm font-mono font-bold uppercase transition-colors ${
          mode === 'list' ? 'bg-route-blue text-paper' : 'text-ink/70 hover:bg-paper'
        }`}
      >
        List
      </button>
      <button
        type="button"
        disabled
        title="Calendar view is coming soon"
        className="px-3 py-1.5 text-body-sm font-mono font-bold uppercase text-ink/30 border-l border-ink cursor-not-allowed"
      >
        Calendar <span className="text-caption">(coming soon)</span>
      </button>
    </div>
  );
}
