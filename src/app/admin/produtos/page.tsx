import { createAdminClient } from '@/lib/supabase/admin'
import AdminShell from '@/components/admin/AdminShell'
import AdminProdutosClient from './client'

export const revalidate = 0

export default async function AdminProdutosPage() {
  const supabase = createAdminClient()
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('position')

  return (
    <AdminShell>
      <AdminProdutosClient products={products ?? []} />
    </AdminShell>
  )
}
