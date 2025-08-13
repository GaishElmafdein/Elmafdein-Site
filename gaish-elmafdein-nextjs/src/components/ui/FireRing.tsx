"use client";
import { motion } from "framer-motion";

type Props = {
  size?: number;        // القطر الكلي للحلقة
  thickness?: number;   // سُمك اللهب
  className?: string;
  intensity?: "low" | "med" | "high";
};

/**
 * حلقة نار واقعية حول الشعار:
 * - SVG stroke + فلتر feTurbulence/feDisplacementMap لموجات اللهب
 * - تدرّج لوني ذهبي/برتقالي/أحمر
 * - layer توهج خارجي + دوّار شرر خفيف
 */
export default function FireRing({
  size = 560,
  thickness = 26,
  className = "",
  intensity = "high",
}: Props) {
  const radius = size / 2 - thickness / 2;

  // شدة اللهب (تغيير في تردد التشوّه + البلور)
  const baseFreq = intensity === "high" ? 0.012 : intensity === "med" ? 0.02 : 0.03;
  const dispScale = intensity === "high" ? 22 : intensity === "med" ? 16 : 12;
  const blurStd = intensity === "high" ? 1.2 : intensity === "med" ? 1.6 : 2;

  return (
    <div className={`pointer-events-none absolute inset-0 flex items-center justify-center ${className}`}>
      {/* وهج خارجي ناعم */}
      <div
        aria-hidden
        className="absolute rounded-full blur-2xl"
        style={{
          width: size * 1.06,
          height: size * 1.06,
          background:
            "radial-gradient(circle, rgba(255,205,120,0.22) 0%, rgba(251,146,60,0.18) 40%, rgba(244,63,94,0.12) 60%, rgba(0,0,0,0) 70%)",
          maskImage: "radial-gradient(circle, transparent 56%, black 58%)",
        }}
      />

      {/* حلقة الشرر الدوّارة */}
      <motion.div
        aria-hidden
        className="absolute rounded-full mix-blend-screen"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
        style={{
          width: size * 1.02,
          height: size * 1.02,
          background:
            "conic-gradient(from 0deg, rgba(253,230,138,.0) 0 12deg, rgba(253,230,138,.85) 13deg 14deg, rgba(253,230,138,.0) 15deg 30deg, rgba(248,181,80,.65) 31deg 32deg, rgba(253,230,138,.0) 33deg 60deg, rgba(255,180,60,.6) 61deg 62deg, rgba(253,230,138,.0) 63deg 90deg, rgba(255,220,140,.75) 91deg 92deg, rgba(253,230,138,.0) 93deg 120deg)",
          filter: "blur(1px)",
          maskImage: "radial-gradient(circle, transparent 69%, black 71%)",
        }}
      />

      {/* حلقة اللهب (SVG) */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="relative"
        style={{ filter: "saturate(1.25) brightness(1.05)" }}
      >
        <defs>
          {/* تدرج لون اللهب */}
          <linearGradient id="flameStroke" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#fff3cf" />
            <stop offset="25%"  stopColor="#facc15" />
            <stop offset="55%"  stopColor="#fb923c" />
            <stop offset="85%"  stopColor="#ef4444" />
            <stop offset="100%" stopColor="#7c2d12" />
          </linearGradient>

          {/* فلتر تموّج لهبي */}
          <filter id="flameDistort">
            <feTurbulence type="fractalNoise" baseFrequency={baseFreq} numOctaves="3" seed="7">
              <animate attributeName="baseFrequency" values={`${baseFreq};${baseFreq * 0.6};${baseFreq}`} dur="3.5s" repeatCount="indefinite" />
              <animate attributeName="seed" values="7;9;11;7" dur="6s" repeatCount="indefinite" />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" scale={dispScale} />
            <feGaussianBlur stdDeviation={blurStd} />
          </filter>
        </defs>

        {/* stroke داخلي (نواة ساطعة) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius - 2}
          fill="none"
          stroke="url(#flameStroke)"
          strokeWidth={Math.max(2, thickness * 0.35)}
          opacity="0.9"
        />

        {/* stroke الخارجي لهبي بالفلتر */}
        <g filter="url(#flameDistort)">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#flameStroke)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={thickness}
            opacity="0.95"
          />
        </g>
      </svg>
    </div>
  );
}
