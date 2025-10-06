"use client";
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Props { locale: 'ar'|'en'; className?: string }

export default function TopRightLangPill({ locale, className = '' }: Props) {
  const pathname = usePathname() || '/'
  const alt = locale === 'ar' ? 'en' : 'ar'
  const nextPath = `/${alt}${pathname.replace(/^\/[a-z]{2}(?=\/|$)/,'') || ''}`
  const label = alt === 'ar' ? '🇪🇬 AR' : '🇺🇸 EN'

  return (
    <div className={`fixed top-2 right-2 z-40 ${className}`}>
      <Link
        href={nextPath}
        className="px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 text-white text-xs font-medium backdrop-blur-md transition"
        aria-label={alt === 'ar' ? 'تبديل إلى العربية' : 'Switch to English'}
      >
        {label}
      </Link>
    </div>
  )
}
