# GlobeTrotter — Hackathon Execution Plan

## Tech Stack
- **Frontend:** React (Vite) + Tailwind CSS + shadcn/ui + Recharts + FullCalendar
- **Backend:** Node.js + Express (REST API)
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** JWT (bcrypt for password hashing)
- **Hosting:** Vercel (frontend) + Render/Railway (backend + Postgres)
- **State/Data fetching:** React Query (TanStack Query)

---

## Team Roles

| Person | Role | Screens Owned |
|---|---|---|
| **A** | Auth & Core Backend | Login/Signup, Profile/Settings, DB schema, Auth APIs |
| **B** | Trip Management | Dashboard, Create Trip, My Trips, Itinerary Builder |
| **C** | Discovery & Budget | City Search, Activity Search, Budget Screen |
| **D** | Visualization & Sharing | Itinerary View, Calendar/Timeline, Public Share, Admin (optional) |

---

## PHASE 0 — Setup (All, Day 1 Morning)
- Init monorepo: `/client` (React) and `/server` (Express)
- Set up Postgres DB (Railway/Supabase), connect Prisma
- Set up shared `.env`, ESLint/Prettier, GitHub repo + branches per person

**Prompt:**
> "Set up a monorepo with a Vite+React+Tailwind frontend in /client and an Express+Prisma+PostgreSQL backend in /server. Include CORS, dotenv config, and a health-check route."

---

## PHASE 1 — Database Schema (Person A)
Design tables: `User`, `Trip`, `Stop` (city+dates within a trip), `City`, `Activity`, `TripActivity` (activity assigned to a stop with time/cost), `Budget` (derived or stored summary).

**Prompt:**
> "Create a Prisma schema for a travel app with these models: User (id, name, email, password, createdAt), Trip (id, userId, name, description, startDate, endDate, coverPhoto, isPublic), Stop (id, tripId, cityId, startDate, endDate, order), City (id, name, country, costIndex, popularity), Activity (id, cityId, name, type, cost, duration, description, imageUrl), TripActivity (id, stopId, activityId, scheduledDate, scheduledTime, cost). Add proper relations, cascading deletes where relevant, and indexes on foreign keys."

**Deliverable:** `schema.prisma` + migration run + seed script with ~15 sample cities and ~30 activities.

---

## PHASE 2 — Auth (Person A)
**Screens:** Login/Signup, Profile/Settings

**Backend Prompt:**
> "Build Express routes for /auth/signup, /auth/login, /auth/forgot-password using bcrypt for password hashing and JWT for sessions. Include a middleware `authenticateToken` that protects routes by verifying the JWT and attaching userId to req."

**Frontend Prompt:**
> "Build a React Login/Signup page with email+password fields, client-side validation (required, email format, min password length), a toggle between login/signup, and a 'Forgot Password' link. Use React Hook Form + Zod for validation, and call the /auth API with React Query."

**Profile/Settings Prompt:**
> "Build a Profile/Settings page where a logged-in user can update name, email, profile photo (mock upload), and delete their account. Include a confirm-dialog for delete."

---

## PHASE 3 — Trip Management (Person B)

### 3a. Dashboard
**Prompt:**
> "Build a Dashboard screen showing a welcome message, a horizontal list of the user's upcoming trips (card: name, date range, cover photo), a 'Plan New Trip' CTA button, and a recommended destinations section (static/mock data)."

### 3b. Create Trip
**Prompt:**
> "Build a Create Trip form with fields: trip name, start date, end date (date-range picker), description (textarea), optional cover photo upload. On submit, POST to /trips and redirect to the Itinerary Builder for that trip."

### 3c. My Trips (List)
**Prompt:**
> "Build a My Trips page listing all trips as cards showing name, date range, number of stops/destinations, and edit/view/delete actions. Fetch from GET /trips with React Query, support delete with optimistic UI update."

### 3d. Itinerary Builder
**Prompt:**
> "Build an Itinerary Builder screen for a given trip: an 'Add Stop' button opens a modal to pick a city (from City Search) and set stop start/end dates. Show stops as an ordered, drag-to-reorder list (use dnd-kit). For each stop, allow assigning activities (from Activity Search) with a specific date/time. Persist order changes via PATCH /trips/:id/stops/reorder."

**Backend Prompt (pair with A):**
> "Build REST endpoints: POST /trips, GET /trips, GET /trips/:id, PUT /trips/:id, DELETE /trips/:id, POST /trips/:id/stops, PATCH /trips/:id/stops/reorder, DELETE /stops/:id, POST /stops/:id/activities, DELETE /trip-activities/:id. All protected by auth middleware and scoped to the logged-in user."

---

## PHASE 4 — Discovery & Budget (Person C)

### 4a. City Search
**Prompt:**
> "Build a City Search page: search bar (debounced), list of cities showing name, country, cost index, popularity badge, and an 'Add to Trip' button that opens a stop-creation modal. Support filter by country/region via query params."

**Backend Prompt:**
> "Build GET /cities?search=&country=&sortBy=popularity with pagination, using Prisma's `contains` for search."

### 4b. Activity Search
**Prompt:**
> "Build an Activity Search page scoped to a city: filters for type (sightseeing/food/adventure), cost range slider, duration. Show activity cards with image, description preview, and add/remove-from-stop buttons."

**Backend Prompt:**
> "Build GET /cities/:id/activities?type=&maxCost=&maxDuration= with filtering logic in Prisma."

### 4c. Budget Screen
**Prompt:**
> "Build a Trip Budget screen showing: total estimated cost, a pie chart (Recharts) breaking cost by category (transport, stay, activities, meals), a bar chart of average cost per day, and a list of days flagged as over-budget (compare daily cost to a user-set daily limit)."

**Backend Prompt:**
> "Build GET /trips/:id/budget that aggregates TripActivity costs by category and by day, and returns totals + per-day breakdown as JSON."

---

## PHASE 5 — Visualization & Sharing (Person D)

### 5a. Itinerary View (read-only structured view)
**Prompt:**
> "Build an Itinerary View screen showing the full trip day-wise: city headers grouping days, activity blocks with time and cost, and a toggle between calendar view and list view."

### 5b. Trip Calendar / Timeline
**Prompt:**
> "Build a Calendar view using FullCalendar showing each day of the trip with activities as events. Support expandable day view and drag-to-reorder activities within a day, syncing changes back via PATCH /trip-activities/:id."

### 5c. Shared/Public Itinerary
**Prompt:**
> "Build a public read-only route /share/:tripId that requires no auth, shows the itinerary summary, a 'Copy Trip' button (duplicates the trip into the logged-in viewer's account via POST /trips/:id/copy), and social share buttons (copy link, WhatsApp, Twitter intent links)."

**Backend Prompt:**
> "Build GET /public/trips/:id (only if trip.isPublic = true) and POST /trips/:id/copy that deep-copies a trip's stops and activities into a new trip owned by the requesting user."

### 5d. Admin Dashboard (optional, time-permitting)
**Prompt:**
> "Build an admin-only dashboard showing total trips created, top 5 cities/activities by usage, and a simple user engagement chart. Protect with an isAdmin check middleware."

---

## PHASE 6 — Integration (All, final stretch)
- Connect all screens via shared React Router routes and a nav shell
- End-to-end test: signup → create trip → add stops/activities → view budget → view calendar → share publicly
- Fix CORS/env issues, deploy backend then frontend
- Prepare 3–5 min demo script hitting every screen

**Integration Prompt:**
> "Set up React Router with routes for /, /login, /signup, /dashboard, /trips, /trips/new, /trips/:id/build, /trips/:id/view, /trips/:id/budget, /trips/:id/calendar, /share/:id, /profile. Wrap protected routes in an auth guard."

---

## Suggested Timeline (36–48hr hackathon)
- **Hrs 0–4:** Phase 0 + Phase 1 (schema) — everyone else scaffolds their screens with mock data
- **Hrs 4–14:** Phases 2–5 in parallel, wiring to real APIs as A finishes auth
- **Hrs 14–20:** Phase 6 integration
- **Hrs 20–24:** Bug bash, polish UI, deploy, prep demo
