/**
 * FeatureGrid Component - Orthodox Cathedral
 * ------------------------------------------------------------
 * TODO: ✅ Feature cards with icons
 * TODO: ✅ Sacred hover effects
 * TODO: ✅ Responsive grid
 */

'use client';

import { motion } from 'framer-motion';
import { Radio, BookOpen, MessageSquareQuote, ShieldCheck, Globe2, HeartHandshake } from 'lucide-react';

interface FeatureGridProps {
  locale: string;
  className?: string;
}

export default function FeatureGrid({ locale, className = '' }: FeatureGridProps) {
  const isArabic = locale === 'ar';
  
  const features = [
    {
      icon: Radio,
      title: isArabic ? 'راديو المفديين' : 'Redeemed Radio',
      description: isArabic 
        ? 'بث مباشر ومقاطع مأثورة + برنامج يومي.'
        : 'Live streaming and memorable clips + daily program.',
      href: '#radio'
    },
    {
      icon: BookOpen,
      title: isArabic ? 'مكتبة آبائية' : 'Patristic Library',
      description: isArabic 
        ? 'كتب، مخطوطات، واقتباسات موثّقة.'
        : 'Books, manuscripts, and documented quotes.',
      href: '#library'
    },
    {
      icon: MessageSquareQuote,
      title: isArabic ? 'اسأل جيش المفديين' : 'Ask Gaish Elmafdein',
      description: isArabic 
        ? 'ردود أرثوذكسية دقيقة بالعربية والعامية.'
        : 'Accurate Orthodox responses in Arabic and dialects.',
      href: '#ask'
    },
    {
      icon: ShieldCheck,
      title: isArabic ? 'مرجع موثّق' : 'Documented Reference',
      description: isArabic 
        ? 'مصادر كنسية وتحقيق علمي ونقد نصي.'
        : 'Church sources with scholarly verification and textual criticism.',
      href: '#about'
    },
    {
      icon: Globe2,
      title: isArabic ? 'متعدد اللغات' : 'Multilingual',
      description: isArabic 
        ? 'فصحى/عامية + لغات عالمية لاحقًا.'
        : 'Classical/dialect Arabic + global languages later.',
      href: '#about'
    },
    {
      icon: HeartHandshake,
      title: isArabic ? 'مجتمع حي' : 'Living Community',
      description: isArabic 
        ? 'XP, تحديات، ومساهمات تطوعية.'
        : 'XP, challenges, and volunteer contributions.',
      href: '#about'
    }
  ];

  return (
    <section id="features" className={`py-20 lg:py-32 ${className}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-sacred-heading mb-4">
            {isArabic ? 'مميزات المنظومة' : 'Platform Features'}
          </h2>
          <p className="text-sacred-subheading max-w-2xl mx-auto">
            {isArabic 
              ? 'اكتشف كنوز التراث الأرثوذكسي من خلال أدوات حديثة ومتطورة'
              : 'Discover Orthodox heritage treasures through modern and advanced tools'
            }
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.a
              key={feature.title}
              href={feature.href}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ 
                delay: index * 0.1, 
                duration: 0.6,
                ease: "easeOut"
              }}
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              className="card-sacred-glow group cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="p-3 rounded-xl bg-amber-300/10 border border-amber-400/20 
                                group-hover:bg-amber-300/20 group-hover:border-amber-400/40 
                                transition-all duration-300">
                    <feature.icon className="w-6 h-6 text-amber-300" />
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-amber-200 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sacred-body text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
              
              {/* Hover indicator */}
              <div className="mt-4 flex items-center gap-2 text-amber-300/70 group-hover:text-amber-300 
                            transition-colors text-sm font-medium">
                <span>{isArabic ? 'استكشف' : 'Explore'}</span>
                <div className="w-4 h-0.5 bg-current group-hover:w-8 transition-all duration-300" />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
