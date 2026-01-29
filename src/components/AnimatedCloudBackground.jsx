import { useEffect, useRef } from 'react'

const AnimatedCloudBackground = ({ children }) => {
  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const animationFrameRef = useRef(undefined)

  // Haven brand colors
  const colors = ['#0D1B2A', '#1B263B', '#415A77', '#778DA9', '#E0E1DD']

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const createParticles = () => {
      const particles = []
      const particleCount = Math.floor((canvas.width * canvas.height) / 15000)

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 60 + 30,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          opacity: Math.random() * 0.15 + 0.05,
          color: colors[Math.floor(Math.random() * colors.length)],
        })
      }

      return particles
    }

    particlesRef.current = createParticles()

    const drawParticle = (particle) => {
      if (!ctx) return

      const gradient = ctx.createRadialGradient(
        particle.x,
        particle.y,
        0,
        particle.x,
        particle.y,
        particle.radius
      )

      const opacityHex = Math.floor(particle.opacity * 255).toString(16).padStart(2, '0')
      const halfOpacityHex = Math.floor(particle.opacity * 0.5 * 255).toString(16).padStart(2, '0')

      gradient.addColorStop(0, `${particle.color}${opacityHex}`)
      gradient.addColorStop(0.5, `${particle.color}${halfOpacityHex}`)
      gradient.addColorStop(1, `${particle.color}00`)

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
      ctx.fill()
    }

    const updateParticle = (particle) => {
      particle.x += particle.vx
      particle.y += particle.vy

      if (particle.x < -particle.radius) particle.x = canvas.width + particle.radius
      if (particle.x > canvas.width + particle.radius) particle.x = -particle.radius
      if (particle.y < -particle.radius) particle.y = canvas.height + particle.radius
      if (particle.y > canvas.height + particle.radius) particle.y = -particle.radius
    }

    const animate = () => {
      if (!ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach((particle) => {
        updateParticle(particle)
        drawParticle(particle)
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-gradient-to-br from-[#0D1B2A] via-[#1B263B] to-[#415A77]">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ mixBlendMode: 'screen' }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2A]/50 via-transparent to-transparent pointer-events-none" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

export default AnimatedCloudBackground
