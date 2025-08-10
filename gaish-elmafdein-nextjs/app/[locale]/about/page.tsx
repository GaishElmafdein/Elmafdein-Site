import SacredNavBar from '@/components/ui/SacredNavBar'

interface PageProps { params: Promise<{ locale: string }> }

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params
  const isArabic = locale === 'ar'
  return (
    <div className="min-h-screen pt-24 px-4">
      <SacredNavBar locale={locale} />
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-sacred-gold to-sacred-amber bg-clip-text text-transparent">
          {isArabic ? 'حول الكاتدرائية الرقمية' : 'About the Digital Cathedral'}
        </h1>
        <p className="text-white/70 leading-relaxed text-sm">
          {isArabic
            ? 'منصة جيش المفديين تهدف إلى تقديم محتوى آبائي أرثوذكسي موثق، بث روحي مباشر، وأدوات دفاع لاهوتي حديثة.'
            : 'Gaish Elmafdein aims to deliver authenticated Orthodox patristic content, live spiritual broadcasting, and modern theological defense tools.'}
        </p>
      </div>
    </div>
  )
}
