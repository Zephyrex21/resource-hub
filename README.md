# Resource Hub

## Progress

- ✅ **Phase 0 — Foundation:** themed React client (light/dark, glass/clay, canvas particles) +
  Express/MongoDB backend with a health check.
- ✅ **Phase 1 — Data + API:** Note, Tip, and Project models; full CRUD REST API; real seed data.
- ✅ **Phase 2 — Public pages:** Notes hub + in-browser PDF viewer, Tips hub + rendered
  Markdown with syntax highlighting, Projects grid.
- ✅ **Phase 3 — Search + Admin:** ⌘K command palette across all content, JWT admin login,
  and a full admin panel (add/edit/delete + real file upload) for Notes/Tips/Projects.
- ⏳ **Phase 4 — up next:** polish pass — motion, empty states, responsive + accessibility QA.

## What's in the project so far

- `client/` — React + Vite + TypeScript + Tailwind
  - Theme system (light/dark, glass/clay), canvas particle background
  - Public pages: `/`, `/notes` + `/notes/:slug`, `/tips` + `/tips/:slug`, `/projects`
  - `/admin/login` and protected `/admin` — add/edit/delete Notes, Tips, and Projects, with
    file upload or paste-a-URL for Notes/Tips
  - ⌘K (or Ctrl+K) opens a global search palette across all three content types
- `server/` — Express + Mongoose:
  - `/api/v1/health`, `/notes`, `/tips`, `/projects`, `/meta` (from earlier phases)
  - `/api/v1/auth/login`, `/logout`, `/me` — JWT session via httpOnly cookie
  - `/api/v1/upload` — protected file upload (Supabase Storage)
  - `/api/v1/search?q=` — combined text search across Notes/Tips/Projects
  - `POST`/`PUT`/`DELETE` on notes/tips/projects now require admin auth

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

## 7. Set up admin access (Phase 3)

Add these to `server/.env`:

```bash
JWT_SECRET=any-long-random-string-you-make-up
ADMIN_EMAIL=you@example.com
```

Then generate your password hash — from `server/`:

```bash
npm run hash-password -- "yourChosenPassword"
```

Copy the printed `ADMIN_PASSWORD_HASH=...` line into `server/.env`, then restart the server.

**Optional — real file uploads.** By default the admin panel's "Upload file" mode will show a
clear error ("File storage is not configured…") until you connect free storage. "Paste URL"
mode works either way, so you can skip this and come back to it later:

1. Create a free project at [supabase.com](https://supabase.com/dashboard) (no card required).
2. In your project, go to **Storage** → create a new bucket (e.g. `resource-hub-files`) and
   mark it **Public**.
3. Go to **Project Settings → API**, copy the **Project URL** and the **service_role** key.
4. Add to `server/.env`:
   ```bash
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   SUPABASE_BUCKET=resource-hub-files
   ```
5. Restart the server. "Upload file" mode in the admin panel will now work.

## 8. Test the admin panel

1. Go to `http://localhost:5173/admin` — you should be redirected to `/admin/login` (this
   proves the route is actually protected, not just hidden from the nav).
2. Log in with the email/password you set above.
3. Try each tab (Notes / Tips / Projects): add a test item, confirm it appears in the list on
   the right, edit it, then delete it. Each action should update the list immediately.
4. Go to `/notes` in a normal (non-admin) tab and confirm a newly added note actually shows up
   there — proves the public pages and admin panel share the same database, not separate data.
5. Log out from the admin panel, then try visiting `/admin` directly again — you should be
   bounced back to the login page.

## 9. Test global search

From any page, press **⌘K** (Mac) or **Ctrl+K** (Windows/Linux), or click the **Search** pill
in the navbar. Type "docker" — you should see the Docker tip appear under a "Tips" group.
Type "dbms" — the DBMS note should appear under "Notes". Click a result to navigate straight
to it, and confirm **Esc** closes the palette.

## Troubleshooting

- **Status pill says "Backend offline"** — make sure the server is running on port 5000 and
  that `client/.env`'s `VITE_API_URL` matches (`http://localhost:5000/api/v1`).
- **Server logs a MongoDB connection error** — double check the username/password in your
  connection string (special characters in the password need to be URL-encoded), and confirm
  your IP is allowed under Network Access in Atlas.
- **CORS error in the browser console** — confirm `server/.env`'s `CLIENT_ORIGIN` matches the
  client's actual URL (`http://localhost:5173` by default).
- **Logged in but immediately bounced back to `/admin/login`** — check that `JWT_SECRET` is
  set in `server/.env` and that you restarted the server after editing it.
- **"Admin credentials are not configured" on login** — you're missing `ADMIN_EMAIL` or
  `ADMIN_PASSWORD_HASH` in `server/.env`, or forgot to restart the server after adding them.

## Cost check

Everything here is free: Vite/React/Tailwind/Express/Mongoose/bcryptjs/jsonwebtoken/multer are
open-source npm packages, MongoDB Atlas's M0 tier is free forever, and Supabase Storage's free
tier (1GB storage) needs no credit card. No paid services anywhere.

## Next: Phase 4

A polish pass: Framer Motion transitions between pages, better empty/loading states, a full
responsive pass on mobile, and an accessibility check (contrast, focus states, reduced motion)
across both themes.
