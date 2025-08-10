'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface OrthodoxCrossProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  animated?: boolean
  glowing?: boolean
  className?: string
}

export function OrthodoxCross({ 
  size = 'md', 
  animated = true, 
  glowing = true,
  className = '' 
}: OrthodoxCrossProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const sizeClasses = {
    sm: 'w-8 h-12',
    md: 'w-16 h-24',
    lg: 'w-24 h-36',
    xl: 'w-32 h-48'
  }

  return (
    <motion.div
      className={`relative ${sizeClasses[size]} ${className}`}
      initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
      animate={isVisible ? { 
        opacity: 1, 
        scale: 1, 
        rotate: 0 
      } : {}}
      transition={{ duration: 1.5 }}
    >
      {/* Main Cross Structure */}
      <motion.div
        className={`
          relative w-full h-full
          ${glowing ? 'drop-shadow-2xl' : ''}
        `}
        animate={glowing && animated ? {
          filter: [
            'drop-shadow(0 0 10px rgba(241, 196, 15, 0.3))',
            'drop-shadow(0 0 30px rgba(241, 196, 15, 0.6))',
            'drop-shadow(0 0 10px rgba(241, 196, 15, 0.3))'
          ]
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity
        }}
      >
        {/* Vertical Bar */}
        <div className="absolute left-1/2 top-0 w-2 h-full bg-gradient-to-b from-gold-400 via-gold-500 to-gold-600 transform -translate-x-1/2 rounded-sm" />
        
        {/* Upper Horizontal Bar */}
        <div className="absolute left-1/2 top-[20%] w-8 h-2 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-400 transform -translate-x-1/2 rounded-sm" />
        
        {/* Main Horizontal Bar */}
        <div className="absolute left-1/2 top-[45%] w-12 h-2 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-400 transform -translate-x-1/2 rounded-sm" />
        
        {/* Lower Diagonal Bar */}
        <div className="absolute left-1/2 bottom-[15%] w-8 h-2 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-400 transform -translate-x-1/2 rotate-12 rounded-sm" />
        
        {/* Sacred Light Rays */}
        {animated && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className={`
                  absolute w-px h-8 bg-gradient-to-t from-transparent via-gold-300 to-transparent 
                  left-1/2 top-1/2 origin-bottom
                `}
                style={{
                  transform: `rotate(${i * 45}deg) translateY(-24px)`
                }}
              />
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Sacred Aura */}
      {glowing && (
        <motion.div
          className="absolute inset-0 bg-gold-500 opacity-20 rounded-full blur-xl"
          animate={{
            opacity: [0.1, 0.3, 0.1],
            scale: [1.2, 1.8, 1.2]
          }}
          transition={{
            duration: 3,
            repeat: Infinity
          }}
        />
      )}
    </motion.div>
  )
}
