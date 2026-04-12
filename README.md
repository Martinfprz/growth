# Growth

Personal productivity app — planner, expense tracker, health habits, and notes in one place.

## Stack

- **Vanilla HTML / CSS / JS** — no frameworks, no build step
- **Material Design 3** (MD3) light theme with Roboto
- **Supabase** for persistence (tasks, expenses, habits, notes)
- **Mobile-first** — optimized for phone (max-width 448px)

## Files

| File | Description |
|------|-------------|
| `index.html` | Single-page app structure |
| `styles.css` | MD3 design tokens + all component styles |
| `app.js` | App logic, rendering, state management |
| `supabase.js` | Supabase client + CRUD operations |
| `schema.sql` | Database table definitions |

## Setup

1. Create a [Supabase](https://supabase.com) project
2. Run `schema.sql` in the Supabase SQL Editor
3. Update `SUPABASE_URL` and `SUPABASE_ANON` in `supabase.js`
4. Open `index.html` in a browser or deploy to Vercel

## Deploy

Push to GitHub, connect to [Vercel](https://vercel.com) — it deploys as a static site automatically (configured via `vercel.json`).
