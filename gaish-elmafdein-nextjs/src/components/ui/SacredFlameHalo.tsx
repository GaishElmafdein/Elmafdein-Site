"use client";
import { useRef, useEffect } from "react";

/**
 * SacredFlameHalo
 * Canvas-based Orthodox cathedral style flaming halo effect.
 * - Fire ring particles orbit + flicker
 * - Embers drift upward
 * - Light smoke layer
 * - Prefers-reduced-motion static fallback
 * Integrate inside a relative container; this component absolutely centers itself.
 */
export default function SacredFlameHalo({
  size = 500,
  ringRadius = 170,
  particleCap = 180,
  className = "",
}: {
  size?: number;          // CSS rendered square size (px)
  ringRadius?: number;    // Radius of flame ring in px (canvas space)
  particleCap?: number;   // Max total particles (fire + embers + smoke)
  className?: string;     // Extra classes for wrapper canvas
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (prefersReducedMotion) return; // Skip animation
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Backing store for high DPI
    function resize() {
      const dpr = window.devicePixelRatio || 1;
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
  canvas!.width = size * dpr;
  canvas!.height = size * dpr;
  canvas!.style.width = size + 'px';
  canvas!.style.height = size + 'px';
      ctx!.scale(dpr, dpr);
    }
    resize();

    const centerX = size / 2;
    const centerY = size / 2;
    const baseRingRadius = ringRadius;

    // Particle interfaces
    interface BaseParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;   // current life remaining
      maxLife: number; // initial life
      size: number;
      type: 'flame' | 'ember' | 'smoke';
      hueShift?: number;
      angle?: number;    // for circular motion (flame)
      radialDist?: number; // distance from center (flame)
      spinSpeed?: number;  // angular speed
      wobble?: number;     // flame organic wobble
    }

    const particles: BaseParticle[] = [];

    const flameColors = ['#ffb347', '#ffcc33', '#ff6633', '#ff3300'];

    function addFlameParticle() {
      const angle = Math.random() * Math.PI * 2;
      const radialDist = baseRingRadius + (Math.random() * 10 - 5);
      const spinSpeed = (Math.random() * 0.5 + 0.15) * (Math.random() < 0.5 ? -1 : 1);
      const sizePx = Math.random() * 6 + 3;
      const maxLife = 120 + Math.random() * 80;
      particles.push({
        x: centerX + Math.cos(angle) * radialDist,
        y: centerY + Math.sin(angle) * radialDist,
        vx: 0,
        vy: 0,
        life: maxLife,
        maxLife,
        size: sizePx,
        type: 'flame',
        hueShift: Math.random() * 20 - 10,
        angle,
        radialDist,
        spinSpeed: spinSpeed / 180 * Math.PI,
        wobble: Math.random() * 4 + 2,
      });
    }

    function addEmber() {
      // Spawn near ring, drift upward
      const angle = Math.random() * Math.PI * 2;
      const dist = baseRingRadius + (Math.random() * 40 - 20);
      const x = centerX + Math.cos(angle) * dist;
      const y = centerY + Math.sin(angle) * dist;
      const maxLife = 160 + Math.random() * 100;
      particles.push({
        x,
        y,
        vx: (Math.random() * 0.4 - 0.2),
        vy: -(Math.random() * 0.6 + 0.4),
        life: maxLife,
        maxLife,
        size: Math.random() * 2 + 1.5,
        type: 'ember',
      });
    }

    function addSmoke() {
      const angle = Math.random() * Math.PI * 2;
      const dist = baseRingRadius + (Math.random() * 20 - 10);
      const x = centerX + Math.cos(angle) * dist;
      const y = centerY + Math.sin(angle) * dist - 20; // slightly above ring
      const maxLife = 200 + Math.random() * 120;
      particles.push({
        x,
        y,
        vx: (Math.random() * 0.3 - 0.15),
        vy: -(Math.random() * 0.4 + 0.2),
        life: maxLife,
        maxLife,
        size: Math.random() * 18 + 12,
        type: 'smoke',
      });
    }

    // Initial seeding
    for (let i = 0; i < 90; i++) addFlameParticle();
    for (let i = 0; i < 25; i++) addEmber();
    for (let i = 0; i < 20; i++) addSmoke();

    let animationFrame: number;

    function draw() {
      ctx!.clearRect(0, 0, size, size);

      // Soft additive feel via composite operations
  ctx!.globalCompositeOperation = 'lighter';

      // Update + render
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= 1;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        const lifeRatio = p.life / p.maxLife;

        if (!ctx) {
          // Canvas context lost; abort this frame gracefully
          continue;
        }

        if (p.type === 'flame') {
          // Angular spin + slight radial breathing
            p.angle! += p.spinSpeed!;
            const wobbleAmp = p.wobble! * Math.sin((p.life / p.maxLife) * Math.PI * 2 + p.radialDist!);
            const dynamicRadius = p.radialDist! + wobbleAmp * 0.4;
            p.x = centerX + Math.cos(p.angle!) * dynamicRadius;
            p.y = centerY + Math.sin(p.angle!) * dynamicRadius;

            const baseColor = flameColors[Math.floor(Math.random() * flameColors.length)];
            // Radial gradient for each flame particle
            const g = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
            g.addColorStop(0, baseColor + '');
            g.addColorStop(0.5, baseColor + 'CC');
            g.addColorStop(1, '#00000000');
            ctx!.globalAlpha = Math.min(1, 0.2 + lifeRatio * 0.9);
            ctx!.fillStyle = g;
            ctx!.beginPath();
            ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx!.fill();
        } else if (p.type === 'ember') {
            p.x += p.vx;
            p.y += p.vy - 0.1; // buoyancy lift
            // slight horizontal drift
            p.vx += (Math.random() * 0.1 - 0.05);
            p.vx *= 0.96;
            const emberAlpha = lifeRatio;
            ctx!.globalAlpha = emberAlpha;
            const g = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
            g.addColorStop(0, '#ffd27f');
            g.addColorStop(0.4, '#ff8c3a');
            g.addColorStop(1, '#00000000');
            ctx!.fillStyle = g;
            ctx!.beginPath();
            ctx!.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
            ctx!.fill();
  } else if (p.type === 'smoke') {
            p.x += p.vx * 0.6;
            p.y += p.vy * 0.6; // slower rise
            p.size *= 1.002; // slight expansion
            ctx!.globalAlpha = Math.min(0.18, lifeRatio * 0.25);
            const g = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
            g.addColorStop(0, '#55555588');
            g.addColorStop(0.5, '#44444444');
            g.addColorStop(1, '#00000000');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
      }

      // Maintain population (probabilistic to avoid spikes)
      if (particles.length < particleCap) {
        if (Math.random() < 0.7) addFlameParticle();
        if (Math.random() < 0.25) addEmber();
        if (Math.random() < 0.15) addSmoke();
      }

      // Subtle central glow ring (protective aura)
    if (!ctx) return;
  ctx.globalCompositeOperation = 'screen';
      const auraRadius = baseRingRadius + 8;
  const aura = ctx.createRadialGradient(centerX, centerY, auraRadius * 0.6, centerX, centerY, auraRadius * 1.25);
      aura.addColorStop(0, 'rgba(255, 204, 102, 0.15)');
      aura.addColorStop(0.7, 'rgba(255, 140, 60, 0.05)');
      aura.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalAlpha = 1;
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(centerX, centerY, auraRadius * 1.3, 0, Math.PI * 2);
  ctx.fill();

      animationFrame = requestAnimationFrame(draw);
    }

    animationFrame = requestAnimationFrame(draw);

    function handleResize() {
      resize();
    }

    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', handleResize);
    };
  }, [prefersReducedMotion, ringRadius, size, particleCap]);

  if (prefersReducedMotion) {
    return (
      <div
        className={`absolute inset-0 flex items-center justify-center pointer-events-none ${className}`}
        aria-hidden="true"
      >
        <div className="w-full h-full rounded-full bg-gradient-to-tr from-amber-300/20 via-yellow-200/10 to-red-400/10 blur-2xl ring-2 ring-amber-300/30" />
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none [mix-blend-mode:screen] [filter:blur(0.3px)] w-[${size}px] h-[${size}px] ${className}`}
      aria-hidden="true"
    />
  );
}
