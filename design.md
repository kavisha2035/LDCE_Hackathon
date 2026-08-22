# GlobeTrotter — Design Document

**Stack:** React (Vite) · Node.js/Express · PostgreSQL · JWT auth

---

## 3. Architecture

```
┌─────────────────┐         HTTPS/JSON          ┌──────────────────┐
│   React (Vite)    │ ───────────────────────────▶│  Express API      │
│   React Router    │◀─────────────────────────── │  (Node.js)        │
│   Context (auth)  │                             │  JWT middleware   │
└─────────────────┘                              └────────┬─────────┘
                                                            │ pg / Prisma
                                                            ▼
                                                  ┌──────────────────┐
                                                  │   PostgreSQL      │
                                                  └──────────────────┘
```

- **State:** React Context for auth (token + current user). No Redux — not enough time to justify it, and Context is enough for this scope.
- **ORM:** Prisma if someone's used it before (migrations + generated types pay for themselves); otherwise plain `pg` with hand-written SQL. Decide in the Hour-0 meeting and don't revisit.
- **Charts:** `recharts` for Budget Breakdown and Admin Analytics — lightweight, no config ceremony.
- **Seed data:** cities and activities are real rows in Postgres (seeded via SQL script in Section 4), not hardcoded in the frontend. This is what makes City Search and Activity Search real features instead of static pages, and it's a legitimate answer to "why is this a relational database and not a form."

---

## 4. Database Schema (PostgreSQL)

```sql
-- Users
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_admin      BOOLEAN DEFAULT FALSE,     -- gates screen 13
  language_pref VARCHAR(10) DEFAULT 'en',  -- screen 12
  created_at    TIMESTAMP DEFAULT NOW()
);

-- Trips
CREATE TABLE trips (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name            VARCHAR(150) NOT NULL,
  description     TEXT,
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  cover_photo_url VARCHAR(500),
  is_public       BOOLEAN DEFAULT FALSE,
  share_slug      VARCHAR(50) UNIQUE,       -- e.g. 'kyoto-fall-2026-x7f2'
  created_at      TIMESTAMP DEFAULT NOW()
);

-- Cities (seeded reference data)
CREATE TABLE cities (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  country     VARCHAR(100) NOT NULL,
  region      VARCHAR(100),
  cost_index  INTEGER,          -- 1 (cheap) - 5 (expensive)
  popularity  INTEGER DEFAULT 0 -- powers "recommended destinations" + sort order in City Search
);

-- Trip Stops (a city visited within a trip, with its own date range)
CREATE TABLE trip_stops (
  id                    SERIAL PRIMARY KEY,
  trip_id               INTEGER REFERENCES trips(id) ON DELETE CASCADE,
  city_id               INTEGER REFERENCES cities(id),
  start_date            DATE NOT NULL,
  end_date              DATE NOT NULL,
  order_index           INTEGER NOT NULL,   -- controls stop ordering, reorder = update this column
  est_stay_cost_per_day NUMERIC(10,2) DEFAULT 0,
  est_transport_cost    NUMERIC(10,2) DEFAULT 0
);

-- Activities (seeded reference data, scoped to a city)
CREATE TABLE activities (
  id             SERIAL PRIMARY KEY,
  city_id        INTEGER REFERENCES cities(id),
  name           VARCHAR(150) NOT NULL,
  category       VARCHAR(50),      -- 'sightseeing' | 'food' | 'adventure' | 'culture' | 'nightlife'
  cost           NUMERIC(10,2) DEFAULT 0,
  duration_hours NUMERIC(4,1),
  description    TEXT,
  image_url      VARCHAR(500)
);

-- Trip Stop Activities (join table: an activity assigned to a specific stop + day)
CREATE TABLE trip_stop_activities (
  id             SERIAL PRIMARY KEY,
  trip_stop_id   INTEGER REFERENCES trip_stops(id) ON DELETE CASCADE,
  activity_id    INTEGER REFERENCES activities(id),
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  notes          TEXT
);

-- Saved destinations (screen 12: "saved destinations list")
CREATE TABLE saved_destinations (
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  city_id INTEGER REFERENCES cities(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, city_id)
);
```

**Why this shape:** `trips → trip_stops → trip_stop_activities` is the whole product in three tables, plus `cities`/`activities` as shared reference data and `saved_destinations` as a thin join table. Budget is never stored — always computed from `est_stay_cost_per_day × nights + est_transport_cost + Σ activities.cost`, so the numbers can never drift out of sync with the itinerary. That answers "why relational" and "what's the interesting logic" in one structure.

**Indexes:** `trip_stops(trip_id)`, `trip_stop_activities(trip_stop_id)`, `trips(share_slug)`, `cities(name)`, `activities(city_id)`.

**Seed script:** write ~15–20 cities across 3–4 regions and ~5–8 activities per city, with varied `cost_index`/`category` values, so City Search, Activity Search, and the Dashboard's recommendations all have real data to filter on.

---

## 5. API Contract (freeze this before Hour 0.5 ends)

All routes except auth and public-share require `Authorization: Bearer <jwt>`. Admin routes additionally require `users.is_admin = true`.

| Method | Route | Purpose | Screen(s) |
|---|---|---|---|
| POST | `/api/auth/signup` | `{name, email, password}` → `{token, user}` | 1 |
| POST | `/api/auth/login` | `{email, password}` → `{token, user}` | 1 |
| GET | `/api/me` | Current user profile | 2, 12 |
| PUT | `/api/me` | Update `{name, photo_url, language_pref}` | 12 |
| DELETE | `/api/me` | Delete account | 12 |
| GET | `/api/trips` | List current user's trips | 2, 4 |
| POST | `/api/trips` | Create trip `{name, description, start_date, end_date, cover_photo_url}` | 3 |
| GET | `/api/trips/:id` | Trip detail incl. stops + activities | 4, 5, 6, 10 |
| PUT | `/api/trips/:id` | Update trip | 4 |
| DELETE | `/api/trips/:id` | Delete trip | 4 |
| POST | `/api/trips/:id/stops` | Add stop `{city_id, start_date, end_date, est_stay_cost_per_day, est_transport_cost}` | 5 |
| PUT | `/api/stops/:id` | Update stop (dates, cost estimates, `order_index`) | 5, 10 |
| DELETE | `/api/stops/:id` | Remove stop | 5 |
| POST | `/api/stops/:id/activities` | Assign activity `{activity_id, scheduled_date, scheduled_time}` | 5 |
| DELETE | `/api/stop-activities/:id` | Remove assigned activity | 5 |
| GET | `/api/cities?search=&region=` | Search seeded cities | 7 |
| GET | `/api/cities/:id/activities?category=&cost=` | Activities for a city, filterable | 8 |
| POST | `/api/saved-destinations` | `{city_id}` — save a city | 7, 12 |
| GET | `/api/saved-destinations` | List user's saved cities | 12 |
| GET | `/api/trips/:id/budget` | Computed cost breakdown (Section 6) | 9 |
| PATCH | `/api/trips/:id/share` | `{is_public: true}` → generates `share_slug` | 4, 11 |
| GET | `/api/public/trips/:share_slug` | Public read-only itinerary, no auth | 11 |
| GET | `/api/admin/stats` | Trips created, top cities/activities, active users | 13 |

Keep every response shape flat and predictable — a trip object always includes `stops: []` even when empty, so frontend never needs a null-guard it forgot to write. This matters more than usual here since three people are consuming the same contract without syncing constantly.

---

## 6. Budget Calculation Logic

Computed server-side in `GET /api/trips/:id/budget` — frontend only renders numbers, never recomputes them.

```
For each trip_stop:
  nights = end_date - start_date
  stay_cost = est_stay_cost_per_day * nights
  transport_cost = est_transport_cost
  activities_cost = SUM(activities.cost joined via trip_stop_activities for this stop)
  stop_total = stay_cost + transport_cost + activities_cost

trip_total = SUM(stop_total across all stops)
avg_per_day = trip_total / total_trip_days
breakdown_by_category = { stay: Σstay_cost, transport: Σtransport_cost, activities: Σactivities_cost }
```

Return `trip_total`, `avg_per_day`, `breakdown_by_category`, and a per-stop array in one payload — screen 9's charts render directly off this with zero client-side math.

---

## 7. Screens

### 1. Login / Signup
Single page, tab-toggle between modes rather than two routes. Email/password fields, "Forgot Password" can be a non-functional link (no email infra today — that's an acceptable, honest gap to name if asked). Client-side validation: non-empty, email format, password length.

### 2. Dashboard / Home
Welcome message with user's name, list of recent/upcoming trips (from `GET /api/trips`), "Plan New Trip" button, recommended destinations (top `popularity` cities), and a budget highlight pulled from the most recent trip's `GET /api/trips/:id/budget`.

### 3. Create Trip
Name, start/end date, description, optional cover photo — use a plain image URL text field rather than a file upload pipeline; that's a legitimate scope decision under time pressure, not a missing feature.

### 4. My Trips (Trip List)
Card grid: name, date range, stop count (`stops.length`), View/Edit/Delete actions, and the "Share" toggle that calls `PATCH /api/trips/:id/share` and surfaces the public link for screen 11.

### 5. Itinerary Builder
The core interaction. "Add Stop" → pick city (screen 7's search component, reused here) + date range → stop card appears. Inside each stop: "Add Activity" → pick from that city's activities (screen 8's component, reused here) → appears as a chip with cost + duration. Reordering is up/down arrows updating `order_index` — real drag-and-drop is a nice-to-have polish pass only if Hour 6 arrives early.

### 6. Itinerary View
Read-optimized render of the same trip data: grouped by stop, each showing its date range and day-by-day activities with time and cost. A view-mode toggle (calendar/list) can reuse screen 10's calendar component directly rather than building a second calendar from scratch.

### 7. City Search
Search bar + filters (region, cost index) against `GET /api/cities`, results list with country/cost-index/popularity, "Add to Trip" (feeds screen 5) and "Save" (feeds `saved_destinations`, surfaced on screen 12). Build this as a component, not a page-specific block — screen 5 embeds it directly.

### 8. Activity Search
Given a city (from a stop in screen 5), filter its activities by category/cost/duration, quick view of description + image, add/remove from the current stop. Same reuse principle as screen 7 — one component, used both standalone and embedded in the Itinerary Builder.

### 9. Trip Budget & Cost Breakdown
Pull `GET /api/trips/:id/budget`: bar chart (cost per stop) + pie chart (`breakdown_by_category`), `trip_total` and `avg_per_day` shown prominently, and a simple "over budget" flag on any day/stop exceeding a user-set threshold if time allows — otherwise this is a P1 detail, not a blocker.

### 10. Trip Calendar / Timeline
Calendar or vertical-timeline view of `GET /api/trips/:id` stops+activities, expandable day views, quick-edit links back into screen 5. This can share the exact same data-fetching hook as screen 6 — they're two renderings of one payload, not two features.

### 11. Shared / Public Itinerary View
Public page at `/share/:slug` calling `GET /api/public/trips/:share_slug`, no auth. Read-only render of screen 6's layout, plus a "Copy Trip" button (clones the trip + stops + activities into the viewer's account if logged in — otherwise prompts login first) and social share links.

### 12. User Profile / Settings
Editable name/photo/email (`PUT /api/me`), language preference, delete account (`DELETE /api/me`), and the saved-destinations list (`GET /api/saved-destinations`) from screen 7's "Save" action.

### 13. Admin / Analytics Dashboard
Gated by `users.is_admin`. Tables/charts from `GET /api/admin/stats`: trips created over time, top cities and activities by usage, active user count. Build this last — it's real, demoable, but depends on the other 12 screens generating data worth showing.

---