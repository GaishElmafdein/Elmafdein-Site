/**
 * Orthodox Cathedral Site Layout - Simplified
 * ------------------------------------------------------------
 * TODO: ✅ Basic i18n setup
 * TODO: ✅ Sacred fonts loading 
 * TODO: ✅ RTL/LTR support
 * TODO: ✅ SEO metadata
 */

import { Cairo,Inter } from 'next/font/google';
import { notFound } from 'next/navigation';

import './styles/globals.css';
import './styles/fonts.css';

import { getMetadata, locales } from './layout.utils';
export { generateStaticParams } from './layout.utils';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const cairo = Cairo({
  subsets: ['arabic'],
  variable: '--font-cairo',
  display: 'swap',
});


interface Props { children: React.ReactNode; params: { locale: string }; }

export async function generateMetadata({ params: { locale } }: Props) {
  const meta = getMetadata(locale as 'ar' | 'en');
  
  return {
    title: {
      template: `%s | ${meta.title}`,
      default: meta.title,
    },
    description: meta.description,
    keywords: meta.keywords,
    authors: [{ name: 'Gaish Elmafdein', url: 'https://gaish-elmafdein.org' }],
    creator: 'Gaish Elmafdein Orthodox Digital Cathedral',
    publisher: 'Gaish Elmafdein',
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      type: 'website',
      locale: locale === 'ar' ? 'ar_EG' : 'en_US',
      url: 'https://gaish-elmafdein.org',
      siteName: meta.title,
      title: meta.title,
      description: meta.description,
      images: [
        {
          url: '/images/og-cathedral.jpg',
          width: 1200,
          height: 630,
          alt: meta.title,
        },
      ],
    },
  };
}

export default async function LocaleLayout({ children, params: { locale } }: Props) {
  // Validate that the incoming `locale` parameter is valid
  const isValidLocale = locales.some((cur) => cur === locale);
  if (!isValidLocale) notFound();

  const isArabic = locale === 'ar';

  return (
    <html 
      lang={locale} 
      dir={isArabic ? 'rtl' : 'ltr'}
      className={`${inter.variable} ${cairo.variable} scroll-smooth`}
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
          ${isArabic ? 'font-cairo' : 'font-inter'}
        `}
      >
        {/* Skip to main content link for accessibility */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
                   bg-amber-300 text-slate-900 px-4 py-2 rounded-lg font-semibold z-50"
        >
          {isArabic ? 'انتقل إلى المحتوى الرئيسي' : 'Skip to main content'}
        </a>
        
        {/* Main content wrapper */}
        <div id="main-content" className="relative">
          {children}
        </div>
        
        {/* Background pattern overlay */}
        <div className="fixed inset-0 -z-10 opacity-40 pointer-events-none bg-sacred-pattern" />
      </body>
    </html>
  );
}
