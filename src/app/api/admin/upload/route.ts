import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'

async function checkAuth() {
  const store = await cookies()
  return store.get('admin_token')?.value === process.env.ADMIN_PASSWORD
}

export async function POST(req: NextRequest) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const form = await req.formData()
  const file   = form.get('file') as File | null
  const bucket = (form.get('bucket') as string) || 'products'

  if (!file) return NextResponse.json({ error: 'Nenhum arquivo' }, { status: 400 })

  const ext      = file.name.split('.').pop() ?? 'jpg'
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const supabase = createAdminClient()
  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, { contentType: file.type, upsert: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName)

  return NextResponse.json({ url: publicUrl })
}
