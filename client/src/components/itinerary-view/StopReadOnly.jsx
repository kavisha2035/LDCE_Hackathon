import StopTicketCard from '../ticket/StopTicketCard';
import ActivityDayList from './ActivityDayList';
import { formatCurrency } from '../../lib/format';

export default function StopReadOnly({ stop }) {
  return (
    <StopTicketCard
      cityName={stop.city.name}
      country={stop.city.country}
      startDate={stop.start_date}
      endDate={stop.end_date}
      mode="view"
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-3 font-mono text-caption text-ink/60">
        <span>stay <span className="text-ochre">{formatCurrency(stop.est_stay_cost_per_day)}</span>/day</span>
        <span>transport <span className="text-ochre">{formatCurrency(stop.est_transport_cost)}</span></span>
      </div>
      <ActivityDayList activities={stop.activities} />
    </StopTicketCard>
  );
}
