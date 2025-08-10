import { getSupabaseServer } from './supabaseClient'

export interface BookRecord {
  id: string
  title: string
  author?: string
  lang?: string
  pages?: number
  source?: string
  download_url?: string
  created_at?: string
}

export async function fetchBooksFromSupabase(query?: string): Promise<BookRecord[]> {
  try {
    const supabase = await getSupabaseServer()
    let qb = supabase.from('books').select('*').limit(60)
    if (query) {
      qb = qb.ilike('title', `%${query}%`)
    }
    const { data, error } = await qb
    if (error) throw error
    return data || []
  } catch (e) {
    console.error('Supabase books fetch failed', e)
    return []
  }
}
