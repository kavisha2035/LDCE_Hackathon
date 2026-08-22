# 🌍 GlobeTrotter — Project Context & Handoff Master Document

> **Note for AI Assistant (Claude / Next Engineer):**  
> This document contains the complete context, design philosophy, architecture, database schemas, security models, API specifications, and current implementation status for **GlobeTrotter**.

---

## 📌 1. Executive Summary & Identity

**GlobeTrotter** is a web application designed around the **"Itinerary-as-Document"** paradigm. Travel plans are treated like official boarding passes, ticket stubs, and route sheets rather than generic SaaS cards.

### 🎨 Design System: Inked Map Aesthetic
- **Base Color (Parchment Paper):** `#F6F3EC`
- **Text & High-Contrast Tactile Borders:** `#1F2B2E`
- **Route Blue (Primary Accent):** `#2C5F7C`
- **Passport Ochre (Highlight Accent):** `#B8823A`
- **Sea Green (Secondary Accent):** `#7FA69C`
- **Stamp Red (Destructive Actions Only):** `#B84A3E`
- **Typography:**
  - Headings: `Barlow Condensed` (bold, uppercase, tracking-tight)
  - Body: `Inter`
  - Data / Amounts / Timestamps: `JetBrains Mono` or `IBM Plex Mono`

---

## 📁 2. Repository Structure

```
LDCEodoo/
├── PROJECT_CONTEXT.md              # Master Context & Handoff Document
├── design.md                       # Full Technical Specification (Screens 1 - 13)
├── frontend-design.md              # UI/UX & Design Token Guidelines
├── GlobeTrotter_Hackathon_Plan.md   # Hackathon Milestones & Team Roles
├── package.json                    # Workspace root configuration
├── .gitignore                      # Git ignore rules
│
├── server/                         # Backend Express API & Database
│   ├── package.json
│   ├── .env                        # PORT=5000, DATABASE_URL, JWT_SECRET, REFRESH_TOKEN_SECRET
│   ├── prisma/
│   │   ├── schema.prisma           # Prisma PostgreSQL schema
│   │   └── seed.js                 # Database seeder (10 Cities, 25 Activities)
│   └── src/
│       ├── index.js                # Express app entrypoint & middleware setup
│       ├── middleware/
│       │   └── auth.js             # Bearer JWT verification middleware
│       └── routes/
│           ├── auth.js             # Auth endpoints (Signup, Login, Refresh, Logout, Profile)
│           ├── cities.js           # City & Activity search APIs
│           ├── trips.js            # Trip management, stop management & budget calculation APIs
│           └── publicTrips.js      # Public share slug & trip cloning APIs
│
└── client/                         # Frontend React SPA (Vite)
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── index.html                  # Font imports (Barlow Condensed, Inter, JetBrains Mono)
    └── src/
        ├── index.css               # Design system utility classes & fonts
        ├── main.jsx
        ├── App.jsx                 # Main application container & tab router
        ├── api/                    # API client modules (tripsApi, citiesApi, activitiesApi, budgetApi)
        ├── components/
        │   ├── Navbar.jsx          # Top boarding pass navigation bar
        │   ├── TicketCard.jsx      # Signature Ticket Stub StopCard component
        │   ├── city-search/        # City search component
        │   ├── itinerary-builder/  # StopCard builder component
        │   └── itinerary-view/     # Read-only itinerary view
        ├── context/
        │   └── AuthContext.jsx     # In-memory token management & silent refresh helper
        └── pages/
            ├── DashboardPage.jsx   # Passenger Dashboard (Screen 2)
            ├── AuthPage.jsx        # Login & Signup (Screen 1)
            ├── ProfilePage.jsx     # Passenger Settings (Screen 12)
            ├── ActivitySearchPage.jsx # Activity Search (Screen 8)
            ├── TripBudgetPage.jsx  # Cost Breakdown Analytics (Screen 9)
            ├── TripCalendarPage.jsx# Timeline & Calendar (Screen 10)
            └── PublicItineraryPage.jsx # Shared Public Itinerary View (Screen 11)
```

---

## 🛠️ 3. Tech Stack & Environment Setup

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 18 (Vite 6), React Router |
| **Styling** | TailwindCSS, Custom Inked Map Utilities |
| **Icons & Fonts** | Lucide React, Google Fonts (`Barlow Condensed`, `Inter`, `JetBrains Mono`) |
| **Backend Framework** | Node.js, Express.js |
| **Database** | Neon Cloud PostgreSQL (Serverless) |
| **ORM** | Prisma ORM 6 |
| **Security & Auth** | JWT Access Tokens (15m in-memory), HTTP-Only Refresh Cookies (7d), bcrypt (12 salt rounds), Cookie-Parser, CORS Credentials |

### Environment Variables (`server/.env`)
```env
PORT=5000
DATABASE_URL="postgresql://neondb_owner:npg_oGNhmwlE3s2V@ep-summer-salad-axui8sry.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="globetrotter_super_secret_jwt_key_2026"
REFRESH_TOKEN_SECRET="globetrotter_refresh_token_secret_7d_2026"
BCRYPT_SALT_ROUNDS=12
NODE_ENV=development
```

---

## 🔐 4. Security & Authentication Architecture

### 🛡️ Token Strategy: In-Memory + HTTP-Only Cookie
1. **Access Token (15 Minutes Expiry):**
   - Stored **exclusively in React memory state** (`AuthContext` `useState`).
   - `localStorage` contains **ZERO** tokens.
   - Sent via `Authorization: Bearer <accessToken>` header.
2. **Refresh Token (7 Days Expiry):**
   - Issued via `Set-Cookie: refreshToken=...; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800`.
   - JavaScript (`document.cookie`) cannot read or access this token, protecting against XSS attacks.
   - Persisted in Neon DB (`refresh_tokens` table).
3. **Silent Session Renewal:**
   - On page load/refresh or 401 token expiry, `AuthContext` calls `POST /api/auth/refresh` with `credentials: 'include'`.
   - The server verifies the HTTP-Only cookie, rotates the refresh token in Neon DB, sets an updated cookie, and returns a fresh 15m Access Token into React state.
4. **Email & Avatar Security:**
   - Strict regex validation (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`) enforced on both client and server.
   - Custom avatar support (Image URL or local file upload base64 data URL) with clean initial letter badge fallback. Preloaded external avatar images have been removed.

---

## 🗄️ 5. Database Architecture & Schema (Prisma)

The PostgreSQL database contains **8 relational tables** mapped with snake_case table names (`@@map`):

```prisma
model User {
  id                String             @id @default(uuid())
  name              String
  email             String             @unique
  password          String             @map("password_hash")
  isAdmin           Boolean            @default(false) @map("is_admin")
  languagePref      String             @default("en") @map("language_pref")
  avatar            String?            @map("avatar_url")
  createdAt         DateTime           @default(now()) @map("created_at")
  updatedAt         DateTime           @updatedAt @map("updated_at")
  trips             Trip[]
  savedDestinations SavedDestination[]
  refreshTokens     RefreshToken[]

  @@map("users")
}

model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    String   @map("user_id")
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime @map("expires_at")
  createdAt DateTime @default(now()) @map("created_at")

  @@map("refresh_tokens")
}

model City {
  id          String             @id @default(uuid())
  name        String
  country     String
  region      String?
  costIndex   Int                @default(1) @map("cost_index") // 1 to 5
  popularity  Int                @default(0)
  imageUrl    String?            @map("image_url")
  description String?
  stops       Stop[]
  activities  Activity[]
  savedBy     SavedDestination[]

  @@map("cities")
}

model Trip {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  name        String
  description String?
  startDate   DateTime @map("start_date")
  endDate     DateTime @map("end_date")
  coverPhoto  String?  @map("cover_photo_url")
  isPublic    Boolean  @default(false) @map("is_public")
  shareSlug   String?  @unique @map("share_slug")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  stops       Stop[]

  @@map("trips")
}

model Stop {
  id                String         @id @default(uuid())
  tripId            String         @map("trip_id")
  trip              Trip           @relation(fields: [tripId], references: [id], onDelete: Cascade)
  cityId            String         @map("city_id")
  city              City           @relation(fields: [cityId], references: [id])
  startDate         DateTime       @map("start_date")
  endDate           DateTime       @map("end_date")
  orderIndex        Int            @default(0) @map("order_index")
  estStayCostPerDay Float          @default(0.0) @map("est_stay_cost_per_day")
  estTransportCost  Float          @default(0.0) @map("est_transport_cost")
  tripActivities    TripActivity[]

  @@map("trip_stops")
}

model Activity {
  id             String         @id @default(uuid())
  cityId         String         @map("city_id")
  city           City           @relation(fields: [cityId], references: [id], onDelete: Cascade)
  name           String
  category       String         // sightseeing, food, adventure, culture, nightlife
  cost           Float          @default(0.0)
  durationHours  Float          @default(1.0) @map("duration_hours")
  description    String?
  imageUrl       String?        @map("image_url")
  tripActivities TripActivity[]

  @@map("activities")
}

model TripActivity {
  id            String    @id @default(uuid())
  stopId        String    @map("trip_stop_id")
  stop          Stop      @relation(fields: [stopId], references: [id], onDelete: Cascade)
  activityId    String    @map("activity_id")
  activity      Activity  @relation(fields: [activityId], references: [id])
  scheduledDate DateTime? @map("scheduled_date")
  scheduledTime String?   @map("scheduled_time")
  notes         String?

  @@map("trip_stop_activities")
}

model SavedDestination {
  userId String @map("user_id")
  cityId String @map("city_id")
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  city   City   @relation(fields: [cityId], references: [id], onDelete: Cascade)

  @@id([userId, cityId])
  @@map("saved_destinations")
}
```

---

## 📡 6. API Architecture Map

### 🔐 Auth & User Routes ([`server/src/routes/auth.js`](file:///d:/College/LDCEodoo/server/src/routes/auth.js))
- `POST /api/auth/signup` — Registers new passenger, returns 15m `accessToken` & sets HTTP-Only `refreshToken` cookie.
- `POST /api/auth/login` — Verifies password (bcrypt 12), returns 15m `accessToken` & sets HTTP-Only `refreshToken` cookie.
- `POST /api/auth/refresh` — Verifies HTTP-Only cookie, rotates DB token, returns new 15m `accessToken` & updated cookie.
- `POST /api/auth/logout` — Clears HTTP-Only cookie and revokes DB token.
- `GET /api/me` — Protected profile lookup.
- `PUT /api/me` — Protected profile & credentials update.
- `DELETE /api/me` — Protected account deletion.

### 🏙️ City & Activity Routes ([`server/src/routes/cities.js`](file:///d:/College/LDCEodoo/server/src/routes/cities.js))
- `GET /api/cities` — Lists cities with search (`?search=`), country (`?country=`), cost index (`?minCost=&maxCost=`), and sorting.
- `GET /api/cities/:id` — Single city detail with activities count.
- `GET /api/cities/:id/activities` — Activities for a city, filterable by category, max cost, duration, and search query.

### ✈️ Trip Management Routes ([`server/src/routes/trips.js`](file:///d:/College/LDCEodoo/server/src/routes/trips.js))
- `GET /api/trips` — Lists user's trips.
- `GET /api/trips/:id` — Full trip detail including stops and scheduled activities.
- `GET /api/trips/:id/budget` — Computes total trip budget breakdown according to `design.md` Section 4 formulas:
  $$\text{Stay Cost} = \text{estStayCostPerDay} \times \text{nights}$$
  $$\text{Trip Total} = \sum \text{Stay} + \sum \text{Transport} + \sum \text{Activities}$$
- `POST /api/trips` — Creates a new trip.
- `POST /api/trips/:id/stops` — Adds a stop to a trip.
- `PUT /api/trips/stops/:id` — Updates stop dates, order, stay cost, or transport cost.
- `DELETE /api/trips/stops/:id` — Removes a stop.
- `POST /api/trips/stops/:id/activities` — Assigns an activity to a stop.
- `DELETE /api/trips/stop-activities/:id` — Removes an assigned activity from a stop.

### 🌐 Public Sharing Routes ([`server/src/routes/publicTrips.js`](file:///d:/College/LDCEodoo/server/src/routes/publicTrips.js))
- `GET /api/public/trips/:shareSlug` — Read-only public itinerary lookup for shared trips.
- `POST /api/public/trips/:shareSlug/copy` — Clones a public trip into the logged-in user's account.

### 💚 Health Check Route
- `GET /api/health` — Returns live status of Neon Cloud PostgreSQL database connection, table row counts, and latency.

---

## 📺 7. Screen & Frontend Architecture Matrix

| Screen | Name | Component / Page | Status |
|---|---|---|---|
| **Screen 1** | Sign In / Register | [`AuthPage.jsx`](file:///d:/College/LDCEodoo/client/src/pages/AuthPage.jsx) | **Completed** |
| **Screen 2** | Dashboard | [`DashboardPage.jsx`](file:///d:/College/LDCEodoo/client/src/pages/DashboardPage.jsx) | **Completed** |
| **Screen 3** | Create Trip | Form Modal / Page | Integrated in Dashboard CTA |
| **Screen 4** | My Trips | Trip Cards / Grid | Integrated in Dashboard / Builder |
| **Screen 5** | Itinerary Builder | [`ItineraryBuilder.jsx`](file:///d:/College/LDCEodoo/client/src/components/itinerary-builder/ItineraryBuilder.jsx) | **Completed** |
| **Screen 6** | Itinerary View | [`ItineraryView.jsx`](file:///d:/College/LDCEodoo/client/src/components/itinerary-view/ItineraryView.jsx) | **Completed** |
| **Screen 7** | City Search | [`CitySearch.jsx`](file:///d:/College/LDCEodoo/client/src/components/city-search/CitySearch.jsx) | **Completed** |
| **Screen 8** | Activity Search | [`ActivitySearchPage.jsx`](file:///d:/College/LDCEodoo/client/src/pages/ActivitySearchPage.jsx) | **Completed** |
| **Screen 9** | Budget Breakdown | [`TripBudgetPage.jsx`](file:///d:/College/LDCEodoo/client/src/pages/TripBudgetPage.jsx) | **Completed** |
| **Screen 10** | Calendar Timeline | [`TripCalendarPage.jsx`](file:///d:/College/LDCEodoo/client/src/pages/TripCalendarPage.jsx) | **Completed** |
| **Screen 11** | Public Share View | [`PublicItineraryPage.jsx`](file:///d:/College/LDCEodoo/client/src/pages/PublicItineraryPage.jsx) | **Completed** |
| **Screen 12** | User Profile & Settings | [`ProfilePage.jsx`](file:///d:/College/LDCEodoo/client/src/pages/ProfilePage.jsx) | **Completed** |
| **Screen 13** | Admin Dashboard | Admin Analytics View | Ready for extension |

---

## 👥 8. Team Roles & Assignment Matrix

- **Person A (Auth & Core Backend):**
  - Schema definition, JWT + HTTP-Only Cookie Auth, User Profile, Settings, Security Validations.
- **Person B (Trip Management):**
  - Dashboard (Screen 2), Create Trip (Screen 3), My Trips (Screen 4), Itinerary Builder (Screen 5).
- **Person C (Discovery & Budget):**
  - City Search (Screen 7), Activity Search (Screen 8), Budget Breakdown (Screen 9).
- **Person D (Visualization & Sharing):**
  - Read-Only Itinerary View (Screen 6), Calendar Timeline (Screen 10), Public Share Slug (Screen 11), Copy Trip.

---

## 🚀 9. How to Run & Validate

### 1. Start Backend & Frontend
```bash
# Terminal 1: Backend Server (Port 5000)
cd server
npm run dev

# Terminal 2: Frontend Client (Port 5173)
cd client
npm run dev
```

### 2. Verify Client Build
```bash
npm run build --workspace=client
```

### 3. Sync & Seed Database
```bash
cd server
npx prisma db push
node prisma/seed.js
```

---

*Document compiled as of August 22, 2026. Codebase is in a 100% working, built, and synchronized state on GitHub `main` branch.*
