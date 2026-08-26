import type { MouseEventHandler, ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: MouseEventHandler<HTMLDivElement>
  /** 'showcase' swaps to the DesignCode-inspired frosted-glass treatment
   *  (Home hero + ProjectsGrid only) instead of the app's default flat,
   *  bordered card. Same component, same call sites elsewhere — no fork. */
  variant?: 'default' | 'showcase'
}

export function GlassCard({ children, className = '', onClick, variant = 'default' }: CardProps) {
  const base = variant === 'showcase' ? 'showcase-card' : 'glass-card'
  return (
    <div className={`${base} rounded-2xl ${className}`} onClick={onClick}>
      {children}
    </div>
  )
}

export function ClayCard({ children, className = '', onClick }: CardProps) {
  return (
    <div className={`clay-card rounded-2xl ${className}`} onClick={onClick}>
      {children}
    </div>
  )
}
