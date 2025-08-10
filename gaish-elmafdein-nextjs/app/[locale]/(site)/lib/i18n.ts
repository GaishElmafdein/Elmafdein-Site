/**
 * Translation utilities
 * ------------------------------------------------------------
 * Simple i18n helper functions
 */

import arTranslations from '../data/i18n/ar.json';
import enTranslations from '../data/i18n/en.json';

type TranslationKey = string;
type Locale = 'ar' | 'en';

const translations = {
  ar: arTranslations,
  en: enTranslations
} as const;

export function getTranslation(locale: Locale, key: TranslationKey): string {
  const keys = key.split('.');
  // Narrow translation object type progressively
  let value: unknown = translations[locale] as unknown;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in (value as Record<string, unknown>)) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return key; // fallback early
    }
  }
  return typeof value === 'string' ? value : key;
}

export function t(locale: Locale) {
  return (key: TranslationKey, params?: Record<string, string | number>) => {
    let translation = getTranslation(locale, key);
    
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(`{${param}}`, String(value));
      });
    }
    
    return translation;
  };
}

export const isRTL = (locale: Locale) => locale === 'ar';
