import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'

async function checkAuth() {
  const store = await cookies()
  return store.get('admin_token')?.value === process.env.ADMIN_PASSWORD
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const supabase = createAdminClient()

  const { error } = await supabase.from('banners').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
