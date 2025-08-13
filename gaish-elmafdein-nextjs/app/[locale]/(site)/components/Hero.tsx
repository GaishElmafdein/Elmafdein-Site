/**
 * Hero Component - Orthodox Cathedral
 * ------------------------------------------------------------
 * TODO: ✅ Sacred animations
 * TODO: ✅ Responsive design
 * TODO: ✅ Call-to-action buttons
 * TODO: ✅ Marquee features
 */

'use client';

import { motion } from 'framer-motion';
import { ChevronDown,MessageSquareQuote, PlayCircle } from 'lucide-react';

interface HeroProps {
  locale: string;
  className?: string;
}

export default function Hero({ locale, className = '' }: HeroProps) {
  const isArabic = locale === 'ar';
  
  const content = {
    title: isArabic ? 'كاتدرائية رقمية' : 'Digital Cathedral',
    titleHighlight: isArabic ? 'أرثوذكسية' : 'Orthodox',
    subtitle: isArabic 
      ? 'بث مباشر، مكتبة آبائية، وردود دفاعية مدعومة بالذكاء الاصطناعي — بتجربة فخمة مستلهمة من الفن البيزنطي.'
      : 'Live streaming, patristic library, and AI-powered apologetics — with a premium experience inspired by Byzantine art.',
    listenNow: isArabic ? 'استمع الآن' : 'Listen Now',
    askNow: isArabic ? 'اسأل جيش المفديين' : 'Ask Gaish Elmafdein',
    features: isArabic ? [
      '⛪ تراث آبائي',
      '🎙️ راديو 24/7', 
      '📚 مكتبة PDF',
      '🛡️ دفاعيات',
      '🕯️ أيقونات',
      '🌍 لغات متعددة',
      '🤝 مجتمع وخدمة'
    ] : [
      '⛪ Patristic Heritage',
      '🎙️ 24/7 Radio',
      '📚 PDF Library',
      '🛡️ Apologetics',
      '🕯️ Icons',
      '🌍 Multiple Languages',
      '🤝 Community & Service'
    ]
  };

  const fadeInitial = { opacity: 0, y: 30 };
  const fadeAnimate = (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay,
      duration: 0.8,
      // easeOut cubic-bezier
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number]
    }
  });

  const float = {
    y: [0, -10, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      // easeInOut cubic-bezier
      ease: [0.42, 0, 0.58, 1] as [number, number, number, number]
    }
  };

  return (
    <section 
      id="hero" 
      className={`relative overflow-hidden min-h-screen flex items-center ${className}`}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-sacred-pattern opacity-60" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-300/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-300/3 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40 text-center">
        
        {/* Main Title */}
        <motion.div
          initial={fadeInitial}
          animate={fadeAnimate(0)}
          className="space-y-6"
        >
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight">
            <span className="block">{content.title}</span>
            <span className="block text-sacred-gradient animate-float">
              {content.titleHighlight}
            </span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={fadeInitial}
          animate={fadeAnimate(0.1)}
          className="mx-auto mt-8 max-w-3xl text-lg sm:text-xl lg:text-2xl text-white/80 leading-relaxed"
        >
          {content.subtitle}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={fadeInitial}
          animate={fadeAnimate(0.2)}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <motion.a
            href="#radio"
            className="btn-sacred group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <PlayCircle className="w-5 h-5 group-hover:animate-pulse" />
            {content.listenNow}
          </motion.a>
          
          <motion.a
            href="#ask"
            className="btn-sacred-outline group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MessageSquareQuote className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            {content.askNow}
          </motion.a>
        </motion.div>

        {/* Features Marquee */}
        <motion.div
          initial={fadeInitial}
          animate={fadeAnimate(0.3)}
          className="mt-16 lg:mt-24 overflow-hidden"
        >
          <div className="relative">
            <div className="flex animate-marquee whitespace-nowrap">
              {/* Duplicate features for seamless loop */}
              {[...content.features, ...content.features].map((feature, index) => (
                <span
                  key={index}
                  className="mx-8 text-white/60 text-sm sm:text-base tracking-wide font-medium
                           hover:text-amber-300 transition-colors duration-300 cursor-default"
                >
                  {feature}
                </span>
              ))}
            </div>
            
            {/* Gradient overlays */}
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-slate-950 to-transparent" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-slate-950 to-transparent" />
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={fadeInitial}
          animate={fadeAnimate(0.4)}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={float}
            className="flex flex-col items-center gap-2 text-white/60 text-sm"
          >
            <span>{isArabic ? 'تصفح المحتوى' : 'Explore Content'}</span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
