export default function CostDots({ costIndex }) {
  const filled = Math.max(0, Math.min(5, Number(costIndex) || 0));
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`cost index ${filled} of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${i < filled ? 'bg-ochre' : 'bg-ink/15'}`}
        />
      ))}
    </span>
  );
}
