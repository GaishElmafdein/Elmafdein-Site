export interface FireParticle {
  x: number;
  y: number;
  r: number;  // نصف القطر
  vx: number; // السرعة أفقياً
  vy: number; // السرعة رأسياً
  life: number;     // 0..1
  hue: number;      // HSL
  sat: number;
  lit: number;
}

export function clamp01(v: number): number {
  return v < 0 ? 0 : (v > 1 ? 1 : v);
}

// ضوضاء بسيطة لتذبذب واقعي بدون مكتبات
export function triNoise(t: number): number {
  const f = Math.abs(((t % 2) + 2) % 2 - 1);
  return 1 - f * 2; // -1..1
}
