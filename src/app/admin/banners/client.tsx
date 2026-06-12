'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import ImageUpload from '@/components/admin/ImageUpload'

interface Banner {
  id: string
  image_url: string
  title?: string
  subtitle?: string
  link?: string
  active: boolean
}

const EMPTY = { image_url: '', title: '', subtitle: '', link: '' }

export default function AdminBannersClient({ banners }: { banners: Banner[] }) {
  const [form, setForm] = useState(EMPTY)
  const [adding, setAdding] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  function set(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function createBanner(e: React.FormEvent) {
    e.preventDefault()
    if (!form.image_url) { toast.error('Adicione uma imagem'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/admin/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      toast.success('Banner criado!')
      setForm(EMPTY)
      setAdding(false)
      router.refresh()
    } catch {
      toast.error('Erro ao criar banner')
    } finally {
      setLoading(false)
    }
  }

  async function deleteBanner(id: string) {
    if (!confirm('Excluir este banner?')) return
    const res = await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Banner excluído'); router.refresh() }
    else toast.error('Erro ao excluir')
  }

  const inp = 'w-full border-2 border-gray-200 focus:border-clara-rosa rounded-2xl px-4 py-2.5 text-sm outline-none transition-colors'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl text-clara-rosa">Banners</h1>
        <button onClick={() => setAdding(v => !v)}
          className="flex items-center gap-2 bg-clara-rosa text-white font-semibold px-4 py-2.5 rounded-2xl hover:brightness-95 transition-all text-sm">
          <Plus size={16} /> Novo banner
        </button>
      </div>

      {/* Formulário */}
      {adding && (
        <form onSubmit={createBanner} className="bg-white rounded-card shadow-card p-5 mb-4 space-y-4">
          <h2 className="font-semibold">Novo banner</h2>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-2">Imagem *</label>
            <ImageUpload
              urls={form.image_url ? [form.image_url] : []}
              onChange={urls => set('image_url', urls[0] ?? '')}
              bucket="banners"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Título (opcional)</label>
            <input className={inp} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Ex: Nova coleção!" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Subtítulo (opcional)</label>
            <input className={inp} value={form.subtitle} onChange={e => set('subtitle', e.target.value)} placeholder="Descrição curta" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Link (opcional)</label>
            <input className={inp} value={form.link} onChange={e => set('link', e.target.value)} placeholder="/catalogo" />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setAdding(false)}
              className="flex-1 border-2 border-gray-200 text-gray-500 font-semibold py-2.5 rounded-2xl hover:border-clara-rosa transition-all">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-clara-rosa text-white font-semibold py-2.5 rounded-2xl hover:brightness-95 disabled:opacity-50">
              {loading && <Loader2 size={14} className="animate-spin" />}
              Criar banner
            </button>
          </div>
        </form>
      )}

      {/* Lista */}
      {banners.length === 0 && !adding ? (
        <div className="bg-white rounded-card shadow-card p-10 text-center text-gray-400">
          Nenhum banner cadastrado — o slider mostrará os banners padrão da marca
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map(b => (
            <div key={b.id} className="bg-white rounded-card shadow-card p-4 flex items-center gap-4">
              <div className="relative w-24 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                <Image src={b.image_url} alt={b.title ?? 'banner'} fill className="object-cover" sizes="96px" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm line-clamp-1">{b.title || '(sem título)'}</p>
                {b.subtitle && <p className="text-xs text-gray-400 line-clamp-1">{b.subtitle}</p>}
                {b.link && <p className="text-xs text-clara-rosa">{b.link}</p>}
              </div>
              <button onClick={() => deleteBanner(b.id)}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:border-red-400 text-gray-400 hover:text-red-400 transition-colors">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
