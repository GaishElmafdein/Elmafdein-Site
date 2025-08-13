/**
 * LibraryGrid Component - Orthodox Cathedral
 * ------------------------------------------------------------
 * TODO: ✅ Mock library books
 * TODO: ✅ Search interface
 * TODO: ✅ Filter options
 */

'use client';

import { useState } from 'react';

import { motion } from 'framer-motion';
import { BookOpen, Download,Filter, Search } from 'lucide-react';

interface LibraryGridProps {
  locale: string;
  className?: string;
}

export default function LibraryGrid({ locale, className = '' }: LibraryGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const isArabic = locale === 'ar';
  
  const content = {
    title: isArabic ? '📚 مكتبة آبائية رقمية' : '📚 Digital Patristic Library',
    description: isArabic 
      ? 'كتب PDF، نصوص آبائية، واقتباسات موثقة مع بحث ذكي وفلترة حسب الكاتب والموضوع.'
      : 'PDF books, patristic texts, and documented quotes with smart search and filtering by author and topic.',
    searchPlaceholder: isArabic ? 'ابحث في المكتبة...' : 'Search the library...',
    filters: {
      all: isArabic ? 'جميع الكتب' : 'All Books',
      liturgy: isArabic ? 'طقسيات' : 'Liturgy',
      theology: isArabic ? 'لاهوت' : 'Theology',
      patrology: isArabic ? 'آبائيات' : 'Patrology',
      apologetics: isArabic ? 'دفاعيات' : 'Apologetics'
    }
  };

  const mockBooks = [
    {
      id: 1,
      title: isArabic ? 'الكتاب المقدس - العهد الجديد' : 'The New Testament',
      author: isArabic ? 'الكنيسة الأرثوذكسية' : 'Orthodox Church',
      category: 'liturgy',
      pages: 432,
      language: isArabic ? 'عربي' : 'Arabic'
    },
    {
      id: 2,
      title: isArabic ? 'ضد الأريوسيين' : 'Against the Arians',
      author: isArabic ? 'القديس أثناسيوس الإسكندري' : 'St. Athanasius',
      category: 'theology',
      pages: 298,
      language: isArabic ? 'عربي' : 'Arabic'
    },
    {
      id: 3,
      title: 'The Didache',
      author: 'Apostolic Fathers',
      category: 'patrology',
      pages: 64,
      language: 'English'
    },
    {
      id: 4,
      title: isArabic ? 'كتاب الأجبية المقدسة' : 'Book of Hours',
      author: isArabic ? 'الكنيسة القبطية' : 'Coptic Church',
      category: 'liturgy',
      pages: 156,
      language: isArabic ? 'عربي' : 'Arabic'
    },
    {
      id: 5,
      title: 'On the Incarnation',
      author: 'St. Athanasius',
      category: 'theology',
      pages: 124,
      language: 'English'
    },
    {
      id: 6,
      title: isArabic ? 'الدفاع عن الإيمان' : 'Defense of Faith',
      author: isArabic ? 'الأنبا شنودة الثالث' : 'Pope Shenouda III',
      category: 'apologetics',
      pages: 201,
      language: isArabic ? 'عربي' : 'Arabic'
    }
  ];

  return (
    <section id="library" className={`py-20 lg:py-32 border-t border-white/5 ${className}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-sacred-heading mb-4">
            {content.title}
          </h2>
          <p className="text-sacred-subheading max-w-3xl mx-auto mb-8">
            {content.description}
          </p>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-white/40" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={content.searchPlaceholder}
              className="input-sacred pl-10"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {Object.entries(content.filters).map(([key, label]) => (
            <button
              key={key}
              className="px-4 py-2 rounded-lg text-sm font-medium
                       bg-white/5 border border-white/10 text-white/70
                       hover:bg-white/10 hover:text-white hover:border-amber-400/30
                       transition-all duration-200"
            >
              {label}
            </button>
          ))}
        </div>

        {/* Books Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {mockBooks.map((book, index) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ 
                delay: index * 0.1, 
                duration: 0.6 
              }}
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              className="card-sacred-glow group cursor-pointer"
            >
              {/* Book Cover */}
              <div className="aspect-[3/4] w-full rounded-xl mb-4 bg-gradient-to-br 
                            from-amber-300/20 to-slate-800/60 
                            flex items-center justify-center text-white/50 text-6xl
                            group-hover:from-amber-300/30 transition-all duration-300">
                <BookOpen />
              </div>
              
              {/* Book Info */}
              <div className="space-y-2">
                <h3 className="font-semibold text-white group-hover:text-amber-200 
                             transition-colors line-clamp-2">
                  {book.title}
                </h3>
                <p className="text-sm text-white/60">
                  {book.author}
                </p>
                <div className="flex items-center justify-between text-xs text-white/50">
                  <span>{book.pages} {isArabic ? 'صفحة' : 'pages'}</span>
                  <span>{book.language}</span>
                </div>
              </div>
              
              {/* Action Button */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <button className="w-full btn-sacred-outline text-sm py-2 group/btn">
                  <Download className="w-4 h-4 group-hover/btn:animate-bounce" />
                  {isArabic ? 'تحميل' : 'Download'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Load More */}
        <div className="text-center mt-12">
          <button className="btn-sacred-outline">
            <Filter className="w-4 h-4" />
            {isArabic ? 'عرض المزيد' : 'Load More'}
          </button>
        </div>
      </div>
    </section>
  );
}
