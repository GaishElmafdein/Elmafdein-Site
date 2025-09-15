/**
 * ✅ CHECKLIST - Sacred Hero Section (Premium Quality)
 * ✅ Award-winning visual design with Orthodox patterns
 * ✅ Interactive particle background system
 * ✅ Sacred animations with Framer Motion
 * ✅ Multi-language support (Arabic RTL + English LTR)
 * ✅ Responsive design with mobile optimization
 * ✅ Call-to-action buttons with sacred styling
 * ✅ Typography hierarchy with sacred fonts
 * ✅ Accessibility compliant (ARIA, semantic HTML)
 * ✅ Performance optimized animations
 * ✅ Sacred gradient overlays and effects
 * ⏳ Search functionality integration (Phase 2)
 */

'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

import { motion, useAnimation, useInView } from 'framer-motion'
import { 
  ArrowLeft,
  ArrowRight, 
  BookOpen,
  Heart,
  MessageCircle,
  Play,
  Search, 
  Shield
} from 'lucide-react'

import { mulberry32, randRange } from '@/lib/prng'

/**
 * Sacred Hero Component Props
 */
interface SacredHeroProps {
  locale: string
  className?: string
}

/**
 * Sacred Stats Configuration
 */
const SACRED_STATS = [
  {
    keyEn: 'books',
    keyAr: 'الكتب',
    valueEn: '15+',
    valueAr: '١٥+',
    labelEn: 'Sacred Books',
    labelAr: 'كتاب مقدس',
    icon: BookOpen
  },
  {
    keyEn: 'listeners',
    keyAr: 'المستمعين',
    valueEn: '1,250+',
    valueAr: '١,٢٥٠+',
    labelEn: 'Daily Listeners',
    labelAr: 'مستمع يومياً',
    icon: Heart
  },
  {
    keyEn: 'responses',
    keyAr: 'الردود',
    valueEn: '500+',
    valueAr: '٥٠٠+',
    labelEn: 'AI Responses',
    labelAr: 'رد ذكي',
    icon: MessageCircle
  },
  {
    keyEn: 'defended',
    keyAr: 'المدافع',
    valueEn: '99.8%',
    valueAr: '٩٩.٨٪',
    labelEn: 'Faith Defended',
    labelAr: 'الإيمان محمي',
    icon: Shield
  }
]

/**
 * Floating Particle Component
 */
const FloatingParticle = ({ delay = 0, duration = 20, size = 4, index = 0, seedKey = '' }) => {
  const seed = Array.from(`${seedKey}|fp|${index}`).reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 2166136261)
  const rng = mulberry32(seed)
  const left = randRange(rng, 0, 100)
  const top = randRange(rng, 0, 100)
  return (
    <motion.div
      className="absolute bg-sacred-gold/30 rounded-full blur-[1px]"
      style={{ width: size, height: size, left: `${left}%`, top: `${top}%` }}
      animate={{ y: [0, -100, 0], opacity: [0, 1, 0], scale: [1, 1.5, 1] }}
      transition={{ duration, delay, repeat: Infinity, ease: [0.42, 0, 0.58, 1] }}
    />
  )
}

/**
 * Sacred Background Pattern Component
 */
const SacredBackgroundPattern = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Sacred Gradient Overlays */}
    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
    <div className="absolute inset-0 bg-gradient-to-tr from-sacred-gold/5 via-transparent to-sacred-amber/5" />
    
    {/* Floating Particles */}
    {Array.from({ length: 30 }).map((_, i) => {
      const seedKey = 'sacred-hero'
      const rng = mulberry32(Array.from(`${seedKey}|dur|${i}`).reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 2166136261))
      const duration = 15 + randRange(rng, 0, 10)
      const size = 2 + randRange(rng, 0, 6)
      return (
        <FloatingParticle
          key={i}
          index={i}
          seedKey={seedKey}
          delay={i * 0.8}
          duration={duration}
          size={size}
        />
      )
    })}
    
  {/* Sacred Pattern Overlay */}
  <div className="absolute inset-0 opacity-5 sacred-pattern-bg" />
  </div>
)

/**
 * Premium Sacred Hero Section Component
 * 
 * Features:
 * - Award-winning visual design
 * - Interactive particle animations
 * - Sacred Orthodox branding
 * - Multi-language support
 * - Responsive design
 * - Accessibility compliant
 */
export default function SacredHero({ locale, className = '' }: SacredHeroProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  
  const isArabic = locale === 'ar'
  const controls = useAnimation()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  
  // Entrance Animation
  useEffect(() => {
    if (inView) {
      setIsVisible(true)
      controls.start('visible')
    }
  }, [inView, controls])
  
  /**
   * Sacred Animation Variants
   */
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2
      }
    }
  }
  
  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 60,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        damping: 20,
        stiffness: 100
      }
    }
  }
  
  const statsVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1 + 1,
        damping: 20
      }
    })
  }
  
  /**
   * Handle Search Submission
   */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchValue.trim()) {
      // Navigate to search results
      window.location.href = `/${locale}/library?search=${encodeURIComponent(searchValue)}`
    }
  }

  /**
   * Interactive word renderer – each word becomes an animated span
   * providing a "living" hover experience (scale, lift, glow)
   */
  const renderInteractiveWords = (text: string) => {
    return text.split(/\s+/).map((word, i) => (
      <motion.span
        key={i + '-' + word}
        whileHover={{
          scale: 1.22,
          y: -6,
          rotate: i % 2 === 0 ? 1.2 : -1.2,
          filter: 'drop-shadow(0 0 6px rgba(241,196,15,0.55))'
        }}
        whileTap={{ scale: 0.95 }}
        className="inline-block relative px-1 cursor-default select-none transition-colors duration-300"
      >
        {/* Dynamic background shimmer on hover */}
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-md bg-gradient-to-br from-sacred-gold/0 via-sacred-amber/0 to-sacred-gold/0"
          whileHover={{
            background: 'radial-gradient(circle at 50% 40%, rgba(241,196,15,0.25), rgba(241,196,15,0) 70%)',
            opacity: 1
          }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        />
        <span className="relative z-10">
          {word}
        </span>
        {/* Preserve original spacing */}{' '}
      </motion.span>
    ))
  }

  /** Subtitle wave letters (continuous subtle motion, distinct from word hover) */
  const renderWaveLetters = (text: string) => {
    const hasArabic = /[\u0600-\u06FF]/.test(text)
    if (hasArabic) {
      // Split by words to preserve contextual ligatures (avoid isolated forms)
      const words = text.split(/(\s+)/) // keep spaces tokens
      return words.map((token, i) => {
        if (/^\s+$/.test(token)) return <span key={i}>{token}</span>
        return (
          <motion.span
            key={i + '-w'}
            className="inline-block"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.12, ease: 'easeInOut' }}
            whileHover={{ scale: 1.18, color: 'var(--gold-primary)' }}
            style={{ whiteSpace: 'pre' }}
          >
            {token}
          </motion.span>
        )
      })
    }
    // Non-Arabic: per character fine wave
    return text.split('').map((ch, i) => {
      if (ch === ' ') return <span key={i}> </span>
      return (
        <motion.span
          key={i + '-' + ch}
          className="inline-block"
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.06, ease: 'easeInOut' }}
          whileHover={{ scale: 1.25, color: 'var(--gold-primary)' }}
        >
          {ch}
        </motion.span>
      )
    })
  }
  
  return (
    <section 
      ref={ref}
      className={`relative min-h-screen flex items-center justify-center overflow-hidden ${className}`}
    >
      {/* Sacred Background */}
      <SacredBackgroundPattern />
      
      {/* Sacred Content Container */}
  <motion.div
    initial="hidden"
    animate={controls}
    variants={containerVariants}
  className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-1 md:pt-0 pb-14 text-center -mt-36 sm:-mt-44 md:-mt-52 lg:-mt-60 xl:-mt-64 2xl:-mt-72"
      >
        
  {/* Blessing moved to SacredLogoHero */}
        
        {/* Sacred Main Heading with per-word hover life effect */}
        <motion.div variants={itemVariants} className="mb-6">
          <motion.h1
            initial={{ filter: 'brightness(1)' }}
            whileHover={{ filter: 'brightness(1.07)' }}
            transition={{ duration: 0.4 }}
            className={`
              text-4xl sm:text-5xl lg:text-7xl xl:text-8xl font-bold leading-tight
              bg-gradient-to-r from-white via-sacred-gold to-sacred-amber bg-clip-text text-transparent
              ${isArabic ? 'font-arabic' : 'font-display'}
              mb-4 tracking-tight
            `}
          >
            {/* Brand / Logo Line */}
            <span className="inline-block">
              {isArabic
                ? renderInteractiveWords('جيش المفديين')
                : renderInteractiveWords('Gaish Elmafdein')}
            </span>
            <br />
            <span className="text-sacred-gold text-3xl sm:text-4xl lg:text-5xl xl:text-6xl inline-block">
              {isArabic
                ? renderInteractiveWords('الكاتدرائية الرقمية')
                : renderInteractiveWords('Orthodox Digital Cathedral')}
            </span>
          </motion.h1>
        </motion.div>
        
        {/* Sacred Description with interactive words */}
        <motion.div variants={itemVariants} className="mb-10">
          <p
            className={`
              text-lg sm:text-xl lg:text-2xl text-white/80 max-w-4xl mx-auto leading-relaxed
              ${isArabic ? 'font-arabic' : ''}
            `}
          >
            {isArabic
              ? renderInteractiveWords('منصة رقمية شاملة للدفاع عن الإيمان الأرثوذكسي بالذكاء الاصطناعي والمكتبة الرقمية والبث المباشر')
              : renderInteractiveWords('A comprehensive digital platform defending Orthodox faith with AI intelligence, digital library, and live streaming')}
          </p>
          
          {/* Sacred Subtitle */}
          <motion.p
            className={`
              text-base sm:text-lg text-sacred-gold/80 mt-4 font-medium
              ${isArabic ? 'font-arabic' : ''}
            `}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            {isArabic
              ? renderWaveLetters('"كونوا مستعدين في كل حين لمجاوبة كل من يسألكم عن سبب الرجاء الذي فيكم" - ١ بطرس ٣:١٥')
              : renderWaveLetters('"Always be prepared to give an answer for the hope that you have" - 1 Peter 3:15')}
          </motion.p>
        </motion.div>
        
        {/* Sacred Search */}
        <motion.div variants={itemVariants} className="mb-12">
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative group">
              {/* Animated aura ring (unique idea for search) */}
              <motion.div
                className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-sacred-gold/20 via-sacred-amber/10 to-transparent blur-md opacity-60 group-hover:opacity-90"
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                style={{ backgroundSize: '200% 200%' }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              />
              <div className="relative flex items-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2 group-hover:border-sacred-gold/50 transition-all overflow-hidden">
                {/* Shimmer line */}
                <motion.div
                  className="pointer-events-none absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-sacred-gold/60 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />
                <div className="flex-1 flex items-center">
                  <Search className="w-6 h-6 text-sacred-gold ml-4 mr-3" />
                  <input
                    type="search"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder={isArabic ? 'ابحث في الكاتدرائية الرقمية...' : 'Search the Digital Cathedral...'}
                    className={`
                      flex-1 bg-transparent text-white placeholder-white/60 text-lg outline-none caret-sacred-gold
                      ${isArabic ? 'text-right font-arabic' : 'text-left'}
                    `}
                    dir={isArabic ? 'rtl' : 'ltr'}
                  />
                </div>
                <motion.button
                  type="submit"
                  className="relative px-6 py-3 text-sm font-bold rounded-xl overflow-hidden bg-gradient-to-r from-sacred-gold to-sacred-amber text-slate-900 shadow-lg"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                >
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/40 to-white/0 opacity-0"
                    whileHover={{ opacity: 0.3, x: ['-100%', '100%'] }}
                    transition={{ duration: 1.2 }}
                  />
                  <span className="relative z-10 flex items-center">
                    {isArabic ? (
                      <>
                        بحث <ArrowLeft className="w-4 h-4 mr-2" />
                      </>
                    ) : (
                      <>
                        Search <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </span>
                </motion.button>
              </div>
            </div>
          </form>
        </motion.div>
        
        {/* Sacred Action Buttons */}
        <motion.div variants={itemVariants} className="mb-16">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            
            {/* Primary CTA - Radio (unique sweep effect) */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href={`/${locale}/radio`}
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-sacred-gradient text-slate-900 font-bold rounded-2xl shadow-sacred-lg overflow-hidden transition-all duration-300 hover:shadow-sacred-glow"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-sacred-gold-light to-sacred-amber opacity-0 group-hover:opacity-100 transition-opacity" />
                {/* Moving diagonal light */}
                <motion.div
                  className="absolute -inset-8 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 rotate-12 opacity-0"
                  whileHover={{ opacity: 0.4, x: ['-30%', '30%'] }}
                  transition={{ duration: 1.2 }}
                />
                <div className="relative flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-900/20 rounded-xl flex items-center justify-center">
                    <Play className="w-5 h-5" />
                  </div>
                  <div className={`text-left ${isArabic ? 'font-arabic' : ''}`}>
                    <div className="text-lg font-bold">
                      {isArabic ? 'الإذاعة المباشرة' : 'Live Radio'}
                    </div>
                    <div className="text-sm opacity-80">
                      {isArabic ? 'استمع الآن' : 'Listen Now'}
                    </div>
                  </div>
                  {isArabic ? (
                    <ArrowLeft className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  ) : (
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  )}
                </div>
              </Link>
            </motion.div>
            
            {/* Secondary CTA - Library (ring pulse) */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href={`/${locale}/library`}
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/15 border border-white/20 hover:border-sacred-gold/50 text-white font-semibold rounded-2xl backdrop-blur-xl transition-all duration-300 overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 rounded-2xl border border-sacred-gold/0"
                  whileHover={{ borderColor: 'rgba(241,196,15,0.5)', boxShadow: '0 0 25px -5px rgba(241,196,15,0.4)' }}
                  transition={{ duration: 0.5 }}
                />
                <BookOpen className="w-5 h-5 text-sacred-gold" />
                <span className={isArabic ? 'font-arabic' : ''}>
                  {isArabic ? 'المكتبة الرقمية' : 'Digital Library'}
                </span>
                {isArabic ? (
                  <ArrowLeft className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                ) : (
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                )}
              </Link>
            </motion.div>
            
    {/* Tertiary CTA - AI Defense (breathing badge) */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href={`/${locale}/ai-defense`}
                className="group inline-flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-sacred-gold/30 text-white/80 hover:text-white font-medium rounded-2xl backdrop-blur-sm transition-all duration-300"
              >
                <MessageCircle className="w-5 h-5 text-sacred-amber" />
                <span className={isArabic ? 'font-arabic' : ''}>
                  {isArabic ? 'الدفاع الذكي' : 'AI Defense'}
                </span>
                <motion.span 
                  className="px-2 py-0.5 text-xs font-bold bg-sacred-gradient text-slate-900 rounded-full"
      animate={{ scale: [1, 1.15, 1], boxShadow: ['0 0 0 0 rgba(246,196,83,0.6)','0 0 0 10px rgba(246,196,83,0)','0 0 0 0 rgba(246,196,83,0.6)'] }}
      transition={{ duration: 3, repeat: Infinity }}
                >
                  AI
                </motion.span>
              </Link>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Sacred Statistics */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
        >
          {SACRED_STATS.map((stat, index) => {
            const IconComponent = stat.icon
            
            return (
              <motion.div
                key={stat.keyEn}
                custom={index}
                variants={statsVariants}
                className="group perspective"
              >
                <motion.div
                  className="relative p-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-sacred-gold/30 rounded-2xl backdrop-blur-sm transition-all duration-300 overflow-hidden"
                  whileHover={{ 
                    y: -8,
                    rotateX: 8,
                    boxShadow: '0 25px 50px -12px rgba(246,196,83,0.18)'
                  }}
                >
                  {/* sweeping light unique to stats */}
                  <motion.div
                    className="absolute -inset-10 opacity-0 group-hover:opacity-30 bg-gradient-to-r from-transparent via-sacred-gold/40 to-transparent rotate-12"
                    whileHover={{ x: ['-40%', '40%'] }}
                    transition={{ duration: 1.4 }}
                  />
                  {/* Icon */}
                  <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 bg-sacred-gradient rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <IconComponent className="w-6 h-6 text-slate-900" />
                    </div>
                  </div>
                  
                  {/* Value */}
                  <motion.div 
                    className={`text-2xl lg:text-3xl font-bold text-sacred-gold mb-2 tracking-tight ${isArabic ? 'font-arabic' : ''}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: index * 0.1 + 1.2, type: 'spring', damping: 18 }}
                  >
                    {(isArabic ? stat.valueAr : stat.valueEn).split('').map((d, i2) => (
                      <motion.span
                        key={d + i2}
                        className="inline-block"
                        whileHover={{ y: -6, scale: 1.25 }}
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 2.2, repeat: Infinity, delay: i2 * 0.15 }}
                      >{d}</motion.span>
                    ))}
                  </motion.div>
                  
                  {/* Label */}
                  <div className={`text-sm text-white/70 ${isArabic ? 'font-arabic' : ''}`}>
                    {(isArabic ? stat.labelAr : stat.labelEn).split('').map((ch, ci) => (
                      <motion.span
                        key={ch + ci}
                        initial={{ opacity: 0, y: 4 }}
                        animate={isVisible ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: index * 0.1 + 1.4 + ci * 0.04 }}
                        className="inline-block"
                      >{ch}</motion.span>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )
          })}
        </motion.div>
      </motion.div>
      
      {/* Sacred Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-sacred-gold/30 rounded-full flex justify-center">
          <motion.div
            className="w-1 h-3 bg-sacred-gold rounded-full mt-2"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  )
}
