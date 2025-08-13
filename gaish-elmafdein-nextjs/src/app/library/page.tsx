"use client"

import { useEffect,useState } from 'react'
import Image from 'next/image'

import { motion } from 'framer-motion'
import { BookOpen,Download, ExternalLink, RefreshCw, Search } from 'lucide-react'
import { toast } from 'react-hot-toast'

import { OrthodoxCross } from '@/components/ui/orthodox-cross'
import { SacredBackground } from '@/components/ui/sacred-background'

// Types matching backend exactly
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

// Use internal Next.js proxy route to avoid CORS and stale port mismatches.
// Backend base is configured via NEXT_PUBLIC_API_BASE consumed only by /api/proxy/library.
const PROXY_ENDPOINT = '/api/proxy/library'

export default function LibraryPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [totalCount, setTotalCount] = useState(0)
  const [responseTime, setResponseTime] = useState(0)

  // --- Hero Section ---
  const hero = (
    <section className="w-full flex flex-col items-center justify-center py-10 mb-8 bg-gradient-to-b from-gold-100/30 to-midnight-900/10 rounded-xl shadow-lg">
      <OrthodoxCross size="xl" glowing className="mb-6" />
      <h1 className="font-arabic text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gold-600 mb-4 leading-[1.05]">
        كاتدرائية رقمية
      </h1>
      <h2 className="font-arabic text-3xl md:text-4xl lg:text-5xl font-bold text-midnight-700 mb-3 leading-tight">
        لتسليم الإيمان القويم
      </h2>
      <p className="font-arabic text-2xl md:text-3xl text-midnight-700 font-semibold mb-4 text-center leading-snug">
        المُسلَّم مرة واحدة للقديسين
      </p>
      <p className="font-arabic text-lg md:text-2xl text-midnight-600/90 mb-6 text-center max-w-2xl font-medium tracking-wide">
        بث حي · دفاعيات · آبائيات · مقارنة &quot;ديانات&quot;
      </p>
      <blockquote className="text-xs md:text-sm font-arabic text-gold-700/90 italic text-center max-w-xl">
        &quot;كونوا مستعدين في كل حين لمجاوبة كل من يسألكم عن سبب الرجاء الذي فيكم&quot; – ١ بطرس ٣:١٥
      </blockquote>
    </section>
  )

  // Render hero at the top
  // ...existing code...
  const [isCached, setIsCached] = useState(false)

  // ...existing code...

  return (
    <>
      {hero}
      {/* ...existing page content... */}
      {/* The rest of your LibraryPage JSX goes here */}
    </>
  )

  const fetchBooks = async (query?: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (query) params.append('q', query)
      const url = `${PROXY_ENDPOINT}?${params.toString()}`
      console.log('🔍 Fetching via proxy:', url)
      const response = await fetch(url, { cache: 'no-store' })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data: LibraryResponse = await response.json()
      
      setBooks(data.items)
      setTotalCount(data.count)
      setResponseTime(data.took_ms)
      setIsCached(data.cached)

      toast.success(`📚 Found ${data.count} books!`, { duration: 2000 })
      
    } catch (error) {
      console.error('❌ API Error:', error)
  toast.error(`❌ Failed to load books: ${error instanceof Error ? error.message : 'Unknown error'} (proxy)`)
      
      // Show fallback message
      setBooks([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBooks()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchBooks(searchQuery)
  }

  const isArabic = (text: string) => /[\u0600-\u06FF]/.test(text)

  return (
    <div className="min-h-screen bg-sacred-gradient relative overflow-hidden">
      <SacredBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <OrthodoxCross size="lg" glowing={true} className="mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-gold-400 mb-2">
            📚 Orthodox Library
          </h1>
          <p className="text-gold-200">Real-time Orthodox Books Search</p>
          <p className="text-sm text-gold-300/70 mt-1" dir="rtl">مكتبة الكتب الأرثوذكسية</p>
        </motion.div>

        {/* Search */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search Orthodox books... / البحث في الكتب الأرثوذكسية..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-midnight-800/60 border border-gold-500/30 rounded-lg text-gold-100 placeholder-gold-400/50 focus:border-gold-500 focus:outline-none transition-all"
                dir={isArabic(searchQuery) ? 'rtl' : 'ltr'}
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1 bg-gold-500/20 hover:bg-gold-500/30 border border-gold-500/30 rounded text-gold-200 transition-all disabled:opacity-50"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Search'}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Stats */}
        {(totalCount > 0 || responseTime > 0) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mb-6 text-sm text-gold-300/70"
          >
            {totalCount > 0 && <span>📚 {totalCount} books</span>}
            {responseTime > 0 && <span className="ml-4">⚡ {responseTime}ms</span>}
            {isCached && <span className="ml-4">💾 Cached</span>}
          </motion.div>
        )}

        {/* Loading */}
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <RefreshCw className="h-8 w-8 text-gold-400 animate-spin mx-auto mb-4" />
            <p className="text-gold-200">Searching Orthodox books...</p>
          </motion.div>
        )}

        {/* Books Grid */}
        {!loading && books.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {books.map((book, index) => (
              <BookCard key={`${book.source}-${index}`} book={book} />
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && books.length === 0 && totalCount === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <BookOpen className="h-16 w-16 text-gold-400/50 mx-auto mb-4" />
            <p className="text-gold-200 mb-2">No books found</p>
            <p className="text-gold-300/70 text-sm">Try different search terms or check the API connection</p>
            <button
              onClick={() => fetchBooks()}
              className="mt-4 px-4 py-2 bg-gold-500/20 hover:bg-gold-500/30 border border-gold-500/30 rounded-lg text-gold-200 transition-all"
            >
              🔄 Retry
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

// Book Card Component
function BookCard({ book }: { book: Book }) {
  const isArabic = book.lang === 'ar'
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-midnight-800/60 border border-gold-500/30 rounded-lg p-4 backdrop-blur-sm hover:border-gold-500 transition-all duration-300"
    >
      {/* Cover */}
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

      {/* Info */}
      <div className={`space-y-2 ${isArabic ? 'text-right' : 'text-left'}`} dir={isArabic ? 'rtl' : 'ltr'}>
        <h3 className="font-bold text-gold-200 text-sm leading-tight line-clamp-2">
          {book.title}
        </h3>
        
        {book.author && (
          <p className="text-gold-300/70 text-xs line-clamp-1">
            {book.author}
          </p>
        )}

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-gold-400/60">
          <span className={`px-2 py-1 rounded-full ${
            book.source === 'coptic-treasures.com' 
              ? 'bg-blue-500/20 text-blue-300' 
              : 'bg-green-500/20 text-green-300'
          }`}>
            {book.source === 'coptic-treasures.com' ? 'Coptic' : 'ChristianLib'}
          </span>
          
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
          Open
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
            PDF
          </a>
        ) : (
          <span role="status" aria-live="polite" className="px-3 py-2 bg-midnight-700/50 border border-midnight-600 rounded-md text-gold-300/50 text-xs">غير متاح</span>
        )}
      </div>
    </motion.div>
  )
}
