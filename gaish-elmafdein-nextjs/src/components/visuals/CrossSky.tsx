"use client";

import React, { useEffect, useRef } from "react";

type CrossSkyProps = {
  density?: number;
  baseSpeed?: number;
  glow?: number;
  baseSize?: number;
  opacity?: number;
  seed?: number;
  blendScreen?: boolean;
  zIndex?: number;
  debug?: boolean;
  className?: string;
};

type CrossParticle = {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  rot: number; rotSpeed: number;
  hue: number;
  life: number; maxLife: number;
  armRatio: number;
};

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return function rand() {
    t += 0x6D2B79F5;
    let s = Math.imul(t ^ (t >>> 15), 1 | t);
    s ^= s + Math.imul(s ^ (s >>> 7), 61 | s);
    return ((s ^ (s >>> 14)) >>> 0) / 4294967296;
  };
}

export default function CrossSky({
  density = 0.26,
  baseSpeed = 26,
  glow = 1.25,
  baseSize = 9,
  opacity = 0.95,
  seed = 20250812,
  blendScreen = true,
  zIndex = 5,
  debug = false,
  className = "",
}: CrossSkyProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let running = true;
    let width = 0;
    let height = 0;
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const rng = mulberry32(seed);
    const particles: CrossParticle[] = [];

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      particles.length = 0;
      spawnInitial();
    };

    const spawnOne = (fromBottom = false) => {
      const s = (baseSize + rng() * baseSize * 1.5) * dpr;
      const life = 6 + rng() * 7;
      const armRatio = 0.55 + rng() * 0.35;
      const hue = 38 + rng() * 16;
      const vx = (rng() - 0.5) * 6;
      const vy = -(baseSpeed + rng() * baseSpeed * 1.4);
      const rot = rng() * Math.PI * 2;
      const rotSpeed = (rng() - 0.5) * 0.6;
      const x = rng() * width * dpr;
      const y = fromBottom ? (height + 20) * dpr : rng() * height * dpr;
      particles.push({ x, y, vx, vy, size: s, rot, rotSpeed, hue, life, maxLife: life, armRatio });
    };

    const spawnInitial = () => {
      const area = (width * height) / 100000;
      const count = Math.max(12, Math.floor(area * density));
      for (let i = 0; i < count; i++) spawnOne(false);
    };

    const drawCross = (c: CanvasRenderingContext2D, p: CrossParticle) => {
      c.save();
      c.translate(p.x, p.y);
      c.rotate(p.rot);
      const a = Math.max(0, Math.min(1, opacity * (p.life / p.maxLife)));
      const col = `hsla(${p.hue}, 90%, 60%, ${a})`;
      c.globalCompositeOperation = blendScreen ? "screen" : "lighter";
      c.shadowBlur = p.size * 0.9 * glow;
      c.shadowColor = `hsla(${p.hue}, 85%, 65%, ${a * 0.9})`;
      const arm = p.size * 0.5;
      const bar = p.size * 0.18;
      c.fillStyle = col;
      c.fillRect(-bar / 2, -arm, bar, arm * 2);
      const halfW = arm * p.armRatio;
      c.fillRect(-halfW, -bar / 2, halfW * 2, bar);
      const g = c.createRadialGradient(0, 0, 0, 0, 0, p.size * 0.9);
      g.addColorStop(0, `hsla(${p.hue}, 95%, 75%, ${a * 0.55})`);
      g.addColorStop(1, `hsla(${p.hue}, 95%, 55%, 0)`);
      c.fillStyle = g;
      c.beginPath();
      c.arc(0, 0, p.size * 0.95, 0, Math.PI * 2);
      c.fill();
      c.restore();
    };

    let last = performance.now();
    let frames = 0;
    let fps = 0;
    let fpsTimer = 0;

    const tick = (t: number) => {
      if (!running) return;
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      frames++;
      fpsTimer += dt;
      if (fpsTimer >= 0.5) {
        fps = Math.round(frames / fpsTimer);
        frames = 0;
        fpsTimer = 0;
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * dpr * dt * 60;
        p.y += p.vy * dpr * dt;
        p.rot += p.rotSpeed * dt;
        p.life -= dt;
        drawCross(ctx, p);
        if (p.y < -40 * dpr || p.life <= 0) {
          particles.splice(i, 1);
          spawnOne(true);
        }
      }
      if (debug) {
        ctx.strokeStyle = "rgba(255,0,0,0.45)";
        ctx.lineWidth = 2 * dpr;
        ctx.strokeRect(2 * dpr, 2 * dpr, canvas.width - 4 * dpr, canvas.height - 4 * dpr);
        ctx.fillStyle = "rgba(0,0,0,0.45)";
        ctx.fillRect(10 * dpr, 10 * dpr, 160 * dpr, 44 * dpr);
        ctx.fillStyle = "white";
        ctx.font = `${12 * dpr}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
        ctx.fillText(`CrossSky DEBUG`, 18 * dpr, 28 * dpr);
        ctx.fillText(`FPS ~ ${fps}`, 18 * dpr, 44 * dpr);
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener("resize", resize);
    resize();
    tick(performance.now());

    return () => {
      running = false;
      window.removeEventListener("resize", resize);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [density, baseSpeed, glow, baseSize, opacity, seed, blendScreen, zIndex, debug, className]);

  return (
    <div
      className={"pointer-events-none fixed inset-0 z-[50] select-none " + (className || "")}
      aria-hidden="true"
      role="presentation"
    >
      <canvas ref={canvasRef} className="w-full h-full mix-blend-screen" />
    </div>
  );
}

<CrossSky
  density={0.26}
  baseSpeed={26}
  glow={1.3}
  baseSize={9}
  opacity={0.95}
  seed={20250812}
  blendScreen
  className="fixed inset-0 z-0 pointer-events-none"
/>
