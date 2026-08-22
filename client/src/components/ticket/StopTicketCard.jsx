import React from 'react';
import { formatDateRange } from '../../lib/format';
import { Calendar, MapPin } from 'lucide-react';

/**
 * Modern Wanderers StopTicketCard
 * Used across Itinerary Builder, Read-Only Itinerary View, and Public Shareable Pass
 */
export default function StopTicketCard({
  cityName,
  country,
  startDate,
  endDate,
  mode = 'edit',
  isNew = false,
  headerActions = null,
  footer = null,
  children,
  className = '',
}) {
  return (
    <div
      className={`relative flex flex-col md:flex-row bg-white border border-gray-200 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group
        ${isNew ? 'motion-safe:animate-ticket-in ring-2 ring-[#F5B800]' : ''} ${className}`}
    >
      {/* Left Obsidian Ticket Stub */}
      <div
        className="relative shrink-0 md:w-60 bg-[#1A1D23] text-white p-6 sm:p-8 flex flex-row md:flex-col
          justify-between md:justify-between gap-4
          border-b md:border-b-0 md:border-r border-dashed border-white/20"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-sans font-extrabold uppercase tracking-widest text-[#F5B800]">
            <MapPin className="h-3.5 w-3.5" />
            <span className="truncate">{country || 'DESTINATION'}</span>
          </div>
          <h3 className="font-serif font-black text-2xl sm:text-3xl text-white tracking-wide leading-tight group-hover:text-[#F5B800] transition duration-300">
            {cityName}
          </h3>
        </div>

        <div className="pt-2 sm:pt-4 border-t border-white/10 flex items-center gap-2 text-xs font-sans text-gray-300">
          <Calendar className="h-4 w-4 text-[#F5B800] shrink-0" />
          <span className="font-medium whitespace-nowrap">
            {formatDateRange(startDate, endDate)}
          </span>
        </div>
      </div>

      {/* Right Ticket Body */}
      <div className="flex-1 min-w-0 p-6 sm:p-8 flex flex-col justify-between gap-5 bg-white">
        <div className="w-full space-y-5">
          <div className="w-full flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">{children}</div>
            {headerActions && (
              <div className="shrink-0 flex items-center gap-2 pt-1">
                {headerActions}
              </div>
            )}
          </div>
          {footer && <div className="w-full">{footer}</div>}
        </div>
      </div>

      {mode === 'view' && (
        <span className="absolute top-4 right-4 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-sans uppercase tracking-widest font-extrabold rounded-full shadow-xs">
          CONFIRMED STOP
        </span>
      )}
    </div>
  );
}
