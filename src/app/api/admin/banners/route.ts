import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'

async function checkAuth() {
  const store = await cookies()
  return store.get('admin_token')?.value === process.env.ADMIN_PASSWORD
}

export async function POST(req: NextRequest) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('banners')
    .insert({
      image_url: body.image_url,
      title:     body.title || null,
      subtitle:  body.subtitle || null,
      link:      body.link || null,
      active:    true,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
