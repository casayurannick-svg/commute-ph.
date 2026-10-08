# CommutePH — Metro Manila Transit Cost & Fare Engine

CommutePH is a modern, open-source transit cost calculator and fare engine built specifically for Metro Manila and NCR commuters. It computes exact fares, estimated journey times, and discount breakdowns across multiple public transit modes (LRT, MRT, Bus, Jeepney, UV Express, Tricycle, and Ride-Hail options) grounded strictly in official LTFRB and DOTr regulatory fare matrices.

---

## 🚀 Key Features & Architecture

### 1. Pure Function Engine
- All fare calculations and mode comparisons are powered by deterministic pure functions (`calculateFare`, `compareModes`) located in `src/lib/engine/`.
- Evaluates base fares, per-kilometer rates, distance thresholds, and mandatory 20% discounts for Students, Senior Citizens, and PWDs (under RA 9994 / RA 10931).

### 2. Zero Hardcoded Prices (Turso Data-Driven)
- No fare matrices or prices are hardcoded in the frontend or engine logic.
- All fare rules are fetched dynamically from a **Turso (LibSQL/SQLite)** database managed via Drizzle ORM.
- Admin dashboard (`/admin`) permits live updates to fare rates, base distances, and verification statuses.

### 3. Interactive Route Mapping
- Integrates **MapLibre GL JS** via `react-map-gl/maplibre` with free OpenStreetMap raster tiles.
- Dynamic interactive map centered on Metro Manila (`[120.9842, 14.5995]`) featuring automated camera bounding (`fitBounds`) and custom origin (A) and destination (B) markers.

### 4. Offline-First Map Search & Overpass API POI Extraction
- **Place Search Component**: Offline debounced autocomplete (`src/components/PlaceSearch.tsx`) querying Metro Manila & Greater Manila Area POIs (`src/data/manila-poi.json`).
- **Overpass API POI Extraction**: Script (`scripts/fetch-osm-pois.ts` / `npm run fetch-pois`) queries OpenStreetMap via Overpass API within the expanded Greater Manila Area bounding box (`[14.10, 120.80, 15.00, 121.40]`) covering Metro Manila, Cavite, Laguna, Rizal, and Bulacan for transit stations, malls, and hospitals, filtering out unnamed entries and deduplicating names.
- **Haversine Distance Engine**: Mathematical distance utility (`src/lib/distance.ts`) that automatically computes great-circle distance between chosen origin/destination coordinates and updates the fare engine's distance slider.

### 5. Community Feedback & Support Buttons
- **GitHub-Powered Feedback Widget**: Users can submit feedback or bug reports directly from the UI modal (`src/components/FeedbackWidget.tsx`). Submissions trigger `/api/feedback` to create GitHub issues using the `GITHUB_TOKEN` environment variable.
- **Buy Me a Coffee Button**: UI support component (`src/components/BuyMeCoffeeButton.tsx`) for community donations.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router) & React 19
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & Lucide Icons
- **Database & ORM**: [Turso](https://turso.tech/) (LibSQL / SQLite) & [Drizzle ORM](https://orm.drizzle.team/)
- **Mapping**: [MapLibre GL JS](https://maplibre.org/) & `react-map-gl`
- **PWA & Mobile**: PWA web manifest support & mobile-first responsive design

---

## ⚙️ Local Setup & Installation

### 1. Prerequisites
- Node.js 18+
- npm / yarn / pnpm

### 2. Clone & Install Dependencies
```bash
git clone https://github.com/casayurannick-svg/commute-ph.git
cd commute-ph
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory:

```env
# Admin authentication secret key for /admin management
ADMIN_SECRET=commuteph-secret-key-2026

# Database Configuration (Turso cloud or local SQLite file)
TURSO_DATABASE_URL=file:commute_fares.db
TURSO_AUTH_TOKEN=your_turso_auth_token_here

# GitHub Personal Access Token (for user feedback & issue creation)
GITHUB_TOKEN=your_github_personal_access_token_here
```

### 4. Database Setup & Seeding
Push the database schema using Drizzle Kit and seed initial LTFRB/DOTr fare rules:

```bash
# Push schema to database
npm run db:push

# Seed official NCR fare rules (LRT, MRT, Bus, Jeepney, UV Express, etc.)
npm run db:seed
```

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 🧪 Testing & Verification

Run the engine test suite to verify fare calculations and discount logic:

```bash
npm run test
```

---

## 📜 License

Distributed under the MIT License.
