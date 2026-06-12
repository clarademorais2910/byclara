import { createAdminClient } from '@/lib/supabase/admin'
import AdminShell from '@/components/admin/AdminShell'
import ConfiguracoesClient from './client'

export const revalidate = 0

export default async function ConfiguracoesPage() {
  const supabase = createAdminClient()
  const { data: settings } = await supabase.from('settings').select('*').order('key')

  const map: Record<string, string> = {}
  for (const s of settings ?? []) map[s.key] = s.value

  return (
    <AdminShell>
      <ConfiguracoesClient settings={map} />
    </AdminShell>
  )
}
