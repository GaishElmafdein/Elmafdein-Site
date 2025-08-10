"use client"

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { 
  Search, 
  Download, 
  Grid, 
  List, 
  RefreshCw,
  ExternalLink,
  Globe,
  Clock,
  Database,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  FileText,
  AlertCircle,
  // Loader2 (removed unused)
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { SacredBackground } from '@/components/ui/sacred-background'
import { OrthodoxCross } from '@/components/ui/orthodox-cross'

// Types for the new API
interface Book {
  title: string
  author: string | null
  source: "coptic-treasures.com" | "christianlib.com"
  details_url: string | null
  download_url: string | null
  cover_image: string | null
  lang: "ar" | "en" | "unknown"
  pages: number | null
  size_mb: number | null
}

interface LibraryResponse {
  items: Book[]
  count: number
  took_ms: number
  cached: boolean
}

// API Service
class LibraryAPIService {
  private static readonly API_BASE = process.env.NEXT_PUBLIC_LIBRARY_API || 'http://localhost:8000'

  static async searchBooks(
    query: string = '',
    site: string = 'all',
    page: number = 1,
    per_page: number = 24,
    force: boolean = false
  ): Promise<LibraryResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: per_page.toString(),
      site,
      force: force.toString()
    })
    
    if (query) {
      params.append('q', query)
    }

    const response = await fetch(`${this.API_BASE}/api/library?${params}`)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return response.json()
  }

  static async healthCheck(): Promise<{ status: string; cache_stats?: Record<string, unknown> }> {
    const response = await fetch(`${this.API_BASE}/healthz`)
    
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`)
    }
    
    return response.json()
  }
}

export default function LibraryPage() {
  // State management
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [selectedSite, setSelectedSite] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [cached, setCached] = useState(false)
  const [took_ms, setTookMs] = useState(0)
  const [isSearching, setIsSearching] = useState(false)
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr')
  
  const PER_PAGE = 24

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 400)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Detect text direction
  useEffect(() => {
    const hasArabic = /[\u0600-\u06FF]/.test(searchTerm)
    setDirection(hasArabic ? 'rtl' : 'ltr')
  }, [searchTerm])

  // Load books
  const loadBooks = useCallback(async (page = 1, force = false) => {
    setIsSearching(true)
    try {
      const response = await LibraryAPIService.searchBooks(
        debouncedSearchTerm,
        selectedSite,
        page,
        PER_PAGE,
        force
      )
      
      setBooks(response.items)
      setTotalCount(response.count)
      setCached(response.cached)
      setTookMs(response.took_ms)
      setCurrentPage(page)
      
      if (response.cached) {
        toast.success(`تم تحميل ${response.items.length} كتاب من الذاكرة المؤقتة`, { 
          icon: '⚡', 
          duration: 2000 
        })
      } else {
        toast.success(`تم العثور على ${response.count} كتاب`, { 
          icon: '📚', 
          duration: 3000 
        })
      }
      
    } catch (error) {
      console.error('Failed to load books:', error)
      toast.error('فشل في تحميل الكتب. يرجى المحاولة مرة أخرى.', { 
        icon: '❌', 
        duration: 4000 
      })
      setBooks([])
      setTotalCount(0)
    } finally {
      setLoading(false)
      setIsSearching(false)
    }
  }, [debouncedSearchTerm, selectedSite])

  // Initial load and search effect
  useEffect(() => {
    setCurrentPage(1)
    loadBooks(1)
  }, [loadBooks])

  // Refresh data
  const refreshData = async () => {
    toast.loading('جاري تحديث البيانات...', { duration: 1000 })
    await loadBooks(currentPage, true)
  }

  // Page navigation
  const totalPages = Math.ceil(totalCount / PER_PAGE)
  
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      loadBooks(page)
    }
  }

  // Book card component
  const BookCard = ({ book, index }: { book: Book; index: number }) => {
    const isArabic = book.lang === 'ar'
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="bg-midnight-800/60 border border-gold-500/30 rounded-lg overflow-hidden backdrop-blur-sm hover:border-gold-500 transition-all duration-300 group"
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        {/* Cover Image */}
        <div className="relative h-48 bg-gradient-to-br from-midnight-700 to-midnight-900">
          {book.cover_image ? (
            <Image 
              src={book.cover_image} 
              alt={book.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-16 h-16 text-gold-500/50" />
            </div>
          )}
          
          {/* Source Badge */}
          <div className="absolute top-2 left-2 bg-gold-500 text-midnight-900 px-2 py-1 rounded text-xs font-bold">
            {book.source === 'coptic-treasures.com' ? 'Coptic' : 'ChristianLib'}
          </div>
          
          {/* Language Badge */}
          <div className="absolute top-2 right-2 bg-midnight-800/80 backdrop-blur-sm text-gold-400 px-2 py-1 rounded text-xs">
            {book.lang === 'ar' ? 'عربي' : book.lang === 'en' ? 'English' : 'Unknown'}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3 className={`font-bold text-gold-200 mb-2 line-clamp-2 ${isArabic ? 'font-arabic text-right' : 'font-english text-left'}`}>
            {book.title}
          </h3>
          
          {/* Author */}
          {book.author && (
            <p className={`text-gold-400/80 text-sm mb-3 ${isArabic ? 'font-arabic text-right' : 'font-english text-left'}`}>
              {isArabic ? 'بقلم: ' : 'By: '}{book.author}
            </p>
          )}
          
          {/* Metadata */}
          <div className="flex flex-wrap gap-2 mb-4 text-xs text-gold-400/60">
            {book.pages && (
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {book.pages} {isArabic ? 'صفحة' : 'pages'}
              </span>
            )}
            {book.size_mb && (
              <span className="flex items-center gap-1">
                <Database className="w-3 h-3" />
                {book.size_mb.toFixed(1)} MB
              </span>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex gap-2">
            {book.details_url && (
              <button
                onClick={() => window.open(book.details_url!, '_blank')}
                className="flex-1 bg-gradient-to-r from-gold-500 to-gold-600 text-midnight-900 py-2 px-3 rounded-lg text-sm font-bold hover:from-gold-400 hover:to-gold-500 transition-all duration-300 flex items-center justify-center gap-1"
                title={isArabic ? 'فتح الصفحة' : 'Open Page'}
              >
                <ExternalLink className="w-4 h-4" />
                {isArabic ? 'فتح' : 'Open'}
              </button>
            )}
            
            {book.download_url && (
              <button
                onClick={() => window.open(book.download_url!, '_blank')}
                className="flex-1 border-2 border-gold-500 text-gold-400 py-2 px-3 rounded-lg text-sm hover:bg-gold-500 hover:text-midnight-900 transition-all duration-300 flex items-center justify-center gap-1"
                title={isArabic ? 'تحميل PDF' : 'Download PDF'}
              >
                <Download className="w-4 h-4" />
                {isArabic ? 'تحميل' : 'Download'}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-midnight-800/60 border border-gold-500/30 rounded-lg overflow-hidden animate-pulse">
          <div className="h-48 bg-midnight-700"></div>
          <div className="p-4 space-y-3">
            <div className="h-4 bg-midnight-700 rounded"></div>
            <div className="h-3 bg-midnight-700 rounded w-2/3"></div>
            <div className="flex gap-2">
              <div className="h-8 bg-midnight-700 rounded flex-1"></div>
              <div className="h-8 bg-midnight-700 rounded flex-1"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  // Empty state
  const EmptyState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <AlertCircle className="w-16 h-16 text-gold-500/50 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-gold-200 mb-2">لا توجد كتب</h3>
      <p className="text-gold-400/80 mb-6">لم نتمكن من العثور على أي كتب تطابق بحثك</p>
      <button
        onClick={() => {
          setSearchTerm('')
          setSelectedSite('all')
        }}
        className="bg-gradient-to-r from-gold-500 to-gold-600 text-midnight-900 py-2 px-6 rounded-lg font-bold hover:from-gold-400 hover:to-gold-500 transition-all duration-300"
      >
        إعادة تعيين البحث
      </button>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-sacred-gradient relative overflow-hidden">
      <SacredBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <OrthodoxCross size="lg" glowing className="mx-auto mb-6" />
          
          <h1 className="text-4xl md:text-5xl font-bold text-gold-200 mb-4 font-display">
            📚 المكتبة الرقمية الأرثوذكسية
          </h1>
          
          <p className="text-gold-400/80 text-lg max-w-2xl mx-auto font-arabic leading-relaxed">
            ابحث واستكشف مجموعة شاملة من الكتب الأرثوذكسية من مصادر موثوقة
          </p>
          
          {/* Stats */}
          <div className="flex justify-center gap-6 mt-6 text-sm">
            <div className="flex items-center gap-2 text-gold-400/60">
              <Database className="w-4 h-4" />
              <span>{totalCount} كتاب</span>
            </div>
            <div className="flex items-center gap-2 text-gold-400/60">
              <Clock className="w-4 h-4" />
              <span>{took_ms.toFixed(0)}ms</span>
            </div>
            <div className="flex items-center gap-2 text-gold-400/60">
              <Globe className="w-4 h-4" />
              <span>{cached ? 'مخزن مؤقتاً' : 'مباشر'}</span>
            </div>
          </div>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-midnight-800/60 backdrop-blur-sm border border-gold-500/30 rounded-lg p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            {/* Search Input */}
            <div className="md:col-span-6">
              <label className="block text-gold-200 text-sm font-bold mb-2" htmlFor="search">
                🔍 البحث في الكتب
              </label>
              <div className="relative">
                <input
                  id="search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ابحث عن كتاب، مؤلف، أو موضوع..."
                  className={`w-full bg-midnight-900/80 border border-gold-500/50 rounded-lg px-4 py-3 text-gold-200 placeholder-gold-400/50 focus:border-gold-500 focus:outline-none transition-all duration-300 ${direction === 'rtl' ? 'text-right font-arabic' : 'text-left'}`}
                  dir={direction}
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gold-400/50 w-5 h-5" />
              </div>
            </div>
            
            {/* Site Filter */}
            <div className="md:col-span-3">
              <label className="block text-gold-200 text-sm font-bold mb-2" htmlFor="site">
                📖 المصدر
              </label>
              <select
                id="site"
                value={selectedSite}
                onChange={(e) => setSelectedSite(e.target.value)}
                className="w-full bg-midnight-900/80 border border-gold-500/50 rounded-lg px-4 py-3 text-gold-200 focus:border-gold-500 focus:outline-none transition-all duration-300"
                title="اختر مصدر الكتب"
              >
                <option value="all">جميع المصادر</option>
                <option value="coptic">Coptic Treasures</option>
                <option value="christian">ChristianLib</option>
              </select>
            </div>
            
            {/* View Mode */}
            <div className="md:col-span-2">
              <label className="block text-gold-200 text-sm font-bold mb-2">
                👁️ العرض
              </label>
              <div className="flex rounded-lg border border-gold-500/50 overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 py-3 px-4 transition-all duration-300 ${viewMode === 'grid' ? 'bg-gold-500 text-midnight-900' : 'bg-midnight-900/80 text-gold-400 hover:bg-gold-500/20'}`}
                  title="عرض شبكي"
                >
                  <Grid className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex-1 py-3 px-4 transition-all duration-300 ${viewMode === 'list' ? 'bg-gold-500 text-midnight-900' : 'bg-midnight-900/80 text-gold-400 hover:bg-gold-500/20'}`}
                  title="عرض قائمة"
                >
                  <List className="w-4 h-4 mx-auto" />
                </button>
              </div>
            </div>
            
            {/* Refresh Button */}
            <div className="md:col-span-1">
              <button
                onClick={refreshData}
                disabled={isSearching}
                className="w-full bg-gradient-to-r from-gold-500 to-gold-600 text-midnight-900 py-3 px-4 rounded-lg font-bold hover:from-gold-400 hover:to-gold-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                title="تحديث البيانات"
              >
                <RefreshCw className={`w-4 h-4 mx-auto ${isSearching ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Books Grid */}
        <AnimatePresence mode="wait">
          {loading || isSearching ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoadingSkeleton />
            </motion.div>
          ) : books.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <EmptyState />
            </motion.div>
          ) : (
            <motion.div
              key="books"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className={`${viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
                : 'space-y-4'
              }`}>
                {books.map((book, index) => (
                  <BookCard key={`${book.title}-${index}`} book={book} index={index} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center items-center gap-4 mt-12"
          >
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1 || isSearching}
              className="bg-midnight-800/60 border border-gold-500/30 text-gold-400 py-2 px-4 rounded-lg hover:border-gold-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              title="الصفحة السابقة"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            
            <span className="text-gold-200 font-bold">
              صفحة {currentPage} من {totalPages}
            </span>
            
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages || isSearching}
              className="bg-midnight-800/60 border border-gold-500/30 text-gold-400 py-2 px-4 rounded-lg hover:border-gold-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              title="الصفحة التالية"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
