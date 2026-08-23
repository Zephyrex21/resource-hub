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