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