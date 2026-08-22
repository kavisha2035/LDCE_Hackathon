# 🌍 GlobeTrotter Adventures

> **Curated Itineraries, Precision Travel Planning & Grok AI-Powered Route Generation**

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/Neon-PostgreSQL-00E599?style=for-the-badge&logo=postgresql&logoColor=black)](https://neon.tech/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## 🌟 Overview

**GlobeTrotter Adventures** is a full-stack, state-of-the-art travel platform designed to take travel planning from chaotic spreadsheets to seamless, verified itineraries. It combines high-performance route construction with live cost ledgers, interactive calendar scheduling, AI-powered generation, social sharing, and Instagram-ready boarding pass creation.

Built with a curated **Wanderers Design System** featuring golden accents (`#F5B800`), deep obsidian dark themes (`#1E232A`), smooth glassmorphic elements, curved cards (`rounded-3xl`), and responsive typography (*Playfair Display*, *Montserrat*, and *Satisfy*).

---

## ✨ Key Features

### 1. 🚀 Interactive Landing & City Discovery
- **Live Background Video Hero**: Immersive HD travel showcase with quick search and date picker.
- **Wanderers Destination Catalog**: Real-time search and filter across global cities with cost indices ($1–5), popularity ratings, and highlights.
- **Persistent Saved Destinations**: Like and bookmark destinations with instant local persistence and authenticated backend sync.

### 2. ⚡ Groq AI Trip Planner
- **Intelligent Route Generation**: Generate customized multi-day itineraries from natural language travel prompts (budget, destination, travel style, duration).
- **Day-by-Day Experience Scheduler**: Automatically populates morning, afternoon, and evening activities with realistic estimated costs.
- **Instant Wallet Import**: One-click import into personal user itineraries.

### 3. 🗺️ Drag-and-Drop Itinerary Builder
- **Milestone Timeline**: Visual numbered route sequence connecting every city segment.
- **Two-Tone Obsidian Ticket Cards**: Displays arrival/departure windows, stay rates, and transport allowances.
- **Scoped Experience Catalog**: Add curated local tours or create bespoke custom activities directly on each stop.
- **Live Sync Engine**: Real-time optimistic updates and sync state indicators (`SAVING...` / `SYNCED`).

### 4. 💰 Financial Ledger & Trip Budget Tracker
- **Multi-Category Reconciliation**: Itemizes accommodation, inter-city transport, and activity tariffs.
- **Interactive Recharts Visualizations**:
  - Donut pie chart for expense distribution.
  - Bar chart showing costs allocated per destination stop.
- **Configurable Budget Ceilings**: Dynamic threshold slider with instant over-budget alerts and healthy remaining balance calculations.

### 5. 🗓️ Trip Calendar & Timeline
- **Full-Month Interactive Grid**: Visual month calendar showing active voyage periods, destination stopovers, and scheduled events.
- **Color-Coded Voyage Pills**: Multi-trip tracking with date hopping and quick *Today* navigation.
- **Selected Date Inspector**: Instant day inspection showing all scheduled activities, timeslots, and direct links to edit in builder.

### 6. 🎟️ Public Shareable Itinerary Pass & Boarding Pass Generator
- **Public Itinerary Permalinks**: Unique shareable URLs (`/share/:slug`) with read-only route timeline.
- **One-Click Route Cloning**: Clone another traveler's complete itinerary into your personal wallet.
- **Instagram Story Boarding Pass**: High-resolution, downloadable canvas pass with barcodes, flight stubs, and export to **PDF / PNG**.

### 7. 💬 Explorer Community Hub
- Public explorer feed for sharing trip reviews, destination photos, ratings, and travel tips.

### 8. 🛡️ System Administration & User Analytics
- Comprehensive admin portal with system health stats, user management, itinerary inspection, and security logs.

---

## 🎨 Design System & Aesthetics

| Token | Value | Preview / Usage |
| :--- | :--- | :--- |
| **Primary Gold** | `#F5B800` (Hover: `#E0A600`) | Primary buttons, active highlights, script accents |
| **Deep Charcoal** | `#1E232A` / `#1A1D23` | Dark obsidian ticket stubs, header bars, badges |
| **Canvas Background** | `#FAF9F6` / `#F9F8F6` | Warm off-white page background |
| **Serif Typography** | `Playfair Display` | Elegant headings, brand titles |
| **Script Typography** | `Satisfy` | Playful yellow cursive eyebrows |
| **UI Typography** | `Montserrat` | Clean sans-serif buttons, badges, body copy |
| **Card Radii** | `rounded-3xl` / `rounded-2xl` | Soft, modern card surfaces with deep drop shadows |
| **Pill Controls** | `rounded-full` | Navigation buttons, search inputs, status tags |

---

## 🏗️ Architecture & Tech Stack

### Monorepo Structure

```
LDCE_Hackathon/
├── client/                     # Frontend Application (React + Vite)
│   ├── public/                 # Static assets & icons
│   ├── src/
│   │   ├── api/                # API client wrappers (cities, trips, auth)
│   │   ├── components/         # Reusable UI components
│   │   │   ├── activity-search/# Scoped activity catalog & search
│   │   │   ├── budget/         # Budget charts (PieChart, BarChart, StatCard)
│   │   │   ├── city-search/    # City discovery & filter rows
│   │   │   ├── itinerary-builder/# StopCard, Timeline, AddStopPlaceholder
│   │   │   ├── itinerary-view/ # Read-only route cards
│   │   │   ├── ticket/         # InstagramBoardingPassModal & StopTicketCard
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── Navbar.jsx      # Navigation header with Trip Hub & Door Sign-Out
│   │   │   └── TicketCard.jsx
│   │   ├── context/            # AuthContext & global state
│   │   ├── hooks/              # React Query mutations & query hooks
│   │   ├── lib/                # Formatters, helpers, ToastContext
│   │   ├── pages/              # 16 Full-page routes (Home, Builder, Budget, etc.)
│   │   ├── App.jsx             # Main router & page orchestrator
│   │   ├── main.jsx            # React root with ErrorBoundary & ReactQuery
│   │   └── index.css           # Global typography, animations & Tailwind imports
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                     # Backend API (Node.js + Express + Prisma)
│   ├── prisma/
│   │   └── schema.prisma       # Database models (User, Trip, Stop, Activity, etc.)
│   ├── src/
│   │   ├── middleware/         # JWT authentication & role-based access
│   │   ├── routes/             # REST routes (auth, trips, cities, aiPlanner, admin)
│   │   └── index.js            # Express server entry point
│   ├── .env.example
│   └── package.json
│
├── package.json                # Monorepo root with concurrent scripts
└── README.md
```

### Core Technologies

- **Frontend**: React 18, Vite 6, Tailwind CSS 3.4, `@tanstack/react-query`, Lucide Icons, Recharts, html2canvas, jsPDF
- **Backend**: Node.js, Express 4, Prisma ORM 6.4, JSON Web Tokens (`jsonwebtoken`), bcrypt password hashing, CORS, Cookie-Parser
- **Database**: Neon Serverless PostgreSQL (Cloud)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer)
- [npm](https://www.npmjs.com/) (v9 or newer)
- A Neon PostgreSQL connection string (or local PostgreSQL)

---

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kavisha2035/LDCE_Hackathon.git
   cd LDCE_Hackathon
   ```

2. **Install all monorepo dependencies:**
   ```bash
   npm run install:all
   ```

3. **Configure Environment Variables:**

   Create a `.env` file in the `server/` directory (refer to `server/.env.example`):
   ```env
   PORT=5000
   DATABASE_URL="postgresql://<user>:<password>@<host>/<database>?sslmode=require"
   JWT_SECRET="globetrotter_super_secret_jwt_key_2026"
   BCRYPT_SALT_ROUNDS=12
   ```

4. **Initialize Prisma Database:**
   ```bash
   cd server
   npx prisma generate
   npx prisma db push
   cd ..
   ```

5. **Start Development Servers (Concurrent Client & Server):**
   ```bash
   npm run dev
   ```

   - **Frontend App**: `http://localhost:5173`
   - **Backend API**: `http://localhost:5000`

---

## 🛠️ Available NPM Scripts

From the root directory:

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts both frontend Vite dev server and Express backend concurrently |
| `npm run dev:client` | Starts only the frontend Vite development server (`localhost:5173`) |
| `npm run dev:server` | Starts only the backend Express API server (`localhost:5000`) |
| `npm run build` | Compiles and builds the frontend production bundle (`client/dist`) |
| `npm run install:all` | Installs root, client, and server dependencies |

From the `server/` directory:

| Command | Action |
| :--- | :--- |
| `npm run prisma:generate` | Generates Prisma Client artifacts |
| `npm run prisma:studio` | Opens visual Prisma Studio database manager in browser |

---

## 📡 API Endpoints Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new passenger passport account
- `POST /api/auth/login` — Authenticate user and receive JWT session
- `POST /api/auth/logout` — Terminate session
- `GET /api/auth/me` — Retrieve current authenticated user profile
- `PUT /api/auth/profile` — Update passenger dossier, avatar, and password
- `DELETE /api/auth/account` — Permanently delete user account and itineraries

### Trips & Itineraries (`/api/trips`)
- `GET /api/trips` — Fetch user's active travel itineraries
- `POST /api/trips` — Create a new journey
- `GET /api/trips/:id` — Retrieve detailed trip with all stops and activities
- `PUT /api/trips/:id` — Update trip details and dates
- `DELETE /api/trips/:id` — Delete trip from wallet
- `GET /api/trips/:id/budget` — Calculate live cost ledger (accommodations, transit, activities)
- `POST /api/trips/:id/stops` — Add destination stop to itinerary
- `PUT /api/trips/:id/stops/:stopId` — Update stop schedule or order index
- `DELETE /api/trips/:id/stops/:stopId` — Remove destination stop
- `POST /api/trips/:id/stops/:stopId/activities` — Schedule experience for a stop
- `DELETE /api/trips/:id/stops/:stopId/activities/:actId` — Remove scheduled experience

### Cities & Destinations (`/api/cities`)
- `GET /api/cities` — Search reference cities with filters (`search`, `region`, `costIndex`)
- `GET /api/saved-destinations` — Retrieve user's bookmarked destinations
- `POST /api/saved-destinations` — Bookmark destination
- `DELETE /api/saved-destinations/:cityId` — Remove bookmarked destination

### AI Trip Planner (`/api/ai-planner`)
- `POST /api/ai-planner/generate` — Generate multi-day AI itinerary with budget calculations
- `POST /api/ai-planner/save-to-trips` — Import AI route directly into user passport wallet

### Public Sharing (`/api/public`)
- `GET /api/public/trips/:shareSlug` — Retrieve public verified itinerary pass
- `POST /api/public/trips/:shareSlug/clone` — Clone public route into authenticated user's account

### Admin Portal (`/api/admin`)
- `GET /api/admin/stats` — System telemetry, total travelers, routes, and database counts
- `GET /api/admin/users` — Administrative user list with permission controls
- `DELETE /api/admin/users/:id` — Admin user deletion

---

## 🔒 Security & Performance

- **Token-Based Authentication**: Secure JWT verification in `Authorization: Bearer <token>` headers with httpOnly cookie fallback.
- **Password Security**: Strong salting and hashing with `bcrypt`.
- **Error Boundaries**: Global React `ErrorBoundary` prevents blank screens and enables smooth recovery.
- **Safe Rendering**: Defensive null checks and optional chaining across all dynamic user states.

---

## 👥 Contributors

- **GlobeTrotter Adventures Team** — *LDCE Hackathon 2026*

---

## 📄 License

This project is licensed under the MIT License — see the repository for details.
