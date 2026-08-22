import { apiFetch, mockDelay } from './apiClient';
import { ACTIVITIES } from './mockData';

const USE_MOCK = true;

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
    ...(maxCost && { cost: maxCost }),
  }).toString();
  return apiFetch(`/cities/${cityId}/activities?${qs}`);
}
