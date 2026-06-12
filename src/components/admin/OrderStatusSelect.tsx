'use client'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

const OPTIONS = [
  { value: 'aguardando_pagamento', label: 'Aguardando pagamento' },
  { value: 'pagamento_confirmado', label: 'Pagamento confirmado' },
  { value: 'em_producao',          label: 'Em produção'          },
  { value: 'enviado',              label: 'Enviado'               },
  { value: 'entregue',             label: 'Entregue'              },
  { value: 'cancelado',            label: 'Cancelado'             },
]

export default function OrderStatusSelect({ orderId, current, adminNotes: initialNotes }: {
  orderId: string
  current: string
  adminNotes: string
}) {
  const [status, setStatus] = useState(current)
  const [notes, setNotes]   = useState(initialNotes ?? '')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function save() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/pedidos/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, admin_notes: notes }),
      })
      if (!res.ok) throw new Error()
      toast.success('Pedido atualizado!')
      router.refresh()
    } catch {
      toast.error('Erro ao atualizar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-semibold text-gray-500 block mb-1">Status</label>
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="w-full border-2 border-gray-200 focus:border-clara-rosa rounded-2xl px-4 py-2.5 text-sm outline-none"
        >
          {OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-500 block mb-1">Notas internas</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          className="w-full border-2 border-gray-200 focus:border-clara-rosa rounded-2xl px-4 py-2.5 text-sm outline-none resize-none"
          placeholder="Anotações visíveis só para você..."
        />
      </div>
      <button
        onClick={save}
        disabled={loading}
        className="flex items-center gap-2 bg-clara-rosa text-white font-semibold px-6 py-2.5 rounded-2xl hover:brightness-95 disabled:opacity-50 transition-all"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        Salvar
      </button>
    </div>
  )
}
