'use client'

import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

interface Particle {
  id: number
  x: number
  y: number
  size: number
  speed: number
  angle: number
  opacity: number
  type: 'cross' | 'star' | 'dot'
}

export function SacredBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [particles, setParticles] = useState<Particle[]>([])
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    // Initialize particles
    const newParticles: Particle[] = []
    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 0.5 + 0.1,
        angle: Math.random() * Math.PI * 2,
        opacity: Math.random() * 0.6 + 0.2,
        type: ['cross', 'star', 'dot'][Math.floor(Math.random() * 3)] as 'cross' | 'star' | 'dot'
      })
    }
    setParticles(newParticles)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const animate = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      // Clear canvas with sacred gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, 'rgba(36, 59, 83, 0.95)') // midnight-800
      gradient.addColorStop(0.5, 'rgba(52, 78, 104, 0.9)') // midnight-700
      gradient.addColorStop(1, 'rgba(26, 32, 44, 0.95)') // midnight-900
      
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw particles
      particles.forEach((particle) => {
        const distance = Math.sqrt(
          Math.pow(mousePos.x - particle.x, 2) + Math.pow(mousePos.y - particle.y, 2)
        )
        
        const maxDistance = 150
        const influence = Math.max(0, 1 - distance / maxDistance)
        
        ctx.save()
        ctx.globalAlpha = particle.opacity + influence * 0.3
        ctx.fillStyle = `rgb(241, 196, 15)` // gold-500
        
        ctx.translate(particle.x, particle.y)
        ctx.rotate(particle.angle)
        
        if (particle.type === 'cross') {
          // Draw mini cross
          ctx.fillRect(-particle.size/2, -particle.size*1.5, particle.size/3, particle.size*3)
          ctx.fillRect(-particle.size, -particle.size/2, particle.size*2, particle.size/3)
        } else if (particle.type === 'star') {
          // Draw star
          ctx.beginPath()
          for (let i = 0; i < 5; i++) {
            const radius = particle.size
            const angle = (i * Math.PI * 2) / 5
            const x = Math.cos(angle) * radius
            const y = Math.sin(angle) * radius
            if (i === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
          }
          ctx.closePath()
          ctx.fill()
        } else {
          // Draw dot
          ctx.beginPath()
          ctx.arc(0, 0, particle.size, 0, Math.PI * 2)
          ctx.fill()
        }
        
        ctx.restore()

        // Update particle position
        particle.x += Math.cos(particle.angle) * particle.speed
        particle.y += Math.sin(particle.angle) * particle.speed
        particle.angle += 0.01

        // Wrap around edges
        if (particle.x > canvas.width) particle.x = 0
        if (particle.x < 0) particle.x = canvas.width
        if (particle.y > canvas.height) particle.y = 0
        if (particle.y < 0) particle.y = canvas.height
      })

      // Draw connections near mouse
      particles.forEach((particle, i) => {
        particles.slice(i + 1).forEach((otherParticle) => {
          const distance = Math.sqrt(
            Math.pow(particle.x - otherParticle.x, 2) + Math.pow(particle.y - otherParticle.y, 2)
          )
          
          const mouseDistance1 = Math.sqrt(
            Math.pow(mousePos.x - particle.x, 2) + Math.pow(mousePos.y - particle.y, 2)
          )
          
          const mouseDistance2 = Math.sqrt(
            Math.pow(mousePos.x - otherParticle.x, 2) + Math.pow(mousePos.y - otherParticle.y, 2)
          )

          if (distance < 100 && (mouseDistance1 < 200 || mouseDistance2 < 200)) {
            ctx.save()
            ctx.globalAlpha = 0.3 * (1 - distance / 100)
            ctx.strokeStyle = 'rgb(241, 196, 15)'
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(otherParticle.x, otherParticle.y)
            ctx.stroke()
            ctx.restore()
          }
        })
      })

      requestAnimationFrame(animate)
    }

    animate()
  }, [particles, mousePos])

  return (
    <div className="fixed inset-0 -z-10">
      <canvas
        ref={canvasRef}
        className="w-full h-full bg-transparent"
      />
      
      {/* Sacred Overlay Patterns */}
      <div className="absolute inset-0 opacity-5">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-32 h-32 border border-gold-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute top-3/4 right-1/4 w-24 h-24 border border-gold-500 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 w-48 h-48 border border-gold-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Divine Light Gradients */}
      <div className="absolute inset-0 bg-gradient-radial from-gold-500/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-conic from-gold-500/10 via-transparent to-gold-500/10 pointer-events-none" />
    </div>
  )
}
