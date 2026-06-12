import { createAdminClient } from '@/lib/supabase/admin'
import AdminShell from '@/components/admin/AdminShell'
import AdminBannersClient from './client'

export const revalidate = 0

export default async function AdminBannersPage() {
  const supabase = createAdminClient()
  const { data: banners } = await supabase
    .from('banners')
    .select('*')
    .order('position')

  return (
    <AdminShell>
      <AdminBannersClient banners={banners ?? []} />
    </AdminShell>
  )
}
