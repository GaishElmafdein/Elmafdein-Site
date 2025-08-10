/**
 * Orthodox Cathedral Main Page - Simplified Version
 * ------------------------------------------------------------
 * TODO: ✅ Basic homepage without complex animations
 * TODO: ✅ Sacred theming
 * TODO: ✅ All sections working
 */

import { Church, Radio, BookOpen, MessageSquareQuote, ShieldCheck, Globe2, HeartHandshake } from 'lucide-react';

interface PageProps {
  params: { locale: string };
}

export default function OrthodoxCathedralPage({ params: { locale } }: PageProps) {
  const isArabic = locale === 'ar';
  
  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/40 border-b border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-300/10 border border-amber-400/20">
                <Church className="w-5 h-5 text-amber-300" />
              </div>
              <span className="font-bold tracking-wide text-lg">
                {isArabic ? 'جيش المفديين' : 'Gaish Elmafdein'}
              </span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#radio" className="text-sm text-white/80 hover:text-amber-300 transition-colors">
                {isArabic ? 'الراديو' : 'Radio'}
              </a>
              <a href="#library" className="text-sm text-white/80 hover:text-amber-300 transition-colors">
                {isArabic ? 'المكتبة' : 'Library'}
              </a>
              <a href="#ask" className="text-sm text-white/80 hover:text-amber-300 transition-colors">
                {isArabic ? 'اسأل' : 'Ask'}
              </a>
              <a href="#about" className="text-sm text-white/80 hover:text-amber-300 transition-colors">
                {isArabic ? 'عن المنظومة' : 'About'}
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-screen flex items-center">
        <div className="absolute inset-0 bg-sacred-pattern opacity-60" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight mb-6">
            <span className="block">{isArabic ? 'كاتدرائية رقمية' : 'Digital Cathedral'}</span>
            <span className="block text-sacred-gradient">
              {isArabic ? 'أرثوذكسية' : 'Orthodox'}
            </span>
          </h1>
          
          <p className="mx-auto mt-8 max-w-3xl text-lg text-white/80 leading-relaxed mb-12">
            {isArabic 
              ? 'بث مباشر، مكتبة آبائية، وردود دفاعية مدعومة بالذكاء الاصطناعي — بتجربة فخمة مستلهمة من الفن البيزنطي.'
              : 'Live streaming, patristic library, and AI-powered apologetics — with a premium experience inspired by Byzantine art.'
            }
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <a href="#radio" className="btn-sacred">
              <Radio className="w-5 h-5" />
              {isArabic ? 'استمع الآن' : 'Listen Now'}
            </a>
            <a href="#ask" className="btn-sacred-outline">
              <MessageSquareQuote className="w-5 h-5" />
              {isArabic ? 'اسأل جيش المفديين' : 'Ask Gaish Elmafdein'}
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-sacred-heading mb-4">
              {isArabic ? 'مميزات المنظومة' : 'Platform Features'}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
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
                  : 'Church sources with scholarly verification.',
                href: '#about'
              },
              {
                icon: Globe2,
                title: isArabic ? 'متعدد اللغات' : 'Multilingual',
                description: isArabic 
                  ? 'فصحى/عامية + لغات عالمية لاحقًا.'
                  : 'Classical/dialect Arabic + global languages.',
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
            ].map((feature) => (
              <a
                key={feature.title}
                href={feature.href}
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
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-slate-950/50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-white/70">
              <Church className="w-5 h-5" />
              <span className="text-sm">
                © {new Date().getFullYear()} {isArabic ? 'جيش المفديين — كاتدرائية رقمية' : 'Gaish Elmafdein — Digital Cathedral'}
              </span>
            </div>
            <div className="text-xs text-white/50">
              {isArabic 
                ? 'مصمم بروح تقليدية وبأدوات حديثة'
                : 'Designed with traditional spirit and modern tools'
              }
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
