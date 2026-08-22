import { apiFetch } from './apiClient';

// GET /api/trips/:id/budget -> { trip_total, avg_per_day, breakdown_by_category, per_stop }
export async function fetchTripBudget(tripId) {
  try {
    const data = await apiFetch(`/trips/${tripId}/budget`);
    const b = data?.budget || data;
    return {
      trip_id: b.tripId ?? b.trip_id ?? tripId,
      trip_total: b.tripTotal ?? b.trip_total ?? 0,
      avg_per_day: b.avgPerDay ?? b.avg_per_day ?? 0,
      breakdown_by_category: b.breakdownByCategory ?? b.breakdown_by_category ?? {
        stay: 0,
        transport: 0,
        activities: 0,
      },
      per_stop: (b.stops || b.per_stop || []).map(s => ({
        stop_id: s.stopId ?? s.stop_id,
        city_name: s.cityName ?? s.city_name ?? s.city?.name ?? 'City',
        country: s.country ?? s.city?.country ?? '',
        nights: s.nights ?? 1,
        stay_cost: s.stayCost ?? s.stay_cost ?? 0,
        transport_cost: s.transportCost ?? s.transport_cost ?? 0,
        activities_cost: s.activitiesCost ?? s.activities_cost ?? 0,
        stop_total: s.stopTotal ?? s.stop_total ?? 0,
      })),
    };
  } catch (err) {
    console.error('fetchTripBudget error:', err);
    throw err;
  }
}
