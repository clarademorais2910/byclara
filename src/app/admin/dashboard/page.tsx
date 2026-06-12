import { createAdminClient } from '@/lib/supabase/admin'
import AdminShell from '@/components/admin/AdminShell'
import { ShoppingBag, Package, DollarSign, Clock } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export const revalidate = 0

async function getStats() {
  const supabase = createAdminClient()
  const [
    { data: orders },
    { count: totalProdutos },
  ] = await Promise.all([
    supabase.from('orders').select('status, total'),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('active', true),
  ])

  const lista = orders ?? []
  const aguardando = lista.filter(o => o.status === 'aguardando_pagamento').length
  const confirmados = lista.filter(o => ['pagamento_confirmado','em_producao','enviado','entregue'].includes(o.status)).length
  const receita = lista
    .filter(o => ['pagamento_confirmado','em_producao','enviado','entregue'].includes(o.status))
    .reduce((s, o) => s + Number(o.total), 0)

  return { total: lista.length, aguardando, confirmados, receita, totalProdutos: totalProdutos ?? 0 }
}

export default async function DashboardPage() {
  const stats = await getStats()

  const cards = [
    { label: 'Total de pedidos', value: stats.total,            icon: ShoppingBag, color: 'bg-clara-rosa/10 text-clara-rosa' },
    { label: 'Aguardando pag.',  value: stats.aguardando,       icon: Clock,       color: 'bg-amber-100 text-amber-500'      },
    { label: 'Pedidos pagos',    value: stats.confirmados,      icon: Package,     color: 'bg-green-100 text-green-500'      },
    { label: 'Receita total',    value: formatPrice(stats.receita), icon: DollarSign, color: 'bg-clara-turquesa/20 text-emerald-600', isText: true },
  ]

  return (
    <AdminShell>
      <h1 className="font-display text-3xl text-clara-rosa mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(card => (
          <div key={card.label} className="bg-white rounded-card shadow-card p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
              <card.icon size={20} />
            </div>
            <p className="text-2xl font-display text-clara-texto">{card.value}</p>
            <p className="text-xs text-gray-400 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-card shadow-card p-5">
        <p className="text-sm text-gray-500">
          Produtos ativos: <span className="font-semibold text-clara-texto">{stats.totalProdutos}</span>
        </p>
      </div>
    </AdminShell>
  )
}
