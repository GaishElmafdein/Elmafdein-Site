import { getSupabaseServer } from './supabaseClient'

export async function addXP(userId: string, amount = 5) {
  try {
    const supabase = await getSupabaseServer()
    await supabase.rpc('add_xp', { p_user: userId, p_amount: amount })
  } catch (e) {
    console.error('XP add failed', e)
  }
}

export async function getUserXP(userId: string): Promise<number> {
  try {
    const supabase = await getSupabaseServer()
    const { data, error } = await supabase.from('user_xp').select('xp').eq('user_id', userId).single()
    if (error) return 0
    return data?.xp || 0
  } catch { return 0 }
}
