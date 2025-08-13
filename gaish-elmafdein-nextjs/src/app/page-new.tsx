'use client'

import { useState } from 'react'

import { motion } from 'framer-motion'
import { BookOpen, Radio, Search, Sword, Volume2 } from 'lucide-react'
import toast from 'react-hot-toast'

import { OrthodoxCross } from '@/components/ui/orthodox-cross'
import { SacredBackground } from '@/components/ui/sacred-background'

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [amenCount, setAmenCount] = useState(1447)

  const handleAmenClick = () => {
    setAmenCount((prev: number) => prev + 1)
    toast.success('أمين! ✝️', {
      icon: '🙏',
      duration: 1500,
    })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      toast.success('جاري البحث في المصادر الأرثوذكسية...', {
        icon: '🔍',
        duration: 3000,
      })
    }
  }

  const navItems = [
    { icon: Sword, label: 'البوت الدفاعي', href: '/defense-bot', color: 'flame' },
    { icon: Radio, label: 'الراديو المباشر', href: '/radio', color: 'gold' },
    { icon: BookOpen, label: 'المكتبة الرقمية', href: '/library', color: 'midnight' },
    { icon: Volume2, label: 'المناظرات الحية', href: '/debates', color: 'flame' },
  ]

  return (
    <>
      <SacredBackground />
      
      <main className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden">
        {/* Sacred Header */}
        <motion.header 
          className="absolute top-6 left-6 right-6 flex justify-between items-center z-20"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-4">
            <OrthodoxCross size="sm" />
            <h1 className="text-xl font-display text-sacred-gold">
              جيش ⚜️ المفديين
            </h1>
          </div>
          
          <motion.button
            onClick={handleAmenClick}
            className="flex items-center gap-2 px-4 py-2 bg-gold-500/20 border border-gold-500/50 rounded-lg hover:bg-gold-500/30 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-gold-400">أمين</span>
            <span className="text-gold-300 text-sm">({amenCount.toLocaleString()})</span>
          </motion.button>
        </motion.header>

        {/* Hero Section */}
        <div className="text-center space-y-8 max-w-4xl mx-auto relative z-10">
          {/* Main Cross */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="flex justify-center"
          >
            <OrthodoxCross size="xl" className="animate-holy-float" />
          </motion.div>

          {/* Sacred Title */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="space-y-4"
          >
            <h1 className="text-4xl md:text-6xl font-display text-sacred-gold leading-tight">
              الكاتدرائية الرقمية الأرثوذكسية
            </h1>
            <p className="text-xl md:text-2xl text-gold-200 font-arabic">
              الذراع الرقمي للدفاع عن الإيمان القويم
            </p>
            <div className="w-32 h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent mx-auto"></div>
          </motion.div>

          {/* Sacred Search */}
          <motion.form
            onSubmit={handleSearch}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="relative max-w-2xl mx-auto"
          >
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="هل تبحث عن رد صاعق؟ أم كلمة من أحد الآباء؟ اختر طريقك..."
                className="w-full px-6 py-4 bg-midnight-800/80 border-2 border-gold-500/30 rounded-xl text-gold-100 placeholder-gold-300/70 focus:border-gold-500 focus:outline-none transition-all duration-300 backdrop-blur-sm"
                dir="rtl"
              />
              <button
                type="submit"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 hover:bg-gold-500/20 rounded-lg transition-all duration-300"
              >
                <Search className="w-6 h-6 text-gold-400" />
              </button>
            </div>
          </motion.form>

          {/* Sacred Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12"
          >
            {navItems.map((item, index) => (
              <motion.a
                key={item.label}
                href={item.href}
                className="group relative p-6 bg-midnight-800/40 border border-gold-500/30 rounded-xl backdrop-blur-sm hover:border-gold-500 transition-all duration-500 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.8 + index * 0.1 }}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 20px 40px rgba(241, 196, 15, 0.2)"
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-gold-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                
                <div className="relative flex flex-col items-center text-center space-y-4">
                  <div className={`
                    p-4 rounded-full 
                    ${item.color === 'flame' ? 'bg-flame-600/20 text-flame-400' : ''}
                    ${item.color === 'gold' ? 'bg-gold-500/20 text-gold-400' : ''}
                    ${item.color === 'midnight' ? 'bg-midnight-600/20 text-midnight-300' : ''}
                    group-hover:scale-110 transition-all duration-300
                  `}>
                    <item.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-arabic text-gold-100 group-hover:text-gold-300 transition-colors duration-300">
                    {item.label}
                  </h3>
                </div>

                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gold-500/10 via-gold-400/5 to-gold-500/10"></div>
                </div>
              </motion.a>
            ))}
          </motion.div>

          {/* Holy War Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2.2, duration: 0.8 }}
            className="mt-12"
          >
            <motion.button
              onClick={() => {
                toast.success('🔥 الحرب المقدسة قد بدأت! 🔥', {
                  icon: '⚔️',
                  duration: 3000,
                })
              }}
              className="relative px-8 py-4 bg-gradient-to-r from-flame-600 to-flame-500 text-white font-bold rounded-xl shadow-xl border border-flame-400 overflow-hidden group"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(220, 38, 38, 0.4)"
              }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-flame-700 to-flame-500 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-flame"></div>
              
              <span className="relative flex items-center gap-2">
                <Sword className="w-5 h-5" />
                الحرب المقدسة
                <Sword className="w-5 h-5" />
              </span>
            </motion.button>
          </motion.div>
        </div>

        {/* Sacred Footer Quote */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1 }}
          className="absolute bottom-6 left-6 right-6 text-center z-10"
        >
          <div className="max-w-2xl mx-auto p-4 bg-midnight-800/60 border border-gold-500/30 rounded-lg backdrop-blur-sm">
            <p className="text-gold-200 italic font-arabic text-sm md:text-base">
              &quot;كونوا مستعدين في كل حين لمجاوبة كل من يسألكم عن سبب الرجاء الذي فيكم بوداعة وخوف&quot;
            </p>
            <p className="text-gold-400 text-xs mt-2">
              ١ بطرس ٣:١٥
            </p>
          </div>
        </motion.footer>
      </main>
    </>
  )
}
