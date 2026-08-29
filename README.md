# Resource Hub

[![CI](https://github.com/<owner>/<repo>/actions/workflows/ci.yml/badge.svg)](https://github.com/<owner>/<repo>/actions/workflows/ci.yml)
_(Swap `<owner>/<repo>` above for your actual GitHub path once this is pushed — the badge will start resolving after the first CI run.)_

## Recent updates (Phase 6/7 — takeuforward-style redesign + Ask AI)

Everything below supersedes the design details described further down this README (those
sections are historical build notes from earlier phases — left in place, but the actual
current look/feel is described here).

- **Full visual redesign**, modeled on takeuforward.org's UI patterns:
  - Single bright orange brand accent (`#FF6B00` light / `#FF8A3D` dark) replacing the old
    purple/gold/teal three-accent system; display font swapped Space Grotesk → Poppins
  - Flat, bordered cards everywhere — the old glassmorphism (blur) and claymorphism
    (soft-shadow) look is gone, along with the canvas particle background and the hero
    illustration's floating/pulsing ambient animation (it's static now). Motion left is
    functional only: accordion expand, hover, one-time entrance
  - Notes and Tips hubs rebuilt from a 3-column card grid into **collapsible,
    subject/category-grouped row lists** — closer to a problem-sheet than a card wall
  - New green/amber/red **Easy/Medium/Hard difficulty badges** (reusing the existing Note
    `difficulty` field)
  - Favicon/app icons and the PWA manifest's theme colors updated to match (a flat orange
    "R" mark, replacing the old purple network-node graphic)
- **Real progress tracking** (`ProgressContext`, localStorage — same no-backend pattern as
  Bookmarks): a per-row "mark as done" checkbox, a per-subject/category completion bar, and
  an **Overall Progress dashboard** at the top of Notes/Tips (big %, fraction, and an
  Easy/Medium/Hard breakdown on Notes) — pulled directly from takeuforward's actual sheet
  page structure, not guessed at
- **Difficulty filter** (Notes) and **status filter** (Projects), both URL-synced
  (`?difficulty=`, `?status=`, `?subject=`, `?category=`) so filtered views are shareable/
  bookmarkable links, not just local UI state. **Random Note / Random Tip** buttons too.
- **Cross-type related-content engine** — a new `/api/v1/related/:type/:slug` endpoint scores
  every Note/Tip/Project by tag/tech-stack overlap, so a Note's "You might also like" can
  now surface a genuinely relevant Tip or Project, not just more Notes in the same subject
  (the old behavior). Added to Tip and Project detail pages too, which had nothing before.
- **Ask AI** — a floating button opens a slide-in panel for session-only Q&A grounded in
  your actual Notes/Tips/Projects (retrieval via the existing `$text` search index,
  generation via Groq's free API). Optional — disables itself cleanly with no
  `GROQ_API_KEY` set. See **[§13](#13-set-up-ask-ai-optional)** below for setup, and
  the "Worth knowing" callout there for what it can and can't actually answer.
- **Home page** expanded from hero+stats+explore into a full-length landing page: browse-
  by-subject, trending (real `viewCount` ranking), featured projects, a latest-additions
  teaser feed, a "why this hub" feature section, and a closing CTA — all built from data
  the API already exposed, nothing fabricated.
- **Foundation/tooling:** added Zustand (replaced prop-drilled command-palette state) and
  React Query (used by the new related-content/Ask-AI-adjacent features going forward;
  older pages still use the existing `useAsync` hook — not a full rewrite).
- **Backend-waking banner** — a top bar that appears if the Render free-tier backend is
  cold-starting (only shows after a genuine ~1.5s delay, so it doesn't flash on a normal
  warm visit), and disappears automatically the instant a health check succeeds. Navbar and
  page content shift down out of its way while it's showing.
- **Testing, CI, and security hardening** — 64 server tests + 20 client tests (Vitest,
  Supertest, React Testing Library), all self-contained (no real database or API keys
  needed to run them — see the "Testing" section below), a GitHub Actions CI workflow, zod
  request validation on every write endpoint, `helmet` security headers, and a real Express
  app/bootstrap split (`app.js` vs. `index.js`) so the app can actually be tested with
  supertest in the first place. Details at [Testing, CI & Security](#testing-ci--security)
  below.

## Recent updates (post-Phase 5)

- **Six new features (content/discovery + bigger-picture, not UI polish):**
  - **Project detail pages** (`/projects/:slug`) — cards now link to a full page with view count,
    tech stack, GitHub/Live buttons, and a cover image slot if you add one via the admin panel.
  - **Bookmarks/Saved** (`/bookmarks`) — a Save button on every Note/Tip/Project detail page,
    stored in `localStorage` (no login required). Grouped by type on the Saved page.
  - **Reading progress + table of contents** — Tip pages with `##`/`###` headings now get an
    auto-generated "On this page" jump-list, plus a thin progress bar pinned to the top of the
    viewport that fills as you scroll.
  - **"What's New"** (`/whats-new`) — a unified, chronological feed merging the latest Notes,
    Tips, and Projects in one place.
  - **PWA support** — the site is now installable (desktop and mobile) via `vite-plugin-pwa`,
    with a real manifest + icons and offline caching: API responses cache network-first (so
    lists/details still show something offline after a first visit), and Supabase-hosted
    files cache stale-while-revalidate (so a previously-opened PDF/DOCX stays viewable
    offline, not just its metadata).
  - **Real view-count analytics** — every Note/Tip/Project now tracks `viewCount` (separate
    from Notes' existing `downloadCount`), with a new **Analytics** tab in the admin panel
    showing top-viewed content per type.
  - All three content types got a shared `order`-aware sort where relevant (Projects), and a
    reusable `useViewTracking` hook so the view-increment logic isn't duplicated three times.
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
  - Real favicon + Open Graph/Twitter meta tags, so link previews actually look intentional when shared
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

- ✅ **Phase 0 — Foundation:** themed React client (light/dark, glass/clay, canvas particles —
  the visual specifics here were later superseded by the Phase 6 redesign; see the top of
  this README) + Express/MongoDB backend with a health check.
- ✅ **Phase 1 — Data + API:** Note, Tip, and Project models; full CRUD REST API; real seed data.
- ✅ **Phase 2 — Public pages:** Notes hub + in-browser PDF viewer, Tips hub + rendered
  Markdown with syntax highlighting, Projects grid.
- ✅ **Phase 3 — Search + Admin:** ⌘K command palette across all content, JWT admin login,
  and a full admin panel (add/edit/delete + real file upload) for Notes/Tips/Projects.
- ✅ **Phase 4 — Polish:** page transitions, card stagger animations, mobile navbar fix,
  responsive PDF viewer, WCAG contrast fixes, keyboard focus indicators, code-splitting.
  (Contrast/color specifics here predate the Phase 6 redesign's single-accent palette.)
- ✅ **Phase 5 — Deploy:** production-ready CORS/cookie config, Vercel + Render setup,
  MongoDB Atlas network access — all on free tiers, no card required anywhere.
- ✅ **Phase 6 — Redesign:** full takeuforward-style visual overhaul, real progress
  tracking, difficulty/status filters, cross-type related-content engine, expanded Home
  page. Details at the top of this README.
- ✅ **Phase 7 — Ask AI:** grounded Q&A over the hub's own content, optional
  (`GROQ_API_KEY`), free (Groq's free tier). See [§13](#13-set-up-ask-ai-optional).
- ✅ **Phase 8 — Rate limiting:** three `express-rate-limit` layers (global, Ask AI,
  login brute-force protection). See [Rate limiting](#rate-limiting).
- ✅ **Phase 9 — Testing, CI, security:** 84 tests total, GitHub Actions CI, zod
  validation on every write endpoint, `helmet` headers. See
  [Testing, CI & Security](#testing-ci--security).

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
- A flat, white/orange-accented navbar with a theme toggle (sun/moon icon, top of the page)
- A hero section with an orange "Browse Notes" button and a static illustration (no
  ambient/floating animation — motion here is limited to a one-time entrance and
  scroll-driven parallax)
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
ADMIN_PASSWORD=choose_a_password
```

That's it — no hash to generate. This is a direct plaintext comparison, deliberate for a
single-admin panel guarded by an env file that already holds equally sensitive values
(`MONGODB_URI`, `JWT_SECRET`). Restart the server after adding these.

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
building this phase — worth confirming they actually landed. (The color specifics in the
first bullet predate the Phase 6 redesign's single-orange-accent palette — the underlying
contrast fix is still in effect, just against different colors now.)

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

## 13. Set up Ask AI (optional)

The floating "Ask AI" button lets visitors ask questions and get an answer grounded in
your actual Notes/Tips/Projects — retrieval reuses the same text index that powers ⌘K
search, generation goes through Groq's API (their free tier, no card required). It's
entirely optional: leave the env var below unset and the feature disables itself cleanly
(a clear "not configured" message instead of a broken button).

1. Get a key at [console.groq.com](https://console.groq.com) — sign in, "API Keys" in the
   sidebar, create one. It starts with `gsk_`.
2. Add to `server/.env`:
   ```
   GROQ_API_KEY=gsk_...
   GROQ_MODEL=llama-3.3-70b-versatile
   ```
   (`GROQ_MODEL` is optional — defaults to `llama-3.3-70b-versatile` if unset. Check
   [console.groq.com](https://console.groq.com) for the current model lineup if you want a
   different one — Groq's free-tier model set changes over time.)
3. Restart the server. That's it — no client-side env var needed.

Worth knowing: Notes are file-based (PDF/DOCX), and only their title/description/tags/
difficulty are indexed as text — not the file's actual body content. So Ask AI can point
someone to the right note but can't answer questions about what's *inside* one. Tips have
real markdown bodies, so those answers can go deeper. It's also rate-limited — see
"Rate limiting" below for the full picture across the whole API, not just this endpoint.

## Testing, CI & Security

**Tests** — 64 server tests (Vitest + Supertest) and 20 client tests (Vitest + React
Testing Library), all self-contained: nothing requires a real MongoDB connection, a real
Groq key, or any secret at all. Run them:

```bash
cd server && npm test
cd client && npm test
```

How they avoid needing a real database:
- Pure business logic (the related-content scoring, the Ask AI context-building, the zod
  schemas, the shared CRUD controller) is tested directly as plain functions — the CRUD
  controller tests use a **mocked** Mongoose model (`vi.fn()`), not a real one.
- Route-level tests (`auth`, `ask`, `health`) hit the real Express app via `supertest`, but
  only cover endpoints/paths that don't require touching the database — login checks
  `ADMIN_EMAIL`/`ADMIN_PASSWORD` env vars directly (no DB involved at all), and the Ask
  AI tests only cover the validation/not-configured paths, which return before any DB or
  Groq call happens.
- **Not covered**: the actual Notes/Tips/Projects list/get endpoints against a real
  database, and Ask AI's full success path (real Groq call + real Mongo `$text` search).
  Testing those properly would need either a live test database or something like
  `mongodb-memory-server` — skipped here since it needs to download a MongoDB binary, which
  isn't guaranteed to work in every CI/sandboxed environment. Worth adding later if this
  grows past a personal-project scope.

**Why `app.js` exists separately from `index.js`**: `index.js` used to both configure the
Express app *and* connect to MongoDB *and* start listening, all in one file — which made it
impossible to import "just the app" for testing without also triggering a real DB
connection attempt. `app.js` now holds only the Express configuration (middleware, routes);
`index.js` is just the three-line bootstrap (`import app` → `connectDB()` → `app.listen()`).
Behavior in production is identical — this is a pure testability refactor.

**CI** — `.github/workflows/ci.yml` runs on every push/PR to `main`: the client job
type-checks, tests, and builds; the server job tests. Both install via `npm ci` (uses the
committed lockfiles) and need zero repository secrets, since the test suites don't touch
anything real.

**Security hardening**:
- **zod request validation** on every write endpoint (`POST`/`PUT` for Notes, Tips,
  Projects; login; Ask AI) — malformed requests get a specific `400` before ever reaching
  Mongoose or business logic, instead of a generic Mongoose `ValidationError` or, worse, a
  subtly-wrong document actually getting saved.
- **`helmet`** sets standard security headers (`X-Content-Type-Options`,
  `X-Frame-Options`, a conservative default CSP, etc.). Safe to use with zero tuning here
  since this is a pure JSON API with no HTML/inline scripts of its own.
- See [Rate limiting](#rate-limiting) directly below for the third piece.

## Rate limiting

Three separate limiters, all via `express-rate-limit`, all per-IP (needs `trust proxy`
set, which `server/src/index.js` already does):

- **Global** — 300 requests / 15 min across all of `/api/v1/*` (except `/health`, which
  the cold-start banner polls repeatedly and needs to stay unthrottled). Baseline abuse/DoS
  protection; generous enough that normal browsing never comes close to it.
- **Ask AI** — 10 questions / 5 min, on top of the global limit. Groq's free tier removes
  the "someone runs up your bill" risk, but an unthrottled public endpoint that triggers an
  LLM call per request is still worth capping.
- **Login** — 5 attempts / 15 min on `POST /api/v1/auth/login`. There was no brute-force
  protection on this at all before — it's the one endpoint guarding admin write access to
  the whole site.

All three return `{ "error": "..." }` with a `429` status, matching the rest of the API's
error shape, plus standard `RateLimit-*` response headers. They're in-memory (reset on
server restart, don't share state across multiple instances) — fine for a single-instance
Render deploy; swap in a Redis-backed store from `express-rate-limit`'s docs if this ever
needs to scale horizontally.

## Applying this update to your live site

Two commands to run from `server/` (against your real, deployed database — same `.env`
you're already using), needed for the Projects/GitHub update and the bulk-import feature:

```bash
npm run clean-samples   # removes the old sample notes/tips, leaves your real content alone
npm run seed             # refreshes Projects with your real GitHub repos / new `order` field
```

Then redeploy the client as usual (`git push` — Vercel picks it up automatically).

Ask AI doesn't need either of the commands above — just the `GROQ_API_KEY` env var
from §13, and a server restart. No other feature in this README needs a new env var:
bookmarks and progress tracking are pure localStorage, and PWA/view-tracking/analytics/
the redesign all run on your existing MongoDB connection.

## Testing the six new features

1. **Project detail pages:** go to `/projects`, click any card (not the GitHub/Live buttons
   specifically — the whole card is clickable) — should land on `/projects/<slug>` with a
   view count, full tech stack, and working buttons.
2. **Bookmarks:** click **Save** on a Note, Tip, or Project detail page, then visit
   `/bookmarks` (linked from the footer) — it should be there, grouped by type. Refresh the
   page — it should persist (localStorage). Click **Remove** to confirm removal works both
   from the Saved page and by toggling Save again on the original page.
3. **Reading progress + TOC:** open a Tip with multiple `##`/`###` headings in its Markdown
   (the Docker one from your seed data works) — you should see an "On this page" jump-list
   above the content, and a thin colored line at the very top of the viewport that fills in
   as you scroll.
4. **What's New:** visit `/whats-new` — should show your real notes, tips, and projects
   mixed together, most recent first, each tagged with its type.
5. **PWA:** in Chrome/Edge, look for an install icon in the address bar (or Menu → Install
   Resource Hub). After installing, open it — it should run in its own window without browser
   chrome. To test offline caching: visit a few pages while online, then go offline (DevTools
   → Network → Offline) and reload — previously-visited pages should still load from cache.
6. **View analytics:** visit a few Note/Tip/Project pages to generate views, then check
   `/admin` → **Analytics** tab — should show them ranked by view count.

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
  `ADMIN_PASSWORD` in `server/.env`, or forgot to restart the server after adding them.
- **"Invalid email or password" despite typing it correctly** — if you ever set
  `ADMIN_PASSWORD` via a shell `export`/`source` instead of letting dotenv load `.env`
  directly, avoid `$` and other shell-special characters in the password — the shell can
  silently mangle them before the app ever sees the value.

## Cost check

Everything here is free: all npm packages are open-source, MongoDB Atlas's M0 tier is free
forever, Supabase Storage's free tier needs no card, Groq's API has a genuinely free tier
(no card required), and — confirmed as of writing this phase — both Render's and Vercel's
free tiers remain genuinely free with no card required in 2026. The only caveats: Render
free services cold-start after inactivity (a top banner now tells visitors this is
happening and disappears once the backend's awake — see "Recent updates" at the top of this
README), Vercel Hobby is for non-commercial use, and Groq's free tier has its own rate
limits on their end (separate from and stricter than this project's own — see
[Rate limiting](#rate-limiting)) that can vary by model and change over time; check
[console.groq.com](https://console.groq.com) if Ask AI starts erroring under real traffic.

## What's next

All seven phases above are done — a deployed, working, first-party resource hub with a
takeuforward-style redesign and optional Ask AI. From here it's mostly about content
(bulk-import real Notes via §12, keep Projects current as you ship more) plus whatever's
listed under "Next" at the bottom of `docs/DEVELOPMENT_LOG.md` — that file tracks
day-to-day changes in more granular detail than this README does.
