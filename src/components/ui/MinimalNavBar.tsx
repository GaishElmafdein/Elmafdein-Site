"use client";
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Search, Globe, ChevronDown } from 'lucide-react';

interface Props { locale: string; className?: string }
const LANGS = [
  { code: 'ar', name: 'العربية', flag: '🇪🇬' },
  { code: 'en', name: 'English', flag: '🇺🇸' }
];

export default function MinimalNavBar({ locale, className = '' }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [openLang, setOpenLang] = useState(false);
  const [focusSearch, setFocusSearch] = useState(false);
  const pathname = usePathname();
  const isAr = locale === 'ar';

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => { setOpenLang(false); }, [pathname]);

  const langPath = (code: string) => `/${code}${pathname.replace(/^\/[a-z]{2}/,'')}`;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all ${scrolled ? 'bg-slate-900/90 border-b border-amber-500/20 backdrop-blur-xl' : 'bg-slate-900/40 border-b border-white/5 backdrop-blur-md'} ${className}`}>      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
        <div className="flex-1 flex justify-center">
          <div className="relative w-full max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
            <input
              type="search"
              placeholder={isAr ? 'البحث في الكاتدرائية...' : 'Search the Cathedral...'}
              dir={isAr ? 'rtl' : 'ltr'}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/15 placeholder-white/40 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400/70 focus:border-amber-400/70 transition ${isAr ? 'text-right font-arabic' : 'text-left'}`}
              onFocus={() => setFocusSearch(true)}
              onBlur={() => setFocusSearch(false)}
            />
            {focusSearch && <span className="absolute -bottom-5 left-2 text-xs text-amber-300">↵ {isAr ? 'اضغط Enter' : 'Press Enter'}</span>}
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setOpenLang(o => !o)}
            className="flex items-center gap-2 px-3 py-2 bg-white/10 border border-white/15 hover:border-amber-400 rounded-xl text-sm transition"
            aria-haspopup="true" aria-expanded={openLang}
          >
            <Globe className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline text-white">{LANGS.find(l => l.code === locale)?.flag}</span>
            <ChevronDown className={`w-3 h-3 text-white/60 transition ${openLang ? 'rotate-180' : ''}`} />
          </button>
          {openLang && (
            <ul className="absolute right-0 mt-2 w-48 bg-slate-900/95 backdrop-blur-xl border border-white/15 rounded-xl shadow-lg overflow-hidden" aria-label={isAr ? 'تغيير اللغة' : 'Change language'}>
              {LANGS.map(l => (
                <li key={l.code}>
                  <Link
                    href={langPath(l.code)}
                    className={`flex items-center gap-3 px-4 py-3 text-sm hover:bg-amber-400/10 ${l.code === locale ? 'bg-amber-400/20 text-amber-300' : 'text-white/80'}`}
                    onClick={() => setOpenLang(false)}
                  >
                    <span>{l.flag}</span>
                    <span className="font-medium">{l.name}</span>
                    {l.code === locale && <span className="ml-auto w-2 h-2 rounded-full bg-amber-400" />}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
}