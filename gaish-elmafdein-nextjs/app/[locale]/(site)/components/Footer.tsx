/**
 * Footer Component - Orthodox Cathedral
 * ------------------------------------------------------------
 * TODO: ✅ Site links and information
 * TODO: ✅ Copyright and credits
 * TODO: ✅ Social links
 */

'use client';

import { motion } from 'framer-motion';
import { Church, Heart, ExternalLink } from 'lucide-react';

interface FooterProps {
  locale: string;
  className?: string;
}

export default function Footer({ locale, className = '' }: FooterProps) {
  const isArabic = locale === 'ar';
  const currentYear = new Date().getFullYear();
  
  const content = {
    copyright: isArabic 
      ? `© ${currentYear} جيش المفديين — كاتدرائية رقمية`
      : `© ${currentYear} Gaish Elmafdein — Digital Cathedral`,
    tagline: isArabic 
      ? 'مصمم بروح تقليدية وبأدوات حديثة: Tailwind + Framer Motion'
      : 'Designed with traditional spirit and modern tools: Tailwind + Framer Motion',
    links: {
      privacy: isArabic ? 'سياسة الخصوصية' : 'Privacy Policy',
      terms: isArabic ? 'شروط الاستخدام' : 'Terms of Use',
      contact: isArabic ? 'اتصل بنا' : 'Contact Us',
      github: isArabic ? 'المصدر المفتوح' : 'Open Source'
    },
    sections: {
      platform: {
        title: isArabic ? 'المنصة' : 'Platform',
        links: [
          { label: isArabic ? 'الراديو' : 'Radio', href: '#radio' },
          { label: isArabic ? 'المكتبة' : 'Library', href: '#library' },
          { label: isArabic ? 'اسأل' : 'Ask', href: '#ask' }
        ]
      },
      community: {
        title: isArabic ? 'المجتمع' : 'Community',
        links: [
          { label: isArabic ? 'عن المنظومة' : 'About', href: '#about' },
          { label: isArabic ? 'تطوع معنا' : 'Volunteer', href: '#volunteer' },
          { label: isArabic ? 'الدعم' : 'Support', href: '#support' }
        ]
      },
      resources: {
        title: isArabic ? 'المصادر' : 'Resources',
        links: [
          { label: isArabic ? 'دليل الاستخدام' : 'User Guide', href: '#guide' },
          { label: isArabic ? 'الأسئلة الشائعة' : 'FAQ', href: '#faq' },
          { label: isArabic ? 'API' : 'API', href: '#api' }
        ]
      }
    }
  };

  return (
    <footer className={`border-t border-white/5 bg-slate-950/50 ${className}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Content */}
        <div className="py-12 lg:py-16">
          <div className="grid lg:grid-cols-4 gap-8 lg:gap-12">
            
            {/* Logo and Description */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 mb-4"
              >
                <div className="p-2 rounded-lg bg-amber-300/10 border border-amber-400/20">
                  <Church className="w-6 h-6 text-amber-300" />
                </div>
                <span className="font-bold text-xl">
                  {isArabic ? 'جيش المفديين' : 'Gaish Elmafdein'}
                </span>
              </motion.div>
              
              <p className="text-white/70 text-sm leading-relaxed mb-6">
                {isArabic 
                  ? 'كاتدرائية رقمية أرثوذكسية تجمع التراث الآبائي مع التقنيات الحديثة.'
                  : 'Orthodox digital cathedral combining patristic heritage with modern technology.'
                }
              </p>
              
              {/* Made with love */}
              <div className="flex items-center gap-2 text-xs text-white/50">
                <span>{isArabic ? 'صُنع بـ' : 'Made with'}</span>
                <Heart className="w-3 h-3 text-red-400" />
                <span>{isArabic ? 'للكنيسة الأرثوذكسية' : 'for the Orthodox Church'}</span>
              </div>
            </div>

            {/* Links Sections */}
            {Object.entries(content.sections).map(([key, section]) => (
              <div key={key}>
                <h3 className="font-semibold text-white mb-4">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.links.map((link, index) => (
                    <li key={index}>
                      <motion.a
                        href={link.href}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="text-white/60 hover:text-white text-sm transition-colors
                                 hover:text-amber-300 flex items-center gap-2 group"
                      >
                        {link.label}
                        {link.href.startsWith('http') && (
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </motion.a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-white/5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Copyright */}
            <div className="flex flex-col sm:flex-row items-center gap-4 text-white/60 text-sm">
              <span>{content.copyright}</span>
              <div className="hidden sm:block w-1 h-1 bg-white/30 rounded-full" />
              <div className="flex items-center gap-4">
                <a href="#privacy" className="hover:text-white transition-colors">
                  {content.links.privacy}
                </a>
                <a href="#terms" className="hover:text-white transition-colors">
                  {content.links.terms}
                </a>
                <a href="#contact" className="hover:text-white transition-colors">
                  {content.links.contact}
                </a>
              </div>
            </div>

            {/* Tagline */}
            <div className="text-xs text-white/40 text-center sm:text-right">
              {content.tagline}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
