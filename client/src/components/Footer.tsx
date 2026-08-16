import { Link } from 'react-router-dom'

const quickLinks = [
  { to: '/notes', label: 'Notes' },
  { to: '/tips', label: 'Tips & Tricks' },
  { to: '/projects', label: 'Projects' },
]

const socials = [
  {
    href: 'https://github.com/Zephyrex21',
    label: 'GitHub',
    path: 'M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.5v-1.94c-2.78.62-3.37-1.36-3.37-1.36-.46-1.2-1.11-1.53-1.11-1.53-.91-.64.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.9 1.57 2.34 1.12 2.91.86.09-.67.35-1.12.64-1.38-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.73 0 0 .84-.28 2.75 1.05a9.3 9.3 0 0 1 5 0c1.9-1.33 2.75-1.05 2.75-1.05.55 1.42.2 2.47.1 2.73.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9v2.82c0 .28.18.61.69.5A10.26 10.26 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z',
  },
  {
    href: 'https://www.linkedin.com/in/saurabh-raj-shekhar-8a92b73b0',
    label: 'LinkedIn',
    path: 'M6.94 5a2 2 0 1 1-4-.02 2 2 0 0 1 4 .02ZM7 8.48H3V21h4V8.48Zm6.32 0H9.34V21h3.94v-6.57c0-3.66 4.77-4 4.77 0V21H22v-7.93c0-6.17-7.06-5.94-8.68-2.91V8.48Z',
  },
  {
    href: 'https://leetcode.com/Zephyrex_21',
    label: 'LeetCode',
    path: 'M13.66 3.1a1.37 1.37 0 0 0-1.94 0L6.1 8.72a3.5 3.5 0 0 0 0 4.95l4.95 4.95a1.37 1.37 0 1 0 1.94-1.94l-4.31-4.31 4.31-4.31a1.37 1.37 0 0 0 0-1.94Zm-1.25 12.53H20a1.37 1.37 0 0 1 0 2.75h-7.6a1.37 1.37 0 0 1 0-2.75Zm2.6-10.5H20a1.37 1.37 0 0 1 0 2.74h-4.99a1.37 1.37 0 1 1 0-2.74Z',
  },
  {
    href: 'https://www.instagram.com/_raj.shekharrr',
    label: 'Instagram',
    path: 'M12 2c2.72 0 3.06.01 4.12.06 1.06.05 1.79.22 2.43.47a4.9 4.9 0 0 1 1.77 1.15 4.9 4.9 0 0 1 1.15 1.77c.25.64.42 1.37.47 2.43.05 1.06.06 1.4.06 4.12s-.01 3.06-.06 4.12c-.05 1.06-.22 1.79-.47 2.43a4.9 4.9 0 0 1-1.15 1.77 4.9 4.9 0 0 1-1.77 1.15c-.64.25-1.37.42-2.43.47-1.06.05-1.4.06-4.12.06s-3.06-.01-4.12-.06c-1.06-.05-1.79-.22-2.43-.47a4.9 4.9 0 0 1-1.77-1.15 4.9 4.9 0 0 1-1.15-1.77c-.25-.64-.42-1.37-.47-2.43C2.01 15.06 2 14.72 2 12s.01-3.06.06-4.12c.05-1.06.22-1.79.47-2.43a4.9 4.9 0 0 1 1.15-1.77A4.9 4.9 0 0 1 5.45 2.53c.64-.25 1.37-.42 2.43-.47C8.94 2.01 9.28 2 12 2Zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 8.25A3.25 3.25 0 1 1 12 8.75a3.25 3.25 0 0 1 0 6.5ZM17.4 6.6a1.17 1.17 0 1 1-2.34 0 1.17 1.17 0 0 1 2.34 0Z',
  },
]

export default function Footer() {
  return (
    <footer className="relative border-t border-border">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div className="max-w-xs">
            <p className="font-display text-lg font-semibold text-text">Resource Hub</p>
            <p className="mt-2 text-sm text-muted">
              A personal developer knowledge base — notes, tips, and shipped projects, all
              hosted and read in-browser.
            </p>
          </div>

          <div className="flex gap-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Browse</p>
              <ul className="mt-3 flex flex-col gap-2">
                {quickLinks.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-sm text-muted hover:text-text">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Connect</p>
              <div className="mt-3 flex gap-3">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.label}
                    className="clay-btn flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:text-accent"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d={s.path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Resource Hub. Built &amp; maintained by Saurabh Raj Shekhar.</p>
          <p>Built with React, TypeScript, Tailwind &amp; Express.</p>
        </div>
      </div>
    </footer>
  )
}
