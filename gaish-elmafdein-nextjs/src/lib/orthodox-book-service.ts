// Orthodox Book API Service
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
}