"use client";
import { motion } from 'framer-motion';
// (Logo now rendered through EmberLogo component)
import { useState, useCallback, useEffect } from 'react';
import EmberLogo from './EmberLogo';
import SacredFlameHalo from './SacredFlameHalo';
import { mulberry32, randRange } from '@/lib/prng';

interface SacredLogoHeroProps {
  locale: string;
  className?: string;
}

// Text content config to make editing easier (عدل النص هنا فقط)
const HERO_TEXT = {
  ar: {
    title: '',
    lines: [
      { text: 'كاتدرائية رقمية', className: 'from-amber-200 via-amber-400 to-amber-600' },
      { text: 'لتسليم الايمان القويم', className: 'from-yellow-200 via-amber-300 to-red-500' },
      { text: 'المُسلَّم مرة واحدة للقديسين', className: 'from-red-200 via-amber-300 to-amber-500' },
      { text: 'بث حي · دفاعيات · آبائيات · مقارنة "ديانات"', className: 'from-amber-100 via-amber-300 to-yellow-400' },
    ]
  },
  en: {
    title: 'Gaish Elmafdein',
    lines: [
      { text: 'Premium Orthodox Digital Cathedral', className: 'from-amber-200 via-amber-400 to-amber-600' },
      { text: 'Defending the Once Delivered Faith', className: 'from-yellow-200 via-amber-300 to-red-500' },
      { text: 'Heritage · Fathers · Apologetics · Live', className: 'from-amber-100 via-amber-300 to-yellow-400' }
    ]
  }
} as const;

export default function SacredLogoHero({ locale, className = '' }: SacredLogoHeroProps) {
  const isArabic = locale === 'ar';
  const alt = isArabic ? 'شعار جيش المفديين' : 'Gaish Elmafdein Logo';
  const EMBERS = Array.from({ length: 18 });
  // Try multiple candidate paths so the logo appears even if the expected folder isn't created yet.
  const logoCandidates = [
    '/images/logo.png', // preferred path (place file at public/images/logo.png)
    '/logo.png',        // root public fallback
    '/icon.svg'         // existing repo asset final fallback
  ];
  const [logoIdx, setLogoIdx] = useState(0);
  const handleLogoError = useCallback(() => {
    setLogoIdx((i) => (i < logoCandidates.length - 1 ? i + 1 : i));
  }, [logoCandidates.length]);

  // Amen counter (persist locally)
  const [amenCount, setAmenCount] = useState<number>(0);
  useEffect(() => {
    const stored = localStorage.getItem('amen-count');
    if (stored) setAmenCount(parseInt(stored, 10) || 0);
  }, []);
  const handleAmen = () => {
    setAmenCount((c) => {
      const v = c + 1; localStorage.setItem('amen-count', String(v)); return v; });
  };

  return (
    <section
      className={`relative flex flex-col items-center justify-center min-h-[70vh] pt-20 pb-16 overflow-hidden ${className}`}
      aria-label={isArabic ? 'الشعار المقدس' : 'Sacred Logo'}
    >
  {/* تم إزالة طبقة فيديو النار لصالح حل EmberLogo الأخف */}
      {/* BLESSING BANNER TOP */}
  <div className="absolute top-20 sm:top-24 md:top-28 inset-x-0 flex justify-center z-50 px-4">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/40 via-amber-300/20 to-red-500/40 rounded-full blur-md" />
            <div className="relative px-6 py-2 rounded-full border border-amber-400/30 bg-black/30 backdrop-blur-xl shadow-[0_0_25px_rgba(246,196,83,0.25)] animate-pulse">
              <span className="text-amber-200 text-sm sm:text-base font-semibold tracking-wide select-none">
                {isArabic ? '✝ بركة رب المجد يسوع المسيح تكون معكم ✝' : '✝ Blessing of the Lord of Glory be with you ✝'}
              </span>
            </div>
          </div>
          <button
            onClick={handleAmen}
            className="group relative inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-slate-900 font-bold text-sm shadow-lg hover:shadow-amber-500/40 transition-all hover:scale-105 active:scale-95"
          >
            <span className="relative flex items-center gap-2">
              {isArabic ? 'آمين' : 'Amen'}
              <span className="px-2 py-0.5 rounded-md bg-black/30 text-amber-100 text-xs font-mono tracking-wider min-w-[2.5rem] text-center group-active:scale-90 transition-transform">{amenCount}</span>
            </span>
          </button>
        </div>
      </div>

      {/* BACKGROUND AURA */}
      <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center z-0">
        <div className="size-[900px] max-w-none rounded-full bg-[radial-gradient(circle_at_center,rgba(246,196,83,0.50)_0%,rgba(153,27,27,0.25)_45%,rgba(0,0,0,0)_70%)] blur-3xl animate-slow-pulse" />
      </div>
      {/* EMBER LOGO (Canvas Particle Ring) */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className="relative z-30 mt-24 sm:mt-32 md:mt-36"
      >
        <div className="relative w-[520px] h-[520px] flex items-center justify-center">
          {/* Sacred Flame Halo (canvas) */}
          <SacredFlameHalo size={520} ringRadius={170} className="z-0" />
          {/* Existing Ember Logo effect layered above */}
            <EmberLogo
              logoSrc={logoCandidates[logoIdx]}
              alt={alt}
              size={520}
              logoScale={0.68}
              emissionRate={16}
              maxParticles={640}
              ringInner={0.30}
              ringThickness={0.085}
              emberHueMin={18}
              emberHueMax={44}
              exposure={1.05}
              glow={1.1}
              seed={`ember-${locale}`}
              onLogoError={handleLogoError}
              className="relative z-10"
            />
        </div>
      </motion.div>
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden z-40">
        {EMBERS.map((_, i) => {
          // Seed is stable across SSR/CSR: combine locale with index
          const seedBase = Array.from(`${locale}|embers|${i}`)
            .reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 2166136261);
          const rng = mulberry32(seedBase);
          const delay = (i % 6) * 0.8;
          const left = randRange(rng, 15, 85); // percent
          const size = randRange(rng, 4, 10);
          const rise = -420 - randRange(rng, 0, 120);
          const duration = 6 + randRange(rng, 0, 4);
          return (
            <motion.span
              key={i}
              className="absolute rounded-full bg-gradient-to-br from-amber-300/90 to-amber-500/60 shadow-[0_0_8px_rgba(246,196,83,0.5)]"
              style={{ left: `${left}%`, bottom: '-40px', width: size, height: size }}
              initial={{ y: 0, opacity: 0 }}
              animate={{ y: rise, opacity: [0, 1, 0] }}
              transition={{ duration, delay, repeat: Infinity, ease: [0.16, 1, 0.3, 1] }}
            />
          );
        })}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.35 }}
        className={`${isArabic ? 'mt-1 -translate-y-6 md:-translate-y-10 lg:-translate-y-12' : 'mt-6'} text-center max-w-5xl px-6 transition-all`}
      >
        {HERO_TEXT[isArabic ? 'ar' : 'en'].title && (
          <h1 className="font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 text-3xl sm:text-4xl md:text-5xl leading-tight">
            {HERO_TEXT[isArabic ? 'ar' : 'en'].title}
          </h1>
        )}
        <div className="mt-6 space-y-1 text-base sm:text-lg md:text-2xl leading-relaxed font-semibold">
          {HERO_TEXT[isArabic ? 'ar' : 'en'].lines.map((l, idx) => (
            <div
              key={idx}
              className={`font-medium bg-clip-text text-transparent bg-gradient-to-r ${l.className} drop-shadow-[0_0_6px_rgba(246,196,83,0.25)]`}
            >
              {l.text}
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
