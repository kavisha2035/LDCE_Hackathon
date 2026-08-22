import React from 'react';

export default function CostDots({ costIndex }) {
  const filled = Math.max(0, Math.min(5, Number(costIndex) || 0));
  return (
    <div className="inline-flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200" title={`Cost index ${filled} of 5`}>
      <span className="text-[10px] font-sans font-bold text-gray-500 mr-1 uppercase tracking-wider">COST</span>
      <span className="inline-flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i < filled ? 'bg-[#F5B800] shadow-xs' : 'bg-gray-300'
            }`}
          />
        ))}
      </span>
    </div>
  );
}
