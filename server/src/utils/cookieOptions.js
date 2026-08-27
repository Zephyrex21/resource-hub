const isProduction = process.env.NODE_ENV === 'production'

// Shared between the admin session cookie and the user-account session
// cookie. In dev, client and server share a site (different localhost
// ports) so 'lax' works fine. In production they're on different domains
// entirely (e.g. vercel.app + onrender.com), which requires 'none' — and
// browsers only accept sameSite:'none' when secure:true (HTTPS), which
// both Vercel and Render provide by default.
export function buildCookieOptions(maxAgeMs) {
  return {
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction,
    maxAge: maxAgeMs,
  }
}
