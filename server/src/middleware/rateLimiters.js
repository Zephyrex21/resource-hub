import rateLimit from 'express-rate-limit'

function jsonHandler(message) {
  return (req, res) => res.status(429).json({ error: message })
}

// Baseline abuse/DoS protection across the whole API. Generous on purpose —
// a single page load can fire off several requests at once (notes/meta/
// related-content/etc.), and this is meant to catch scripted abuse, not
// normal browsing. Requires `app.set('trust proxy', 1)` (already set in
// index.js) so it reads the real client IP behind Render's reverse proxy
// instead of rate-limiting every visitor as one IP.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler('Too many requests — please slow down and try again shortly.'),
})

// Ask AI hits a paid API with no auth in front of it, so it gets a much
// tighter cap on top of the global one above. Replaces the old hand-rolled
// in-memory Map-based limiter that used to live inside askController.js —
// same idea, but express-rate-limit handles IP extraction, headers, and
// edge cases more correctly than a first pass at it did.
export const askLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler('Too many questions in a short time — try again in a few minutes.'),
})

// Login had zero brute-force protection before this — anyone could hammer
// POST /api/v1/auth/login as fast as the network allowed. Scoped tightly
// (5 attempts / 15 min per IP) since this is the one endpoint guarding
// admin write access to the whole site.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler('Too many login attempts — please wait a few minutes and try again.'),
})

// A SEPARATE instance (not the same object as authLimiter) for regular
// user-account register/login. express-rate-limit's default store is an
// in-memory counter per limiter *instance*, keyed by IP — reusing
// authLimiter here would mean admin login and account signup/login share
// one combined 5-request budget per IP. In practice that means testing
// the account signup flow a few times (entirely normal, expected traffic)
// can silently exhaust the shared budget and then reject a subsequent
// *correct* admin login with 429, which looks exactly like "login is
// broken" despite the admin credentials being fine the whole time — this
// is not a hypothetical, it was reproduced while building this. Same
// limits, independent counters, because these are two unrelated systems.
export const accountAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler('Too many attempts — please wait a few minutes and try again.'),
})
