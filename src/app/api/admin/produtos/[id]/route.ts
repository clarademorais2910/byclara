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
    .from('products')
    .update({
      name:              body.name,
      description:       body.description || null,
      price:             body.price,
      images:            body.images ?? [],
      colors:            body.colors ?? [],
      allow_custom_name: body.allow_custom_name ?? false,
      custom_name_label: body.custom_name_label,
      weight_grams:      body.weight_grams,
      stock:             body.stock,
      active:            body.active,
      featured:          body.featured,
    })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const supabase = createAdminClient()

  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
