import { motion } from 'framer-motion'

// An original, hand-built illustration (no external assets/icon packs) —
// three floating cards representing Notes / Tips / Projects, connected like
// a small graph, echoing the particle-network motif used elsewhere on the
// site. Colors use Tailwind's fill-*/stroke-* utilities bound to the same
// CSS-variable tokens as the rest of the UI, so it adapts automatically to
// light/dark theme with no extra logic. Every element here has some form of
// ambient motion — cards gently float, nodes pulse, connectors "flow" via
// animated dash-offset, and the backdrop breathes — so the whole scene
// reads as alive rather than a static graphic. All of it automatically
// respects prefers-reduced-motion via the app-wide <MotionConfig>.
export function HeroIllustration() {
  return (
    <svg viewBox="0 0 440 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full" aria-hidden="true">
      <defs>
        <filter id="heroCardShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#0f172a" floodOpacity="0.14" />
        </filter>
      </defs>

      {/* backdrop glow, slowly breathing */}
      <motion.circle
        cx="220"
        cy="200"
        r="180"
        className="fill-accent-notes/[0.07]"
        style={{ transformOrigin: '220px 200px' }}
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* connector lines — animated dash-offset gives a "flowing data" feel */}
      <motion.path
        d="M110 118 L 246 84"
        className="stroke-border"
        strokeWidth="2"
        strokeDasharray="3 7"
        strokeLinecap="round"
        animate={{ strokeDashoffset: [0, -20] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
      />
      <motion.path
        d="M246 84 L 330 188"
        className="stroke-border"
        strokeWidth="2"
        strokeDasharray="3 7"
        strokeLinecap="round"
        animate={{ strokeDashoffset: [0, -20] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'linear', delay: 0.2 }}
      />
      <motion.path
        d="M110 118 L 148 268"
        className="stroke-border"
        strokeWidth="2"
        strokeDasharray="3 7"
        strokeLinecap="round"
        animate={{ strokeDashoffset: [0, -20] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'linear', delay: 0.4 }}
      />
      <motion.path
        d="M148 268 L 330 188"
        className="stroke-border"
        strokeWidth="2"
        strokeDasharray="3 7"
        strokeLinecap="round"
        animate={{ strokeDashoffset: [0, -20] }}
        transition={{ duration: 2.3, repeat: Infinity, ease: 'linear', delay: 0.1 }}
      />

      {/* junction nodes — pulsing */}
      <motion.circle
        cx="246"
        cy="84"
        r="4.5"
        className="fill-accent-tips"
        style={{ transformOrigin: '246px 84px' }}
        animate={{ scale: [1, 1.5, 1], opacity: [1, 0.65, 1] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
      />
      <motion.circle
        cx="330"
        cy="188"
        r="4.5"
        className="fill-accent-projects"
        style={{ transformOrigin: '330px 188px' }}
        animate={{ scale: [1, 1.5, 1], opacity: [1, 0.65, 1] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
      />
      <motion.circle
        cx="148"
        cy="268"
        r="4.5"
        className="fill-accent-notes"
        style={{ transformOrigin: '148px 268px' }}
        animate={{ scale: [1, 1.5, 1], opacity: [1, 0.65, 1] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 1.4 }}
      />

      {/* floating decorative dots — drifting + twinkling */}
      <motion.circle
        cx="392"
        cy="70"
        r="3"
        className="fill-accent-projects/50"
        animate={{ y: [0, -14, 0], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
      />
      <motion.circle
        cx="46"
        cy="230"
        r="3"
        className="fill-accent-tips/50"
        animate={{ y: [0, 12, 0], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
      <motion.circle
        cx="368"
        cy="320"
        r="3"
        className="fill-accent-notes/50"
        animate={{ y: [0, -10, 0], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
      />
      <motion.circle
        cx="70"
        cy="60"
        r="3"
        className="fill-accent-projects/40"
        animate={{ y: [0, 10, 0], opacity: [0.3, 0.9, 0.3] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: 1.6 }}
      />

      {/* Notes card — gently floating */}
      <motion.g
        filter="url(#heroCardShadow)"
        animate={{ y: [0, -9, 0] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <rect x="34" y="66" width="150" height="106" rx="18" className="fill-surface stroke-border" strokeWidth="1.5" />
        <rect x="54" y="90" width="14" height="14" rx="4" className="fill-accent-notes/20" />
        <path d="M58 97 h6 M58 100.5 h6" className="stroke-accent-notes" strokeWidth="1.6" strokeLinecap="round" />
        <rect x="76" y="93" width="60" height="7" rx="3.5" className="fill-text" />
        <rect x="54" y="118" width="110" height="6" rx="3" className="fill-border" />
        <rect x="54" y="132" width="96" height="6" rx="3" className="fill-border" />
        <rect x="54" y="146" width="70" height="6" rx="3" className="fill-border" />
        <rect x="54" y="160" width="40" height="7" rx="3.5" className="fill-accent-notes/25" />
      </motion.g>

      {/* Tips card — floats on its own offset rhythm */}
      <motion.g
        filter="url(#heroCardShadow)"
        animate={{ y: [0, -11, 0] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
      >
        <rect x="234" y="150" width="140" height="96" rx="18" className="fill-surface stroke-border" strokeWidth="1.5" />
        <circle cx="264" cy="184" r="15" className="fill-accent-tips/18" />
        <path
          d="M264 176 a8 8 0 0 1 5 14.4 v2.6 h-10 v-2.6 a8 8 0 0 1 5 -14.4 z"
          className="stroke-accent-tips"
          strokeWidth="1.8"
          strokeLinejoin="round"
          fill="none"
        />
        <path d="M260 197 h8" className="stroke-accent-tips" strokeWidth="1.8" strokeLinecap="round" />
        <rect x="288" y="176" width="66" height="7" rx="3.5" className="fill-text" />
        <rect x="288" y="192" width="50" height="6" rx="3" className="fill-border" />
        <rect x="254" y="216" width="100" height="6" rx="3" className="fill-border" />
        <rect x="254" y="228" width="70" height="6" rx="3" className="fill-border" />
      </motion.g>

      {/* Projects card — floats with a third rhythm so nothing moves in sync */}
      <motion.g
        filter="url(#heroCardShadow)"
        animate={{ y: [0, -7, 0] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: 1.4 }}
      >
        <rect x="84" y="222" width="160" height="108" rx="18" className="fill-surface stroke-border" strokeWidth="1.5" />
        <rect x="104" y="246" width="46" height="46" rx="12" className="fill-accent-projects/15" />
        <path d="M118 262 l-7 7 7 7 M136 262 l7 7 -7 7 M128 258 l-4 20" className="stroke-accent-projects" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <rect x="162" y="250" width="66" height="7" rx="3.5" className="fill-text" />
        <rect x="162" y="266" width="50" height="6" rx="3" className="fill-border" />
        <rect x="104" y="302" width="34" height="14" rx="7" className="fill-accent-projects/20" />
        <rect x="146" y="302" width="34" height="14" rx="7" className="fill-border" />
      </motion.g>
    </svg>
  )
}
