import { apiFetch } from './apiClient';

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
  try {
    const data = await apiFetch('/trips');
    const list = data?.trips || [];
    return list.map(normalizeTrip);
  } catch (err) {
    console.error('fetchTrips error:', err);
    return [];
  }
}

// GET /api/trips/:id — Trip details
export async function fetchTrip(tripId) {
  try {
    const data = await apiFetch(`/trips/${tripId}`);
    return normalizeTrip(data);
  } catch (err) {
    console.error('fetchTrip error:', err);
    throw err;
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
    console.error('addStop error:', err);
    throw err;
  }
}

// PUT /api/stops/:id  (dates, cost estimates, order_index)
export async function updateStop(stopId, payload) {
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
    console.error('updateStop error:', err);
    throw err;
  }
}

// DELETE /api/stops/:id
export async function deleteStop(stopId) {
  try {
    return await apiFetch(`/stops/${stopId}`, { method: 'DELETE' });
  } catch (err) {
    console.error('deleteStop error:', err);
    throw err;
  }
}

// POST /api/stops/:id/activities  { activity_id, scheduled_date, scheduled_time, name, category, cost, notes }
export async function addStopActivity(stopId, payload) {
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
    console.error('addStopActivity error:', err);
    throw err;
  }
}

// DELETE /api/stop-activities/:id
export async function removeStopActivity(stopActivityId) {
  try {
    return await apiFetch(`/stop-activities/${stopActivityId}`, { method: 'DELETE' });
  } catch (err) {
    console.error('removeStopActivity error:', err);
    throw err;
  }
}
