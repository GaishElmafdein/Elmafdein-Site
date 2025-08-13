'use client'

import { useEffect, useMemo,useRef, useState } from 'react'
import Link from 'next/link'

import { motion } from 'framer-motion'
import { Calendar,Clock, Mic, Pause, Play, Radio as RadioIcon, Volume2, VolumeX } from 'lucide-react'
import toast from 'react-hot-toast'

import { OrthodoxCross } from '@/components/ui/orthodox-cross'

export default function RadioPage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.8)
  const [isMuted, setIsMuted] = useState(false)
  const [currentProgram, setCurrentProgram] = useState('برنامج الدفاع الأرثوذكسي')
  const [listeners, setListeners] = useState(847)
  const playerRef = useRef<HTMLAudioElement>(null)

  // Simulate live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setListeners(prev => prev + Math.floor(Math.random() * 5) - 2)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
    if (!isPlaying) {
      toast.success('🎵 بدء البث المباشر', { icon: '📻' })
    } else {
      toast('⏸️ تم إيقاف البث مؤقتاً', { icon: '📻' })
    }
  }

  const handleAskRadio = () => {
    setIsPlaying(false)
    toast.loading('جاري إيقاف البث للرد على سؤالكم...', { duration: 2000 })
    setTimeout(() => {
      toast.success('🎙️ مرحباً، ما سؤالكم اللاهوتي؟', { 
        icon: '🤖',
        duration: 4000 
      })
    }, 2000)
  }

  const schedule = useMemo(() => ([
    { time: '06:00', program: 'صلاة الفجر والتأمل' },
    { time: '09:00', program: 'تفسير الكتاب المقدس' },
    { time: '12:00', program: 'الدفاع الأرثوذكسي' },
    { time: '15:00', program: 'أقوال الآباء' },
    { time: '18:00', program: 'ردود على الشبهات' },
    { time: '21:00', program: 'صلاة العشية' },
  ] as { time: string; program: string }[]), [])

  // Determine current/next program every minute and update state (uses setter to avoid unused var lint)
  useEffect(() => {
    const pickProgram = () => {
      const now = new Date()
      const currentMinutes = now.getHours() * 60 + now.getMinutes()
      const activeSlot = [...schedule].reverse().find(slot => {
        const [h, m] = slot.time.split(':').map(Number)
        return h * 60 + m <= currentMinutes
      }) || schedule[0]
      setCurrentProgram(activeSlot.program)
    }
    pickProgram()
    const interval = setInterval(pickProgram, 60000)
    return () => clearInterval(interval)
  }, [schedule])

  return (
    <div className="min-h-screen bg-sacred-gradient relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-10 -right-10 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-10 -left-10 w-96 h-96 bg-flame-500/5 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.6, 0.3, 0.6]
          }}
          transition={{ duration: 6, repeat: Infinity }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-gold-500/30 bg-midnight-800/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <OrthodoxCross size="sm" />
            <span className="text-lg font-display text-sacred-gold">جيش المفديين</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gold-200">
              <RadioIcon className="w-5 h-5" />
              <span className="font-arabic">الراديو المباشر</span>
            </div>
            <div className="text-sm text-gold-400">
              {listeners.toLocaleString()} مستمع
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Player */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Ancient Scroll Player */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative bg-gradient-to-br from-midnight-800/60 to-midnight-900/60 border-2 border-gold-500/40 rounded-2xl p-8 backdrop-blur-sm overflow-hidden"
            >
              {/* Decorative corners */}
              <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-gold-500/60 rounded-tl-2xl"></div>
              <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-gold-500/60 rounded-tr-2xl"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-gold-500/60 rounded-bl-2xl"></div>
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-gold-500/60 rounded-br-2xl"></div>

              {/* Center Cross */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-10">
                <OrthodoxCross size="xl" />
              </div>

              <div className="relative z-10 text-center space-y-6">
                <motion.div
                  animate={isPlaying ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <OrthodoxCross size="lg" glowing={isPlaying} />
                </motion.div>

                <div>
                  <h1 className="text-3xl font-display text-sacred-gold mb-2">
                    إذاعة جيش المفديين
                  </h1>
                  <p className="text-gold-200 font-arabic">
                    الحق يحرركم - البث المباشر الأرثوذكسي
                  </p>
                </div>

                {/* Now Playing */}
                <div className="bg-midnight-700/40 border border-gold-500/30 rounded-lg p-4">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <Mic className="w-5 h-5 text-gold-400" />
                    <span className="text-gold-300 font-arabic">البرنامج الحالي</span>
                  </div>
                  <h2 className="text-xl text-gold-100 font-arabic">{currentProgram}</h2>
                  
                  {/* Live Indicator */}
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <motion.div
                      className="w-3 h-3 bg-flame-500 rounded-full"
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    <span className="text-flame-400 text-sm font-bold">مباشر الآن</span>
                  </div>
                </div>

                {/* Player Controls */}
                <div className="flex items-center justify-center gap-6">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-3 hover:bg-gold-500/20 rounded-full transition-all duration-300"
                  >
                    {isMuted ? (
                      <VolumeX className="w-6 h-6 text-gold-400" />
                    ) : (
                      <Volume2 className="w-6 h-6 text-gold-400" />
                    )}
                  </button>

                  <motion.button
                    onClick={handlePlayPause}
                    className="relative p-6 bg-gradient-to-r from-gold-500 to-gold-600 text-midnight-900 rounded-full shadow-2xl hover:from-gold-400 hover:to-gold-500 transition-all duration-300"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8" />
                    ) : (
                      <Play className="w-8 h-8" />
                    )}
                    
                    {/* Pulse effect when playing */}
                    {isPlaying && (
                      <motion.div
                        className="absolute inset-0 bg-gold-500 rounded-full"
                        animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                  </motion.button>

                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-gold-400" />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-20 accent-gold-500"
                      aria-label="مستوى الصوت"
                    />
                  </div>
                </div>

                {/* Audio Player Simulation */}
                <div className="hidden">
                  <audio
                    ref={playerRef}
                    controls
                    preload="none"
                  >
                    <source src="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" type="application/vnd.apple.mpegurl" />
                    متصفحك لا يدعم عنصر الصوت.
                  </audio>
                </div>
              </div>
            </motion.div>

            {/* Ask Radio AI */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-flame-900/30 to-flame-800/30 border-2 border-flame-500/40 rounded-xl p-6 backdrop-blur-sm"
            >
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-flame-500/20 border border-flame-500/50 rounded-full">
                  <Mic className="w-5 h-5 text-flame-400" />
                  <span className="text-flame-300 font-arabic">اسأل الراديو</span>
                </div>
                
                <p className="text-flame-200 font-arabic leading-relaxed">
                  لديك سؤال لاهوتي؟ سيتم إيقاف البث مؤقتاً للرد عليك بصوت أرثوذكسي
                </p>
                
                <motion.button
                  onClick={handleAskRadio}
                  className="px-8 py-4 bg-gradient-to-r from-flame-600 to-flame-500 text-white font-bold rounded-xl shadow-xl border border-flame-400 hover:from-flame-500 hover:to-flame-400 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="flex items-center gap-2">
                    <Mic className="w-5 h-5" />
                    اسأل الآن
                  </span>
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Schedule */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-midnight-800/60 border border-gold-500/30 rounded-lg p-6 backdrop-blur-sm"
            >
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-gold-400" />
                <h3 className="text-gold-300 font-arabic font-bold">جدول البرامج</h3>
              </div>
              
              <div className="space-y-3">
                {schedule.map((item, index) => {
                  const [h, m] = item.time.split(':').map(Number)
                  const startMinutes = h * 60 + m
                  const now = new Date()
                  const currentMinutes = now.getHours() * 60 + now.getMinutes()
                  // Determine next slot start
                  const next = schedule[index + 1]
                  const nextStart = next ? (() => { const [hh, mm] = next.time.split(':').map(Number); return hh * 60 + mm })() : 24 * 60
                  let status: 'ended' | 'live' | 'upcoming' = 'upcoming'
                  if (currentMinutes >= startMinutes && currentMinutes < nextStart) status = 'live'
                  else if (currentMinutes >= nextStart) status = 'ended'
                  return (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border transition-all duration-300 ${
                        status === 'live'
                          ? 'bg-flame-500/20 border-flame-500/50 text-flame-200'
                          : status === 'upcoming'
                          ? 'bg-gold-500/10 border-gold-500/30 text-gold-200'
                          : 'bg-midnight-700/40 border-midnight-600/50 text-midnight-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm font-mono">{item.time}</span>
                        </div>
                        <div className="text-xs">
                          {status === 'live' && (
                            <span className="px-2 py-1 bg-flame-500 text-white rounded-full">مباشر</span>
                          )}
                          {status === 'upcoming' && (
                            <span className="px-2 py-1 bg-gold-500 text-midnight-900 rounded-full">قادم</span>
                          )}
                          {status === 'ended' && (
                            <span className="px-2 py-1 bg-midnight-600 text-midnight-300 rounded-full">انتهى</span>
                          )}
                        </div>
                      </div>
                      <p className="font-arabic text-sm mt-1">{item.program}</p>
                    </div>
                  )
                })}
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-midnight-800/60 border border-gold-500/30 rounded-lg p-6 backdrop-blur-sm"
            >
              <h3 className="text-gold-300 font-arabic font-bold mb-4">إحصائيات البث</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gold-200 font-arabic">المستمعون الآن</span>
                  <span className="text-gold-400 font-bold">{listeners.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gold-200 font-arabic">ساعات البث اليوم</span>
                  <span className="text-gold-400 font-bold">18 ساعة</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gold-200 font-arabic">الردود الصوتية</span>
                  <span className="text-gold-400 font-bold">47</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gold-200 font-arabic">جودة البث</span>
                  <span className="text-green-400 font-bold">HD</span>
                </div>
              </div>
            </motion.div>

            {/* Archive */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-midnight-800/60 border border-gold-500/30 rounded-lg p-6 backdrop-blur-sm"
            >
              <h3 className="text-gold-300 font-arabic font-bold mb-4">أرشيف البرامج</h3>
              
              <div className="space-y-2">
                {[
                  'تفسير رسالة رومية',
                  'الرد على الشبهات الحديثة',
                  'أقوال الأنبا أنطونيوس',
                  'اللاهوت الدفاعي'
                ].map((program, index) => (
                  <button
                    key={index}
                    className="w-full text-right p-2 text-gold-200 hover:bg-gold-500/10 rounded transition-colors duration-200 font-arabic text-sm"
                  >
                    {program}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Sticky Now Playing Bar */}
      {isPlaying && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 bg-midnight-800/95 border-t border-gold-500/30 backdrop-blur-sm z-50"
        >
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.div
                  className="w-12 h-12 bg-gradient-to-r from-gold-500 to-gold-600 rounded-full flex items-center justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <RadioIcon className="w-6 h-6 text-midnight-900" />
                </motion.div>
                
                <div>
                  <p className="text-gold-200 font-arabic font-bold">{currentProgram}</p>
                  <p className="text-gold-400 text-sm">إذاعة جيش المفديين</p>
                </div>
              </div>

              {/* Animated Equalizer */}
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-gold-500 rounded-full"
                    animate={{
                      height: [8, 20, 8, 16, 8],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                  />
                ))}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-gold-300 text-sm">{listeners.toLocaleString()} مستمع</span>
                <button
                  onClick={handlePlayPause}
                  className="p-2 hover:bg-gold-500/20 rounded-full transition-all duration-300"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-gold-400" />
                  ) : (
                    <Play className="w-5 h-5 text-gold-400" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
