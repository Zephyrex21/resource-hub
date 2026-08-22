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