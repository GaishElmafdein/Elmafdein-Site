// app/[locale]/layout.tsx (Lightweight i18n metadata + wrapper)
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

const AR_TITLE = 'جيش المفديين – الكاتدرائية الرقمية'
const EN_TITLE = 'Gaish Elmafdein – The Digital Cathedral'
const DESCRIPTION = 'أرشيف أرثوذكسي، مكتبة كتب، ورجَاع دفاعي مدعوم بالذكاء الاصطناعي. Orthodox digital cathedral with live library and AI apologetics.'

type Props = { children: React.ReactNode; params: Promise<{ locale: 'ar' | 'en' }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const isAr = locale === 'ar'
  const title = isAr ? AR_TITLE : EN_TITLE
  const base = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000')
  const alternates = {
    canonical: new URL(`/${locale}`, base).toString(),
    languages: {
      ar: new URL('/ar', base).toString(),
      en: new URL('/en', base).toString(),
    },
  } as const

  return {
    title: { default: title, template: `%s | ${title}` },
    description: DESCRIPTION,
    alternates,
    openGraph: {
      title,
      description: DESCRIPTION,
  url: new URL(`/${locale}`, base).toString(),
      siteName: 'Gaish Elmafdein',
      locale: isAr ? 'ar_EG' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: DESCRIPTION,
    },
  }
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params
  const isAr = locale === 'ar'
  return (
    <div dir={isAr ? 'rtl' : 'ltr'} className="min-h-dvh">
      {children}
    </div>
  )
}
