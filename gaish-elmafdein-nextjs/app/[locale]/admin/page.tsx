import { redirect } from 'next/navigation'

import { getSupabaseServer } from '@/lib/supabaseClient'

import AdminClient from './ui/AdminClient'

interface PageProps { params: Promise<{ locale: string }> }

export default async function AdminPage({ params }: PageProps) {
  const { locale } = await params
  const supabase = await getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/ai-defense`)
  return <AdminClient locale={locale} />
}
