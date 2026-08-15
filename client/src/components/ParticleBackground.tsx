import { useEffect, useRef } from 'react'
import { useTheme } from '../context/ThemeContext'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
}

const PARTICLE_COUNT = 60
const LINK_DISTANCE = 120

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
    }))

    const dotColor = theme === 'dark' ? 'rgba(155, 130, 255, 0.55)' : 'rgba(124, 92, 252, 0.35)'
    const lineColor = theme === 'dark' ? 'rgba(155, 130, 255, 0.12)' : 'rgba(124, 92, 252, 0.10)'

    function resize() {
      width = canvas!.width = window.innerWidth
      height = canvas!.height = window.innerHeight
    }
    window.addEventListener('resize', resize)

    function draw() {
      ctx!.clearRect(0, 0, width, height)

      for (const p of particles) {
        if (!prefersReducedMotion) {
          p.x += p.vx
          p.y += p.vy
          if (p.x < 0 || p.x > width) p.vx *= -1
          if (p.y < 0 || p.y > height) p.vy *= -1
        }
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i]
          const b = particles[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < LINK_DISTANCE) {
            ctx!.strokeStyle = lineColor
            ctx!.lineWidth = 1
            ctx!.beginPath()
            ctx!.moveTo(a.x, a.y)
            ctx!.lineTo(b.x, b.y)
            ctx!.stroke()
          }
        }
      }

      for (const p of particles) {
        ctx!.fillStyle = dotColor
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, 1.8, 0, Math.PI * 2)
        ctx!.fill()
      }
    }

    let frameId = 0
    function loop() {
      draw()
      if (!prefersReducedMotion) {
        frameId = requestAnimationFrame(loop)
      }
    }
    loop()

    return () => {
      window.removeEventListener('resize', resize)
      if (frameId) cancelAnimationFrame(frameId)
    }
  }, [theme])

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10 h-full w-full" aria-hidden="true" />
}
