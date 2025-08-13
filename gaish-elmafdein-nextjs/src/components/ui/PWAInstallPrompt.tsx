"use client";
import { useEffect, useState } from 'react';

// Custom type for the beforeinstallprompt event
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

export function PWAInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handler = (e: Event) => {
      const bip = e as BeforeInstallPromptEvent;
      e.preventDefault();
      setDeferred(bip);
      setTimeout(() => setVisible(true), 500);
    };
    window.addEventListener('beforeinstallprompt', handler as EventListener);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[PWA] service worker register failed', err);
        }
      });
    }

  return () => window.removeEventListener('beforeinstallprompt', handler as EventListener);
  }, []);

  if (!visible || !deferred) return null;

  return (
    <div className="fixed bottom-4 inset-x-0 px-4 z-50">
      <div className="max-w-md mx-auto bg-midnight-800/90 backdrop-blur border border-gold-500/30 rounded-xl p-4 shadow-lg text-gold-100 font-arabic flex items-center gap-4">
        <div className="flex-1 text-sm">
          ثبّت النسخة كتطبيق للرجوع السريع
        </div>
        <button
          onClick={async () => { if (!deferred) return; await deferred.prompt(); const choice = await deferred.userChoice; if (choice.outcome) setVisible(false); }}
          className="px-3 py-2 rounded-lg bg-gold-500 text-midnight-900 font-bold text-xs"
        >تثبيت</button>
        <button
          onClick={() => setVisible(false)}
          className="px-3 py-2 rounded-lg bg-midnight-700 text-gold-200 text-xs"
        >لاحقًا</button>
      </div>
    </div>
  );
}
