"use client";

import React, { useEffect, useRef } from "react";

/** خصائص المكوّن */
type CrossSkyProps = {
  /** كثافة الصلبان (عدد تقريبي على الشاشة) */
  density?: number;
  /** سرعة عامة (1 = افتراضي) */
  speed?: number;
  /** قوة التوهّج */
  glow?: number;
  /** أقصى حجم للصليب بالـ px */
  maxSize?: number;
  /** خلط لوني مع الخلفية */
  blendMode?: CanvasRenderingContext2D["globalCompositeOperation"];
  /** z-index للطبقة */
  zIndexClassName?: string; // مثال: "z-0" | "z-[-1]" | "z-50"
  /** تغطية العنصر (افتراضي: الشاشة كلها) */
  className?: string;
};

/** عنصر خلفية Canvas يرسم صلبان ✝︎ ترتفع لأعلى مع توهّج ولمعان */
export default function CrossSky({
  density = 90,
  speed = 1,
  glow = 1,
  maxSize = 14,
  blendMode = "screen",
  zIndexClassName = "z-0",
  className = "fixed inset-0 pointer-events-none",
}: CrossSkyProps) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  // احترام تفضيل تقليل الحركة
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let dpr = 1;

    type Cross = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      rot: number;
      rotSpeed: number;
      life: number; // 0..1
      hue: number;
    };

    const crosses: Cross[] = [];
    const targetCount = Math.max(16, density);

    const rand = (min: number, max: number) => Math.random() * (max - min) + min;

    const resize = () => {
      dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      w = Math.floor(window.innerWidth);
      h = Math.floor(window.innerHeight);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const spawnOne = (fromBottom = true): Cross => {
      const s = rand(6, maxSize);
      return {
        x: rand(-0.05 * w, 1.05 * w),
        y: fromBottom ? h + s * 2 : rand(0, h),
        vx: rand(-0.08, 0.08),
        vy: -rand(0.35, 0.85) * speed,
        size: s,
        rot: rand(0, Math.PI * 2),
        rotSpeed: rand(-0.01, 0.01),
        life: rand(0.65, 1),
        hue: rand(28, 48), // درجات كهرمانية/لهب
      };
    };

    const ensurePopulation = () => {
      while (crosses.length < targetCount) crosses.push(spawnOne(false));
    };

    const drawCross = (c: Cross) => {
      const s = c.size;
      const arm = s * 0.55;
      const stroke = Math.max(1.25, s * 0.18);

      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rot);

      // توهج أسفل الصليب
      const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 1.35);
      grd.addColorStop(0, `rgba(255,220,160,${0.22 * glow})`);
      grd.addColorStop(1, "rgba(255,160,60,0)");
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(0, 0, s * 1.35, 0, Math.PI * 2);
      ctx.fill();

      // الصليب
      ctx.globalCompositeOperation = blendMode;
      ctx.lineCap = "round";
      ctx.strokeStyle = `hsl(${c.hue} 90% 80% / ${0.95 * c.life})`;
      ctx.shadowBlur = 8 * glow;
      ctx.shadowColor = `hsl(${c.hue} 90% 70% / ${0.85 * c.life})`;
      ctx.lineWidth = stroke;

      ctx.beginPath(); // العمود
      ctx.moveTo(0, -arm);
      ctx.lineTo(0, arm);
      ctx.stroke();

      ctx.beginPath(); // الذراع
      ctx.moveTo(-arm, -s * 0.15);
      ctx.lineTo(arm, -s * 0.15);
      ctx.stroke();

      ctx.restore();
    };

    let last = performance.now();
    const tick = (t: number) => {
      const dt = Math.min(40, t - last);
      last = t;

      ctx.clearRect(0, 0, w, h);

      // ضباب خفيف لزيادة الإحساس بالوهج
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = "rgba(20,16,8,0.06)";
      ctx.fillRect(0, 0, w, h);

      crosses.forEach((c, i) => {
        // حركة
        c.x += c.vx * dt;
        c.y += c.vy * dt;
        c.rot += c.rotSpeed * dt;

        // وميض بسيط
        c.life -= 0.0004 * dt;
        if (c.life < 0.25) c.life -= 0.0006 * dt;

        drawCross(c);

        // لو خرج فوق الشاشة أو اختفى، أعد استخدامه
        if (c.y < -c.size * 2 || c.life <= 0) {
          crosses[i] = spawnOne(true);
        }
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    const start = () => {
      resize();
      ensurePopulation();
      last = performance.now();
      rafRef.current = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };

    start();
    window.addEventListener("resize", resize);

    // احترام تقليل الحركة
    if (prefersReducedMotion) stop();

    return () => {
      stop();
      window.removeEventListener("resize", resize);
    };
  }, [density, speed, glow, maxSize, blendMode, prefersReducedMotion]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={`${className} ${zIndexClassName}`}
      // طبقة شفافه لطيفة لدمج الوهج مع الخلفية
      style={{ opacity: 0.9 }}
    />
  );
}
