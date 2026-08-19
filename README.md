# Resource Hub

## Recent updates (post-Phase 5)

- **Real Projects from GitHub, with explicit priority ordering:**
  - Replaced the seed script's Projects with 6 verified repos from
    github.com/Zephyrex21 — Vision Interpretability Studio and Urban Heat
    Mitigation first (the AI/ML-heaviest work), then AllowOrigin, then the
    utility/educational projects.
  - Added a real `order` field to the Project schema (lower = shown first) —
    `featured` alone couldn't express an exact ranking. Editable per-project
    in the admin panel now too.
  - **Note:** GitHub blocks automated scraping of the full repositories tab,
    so only repos already known or linked from your pinned/README section
    could be verified. If you have other repos (e.g. a RAG assistant or
    data-analyst project) you want included, just add them via `/admin` —
    `order: 0` puts something at the very top instantly.
- **`npm run seed` no longer touches Notes or Tips** — it used to wipe *all*
  notes/tips and reinsert 4 sample notes + 2 sample tips every time it ran,
  which would have deleted your real imported content on a re-seed. It now
  only manages Projects.
- **New: `npm run clean-samples`** — removes exactly the old placeholder
  sample notes/tips (by their known slugs) from a database that already has
  them from an earlier seed run, without touching anything you've added
  yourself. Safe to run more than once.
- **Unified file preview, and a real bug fix:**
  - Extracted the PDF viewer into a shared `<FilePreview>` component and **added .docx preview**
    (via `docx-preview`, rendered fully client-side — no server round-trip) for both Notes
    and Tips. Previously only PDFs previewed; DOCX just showed a download link.
  - **Tips now preview their attached files too** — previously a Tip with a `fileUrl` only
    ever showed a bare download button, even for PDFs.
  - **Fixed a real blank-preview bug:** `<Page>` (react-pdf) does its own async canvas render
    *after* the document's page count is already known, so there was a visible gap where the
    page navigation showed ("Page 1 of 20") but the canvas hadn't painted yet — a blank white
    box. Added a `loading` state directly on `<Page>` to close that gap.
  - File type is now detected from the URL extension rather than trusting the stored
    `fileType` field, so preview stays correct even if that field and the actual file
    ever mismatch.
  - `docx-preview` is dynamically imported only when an actual `.docx` is being viewed —
    doesn't add weight to PDF views (which, right now, is 100% of your real content).
- **New features, not just polish:**
  - **About page** (`/about`) — was in the original blueprint's route list but never actually
    got built. Real bio, tech stack, and a "how it's put together" section.
  - **Global error boundary** — an unexpected render error now shows a "Something went
    wrong, reload" screen instead of a blank white page.
  - **Working download tracking** — the `downloadCount` field has existed on the Note schema
    since Phase 1 but nothing ever incremented it. `POST /api/v1/notes/:slug/download` now
    does, and the count shows next to the download button (optimistic UI — updates instantly,
    syncs with the server in the background).
  - **Share button** — copies the current page URL, on both Note and Tip detail pages.
- **Finishing-touch polish:**
  - Real favicon (matches the hero illustration's three-node motif) + Open Graph/Twitter
    meta tags, so link previews actually look intentional when shared
  - Per-page browser tab titles (e.g. "DBMS Fundamentals · Resource Hub" instead of
    "Resource Hub" everywhere)
  - Skeleton loading cards on Notes/Tips/Projects instead of a generic spinner — previews
    the layout while data loads
  - Toast notifications for admin actions (add/edit/delete/login) instead of silent updates
  - Copy-to-clipboard button on Tip code blocks (hover to reveal)
  - "More in [subject]" related-notes section on the Note detail page
  - Zoom controls (70%–200%) on the PDF viewer — useful for the denser infographic-style
    notes
- **Bulk note import tool** — `npm run import-notes` uploads a folder of local
  files to Supabase Storage and creates their Note records in one command,
  instead of manually using the admin panel for each file. Comes pre-loaded
  with 5 real notes (Docker, LLM Fundamentals, LLM Security, RAG/CAG/MAG,
  React) in `server/import/`. A `--dry-run` mode validates everything
  (file reads, schema, slugs) without touching Supabase or the database —
  useful for checking a new batch before committing to the real upload.
- **Shorter note subjects** — `Operating Systems` → `OS`, `Web Dev (MERN)` → `Web Dev`,
  `AI/ML` → separate `AI` and `ML` tags, `LLMs & RAG` → `LLMs`, `CS Electives` → `Electives`.
  Fixes the filter-chip row wrapping to two lines. **Re-run `npm run seed`** after pulling
  this — the old subject strings no longer match the schema's enum.
- **Homepage redesign** — a real two-column hero (headline + CTA buttons on the left, an
  original SVG illustration on the right showing the three connected Notes/Tips/Projects
  cards), a real stats strip pulled from `/api/v1/stats` (actual counts, not made-up
  numbers), and scroll-reveal animation on the sections below the fold as you scroll down.
- **Richer footer** — quick links, real social icons (GitHub/LinkedIn/LeetCode/Instagram),
  and a copyright line, replacing the old one-line credit text.
- New `/api/v1/stats` endpoint (`{ notes, tips, projects }` counts) powering the homepage.

## Progress

- ✅ **Phase 0 — Foundation:** themed React client (light/dark, glass/clay, canvas particles) +
  Express/MongoDB backend with a health check.
- ✅ **Phase 1 — Data + API:** Note, Tip, and Project models; full CRUD REST API; real seed data.
- ✅ **Phase 2 — Public pages:** Notes hub + in-browser PDF viewer, Tips hub + rendered
  Markdown with syntax highlighting, Projects grid.
- ✅ **Phase 3 — Search + Admin:** ⌘K command palette across all content, JWT admin login,
  and a full admin panel (add/edit/delete + real file upload) for Notes/Tips/Projects.
- ✅ **Phase 4 — Polish:** page transitions, card stagger animations, mobile navbar fix,
  responsive PDF viewer, WCAG contrast fixes, keyboard focus indicators, code-splitting.
- ✅ **Phase 5 — Deploy:** production-ready CORS/cookie config, Vercel + Render setup,
  MongoDB Atlas network access — all on free tiers, no card required anywhere.

## What's in the project so far

- `client/` — React + Vite + TypeScript + Tailwind (see Phases 0–4 above for details)
  - `vercel.json` — SPA rewrite so client-side routing works on Vercel
- `server/` — Express + Mongoose (see Phases 0–3 above for details)
  - CORS now supports a comma-separated `CLIENT_ORIGIN` list (prod + local at once)
  - Admin session cookie automatically switches to `sameSite:none; secure:true` when
    `NODE_ENV=production`, required once client and server live on different domains
- `render.yaml` — optional one-click Render Blueprint for the API (manual dashboard setup
  is documented too, and is the simpler path if this is your first deploy)

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

## 10. Check the polish pass (Phase 4)

A few specific things to verify, since these were real issues I found and fixed while
building this phase — worth confirming they actually landed:

- **Contrast:** the Tips (amber) and Projects (teal) tag colors are noticeably darker/more
  muted in light mode than earlier phases. That's intentional — the original bright versions
  failed WCAG AA contrast as text (as low as 1.88:1 against the background, well under the
  4.5:1 minimum). Dark mode was already fine and is unchanged.
- **Keyboard navigation:** click into the page first, then **Tab** through the Notes hub
  (search box → filter chips → cards). Every focused element should show a clearly visible
  outline — inputs and glass/clay buttons previously had no visible focus ring at all.
- **Mobile width:** resize the browser to ~375px wide (or open dev tools' device toolbar).
  The navbar should stay on one line without overlapping — search collapses to an icon-only
  button below the `sm` breakpoint.
- **PDF viewer on narrow screens:** open the DBMS note at a narrow width — the PDF page should
  resize to fit the screen instead of overflowing horizontally (it was previously a fixed
  640px regardless of viewport).
- **Motion:** navigating between pages should have a subtle fade/slide; note/tip/project cards
  should animate in with a slight stagger on load. If your OS has "reduce motion" turned on,
  all of this should be instant instead — that's automatic, not a bug.
- **Bundle size:** the Notes/Tips detail pages and the admin panel are now code-split, so
  `npm run build` no longer warns about an oversized main bundle.

## 11. Deploy for real (Phase 5)

Both platforms below have genuine free tiers with no credit card required — I checked their
current 2026 pricing before writing this. Two things worth knowing going in:

- **Render's free web service sleeps after 15 minutes of inactivity.** The first request
  after a quiet period takes 30–60 seconds to wake up. That's normal, not broken — refresh
  and it'll load fully within a minute.
- **Vercel's free Hobby tier is personal/non-commercial use only.** Fine for a portfolio
  project like this; if you ever monetize it, you'd need to upgrade.

You'll need this pushed to a GitHub repo first, since both platforms deploy from Git.

### A. MongoDB Atlas (already done in Phase 0)

Nothing new here — your existing free M0 cluster works as-is. Just confirm Network Access
still has `0.0.0.0/0` allowed, since Render's free tier doesn't offer a static outbound IP
you could whitelist more narrowly instead.

### B. Deploy the API to Render

1. Go to [render.com](https://render.com), sign up (no card needed), connect your GitHub.
2. **New → Web Service** → pick this repo.
3. Set **Root Directory** to `server`.
4. Runtime: **Node**. Build command: `npm install`. Start command: `npm start`.
5. Instance type: **Free**.
6. Add every environment variable from `server/.env.example` under **Environment** — same
   values as your local `.env`, plus:
   ```
   NODE_ENV=production
   ```
   (Leave `CLIENT_ORIGIN` for a moment — you'll set it after step C, once you know your
   Vercel URL.)
7. Deploy. Once live, note the URL Render gives you (e.g. `https://resource-hub-api.onrender.com`).
8. Confirm it works: visit `https://your-render-url.onrender.com/api/v1/health` — you should
   see the same JSON you saw locally.

*(Alternative: `render.yaml` in the repo root lets you do this as one Blueprint deploy instead
of the manual steps above — see the comment at the top of that file.)*

### C. Deploy the client to Vercel

1. Go to [vercel.com](https://vercel.com), sign up (no card needed), import this repo.
2. Set **Root Directory** to `client`. Framework preset should auto-detect as **Vite**.
3. Add an environment variable:
   ```
   VITE_API_URL=https://your-render-url.onrender.com/api/v1
   ```
   (your actual Render URL from step B, plus `/api/v1`)
4. Deploy. Vercel gives you a URL like `https://your-app.vercel.app`.

### D. Connect them

Back in Render, set the `CLIENT_ORIGIN` env var to your actual Vercel URL:
```
CLIENT_ORIGIN=https://your-app.vercel.app
```
Save — Render will redeploy automatically. This is the step people most often forget, and
it's the one that makes login/admin work at all in production (CORS blocks everything until
this matches exactly, including `https://` and no trailing slash).

### E. Full production smoke test

Repeat the same checklist from sections 6, 8, and 9 above, but against your live Vercel URL
instead of localhost:
- All four public pages render with real data
- The DBMS note's PDF viewer works (⚠️ it's still pointed at `localhost:5173/sample-note.pdf`
  from the seed script — re-seed with a real Supabase-hosted file, or add a new note through
  the admin panel, once you're live)
- ⌘K search works
- `/admin/login` → log in → add/edit/delete an item → confirm it shows on the public page
- Log out, try `/admin` directly, confirm you're bounced to login
- Check the browser console for CORS or cookie errors — if login succeeds but `/admin`
  immediately kicks you back to login, it's almost always the `CLIENT_ORIGIN` mismatch from
  step D.

## 12. Bulk-import real notes

For adding several notes at once (rather than one-by-one through the admin panel):

1. Drop your files into `server/import/files/`.
2. Add one entry per file to `server/import/manifest.json`:
   ```json
   {
     "file": "my-notes.pdf",
     "title": "My Notes Title",
     "subject": "DSA",
     "tags": ["dsa", "arrays"],
     "description": "One or two sentences describing what's in it.",
     "difficulty": "beginner"
   }
   ```
   `subject` must exactly match one of the values from `GET /api/v1/meta` (`DSA`, `DBMS`,
   `OS`, `Web Dev`, `AI`, `ML`, `LLMs`, `System Design`, `DevOps`, `Electives`).
3. Sanity-check it first, with no risk to your real data:
   ```bash
   npm run import-notes:dry-run
   ```
   This reads every file and validates every manifest entry against the real schema —
   catches typos in `subject`, missing fields, etc. — without uploading anything or
   touching the database.
4. Once that's clean, run it for real:
   ```bash
   npm run import-notes
   ```

This repo already includes 5 real notes in `server/import/files/` + a filled-in
`manifest.json` — Docker fundamentals, LLM engineering/inference, LLM security issues,
a RAG vs CAG vs MAG comparison, and a full React beginner-to-advanced set. Run the two
commands above and they'll appear on `/notes` for real, PDF viewer and all.

## Applying this update to your live site

Two commands to run from `server/` (against your real, deployed database —
same `.env` you're already using):

```bash
npm run clean-samples   # removes the old sample notes/tips, leaves your real content alone
npm run seed             # refreshes Projects with your real GitHub repos
```

Then redeploy the client as usual (`git push` — Vercel picks it up automatically).

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

Everything here is free: all npm packages are open-source, MongoDB Atlas's M0 tier is free
forever, Supabase Storage's free tier needs no card, and — confirmed as of writing this
phase — both Render's and Vercel's free tiers remain genuinely free with no card required in
2026. The only caveats: Render free services cold-start after inactivity, and Vercel Hobby is
for non-commercial use.

## What's next

All five planned phases are done — you have a deployed, working, first-party resource hub.
From here it's about content: adding real Notes/Tips (swap the seed data's placeholder URLs
for real uploads via the admin panel) and keeping the Projects list current as you ship more.
