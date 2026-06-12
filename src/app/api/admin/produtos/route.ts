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
    .from('products')
    .insert({
      name:              body.name,
      description:       body.description || null,
      price:             body.price,
      images:            body.images ?? [],
      colors:            body.colors ?? [],
      allow_custom_name: body.allow_custom_name ?? false,
      custom_name_label: body.custom_name_label || 'Escrever no bracelete',
      weight_grams:      body.weight_grams ?? 15,
      stock:             body.stock ?? 0,
      active:            body.active ?? true,
      featured:          body.featured ?? false,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
