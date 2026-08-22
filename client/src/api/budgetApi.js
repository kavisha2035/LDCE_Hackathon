import { apiFetch, mockDelay } from './apiClient';
import { TRIP_BUDGET } from './mockData';

const USE_MOCK = true;

// GET /api/trips/:id/budget -> { trip_total, avg_per_day, breakdown_by_category, per_stop }
// Numbers only, computed server-side — this screen never does budget math client-side.
export async function fetchTripBudget(tripId) {
  if (USE_MOCK) {
    return mockDelay({ ...TRIP_BUDGET, trip_id: tripId });
  }
  return apiFetch(`/trips/${tripId}/budget`);
}
