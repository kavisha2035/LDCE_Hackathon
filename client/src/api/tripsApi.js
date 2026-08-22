import { apiFetch, mockDelay } from './apiClient';
import { TRIP, CITIES, ACTIVITIES } from './mockData';

const USE_MOCK = true;

let nextStopId = 100;
let nextStopActivityId = 100;

// GET /api/trips/:id
export async function fetchTrip(tripId) {
  if (USE_MOCK) {
    return mockDelay(JSON.parse(JSON.stringify(TRIP)));
  }
  return apiFetch(`/trips/${tripId}`);
}

// POST /api/trips/:id/stops  { city_id, start_date, end_date, est_stay_cost_per_day, est_transport_cost }
export async function addStop(tripId, payload) {
  if (USE_MOCK) {
    const city = CITIES.find((c) => c.id === payload.city_id);
    const stop = {
      id: `stop-${nextStopId++}`,
      trip_id: tripId,
      city_id: payload.city_id,
      start_date: payload.start_date,
      end_date: payload.end_date,
      order_index: TRIP.stops.length,
      est_stay_cost_per_day: payload.est_stay_cost_per_day ?? 0,
      est_transport_cost: payload.est_transport_cost ?? 0,
      city,
      activities: [],
    };
    TRIP.stops.push(stop);
    return mockDelay(stop);
  }
  return apiFetch(`/trips/${tripId}/stops`, { method: 'POST', body: JSON.stringify(payload) });
}

// PUT /api/stops/:id  (dates, cost estimates, order_index)
export async function updateStop(stopId, payload) {
  if (USE_MOCK) {
    const stop = TRIP.stops.find((s) => s.id === stopId);
    if (stop) Object.assign(stop, payload);
    return mockDelay(stop);
  }
  return apiFetch(`/stops/${stopId}`, { method: 'PUT', body: JSON.stringify(payload) });
}

// DELETE /api/stops/:id
export async function deleteStop(stopId) {
  if (USE_MOCK) {
    TRIP.stops = TRIP.stops.filter((s) => s.id !== stopId);
    TRIP.stops.forEach((s, i) => { s.order_index = i; });
    return mockDelay(null, 200);
  }
  return apiFetch(`/stops/${stopId}`, { method: 'DELETE' });
}

// POST /api/stops/:id/activities  { activity_id, scheduled_date, scheduled_time }
export async function addStopActivity(stopId, payload) {
  if (USE_MOCK) {
    const stop = TRIP.stops.find((s) => s.id === stopId);
    const activity = ACTIVITIES.find((a) => a.id === payload.activity_id);
    const stopActivity = {
      id: `sa-${nextStopActivityId++}`,
      trip_stop_id: stopId,
      activity_id: payload.activity_id,
      scheduled_date: payload.scheduled_date ?? stop?.start_date,
      scheduled_time: payload.scheduled_time ?? '09:00',
      notes: payload.notes ?? '',
      activity,
    };
    if (stop) stop.activities.push(stopActivity);
    return mockDelay(stopActivity);
  }
  return apiFetch(`/stops/${stopId}/activities`, { method: 'POST', body: JSON.stringify(payload) });
}

// DELETE /api/stop-activities/:id
export async function removeStopActivity(stopActivityId) {
  if (USE_MOCK) {
    TRIP.stops.forEach((s) => {
      s.activities = s.activities.filter((a) => a.id !== stopActivityId);
    });
    return mockDelay(null, 200);
  }
  return apiFetch(`/stop-activities/${stopActivityId}`, { method: 'DELETE' });
}
