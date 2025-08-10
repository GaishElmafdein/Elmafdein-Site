'use client'

import { motion } from 'framer-motion'
import { Send, Brain, BookOpen, TrendingUp, BarChart3, Users, Zap } from 'lucide-react'
import { OrthodoxCross } from '@/components/ui/orthodox-cross'
import { useState, useRef, useEffect } from 'react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Message {
  id: string
  type: 'user' | 'ai'
  content: string
  sources?: string[]
  confidence?: number
  responseStyle?: string
  timestamp: Date
}

interface AIStats {
  totalQuestions: number
  accuracy: number
  commonThemes: string[]
  trendingDoubts: string[]
  responsesGiven: number
  averageResponseTime: number
}

export default function RAGAIPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'بسم الآب والابن والروح القدس، الإله الواحد. أمين. \n\nمرحباً بكم في نظام الذكاء الصناعي الدفاعي الأرثوذكسي. أنا مدرب على آلاف الكتب والمراجع اللاهوتية لخدمتكم في الدفاع عن الإيمان القويم.\n\nكيف يمكنني مساعدتكم اليوم؟',
      timestamp: new Date()
    }
  ])
  
  const [currentMessage, setCurrentMessage] = useState('')
  const [responseStyle, setResponseStyle] = useState<'detailed' | 'brief' | 'crushing'>('detailed')
  const [language, setLanguage] = useState<'formal' | 'egyptian'>('formal')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [stats] = useState<AIStats>({
    totalQuestions: 15847,
    accuracy: 98.7,
    commonThemes: ['الثالوث', 'التجسد', 'الفداء', 'العذراء مريم', 'القيامة'],
    trendingDoubts: ['شبهات حول الثالوث', 'الكتاب المقدس والعلم', 'مقارنة الأديان'],
    responsesGiven: 12453,
    averageResponseTime: 1.8
  })

  const quickQuestions = [
    { text: 'ما هو الدليل على الثالوث؟', category: 'عقيدة' },
    { text: 'كيف نرد على شبهة تحريف الكتاب المقدس؟', category: 'دفاعي' },
    { text: 'ما قول الآباء في ألوهية المسيح؟', category: 'آبائي' },
    { text: 'شرح سر الإفخارستيا', category: 'أسرار' },
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setCurrentMessage('')
    setIsTyping(true)

    // Simulate AI processing
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: generateAIResponse(userMessage.content, responseStyle, language),
        sources: generateSources(),
        confidence: Math.random() * 20 + 80, // 80-100%
        responseStyle: getStyleLabel(responseStyle),
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)
      
      toast.success('تم الرد بنجاح!', { icon: '🤖' })
    }, 2000)
  }

  const generateAIResponse = (question: string, style: 'detailed' | 'brief' | 'crushing', lang: 'formal' | 'egyptian'): string => {
    const responses = {
      detailed: {
        formal: `بناءً على البحث في قاعدة المعرفة الأرثوذكسية، يمكنني تقديم إجابة شاملة:\n\n${question.includes('الثالوث') ? 'الثالوث الأقدس هو عقيدة أساسية في الإيمان المسيحي الأرثوذكسي. نجد الأدلة الكتابية في...' : 'بحسب تعليم الكنيسة الأرثوذكسية والأدلة الكتابية...'}\n\nالمراجع اللاهوتية تؤكد أن هذا التعليم متجذر في الكتاب المقدس والتقليد الآبائي.`,
        egyptian: `طيب يا حبيبي، الموضوع ده مهم جداً في إيماننا الأرثوذكسي...\n\n${question.includes('الثالوث') ? 'الثالوث ده مش حاجة معقدة، ده الله الواحد في ثلاثة أقانيم...' : 'خليني أقولك الكلام ده بوضوح...'}\n\nوالآباء القديسين علموا كده من زمان.`
      },
      brief: {
        formal: `${question.includes('الثالوث') ? 'الثالوث: الله الواحد في ثلاثة أقانيم. الدليل: (متى 28:19، 2 كو 13:14).' : 'الجواب المختصر بحسب التعليم الأرثوذكسي...'}`,
        egyptian: `${question.includes('الثالوث') ? 'الثالوث: الله واحد في ثلاثة - الآب والابن والروح القدس.' : 'باختصار شديد...'}`
      },
      crushing: {
        formal: `هذا السؤال يتطلب رداً قوياً ومدمراً للشبهات:\n\n${question.includes('شبهة') ? 'هذه الشبهة باطلة تماماً وإليكم الأدلة الساحقة:' : 'الرد المدمر على هذا الافتراء:'}\n\n1. الدليل الكتابي واضح ولا يقبل الجدل\n2. إجماع الآباء والمجامع المسكونية\n3. البراهين التاريخية والأثرية\n\nهذا يدمر كل شبهة ويؤكد الحق الأرثوذكسي.`,
        egyptian: `دي شبهة واهية وهرد عليها رد مدمر:\n\n${question.includes('شبهة') ? 'الشبهة دي مالهاش أساس خالص!' : 'تعالى نشوف الرد الصاعق:'}\n\nالأدلة قوية جداً ومحدش يقدر يرد عليها!`
      }
    }
    
    return responses[style][lang]
  }

  const generateSources = (): string[] => {
    const allSources = [
      'الكتاب المقدس - إنجيل يوحنا',
      'القديس أثناسيوس الرسولي - ضد الأريوسيين',
      'القديس يوحنا الذهبي الفم - تفسير رومية',
      'الأنبا شنودة الثالث - حياة الإيمان',
      'مجمع نيقية الأول 325م',
      'القديس كيرلس الإسكندري - شرح الإنجيل',
      'موقع القديس تكلا هيمانوت',
      'الدكتور جورج حبيب بباوي'
    ]
    
    return allSources.slice(0, Math.floor(Math.random() * 4) + 2)
  }

  const getStyleLabel = (style: string): string => {
    const labels = {
      detailed: 'شرح مفصل',
      brief: 'رد مختصر',
      crushing: 'رد مدمر صاعق'
    }
    return labels[style as keyof typeof labels]
  }

  const handleQuickQuestion = (question: string) => {
    setCurrentMessage(question)
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
          
          <div className="flex items-center gap-4">
            <Brain className="w-6 h-6 text-gold-400" />
            <h1 className="text-2xl font-arabic text-gold-200">نظام الذكاء الصناعي الدفاعي</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6 h-[calc(100vh-150px)]">
          
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4 overflow-y-auto">
            
            {/* AI Settings */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-midnight-800/60 border border-gold-500/30 rounded-lg p-4 backdrop-blur-sm"
            >
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-gold-400" />
                <h3 className="text-gold-300 font-arabic font-bold">إعدادات الذكاء الصناعي</h3>
              </div>
              
              {/* Response Style */}
              <div className="space-y-3">
                <label className="block text-gold-200 font-arabic text-sm">نمط الرد:</label>
                <div className="space-y-2">
                  {[
                    { value: 'detailed', label: 'شرح مفصل', icon: '📚' },
                    { value: 'brief', label: 'رد مختصر', icon: '⚡' },
                    { value: 'crushing', label: 'رد مدمر صاعق', icon: '🔥' }
                  ].map(style => (
                    <label key={style.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value={style.value}
                        checked={responseStyle === style.value}
                        onChange={(e) => setResponseStyle(e.target.value as 'detailed' | 'brief' | 'crushing')}
                        className="accent-gold-500"
                      />
                      <span className="text-gold-200 font-arabic text-sm">
                        {style.icon} {style.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div className="space-y-3 mt-4">
                <label className="block text-gold-200 font-arabic text-sm">لغة الرد:</label>
                <div className="space-y-2">
                  {[
                    { value: 'formal', label: 'عربي فصحى' },
                    { value: 'egyptian', label: 'عامية مصرية' }
                  ].map(lang => (
                    <label key={lang.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value={lang.value}
                        checked={language === lang.value}
                        onChange={(e) => setLanguage(e.target.value as 'formal' | 'egyptian')}
                        className="accent-gold-500"
                      />
                      <span className="text-gold-200 font-arabic text-sm">{lang.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Quick Questions */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-midnight-800/60 border border-gold-500/30 rounded-lg p-4 backdrop-blur-sm"
            >
              <h3 className="text-gold-300 font-arabic font-bold mb-3">أسئلة سريعة</h3>
              <div className="space-y-2">
                {quickQuestions.map((q, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(q.text)}
                    className="w-full text-right p-3 text-gold-200 hover:bg-gold-500/10 rounded transition-colors duration-200 border border-gold-500/20"
                  >
                    <div className="font-arabic text-sm">{q.text}</div>
                    <div className="text-xs text-gold-400 mt-1">{q.category}</div>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* AI Stats */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-midnight-800/60 border border-gold-500/30 rounded-lg p-4 backdrop-blur-sm"
            >
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-5 h-5 text-gold-400" />
                <h3 className="text-gold-300 font-arabic font-bold">إحصائيات الذكاء الصناعي</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gold-200 font-arabic">الأسئلة المجابة</span>
                  <span className="text-gold-400 font-bold">{stats.totalQuestions.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gold-200 font-arabic">دقة الردود</span>
                  <span className="text-green-400 font-bold">{stats.accuracy}%</span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gold-200 font-arabic">متوسط وقت الرد</span>
                  <span className="text-gold-400 font-bold">{stats.averageResponseTime}ث</span>
                </div>
              </div>

              {/* Common Themes */}
              <div className="mt-4">
                <h4 className="text-gold-300 font-arabic text-sm font-bold mb-2">المواضيع الشائعة:</h4>
                <div className="flex flex-wrap gap-1">
                  {stats.commonThemes.map((theme, index) => (
                    <span
                      key={index}
                      className="text-xs bg-gold-500/20 text-gold-300 px-2 py-1 rounded border border-gold-500/30"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </div>

              {/* Trending Doubts */}
              <div className="mt-4">
                <h4 className="text-gold-300 font-arabic text-sm font-bold mb-2 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  شبهات متداولة:
                </h4>
                <div className="space-y-1">
                  {stats.trendingDoubts.map((doubt, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickQuestion(`رد على: ${doubt}`)}
                      className="block w-full text-right text-xs text-flame-300 hover:text-flame-200 p-1 hover:bg-flame-500/10 rounded transition-colors"
                    >
                      🔥 {doubt}
                    </button>
                  ))}
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
              className="flex-1 bg-midnight-800/40 border border-gold-500/30 rounded-lg overflow-hidden backdrop-blur-sm"
            >
              {/* Chat Header */}
              <div className="bg-midnight-700/60 border-b border-gold-500/30 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <OrthodoxCross size="sm" glowing />
                      <motion.div
                        className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </div>
                    <div>
                      <h3 className="text-gold-200 font-arabic font-bold">الذكاء الصناعي الأرثوذكسي</h3>
                      <p className="text-gold-400 text-sm">متاح للخدمة على مدار الساعة</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gold-300">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>1,247 مستخدم نشط</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="w-4 h-4" />
                      <span>استجابة فورية</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages Container */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[calc(100vh-400px)]">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-4 rounded-2xl ${
                        message.type === 'user'
                          ? 'bg-gold-500/20 border border-gold-500/50 text-gold-100'
                          : 'bg-midnight-700/60 border border-gold-500/30 text-gold-200'
                      }`}
                    >
                      {/* AI Avatar */}
                      {message.type === 'ai' && (
                        <div className="flex items-start gap-3 mb-3">
                          <OrthodoxCross size="sm" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-gold-300 font-arabic font-bold text-sm">
                                الذكاء الصناعي الأرثوذكسي
                              </span>
                              {message.responseStyle && (
                                <span className="text-xs bg-gold-500/20 text-gold-300 px-2 py-1 rounded">
                                  {message.responseStyle}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Message Content */}
                      <div className="font-arabic leading-relaxed whitespace-pre-line">
                        {message.content}
                      </div>

                      {/* AI Response Metadata */}
                      {message.type === 'ai' && (
                        <div className="mt-4 pt-3 border-t border-gold-500/20">
                          {/* Confidence Score */}
                          {message.confidence && (
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs text-gold-400">معدل الثقة:</span>
                              <div className="flex-1 bg-midnight-600 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-gold-500 to-green-500 h-2 rounded-full confidence-bar"
                                  style={{ width: `${message.confidence}%` }}
                                />
                              </div>
                              <span className="text-xs text-gold-300">{message.confidence.toFixed(1)}%</span>
                            </div>
                          )}

                          {/* Sources */}
                          {message.sources && message.sources.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <BookOpen className="w-4 h-4 text-gold-400" />
                                <span className="text-xs text-gold-400 font-arabic">المصادر:</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {message.sources.map((source, i) => (
                                  <span
                                    key={i}
                                    className="text-xs bg-gold-500/10 text-gold-300 px-2 py-1 rounded border border-gold-500/30 cursor-pointer hover:bg-gold-500/20 transition-colors"
                                    title={`انقر للانتقال إلى: ${source}`}
                                  >
                                    📖 {source}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Timestamp */}
                      <div className="mt-2 text-xs text-gold-400">
                        {message.timestamp.toLocaleTimeString('ar-EG')}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-midnight-700/60 border border-gold-500/30 rounded-2xl p-4 max-w-[85%]">
                      <div className="flex items-center gap-3">
                        <OrthodoxCross size="sm" />
                        <div className="flex items-center gap-1">
                          <span className="text-gold-300 font-arabic text-sm">جاري التفكير</span>
                          <div className="flex gap-1">
                            {[...Array(3)].map((_, i) => (
                              <motion.div
                                key={i}
                                className="w-2 h-2 bg-gold-500 rounded-full"
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{
                                  duration: 1.5,
                                  repeat: Infinity,
                                  delay: i * 0.2
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </motion.div>

            {/* Input Area */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-4 bg-midnight-800/60 border border-gold-500/30 rounded-lg p-4 backdrop-blur-sm"
            >
              <div className="flex gap-3">
                <textarea
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  placeholder="اطرح سؤالك اللاهوتي أو الدفاعي هنا..."
                  className="flex-1 bg-midnight-700/60 border border-gold-500/30 rounded-lg px-4 py-3 text-gold-100 placeholder-gold-300/50 focus:border-gold-500 focus:outline-none resize-none min-h-[80px]"
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
                  disabled={!currentMessage.trim() || isTyping}
                  className="px-6 py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-midnight-900 font-bold rounded-lg shadow-lg border border-gold-400 hover:from-gold-400 hover:to-gold-500 hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed self-end"
                  title="إرسال السؤال"
                  aria-label="إرسال السؤال"
                >
                  <Send className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex items-center justify-between mt-3 text-xs text-gold-400">
                <div className="flex items-center gap-4">
                  <span>💡 اضغط Enter للإرسال، Shift+Enter لسطر جديد</span>
                  <span className="flex items-center gap-1">
                    <Brain className="w-4 h-4" />
                    مدعوم بـ RAG AI
                  </span>
                </div>
                <span>نمط الرد: {getStyleLabel(responseStyle)} | اللغة: {language === 'formal' ? 'فصحى' : 'عامية'}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
