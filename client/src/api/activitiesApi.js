import { apiFetch, mockDelay } from './apiClient';
import { ACTIVITIES } from './mockData';

const USE_MOCK = false;

// GET /api/cities/:id/activities?category=&cost=
export async function fetchCityActivities(cityId, { category = '', maxCost = '' } = {}) {
  if (USE_MOCK) {
    const results = ACTIVITIES.filter((a) => {
      const matchesCity = !cityId || a.city_id === cityId;
      const matchesCategory = !category || a.category === category;
      const matchesCost = !maxCost || a.cost <= Number(maxCost);
      return matchesCity && matchesCategory && matchesCost;
    });
    return mockDelay(results, 300);
  }

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
    console.error('fetchCityActivities error, falling back to mock:', err);
    return ACTIVITIES.filter(a => !cityId || a.city_id === cityId);
  }
}
