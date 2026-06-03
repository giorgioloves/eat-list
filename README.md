# Eat List 🍽️

A shared restaurant tracker for two people. Track, rate, tier-rank, and discover restaurants together.

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS** (dark-mode first)
- **Supabase** (auth + PostgreSQL database)
- **Leaflet + react-leaflet** (interactive map, no API key needed)
- **@dnd-kit** (drag & drop tier list)
- **Recharts** (stats charts)

## Features

- **Auth** — email/password + Google OAuth
- **Shared lists** — invite partner by email or invite code
- **Restaurant CRUD** — full details: cuisine, address, status, rating, tier, tags, notes
- **Visit tracking** — visit count, first/last visit date, would-go-again
- **Restaurant list** — search, filter by status/cuisine/suburb/tier/tags, sort
- **Tier list** — drag & drop S→F ranking, saves automatically
- **Map** — OpenStreetMap (Leaflet) pins colour-coded by status, click for popup
- **Stats** — averages, top/bottom 10, cuisine breakdown charts
- **Random picker** — "What should we eat tonight?" with filters

---

## Quick Start

### 1. Clone & install

```bash
cd eat-list
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In the SQL editor, run the contents of `supabase/migrations/001_initial_schema.sql`.
3. *(Optional)* Enable email confirmation: **Authentication → Settings → Email Auth** — toggle "Confirm email" off for easier local dev.

### 3. Enable Google OAuth *(optional)*

In **Supabase Dashboard → Authentication → Providers → Google**, add your Google OAuth credentials.

### 4. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Find your Supabase URL and anon key in: **Project Settings → API**.

> The map uses **OpenStreetMap** (free, no account needed). Geocoding uses **Nominatim** (also free, no account needed).

### 6. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## App Flow

1. **Sign up** — creates a profile automatically (via database trigger)
2. **Create or join a list** — onboarding screen appears on first login
3. **Invite partner** — share the 8-character invite code from **List Settings**
4. **Add restaurants** — fill in details, address is auto-geocoded for the map
5. **Build your tier list** — drag restaurants between S→F tiers

---

## Database Schema

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles (auto-created on signup) |
| `shared_lists` | A named list with an invite code |
| `shared_list_members` | Who belongs to which list (owner/member) |
| `invitations` | Pending email invitations |
| `restaurants` | Restaurant records with all fields |
| `restaurant_visits` | Individual visit log entries |

Row Level Security is enabled on all tables. Users can only access data in lists they belong to.

---

## Seeding Data

See `supabase/seed.sql` for commented-out sample data. Uncomment and replace the placeholder UUIDs with your real `list_id` and `user_id` (found in the Supabase dashboard), then run in the SQL editor.

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login & signup pages
│   ├── (dashboard)/      # All protected pages
│   │   ├── dashboard/    # Home dashboard
│   │   ├── restaurants/  # List, add, edit, detail
│   │   ├── tiers/        # Drag & drop tier list
│   │   ├── map/          # Mapbox map
│   │   ├── stats/        # Charts & stats
│   │   ├── random/       # Random picker
│   │   └── list/         # List settings & invite
│   └── auth/callback/    # OAuth callback handler
├── components/
│   ├── ui/               # Button, Badge, Input, Select, Modal
│   ├── layout/           # Sidebar (desktop), BottomNav (mobile)
│   ├── restaurants/      # Card, Form, Filters
│   ├── tiers/            # DnD tier board
│   ├── map/              # Mapbox view
│   └── stats/            # Charts
├── lib/
│   ├── supabase/         # Client & server Supabase helpers
│   └── utils.ts          # cn(), formatDate(), geocodeAddress()
└── types/
    └── index.ts          # All TypeScript types + constants
```

---

## Deployment

Deploy to [Vercel](https://vercel.com) in one click — it's optimised for Next.js. Add your three environment variables in the Vercel project settings.
