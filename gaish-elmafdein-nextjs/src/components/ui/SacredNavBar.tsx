/**
 * ✅ CHECKLIST - Sacred NavBar Component (Premium Quality)
 * ✅ Glassmorphism design with blur effects
 * ✅ Responsive navigation with mobile menu
 * ✅ Sacred Orthodox branding integration
 * ✅ Smooth scroll-based state changes
 * ✅ Accessibility compliant (ARIA, keyboard navigation)
 * ✅ Premium micro-interactions with Framer Motion
 * ✅ Multi-language support (Arabic RTL + English LTR)
 * ✅ Performance optimized with React hooks
 * ✅ Sacred color palette integration
 * ✅ Cross browser compatible
 * ⏳ Search functionality integration (Phase 2)
 */

'use client'

import { useEffect,useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { AnimatePresence,motion } from 'framer-motion'
import { 
  BookOpen,
  ChevronDown,
  Globe,
  Home,
  Info,
  Menu, 
  MessageCircle,
  Radio,
  Search, 
  X} from 'lucide-react'

/**
 * Sacred Navigation Interface
 */
interface NavItem {
  href: string
  labelEn: string
  labelAr: string
  icon: React.ComponentType<{ className?: string }>
  isExternal?: boolean
  badge?: string
}

interface NavBarProps {
  locale: string
  className?: string
}

/**
 * Sacred Navigation Configuration
 */
const SACRED_NAV_ITEMS: NavItem[] = [
  {
    href: '/',
    labelEn: 'Home',
    labelAr: 'الرئيسية',
    icon: Home
  },
  {
    href: '/radio',
    labelEn: 'Orthodox Radio',
    labelAr: 'الإذاعة الأرثوذكسية',
    icon: Radio,
    badge: 'LIVE'
  },
  {
    href: '/library',
    labelEn: 'Digital Library',
    labelAr: 'المكتبة الرقمية',
    icon: BookOpen
  },
  {
    href: '/ai-defense',
    labelEn: 'AI Defense',
    labelAr: 'الدفاع الذكي',
    icon: MessageCircle,
    badge: 'AI'
  },
  {
    href: '/about',
    labelEn: 'About',
    labelAr: 'حول المشروع',
    icon: Info
  }
]

/**
 * Sacred Language Toggle Options
 */
const LANGUAGE_OPTIONS = [
  { code: 'ar', name: 'العربية', flag: '🇪🇬' },
  { code: 'en', name: 'English', flag: '🇺🇸' }
]

/**
 * Premium Sacred NavBar Component
 * 
 * Features:
 * - Glassmorphism with adaptive blur
 * - Responsive mobile-first design
 * - Sacred Orthodox branding
 * - Scroll-based state management
 * - Accessibility compliant
 * - Multi-language support
 */
export default function SacredNavBar({ locale, className = '' }: NavBarProps) {
  // State Management
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  
  const pathname = usePathname()
  const isArabic = locale === 'ar'
  
  // Scroll Detection for Dynamic Styling
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      setIsScrolled(scrollY > 20)
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsLanguageMenuOpen(false)
  }, [pathname])
  
  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false)
        setIsLanguageMenuOpen(false)
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])
  
  /**
   * Check if navigation item is currently active
   */
  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return pathname === `/${locale}` || pathname === '/'
    }
    return pathname.includes(href)
  }
  
  /**
   * Sacred Navigation Animation Variants
   */
  const navVariants = {
    initial: { y: -100, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -100, opacity: 0 }
  }
  
  const mobileMenuVariants = {
    hidden: { 
      opacity: 0, 
      y: -20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        // Approximate spring via bezier easing
        duration: 0.35,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number]
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    }
  }
  
  const menuItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  }
  
  return (
    <>
      {/* Sacred Navigation Bar */}
      <motion.nav
        initial="initial"
        animate="animate"
        variants={navVariants}
        className={`
          fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out
          ${isScrolled 
            ? 'bg-slate-900/90 border-b border-sacred-gold/20 shadow-sacred-lg backdrop-blur-xl' 
            : 'bg-slate-900/40 border-b border-white/5 backdrop-blur-md'
          }
          ${className}
        `}
        style={{
          backdropFilter: isScrolled ? 'blur(20px) saturate(1.5)' : 'blur(12px)',
          WebkitBackdropFilter: isScrolled ? 'blur(20px) saturate(1.5)' : 'blur(12px)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            
            {/* Sacred Logo & Brand */}
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                href={`/${locale}`}
                className="flex items-center gap-3 group"
                aria-label={isArabic ? 'جيش المفديين - الصفحة الرئيسية' : 'Gaish Elmafdein - Homepage'}
              >
                {/* Sacred Cross Icon */}
                <div className="relative">
                  <motion.div
                    className="w-8 h-8 lg:w-10 lg:h-10 bg-sacred-gradient rounded-lg flex items-center justify-center shadow-sacred"
                    animate={{ 
                      boxShadow: [
                        '0 0 20px rgba(246, 196, 83, 0.3)',
                        '0 0 30px rgba(246, 196, 83, 0.5)',
                        '0 0 20px rgba(246, 196, 83, 0.3)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <span className="text-slate-900 font-bold text-lg lg:text-xl">✝</span>
                  </motion.div>
                </div>
                
                {/* Brand Text */}
                <div className="hidden sm:block">
                  <h1 className={`
                    text-xl lg:text-2xl font-bold text-sacred-gradient bg-gradient-to-r from-sacred-gold to-sacred-amber bg-clip-text text-transparent
                    ${isArabic ? 'font-arabic' : 'font-display'}
                    group-hover:from-sacred-gold-light group-hover:to-sacred-gold transition-all duration-300
                  `}>
                    {isArabic ? 'جيش المفديين' : 'Gaish Elmafdein'}
                  </h1>
                  <p className="text-xs lg:text-sm text-white/60 -mt-1">
                    {isArabic ? 'الكاتدرائية الرقمية الأرثوذكسية' : 'Orthodox Digital Cathedral'}
                  </p>
                </div>
              </Link>
            </motion.div>
            
            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-1 xl:gap-2">
              {SACRED_NAV_ITEMS.map((item) => {
                const IconComponent = item.icon
                const isActive = isActiveRoute(item.href)
                
                return (
                  <motion.div key={item.href} whileHover={{ y: -2 }}>
                    <Link
                      href={`/${locale}${item.href === '/' ? '' : item.href}`}
                      className={`
                        relative flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300
                        ${isActive 
                          ? 'bg-sacred-gold/20 text-sacred-gold border border-sacred-gold/30' 
                          : 'text-white/80 hover:text-sacred-gold hover:bg-white/5'
                        }
                        group focus:outline-none focus:ring-2 focus:ring-sacred-gold focus:ring-offset-2 focus:ring-offset-slate-900
                      `}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <IconComponent className="w-4 h-4 transition-transform group-hover:scale-110" />
                      <span className={`text-sm font-medium ${isArabic ? 'font-arabic' : ''}`}>
                        {isArabic ? item.labelAr : item.labelEn}
                      </span>
                      
                      {/* Badge */}
                      {item.badge && (
                        <motion.span 
                          className="px-2 py-0.5 text-xs font-bold bg-sacred-gradient text-slate-900 rounded-full"
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          {item.badge}
                        </motion.span>
                      )}
                      
                      {/* Active Indicator */}
                      {isActive && (
                        <motion.div
                          layoutId="activeNavItem"
                          className="absolute inset-0 bg-sacred-gold/10 border border-sacred-gold/20 rounded-xl -z-10"
                          transition={{ type: 'spring', damping: 20 }}
                        />
                      )}
                    </Link>
                  </motion.div>
                )
              })}
            </div>
            
            {/* Search & Language Controls */}
            <div className="flex items-center gap-2 lg:gap-4">
              
              {/* Sacred Search */}
              <motion.div 
                className="relative hidden md:block"
                animate={isSearchFocused ? { scale: 1.05 } : { scale: 1 }}
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                  <input
                    type="search"
                    placeholder={isArabic ? 'البحث في الكاتدرائية...' : 'Search the Cathedral...'}
                    className={`
                      w-48 xl:w-64 pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl 
                      text-white placeholder-white/50 text-sm transition-all duration-300
                      focus:outline-none focus:ring-2 focus:ring-sacred-gold focus:border-sacred-gold focus:bg-white/15
                      backdrop-blur-sm
                      ${isArabic ? 'text-right font-arabic' : 'text-left'}
                    `}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    dir={isArabic ? 'rtl' : 'ltr'}
                  />
                </div>
              </motion.div>
              
              {/* Language Selector */}
              <div className="relative">
                <motion.button
                  onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/15 border border-white/20 hover:border-sacred-gold/50 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sacred-gold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={isArabic ? 'تغيير اللغة' : 'Change Language'}
                  aria-expanded={isLanguageMenuOpen}
                >
                  <Globe className="w-4 h-4 text-sacred-gold" />
                  <span className="text-sm font-medium text-white hidden sm:block">
                    {LANGUAGE_OPTIONS.find(lang => lang.code === locale)?.flag}
                  </span>
                  <ChevronDown className={`w-3 h-3 text-white/60 transition-transform ${isLanguageMenuOpen ? 'rotate-180' : ''}`} />
                </motion.button>
                
                {/* Language Dropdown */}
                <AnimatePresence>
                  {isLanguageMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-slate-900/95 border border-white/20 rounded-xl shadow-sacred-lg backdrop-blur-xl overflow-hidden z-50"
                    >
                      {LANGUAGE_OPTIONS.map((lang) => (
                        <Link
                          key={lang.code}
                          href={`/${lang.code}${pathname.replace(/^\/[a-z]{2}/, '') || ''}`}
                          className={`
                            flex items-center gap-3 px-4 py-3 hover:bg-sacred-gold/10 transition-colors
                            ${locale === lang.code ? 'bg-sacred-gold/20 text-sacred-gold' : 'text-white/80 hover:text-white'}
                          `}
                          onClick={() => setIsLanguageMenuOpen(false)}
                        >
                          <span className="text-xl">{lang.flag}</span>
                          <span className="font-medium">{lang.name}</span>
                          {locale === lang.code && (
                            <motion.div 
                              layoutId="activeLang"
                              className="w-2 h-2 bg-sacred-gold rounded-full ml-auto" 
                            />
                          )}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Mobile Menu Button */}
              <motion.button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 bg-white/10 hover:bg-white/15 border border-white/20 hover:border-sacred-gold/50 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sacred-gold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label={isMobileMenuOpen 
                  ? (isArabic ? 'إغلاق القائمة' : 'Close Menu')
                  : (isArabic ? 'فتح القائمة' : 'Open Menu')
                }
                aria-expanded={isMobileMenuOpen}
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="w-5 h-5 text-sacred-gold" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="w-5 h-5 text-white" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>
      
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Mobile Menu */}
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={mobileMenuVariants}
              className="fixed top-20 left-4 right-4 bg-slate-900/95 border border-white/20 rounded-2xl shadow-sacred-lg backdrop-blur-xl overflow-hidden z-50 lg:hidden"
            >
              <div className="p-6">
                
                {/* Mobile Search */}
                <motion.div 
                  variants={menuItemVariants}
                  custom={0}
                  className="mb-6"
                >
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                    <input
                      type="search"
                      placeholder={isArabic ? 'البحث في الكاتدرائية...' : 'Search the Cathedral...'}
                      className={`
                        w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl 
                        text-white placeholder-white/50 transition-all duration-300
                        focus:outline-none focus:ring-2 focus:ring-sacred-gold focus:border-sacred-gold focus:bg-white/15
                        ${isArabic ? 'text-right font-arabic' : 'text-left'}
                      `}
                      dir={isArabic ? 'rtl' : 'ltr'}
                    />
                  </div>
                </motion.div>
                
                {/* Mobile Navigation Items */}
                <nav className="space-y-2">
                  {SACRED_NAV_ITEMS.map((item, i) => {
                    const IconComponent = item.icon
                    const isActive = isActiveRoute(item.href)
                    
                    return (
                      <motion.div key={item.href} variants={menuItemVariants} custom={i + 1}>
                        <Link
                          href={`/${locale}${item.href === '/' ? '' : item.href}`}
                          className={`
                            flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300
                            ${isActive 
                              ? 'bg-sacred-gold/20 text-sacred-gold border border-sacred-gold/30' 
                              : 'text-white/80 hover:text-sacred-gold hover:bg-white/5'
                            }
                            focus:outline-none focus:ring-2 focus:ring-sacred-gold
                          `}
                          onClick={() => setIsMobileMenuOpen(false)}
                          aria-current={isActive ? 'page' : undefined}
                        >
                          <IconComponent className="w-5 h-5" />
                          <span className={`font-medium ${isArabic ? 'font-arabic' : ''}`}>
                            {isArabic ? item.labelAr : item.labelEn}
                          </span>
                          
                          {item.badge && (
                            <span className="px-2 py-0.5 text-xs font-bold bg-sacred-gradient text-slate-900 rounded-full ml-auto">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </motion.div>
                    )
                  })}
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
