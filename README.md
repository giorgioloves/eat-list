# Eat List 🍽️

A personal restaurant tracker. Track, rate, tier-rank, and discover restaurants.

## Tech Stack

- **Next.js 16** (App Router, Turbopack)
- **TypeScript**
- **Tailwind CSS** (dark-mode first)
- **Neon** (serverless PostgreSQL, via the `postgres` client)
- **Google Maps + Places API** (map, geocoding, place autocomplete)
- **@dnd-kit** (drag & drop tier list)
- **Recharts** (stats charts)

## Features

- **Restaurant CRUD** — full details: cuisine, address, status, rating, tier, tags, notes
- **Visit tracking** — visit count, first/last visit date, would-go-again, per-visit rating
- **Restaurant list** — search, filter by status/cuisine/suburb/tier/tags, sort
- **Tier list** — drag & drop S→F ranking, saves automatically
- **Map** — Google Maps pins colour-coded by status, click for popup
- **Stats** — averages, top/bottom 10, cuisine breakdown charts
- **Random picker** — "What should we eat tonight?" with filters
- **Dashboard** — recently visited / recently added / want-to-go-again, each expandable

---

## Recent Changes (2026-07-06)

- **Removed cost/price tracking** — the per-visit cost field is gone from the log/edit visit forms, visit history, map popups, and the stats page's spend cards. The `cost` column was dropped from `restaurant_visits`.
- **Dashboard recent sections now expand** — "recently visited," "recently added," and "want to go to again" were capped at 5 items; each now has a show more/less toggle to reveal the full list.
- **Fixed a data-consistency bug** — logging/deleting a visit recalculated the restaurant's aggregate fields (status, visit count, dates, rating) via a separate read then write, so two visit changes landing close together could lose an update and leave a restaurant's status/counts stuck out of date. This is now a single atomic statement per change.

---

## Quick Start

### 1. Clone & install

```bash
cd eat-list
npm install
```

### 2. Create a Neon database

1. Go to [neon.tech](https://neon.tech) and create a new project.
2. In the Neon SQL editor, run the contents of `scripts/schema.sql`.
3. *(Optional)* Load sample data — see `supabase/seed.sql` for reference, adjusted for the schema in `scripts/schema.sql`.

### 3. Get a Google Maps API key

Enable the **Maps JavaScript API** and **Places API** in the [Google Cloud Console](https://console.cloud.google.com), then create an API key.

### 4. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key
```

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Database Schema

| Table | Purpose |
|-------|---------|
| `restaurants` | Restaurant records with all fields (status, tier, rating, tags, etc.) |
| `restaurant_visits` | Individual visit log entries (date, rating) |
| `restaurant_notes` | Freeform notes attached to a restaurant |

No auth, no row-level security — this is a single personal list backed directly by `DATABASE_URL`. See `scripts/schema.sql` for the full definition.

---

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/      # All app pages
│   │   ├── dashboard/    # Home dashboard
│   │   ├── restaurants/  # List, add, edit, detail
│   │   ├── tiers/        # Drag & drop tier list
│   │   ├── map/          # Google Maps view
│   │   ├── stats/        # Charts & stats
│   │   └── random/       # Random picker
│   └── api/              # Route handlers (restaurants, visits, places)
├── components/
│   ├── ui/               # Button, Badge, Input, Select, Modal
│   ├── layout/           # Sidebar (desktop), BottomNav (mobile)
│   ├── restaurants/      # Card, Form, Filters
│   ├── tiers/            # DnD tier board
│   ├── map/              # Google Maps view
│   └── stats/            # Charts
├── contexts/             # Client-side restaurant data context
├── lib/
│   ├── db.ts             # Neon/postgres client
│   └── utils.ts          # cn(), formatDate(), geocodeAddress()
└── types/
    └── index.ts          # All TypeScript types + constants
```

---

## Deployment

Deploy to [Vercel](https://vercel.com) in one click — it's optimised for Next.js. Add `DATABASE_URL` and `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in the Vercel project settings.
