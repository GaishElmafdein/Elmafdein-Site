"use client";
import React, { useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { FIRE_DEFAULTS, type FireDefaults } from "./sacred-fire.constants";
import { clamp01, triNoise, type FireParticle } from "./sacred-fire.utils";
import { mulberry32 } from "@/lib/prng";

export type SacredFireAuraProps = {
  /** الحجم المربّع لمنطقة الرسم (px) */
  size: number;
  /** نصف قطر الحلقة (px) */
  ringRadius?: number;
  /** سمك الحلقة (px) */
  ringThickness?: number;
  /** الكثافة/عدد الجزيئات المبدئي */
  particleCount?: number;
  /** كم جزيء جديد لكل فريم */
  spawnPerFrame?: number;
  /** شدّة التوهّج (CSS blur + glow) */
  glow?: number;
  /** بذرة ثابتة لضمان نفس الحركة عبر اللغات/الجلسات */
  seed?: string;
  className?: string;
  /** إن أردت تخفيف التأثير على الأجهزة الضعيفة */
  quality?: "high" | "medium" | "low";
  /** الحد الأدنى لصعود الجزيئات (للحركة الرأسية) */
  riseMin?: number;
  /** الحد الأقصى لصعود الجزيئات (للحركة الرأسية) */
  riseMax?: number;
};

const TWO_PI = Math.PI * 2;

function hsl(h: number, s: number, l: number, a: number): string {
  return `hsla(${h}, ${s}%, ${l}%, ${a})`;
}

export default function SacredFireAura({
  size,
  ringRadius = FIRE_DEFAULTS.ringRadius,
  ringThickness = FIRE_DEFAULTS.ringThickness,
  particleCount = FIRE_DEFAULTS.particleCount,
  spawnPerFrame = FIRE_DEFAULTS.spawnPerFrame,
  glow = FIRE_DEFAULTS.glow,
  seed = "sacred-fire",
  className,
  quality = "high",
}: SacredFireAuraProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const particlesRef = useRef<FireParticle[]>([]);
  const tRef = useRef(0);
  const center = size / 2;

  // مقياس الجودة يقلل الكثافة على الأجهزة الضعيفة
  const scale = quality === "low" ? 0.55 : quality === "medium" ? 0.8 : 1;
  const effParticleCount = Math.max(60, Math.round(particleCount * scale));
  const effSpawnPerFrame = Math.max(1, Math.round(spawnPerFrame * scale));
  const effThickness = ringThickness * (0.85 + 0.15 * scale);

  const rng = useMemo(() => {
    const seedNum = Array.from(seed).reduce((acc, ch) => (acc * 131 + ch.charCodeAt(0)) >>> 0, 2166136261);
    return mulberry32(seedNum);
  }, [seed]);

  // تهيئة الجزيئات الأولى
  useEffect(() => {
    const arr: FireParticle[] = [];
    for (let i = 0; i < effParticleCount; i++) {
      arr.push(spawn(center, center, ringRadius, effThickness, rng));
    }
    particlesRef.current = arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effParticleCount, ringRadius, ringThickness, size, rng]);

  // رسم/تحريك
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // DPI scaling
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    canvas.width = Math.floor(size * dpr);
    canvas.height = Math.floor(size * dpr);
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let prev = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - prev) / 1000); // ثبات
      prev = now;
      tRef.current += dt;

      // خلفية شفافة (مش بنمسح للنهاية عشان trail خفيفة)
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(0,0,0,0)"; // لا تمسح تمامًا
      ctx.clearRect(0, 0, size, size);

      // توهّج خفيف
      ctx.save();
      ctx.filter = `blur(${3 + glow * 6}px)`;
      ctx.globalCompositeOperation = "lighter";

      // تحديث الجزيئات
      const parts = particlesRef.current;
      for (let i = 0; i < parts.length; i++) {
        update(parts[i], dt, rng);
      }

      // إعادة تدوير المنقضي
      for (let k = 0; k < effSpawnPerFrame; k++) {
        // بدلاً من push/pop نُنعش جزيئات منتهية
        const aging = parts.findIndex((p) => p.life <= 0.02 || p.y < center - ringRadius - effThickness * 1.2);
        if (aging >= 0) {
          parts[aging] = spawn(center, center, ringRadius, effThickness, rng);
        } else if (parts.length < effParticleCount * 1.15) {
          parts.push(spawn(center, center, ringRadius, effThickness, rng));
        }
      }

      // رسم جزيئات النار (دوائر متوهجة فقط)
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        if (p.life <= 0) continue;
        const alpha = clamp01(Math.min(1, p.life * 1.4));
        ctx.beginPath();
        ctx.fillStyle = hsl(p.hue, p.sat, p.lit, alpha);
        ctx.arc(p.x, p.y, Math.max(0.6, p.r), 0, TWO_PI);
        ctx.fill();
      }

      ctx.restore();

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, ringRadius, ringThickness, effSpawnPerFrame, effParticleCount, glow]);

  return (
    <motion.canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={["pointer-events-none absolute inset-0", className || ""].join(" ")}
      aria-hidden
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={{
        mixBlendMode: "screen", // يندمج مع الخلفية بشكل واقعي
      }}
    />
  );
}

/* ==== Helpers الخاصة بالكومبوننت (مش مكوّنات/صادرات عامة) ==== */
function spawn(cx: number, cy: number, radius: number, thickness: number, rng: (n?: number) => number): FireParticle {
  // نقطة ابتدائية على الحلقة
  const angle = rng() * TWO_PI;
  const rOffset = (rng() - 0.5) * thickness; // داخل/خارج الحلقة
  const x = cx + Math.cos(angle) * (radius + rOffset);
  const y = cy + Math.sin(angle) * (radius + rOffset);

  // حجم/سرعة/لون
  const r = 1.2 + rng() * 2.6;
  const hue = FIRE_DEFAULTS.baseHueMin + rng() * (FIRE_DEFAULTS.baseHueMax - FIRE_DEFAULTS.baseHueMin);
  const sat = FIRE_DEFAULTS.baseSaturation;
  const lit = FIRE_DEFAULTS.baseLightness;
  // اتجاه مبدئي للداخل + لأعلى
  const inward = -0.2 - rng() * 0.3;
  const upward = -0.6 - rng() * 0.4;

  return {
    x,
    y,
    r,
    vx: Math.cos(angle) * inward,
    vy: Math.sin(angle) * inward + upward,
    life: 0.65 + rng() * 0.35,
    hue,
    sat,
    lit,
  };
}

function update(p: FireParticle, dt: number, rng: (n?: number) => number): void {
  // جاذبية لأعلى (لهب يرتفع)
  p.vy += FIRE_DEFAULTS.gravity * dt * 60;

  // دوّامة خفيفة + اهتزاز
  const t = performance.now() * 0.001;
  const swirlX = triNoise(t * 0.6 + p.x * 0.03) * FIRE_DEFAULTS.swirl * dt * 60;
  const swirlY = triNoise(t * 0.6 + p.y * 0.03) * FIRE_DEFAULTS.swirl * dt * 60;
  const jitter = (rng() - 0.5) * FIRE_DEFAULTS.jitter * dt * 60;

  p.vx += swirlX * 0.02 + jitter * 0.02;
  p.vy += swirlY * 0.02 - Math.abs(jitter) * 0.01;

  p.x += p.vx * (dt * 60);
  p.y += p.vy * (dt * 60);

  // يتلاشى بمرور الوقت
  p.life = clamp01(p.life - FIRE_DEFAULTS.decay * (dt * 60));

  // توهّج اللون كلما اقترب من نهايته (يميل للأصفر)
  if (p.life < 0.35) {
    p.hue = Math.min(48, p.hue + 0.35); // أصفر/ذهبي
    p.lit = Math.min(70, p.lit + 0.6);
  }
}
