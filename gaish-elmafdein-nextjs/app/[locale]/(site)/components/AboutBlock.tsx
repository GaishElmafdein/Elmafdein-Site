/**
 * AboutBlock Component - Orthodox Cathedral
 * ------------------------------------------------------------
 * TODO: ✅ About section with features
 * TODO: ✅ Sacred theming explanation
 * TODO: ✅ Technology stack info
 */

'use client';

import { motion } from 'framer-motion';
import { Zap, Shield, Code, CheckCircle } from 'lucide-react';

interface AboutBlockProps {
  locale: string;
  className?: string;
}

export default function AboutBlock({ locale, className = '' }: AboutBlockProps) {
  const isArabic = locale === 'ar';
  
  const content = {
    title: isArabic ? 'لماذا "كاتدرائية رقمية"؟' : 'Why "Digital Cathedral"?',
    description: isArabic 
      ? 'نستلهم جمال الأيقونة والعمارة البيزنطية ونحوّلها إلى تجربة ويب حديثة: تدرجات ذهبية، زخارف خفيفة، وحركة رايقة بدون مبالغة.'
      : 'We draw inspiration from the beauty of icons and Byzantine architecture and transform it into a modern web experience: golden gradients, subtle patterns, and smooth movement without exaggeration.',
    features: isArabic ? [
      'هوية أرثوذكسية واضحة ومُحترمة.',
      'سرعة وأداء عاليان (Tailwind + Next.js).',
      'قابلية تطوير: ربط راديو، مكتبة، وبوت أسئلة.',
      'تصميم مستجيب لجميع الأجهزة.',
      'دعم اللغة العربية مع RTL.',
      'إمكانية الوصول والاستخدام للجميع.'
    ] : [
      'Clear and respectful Orthodox identity.',
      'High speed and performance (Tailwind + Next.js).',
      'Scalability: connecting radio, library, and Q&A bot.',
      'Responsive design for all devices.',
      'Arabic language support with RTL.',
      'Accessibility and usability for everyone.'
    ],
    techStack: {
      title: isArabic ? 'التقنيات المستخدمة' : 'Technology Stack',
      items: [
        {
          icon: Code,
          name: 'Next.js 14',
          description: isArabic ? 'إطار عمل حديث للأداء العالي' : 'Modern framework for high performance'
        },
        {
          icon: Zap,
          name: 'Tailwind CSS',
          description: isArabic ? 'تصميم سريع ومرن' : 'Fast and flexible design'
        },
        {
          icon: Shield,
          name: 'TypeScript',
          description: isArabic ? 'أمان وموثوقية في الكود' : 'Code safety and reliability'
        }
      ]
    }
  };

  return (
    <section id="about" className={`py-20 lg:py-32 border-t border-white/5 ${className}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-sacred-heading mb-6">
              {content.title}
            </h2>
            <p className="text-sacred-subheading mb-8">
              {content.description}
            </p>
            
            {/* Features List */}
            <ul className="space-y-3 mb-8">
              {content.features.map((feature, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle className="w-5 h-5 text-amber-300 mt-0.5 flex-shrink-0" />
                  <span className="text-white/80 text-sm leading-relaxed">
                    {feature}
                  </span>
                </motion.li>
              ))}
            </ul>

            {/* Technology Stack */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                {content.techStack.title}
              </h3>
              <div className="space-y-3">
                {content.techStack.items.map((tech, index) => (
                  <motion.div
                    key={tech.name}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="p-2 rounded-lg bg-amber-300/10 border border-amber-400/20">
                      <tech.icon className="w-4 h-4 text-amber-300" />
                    </div>
                    <div>
                      <div className="font-medium text-white text-sm">{tech.name}</div>
                      <div className="text-xs text-white/60">{tech.description}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
          
          {/* Right Column - Visual */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="card-sacred p-8 bg-sacred-pattern relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-4 right-4 w-16 h-16 bg-amber-300/10 rounded-full blur-xl" />
              <div className="absolute bottom-4 left-4 w-24 h-24 bg-amber-300/5 rounded-full blur-2xl" />
              
              <div className="relative z-10">
                <div className="aspect-video w-full rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 
                              border border-white/10 flex items-center justify-center mb-6">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-amber-300/20 rounded-2xl flex items-center justify-center">
                      <Code className="w-8 h-8 text-amber-300" />
                    </div>
                    <p className="text-white/60 text-sm">
                      {isArabic ? 'تجربة تطوير حديثة' : 'Modern Development Experience'}
                    </p>
                  </div>
                </div>
                
                <div className="text-center">
                  <h4 className="font-semibold text-white mb-2">
                    {isArabic ? 'مفتوح المصدر' : 'Open Source'}
                  </h4>
                  <p className="text-sm text-white/70">
                    {isArabic 
                      ? 'متاح للمجتمع الأرثوذكسي للمساهمة والتطوير'
                      : 'Available for the Orthodox community to contribute and develop'
                    }
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
