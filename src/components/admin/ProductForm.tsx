'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus, X } from 'lucide-react'
import toast from 'react-hot-toast'
import ImageUpload from './ImageUpload'

interface Product {
  id?: string
  name: string
  description: string
  price: number
  images: string[]
  colors: string[]
  allow_custom_name: boolean
  custom_name_label: string
  weight_grams: number
  stock: number
  active: boolean
  featured: boolean
}

interface Props {
  initial?: Partial<Product>
  onClose: () => void
}

const EMPTY: Product = {
  name: '', description: '', price: 0, images: [], colors: [],
  allow_custom_name: false, custom_name_label: 'Escrever no bracelete',
  weight_grams: 15, stock: 0, active: true, featured: false,
}

export default function ProductForm({ initial, onClose }: Props) {
  const [form, setForm] = useState<Product>({ ...EMPTY, ...initial })
  const [newColor, setNewColor] = useState('#F9A8D4')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  function set<K extends keyof Product>(key: K, value: Product[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const method = form.id ? 'PUT' : 'POST'
      const url    = form.id ? `/api/admin/produtos/${form.id}` : '/api/admin/produtos'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      toast.success(form.id ? 'Produto atualizado!' : 'Produto criado!')
      router.refresh()
      onClose()
    } catch {
      toast.error('Erro ao salvar produto')
    } finally {
      setLoading(false)
    }
  }

  const inp = 'w-full border-2 border-gray-200 focus:border-clara-rosa rounded-2xl px-4 py-2.5 text-sm outline-none transition-colors'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-xs font-semibold text-gray-500 block mb-1">Nome *</label>
          <input className={inp} value={form.name} onChange={e => set('name', e.target.value)} required />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1">Preço (R$) *</label>
          <input className={inp} type="number" step="0.01" min="0"
            value={form.price} onChange={e => set('price', parseFloat(e.target.value) || 0)} required />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1">Estoque</label>
          <input className={inp} type="number" min="0"
            value={form.stock} onChange={e => set('stock', parseInt(e.target.value) || 0)} />
        </div>
        <div className="col-span-2">
          <label className="text-xs font-semibold text-gray-500 block mb-1">Descrição</label>
          <textarea className={`${inp} resize-none`} rows={3}
            value={form.description} onChange={e => set('description', e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1">Peso (gramas)</label>
          <input className={inp} type="number" min="0"
            value={form.weight_grams} onChange={e => set('weight_grams', parseInt(e.target.value) || 0)} />
        </div>
      </div>

      {/* Fotos */}
      <div>
        <label className="text-xs font-semibold text-gray-500 block mb-2">Fotos</label>
        <ImageUpload urls={form.images} onChange={urls => set('images', urls)} />
      </div>

      {/* Cores */}
      <div>
        <label className="text-xs font-semibold text-gray-500 block mb-2">Cores disponíveis</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {form.colors.map(c => (
            <div key={c} className="flex items-center gap-1.5 bg-gray-100 rounded-full px-2 py-1">
              <div className="w-4 h-4 rounded-full ring-1 ring-black/10" style={{ backgroundColor: c }} />
              <span className="text-xs">{c}</span>
              <button type="button" onClick={() => set('colors', form.colors.filter(x => x !== c))}>
                <X size={10} className="text-gray-400" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input type="color" value={newColor} onChange={e => setNewColor(e.target.value)}
            className="w-10 h-10 rounded-xl cursor-pointer border-2 border-gray-200" />
          <button type="button"
            onClick={() => { if (!form.colors.includes(newColor)) set('colors', [...form.colors, newColor]) }}
            className="flex items-center gap-1 text-sm text-clara-rosa font-semibold px-3 py-2 border-2 border-clara-rosa/30 rounded-xl hover:bg-clara-rosa/5"
          >
            <Plus size={14} /> Adicionar cor
          </button>
        </div>
      </div>

      {/* Personalização */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.allow_custom_name}
            onChange={e => set('allow_custom_name', e.target.checked)}
            className="w-4 h-4 accent-clara-rosa" />
          <span className="text-sm font-semibold text-clara-texto">Aceita nome personalizado</span>
        </label>
        {form.allow_custom_name && (
          <input className={inp} value={form.custom_name_label}
            onChange={e => set('custom_name_label', e.target.value)}
            placeholder="Rótulo do campo de nome" />
        )}
      </div>

      {/* Flags */}
      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.active}
            onChange={e => set('active', e.target.checked)} className="w-4 h-4 accent-clara-rosa" />
          <span className="text-sm">Ativo</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.featured}
            onChange={e => set('featured', e.target.checked)} className="w-4 h-4 accent-clara-rosa" />
          <span className="text-sm">Destaque</span>
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose}
          className="flex-1 border-2 border-gray-200 text-gray-500 font-semibold py-2.5 rounded-2xl hover:border-clara-rosa transition-all">
          Cancelar
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 bg-clara-rosa text-white font-semibold py-2.5 rounded-2xl hover:brightness-95 disabled:opacity-50 transition-all">
          {loading && <Loader2 size={16} className="animate-spin" />}
          {form.id ? 'Salvar' : 'Criar produto'}
        </button>
      </div>
    </form>
  )
}
