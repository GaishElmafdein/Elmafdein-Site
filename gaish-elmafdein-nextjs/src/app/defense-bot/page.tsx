'use client'

import { useState } from 'react'
import Link from 'next/link'

import { motion } from 'framer-motion'
import { Send } from 'lucide-react'
import toast from 'react-hot-toast'

import { OrthodoxCross } from '@/components/ui/orthodox-cross'

export default function DefenseBotPage() {
  const [message, setMessage] = useState('')
  const [language, setLanguage] = useState<'classical' | 'egyptian'>('classical')
  const [messages, setMessages] = useState<Array<{
    type: 'bot' | 'user';
    content: string;
    timestamp: Date;
    sources: string[];
  }>>([
    {
      type: 'bot',
      content: 'السلام عليكم ورحمة الله وبركاته. أنا بوت الدفاع الأرثوذكسي، مستعد للرد على استفساراتكم اللاهوتية بالأدلة والمراجع.',
      timestamp: new Date(),
      sources: []
    }
  ])

  const quickCommands = [
    { text: 'اديني شبهة', icon: '⚔️' },
    { text: 'هات لي قول من الآباء', icon: '✝️' },
    { text: 'رد مدمر', icon: '🔥' },
    { text: 'شرح عقيدة', icon: '📖' },
  ]

  const handleSendMessage = () => {
    if (!message.trim()) return

    // Add user message
    const userMessage = {
      type: 'user' as const,
      content: message,
      timestamp: new Date(),
      sources: []
    }

    setMessages(prev => [...prev, userMessage])

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        type: 'bot' as const,
        content: language === 'classical' 
          ? 'بناءً على تعليم الكنيسة الأرثوذكسية والأدلة الكتابية، يمكنني القول...' 
          : 'بص يا حبيبي، الموضوع ده واضح في تعليم الكنيسة...',
        timestamp: new Date(),
        sources: ['القديس يوحنا الذهبي الفم', 'القديس أثناسيوس الرسولي', 'موقع القديس تكلا']
      }
      setMessages(prev => [...prev, aiResponse])
    }, 1500)

    setMessage('')
    toast.success('تم إرسال السؤال للبوت الدفاعي', { icon: '🤖' })
  }

  return (
    <div className="min-h-screen bg-sacred-gradient">
      {/* Header */}
      <header className="border-b border-gold-500/30 bg-midnight-800/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <OrthodoxCross size="sm" />
            <span className="text-lg font-display text-sacred-gold">جيش المفديين</span>
          </Link>
          
          <h1 className="text-2xl font-arabic text-gold-200">البوت الدفاعي الأرثوذكسي</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Language Selection */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-midnight-800/60 border border-gold-500/30 rounded-lg p-4"
            >
              <h3 className="text-gold-400 font-arabic mb-3">لغة الرد</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="classical"
                    checked={language === 'classical'}
                    onChange={(e) => setLanguage(e.target.value as 'classical')}
                    className="text-gold-500"
                  />
                  <span className="text-gold-200">عربي فصحى</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="egyptian"
                    checked={language === 'egyptian'}
                    onChange={(e) => setLanguage(e.target.value as 'egyptian')}
                    className="text-gold-500"
                  />
                  <span className="text-gold-200">عامية مصرية</span>
                </label>
              </div>
            </motion.div>

            {/* Quick Commands */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-midnight-800/60 border border-gold-500/30 rounded-lg p-4"
            >
              <h3 className="text-gold-400 font-arabic mb-3">أوامر سريعة</h3>
              <div className="space-y-2">
                {quickCommands.map((cmd, index) => (
                  <button
                    key={index}
                    onClick={() => setMessage(cmd.text)}
                    className="w-full text-right p-2 text-gold-200 hover:bg-gold-500/10 rounded transition-colors duration-200"
                  >
                    <span className="mr-2">{cmd.icon}</span>
                    {cmd.text}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-midnight-800/60 border border-gold-500/30 rounded-lg p-4"
            >
              <h3 className="text-gold-400 font-arabic mb-3">إحصائيات</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gold-200">
                  <span>الردود اليوم</span>
                  <span className="text-gold-400">247</span>
                </div>
                <div className="flex justify-between text-gold-200">
                  <span>المصادر المتاحة</span>
                  <span className="text-gold-400">1,547</span>
                </div>
                <div className="flex justify-between text-gold-200">
                  <span>معدل الدقة</span>
                  <span className="text-gold-400">99.8%</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3 flex flex-col">
            {/* Messages */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 bg-midnight-800/40 border border-gold-500/30 rounded-lg p-4 overflow-y-auto space-y-4 mb-4"
            >
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-lg ${
                      msg.type === 'user'
                        ? 'bg-gold-500/20 border border-gold-500/50 text-gold-100'
                        : 'bg-midnight-700/60 border border-gold-500/30 text-gold-200'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {msg.type === 'bot' && (
                        <OrthodoxCross size="sm" className="mt-1" />
                      )}
                      <div className="flex-1">
                        <p className="font-arabic leading-relaxed">{msg.content}</p>
                        
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gold-500/20">
                            <p className="text-xs text-gold-400 mb-2">المصادر:</p>
                            <div className="flex flex-wrap gap-2">
                              {msg.sources.map((source, i) => (
                                <span
                                  key={i}
                                  className="text-xs bg-gold-500/10 text-gold-300 px-2 py-1 rounded border border-gold-500/30"
                                >
                                  {source}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <p className="text-xs text-gold-400 mt-2">
                          {msg.timestamp.toLocaleTimeString('ar-EG')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Input Area */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-midnight-800/60 border border-gold-500/30 rounded-lg p-4"
            >
              <div className="flex gap-3">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="اكتب سؤالك اللاهوتي هنا..."
                  className="flex-1 bg-midnight-700/60 border border-gold-500/30 rounded-lg px-4 py-3 text-gold-100 placeholder-gold-300/50 focus:border-gold-500 focus:outline-none resize-none"
                  rows={3}
                  dir="rtl"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-midnight-900 font-bold rounded-lg shadow-lg border border-gold-400 hover:from-gold-400 hover:to-gold-500 hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="إرسال الرسالة"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex items-center justify-between mt-3 text-xs text-gold-400">
                <span>اضغط Enter للإرسال، Shift+Enter لسطر جديد</span>
                <span>مدعوم بالذكاء الصناعي الأرثوذكسي</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
