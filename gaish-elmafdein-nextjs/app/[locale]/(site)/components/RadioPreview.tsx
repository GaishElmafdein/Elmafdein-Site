/**
 * RadioPreview Component - Orthodox Cathedral  
 * ------------------------------------------------------------
 * TODO: ✅ Mock player interface
 * TODO: ✅ Now playing section
 * TODO: ✅ Playlist preview
 */

'use client';

import { useState } from 'react';

import { motion } from 'framer-motion';
import { Clock,Pause, Play, Radio, Volume2 } from 'lucide-react';

interface RadioPreviewProps {
  locale: string;
  className?: string;
}

export default function RadioPreview({ locale, className = '' }: RadioPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const isArabic = locale === 'ar';
  
  const content = {
    title: isArabic ? '🎙️ راديو المفديين — الآن تشغيل' : '🎙️ Redeemed Radio — Now Playing',
    description: isArabic 
      ? 'استمع لبث مباشر 24/7 مع فواصل آبائية وأناشيد روحية. يدعم Google Cast قريبًا.'
      : 'Listen to 24/7 live streaming with patristic intermissions and spiritual hymns. Google Cast support coming soon.',
    nowPlaying: isArabic ? 'تشغيل الآن' : 'Now Playing',
    playlist: isArabic ? [
      '🔴 تراتيل بايزنطية — بث مباشر',
      '🕯️ قول آبائي الساعة — القديس أثناسيوس',
      '📖 قراءة يومية — إنجيل اليوم'
    ] : [
      '🔴 Byzantine Chants — Live Stream',
      '🕯️ Hourly Patristic Quote — St. Athanasius',
      '📖 Daily Reading — Today\'s Gospel'
    ],
    note: isArabic 
      ? '* البيانات تجريبية — اربطها لاحقًا بـ AzuraCast/OBS.'
      : '* Test data — connect later with AzuraCast/OBS.'
  };

  return (
    <section id="radio" className={`py-20 lg:py-32 border-t border-white/5 ${className}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-sacred-heading mb-6">
              {content.title}
            </h2>
            <p className="text-sacred-subheading mb-8">
              {content.description}
            </p>
            
            {/* Mock Player */}
            <div className="card-sacred p-6">
              {/* Player Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-red-500/20 border border-red-400/30">
                  <Radio className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">
                    {isArabic ? 'راديو المفديين مباشر' : 'Gaish Elmafdein Live'}
                  </h4>
                  <p className="text-sm text-white/60">
                    {isArabic ? 'جودة عالية • 128 كيلوبت/ثانية' : 'High Quality • 128 kbps'}
                  </p>
                </div>
              </div>
              
              {/* Mock Visualizer */}
              <div className="aspect-video w-full rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 
                            border border-white/10 mb-4 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-sacred-pattern opacity-20" />
                <div className="relative z-10 text-center">
                  <div className="flex items-center justify-center gap-1 mb-4">
                    {[...Array(12)].map((_, i) => (
                      <div 
                        key={i}
                        className={`w-1 bg-amber-300 rounded-full transition-all duration-300 ${
                          isPlaying ? 'animate-pulse' : ''
                        }`}
                        style={{ 
                          height: `${Math.random() * 40 + 10}px`,
                          animationDelay: `${i * 0.1}s`
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-white/60 text-sm">
                    {isArabic ? 'مشغل البث (تجريبي)' : 'Stream Player (Demo)'}
                  </p>
                </div>
              </div>
              
              {/* Player Controls */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="btn-sacred text-sm"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isPlaying 
                    ? (isArabic ? 'توقف' : 'Pause')
                    : (isArabic ? 'تشغيل' : 'Play')
                  }
                </button>
                
                <div className="flex items-center gap-2 flex-1">
                  <Volume2 className="w-4 h-4 text-white/60" />
                  <div className="flex-1 h-1 bg-white/20 rounded-full">
                    <div className="w-3/4 h-full bg-amber-300 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Right Column - Now Playing */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="card-sacred p-6">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-5 h-5 text-amber-300" />
                <h3 className="font-semibold text-lg">
                  {content.nowPlaying}
                </h3>
              </div>
              
              <ul className="space-y-4">
                {content.playlist.map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10
                             hover:bg-white/10 transition-all duration-200"
                  >
                    <div className="w-2 h-2 rounded-full bg-amber-300 mt-2 flex-shrink-0" />
                    <span className="text-white/80 text-sm leading-relaxed">
                      {item}
                    </span>
                  </motion.li>
                ))}
              </ul>
              
              <div className="mt-6 pt-4 border-t border-white/10">
                <p className="text-xs text-white/50">
                  {content.note}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
