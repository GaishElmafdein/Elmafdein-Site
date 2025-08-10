#!/usr/bin/env python3
"""
Next.js Library Integration Script
Updates the /library page to integrate with Orthodox Book API
"""

import os
import re
from pathlib import Path

def create_api_service():
    """Create API service for Next.js frontend"""
    api_service_content = '''// Orthodox Book API Service
// Sacred integration for external book sources

export interface OrthodoxBook {
  title: string;
  author: string;
  source: string;
  details_url: string;
  download_url: string;
  cover_image: string;
}

export interface SearchResponse {
  books: OrthodoxBook[];
  total_count: number;
  search_query: string;
  cached: boolean;
  timestamp: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class OrthodoxBookService {
  static async searchBooks(keyword: string = '', site?: string): Promise<SearchResponse> {
    try {
      const params = new URLSearchParams();
      if (keyword) params.append('q', keyword);
      if (site) params.append('site', site);
      
      const response = await fetch(`${API_BASE_URL}/api/library?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('🔴 Error searching Orthodox books:', error);
      throw error;
    }
  }
  
  static async getAllBooks(): Promise<SearchResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/library/all`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('🔴 Error getting all books:', error);
      throw error;
    }
  }
  
  static async refreshCache(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/api/library/refresh`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('🔴 Error refreshing cache:', error);
      throw error;
    }
  }
  
  static async getStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/library/stats`);
      return await response.json();
    } catch (error) {
      console.error('🔴 Error getting stats:', error);
      throw error;
    }
  }
}'''
    
    return api_service_content

def create_updated_library_page():
    """Create updated library page with API integration"""
    library_page_content = '''/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Grid, 
  List, 
  RefreshCw,
  ExternalLink,
  Globe,
  Clock,
  Database
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { SacredBackground } from '@/components/ui/sacred-background'
import { OrthodoxCross } from '@/components/ui/orthodox-cross'
import { OrthodoxBookService, type OrthodoxBook, type SearchResponse } from '@/lib/orthodox-book-service'

// Static fallback books (original library content)
const staticBooks = [
  {
    id: 1,
    title: "الكتاب المقدس - الترجمة العربية المشتركة",
    author: "الكنيسة الأرثوذكسية",
    category: "liturgy",
    language: "arabic",
    downloadUrl: "/books/arabic-bible.pdf",
    fileSize: "25.2 MB",
    pages: 1200,
    coverImage: "/images/arabic-bible.jpg"
  },
  {
    id: 2,
    title: "The Didache - Teaching of the Twelve Apostles",
    author: "Apostolic Fathers",
    category: "patrology",
    language: "english",
    downloadUrl: "/books/didache.pdf",
    fileSize: "2.1 MB",
    pages: 45,
    coverImage: "/images/didache.jpg"
  },
  {
    id: 3,
    title: "القداس الإلهي للقديس يوحنا ذهبي الفم",
    author: "القديس يوحنا ذهبي الفم",
    category: "liturgy",
    language: "arabic",
    downloadUrl: "/books/divine-liturgy-ar.pdf",
    fileSize: "8.5 MB",
    pages: 120,
    coverImage: "/images/divine-liturgy.jpg"
  },
  {
    id: 4,
    title: "Against Heresies",
    author: "St. Irenaeus of Lyon",
    category: "apologetics",
    language: "english",
    downloadUrl: "/books/against-heresies.pdf",
    fileSize: "15.7 MB",
    pages: 580,
    coverImage: "/images/irenaeus.jpg"
  },
  {
    id: 5,
    title: "كتاب الإيمان الأرثوذكسي",
    author: "الأنبا شنودة الثالث",
    category: "theology",
    language: "arabic",
    downloadUrl: "/books/orthodox-faith-ar.pdf",
    fileSize: "12.3 MB",
    pages: 350,
    coverImage: "/images/orthodox-faith.jpg"
  },
  {
    id: 6,
    title: "The Life of St. Anthony",
    author: "St. Athanasius the Great",
    category: "patrology",
    language: "english",
    downloadUrl: "/books/life-st-anthony.pdf",
    fileSize: "4.8 MB",
    pages: 95,
    coverImage: "/images/st-anthony.jpg"
  }
];

const categories = [
  { value: 'all', label: 'جميع الفئات', englishLabel: 'All Categories' },
  { value: 'liturgy', label: 'الليتورجيا', englishLabel: 'Liturgy' },
  { value: 'theology', label: 'اللاهوت', englishLabel: 'Theology' },
  { value: 'patrology', label: 'الآبائيات', englishLabel: 'Patrology' },
  { value: 'apologetics', label: 'الدفاعيات', englishLabel: 'Apologetics' }
];

const languages = [
  { value: 'all', label: 'جميع اللغات', englishLabel: 'All Languages' },
  { value: 'arabic', label: 'العربية', englishLabel: 'Arabic' },
  { value: 'english', label: 'الإنجليزية', englishLabel: 'English' }
];

const sources = [
  { value: 'all', label: 'جميع المصادر', englishLabel: 'All Sources' },
  { value: 'static', label: 'المكتبة المحلية', englishLabel: 'Local Library' },
  { value: 'coptic-treasures.com', label: 'كنوز قبطية', englishLabel: 'Coptic Treasures' },
  { value: 'christianlib.com', label: 'المكتبة المسيحية', englishLabel: 'Christian Library' }
];

export default function LibraryPage() {
  // State management
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedLanguage, setSelectedLanguage] = useState('all')
  const [selectedSource, setSelectedSource] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Book data state
  const [staticBooksData] = useState(staticBooks)
  const [externalBooks, setExternalBooks] = useState<OrthodoxBook[]>([])
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null)
  
  const booksPerPage = 12

  // Load external books on component mount
  useEffect(() => {
    loadExternalBooks()
  }, [])

  const loadExternalBooks = async () => {
    try {
      setIsLoading(true)
      const response = await OrthodoxBookService.getAllBooks()
      setExternalBooks(response.books)
      setSearchResponse(response)
      
      if (response.books.length > 0) {
        toast.success(`📚 تم تحميل ${response.books.length} كتاب من المصادر الخارجية`, {
          icon: '✝️',
          duration: 3000
        })
      }
    } catch (error) {
      console.error('Error loading external books:', error)
      toast.error('خطأ في تحميل الكتب من المصادر الخارجية', {
        icon: '⚠️',
        duration: 4000
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async () => {
    try {
      setIsLoading(true)
      setCurrentPage(1)
      
      if (searchTerm.trim()) {
        // Search external sources
        const siteParam = selectedSource !== 'all' && selectedSource !== 'static' 
          ? selectedSource 
          : undefined
          
        const response = await OrthodoxBookService.searchBooks(searchTerm, siteParam)
        setExternalBooks(response.books)
        setSearchResponse(response)
        
        toast.success(`🔍 تم العثور على ${response.books.length} نتيجة`, {
          icon: '📖',
          duration: 2000
        })
      } else {
        // Load all books if no search term
        await loadExternalBooks()
      }
    } catch (error) {
      console.error('Search error:', error)
      toast.error('خطأ في البحث', { icon: '❌' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true)
      await OrthodoxBookService.refreshCache()
      await loadExternalBooks()
      
      toast.success('تم تحديث المكتبة بنجاح! 🔄', {
        icon: '✅',
        duration: 3000
      })
    } catch (error) {
      console.error('Refresh error:', error)
      toast.error('خطأ في تحديث المكتبة')
    } finally {
      setIsRefreshing(false)
    }
  }

  // Combine and filter books
  const getAllBooks = useCallback(() => {
    let allBooks: any[] = []
    
    // Add static books if source allows
    if (selectedSource === 'all' || selectedSource === 'static') {
      const mappedStaticBooks = staticBooksData.map(book => ({
        ...book,
        source: 'static',
        details_url: `#book-${book.id}`,
        download_url: book.downloadUrl,
        cover_image: book.coverImage
      }))
      allBooks = [...allBooks, ...mappedStaticBooks]
    }
    
    // Add external books if source allows
    if (selectedSource === 'all' || (selectedSource !== 'static' && externalBooks.length > 0)) {
      if (selectedSource === 'all') {
        allBooks = [...allBooks, ...externalBooks]
      } else if (selectedSource !== 'static') {
        const filteredExternal = externalBooks.filter(book => book.source === selectedSource)
        allBooks = [...allBooks, ...filteredExternal]
      }
    }
    
    return allBooks
  }, [staticBooksData, externalBooks, selectedSource])

  const filteredBooks = getAllBooks().filter(book => {
    const matchesSearch = !searchTerm || 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory
    const matchesLanguage = selectedLanguage === 'all' || book.language === selectedLanguage
    
    return matchesSearch && matchesCategory && matchesLanguage
  })

  const totalPages = Math.ceil(filteredBooks.length / booksPerPage)
  const startIndex = (currentPage - 1) * booksPerPage
  const currentBooks = filteredBooks.slice(startIndex, startIndex + booksPerPage)

  const BookCard = ({ book, index }: { book: any; index: number }) => {
    const isExternal = book.source !== 'static'
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className={`group bg-midnight-800/60 border border-gold-500/30 rounded-lg overflow-hidden backdrop-blur-sm hover:border-gold-500 transition-all duration-300 ${
          viewMode === 'list' ? 'flex items-center' : ''
        }`}
        whileHover={{ 
          scale: viewMode === 'grid' ? 1.02 : 1.01,
          boxShadow: "0 20px 40px rgba(241, 196, 15, 0.2)"
        }}
      >
        {/* Book Cover */}
        <div className={`${viewMode === 'list' ? 'w-24 h-32 flex-shrink-0' : 'aspect-[3/4]'} bg-gradient-to-br from-gold-900/20 to-midnight-900/40 relative overflow-hidden`}>
          {book.cover_image || book.coverImage ? (
            <img 
              src={book.cover_image || book.coverImage} 
              alt={book.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <OrthodoxCross size="md" glowing />
            </div>
          )}
          
          {/* Source badge */}
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
              isExternal 
                ? 'bg-blue-500/80 text-white' 
                : 'bg-gold-500/80 text-midnight-900'
            }`}>
              {isExternal ? (
                <Globe className="inline w-3 h-3 mr-1" />
              ) : (
                <Database className="inline w-3 h-3 mr-1" />
              )}
              {isExternal ? book.source : 'محلي'}
            </span>
          </div>
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-2">
              {book.download_url && (
                <motion.a
                  href={book.download_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gold-500 text-midnight-900 rounded-full hover:bg-gold-400 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Download className="w-4 h-4" />
                </motion.a>
              )}
              {book.details_url && isExternal && (
                <motion.a
                  href={book.details_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-400 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ExternalLink className="w-4 h-4" />
                </motion.a>
              )}
            </div>
          </div>
        </div>

        {/* Book Info */}
        <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
          <h3 className="font-arabic text-lg font-bold text-gold-200 mb-2 group-hover:text-gold-100 transition-colors line-clamp-2">
            {book.title}
          </h3>
          
          <p className="text-gold-300/80 mb-3 font-medium">
            {book.author}
          </p>
          
          <div className="flex items-center justify-between text-sm text-gold-400/60">
            <span>{book.pages ? `${book.pages} صفحة` : 'كتاب رقمي'}</span>
            {book.fileSize && <span>{book.fileSize}</span>}
          </div>
          
          {isExternal && (
            <div className="mt-2 text-xs text-blue-300/60">
              مصدر خارجي: {book.source}
            </div>
          )}
        </div>
      </motion.div>
    )
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
          <div className="flex items-center justify-center gap-4 mb-6">
            <OrthodoxCross size="lg" glowing />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gold-300 via-gold-100 to-gold-300 bg-clip-text text-transparent">
              المكتبة الرقمية المقدسة
            </h1>
            <OrthodoxCross size="lg" glowing />
          </div>
          
          <p className="text-gold-200/80 text-lg max-w-2xl mx-auto">
            مكتبة شاملة للكتب الأرثوذكسية والآبائية - نصوص مقدسة من مصادر محلية وخارجية
          </p>
          
          {/* Stats */}
          {searchResponse && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 flex items-center justify-center gap-6 text-sm text-gold-300/70"
            >
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                <span>{staticBooksData.length} كتاب محلي</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span>{externalBooks.length} كتاب خارجي</span>
              </div>
              {searchResponse.cached && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>محفوظ مؤقتاً</span>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-midnight-800/40 border border-gold-500/20 rounded-lg p-6 mb-8 backdrop-blur-sm"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            {/* Search Input */}
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold-400 w-5 h-5" />
              <input
                type="text"
                placeholder="ابحث في الكتب المقدسة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-3 bg-midnight-700/50 border border-gold-500/30 rounded-lg text-gold-100 placeholder-gold-400/50 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all"
                dir="rtl"
              />
            </div>

            {/* Source Filter */}
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="px-4 py-3 bg-midnight-700/50 border border-gold-500/30 rounded-lg text-gold-100 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all"
            >
              {sources.map(source => (
                <option key={source.value} value={source.value} className="bg-midnight-800">
                  {source.label}
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-midnight-700/50 border border-gold-500/30 rounded-lg text-gold-100 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value} className="bg-midnight-800">
                  {category.label}
                </option>
              ))}
            </select>

            {/* Language Filter */}
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-4 py-3 bg-midnight-700/50 border border-gold-500/30 rounded-lg text-gold-100 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all"
            >
              {languages.map(language => (
                <option key={language.value} value={language.value} className="bg-midnight-800">
                  {language.label}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <motion.button
                onClick={handleSearch}
                disabled={isLoading}
                className="px-6 py-2 bg-gradient-to-r from-gold-500 to-gold-600 text-midnight-900 font-bold rounded-lg hover:from-gold-400 hover:to-gold-500 disabled:opacity-50 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isLoading ? 'جاري البحث...' : 'بحث'}
              </motion.button>
              
              <motion.button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-4 py-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 rounded-lg hover:bg-blue-500/30 disabled:opacity-50 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </motion.button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${
                  viewMode === 'grid' 
                    ? 'bg-gold-500 text-midnight-900' 
                    : 'bg-midnight-700/50 text-gold-400 hover:bg-midnight-600/50'
                } transition-all`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${
                  viewMode === 'list' 
                    ? 'bg-gold-500 text-midnight-900' 
                    : 'bg-midnight-700/50 text-gold-400 hover:bg-midnight-600/50'
                } transition-all`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Results Summary */}
        {filteredBooks.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 text-center"
          >
            <p className="text-gold-300/80">
              تم العثور على <span className="text-gold-200 font-bold">{filteredBooks.length}</span> كتاب
              {searchTerm && ` لـ "${searchTerm}"`}
            </p>
          </motion.div>
        )}

        {/* Books Grid */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-20"
            >
              <div className="text-center">
                <OrthodoxCross size="xl" glowing />
                <p className="text-gold-200 mt-4 text-lg">جاري تحميل الكتب المقدسة...</p>
              </div>
            </motion.div>
          ) : currentBooks.length > 0 ? (
            <motion.div
              key="books"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={
                viewMode === 'grid'
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }
            >
              {currentBooks.map((book, index) => (
                <BookCard key={`${book.source}-${book.title}-${index}`} book={book} index={index} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="no-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <OrthodoxCross size="lg" />
              <h3 className="text-xl text-gold-200 mt-6 mb-2">لا توجد نتائج</h3>
              <p className="text-gold-300/60">جرب تغيير معايير البحث أو المرشحات</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center mt-12"
          >
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    currentPage === page
                      ? 'bg-gold-500 text-midnight-900'
                      : 'bg-midnight-700/50 text-gold-300 hover:bg-midnight-600/50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}'''
    
    return library_page_content

def create_env_file():
    """Create environment file for API configuration"""
    env_content = '''# Orthodox Book API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Optional: Production API URL
# NEXT_PUBLIC_API_URL=https://your-api-domain.com

# API Server Configuration (for Python backend)
API_HOST=0.0.0.0
API_PORT=8000
API_RELOAD=true

# Cache Configuration
CACHE_DURATION=3600
CACHE_FILE=orthodox_books_cache.json

# Scraper Configuration
SCRAPER_HEADLESS=true
SCRAPER_DELAY_MIN=0.5
SCRAPER_DELAY_MAX=1.5'''
    
    return env_content

def update_nextjs_project():
    """Update the Next.js project with API integration"""
    nextjs_path = Path("c:/Users/minav/Gaish-Elmafdein/gaish-elmafdein-nextjs")
    
    if not nextjs_path.exists():
        print("❌ Next.js project not found!")
        return False
    
    try:
        # Create lib directory for services
        lib_dir = nextjs_path / "src" / "lib"
        lib_dir.mkdir(exist_ok=True)
        
        # Create API service file
        api_service_path = lib_dir / "orthodox-book-service.ts"
        with open(api_service_path, 'w', encoding='utf-8') as f:
            f.write(create_api_service())
        print(f"✅ Created API service: {api_service_path}")
        
        # Update library page
        library_page_path = nextjs_path / "src" / "app" / "library" / "page.tsx"
        with open(library_page_path, 'w', encoding='utf-8') as f:
            f.write(create_updated_library_page())
        print(f"✅ Updated library page: {library_page_path}")
        
        # Create environment file
        env_path = nextjs_path / ".env.local"
        with open(env_path, 'w', encoding='utf-8') as f:
            f.write(create_env_file())
        print(f"✅ Created environment file: {env_path}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error updating Next.js project: {e}")
        return False

if __name__ == "__main__":
    print("🕊️ Orthodox Book API Integration")
    print("=" * 50)
    
    # Update Next.js project
    success = update_nextjs_project()
    
    if success:
        print("\n✝️ Integration Complete!")
        print("\n📋 Next Steps:")
        print("1. Install Python dependencies: pip install -r requirements.txt")
        print("2. Install Playwright browsers: playwright install")
        print("3. Start the API server: python api_server.py")
        print("4. Start Next.js dev server: npm run dev")
        print("5. Visit http://localhost:3000/library")
        print("\n🔗 API Documentation: http://localhost:8000/docs")
    else:
        print("\n❌ Integration failed!")
