import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import AdminShell from '@/components/admin/AdminShell'
import OrderStatusSelect from '@/components/admin/OrderStatusSelect'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

export const revalidate = 0

export default async function AdminPedidoDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (!order) notFound()

  return (
    <AdminShell>
      <div className="max-w-2xl">
        <Link href="/admin/pedidos" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-clara-rosa mb-6">
          <ArrowLeft size={16} /> Voltar
        </Link>

        <h1 className="font-display text-3xl text-clara-rosa mb-1">Pedido</h1>
        <p className="text-xs text-gray-400 mb-6">#{id.slice(0, 8).toUpperCase()} · {new Date(order.created_at).toLocaleString('pt-BR')}</p>

        <div className="grid gap-4">
          {/* Cliente */}
          <div className="bg-white rounded-card shadow-card p-5 space-y-1 text-sm">
            <p className="font-semibold text-base">{order.customer_name}</p>
            <p className="text-gray-500">{order.customer_phone}</p>
            {order.customer_email && <p className="text-gray-500">{order.customer_email}</p>}
            <p className="text-gray-500 mt-2">
              {order.logradouro}, {order.numero}{order.complemento ? `, ${order.complemento}` : ''}<br />
              {order.bairro} — {order.cidade}/{order.estado} · {order.cep}
            </p>
            <p className="text-xs text-gray-400 mt-1">{order.shipping_label}</p>
          </div>

          {/* Itens */}
          <div className="bg-white rounded-card shadow-card p-5">
            <h2 className="font-semibold mb-3">Itens</h2>
            <div className="space-y-2 text-sm">
              {(order.items as any[]).map((item: any, i: number) => (
                <div key={i} className="flex justify-between gap-4">
                  <div>
                    <p>{item.name} ×{item.quantity}</p>
                    {item.personalizacao?.nomePersonalizado && (
                      <p className="text-xs text-gray-400">Nome: {item.personalizacao.nomePersonalizado}</p>
                    )}
                    {item.personalizacao?.coresEscolhidas?.length > 0 && (
                      <div className="flex gap-1 mt-0.5">
                        {item.personalizacao.coresEscolhidas.map((c: string) => (
                          <div key={c} className="w-3.5 h-3.5 rounded-full ring-1 ring-black/10" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2 space-y-1 text-gray-500">
                <div className="flex justify-between"><span>Frete</span><span>{formatPrice(order.shipping_price)}</span></div>
                <div className="flex justify-between font-semibold text-clara-texto">
                  <span>Total</span>
                  <span className="font-display text-clara-rosa">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-white rounded-card shadow-card p-5">
            <h2 className="font-semibold mb-3">Atualizar pedido</h2>
            <OrderStatusSelect orderId={id} current={order.status} adminNotes={order.admin_notes ?? ''} />
          </div>

          {/* Pix info */}
          <div className="bg-white rounded-card shadow-card p-5 text-sm text-gray-500 space-y-1">
            <p>TxID Pix: <code className="text-xs bg-gray-100 px-2 py-0.5 rounded">{order.pix_txid}</code></p>
            {order.pix_expires_at && (
              <p>Expira: {new Date(order.pix_expires_at).toLocaleString('pt-BR')}</p>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
