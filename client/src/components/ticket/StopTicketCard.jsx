import { formatDateRange } from '../../lib/format';

/**
 * Shared ticket-stub shell for trip stops (Screen 5 edit mode, Screen 6
 * read-only mode). Named StopTicketCard to avoid colliding with the
 * existing components/TicketCard.jsx used by the Overview demo section —
 * two different prop APIs, two different jobs.
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
      className={`relative flex flex-col sm:flex-row bg-white border border-ink shadow-[3px_3px_0px_0px_#1F2B2E]
        ${isNew ? 'motion-safe:animate-ticket-in' : ''} ${className}`}
    >
      {/* Left stub */}
      <div
        className="relative shrink-0 sm:w-48 bg-route-blue text-paper px-5 py-4 flex flex-row sm:flex-col
          justify-between sm:justify-center gap-1
          border-b sm:border-b-0 sm:border-r-2 border-dashed border-paper/40
          before:content-[''] before:hidden sm:before:block before:absolute before:-right-1.5 before:top-0
          before:-translate-y-1/2 before:w-3 before:h-3 before:rounded-full before:bg-paper
          before:border before:border-ink/20 before:z-10
          after:content-[''] after:hidden sm:after:block after:absolute after:-right-1.5 after:bottom-0
          after:translate-y-1/2 after:w-3 after:h-3 after:rounded-full after:bg-paper
          after:border after:border-ink/20 after:z-10"
      >
        <div>
          <p className="font-display font-bold text-xl leading-tight truncate">{cityName}</p>
          {country && <p className="text-[10px] font-mono uppercase tracking-wide text-paper/75 truncate">{country}</p>}
        </div>
        <p className="font-mono text-xs text-paper/90 whitespace-nowrap">
          {formatDateRange(startDate, endDate)}
        </p>
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0 px-5 py-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">{children}</div>
          {headerActions && <div className="shrink-0 flex items-center gap-1">{headerActions}</div>}
        </div>
        {footer}
      </div>

      {mode === 'view' && (
        <span className="absolute top-2 right-2 text-[10px] font-mono text-sea uppercase tracking-wide font-bold">
          confirmed
        </span>
      )}
    </div>
  );
}
