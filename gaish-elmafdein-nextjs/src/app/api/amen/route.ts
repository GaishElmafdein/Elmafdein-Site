import { NextResponse } from 'next/server';

import { getSupabaseServer } from '@/lib/supabaseClient';

let memoryCount = 172000; // Non-persistent fallback counter

async function getSupabaseCount() {
  try {
    const supabase = await getSupabaseServer();
    const { data, error } = await supabase
      .from('amen_counter')
      .select('id,count')
      .eq('id', 1)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    if (!data) {
      const { error: insertErr } = await supabase
        .from('amen_counter')
        .insert({ id: 1, count: memoryCount })
        .single();
      if (insertErr) throw insertErr;
      return memoryCount;
    }
    memoryCount = data.count;
    return data.count;
  } catch {
    return memoryCount;
  }
}

async function incrementSupabaseCount() {
  try {
    const supabase = await getSupabaseServer();
    const current = await getSupabaseCount();
    const newVal = current + 1;
    const { error } = await supabase
      .from('amen_counter')
      .upsert({ id: 1, count: newVal }, { onConflict: 'id' });
    if (error) throw error;
    memoryCount = newVal;
    return newVal;
  } catch {
    memoryCount += 1;
    return memoryCount;
  }
}

export const dynamic = 'force-dynamic';

export async function GET() {
  const count = await getSupabaseCount();
  return NextResponse.json({ count }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST() {
  const count = await incrementSupabaseCount();
  return NextResponse.json({ count }, { headers: { 'Cache-Control': 'no-store' } });
}
