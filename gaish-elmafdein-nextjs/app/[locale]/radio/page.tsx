import SacredNavBar from '@/components/ui/SacredNavBar'

interface PageProps { params: Promise<{ locale: string }> }

export default async function RadioPage({ params }: PageProps) {
  const { locale } = await params
  const isArabic = locale === 'ar'
  return (
    <div className="min-h-screen pt-24 px-4">
      <SacredNavBar locale={locale} />
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-sacred-gold to-sacred-amber bg-clip-text text-transparent">
          {isArabic ? 'الراديو الأرثوذكسي المباشر' : 'Orthodox Live Radio'}
        </h1>
        <p className="text-white/70">
          {isArabic
            ? 'قريباً: بث مباشر 24/7 للتراتيل والتعليم الأرثوذكسي. سيتم دمج مشغل متقدم مع دعم HLS ومتتبع للأناشيد.'
            : 'Coming soon: 24/7 live streaming of Orthodox chants and teachings. An advanced player with HLS support and track metadata will be integrated.'}
        </p>
        <div className="p-6 rounded-2xl border border-sacred-gold/20 bg-white/5 backdrop-blur">
          <p className="text-sm text-white/60">
            {isArabic
              ? 'سيتم تفعيل البث بعد اكتمال إعداد الخادم الصوتي.'
              : 'Streaming will activate once the audio backend is provisioned.'}
          </p>
        </div>
      </div>
    </div>
  )
}
