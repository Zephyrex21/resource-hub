# Resource Hub

## Progress

- ✅ **Phase 0 — Foundation:** themed React client (light/dark, glass/clay, canvas particles) +
  Express/MongoDB backend with a health check.
- ✅ **Phase 1 — Data + API:** Note, Tip, and Project models; full CRUD REST API; real seed data.
- ✅ **Phase 2 — Public pages:** Notes hub + in-browser PDF viewer, Tips hub + rendered
  Markdown with syntax highlighting, Projects grid.
- ⏳ **Phase 3 — up next:** global (⌘K) search across all content types + protected admin
  upload panel.

## What's in the project so far

- `client/` — React + Vite + TypeScript + Tailwind
  - Theme system (light/dark, glass/clay), canvas particle background
  - Pages: `/` (home), `/notes` + `/notes/:slug` (with PDF viewer), `/tips` + `/tips/:slug`
    (with rendered Markdown), `/projects`
  - `public/sample-note.pdf` — a local test PDF the first seeded note points to, so the
    viewer is testable without needing real file storage yet
- `server/` — Express + Mongoose:
  - `/api/v1/health` — status + DB connection check
  - `/api/v1/notes`, `/api/v1/tips`, `/api/v1/projects` — full CRUD + filtering + search
  - `/api/v1/meta` — taxonomy (subjects/categories/statuses) for building filter UIs
  - `npm run seed` — populates the DB with real starter content

**Note on write routes:** `POST` / `PUT` / `DELETE` are open (no auth) for now — that's
intentional, Phase 3 adds the protected admin panel. Don't deploy this publicly as-is yet.

## Prerequisites

- [Node.js](https://nodejs.org) 18 or newer (`node -v` to check)
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) account (no credit card
  needed for the free M0 tier)

## 1. Set up a free MongoDB Atlas cluster

1. Create an account at mongodb.com/cloud/atlas and create a new project.
2. Build a database → choose the **M0 Free** tier → pick any region close to you.
3. Under **Database Access**, create a database user with a username/password (save these).
4. Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere) for local dev —
   you can restrict this later once the app is deployed.
5. Click **Connect → Drivers**, copy the connection string. It looks like:
   `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
6. Add a database name to it, e.g. append `resource-hub` before the `?`:
   `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/resource-hub?retryWrites=true&w=majority`

## 2. Run the server

```bash
cd server
npm install
cp .env.example .env
```

Open `.env` and paste your MongoDB Atlas connection string into `MONGODB_URI`.

```bash
npm run dev
```

You should see:
```
[db] MongoDB connected
[server] Running on http://localhost:5000
```

Visit `http://localhost:5000/api/v1/health` in your browser — you should get:
```json
{ "status": "ok", "db": "connected", "timestamp": "..." }
```

## 3. Run the client

In a **new terminal**:

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173`. You should see:
- A glass navbar with a theme toggle (sun/moon icon, top of the page)
- A canvas particle background (subtle moving dots/lines behind everything)
- A clay-styled hero card
- A status pill reading **"Backend connected · DB: connected"** — this confirms the full
  client → server → database chain is working

Click the theme toggle to confirm dark/light both render correctly and persist on refresh.

## 4. Seed the database (Phase 1)

With the server's `.env` already pointing at your Atlas cluster, run this **once** from the
`server/` folder:

```bash
npm run seed
```

You should see:
```
[db] MongoDB connected
[seed] Inserted 4 notes, 2 tips, 6 projects
```

This wipes and repopulates the `notes`, `tips`, and `projects` collections every time you run
it — safe to re-run whenever you want a clean slate.

## 5. Test the API

With the server running (`npm run dev`), try these in your browser or with `curl`:

```bash
# List everything
curl http://localhost:5000/api/v1/notes
curl http://localhost:5000/api/v1/tips
curl http://localhost:5000/api/v1/projects

# Filter
curl "http://localhost:5000/api/v1/notes?subject=DBMS"
curl "http://localhost:5000/api/v1/projects?featured=true"

# Full-text search
curl "http://localhost:5000/api/v1/notes?search=deadlock"

# Get one by slug
curl http://localhost:5000/api/v1/projects/vision-interpretability-studio

# Taxonomy for building filter dropdowns later
curl http://localhost:5000/api/v1/meta
```

Each should return JSON. `GET /api/v1/notes` should return your 4 seeded notes,
`/api/v1/projects` your 6 real projects, and so on.

**Create/update/delete example** (no auth required yet — Phase 3 locks this down):
```bash
curl -X POST http://localhost:5000/api/v1/tips \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Tip","category":"Git","summary":"a test","contentMarkdown":"## hi"}'
```
You should get back `201` with the created tip, including an auto-generated `slug`.

## 6. Walk through the actual pages (Phase 2)

With both `server` (seeded) and `client` running:

1. Open `http://localhost:5173` — Home now shows three link cards (Notes / Tips / Projects),
   each in its own accent color.
2. **Notes** (`/notes`) — you should see 4 note cards with subject filter chips at the top.
   Click **DBMS Fundamentals** — this one has a real local PDF wired up, so you should see an
   actual in-browser PDF preview (2 pages, with Prev/Next controls), not just a download link.
   The other 3 notes will show "Preview isn't available" (expected — they still point at
   placeholder URLs until you upload real files in Phase 3) but the **Download** button, tags,
   and difficulty badge should all render correctly.
3. **Tips** (`/tips`) — click **Install & Configure Docker on Ubuntu**. You should see properly
   rendered Markdown with dark, syntax-highlighted code blocks (not raw `##` symbols or
   unstyled text).
4. **Projects** (`/projects`) — all 6 of your real projects should appear, each with a working
   **GitHub** button; only the ones with a live URL (Vision Interpretability Studio,
   AllowOrigin) should show a **Live** button.
5. Toggle dark/light from the navbar and re-check all four pages — this is a good moment to
   catch any low-contrast text before it becomes a habit.

## Troubleshooting

- **Status pill says "Backend offline"** — make sure the server is running on port 5000 and
  that `client/.env`'s `VITE_API_URL` matches (`http://localhost:5000/api/v1`).
- **Server logs a MongoDB connection error** — double check the username/password in your
  connection string (special characters in the password need to be URL-encoded), and confirm
  your IP is allowed under Network Access in Atlas.
- **CORS error in the browser console** — confirm `server/.env`'s `CLIENT_ORIGIN` matches the
  client's actual URL (`http://localhost:5173` by default).

## Cost check

Everything here is free: Vite/React/Tailwind/Express/Mongoose are open-source npm packages,
and MongoDB Atlas's M0 tier is free forever (512MB storage, no card required). No paid
services are used anywhere so far.

## Next: Phase 3

Global ⌘K search across Notes/Tips/Projects at once, and a protected `/admin` panel (JWT
login) so you can add real content — including real file uploads — through a form instead of
editing the seed script by hand.
