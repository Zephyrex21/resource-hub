// An original, hand-built illustration (no external assets/icon packs) —
// three cards representing Notes / Tips / Projects, connected like a small
// graph. Kept static/flat (no ambient looping motion — no floating, no
// pulsing, no breathing glow) to match the utility, content-first look of
// the rest of the site; the only animation is the one-time entrance scale
// applied by the parent in Home.tsx.
export function HeroIllustration() {
  return (
    <svg viewBox="0 0 440 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full" aria-hidden="true">
      <defs>
        <filter id="heroCardShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#0f172a" floodOpacity="0.1" />
        </filter>
      </defs>

      {/* backdrop glow */}
      <circle cx="220" cy="200" r="180" className="fill-accent/[0.06]" />

      {/* connector lines */}
      <path d="M110 118 L 246 84" className="stroke-border" strokeWidth="2" strokeDasharray="3 7" strokeLinecap="round" />
      <path d="M246 84 L 330 188" className="stroke-border" strokeWidth="2" strokeDasharray="3 7" strokeLinecap="round" />
      <path d="M110 118 L 148 268" className="stroke-border" strokeWidth="2" strokeDasharray="3 7" strokeLinecap="round" />
      <path d="M148 268 L 330 188" className="stroke-border" strokeWidth="2" strokeDasharray="3 7" strokeLinecap="round" />

      {/* junction nodes */}
      <circle cx="246" cy="84" r="4.5" className="fill-accent" />
      <circle cx="330" cy="188" r="4.5" className="fill-accent" />
      <circle cx="148" cy="268" r="4.5" className="fill-accent" />

      {/* Notes card */}
      <g filter="url(#heroCardShadow)">
        <rect x="34" y="66" width="150" height="106" rx="18" className="fill-surface stroke-border" strokeWidth="1.5" />
        <rect x="54" y="90" width="14" height="14" rx="4" className="fill-accent/20" />
        <path d="M58 97 h6 M58 100.5 h6" className="stroke-accent" strokeWidth="1.6" strokeLinecap="round" />
        <rect x="76" y="93" width="60" height="7" rx="3.5" className="fill-text" />
        <rect x="54" y="118" width="110" height="6" rx="3" className="fill-border" />
        <rect x="54" y="132" width="96" height="6" rx="3" className="fill-border" />
        <rect x="54" y="146" width="70" height="6" rx="3" className="fill-border" />
        <rect x="54" y="160" width="40" height="7" rx="3.5" className="fill-easy/40" />
      </g>

      {/* Tips card */}
      <g filter="url(#heroCardShadow)">
        <rect x="234" y="150" width="140" height="96" rx="18" className="fill-surface stroke-border" strokeWidth="1.5" />
        <circle cx="264" cy="184" r="15" className="fill-accent/18" />
        <path
          d="M264 176 a8 8 0 0 1 5 14.4 v2.6 h-10 v-2.6 a8 8 0 0 1 5 -14.4 z"
          className="stroke-accent"
          strokeWidth="1.8"
          strokeLinejoin="round"
          fill="none"
        />
        <path d="M260 197 h8" className="stroke-accent" strokeWidth="1.8" strokeLinecap="round" />
        <rect x="288" y="176" width="66" height="7" rx="3.5" className="fill-text" />
        <rect x="288" y="192" width="50" height="6" rx="3" className="fill-border" />
        <rect x="254" y="216" width="100" height="6" rx="3" className="fill-border" />
        <rect x="254" y="228" width="70" height="6" rx="3" className="fill-border" />
      </g>

      {/* Projects card */}
      <g filter="url(#heroCardShadow)">
        <rect x="84" y="222" width="160" height="108" rx="18" className="fill-surface stroke-border" strokeWidth="1.5" />
        <rect x="104" y="246" width="46" height="46" rx="12" className="fill-accent/15" />
        <path d="M118 262 l-7 7 7 7 M136 262 l7 7 -7 7 M128 258 l-4 20" className="stroke-accent" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <rect x="162" y="250" width="66" height="7" rx="3.5" className="fill-text" />
        <rect x="162" y="266" width="50" height="6" rx="3" className="fill-border" />
        <rect x="104" y="302" width="34" height="14" rx="7" className="fill-easy/25" />
        <rect x="146" y="302" width="34" height="14" rx="7" className="fill-border" />
      </g>
    </svg>
  )
}
