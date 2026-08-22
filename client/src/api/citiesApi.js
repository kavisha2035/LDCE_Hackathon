import { apiFetch, mockDelay } from './apiClient';
import { CITIES } from './mockData';

const USE_MOCK = false;

// GET /api/cities?search=&region=&cost_index=
export async function fetchCities({ search = '', region = '', costIndex = '' } = {}) {
  if (USE_MOCK) {
    const q = search.trim().toLowerCase();
    const results = CITIES.filter((city) => {
      const matchesSearch = !q
        || city.name.toLowerCase().includes(q)
        || city.country.toLowerCase().includes(q);
      const matchesRegion = !region || city.region === region;
      const matchesCost = !costIndex || city.cost_index === Number(costIndex);
      return matchesSearch && matchesRegion && matchesCost;
    });
    return mockDelay(results);
  }

  const qs = new URLSearchParams({
    ...(search && { search }),
    ...(region && { region }),
    ...(costIndex && { costIndex }),
  }).toString();

  try {
    const data = await apiFetch(`/cities?${qs}`);
    const list = Array.isArray(data) ? data : (data?.cities || []);
    return list.map(c => ({
      ...c,
      cost_index: c.cost_index ?? c.costIndex ?? 1,
      image_url: c.image_url ?? c.imageUrl,
    }));
  } catch (err) {
    console.error('fetchCities error, using fallback:', err);
    return CITIES;
  }
}

// POST /api/saved-destinations  { city_id }
export async function saveDestination(cityId) {
  if (USE_MOCK) {
    console.log('[mock] POST /api/saved-destinations', { city_id: cityId });
    return mockDelay({ user_id: 'user-1', city_id: cityId }, 200);
  }
  try {
    return await apiFetch('/saved-destinations', {
      method: 'POST',
      body: JSON.stringify({ city_id: cityId }),
    });
  } catch (err) {
    return { user_id: 'current-user', city_id: cityId };
  }
}
