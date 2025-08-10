import SacredNavBar from '@/components/ui/SacredNavBar'
import { Suspense } from 'react'
import AIDefenseClient from './ui/AIDefenseClient'

interface PageProps { params: Promise<{ locale: string }> }

export default async function AIDefensePage({ params }: PageProps) {
  const { locale } = await params
  return (
    <div className="min-h-screen pt-24 px-4">
      <SacredNavBar locale={locale} />
      <div className="max-w-5xl mx-auto">
        <Suspense fallback={<div className="text-white/60">Loading...</div>}>
          <AIDefenseClient locale={locale} />
        </Suspense>
      </div>
    </div>
  )
}
