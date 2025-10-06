"use client";
// (Logo now rendered through EmberLogo component)

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
// Removed unused imports
import EmberLogo from "./EmberLogo";
import SacredFlameHalo from "./SacredFlameHalo";
import { mulberry32, randRange } from "@/lib/prng";

interface SacredLogoHeroProps {
  locale: string;
  className?: string;
}

// Text content config to make editing easier (عدل النص هنا فقط)
const HERO_TEXT = {
  ar: {
    title: "",
    lines: [
  { text: "كاتدرائية رقمية", className: "font-cairo-play from-amber-200 via-amber-400 to-amber-600" },
  { text: "لتسليم الايمان القويم", className: "font-cairo-play from-yellow-200 via-amber-300 to-red-500" },
  { text: "المُسلَّم مرة واحدة للقديسين", className: "font-cairo-play from-red-200 via-amber-300 to-amber-500" },
  { text: 'بث حي · دفاعيات · آبائيات · مقارنة "ديانات"', className: "font-cairo-play from-amber-100 via-amber-300 to-yellow-400" },
    ],
  },
  en: {
    title: "Gaish Elmafdein",
    lines: [
      { text: "Premium Orthodox Digital Cathedral", className: "from-amber-200 via-amber-400 to-amber-600" },
      { text: "Defending the Once Delivered Faith", className: "from-yellow-200 via-amber-300 to-red-500" },
      { text: "Heritage · Fathers · Apologetics · Live", className: "from-amber-100 via-amber-300 to-yellow-400" },
    ],
  },
} as const;

// Interactive word animation for hero text

const renderInteractiveWords = (text: string, className?: string) => {
  return text.split(/\s+/).map((word, i) => (
    <motion.span
      key={i + '-' + word}
      whileHover={{
        scale: 1.22,
        y: -6,
        rotate: i % 2 === 0 ? 1.2 : -1.2,
        filter: 'drop-shadow(0 0 6px rgba(241,196,15,0.55))'
      }}
      whileTap={{ scale: 0.95 }}
      className={`inline-block relative px-1 cursor-default select-none transition-colors duration-300 ${className || ''}`}
    >
      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-md bg-gradient-to-br from-sacred-gold/0 via-sacred-amber/0 to-sacred-gold/0"
        whileHover={{
          background: 'radial-gradient(circle at 50% 40%, rgba(241,196,15,0.25), rgba(241,196,15,0) 70%)',
          opacity: 1
        }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      />
      <span className="relative z-10">{word}</span>{' '}
    </motion.span>
  ))
}

export default function SacredLogoHero({ locale, className = "" }: SacredLogoHeroProps) {
  const isArabic = locale === "ar";
  const alt = isArabic ? "شعار جيش المفديين" : "Gaish Elmafdein Logo";
  // Removed EMBERS variable

  // Try multiple candidate paths so the logo appears even if the expected folder isn't created yet.
  const logoCandidates = ["/images/logo.png", "/logo.png", "/icon.svg"];
  const [logoIdx, setLogoIdx] = useState(0);
  const handleLogoError = useCallback(() => {
    setLogoIdx((i) => (i < logoCandidates.length - 1 ? i + 1 : i));
  }, [logoCandidates.length]);

  // Amen counter (persist locally)
  const [amenCount, setAmenCount] = useState<number>(0);
  useEffect(() => {
    const stored = localStorage.getItem("amen-count");
    if (stored) setAmenCount(parseInt(stored, 10) || 0);
  }, []);
  const handleAmen = () => {
    setAmenCount((c) => {
      const v = c + 1;
      localStorage.setItem("amen-count", String(v));
      return v;
    });
  };

  // Entrance animation variants for lines
  const lineBaseHidden = { opacity: 0, y: 28, filter: "blur(6px)" };

  // Shimmer animation style helper
  const shimmerKeyframes = ["0% 50%", "100% 50%", "0% 50%"];

  return (
    <section
      className={`relative flex flex-col items-center justify-center min-h-[70vh] pt-20 pb-16 overflow-hidden ${className}`}
      aria-label={isArabic ? "الشعار المقدس" : "Sacred Logo"}
    >
      {/* BLESSING BANNER TOP */}
      <div className="absolute top-20 sm:top-24 md:top-28 inset-x-0 flex justify-center z-50 px-4">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/40 via-amber-300/20 to-red-500/40 rounded-full blur-md" />
            <div className="relative px-6 py-2 rounded-full border border-amber-400/30 bg-black/30 backdrop-blur-xl shadow-[0_0_25px_rgba(246,196,83,0.25)] animate-pulse">
              <span
                className={
                  `block font-cairo-play font-bold text-transparent bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text glow-gold select-none text-base sm:text-lg md:text-xl lg:text-2xl tracking-tight drop-shadow`
                }
                style={{ letterSpacing: '0.7px', lineHeight: '1.18' }}
              >
                {isArabic ? "✝ بركة رب المجد يسوع المسيح تكون معكم ✝" : "✝ Blessing of the Lord of Glory be with you ✝"}
              </span>
            </div>
          </div>
          <button
            onClick={handleAmen}
            className="group relative inline-flex items-center px-2 py-1 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-slate-900 font-bold text-[0.7rem] shadow-[0_0_4px_#000,0_0_8px_#000] hover:shadow-amber-500/40 transition-all hover:scale-105 active:scale-95"
          >
                <span className="relative flex items-center gap-2">
                  <span
                    className={
                      isArabic
                        ? "inline-flex items-center font-lemonada font-bold text-black text-[0.7rem] sm:text-xs md:text-sm lg:text-base drop-shadow tracking-tight select-none"
                        : "inline-flex items-center font-display font-bold text-black text-[0.7rem] sm:text-xs md:text-sm lg:text-base drop-shadow tracking-tight select-none"
                    }
                    style={{ letterSpacing: '0.7px', lineHeight: '1.18' }}
                  >
                    <span className="text-amber-400 text-xs md:text-sm lg:text-base" role="img" aria-label="prayer hands">🙏</span>
                    <span style={{
                    }}>
                      {isArabic ? "آمين" : "Amen"}
                    </span>
                    <span className="ml-1 px-1 py-0.5 rounded-md border-2 border-amber-400 bg-black/40 text-amber-100 text-xs font-mono tracking-wider min-w-[1.7rem] min-h-[1.7rem] flex items-center justify-center text-center group-active:scale-90 transition-transform shadow-[0_0_10px_rgba(246,196,83,0.45)] animate-pulse" style={{marginLeft:0}}>
                      <span className="text-[0.7rem] md:text-xs lg:text-sm font-bold text-amber-200">{amenCount}</span>
                    </span>
                  </span>
                </span>
          </button>
        </div>
      </div>

      {/* BACKGROUND AURA */}
      <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center z-0">
        <div className="size-[900px] max-w-none rounded-full bg-[radial-gradient(circle_at_center,rgba(246,196,83,0.50)_0%,rgba(153,27,27,0.25)_45%,rgba(0,0,0,0)_70%)] blur-3xl animate-slow-pulse" />
      </div>

      {/* EMBER LOGO + HALO */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 1.05 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="relative z-30 mt-24 sm:mt-32 md:mt-36"
      >
        <div className="relative w-[520px] h-[520px] flex items-center justify-center">
          {/* Halo فقط */}
          <SacredFlameHalo size={520} ringRadius={170} intensity="high" className="z-0" />

          {/* 🔥 NEW: إكليل نار خارجي */}
          {/* Sacred Glowing Rays Effect (بديل FireRing) */}
          <motion.div
            className="absolute inset-0 z-10 pointer-events-none"
            initial={{ opacity: 0.7, scale: 1 }}
            animate={{
              opacity: [0.7, 1, 0.8, 1],
              scale: [1, 1.04, 0.98, 1],
              rotate: [0, 8, -6, 0],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg width="520" height="520" viewBox="0 0 520 520" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g>
                {(() => {
                  // Deterministic rays to prevent hydration mismatches
                  // Seed can vary by locale for subtle, stable differences
                  const seedBase = 20250919;
                  const seed = seedBase + (locale === 'ar' ? 1 : 2);
                  const rng = mulberry32(seed);

                  // Helper for consistent rounding between SSR/CSR
                  const round = (n: number, p = 6) => Number(n.toFixed(p));

                  return Array.from({ length: 18 }).map((_, i) => {
                    const angle = i * 20;
                    const rad = (deg: number) => (deg * Math.PI) / 180;
                    const x1 = round(260 + Math.cos(rad(angle - 2)) * 120);
                    const y1 = round(260 + Math.sin(rad(angle - 2)) * 120);
                    const x2 = round(260 + Math.cos(rad(angle)) * 240);
                    const y2 = round(260 + Math.sin(rad(angle)) * 240);
                    const strokeWidth = rng() > 0.5 ? 6 : 3;
                    const opacity = round(randRange(rng, 0.7, 0.9), 12);
                    return (
                      <line
                        key={i}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="url(#rayGradient)"
                        strokeWidth={strokeWidth}
                        opacity={opacity}
                        style={{ filter: 'blur(1.2px)' }}
                      />
                    );
                  });
                })()}
              </g>
              <defs>
                <linearGradient id="rayGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fffbe6" />
                  <stop offset="60%" stopColor="#f1c40f" />
                  <stop offset="90%" stopColor="#dc2626" />
                  <stop offset="100%" stopColor="#7c1c0a" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>

          {/* Realistic Fire Effect */}
          <motion.div
            className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/3 pointer-events-none z-20"
            initial={{ opacity: 0.85, scale: 1 }}
            animate={{
              opacity: [0.85, 1, 0.7, 1],
              scale: [1, 1.05, 0.98, 1],
              y: [0, -12, 0, -8, 0],
            }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg width="72" height="110" viewBox="0 0 72 110" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="flameGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                  <stop offset="0%" stopColor="#fffbe6" />
                  <stop offset="60%" stopColor="#f1c40f" />
                  <stop offset="90%" stopColor="#dc2626" />
                  <stop offset="100%" stopColor="#7c1c0a" />
                </radialGradient>
              </defs>
              <path
                d="M36 110c20-28-10-52 0-76 10 24-20 48 0 76z"
                fill="url(#flameGradient)"
                opacity="0.85"
              />
              <path
                d="M36 92c12-16-5-30 0-44 5 14-10 28 0 44z"
                fill="#f1c40f"
                opacity="0.7"
              />
              <path
                d="M36 80c7-10-3-20 0-28 3 8-6 18 0 28z"
                fill="#fffbe6"
                opacity="0.5"
              />
            </svg>
          </motion.div>

          {/* توهج خفيف إضافي */}
          <div className="absolute inset-0 rounded-full pointer-events-none opacity-70 mix-blend-screen">
            <div className="absolute inset-6 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,200,120,0.35),rgba(255,120,40,0.05)_70%,transparent_80%)] blur-2xl" />
          </div>

          {/* الشعار */}
          <EmberLogo
            logoSrc={logoCandidates[logoIdx]}
            alt={alt}
            size={520}
            logoScale={0.68}
            onLogoError={handleLogoError}
            className="relative z-20"
          />
        </div>
      </motion.div>

  {/* Floating embers removed as requested */}

      {/* TEXT */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.35 }}
        className={`${isArabic ? "mt-1 -translate-y-6 md:-translate-y-10 lg:-translate-y-12" : "mt-6"} text-center max-w-5xl px-6 transition-all`}
      >
        {/* جيــش⚜️المفديـيـن أعلى النص */}
        {isArabic && (
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 80 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
            className="mb-12 md:mb-16 lg:mb-20 flex flex-col items-center justify-center relative"
          >
            <span
              dir="rtl"
              className="font-cairo-play font-bold text-amber-100 text-2xl sm:text-3xl md:text-4xl lg:text-5xl tracking-tight select-none relative"
              style={{
                letterSpacing: '1.2px',
                lineHeight: '1.18',
                textShadow: '0 0 12px #000, 0 0 24px #000, 0 0 2px #fffbe6'
              }}
            >
              جيــش⚜️المفديـيـن
              {/* Fire effect: overlay flames at intervals along the word */}
              <span className="absolute inset-0 pointer-events-none z-10 w-full h-full">
                {[...Array(7)].map((_, idx) => (
                  <motion.span
                    key={idx}
                    className="absolute"
                    style={{ left: `${10 + idx * 12}%`, top: idx % 2 === 0 ? '-18px' : 'auto', bottom: idx % 2 !== 0 ? '-18px' : 'auto' }}
                    initial={{ opacity: 0.7, y: idx % 2 === 0 ? -6 : 6 }}
                    animate={{ opacity: [0.7, 1, 0.7], y: idx % 2 === 0 ? [-6, -12, -6] : [6, 12, 6] }}
                    transition={{ duration: 1.2, repeat: Infinity, repeatType: "reverse", delay: idx * 0.13 }}
                  >
                    <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 10C7 10 11 6 7 0C3 6 7 10 7 10Z" fill="url(#topFlameSmall)"/>
                      <defs>
                        <linearGradient id="topFlameSmall" x1="7" y1="0" x2="7" y2="10" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#f1c40f"/>
                          <stop offset="1" stopColor="#dc2626"/>
                        </linearGradient>
                      </defs>
                    </svg>
                  </motion.span>
                ))}
              </span>
            </span>
          </motion.div>
        )}
        {HERO_TEXT[isArabic ? "ar" : "en"].title && (
          <h1 className="font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 text-3xl sm:text-4xl md:text-5xl leading-tight">
            {HERO_TEXT[isArabic ? "ar" : "en"].title}
          </h1>
        )}
  <div className="mt-24 md:mt-32 lg:mt-36 space-y-1 font-semibold">
          {HERO_TEXT[isArabic ? "ar" : "en"].lines.map((l, idx) => (
            <motion.div
              key={idx}
              initial={lineBaseHidden}
              animate={{
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                transition: { delay: 0.4 + idx * 0.18, duration: 0.85, ease: [0.22, 0.9, 0.3, 1] },
              }}
              whileHover={{ scale: 1.02 }}
              className={`relative group overflow-visible leading-snug tracking-tight font-cairo-play text-[1.2rem] sm:text-[1.5rem] md:text-[1.7rem] xl:text-[2rem] pb-7 drop-shadow-[0_0_10px_rgba(246,196,83,0.25)]`}
              style={{ backgroundSize: "220% 220%" }}
            >
              <motion.span
                aria-hidden
                className="absolute inset-0 -z-10 opacity-40"
                animate={{ backgroundPosition: shimmerKeyframes }}
                transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
                style={{ backgroundImage: "inherit", backgroundClip: "text" }}
              />
              {isArabic ? (
                <motion.span
                  className={`relative z-10 inline-block select-none font-cairo-play bg-gradient-to-r ${l.className.replace('font-cairo-play','')} text-transparent glow-gold moving-light`}
                  style={{ backgroundSize: "240% 240%" }}
                  animate={{
                    backgroundPosition: ["0% 50%","40% 50%","80% 50%","40% 50%","0% 50%"],
                  }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                >
                  {l.text}
                </motion.span>
              ) : (
                renderInteractiveWords(l.text, l.className)
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
