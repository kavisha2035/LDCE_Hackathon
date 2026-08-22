import React from 'react';
import StopTicketCard from '../ticket/StopTicketCard';
import ActivityDayList from './ActivityDayList';
import { formatCurrency } from '../../lib/format';
import { BedDouble, Plane } from 'lucide-react';

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
      <div className="space-y-4 font-sans">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-gray-700 font-semibold border border-gray-200">
            <BedDouble className="h-3.5 w-3.5 text-gray-500" />
            <span>Stay: <strong className="text-[#B8823A] font-bold">{formatCurrency(stop.est_stay_cost_per_day || stop.estStayCostPerDay || 0)}</strong>/day</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-gray-700 font-semibold border border-gray-200">
            <Plane className="h-3.5 w-3.5 text-gray-500" />
            <span>Transit: <strong className="text-[#B8823A] font-bold">{formatCurrency(stop.est_transport_cost || stop.estTransportCost || 0)}</strong></span>
          </div>
        </div>

        <ActivityDayList activities={activities} />
      </div>
    </StopTicketCard>
  );
}
