import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'

async function checkAuth() {
  const store = await cookies()
  return store.get('admin_token')?.value === process.env.ADMIN_PASSWORD
}

export async function PUT(req: NextRequest) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body: Record<string, string> = await req.json()
  const supabase = createAdminClient()

  const updates = Object.entries(body).map(([key, value]) =>
    supabase.from('settings').upsert({ key, value, updated_at: new Date().toISOString() })
  )

  await Promise.all(updates)

  return NextResponse.json({ ok: true })
}
