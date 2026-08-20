import type { MouseEventHandler, ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: MouseEventHandler<HTMLDivElement>
}

export function GlassCard({ children, className = '', onClick }: CardProps) {
  return (
    <div className={`glass-card rounded-2xl ${className}`} onClick={onClick}>
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
