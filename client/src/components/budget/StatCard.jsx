import React from 'react';

export default function StatCard({ label, value, accent = 'text-[#1E232A]', icon: Icon = null, subtext = null }) {
  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition duration-300 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-sans font-extrabold uppercase tracking-wider text-gray-400">{label}</p>
        {Icon && (
          <div className="h-8 w-8 rounded-full bg-[#F5B800]/15 text-[#1E232A] flex items-center justify-center">
            <Icon className="h-4 w-4 text-[#F5B800]" />
          </div>
        )}
      </div>
      <p className={`text-3xl sm:text-4xl font-serif font-black tracking-tight ${accent}`}>{value}</p>
      {subtext && <p className="text-[11px] font-sans text-gray-500 font-medium">{subtext}</p>}
    </div>
  );
}
