"use client";
import React, { useEffect, useRef } from "react";

type CrossFieldProps = {
  density?: number;
  sizeMin?: number;
  sizeMax?: number;
  speedMin?: number;
  speedMax?: number;
  armThicknessRatio?: number;
  colors?: string[];
  baseAlpha?: number;
  glow?: number;
  className?: string;
};

type CrossParticle = {
  x: number;
  y: number;
  vy: number;
  size: number;
  rot: number;
  vr: number;
  color: string;
  alpha: number;
  life: number;
  grow: number;
};

export default function CrossField({
  density = 90,
  sizeMin = 8,
  sizeMax = 18,
  speedMin = 12,
  speedMax = 34,
  armThicknessRatio = 0.22,
  colors = ["#F6C453", "#FFC870", "#FF9F40", "#FFD27A"],
  baseAlpha = 0.22,
  glow = 12,
  className = "",
}: CrossFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const particlesRef = useRef<CrossParticle[]>([]);
  const dprRef = useRef<number>(1);
  const mountedRef = useRef<boolean>(false);
  const lastTsRef = useRef<number>(0);

  useEffect(() => {
    mountedRef.current = true;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d", { alpha: true })!;
    const resize = () => {
      const { width, height } = canvas.parentElement!.getBoundingClientRect();
      dprRef.current = Math.max(1, Math.min(2, window.devicePixelRatio || 1.5));
      canvas.width = Math.floor(width * dprRef.current);
      canvas.height = Math.floor(height * dprRef.current);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement!);

    particlesRef.current = [];
    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

    const spawn = (fromBottom = true): CrossParticle => {
      const cw = canvas.width, ch = canvas.height;
      const size = rand(sizeMin, sizeMax);
      return {
        x: rand(size * 1.2, cw - size * 1.2),
        y: fromBottom ? ch + rand(0, ch * 0.25) : rand(0, ch),
        vy: -rand(speedMin, speedMax),
        size,
        rot: rand(0, Math.PI * 2),
        vr: rand(-0.3, 0.3),
        color: pick(colors),
        alpha: baseAlpha * rand(0.7, 1),
        life: 0,
        grow: rand(0.08, 0.16),
      };
    };

    for (let i = 0; i < density; i++) particlesRef.current.push(spawn(false));

    const drawCross = (g: CanvasRenderingContext2D, p: CrossParticle) => {
      const s = p.size * dprRef.current;
      const t = Math.max(1, s * armThicknessRatio);
      g.save();
      g.translate(p.x, p.y);
      g.rotate(p.rot);
      g.globalAlpha = Math.max(0, Math.min(1, p.alpha * (p.life < 0.5 ? p.life * 2 : 1 - (p.life - 0.5) * 2)));
      g.shadowColor = p.color;
      g.shadowBlur = glow;
      // @ts-ignore
      g.globalCompositeOperation = "lighter";
      g.fillStyle = p.color;
      g.fillRect(-s * 0.5, -t * 0.5, s, t);
      g.fillRect(-t * 0.5, -s * 0.5, t, s);
      g.restore();
    };

    const tick = (ts: number) => {
      if (!mountedRef.current) return;
      const dt = Math.min(0.05, (ts - (lastTsRef.current || ts)) / 1000);
      lastTsRef.current = ts;
      const g = ctx;
      g.clearRect(0, 0, canvas.width, canvas.height);
      g.save();
      // @ts-ignore
      g.globalCompositeOperation = "screen";
      const grad = g.createRadialGradient(
        canvas.width * 0.5,
        canvas.height * 0.7,
        10,
        canvas.width * 0.5,
        canvas.height * 0.7,
        Math.max(canvas.width, canvas.height) * 0.7
      );
      grad.addColorStop(0, "rgba(255,210,140,0.05)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = grad;
      g.fillRect(0, 0, canvas.width, canvas.height);
      g.restore();
      const arr = particlesRef.current;
      for (let i = 0; i < arr.length; i++) {
        const p = arr[i];
        p.y += p.vy * dt * dprRef.current;
        p.rot += p.vr * dt;
        p.life += p.grow * dt;
        drawCross(ctx, p);
        if (p.y + p.size * dprRef.current < -40 || p.life >= 1) {
          arr[i] = spawn(true);
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      mountedRef.current = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [density, sizeMin, sizeMax, speedMin, speedMax, armThicknessRatio, colors, baseAlpha, glow]);

  return (
    <div
      className={`pointer-events-none absolute inset-0 -z-10 select-none ${className}`}
      aria-hidden
      role="presentation"
    >
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
