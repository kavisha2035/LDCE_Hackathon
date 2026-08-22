import React from 'react';

export default function TicketCard({ 
  city, 
  country, 
  dates, 
  cost, 
  activitiesCount, 
  badge, 
  children,
  actionButton,
  onClick 
}) {
  return (
    <div 
      onClick={onClick}
      className={`flex flex-col md:flex-row min-h-[420px] sm:min-h-[480px] h-full overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl hover:shadow-2xl transition-all duration-300 group ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      {/* Left Ticket Stub */}
      <div className="bg-[#1A1D23] text-white p-6 sm:p-8 md:p-9 md:w-72 shrink-0 flex flex-col justify-between relative border-b md:border-b-0 md:border-r border-dashed border-white/20">
        <div>
          <div className="flex items-center justify-between text-xs font-bold font-sans text-[#F5B800] mb-4 uppercase tracking-widest">
            <span className="tracking-widest truncate max-w-[140px]">{country || 'STOP'}</span>
            {badge && (
              <span className="px-3 py-1 rounded-full text-[11px] bg-[#F5B800] text-[#1E232A] font-extrabold shadow">
                {badge}
              </span>
            )}
          </div>
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-black font-serif tracking-wide text-white leading-tight mb-4 break-words group-hover:text-[#F5B800] transition duration-300">
            {city}
          </h3>
          {dates && (
            <div className="text-xs sm:text-sm font-sans font-semibold text-gray-300 mt-2 bg-white/5 p-3 rounded-2xl border border-white/10 flex items-center gap-2">
              <span>🗓</span>
              <span className="truncate">{dates}</span>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between font-sans">
          <span className="text-[#F5B800] text-xl sm:text-2xl font-black">
            {cost !== undefined ? `₹${cost.toLocaleString('en-IN')}` : ''}
          </span>
          {activitiesCount !== undefined && (
            <span className="text-gray-300 text-[11px] font-extrabold uppercase bg-white/10 px-3 py-1 rounded-full">
              {activitiesCount} {activitiesCount === 1 ? 'activity' : 'activities'}
            </span>
          )}
        </div>
      </div>

      {/* Right Ticket Body */}
      <div className="bg-white p-6 sm:p-8 md:p-9 flex-1 flex flex-col justify-between space-y-6">
        <div className="space-y-4">
          {children}
        </div>

        {actionButton && (
          <div className="pt-4 border-t border-gray-100 flex justify-end">
            {actionButton}
          </div>
        )}
      </div>
    </div>
  );
}
