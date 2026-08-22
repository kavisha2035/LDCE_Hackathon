import { apiFetch, mockDelay } from './apiClient';
import { TRIP, CITIES, ACTIVITIES } from './mockData';

const USE_MOCK = false;

let nextStopId = 100;
let nextStopActivityId = 100;

function normalizeTrip(tripData) {
  if (!tripData) return null;
  const rawTrip = tripData.trip || tripData;
  const rawStops = rawTrip.stops || [];

  const stops = rawStops.map(s => {
    const rawActs = s.activities || s.tripActivities || [];
    const activities = rawActs.map(ta => {
      const actObj = ta.activity || {};
      return {
        id: ta.id,
        trip_stop_id: ta.trip_stop_id ?? ta.stopId ?? s.id,
        activity_id: ta.activity_id ?? ta.activityId ?? actObj.id,
        scheduled_date: ta.scheduled_date ?? (ta.scheduledDate ? new Date(ta.scheduledDate).toISOString().split('T')[0] : s.startDate ? new Date(s.startDate).toISOString().split('T')[0] : '2026-10-12'),
        scheduled_time: ta.scheduled_time ?? ta.scheduledTime ?? '10:00',
        notes: ta.notes ?? '',
        activity: {
          id: actObj.id || ta.activityId || ta.id,
          name: actObj.name || ta.name || 'Activity',
          category: actObj.category || ta.category || 'sightseeing',
          cost: actObj.cost ?? ta.cost ?? 0,
          duration_hours: actObj.duration_hours ?? actObj.durationHours ?? ta.durationHours ?? ta.duration_hours ?? 2,
        },
      };
    });

    return {
      id: s.id,
      trip_id: s.trip_id ?? s.tripId ?? rawTrip.id,
      city_id: s.city_id ?? s.cityId,
      start_date: s.start_date ?? (s.startDate ? new Date(s.startDate).toISOString().split('T')[0] : '2026-10-12'),
      end_date: s.end_date ?? (s.endDate ? new Date(s.endDate).toISOString().split('T')[0] : '2026-10-16'),
      order_index: s.order_index ?? s.orderIndex ?? 0,
      est_stay_cost_per_day: s.est_stay_cost_per_day ?? s.estStayCostPerDay ?? 0,
      est_transport_cost: s.est_transport_cost ?? s.estTransportCost ?? 0,
      city: s.city || {
        id: s.cityId || 'city',
        name: s.cityName || 'City',
        country: s.country || '',
      },
      activities,
    };
  });

  return {
    ...rawTrip,
    id: rawTrip.id,
    name: rawTrip.name,
    description: rawTrip.description,
    coverPhoto: rawTrip.coverPhoto || rawTrip.cover_photo_url,
    isPublic: rawTrip.isPublic ?? rawTrip.is_public ?? false,
    shareSlug: rawTrip.shareSlug ?? rawTrip.share_slug,
    start_date: rawTrip.start_date ?? (rawTrip.startDate ? new Date(rawTrip.startDate).toISOString().split('T')[0] : '2026-10-12'),
    end_date: rawTrip.end_date ?? (rawTrip.endDate ? new Date(rawTrip.endDate).toISOString().split('T')[0] : '2026-10-21'),
    stops,
  };
}

// GET /api/trips — List trips (Screen 4)
export async function fetchTrips() {
  if (USE_MOCK) {
    return mockDelay([normalizeTrip(TRIP)]);
  }
  try {
    const data = await apiFetch('/trips');
    const list = data?.trips || [];
    return list.map(normalizeTrip);
  } catch (err) {
    console.error('fetchTrips error, falling back:', err);
    return [normalizeTrip(TRIP)];
  }
}

// GET /api/trips/:id — Trip details
export async function fetchTrip(tripId) {
  if (USE_MOCK) {
    return mockDelay(JSON.parse(JSON.stringify(TRIP)));
  }
  try {
    const data = await apiFetch(`/trips/${tripId}`);
    return normalizeTrip(data);
  } catch (err) {
    console.error('fetchTrip error, falling back to mock:', err);
    return JSON.parse(JSON.stringify(TRIP));
  }
}

// POST /api/trips — Create trip (Screen 3)
export async function createTrip(payload) {
  try {
    const data = await apiFetch('/trips', {
      method: 'POST',
      body: JSON.stringify({
        name: payload.name,
        description: payload.description,
        startDate: payload.startDate || payload.start_date,
        endDate: payload.endDate || payload.end_date,
        coverPhoto: payload.coverPhoto || payload.cover_photo_url,
        initialCityId: payload.initialCityId,
        estStayCostPerDay: payload.estStayCostPerDay,
        estTransportCost: payload.estTransportCost,
      }),
    });
    return normalizeTrip(data?.trip || data);
  } catch (err) {
    console.error('createTrip error:', err);
    throw err;
  }
}

// PUT /api/trips/:id — Update trip
export async function updateTrip(tripId, payload) {
  try {
    const data = await apiFetch(`/trips/${tripId}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: payload.name,
        description: payload.description,
        startDate: payload.startDate || payload.start_date,
        endDate: payload.endDate || payload.end_date,
        coverPhoto: payload.coverPhoto,
        isPublic: payload.isPublic,
      }),
    });
    return normalizeTrip(data?.trip || data);
  } catch (err) {
    console.error('updateTrip error:', err);
    throw err;
  }
}

// DELETE /api/trips/:id — Delete trip
export async function deleteTrip(tripId) {
  try {
    return await apiFetch(`/trips/${tripId}`, { method: 'DELETE' });
  } catch (err) {
    console.error('deleteTrip error:', err);
    throw err;
  }
}

// PATCH /api/trips/:id/share — Share trip toggle
export async function shareTrip(tripId, isPublic = true) {
  try {
    return await apiFetch(`/trips/${tripId}/share`, {
      method: 'PATCH',
      body: JSON.stringify({ isPublic }),
    });
  } catch (err) {
    console.error('shareTrip error:', err);
    throw err;
  }
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
  try {
    const data = await apiFetch(`/trips/${tripId}/stops`, {
      method: 'POST',
      body: JSON.stringify({
        cityId: payload.city_id,
        startDate: payload.start_date,
        endDate: payload.end_date,
        estStayCostPerDay: payload.est_stay_cost_per_day,
        estTransportCost: payload.est_transport_cost,
        orderIndex: payload.order_index ?? 0,
      }),
    });
    return data?.stop || data;
  } catch (err) {
    console.error('addStop error, falling back:', err);
    const city = CITIES.find((c) => c.id === payload.city_id) || { id: payload.city_id, name: 'City', country: '' };
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
    return stop;
  }
}

// PUT /api/stops/:id  (dates, cost estimates, order_index)
export async function updateStop(stopId, payload) {
  if (USE_MOCK) {
    const stop = TRIP.stops.find((s) => s.id === stopId);
    if (stop) Object.assign(stop, payload);
    return mockDelay(stop);
  }
  try {
    const data = await apiFetch(`/stops/${stopId}`, {
      method: 'PUT',
      body: JSON.stringify({
        startDate: payload.start_date,
        endDate: payload.end_date,
        estStayCostPerDay: payload.est_stay_cost_per_day,
        estTransportCost: payload.est_transport_cost,
        orderIndex: payload.order_index,
      }),
    });
    return data?.stop || data;
  } catch (err) {
    console.error('updateStop error, falling back:', err);
    const stop = TRIP.stops.find((s) => s.id === stopId);
    if (stop) Object.assign(stop, payload);
    return stop || payload;
  }
}

// DELETE /api/stops/:id
export async function deleteStop(stopId) {
  if (USE_MOCK) {
    TRIP.stops = TRIP.stops.filter((s) => s.id !== stopId);
    TRIP.stops.forEach((s, i) => { s.order_index = i; });
    return mockDelay(null, 200);
  }
  try {
    return await apiFetch(`/stops/${stopId}`, { method: 'DELETE' });
  } catch (err) {
    console.error('deleteStop error, falling back:', err);
    TRIP.stops = TRIP.stops.filter((s) => s.id !== stopId);
    return { success: true };
  }
}

// POST /api/stops/:id/activities  { activity_id, scheduled_date, scheduled_time, name, category, cost, notes }
export async function addStopActivity(stopId, payload) {
  if (USE_MOCK) {
    const actId = payload.activity_id || payload.activityId;
    const stop = TRIP.stops.find((s) => s.id === stopId);
    const foundAct = ACTIVITIES.find((a) => a.id === actId);
    const activity = foundAct || {
      id: actId || `act-custom-${nextStopActivityId}`,
      name: payload.name || 'Activity',
      category: payload.category || 'sightseeing',
      cost: payload.cost ?? 2500,
      duration_hours: payload.duration_hours ?? 2,
    };
    const stopActivity = {
      id: `sa-${nextStopActivityId++}`,
      trip_stop_id: stopId,
      activity_id: activity.id,
      scheduled_date: payload.scheduled_date ?? payload.scheduledDate ?? stop?.start_date,
      scheduled_time: payload.scheduled_time ?? payload.scheduledTime ?? '10:00',
      notes: payload.notes ?? '',
      activity,
    };
    if (stop) {
      if (!stop.activities) stop.activities = [];
      stop.activities.push(stopActivity);
    }
    return mockDelay(stopActivity);
  }
  try {
    return await apiFetch(`/stops/${stopId}/activities`, {
      method: 'POST',
      body: JSON.stringify({
        activityId: payload.activity_id || payload.activityId,
        name: payload.name,
        category: payload.category,
        cost: payload.cost,
        scheduledDate: payload.scheduled_date || payload.scheduledDate,
        scheduledTime: payload.scheduled_time || payload.scheduledTime,
        notes: payload.notes,
      }),
    });
  } catch (err) {
    console.error('addStopActivity error, falling back:', err);
    const stop = TRIP.stops.find((s) => s.id === stopId);
    const activity = ACTIVITIES.find((a) => a.id === payload.activity_id || a.id === payload.activityId) || {
      id: payload.activity_id || `act-${Date.now()}`,
      name: payload.name || 'Activity',
      cost: payload.cost || 0,
      category: payload.category || 'sightseeing'
    };
    const stopActivity = {
      id: `sa-${nextStopActivityId++}`,
      trip_stop_id: stopId,
      activity_id: activity.id,
      scheduled_date: payload.scheduled_date ?? stop?.start_date,
      scheduled_time: payload.scheduled_time ?? '10:00',
      notes: payload.notes ?? '',
      activity,
    };
    if (stop) {
      if (!stop.activities) stop.activities = [];
      stop.activities.push(stopActivity);
    }
    return stopActivity;
  }
}

// DELETE /api/stop-activities/:id
export async function removeStopActivity(stopActivityId) {
  if (USE_MOCK) {
    TRIP.stops.forEach((s) => {
      s.activities = s.activities.filter((a) => a.id !== stopActivityId);
    });
    return mockDelay(null, 200);
  }
  try {
    return await apiFetch(`/stop-activities/${stopActivityId}`, { method: 'DELETE' });
  } catch (err) {
    console.error('removeStopActivity error, falling back:', err);
    TRIP.stops.forEach((s) => {
      s.activities = s.activities.filter((a) => a.id !== stopActivityId);
    });
    return { success: true };
  }
}
