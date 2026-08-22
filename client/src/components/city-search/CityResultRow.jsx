import CostDots from './CostDots';

export default function CityResultRow({ city, onAdd, onSave, saving = false }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 px-4 border-b border-ink/15 last:border-b-0 hover:bg-paper transition-colors">
      <div className="min-w-0 flex-1">
        <p className="font-display font-bold text-lg text-ink truncate leading-none">{city.name}</p>
        <p className="text-xs font-mono text-ink/60 truncate mt-1">{city.country?.toUpperCase()} &middot; {city.region?.toUpperCase() || 'UNSPECIFIED'}</p>
      </div>

      <div className="shrink-0" title={`cost index ${city.cost_index}/5`}>
        <CostDots costIndex={city.cost_index} />
      </div>

      <div className="shrink-0 w-20 text-right">
        <p className="font-mono text-sm text-ink font-bold">{city.popularity}</p>
        <p className="text-[10px] font-mono text-ink/45 uppercase tracking-wide">popularity</p>
      </div>

      <div className="shrink-0 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onSave?.(city)}
          disabled={saving}
          className="px-3 py-1.5 border border-ink text-xs font-mono font-bold uppercase text-ink hover:bg-ink hover:text-paper transition disabled:opacity-50"
        >
          Save
        </button>
        {onAdd && (
          <button
            type="button"
            onClick={() => onAdd(city)}
            className="px-3 py-1.5 bg-route-blue border border-ink text-paper text-xs font-mono font-bold uppercase hover:bg-ink transition shadow-[2px_2px_0px_0px_#1F2B2E]"
          >
            Add to Trip
          </button>
        )}
      </div>
    </div>
  );
}
