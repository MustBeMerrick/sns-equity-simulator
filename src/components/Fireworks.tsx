import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { createPortal } from 'react-dom'

export interface FireworksHandle {
  launch: () => void
}

interface Rocket {
  x: number
  y: number
  vy: number
  targetY: number
  color: string
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
}

const COLORS = ['#fdb913', '#7c3fa8', '#ec4899', '#06b6d4', '#f97316', '#84cc16', '#ef4444']
const GRAVITY = 220
const DRAG = 0.985

/** Full-screen, click-through canvas that plays a fireworks show on demand. */
export const Fireworks = forwardRef<FireworksHandle>(function Fireworks(_, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rockets = useRef<Rocket[]>([])
  const particles = useRef<Particle[]>([])
  const pending = useRef<number[]>([])
  const frame = useRef<number>()
  const last = useRef(0)

  const explode = (r: Rocket) => {
    const count = 110 + Math.floor(Math.random() * 60)
    const speed = 120 + Math.random() * 140
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.2
      const v = speed * (0.4 + Math.random() * 0.6)
      const maxLife = 1.2 + Math.random() * 1.0
      particles.current.push({
        x: r.x,
        y: r.y,
        vx: Math.cos(angle) * v,
        vy: Math.sin(angle) * v,
        life: maxLife,
        maxLife,
        color: Math.random() < 0.7 ? r.color : COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 2.5 + Math.random() * 2.5,
      })
    }
  }

  const tick = (now: number) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const dt = Math.min((now - last.current) / 1000, 0.05)
    last.current = now
    const w = window.innerWidth
    const h = window.innerHeight
    ctx.clearRect(0, 0, w, h)

    // Launch rockets whose scheduled time has arrived.
    pending.current = pending.current.filter((t) => {
      if (now < t) return true
      rockets.current.push({
        x: w * (0.1 + Math.random() * 0.8),
        y: h,
        vy: -(h * 0.9 + Math.random() * h * 0.3),
        targetY: h * (0.15 + Math.random() * 0.4),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      })
      return false
    })

    rockets.current = rockets.current.filter((r) => {
      r.y += r.vy * dt
      r.vy += GRAVITY * 2 * dt
      ctx.beginPath()
      ctx.fillStyle = r.color
      ctx.arc(r.x, r.y, 2.5, 0, Math.PI * 2)
      ctx.fill()
      if (r.y <= r.targetY || r.vy >= 0) {
        explode(r)
        return false
      }
      return true
    })

    particles.current = particles.current.filter((p) => {
      p.life -= dt
      if (p.life <= 0) return false
      const px = p.x
      const py = p.y
      p.vx *= DRAG
      p.vy = p.vy * DRAG + GRAVITY * dt
      p.x += p.vx * dt
      p.y += p.vy * dt
      const alpha = Math.min(1, p.life / (p.maxLife * 0.5))
      ctx.globalAlpha = alpha
      ctx.strokeStyle = p.color
      ctx.lineWidth = p.size
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(px, py)
      ctx.lineTo(p.x, p.y)
      ctx.stroke()
      return true
    })
    ctx.globalAlpha = 1

    if (pending.current.length || rockets.current.length || particles.current.length) {
      frame.current = requestAnimationFrame(tick)
    } else {
      frame.current = undefined
      ctx.clearRect(0, 0, w, h)
    }
  }

  useImperativeHandle(ref, () => ({
    launch: () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      const now = performance.now()
      for (let i = 0; i < 12; i++) pending.current.push(now + i * 200 + Math.random() * 150)
      if (frame.current === undefined) {
        last.current = now
        frame.current = requestAnimationFrame(tick)
      }
    },
  }))

  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.getContext('2d')?.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
      if (frame.current !== undefined) cancelAnimationFrame(frame.current)
    }
  }, [])

  return createPortal(
    <canvas ref={canvasRef} className="fixed inset-0 z-50 pointer-events-none" aria-hidden />,
    document.body,
  )
})
