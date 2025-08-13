/**
 * AskForm Component - Orthodox Cathedral
 * ------------------------------------------------------------
 * TODO: ✅ Question form interface
 * TODO: ✅ Language selection
 * TODO: ✅ Response style options
 */

'use client';

import { useState } from 'react';

import { motion } from 'framer-motion';
import { Languages,MessageSquareQuote, Send, Settings } from 'lucide-react';

interface AskFormProps {
  locale: string;
  className?: string;
}

export default function AskForm({ locale, className = '' }: AskFormProps) {
  const [question, setQuestion] = useState('');
  const [responseStyle, setResponseStyle] = useState('detailed');
  const [responseLanguage, setResponseLanguage] = useState('formal');
  const isArabic = locale === 'ar';
  
  const content = {
    title: isArabic ? '🤖 اسأل جيش المفديين' : '🤖 Ask Gaish Elmafdein',
    description: isArabic 
      ? 'ذكاء اصطناعي يجيب من مصادر أرثوذكسية فقط — اختر الفصحى أو العامية.'
      : 'AI that answers from Orthodox sources only — choose formal or dialectal Arabic.',
    placeholder: isArabic 
      ? 'اكتب سؤالك اللاهوتي…'
      : 'Write your theological question…',
    submit: isArabic ? 'اسأل الآن' : 'Ask Now',
    language: {
      label: isArabic ? 'لغة الإجابة:' : 'Response Language:',
      formal: isArabic ? 'فصحى' : 'Formal Arabic',
      dialect: isArabic ? 'عامية' : 'Dialectal Arabic'
    },
    style: {
      label: isArabic ? 'نمط الإجابة:' : 'Response Style:',
      detailed: isArabic ? 'مفصل' : 'Detailed',
      brief: isArabic ? 'مختصر' : 'Brief',
      crushing: isArabic ? 'صاعق' : 'Crushing'
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement API call
    console.log('Question submitted:', { question, responseStyle, responseLanguage });
  };

  return (
    <section id="ask" className={`py-20 lg:py-32 border-t border-white/5 ${className}`}>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="card-sacred p-8 lg:p-12"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 p-3 rounded-2xl bg-amber-300/10 
                          border border-amber-400/20 mb-6">
              <MessageSquareQuote className="w-6 h-6 text-amber-300" />
            </div>
            
            <h2 className="text-sacred-heading mb-4">
              {content.title}
            </h2>
            <p className="text-sacred-subheading max-w-2xl mx-auto">
              {content.description}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Question Input */}
            <div>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={content.placeholder}
                rows={4}
                className="input-sacred resize-none"
                required
              />
            </div>

            {/* Options Row */}
            <div className="grid sm:grid-cols-2 gap-6">
              
              {/* Response Language */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-3">
                  <Languages className="w-4 h-4" />
                  {content.language.label}
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'formal', label: content.language.formal },
                    { value: 'dialect', label: content.language.dialect }
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-3 p-3 rounded-lg border border-white/10
                               bg-white/5 hover:bg-white/10 cursor-pointer transition-all"
                    >
                      <input
                        type="radio"
                        name="responseLanguage"
                        value={option.value}
                        checked={responseLanguage === option.value}
                        onChange={(e) => setResponseLanguage(e.target.value)}
                        className="w-4 h-4 text-amber-300 border-white/20 focus:ring-amber-300"
                      />
                      <span className="text-sm text-white/80">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Response Style */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-3">
                  <Settings className="w-4 h-4" />
                  {content.style.label}
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'detailed', label: content.style.detailed },
                    { value: 'brief', label: content.style.brief },
                    { value: 'crushing', label: content.style.crushing }
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-3 p-3 rounded-lg border border-white/10
                               bg-white/5 hover:bg-white/10 cursor-pointer transition-all"
                    >
                      <input
                        type="radio"
                        name="responseStyle"
                        value={option.value}
                        checked={responseStyle === option.value}
                        onChange={(e) => setResponseStyle(e.target.value)}
                        className="w-4 h-4 text-amber-300 border-white/20 focus:ring-amber-300"
                      />
                      <span className="text-sm text-white/80">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center pt-4">
              <motion.button
                type="submit"
                disabled={!question.trim()}
                className="btn-sacred text-lg px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: question.trim() ? 1.05 : 1 }}
                whileTap={{ scale: question.trim() ? 0.95 : 1 }}
              >
                <Send className="w-5 h-5" />
                {content.submit}
              </motion.button>
            </div>
          </form>

          {/* Disclaimer */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-xs text-white/50">
              {isArabic 
                ? 'جميع الإجابات مستندة على مصادر أرثوذكسية موثقة ومراجعة من قبل متخصصين'
                : 'All responses are based on documented Orthodox sources and reviewed by specialists'
              }
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
