import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'slow-pulse': {
          '0%,100%': { transform: 'scale(1)', opacity: '0.9' },
          '50%': { transform: 'scale(1.03)', opacity: '1' },
        },
      },
      animation: {
        'slow-pulse': 'slow-pulse 4s ease-in-out infinite',
      },
    },
  },
  // @ts-expect-error tailwind v4 runtime accepts safelist though types may lag
  safelist: [
    // gradients used in SacredLogoHero and hero text
    'bg-clip-text','bg-gradient-to-r',
    'from-amber-200','via-amber-400','to-amber-600',
    'from-yellow-200','via-amber-300','to-red-500',
    'from-red-200','to-amber-500',
    'from-amber-100','to-yellow-400',
    // sizes used for aura/embers
    'blur-3xl','size-[900px]'
  ],
} satisfies Config;
