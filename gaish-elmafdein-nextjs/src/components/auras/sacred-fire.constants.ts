// ثابتات قابلة للتعديل حسب الذوق، منفصلة عن الكومبوننت (توافقًا مع قواعدك)
export const FIRE_DEFAULTS = {
  particleCount: 220,
  spawnPerFrame: 6,
  ringRadius: 170,      // نصف قطر الحلقة (px)
  ringThickness: 26,    // سُمك الحلقة (px)
  baseHueMin: 18,       // نطاق لون النار (برتقالي/كهرماني)
  baseHueMax: 44,
  baseSaturation: 95,
  baseLightness: 55,
  glow: 0.85,           // شدة التوهّج
  gravity: -0.02,       // صعود النار (سالب = لأعلى)
  swirl: 0.12,          // دوران بسيط
  decay: 0.012,         // تبخّر الجزيئات
  jitter: 0.8,          // اهتزاز طفيف
} as const;

export type FireDefaults = typeof FIRE_DEFAULTS;
