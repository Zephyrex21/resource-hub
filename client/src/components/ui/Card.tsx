import type { ReactNode } from 'react'

export function GlassCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`glass-card rounded-2xl ${className}`}>{children}</div>
}

export function ClayCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`clay-card rounded-2xl ${className}`}>{children}</div>
}
