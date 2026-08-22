# GlobeTrotter — Implementation Status Report

**Scope:** audit of the current repo (`repomix-output.xml`) against `design.md`'s 13-screen spec and API contract.
**Verdict up front:** auth, schema, city/activity search, itinerary building, and budget calculation are real and wired end-to-end. The gap is concentrated in one file — `server/src/routes/trips.js` — plus three screens that exist as UI but aren't backed by real data.

---

## 1. Missing backend routes

The frontend already calls these; the server has no matching handler for any of them.

| Route | Called from | Status |
|---|---|---|
| `GET /api/trips` (list) | `MyTripsPage.jsx` & `tripsApi.js` | ✅ Real — lists user's trips from Neon PostgreSQL with sample fallback |
| `POST /api/trips` (create) | `CreateTripPage.jsx` & `tripsApi.js` | ✅ Real — creates trip + optional initial stop + share slug |
| `PUT /api/trips/:id` | `tripsApi.js` | ✅ Real — updates trip metadata |
| `DELETE /api/trips/:id` | `MyTripsPage.jsx` & `tripsApi.js` | ✅ Real — deletes trip and cascades |
| `PATCH /api/trips/:id/share` | `MyTripsPage.jsx` & `tripsApi.js` | ✅ Real — toggles public sharing and returns slug |
| `PUT /api/stops/:id` | `tripsApi.js` → `updateStop()` | ✅ Real — updates stop dates, costs, order_index |
| `DELETE /api/stops/:id` | `tripsApi.js` → `deleteStop()` | ✅ Real — deletes stop |
| `DELETE /api/stop-activities/:id` | `tripsApi.js` → `removeStopActivity()` | ✅ Real — deletes stop activity |
| `POST /api/saved-destinations` | `citiesApi.js` → `saveDestination()` | Frontend calls it; no route file, nothing mounted in `index.js` |
| `GET /api/saved-destinations` | — needed for Profile's saved list | Missing |
| `GET /api/admin/stats` | — needed for Admin dashboard | Missing |

---

## 2. Screens: built vs. wired vs. real

| # | Screen | Status |
|---|---|---|
| 1 | Login/Signup | ✅ Real — signup/login/refresh/logout/me all implemented, plus a password-reset flow beyond the original spec |
| 2 | Dashboard / Home | ✅ Real — `HomePage.jsx` fully interactive with Passenger Terminal hero, ticket deck, passport stamps, and ledger preview |
| 3 | Create Trip | ✅ Real — `CreateTripPage.jsx` with date calculations, cover presets, starting city selector, wired to `POST /api/trips` |
| 4 | My Trips | ✅ Real — `MyTripsPage.jsx` with ticket-wallet list, search/filter, delete confirmation, share toggle, wired to `GET /api/trips` |
| 5 | Itinerary Builder | ✅ Real — add stop, add activity, both wired to live endpoints |
| 6 | Itinerary View | ✅ Real |
| 7 | City Search | ✅ Real — filters hit `GET /api/cities` |
| 8 | Activity Search | ✅ Real |
| 9 | Budget Breakdown | ✅ Real — server computes, charts render off the real payload |
| 10 | Trip Calendar/Timeline | ✅ Real |
| 11 | Shared Public View | ✅ Real for reading; "Copy Trip" endpoint exists (`POST /api/public/trips/:slug/copy`) |
| 12 | Profile/Settings | ⚠️ Mostly real — update/delete account work; saved-destinations list has no backing endpoint |
| 13 | Admin Dashboard | ❌ 100% mock data — `AdminPage.jsx` renders a hardcoded `MOCK_USERS` array, no real aggregation query anywhere |

---

## 3. Smaller gaps

- **Stop reordering:** `order_index` exists in the schema and `updateStop()` can send it, but no UI control (up/down arrows or drag) in the Itinerary Builder actually triggers a reorder call.
- **Copy Trip:** the route exists but its clone logic (does it correctly duplicate stops + activities into the new user's trip?) wasn't verified line-by-line.

---

## 4. What's already solid

Worth stating plainly so the gap list above doesn't read as "nothing works": auth (with password reset, which wasn't even in the original spec), the full 7-table schema matching `design.md`, city/activity search, itinerary build/view, and budget calculation with its chart rendering are all real, wired, and not stubbed. The remaining work is concentrated, not scattered — one backend file plus three frontend pages.
