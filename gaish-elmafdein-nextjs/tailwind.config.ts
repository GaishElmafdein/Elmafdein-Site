import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Sacred Orthodox Colors
        gold: {
          50: '#fffdf2',
          100: '#fef7cd',
          200: '#fced95',
          300: '#fae05d',
          400: '#f8d330',
          500: '#f1c40f', // Main Gold
          600: '#d4af37',
          700: '#b8860b',
          800: '#9a6f0a',
          900: '#7d5a08',
        },
        // Enhanced Sacred Color Palette
        'sacred-gold': {
          DEFAULT: '#f6c453',
          50: '#fef8e7',
          100: '#fdefc4',
          200: '#fbe084',
          300: '#f9cc44',
          400: '#f6c453',
          500: '#efaa1a',
          600: '#d48b0e',
          700: '#b06410',
          800: '#8f4e15',
          900: '#774015',
          950: '#442007',
          light: '#ffd966',
          dark: '#d4a43a',
          muted: '#e6b84a',
        },
        'sacred-amber': {
          DEFAULT: '#fbbf24',
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
          950: '#422006',
          light: '#fcd34d',
          dark: '#d97706',
        },
        'sacred-maroon': {
          DEFAULT: '#991b1b',
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
          light: '#b91c1c',
          dark: '#7f1d1d',
        },
        midnight: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#b8c5d1',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53', // Main Midnight Blue
          900: '#1a202c',
        },
        flame: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626', // Main Flame Red
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        // Sacred Background Variations
        'sacred-slate': {
          DEFAULT: '#1e293b',
          light: '#334155',
          dark: '#0f172a',
        },
        'sacred-zinc': {
          DEFAULT: '#18181b',
          light: '#27272a',
          dark: '#09090b',
        },
      },
      fontFamily: {
        arabic: ['var(--font-cairo)', 'Cairo', 'Noto Kufi Arabic', 'sans-serif'],
        english: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-lemonada)', 'Lemonada', 'cursive'],
      },
      fontSize: {
        'sacred-display': ['clamp(2.5rem, 8vw, 6rem)', { lineHeight: '1.1' }],
        'sacred-heading': ['clamp(1.75rem, 4vw, 3rem)', { lineHeight: '1.2' }],
        'sacred-subheading': ['clamp(1.125rem, 2.5vw, 1.5rem)', { lineHeight: '1.4' }],
        'sacred-body': ['clamp(0.875rem, 2vw, 1rem)', { lineHeight: '1.6' }],
      },
      spacing: {
        'sacred-xs': '0.25rem',
        'sacred-sm': '0.5rem',
        'sacred-md': '1rem',
        'sacred-lg': '2rem',
        'sacred-xl': '4rem',
        'sacred-2xl': '8rem',
      },
      borderRadius: {
        'sacred-sm': '0.5rem',
        'sacred-md': '0.75rem',
        'sacred-lg': '1rem',
        'sacred-xl': '1.5rem',
        'sacred-2xl': '2rem',
      },
      boxShadow: {
        'sacred-sm': '0 2px 8px rgba(246, 196, 83, 0.1)',
        'sacred': '0 4px 16px rgba(246, 196, 83, 0.15)',
        'sacred-lg': '0 8px 32px rgba(246, 196, 83, 0.2)',
        'sacred-glow': '0 0 24px rgba(246, 196, 83, 0.3)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'rotate-cross': 'rotate-cross 8s linear infinite',
        'flame': 'flame 1s ease-in-out infinite alternate',
        'sacred-float': 'sacred-float 6s ease-in-out infinite',
        'sacred-glow': 'sacred-glow 2s ease-in-out infinite alternate',
        'sacred-pulse': 'sacred-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'sacred-marquee': 'sacred-marquee 30s linear infinite',
        'sacred-shimmer': 'sacred-shimmer 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { 
            opacity: '1',
            boxShadow: '0 0 20px rgba(241, 196, 15, 0.5)'
          },
          '50%': { 
            opacity: '0.8',
            boxShadow: '0 0 40px rgba(241, 196, 15, 0.8)'
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'rotate-cross': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'flame': {
          '0%': { transform: 'scaleY(1) scaleX(1)' },
          '100%': { transform: 'scaleY(1.1) scaleX(0.9)' },
        },
        'sacred-float': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '25%': { transform: 'translateY(-10px) rotate(1deg)' },
          '50%': { transform: 'translateY(-15px) rotate(0deg)' },
          '75%': { transform: 'translateY(-5px) rotate(-1deg)' },
        },
        'sacred-glow': {
          '0%': { boxShadow: '0 0 20px rgba(246, 196, 83, 0.2)' },
          '100%': { boxShadow: '0 0 40px rgba(246, 196, 83, 0.4)' },
        },
        'sacred-pulse': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        'sacred-marquee': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'sacred-shimmer': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      backgroundImage: {
        'sacred-gradient': 'linear-gradient(135deg, #f6c453 0%, #fbbf24 50%, #f59e0b 100%)',
        'sacred-gradient-subtle': 'linear-gradient(135deg, rgba(246, 196, 83, 0.1) 0%, rgba(251, 191, 36, 0.05) 100%)',
        'sacred-gradient-background': 'linear-gradient(135deg, #0f172a 0%, #18181b 50%, #1e293b 100%)',
        'sacred-pattern': 'radial-gradient(ellipse 600px 400px at top left, rgba(246, 196, 83, 0.08), transparent), radial-gradient(ellipse 800px 600px at bottom right, rgba(246, 196, 83, 0.06), transparent)',
        'sacred-dots': 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'60\' height=\'60\' viewBox=\'0 0 60 60\'%3E%3Cg fill=\'rgba(246,196,83,0.02)\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'2\'/%3E%3Ccircle cx=\'0\' cy=\'0\' r=\'1\'/%3E%3Ccircle cx=\'60\' cy=\'60\' r=\'1\'/%3E%3C/g%3E%3C/svg%3E")',
      },
      backdropBlur: {
        'sacred': '12px',
        'sacred-xl': '20px',
      },
    },
  },
  plugins: [],
};

export default config;
