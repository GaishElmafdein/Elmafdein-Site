export const locales = ['ar', 'en'] as const;
export type SupportedLocale = typeof locales[number];

export function getMetadata(locale: SupportedLocale) {
  const isArabic = locale === 'ar';
  return {
    title: isArabic
      ? 'جيش المفديين - كاتدرائية رقمية أرثوذكسية'
      : 'Gaish Elmafdein - Orthodox Digital Cathedral',
    description: isArabic
      ? 'منصة أرثوذكسية رقمية شاملة تضم بث راديو مباشر، مكتبة آبائية، وردود دفاعية مدعومة بالذكاء الاصطناعي'
      : 'Comprehensive Orthodox digital platform featuring live radio streaming, patristic library, and AI-powered theological defense',
    keywords: isArabic
      ? 'أرثوذكسية, راديو مسيحي, مكتبة آبائية, دفاعيات مسيحية, كنيسة قبطية, تراث مسيحي'
      : 'Orthodox Christianity, Christian radio, patristic library, Christian apologetics, Coptic Church, Christian heritage'
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
