"use client"
import * as React from 'react'

import { motion } from 'framer-motion'

interface FlameHaloProps { size?: number; className?: string }

export function FlameHalo({ size = 280, className = '' }: FlameHaloProps) {
  const layers = Array.from({ length: 6 })
  const dimensionStyle: React.CSSProperties = { width: size, height: size }
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={dimensionStyle}>
      {layers.map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: size - i * 24,
            height: size - i * 24,
            border: '1px solid rgba(241,196,15,0.12)',
            boxShadow: '0 0 25px -5px rgba(220,38,38,0.35)',
            mixBlendMode: 'screen'
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 16 + i * 4, repeat: Infinity, ease: 'linear' }}
        />
      ))}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.4),transparent_70%)] blur-2xl" />
    </div>
  )
}
