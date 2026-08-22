import { apiFetch } from './apiClient';

// GET /api/cities?search=&region=&cost_index=
export async function fetchCities({ search = '', region = '', costIndex = '' } = {}) {
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
    console.error('fetchCities error:', err);
    return [];
  }
}

// POST /api/saved-destinations  { city_id }
export async function saveDestination(cityId) {
  try {
    return await apiFetch('/saved-destinations', {
      method: 'POST',
      body: JSON.stringify({ city_id: cityId }),
    });
  } catch (err) {
    console.error('saveDestination error:', err);
    throw err;
  }
}
