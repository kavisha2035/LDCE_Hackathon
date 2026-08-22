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
      className={`ticket-stub flex flex-col md:flex-row overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 group ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      {/* Left Ticket Stub */}
      <div className="bg-[#1F2B2E] text-[#F6F3EC] p-5 md:w-56 shrink-0 flex flex-col justify-between relative border-b md:border-b-0 md:border-r-2 border-dashed border-[#F6F3EC]/40">
        <div>
          <div className="flex items-center justify-between text-xs font-mono text-[#7FA69C] mb-1 uppercase tracking-wider">
            <span>{country || 'STOP'}</span>
            {badge && (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#B8823A] text-white font-bold">
                {badge}
              </span>
            )}
          </div>
          <h3 className="text-2xl font-bold font-display tracking-tight text-[#F6F3EC] leading-none mb-2 group-hover:text-[#7FA69C] transition">
            {city}
          </h3>
          {dates && (
            <div className="text-xs font-mono text-[#F6F3EC]/80 mt-1">
              🗓 {dates}
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-[#F6F3EC]/20 flex items-center justify-between font-mono text-xs">
          <span className="text-[#B8823A] font-bold">
            {cost !== undefined ? `₹${cost}` : ''}
          </span>
          {activitiesCount !== undefined && (
            <span className="text-[#F6F3EC]/70">
              {activitiesCount} {activitiesCount === 1 ? 'activity' : 'activities'}
            </span>
          )}
        </div>

        {/* Decorative Notch Circles */}
        <div className="hidden md:block absolute -top-2.5 -right-2.5 w-5 h-5 bg-[#F6F3EC] rounded-full border border-[#1F2B2E]"></div>
        <div className="hidden md:block absolute -bottom-2.5 -right-2.5 w-5 h-5 bg-[#F6F3EC] rounded-full border border-[#1F2B2E]"></div>
      </div>

      {/* Right Ticket Body */}
      <div className="bg-white p-5 flex-1 flex flex-col justify-between">
        <div>
          {children}
        </div>

        {actionButton && (
          <div className="mt-4 flex justify-end">
            {actionButton}
          </div>
        )}
      </div>
    </div>
  );
}
