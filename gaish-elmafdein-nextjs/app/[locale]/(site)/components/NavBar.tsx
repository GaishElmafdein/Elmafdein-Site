/**
 * NavBar Component - Orthodox Cathedral
 * ------------------------------------------------------------
 * TODO: ✅ Responsive navigation
 * TODO: ✅ Language switcher
 * TODO: ✅ Sacred styling
 * TODO: ⏳ Mobile menu
 */

'use client';

import { useState } from 'react';

import { Church, Globe,Menu, Sparkles, X } from 'lucide-react';

interface NavBarProps {
  locale: string;
  className?: string;
}

export default function NavBar({ locale, className = '' }: NavBarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isArabic = locale === 'ar';
  
  const navigation = [
    { 
      key: 'radio', 
      href: '#radio', 
      label: isArabic ? 'الراديو' : 'Radio' 
    },
    { 
      key: 'library', 
      href: '#library', 
      label: isArabic ? 'المكتبة' : 'Library' 
    },
    { 
      key: 'ask', 
      href: '#ask', 
      label: isArabic ? 'اسأل' : 'Ask' 
    },
    { 
      key: 'about', 
      href: '#about', 
      label: isArabic ? 'عن المنظومة' : 'About' 
    },
  ];

  const toggleLanguage = () => {
    const newLocale = locale === 'ar' ? 'en' : 'ar';
    window.location.href = `/${newLocale}`;
  };

  return (
    <header className={`sticky top-0 z-50 backdrop-blur-md bg-slate-950/40 border-b border-white/5 ${className}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-300/10 border border-amber-400/20">
              <Church className="w-5 h-5 text-amber-300" />
            </div>
            <span className="font-bold tracking-wide text-lg">
              {isArabic ? 'جيش المفديين' : 'Gaish Elmafdein'}
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navigation.map((item) => (
              <a
                key={item.key}
                href={item.href}
                className="text-sm text-white/80 hover:text-white transition-colors duration-200
                         hover:text-amber-300 relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-300 
                               group-hover:w-full transition-all duration-300"></span>
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-lg bg-white/5 border border-white/10 
                       hover:bg-white/10 hover:border-white/20 transition-all duration-200
                       flex items-center gap-2 text-sm"
              aria-label={isArabic ? 'Switch to English' : 'التبديل للعربية'}
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">
                {isArabic ? 'EN' : 'ع'}
              </span>
            </button>

            {/* CTA Button */}
            <a 
              href="#start" 
              className="btn-sacred-outline text-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">
                {isArabic ? 'ابدأ الآن' : 'Get Started'}
              </span>
            </a>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-white/5 border border-white/10 
                       hover:bg-white/10 transition-colors duration-200"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-white/5 py-4">
            <nav className="flex flex-col gap-3">
              {navigation.map((item) => (
                <a
                  key={item.key}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="p-3 rounded-lg bg-white/5 text-white/80 hover:text-white 
                           hover:bg-white/10 transition-all duration-200 text-center"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
