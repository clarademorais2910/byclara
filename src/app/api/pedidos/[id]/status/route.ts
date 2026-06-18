import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('orders')
    .select('status')
    .eq('id', id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })

  return NextResponse.json({ status: data.status })
}
