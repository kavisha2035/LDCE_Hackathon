import StopTicketCard from '../ticket/StopTicketCard';
import ActivityDayList from './ActivityDayList';
import { formatCurrency } from '../../lib/format';

export default function StopReadOnly({ stop }) {
  if (!stop) return null;

  const cityName = stop.city?.name || stop.cityName || 'Destination';
  const country = stop.city?.country || stop.country || '';
  const startDate = stop.start_date || stop.startDate;
  const endDate = stop.end_date || stop.endDate;
  const activities = stop.activities || stop.tripActivities || [];

  return (
    <StopTicketCard
      cityName={cityName}
      country={country}
      startDate={startDate}
      endDate={endDate}
      mode="view"
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-3 font-mono text-caption text-ink/60">
        <span>stay <span className="text-ochre">{formatCurrency(stop.est_stay_cost_per_day || stop.estStayCostPerDay || 0)}</span>/day</span>
        <span>transport <span className="text-ochre">{formatCurrency(stop.est_transport_cost || stop.estTransportCost || 0)}</span></span>
      </div>
      <ActivityDayList activities={activities} />
    </StopTicketCard>
  );
}
