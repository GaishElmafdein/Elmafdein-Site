/**
 * Orthodox Cathedral Site Layout - Fixed fonts + CrossSky
 */

import { Cairo, Inter, Amiri, Lateef, Reem_Kufi, Lemonada, Aref_Ruqaa } from 'next/font/google';
import { notFound } from 'next/navigation';
import CrossSky from '@/components/visuals/CrossSky';

import './globals.css';


const inter     = Inter({ subsets: ['latin'],  variable: '--font-inter',     display: 'swap', weight: ['400','500','600','700','800'] });
const cairo     = Cairo({ subsets: ['arabic'], variable: '--font-cairo',     display: 'swap', weight: ['400','500','600','700','800'] });
const amiri     = Amiri({ subsets: ['arabic'], variable: '--font-amiri', display: 'swap', weight: ['400', '700'] });
const lateef    = Lateef({ subsets: ['arabic'], variable: '--font-lateef', display: 'swap', weight: ['400', '700'] });
const reemkufi  = Reem_Kufi({ subsets: ['arabic','latin'], variable: '--font-reemkufi', display:'swap', weight: ['400','500','600','700'] });
const lemonada  = Lemonada({ subsets: ['arabic','latin'],  variable: '--font-lemonada', display:'swap', weight: ['300','400','500','600','700'] });
const arefRuqaa = Aref_Ruqaa({ subsets: ['arabic'], variable: '--font-arefruqaa', display:'swap', weight: ['400','700'] });


interface Props { children: React.ReactNode; params: { locale: string }; }

export default function LocaleLayout({ children, params }: Props) {
  const { locale } = params;
  const isArabic = locale === 'ar';
  return (
    <html
      lang={locale}
      dir={isArabic ? 'rtl' : 'ltr'}
      className={`
        ${inter.variable} ${cairo.variable} ${amiri.variable}
        ${lateef.variable} ${reemkufi.variable} ${lemonada.variable} ${arefRuqaa.variable}
        scroll-smooth
      `}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#f6c453" />
      </head>
      <body
        className={`
          min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-zinc-950
          text-white antialiased selection:bg-amber-300 selection:text-slate-900
        `}
      >
        <CrossSky
          className="fixed inset-0 z-0 pointer-events-none"
          density={0.26}
          baseSpeed={26}
          glow={1.3}
          baseSize={9}
          opacity={0.95}
          seed={20250812}
          blendScreen
        />
        <div className="relative z-10" id="main-content">
          {children}
        </div>
        <div className="fixed inset-0 -z-10 opacity-40 pointer-events-none bg-sacred-pattern" />
      </body>
    </html>
  );
}
