import type { Metadata } from 'next'
import Link from 'next/link'

import { OrthodoxCross } from '@/components/ui/orthodox-cross'
import { PWAInstallPrompt } from '@/components/ui/PWAInstallPrompt'
import { SacredBackground } from '@/components/ui/sacred-background'

export const metadata: Metadata = {
  title: 'Mobile Version - Gaish Elmafdein',
  description: 'Focused mobile landing: library, radio, AI defense'
}

const features = [
  { href: '/en/library', title: '📚 Library', desc: 'Search patristic texts', color: 'from-gold-500/30 to-gold-700/40' },
  { href: '/en/radio', title: '📻 Live Radio', desc: 'Listen now', color: 'from-flame-500/30 to-flame-700/40' },
  { href: '/en/ai-defense', title: '🤖 AI Defense', desc: 'Answer objections', color: 'from-midnight-500/30 to-midnight-700/40' },
  { href: '/defense-bot', title: '⚔️ Defense Bot', desc: 'Instant chat', color: 'from-gold-600/30 to-flame-700/40' },
]

export default function MobileLandingEN() {
  return (
    <main className="relative min-h-screen overflow-hidden font-arabic bg-gradient-to-b from-midnight-900 via-midnight-800 to-midnight-900 text-gold-100">
      <SacredBackground />
      <div className="relative z-10 px-4 pt-10 pb-24 max-w-md mx-auto">
        <div className="flex flex-col items-center gap-4 mb-8">
          <OrthodoxCross size="lg" glowing />
          <h1 className="text-3xl font-extrabold tracking-tight text-gold-400 text-center leading-snug">
            Orthodox Digital Cathedral
            <br />
            <span className="text-gold-200 text-2xl font-bold">Mobile Version</span>
          </h1>
          <p className="text-center text-gold-300/80 text-sm leading-relaxed">
            Live · Apologetics · Patristics · Comparative
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-8">
          {features.map(f => (
            <Link key={f.href} href={f.href} className={`rounded-xl p-4 bg-gradient-to-br ${f.color} border border-gold-500/20 backdrop-blur-sm active:scale-95 transition`}>
              <div className="text-base font-bold leading-tight mb-1">{f.title}</div>
              <div className="text-xs text-gold-200/70">{f.desc}</div>
            </Link>
          ))}
        </div>
        <div className="space-y-3 mb-8">
            <Link href="/en/library" className="block w-full text-center py-3 rounded-xl bg-gold-500 text-midnight-900 font-bold shadow-lg active:scale-95 transition">Enter Library</Link>
            <Link href="/en/radio" className="block w-full text-center py-3 rounded-xl bg-flame-600 text-white font-bold shadow-lg active:scale-95 transition">Listen Now</Link>
            <Link href="/en/ai-defense" className="block w-full text-center py-3 rounded-xl bg-midnight-700 text-gold-200 font-bold shadow-lg active:scale-95 transition">AI Defense</Link>
        </div>
        <div className="text-center mb-6">
          <Link href="/en" className="text-gold-300/70 text-xs underline">Skip to full site</Link>
        </div>
        <footer className="text-center text-[10px] text-gold-300/50">
          &quot;Always be ready to give a defense&quot; – 1 Peter 3:15
        </footer>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-40 pointer-events-none bg-gradient-to-t from-midnight-900 to-transparent" />
    </main>
  )
}
<PWAInstallPrompt />
