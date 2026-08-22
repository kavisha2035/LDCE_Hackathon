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

// POST /api/saved-destinations  { city_id / cityName }
export async function saveDestination(param) {
  const body = typeof param === 'string'
    ? { city_id: param, cityName: param }
    : { city_id: param?.id || param?.city_id || param?.cityId, cityName: param?.name || param?.cityName };

  try {
    return await apiFetch('/saved-destinations', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error('saveDestination error:', err);
    throw err;
  }
}

// DELETE /api/saved-destinations/:cityId
export async function removeSavedDestination(cityIdOrName) {
  try {
    return await apiFetch(`/saved-destinations/${encodeURIComponent(cityIdOrName)}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.error('removeSavedDestination error:', err);
    throw err;
  }
}

// GET /api/saved-destinations
export async function fetchSavedDestinations() {
  try {
    const data = await apiFetch('/saved-destinations');
    return data?.saved || [];
  } catch (err) {
    console.error('fetchSavedDestinations error:', err);
    return [];
  }
}
