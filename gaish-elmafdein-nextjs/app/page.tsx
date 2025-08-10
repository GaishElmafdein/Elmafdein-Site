/**
 * Root Homepage - Locale Redirect
 * Defaults now to Arabic as the primary site language
 */

import { redirect } from 'next/navigation'

export default function RootPage() {
  // Redirect to default Arabic locale
  redirect('/ar')
}
