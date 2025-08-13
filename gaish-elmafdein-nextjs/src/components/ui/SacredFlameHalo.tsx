"use client";
import { useEffect,useRef } from "react";

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
  intensity = 'normal', // 'normal' | 'high' | 'extreme'
  className = "",
}: {
  size?: number;
  ringRadius?: number;
  particleCap?: number;
  intensity?: 'normal' | 'high' | 'extreme';
  className?: string;
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

    // Intensity scaling
    const intensityConfig = {
      normal: {
        flameSeed: 90,
        emberSeed: 25,
        smokeSeed: 20,
        spawnFlameProb: 0.7,
        spawnEmberProb: 0.25,
        spawnSmokeProb: 0.15,
        flareProb: 0.04,
      },
      high: {
        flameSeed: 140,
        emberSeed: 40,
        smokeSeed: 28,
        spawnFlameProb: 0.9,
        spawnEmberProb: 0.33,
        spawnSmokeProb: 0.2,
        flareProb: 0.07,
      },
      extreme: {
        flameSeed: 190,
        emberSeed: 60,
        smokeSeed: 34,
        spawnFlameProb: 1.05,
        spawnEmberProb: 0.42,
        spawnSmokeProb: 0.25,
        flareProb: 0.11,
      }
    } as const
    const cfg = intensityConfig[intensity] ?? intensityConfig.normal

    // Particle interfaces
    interface BaseParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;   // current life remaining
      maxLife: number; // initial life
      size: number;
      type: 'flame' | 'ember' | 'smoke' | 'flare';
      hueShift?: number;
      angle?: number;    // for circular motion (flame)
      radialDist?: number; // distance from center (flame)
      spinSpeed?: number;  // angular speed
      wobble?: number;     // flame organic wobble
      rot?: number;        // rotation for cross embers
      rotSpeed?: number;   // rotation speed
  variant?: number;    // cross style variant
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
  size: Math.random() * 2.2 + 2.2, // slightly larger to show cross shape
    type: 'ember',
    rot: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() * 0.02 - 0.01),
  variant: Math.floor(Math.random() * 3),
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

    function addFlare() {
      // Short-lived bright flash traveling outwards
      const angle = Math.random() * Math.PI * 2;
      const radialDist = baseRingRadius + (Math.random() * 6 - 3);
      const x = centerX + Math.cos(angle) * radialDist;
      const y = centerY + Math.sin(angle) * radialDist;
      const maxLife = 30 + Math.random() * 20;
      particles.push({
        x, y,
        vx: Math.cos(angle) * (Math.random() * 1.2 + 0.4),
        vy: Math.sin(angle) * (Math.random() * 1.2 + 0.4),
        life: maxLife,
        maxLife,
        size: Math.random() * 10 + 8,
        type: 'flare'
      })
    }

    // Initial seeding (no embers)
  for (let i = 0; i < cfg.flameSeed; i++) addFlameParticle();
  // Embers removed
  for (let i = 0; i < cfg.smokeSeed; i++) addSmoke();

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
      // Update motion
      p.x += p.vx;
      p.y += p.vy - 0.1; // buoyancy lift
      p.vx += (Math.random() * 0.08 - 0.04);
      p.vx *= 0.965;
      // Rotation update
      if (p.rot !== undefined && p.rotSpeed) p.rot += p.rotSpeed;

      const emberAlpha = lifeRatio;
            // Subtler glow backdrop (tighter to reduce bubble look)
            ctx!.globalAlpha = emberAlpha * 0.85;
            const g = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2.2);
            g.addColorStop(0, 'rgba(255,225,170,0.95)');
            g.addColorStop(0.5, 'rgba(255,150,60,0.45)');
            g.addColorStop(1, 'rgba(0,0,0,0)');
            ctx!.fillStyle = g;
            ctx!.beginPath();
            ctx!.arc(p.x, p.y, p.size * 2.2, 0, Math.PI * 2);
            ctx!.fill();

            // Orthodox triple-bar cross (variant forms)
            ctx!.save();
            ctx!.translate(p.x, p.y);
            if (p.rot) ctx!.rotate(p.rot);
            // Thicker cross variant (option 2)
            const base = p.size * 2.4; // slight overall boost
            const vertH = base * 3.2;
            const thickness = base * 0.68; // increased from 0.45
            const topBarW = base * 1.4;
            const midBarW = base * 2.4;
            const lowBarW = base * 1.9;
            const lowBarYOffset = vertH * 0.28;
            const topBarYOffset = -vertH * 0.32;
            const midBarYOffset = 0;
            const slant = p.variant === 2 ? thickness * 0.6 : 0; // slanted lower bar for variant 2

            // Body gradient
            ctx!.globalAlpha = Math.min(1, 0.55 + emberAlpha * 0.85);
            const bodyGrad = ctx!.createLinearGradient(0, -vertH/2, 0, vertH/2);
            bodyGrad.addColorStop(0, 'rgba(255,240,210,0.95)');
            bodyGrad.addColorStop(0.5, 'rgba(255,170,70,0.9)');
            bodyGrad.addColorStop(1, 'rgba(255,240,210,0.95)');
            ctx!.fillStyle = bodyGrad;
            ctx!.beginPath();
            // vertical shaft
            ctx!.rect(-thickness/2, -vertH/2, thickness, vertH);
            // top bar
            ctx!.rect(-topBarW/2, topBarYOffset - thickness/2, topBarW, thickness);
            // middle bar (longer)
            ctx!.rect(-midBarW/2, midBarYOffset - thickness/2, midBarW, thickness);
            // lower bar (shorter, optionally slanted)
            if (slant !== 0) {
              ctx!.save();
              ctx!.translate(0, lowBarYOffset);
              ctx!.rotate(-0.28);
              ctx!.rect(-lowBarW/2, -thickness/2, lowBarW, thickness);
              ctx!.restore();
            } else {
              ctx!.rect(-lowBarW/2, lowBarYOffset - thickness/2, lowBarW, thickness);
            }
            ctx!.fill();

            // Core highlight
            ctx!.globalAlpha = Math.min(1, emberAlpha * 0.9);
            ctx!.fillStyle = 'rgba(255,255,245,0.85)';
            ctx!.fillRect(-thickness*0.33, -thickness*0.33, thickness*0.66, thickness*0.66);

            // Edge stroke to sharpen shape
            ctx!.globalAlpha = Math.min(1, 0.4 + emberAlpha * 0.6);
            ctx!.strokeStyle = 'rgba(255,210,120,0.9)';
            ctx!.lineWidth = Math.max(0.6, thickness * 0.16);
            ctx!.beginPath();
            ctx!.rect(-thickness/2, -vertH/2, thickness, vertH);
            ctx!.moveTo(-topBarW/2, topBarYOffset - thickness/2);
            ctx!.rect(-topBarW/2, topBarYOffset - thickness/2, topBarW, thickness);
            ctx!.rect(-midBarW/2, midBarYOffset - thickness/2, midBarW, thickness);
            if (slant !== 0) {
              ctx!.save();
              ctx!.translate(0, lowBarYOffset);
              ctx!.rotate(-0.28);
              ctx!.rect(-lowBarW/2, -thickness/2, lowBarW, thickness);
              ctx!.restore();
            } else {
              ctx!.rect(-lowBarW/2, lowBarYOffset - thickness/2, lowBarW, thickness);
            }
            ctx!.stroke();
            ctx!.restore();
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
    } else if (p.type === 'flare') {
      p.x += p.vx;
      p.y += p.vy;
      const flareRatio = lifeRatio;
      ctx!.globalAlpha = Math.min(1, 0.2 + flareRatio * 0.9);
      const g = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * (1 + (1 - flareRatio) * 1.8));
      g.addColorStop(0, 'rgba(255,230,180,0.95)');
      g.addColorStop(0.4, 'rgba(255,160,60,0.65)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx!.fillStyle = g;
      ctx!.beginPath();
      ctx!.arc(p.x, p.y, p.size * (0.8 + (1 - flareRatio) * 0.6), 0, Math.PI * 2);
      ctx!.fill();
        }
      }

      // Maintain population (no embers)
      if (particles.length < particleCap) {
    if (Math.random() < cfg.spawnFlameProb) addFlameParticle();
    // Embers removed
    if (Math.random() < cfg.spawnSmokeProb) addSmoke();
    if (Math.random() < cfg.flareProb) addFlare();
      }

      // Subtle central glow ring (protective aura)
    if (!ctx) return;
  ctx.globalCompositeOperation = 'screen';
      const auraRadius = baseRingRadius + 8;
  const aura = ctx.createRadialGradient(centerX, centerY, auraRadius * 0.6, centerX, centerY, auraRadius * 1.25);
      aura.addColorStop(0, 'rgba(255, 204, 102, 0.15)');
      aura.addColorStop(0.7, 'rgba(255, 140, 60, 0.05)');
      aura.addColorStop(1, 'rgba(0,0,0,0)');
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
  }, [prefersReducedMotion, ringRadius, size, particleCap, intensity]);

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
