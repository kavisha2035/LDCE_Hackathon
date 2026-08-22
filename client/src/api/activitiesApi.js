import { apiFetch } from './apiClient';

// GET /api/cities/:id/activities?category=&cost=
export async function fetchCityActivities(cityId, { category = '', maxCost = '' } = {}) {
  const qs = new URLSearchParams({
    ...(category && { category }),
    ...(maxCost && { maxCost }),
  }).toString();

  try {
    const data = await apiFetch(`/cities/${cityId}/activities?${qs}`);
    const list = Array.isArray(data) ? data : (data?.activities || []);
    return list.map(a => ({
      ...a,
      city_id: a.city_id ?? a.cityId ?? cityId,
      duration_hours: a.duration_hours ?? a.durationHours ?? 1.5,
      image_url: a.image_url ?? a.imageUrl,
    }));
  } catch (err) {
    console.error('fetchCityActivities error:', err);
    return [];
  }
}
