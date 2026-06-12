'use client'
import { useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface Props {
  settings: Record<string, string>
}

const FIELDS = [
  { key: 'store_open',          label: 'Loja aberta',         type: 'toggle',  description: 'Permite novos pedidos' },
  { key: 'whatsapp_number',     label: 'WhatsApp',            type: 'text',    description: 'Com código do país: 5562...' },
  { key: 'prazo_producao_dias', label: 'Prazo de produção',   type: 'number',  description: 'Dias úteis para produzir' },
  { key: 'frete_local_preco',   label: 'Preço frete local',   type: 'number',  description: 'R$ (0 = grátis)' },
  { key: 'frete_local_label',   label: 'Label frete local',   type: 'text',    description: 'Texto exibido para o cliente' },
  { key: 'peso_embalagem_g',    label: 'Peso embalagem (g)',  type: 'number',  description: 'Peso extra da embalagem' },
  { key: 'mensagem_pix',        label: 'Mensagem no Pix',     type: 'text',    description: 'Aparece na transferência' },
]

export default function ConfiguracoesClient({ settings }: Props) {
  const [form, setForm] = useState<Record<string, string>>(settings)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  function set(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function save() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/configuracoes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      toast.success('Configurações salvas!')
      router.refresh()
    } catch {
      toast.error('Erro ao salvar')
    } finally {
      setLoading(false)
    }
  }

  const inp = 'w-full border-2 border-gray-200 focus:border-clara-rosa rounded-2xl px-4 py-2.5 text-sm outline-none transition-colors'

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-3xl text-clara-rosa mb-6">Configurações</h1>

      <div className="bg-white rounded-card shadow-card p-6 space-y-5">
        {FIELDS.map(field => (
          <div key={field.key}>
            <label className="text-xs font-semibold text-gray-500 block mb-1">
              {field.label}
              {field.description && <span className="font-normal ml-1 text-gray-400">— {field.description}</span>}
            </label>

            {field.type === 'toggle' ? (
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => set(field.key, form[field.key] === 'true' ? 'false' : 'true')}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    form[field.key] === 'true' ? 'bg-clara-turquesa' : 'bg-gray-300'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    form[field.key] === 'true' ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </div>
                <span className="text-sm font-semibold">
                  {form[field.key] === 'true' ? 'Aberta' : 'Fechada'}
                </span>
              </label>
            ) : (
              <input
                type={field.type}
                value={form[field.key] ?? ''}
                onChange={e => set(field.key, e.target.value)}
                className={inp}
              />
            )}
          </div>
        ))}

        <button
          onClick={save}
          disabled={loading}
          className="flex items-center gap-2 bg-clara-rosa text-white font-semibold px-6 py-3 rounded-2xl hover:brightness-95 disabled:opacity-50 transition-all w-full justify-center"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Salvar configurações
        </button>
      </div>
    </div>
  )
}
