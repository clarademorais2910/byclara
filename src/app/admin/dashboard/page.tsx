import { createAdminClient } from '@/lib/supabase/admin'
import AdminShell from '@/components/admin/AdminShell'
import Link from 'next/link'
import { ShoppingBag, Package, DollarSign, Clock, AlertTriangle } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export const revalidate = 0

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  aguardando_pagamento: { label: 'Aguardando Pix',   className: 'bg-amber-100 text-amber-700'   },
  pagamento_confirmado: { label: 'Pago',             className: 'bg-green-100 text-green-700'    },
  em_producao:         { label: 'Em produção',       className: 'bg-blue-100 text-blue-700'      },
  enviado:             { label: 'Enviado',            className: 'bg-purple-100 text-purple-700'  },
  entregue:            { label: 'Entregue',           className: 'bg-gray-100 text-gray-600'      },
  cancelado:           { label: 'Cancelado',          className: 'bg-red-100 text-red-600'        },
}

async function getData() {
  const supabase = createAdminClient()
  const [
    { data: orders },
    { count: totalProdutos },
    { data: lowStock },
  ] = await Promise.all([
    supabase.from('orders').select('id, customer_name, status, total, created_at').order('created_at', { ascending: false }),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('active', true),
    supabase.from('products').select('id, name, stock').eq('active', true).lt('stock', 5).order('stock'),
  ])

  const lista = orders ?? []
  const paid  = ['pagamento_confirmado', 'em_producao', 'enviado', 'entregue']
  const receita = lista.filter(o => paid.includes(o.status)).reduce((s, o) => s + Number(o.total), 0)

  return {
    total:        lista.length,
    aguardando:   lista.filter(o => o.status === 'aguardando_pagamento').length,
    confirmados:  lista.filter(o => paid.includes(o.status)).length,
    receita,
    totalProdutos: totalProdutos ?? 0,
    recentes:     lista.slice(0, 8),
    lowStock:     lowStock ?? [],
  }
}

export default async function DashboardPage() {
  const d = await getData()

  const cards = [
    { label: 'Total de pedidos', value: d.total,              icon: ShoppingBag, color: 'bg-clara-rosa/10 text-clara-rosa'      },
    { label: 'Aguardando pag.',  value: d.aguardando,         icon: Clock,       color: 'bg-amber-100 text-amber-500'            },
    { label: 'Pedidos pagos',    value: d.confirmados,        icon: Package,     color: 'bg-green-100 text-green-500'            },
    { label: 'Receita total',    value: formatPrice(d.receita), icon: DollarSign, color: 'bg-emerald-100 text-emerald-600', text: true },
  ]

  return (
    <AdminShell>
      <h1 className="font-display text-3xl text-clara-rosa mb-6">Dashboard</h1>

      {/* Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(c => (
          <div key={c.label} className="bg-white rounded-card shadow-card p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${c.color}`}>
              <c.icon size={20} />
            </div>
            <p className="text-2xl font-display text-clara-texto">{c.value}</p>
            <p className="text-xs text-gray-400 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Pedidos recentes */}
        <div className="lg:col-span-2 bg-white rounded-card shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-clara-texto text-sm">Pedidos recentes</h2>
            <Link href="/admin/pedidos" className="text-xs text-clara-rosa hover:underline">Ver todos →</Link>
          </div>
          {d.recentes.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">Nenhum pedido ainda</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {d.recentes.map(o => {
                const s = STATUS_LABEL[o.status] ?? { label: o.status, className: 'bg-gray-100 text-gray-500' }
                return (
                  <Link
                    key={o.id}
                    href={`/admin/pedidos/${o.id}`}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-clara-rosa/5 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-clara-texto truncate">{o.customer_name}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(o.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${s.className}`}>
                      {s.label}
                    </span>
                    <span className="text-sm font-display text-clara-rosa whitespace-nowrap">
                      {formatPrice(Number(o.total))}
                    </span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Estoque baixo */}
        <div className="bg-white rounded-card shadow-card overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
            <AlertTriangle size={15} className="text-amber-500" />
            <h2 className="font-semibold text-clara-texto text-sm">Estoque baixo</h2>
          </div>
          {d.lowStock.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">Tudo em estoque ✓</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {d.lowStock.map(p => (
                <Link
                  key={p.id}
                  href="/admin/produtos"
                  className="flex items-center justify-between px-5 py-3 hover:bg-amber-50 transition-colors"
                >
                  <p className="text-sm text-clara-texto truncate flex-1">{p.name}</p>
                  <span className={`text-xs font-bold ml-3 ${p.stock === 0 ? 'text-red-500' : 'text-amber-500'}`}>
                    {p.stock === 0 ? 'Esgotado' : `${p.stock} un.`}
                  </span>
                </Link>
              ))}
            </div>
          )}
          <div className="px-5 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              {d.totalProdutos} produto{d.totalProdutos !== 1 ? 's' : ''} ativo{d.totalProdutos !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

      </div>
    </AdminShell>
  )
}
