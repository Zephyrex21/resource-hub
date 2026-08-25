# Development Log

## 2026-08-15 — Phase 0: Foundation

- Initialized full-stack project structure
- Set up React + Vite + TypeScript client
- Added Tailwind CSS and theme system
- Added particle background
- Set up Express + Mongoose backend
- Added health-check API
- Connected MongoDB
- Verified client → server → database communication

### Next
Phase 1 — Resource data models and APIs.

## 2026-08-22 — Phase 0 + first feature wave: foundation, discovery, motion

- **Phase 0 foundation**
  - Added Zustand for cross-cutting UI state (command palette open/close, recent searches) — replaces prop-drilling between RootLayout and Navbar
  - Added React Query, wired a shared `queryClient`; new data-dependent features use it going forward (existing pages keep `useAsync` for now — gradual migration, not a rewrite)
  - Expanded `motionVariants.ts` with shared spring presets (`springSnappy`/`springGentle`/`springBouncy`) so interactions across the app share one physical feel instead of ad hoc durations
- **Related-content engine**
  - New `/api/v1/related/:type/:slug` endpoint — cross-type tag/techStack overlap scoring (a Note can now surface a relevant Tip or Project, not just more Notes)
  - Replaced the old same-subject-only related section on Notes with the new `RelatedContent` component; added it to Tip and Project detail pages, which never had one
- **Visual/motion upgrade**
  - `TiltCard` — magnetic mouse-tracking 3D tilt + cursor-following glow, applied to Notes/Tips/Projects grids and related-content cards
  - `BookmarkButton` — burst-particle micro-interaction on save
  - `CodeBlock` copy button — animated checkmark morph instead of a text swap
  - `ThemeToggle` — circular-reveal transition from the button using the View Transitions API, with instant-toggle fallback for unsupported browsers and reduced-motion
  - Home hero — scroll-driven parallax (illustration drifts/fades, text drifts opposite) via `useScroll`/`useTransform`
- Added a reading-time estimate to Tips (markdown word count, code fences excluded)

### Next
Ask-AI panel over site content; magnetic effects on remaining interactive elements; consider full useAsync → React Query migration.

## 2026-08-22 — Visual redesign: takeuforward-inspired UI

Same architecture, new personality — swapped the dark-capable glassmorphism/
claymorphism look (purple accent, ambient particle background, floating
cards, magnetic tilt) for a flat, content-dense, utility-first study-tool
look modeled on takeuforward.org.

- **Palette & type**
  - Single bright orange brand accent (`#FF6B00` light / `#FF8A3D` dark) replacing the purple/gold/teal three-accent system
  - New `easy`/`medium`/`hard` color tokens (green/amber/red), reused for the existing Note `difficulty` field via a new `DifficultyBadge`
  - Display font swapped Space Grotesk → Poppins; flat bordered `.glass-card`/`.clay-card`/`.clay-btn` styles replacing blur/shadow-based glass and clay
- **Layout**
  - Notes and Tips hubs rebuilt from a 3-column card grid into collapsible, subject/category-grouped row lists (accordion sections, hairline-divided rows) — closer to a problem-sheet than a card wall
  - Projects grid and related-content cards reskinned flat (kept as a grid — projects showcase better that way than as rows)
- **Progress tracking**
  - New `ProgressContext` (localStorage-backed, same pattern as the existing Bookmarks feature — no accounts/backend needed) powers a per-row "mark as done" checkbox and a per-subject/category completion bar, plus an overall done-count on each hub page and the checkbox on Note/Tip detail headers
- **Motion**
  - Removed all ambient/looping animation: the particle background, the hero illustration's floating/pulsing/flowing-dash effects (now a static illustration), and a looping pulse dot on Home — motion is now functional only (accordion expand, hover, entrance)
  - Removed `TiltCard`'s magnetic hover effect from grids — didn't fit the flat aesthetic

### Next
Ask-AI panel over site content; consider full useAsync → React Query migration.

## 2026-08-22 — Redesign polish + full-length Home page

- **Redesign consistency pass**
  - PWA manifest `theme_color`/`background_color` and the favicon/app icons were still the old purple network-node mark — replaced with a flat orange "R" mark, regenerated all icon sizes from it
  - `WhatsNew` rows still used the old glassy hover-lift — switched to the same flat background-tint hover as the Notes/Tips rows
- **Notes/Tips filters are now URL-synced** (`useSearchParams`) — `/notes?subject=DSA` deep-links straight into a filtered, pre-scrolled list; this is what powers the new Home "Browse by subject" section
- **Home page expanded** from hero+stats+explore into a full-length landing page:
  - Browse by subject (pills linking into filtered Notes)
  - Trending right now (real `viewCount` ranking via the existing `/stats/top` endpoint, not curated)
  - Featured projects (existing `featured`/`order` fields)
  - Latest additions (teaser feed, same merge-and-sort logic as What's New, links out to the full page)
  - Why this hub (four non-vanity feature callouts — in-browser reading, progress tracking, related-content engine, offline/PWA)
  - Closing CTA banner before the footer

### Next
Ask-AI panel over site content; consider full useAsync → React Query migration; possibly extend URL-synced filters to Projects.

## 2026-08-22 — takeuforward UI parity pass

Pulled the actual DOM structure off takeuforward's live DSA sheet page (not
just screenshots) to close the remaining gaps between their sheet UI and
ours, rather than guessing at the pattern.

- **Overall Progress dashboard** (`ProgressDashboard` on Notes, `SimpleProgressSummary` on Tips) — a ring/percentage + fraction sitting above the subject/category accordion list, with an Easy/Medium/Hard breakdown on Notes (Tips has no difficulty field, so it's just the ring). Deliberately computed from the *unfiltered* full list, not whatever subject/difficulty filter is currently narrowing the accordion below — matches takeuforward's sheet-level summary staying constant while you filter the list under it
- **Difficulty filter** — new `DifficultySelect`, `?difficulty=` added as a real query param end-to-end. No server changes needed: `crudFactory`'s generic query passthrough already handled arbitrary Note fields
- **Random Note / Random Tip button** — picks from the unfiltered set and navigates straight to the detail page (mirrors their "Random Problem" button)
- **Detail page header tightened** — difficulty badge moved up next to the subject/category tag at the top of the block (title → description → tags below), instead of trailing after the tag row

Explicitly scoped out: their premium tier, video lectures, and per-problem discussion/Q&A section — none of that content exists in this hub, so it was treated as UI-pattern-only parity rather than a literal feature clone.

### Next
Ask-AI panel over site content; consider full useAsync → React Query migration; possibly extend URL-synced filters to Projects.

## 2026-08-23 — Ask AI + closing out the backlog

- **Ask AI panel** — the feature that's been sitting in "Next" since the first pass. Floating "Ask AI" button opens a slide-in panel; session-only Q&A (no persistence — resets on reload, unlike Bookmarks/Progress which are worth keeping in localStorage).
  - Backend: `POST /api/v1/ask` retrieves context via the same `$text` indexes that already power ⌘K search (no separate vector store), then asks Claude to answer grounded only in that context. Notes only expose title/description/tags/difficulty to the model (the PDF/DOCX body itself isn't indexed as text), so it can point to the right note but can't reason about what's inside one. Tips include real markdown content, so those answers can go deeper.
  - Fails closed and explains itself: no `ANTHROPIC_API_KEY` set → clear "not configured" message instead of a broken feature. Added a small in-memory per-IP rate limiter (10 req / 5 min) since this hits a paid API with no auth in front of it; added `app.set('trust proxy', 1)` so `req.ip` resolves correctly behind Render's reverse proxy instead of rate-limiting the proxy's IP for every visitor at once.
  - New env vars documented in `.env.example`: `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` (defaults to `claude-sonnet-5`).
- **Projects now has a status filter** (Active/Completed/Archived), URL-synced the same way Notes/Tips already were — the one filter-parity gap left over from the redesign pass.

### Next
Nothing currently queued — Ask AI, difficulty/status filters, and the progress dashboard were the last open items from the redesign backlog. Worth revisiting later: full useAsync → React Query migration, and whether Ask AI's answer quality on Notes improves enough to justify extracting PDF/DOCX text into the index.

## 2026-08-23 — README cleanup + backend-waking banner

- **README brought current** — added a top summary section covering everything from the redesign through Ask AI (previously only in this log), fixed a first-run checklist that still described the old glassmorphism/particle look, fixed a stale favicon description, and found/fixed a real pre-existing bug: two identically-titled "Applying this update to your live site" sections had drifted apart, and one claimed "no new env vars needed" — false since Ask AI. Merged into one accurate section.
- **Backend-waking banner** — a top bar that shows if the Render free-tier backend is cold-starting. Only appears after a genuine ~1.5s delay (so a normal warm visit never sees it flash), retries the health check on failure for up to ~80s, and disappears the instant a check succeeds — never reappears afterward, since a later mid-session network hiccup isn't the same problem this explains. Navbar and page content shift down out of its way while it's showing (`backendWaking` lives in the shared Zustand store so both can react to it), with a smooth transition rather than a jump.

### Next
Nothing currently queued.

## 2026-08-23 — Ask AI provider swap (Anthropic → Groq) + rate-limiting hardening

- **Ask AI now runs on Groq** instead of the Claude API — same retrieval/grounding logic (unchanged), different generation call: Groq's endpoint is OpenAI-compatible (`/openai/v1/chat/completions`, `Authorization: Bearer`, `choices[0].message.content`) rather than Anthropic's Messages API shape, so `askController.js`'s API call was rewritten, not just re-pointed. Env vars renamed `ANTHROPIC_API_KEY`/`ANTHROPIC_MODEL` → `GROQ_API_KEY`/`GROQ_MODEL` (default `llama-3.3-70b-versatile`) across `.env.example`, the controller, and the README. The practical upshot: Groq has a genuinely free tier, so Ask AI is no longer the one paid-API exception in the Cost check section — that section got rewritten accordingly, and now flags Groq's *own* rate limits (separate from and stricter than this project's) as the thing to watch instead.
- **Rate limiting overhauled** — replaced the original hand-rolled in-memory Map-based limiter (which only covered `/ask`) with three `express-rate-limit` layers in a new `middleware/rateLimiters.js`:
  - `apiLimiter` — 300 req/15min across all of `/api/v1/*` except `/health` (which the wake-up banner polls repeatedly and needs to stay unthrottled)
  - `askLimiter` — 10 req/5min on top of the global limit, same cap as before but via the proper library instead of a first-pass implementation
  - `authLimiter` — 5 attempts/15min on `POST /api/v1/auth/login`, which had **zero** brute-force protection before this — genuinely new coverage, not a like-for-like swap
  - All three return the app's existing `{ error: "..." }` shape via a custom `handler`, and rely on the `trust proxy` setting (already added for the wake-up banner work) to read real client IPs behind Render's proxy.
- README: new "Rate limiting" section documenting all three layers, §13 rewritten for Groq setup, Phase 7/8 split out in the Progress list (Ask AI vs. rate limiting as separate, individually-checkmarked phases).

### Next
Nothing currently queued.

## 2026-08-24 — Testing, CI, and security hardening (Tier 1, minus Docker)

- **Split `index.js` → `app.js` + `index.js`** — the Express app config (middleware, routes) now lives in `app.js`, importable on its own; `index.js` is just `import app` → `connectDB()` → `app.listen()`. Pure testability refactor, zero behavior change — needed so tests could hit the app with `supertest` without also triggering a real MongoDB connection attempt.
- **84 tests added** (64 server / Vitest + Supertest, 20 client / Vitest + React Testing Library), all self-contained — no real database, no real Groq key, no secrets needed to run any of them:
  - Server: pure-function unit tests for the related-content scoring, Ask AI context-building, and every zod schema; a full mocked-model unit test suite for `crudFactory` (the shared controller backing Notes/Tips/Projects); route-level integration tests via supertest for login (success/failure/validation), the login rate limiter (proves the 6th rapid attempt actually gets blocked), Ask AI's validation/not-configured paths, and health.
  - Client: unit tests for `readingTime` and `buildQuery`; component tests for `DifficultyBadge`; a real localStorage integration test for `ProgressCheckbox` + `ProgressContext` (not mocked — actually writes to and reads from `window.localStorage`).
  - **Two real bugs caught in the process**, not just "tests that pass": (1) `tipUpdateSchema` was rejecting every partial update that didn't explicitly touch `contentMarkdown`/`fileUrl`, because those fields' `.default('')` was silently filling them in even when the caller never sent them — fixed by dropping the zod-level default and letting Mongoose's own model defaults handle the create-time case instead. (2) The client test setup didn't clean up the DOM between tests (this project runs Vitest with `globals: false`, so React Testing Library's usual auto-cleanup-via-global-afterEach never registered) — fixed with an explicit `afterEach(cleanup)` in the setup file.
  - **Deliberately not covered**: the CRUD list/get endpoints against a real database, and Ask AI's full success path (real Groq call + real `$text` search) — would need a live test DB or `mongodb-memory-server` (skipped: needs to download a MongoDB binary, not guaranteed to work in every sandboxed/CI environment).
- **CI** — new `.github/workflows/ci.yml`: client job (typecheck + test + build), server job (test), both on push/PR to `main`, both via `npm ci` against the committed lockfiles, neither needing any repository secrets.
- **zod request validation** on every write endpoint — Notes/Tips/Projects create+update, login, Ask AI. New `middleware/validate.js` (generic, schema-agnostic) + `schemas/` (one file per resource, mirroring the existing `models/` convention). Malformed requests now get a specific `400` before ever reaching Mongoose, instead of a generic `ValidationError` — or, worse, a subtly-wrong document actually saving.
- **`helmet`** added to `app.js` for standard security headers — safe with zero config tuning since this is a pure JSON API with no HTML/inline scripts of its own.
- README: new "Testing, CI & Security" section, Phase 9 added to Progress, a CI badge (placeholder `<owner>/<repo>` — needs the real GitHub path swapped in once pushed).

Explicitly out of scope for this pass (per instruction): Docker/docker-compose.

### Next
Docker + docker-compose (deferred, not declined). Beyond that: DB-backed integration tests (`mongodb-memory-server` or a CI-only test database), Ask AI's full success-path test coverage, and the longer-standing items — full useAsync → React Query migration, PDF/DOCX text extraction for deeper Ask AI answers on Notes.