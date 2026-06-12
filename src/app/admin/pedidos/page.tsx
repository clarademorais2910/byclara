import { createAdminClient } from '@/lib/supabase/admin'
import AdminShell from '@/components/admin/AdminShell'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

export const revalidate = 0

const STATUS: Record<string, { label: string; classes: string }> = {
  aguardando_pagamento: { label: 'Aguardando Pag.',    classes: 'bg-amber-100 text-amber-700'  },
  pagamento_confirmado: { label: 'Pago',               classes: 'bg-blue-100 text-blue-700'   },
  em_producao:          { label: 'Em produção',        classes: 'bg-purple-100 text-purple-700'},
  enviado:              { label: 'Enviado',             classes: 'bg-cyan-100 text-cyan-700'   },
  entregue:             { label: 'Entregue',            classes: 'bg-green-100 text-green-700' },
  cancelado:            { label: 'Cancelado',           classes: 'bg-red-100 text-red-700'     },
}

export default async function AdminPedidosPage() {
  const supabase = createAdminClient()
  const { data: orders } = await supabase
    .from('orders')
    .select('id, customer_name, customer_phone, total, status, created_at, cidade, estado')
    .order('created_at', { ascending: false })

  const lista = orders ?? []

  return (
    <AdminShell>
      <h1 className="font-display text-3xl text-clara-rosa mb-6">Pedidos</h1>

      {lista.length === 0 ? (
        <div className="bg-white rounded-card shadow-card p-10 text-center text-gray-400">
          Nenhum pedido ainda
        </div>
      ) : (
        <div className="space-y-3">
          {lista.map(order => {
            const s = STATUS[order.status] ?? { label: order.status, classes: 'bg-gray-100 text-gray-600' }
            return (
              <Link key={order.id} href={`/admin/pedidos/${order.id}`}>
                <div className="bg-white rounded-card shadow-card p-4 flex items-center gap-4 hover:shadow-hover transition-all cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm">{order.customer_name}</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.classes}`}>{s.label}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {order.cidade}/{order.estado} · {new Date(order.created_at).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-xs text-gray-400">{order.customer_phone}</p>
                  </div>
                  <p className="font-display text-clara-rosa text-lg flex-shrink-0">
                    {formatPrice(order.total)}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </AdminShell>
  )
}
