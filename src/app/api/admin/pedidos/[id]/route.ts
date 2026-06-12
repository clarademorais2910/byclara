import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'

async function checkAuth() {
  const store = await cookies()
  return store.get('admin_token')?.value === process.env.ADMIN_PASSWORD
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('orders')
    .update({ status: body.status, admin_notes: body.admin_notes })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
