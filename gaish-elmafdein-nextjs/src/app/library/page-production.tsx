"use client"

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Filter, 
  Download, 
  ExternalLink, 
  Grid, 
  List, 
  RefreshCw,
  Database,
  Globe,
  BookOpen,
  Timer,
  
} from 'lucide-react'
import Image from 'next/image'
import { toast } from 'react-hot-toast'
import { SacredBackground } from '@/components/ui/sacred-background'
import { OrthodoxCross } from '@/components/ui/orthodox-cross'

// Types matching the backend data contract
interface Book {
  title: string
  author: string | null
  source: "coptic-treasures.com" | "christianlib.com"
  details_url: string
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

interface SearchFilters {
  q: string
  site: "coptic" | "christian" | "all"
  page: number
  per_page: number
}

// Source site configuration
const SITE_OPTIONS = [
  { value: "all", label: "All Sources", icon: Globe },
  { value: "coptic", label: "Coptic Treasures", icon: BookOpen },
  { value: "christian", label: "ChristianLib", icon: Database }
] as const

const API_BASE_URL = process.env.NEXT_PUBLIC_LIBRARY_API || "http://localhost:8000"

export default function LibraryPage() {
  // State
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [totalCount, setTotalCount] = useState(0)
  const [responseTime, setResponseTime] = useState(0)
  const [isCached, setIsCached] = useState(false)
  
  const [filters, setFilters] = useState<SearchFilters>({
    q: '',
    site: 'all',
    page: 1,
    per_page: 24
  })

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
      setFilters(prev => ({ ...prev, q: searchQuery, page: 1 }))
    }, 400)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch books from API
  const fetchBooks = useCallback(async (searchFilters: SearchFilters, force = false) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        ...(searchFilters.q && { q: searchFilters.q }),
        site: searchFilters.site,
        page: searchFilters.page.toString(),
        per_page: searchFilters.per_page.toString(),
        ...(force && { force: 'true' })
      })

      const response = await fetch(`${API_BASE_URL}/api/library?${params}`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data: LibraryResponse = await response.json()
      
      setBooks(data.items)
      setTotalCount(data.count)
      setResponseTime(data.took_ms)
      setIsCached(data.cached)

      toast.success(`📚 Found ${data.count} books ${data.cached ? '(cached)' : ''}`, {
        duration: 2000
      })
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch books'
      setError(errorMessage)
      toast.error(`❌ ${errorMessage}`)
      console.error('Library API error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    fetchBooks(filters)
  }, [filters, fetchBooks])

  // Handle search input
  const handleSearch = (value: string) => {
    setSearchQuery(value)
  }

  // Handle site filter change
  const handleSiteChange = (site: SearchFilters['site']) => {
    setFilters(prev => ({ ...prev, site, page: 1 }))
  }

  // Handle refresh (force reload)
  const handleRefresh = () => {
    fetchBooks(filters, true)
  }

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }))
  }

  // Calculate pagination info
  const totalPages = Math.ceil(totalCount / filters.per_page)
  const startIndex = (filters.page - 1) * filters.per_page + 1
  const endIndex = Math.min(filters.page * filters.per_page, totalCount)

  // Detect RTL text
  const isArabicText = (text: string) => {
    return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(text)
  }

  return (
    <div className="min-h-screen bg-sacred-gradient relative overflow-hidden">
      <SacredBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <OrthodoxCross size="lg" glowing={true} />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gold-400 mb-4 font-display">
            📚 Orthodox Library
          </h1>
          <p className="text-xl text-gold-200 mb-2">
            Real-time Orthodox Christian Books Search
          </p>
          <p className="text-sm text-gold-300/70" dir="rtl">
            مكتبة الكتب الأرثوذكسية المسيحية
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="bg-midnight-800/60 border border-gold-500/30 rounded-lg p-6 backdrop-blur-sm">
            {/* Search Input */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search books... / البحث عن الكتب..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-midnight-900/50 border border-gold-500/20 rounded-lg text-gold-100 placeholder-gold-400/50 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20 transition-all"
                dir={isArabicText(searchQuery) ? 'rtl' : 'ltr'}
              />
            </div>

            {/* Filters and Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Source Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gold-400" />
                <span className="text-gold-200 text-sm">Source:</span>
                <div className="flex gap-1">
                  {SITE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSiteChange(option.value)}
                      className={`px-3 py-1 rounded-md text-xs transition-all ${
                        filters.site === option.value
                          ? 'bg-gold-500 text-midnight-900 font-medium'
                          : 'bg-midnight-700/50 text-gold-300 hover:bg-gold-500/20'
                      }`}
                    >
                      <option.icon className="inline h-3 w-3 mr-1" />
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* View Mode and Stats */}
              <div className="flex items-center gap-4">
                {/* Response Stats */}
                {(responseTime > 0 || isCached) && (
                  <div className="flex items-center gap-3 text-xs text-gold-300/70">
                    {responseTime > 0 && (
                      <div className="flex items-center gap-1">
                        <Timer className="h-3 w-3" />
                        {responseTime}ms
                      </div>
                    )}
                    {isCached && (
                      <div className="flex items-center gap-1">
                        <Database className="h-3 w-3" />
                        Cached
                      </div>
                    )}
                  </div>
                )}

                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 bg-midnight-700/50 rounded-md p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    aria-label="عرض شبكي"
                    className={`p-1 rounded ${viewMode === 'grid' ? 'bg-gold-500 text-midnight-900' : 'text-gold-400 hover:text-gold-300'}`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    aria-label="عرض قائم"
                    className={`p-1 rounded ${viewMode === 'list' ? 'bg-gold-500 text-midnight-900' : 'text-gold-400 hover:text-gold-300'}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>

                {/* Refresh Button */}
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  aria-label="تحديث النتائج"
                  className="p-2 bg-gold-500/20 hover:bg-gold-500/30 border border-gold-500/30 rounded-md transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 text-gold-400 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Results Summary */}
        {totalCount > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 text-gold-200 text-sm"
          >
            Showing {startIndex}-{endIndex} of {totalCount} books
            {debouncedQuery && ` for "${debouncedQuery}"`}
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-12"
          >
            <div className="flex flex-col items-center gap-4">
              <RefreshCw className="h-8 w-8 text-gold-400 animate-spin" />
              <p className="text-gold-200">Searching Orthodox books...</p>
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {error && !loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-400 mb-4">❌ {error}</p>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-gold-500/20 hover:bg-gold-500/30 border border-gold-500/30 rounded-md text-gold-200 transition-all"
              >
                Try Again
              </button>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && !error && books.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="bg-midnight-800/30 border border-gold-500/20 rounded-lg p-8 max-w-md mx-auto">
              <BookOpen className="h-12 w-12 text-gold-400 mx-auto mb-4" />
              <p className="text-gold-200 mb-2">No books found</p>
              <p className="text-gold-300/70 text-sm">
                {debouncedQuery ? 'Try different keywords or clear the search' : 'Try searching for Orthodox books'}
              </p>
            </div>
          </motion.div>
        )}

        {/* Books Grid/List */}
        {!loading && !error && books.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <AnimatePresence mode="wait">
              {viewMode === 'grid' ? (
                <motion.div 
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                  {books.map((book, index) => (
                    <BookCard key={`${book.source}-${index}`} book={book} />
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {books.map((book, index) => (
                    <BookListItem key={`${book.source}-${index}`} book={book} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-12 flex justify-center"
          >
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={filters.page <= 1}
                className="px-3 py-2 bg-midnight-800/60 border border-gold-500/30 rounded-md text-gold-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gold-500/20 transition-all"
              >
                Previous
              </button>
              
              <span className="px-4 py-2 text-gold-200">
                Page {filters.page} of {totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={filters.page >= totalPages}
                className="px-3 py-2 bg-midnight-800/60 border border-gold-500/30 rounded-md text-gold-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gold-500/20 transition-all"
              >
                Next
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

// Book Card Component (Grid View)
function BookCard({ book }: { book: Book }) {
  const isArabic = book.lang === 'ar'
  
  return (
    <motion.div
      whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(241, 196, 15, 0.2)" }}
      className="bg-midnight-800/60 border border-gold-500/30 rounded-lg p-4 backdrop-blur-sm hover:border-gold-500 transition-all duration-300"
    >
      {/* Book Cover */}
      <div className="aspect-[3/4] bg-gradient-to-br from-gold-600/20 to-midnight-700/50 rounded-md mb-4 flex items-center justify-center">
        {book.cover_image ? (
          <div className="relative w-full h-full">
            <Image
              src={book.cover_image}
              alt={book.title || 'Book cover'}
              fill
              sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
              className="object-cover rounded-md"
              priority={false}
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.display = 'none' }}
            />
          </div>
        ) : (
          <BookOpen className="h-12 w-12 text-gold-400/50" />
        )}
      </div>

      {/* Book Info */}
      <div className={`space-y-2 ${isArabic ? 'text-right' : 'text-left'}`} dir={isArabic ? 'rtl' : 'ltr'}>
        <h3 className="font-bold text-gold-200 line-clamp-2 text-sm leading-tight">
          {book.title}
        </h3>
        
        {book.author && (
          <p className="text-gold-300/70 text-xs line-clamp-1">
            {book.author}
          </p>
        )}

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-gold-400/60">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs ${
              book.source === 'coptic-treasures.com' 
                ? 'bg-blue-500/20 text-blue-300' 
                : 'bg-green-500/20 text-green-300'
            }`}>
              {book.source === 'coptic-treasures.com' ? 'Coptic' : 'ChristianLib'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {book.pages && <span>{book.pages}p</span>}
            {book.size_mb && <span>{book.size_mb}MB</span>}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        <a
          href={book.details_url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`فتح صفحة المصدر لكتاب ${book.title}`}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gold-500/20 hover:bg-gold-500/30 border border-gold-500/30 rounded-md text-gold-200 text-xs transition-all"
        >
          <ExternalLink className="h-3 w-3" />
          Open Page
        </a>
        
        {book.download_url ? (
          <a
            href={book.download_url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`قراءة أو تحميل كتاب ${book.title}`}
            className="flex items-center justify-center gap-1 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-md text-green-200 text-xs transition-all"
          >
            <Download className="h-3 w-3" />
            Download
          </a>
        ) : (
          <span role="status" aria-live="polite" className="px-3 py-2 bg-midnight-700/50 border border-midnight-600 rounded-md text-gold-300/50 text-xs">غير متاح</span>
        )}
      </div>
    </motion.div>
  )
}

// Book List Item Component (List View)
function BookListItem({ book }: { book: Book }) {
  const isArabic = book.lang === 'ar'
  
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="bg-midnight-800/60 border border-gold-500/30 rounded-lg p-4 backdrop-blur-sm hover:border-gold-500 transition-all duration-300"
    >
      <div className="flex items-center gap-4">
        {/* Book Cover */}
        <div className="w-16 h-20 bg-gradient-to-br from-gold-600/20 to-midnight-700/50 rounded-md flex items-center justify-center flex-shrink-0">
          {book.cover_image ? (
            <div className="relative w-full h-full">
              <Image
                src={book.cover_image}
                alt={book.title || 'Book cover'}
                fill
                sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
                className="object-cover rounded-md"
              />
            </div>
          ) : (
            <BookOpen className="h-6 w-6 text-gold-400/50" />
          )}
        </div>

        {/* Book Info */}
        <div className={`flex-1 space-y-1 ${isArabic ? 'text-right' : 'text-left'}`} dir={isArabic ? 'rtl' : 'ltr'}>
          <h3 className="font-bold text-gold-200 text-sm">
            {book.title}
          </h3>
          
          {book.author && (
            <p className="text-gold-300/70 text-xs">
              {book.author}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-gold-400/60">
            <span className={`px-2 py-1 rounded-full ${
              book.source === 'coptic-treasures.com' 
                ? 'bg-blue-500/20 text-blue-300' 
                : 'bg-green-500/20 text-green-300'
            }`}>
              {book.source === 'coptic-treasures.com' ? 'Coptic Treasures' : 'ChristianLib'}
            </span>
            
            {book.pages && <span>{book.pages} pages</span>}
            {book.size_mb && <span>{book.size_mb} MB</span>}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-shrink-0">
          <a
            href={book.details_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-2 bg-gold-500/20 hover:bg-gold-500/30 border border-gold-500/30 rounded-md text-gold-200 text-xs transition-all"
          >
            <ExternalLink className="h-3 w-3" />
            Open Page
          </a>
          
          {book.download_url && (
            <a
              href={book.download_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-md text-green-200 text-xs transition-all"
            >
              <Download className="h-3 w-3" />
              Download
            </a>
          )}
        </div>
      </div>
    </motion.div>
  )
}
