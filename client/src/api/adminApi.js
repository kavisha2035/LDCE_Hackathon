import { apiFetch } from './apiClient';

export async function fetchAdminDashboard() {
  const data = await apiFetch('/admin/dashboard');
  return {
    users: Array.isArray(data?.users) ? data.users : [],
    cities: Array.isArray(data?.cities) ? data.cities : [],
    activities: Array.isArray(data?.activities) ? data.activities : [],
    analytics: {
      langPrefs: Array.isArray(data?.analytics?.langPrefs) ? data.analytics.langPrefs : [],
      tripTrends: Array.isArray(data?.analytics?.tripTrends) ? data.analytics.tripTrends : [],
      topCities: Array.isArray(data?.analytics?.topCities) ? data.analytics.topCities : [],
    },
  };
}