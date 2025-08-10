"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { mulberry32 } from '@/lib/prng';

/**
 * Canvas based ember ring surrounding a central logo.
 * Lightweight alternative to heavy CSS/video flame layers.
 * All params are tunable; defaults chosen for warm orthodox glow.
 */
export type EmberLogoProps = {
  logoSrc: string;       // مسار اللوجو (PNG/SVG بخلفية شفافة)
  alt?: string;
  size?: number;         // القطر بالبكسل (الحاوية مربعة)
  logoScale?: number;    // نسبة حجم اللوجو من القطر (0..1)
  ringInner?: number;    // نصف قطر الحلقة الداخلي (نسبة من القطر 0..0.5)
  ringThickness?: number;// سُمك الحلقة (نسبة من القطر)
  emissionRate?: number; // معدل انبعاث الشرار في الإطار
  maxParticles?: number; // الحد الأقصى للجسيمات
  emberHueMin?: number;  // أقل Hue
  emberHueMax?: number;  // أعلى Hue
  glow?: number;         // شدة الوهج (1 = طبيعي)
  exposure?: number;     // مضاعف السطوع
  fpsCap?: number;       // حد للإطارات
  pause?: boolean;       // إيقاف مؤقت
  seed?: string;         // Deterministic seed for particles (SSR compatible)
  className?: string;
  onLogoError?: () => void; // تمرير خطأ تحميل اللوجو للفوق
};

export default function EmberLogo({
  logoSrc,
  alt = "Logo",
  size = 360,
  logoScale = 0.55,
  ringInner = 0.26,
  ringThickness = 0.08,
  emissionRate = 12,
  maxParticles = 600,
  emberHueMin = 20,
  emberHueMax = 42,
  glow = 1.0,
  exposure = 1.0,
  fpsCap,
  pause = false,
  seed = 'ember-logo',
  className = "",
  onLogoError,
}: EmberLogoProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  const dpr = Math.max(1, typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1);
    const W = size;
    const H = size;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const centerX = W / 2;
    const centerY = H / 2;
    const innerR = W * ringInner;
    const outerR = innerR + W * ringThickness;
    const midR = (innerR + outerR) / 2;

    // Initialize seeded RNG
    const rngSeed = Array.from(seed).reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 2166136261);
    let particleCounter = 0; // For unique seeds per particle

    type Particle = {
      x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number; hue: number; alpha: number; spin: number;
    };
    const particles: Particle[] = [];

    function spawn(n: number) {
      for (let i = 0; i < n; i++) {
        if (particles.length >= maxParticles) break;
        
        // Create unique seed for this particle
        const particleSeed = rngSeed + particleCounter++;
        const particleRng = mulberry32(particleSeed);
        
        const theta = particleRng() * Math.PI * 2;
        const jitter = (particleRng() - 0.5) * (W * 0.01);
        const r = midR + jitter;
        const x = centerX + Math.cos(theta) * r;
        const y = centerY + Math.sin(theta) * r;
        const dirOutX = Math.cos(theta);
        const dirOutY = Math.sin(theta);
        const speed = 0.35 + particleRng() * 0.85;
        const upward = -0.25 - particleRng() * 0.5;
        const vx = dirOutX * speed * 0.8 + (particleRng() - 0.5) * 0.3;
        const vy = dirOutY * speed * 0.2 + upward;
        const hue = emberHueMin + particleRng() * (emberHueMax - emberHueMin);
        particles.push({
          x, y, vx, vy,
          life: 0,
          maxLife: 45 + particleRng() * 55,
          size: 1.0 + particleRng() * 2.6,
          hue,
          alpha: 0.9 + particleRng() * 0.1,
          spin: (particleRng() - 0.5) * 0.05,
        });
      }
    }

    function clearFrame() {
      // إزالة الخلفية السوداء: نجعل الكانفس شفاف تماماً كل فريم
      (ctx as CanvasRenderingContext2D).globalCompositeOperation = "source-over";
      (ctx as CanvasRenderingContext2D).clearRect(0, 0, W, H);
    }

    function drawParticles() {
  (ctx as CanvasRenderingContext2D).globalCompositeOperation = "lighter";
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += 1;
        if (p.life > p.maxLife) { particles.splice(i, 1); continue; }
        p.vx *= 0.995; p.vy *= 0.995; p.vy -= 0.005; // upward drift
        p.x += p.vx; p.y += p.vy;
        const lifeRatio = p.life / p.maxLife;
        const fade = (1 - lifeRatio);
        const alpha = p.alpha * Math.pow(fade, 1.5) * exposure;
        const r = p.size * (1 + lifeRatio * 0.6);
  const grd = (ctx as CanvasRenderingContext2D).createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3.0);
        grd.addColorStop(0.00, `hsla(${p.hue},100%,60%,${alpha * 0.85})`);
        grd.addColorStop(0.35, `hsla(${p.hue},100%,50%,${alpha * 0.35})`);
        grd.addColorStop(1.00, `hsla(${p.hue},100%,40%,0)`);
  (ctx as CanvasRenderingContext2D).fillStyle = grd;
  (ctx as CanvasRenderingContext2D).beginPath();
  (ctx as CanvasRenderingContext2D).arc(p.x, p.y, r * 2.0, 0, Math.PI * 2);
  (ctx as CanvasRenderingContext2D).fill();
      }
    }

    function frame(now: number) {
      if (pause) { rafRef.current = requestAnimationFrame(frame); return; }
      if (fpsCap && lastTimeRef.current) {
        const delta = now - lastTimeRef.current;
        if (delta < 1000 / fpsCap) { rafRef.current = requestAnimationFrame(frame); return; }
      }
      lastTimeRef.current = now;
      clearFrame();
      const pulse = 1 + Math.sin(now * 0.004) * 0.5; // 0.5..1.5
      const emitCount = Math.max(0, Math.round(emissionRate * pulse));
      spawn(emitCount);
      drawParticles();
      rafRef.current = requestAnimationFrame(frame);
    }

    // لا نملأ الخلفية بالأسود الآن لتبقى شفافة
    rafRef.current = requestAnimationFrame(frame);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [size, ringInner, ringThickness, emissionRate, maxParticles, emberHueMin, emberHueMax, glow, exposure, fpsCap, pause, seed]);

  return (
    <div
      className={`relative grid place-items-center ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
      aria-label="شعار بحلقة شرار نار"
    >
      <canvas ref={canvasRef} className="absolute inset-0 rounded-full overflow-hidden" aria-hidden />
      <div className="relative z-10 grid place-items-center drop-shadow-[0_0_25px_rgba(246,196,83,0.45)]">
        <Image
          src={logoSrc}
          alt={alt}
          width={Math.round(size * logoScale)}
          height={Math.round(size * logoScale)}
          priority
          onError={onLogoError}
        />
      </div>
    </div>
  );
}
