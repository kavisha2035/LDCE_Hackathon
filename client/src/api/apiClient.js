// Shared authenticated fetch wrapper for Person C's screens (7 City Search,
// 8 Activity Search, 9 Budget Breakdown).
//
// Every api/*.js module here has USE_MOCK = true and returns data from
// src/api/mockData.js instead of calling apiFetch, because Person A's
// cities/activities/budget routes aren't built yet (only /api/auth/* exists
// on main right now). To go live: flip USE_MOCK to false in each module —
// the React Query hooks and every component consuming them are unaware of
// the switch and need zero changes.
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

function authHeaders() {
  const token = localStorage.getItem('gt_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${body || res.statusText}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export function mockDelay(data, ms = 350) {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}
