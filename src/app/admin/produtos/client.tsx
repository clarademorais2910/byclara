'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Plus, Pencil, Trash2, Star } from 'lucide-react'
import ProductForm from '@/components/admin/ProductForm'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { formatPrice } from '@/lib/utils'

interface Product {
  id: string
  name: string
  price: number
  images: string[]
  active: boolean
  featured: boolean
  stock: number
  colors: string[]
  description: string
  allow_custom_name: boolean
  custom_name_label: string
  weight_grams: number
}

export default function AdminProdutosClient({ products }: { products: Product[] }) {
  const [modal, setModal] = useState<{ open: boolean; product?: Product }>({ open: false })
  const router = useRouter()

  async function deleteProduct(id: string, name: string) {
    if (!confirm(`Excluir "${name}"?`)) return
    const res = await fetch(`/api/admin/produtos/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Produto excluído'); router.refresh() }
    else toast.error('Erro ao excluir')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl text-clara-rosa">Produtos</h1>
        <button onClick={() => setModal({ open: true })}
          className="flex items-center gap-2 bg-clara-rosa text-white font-semibold px-4 py-2.5 rounded-2xl hover:brightness-95 transition-all text-sm">
          <Plus size={16} /> Novo produto
        </button>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-card shadow-card p-10 text-center text-gray-400">
          Nenhum produto cadastrado
        </div>
      ) : (
        <div className="space-y-3">
          {products.map(p => (
            <div key={p.id} className="bg-white rounded-card shadow-card p-4 flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-clara-rosa/10 to-clara-lavanda/10 flex-shrink-0">
                {p.images?.[0] ? (
                  <Image src={p.images[0]} alt={p.name} fill className="object-cover" sizes="64px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">🌸</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm line-clamp-1">{p.name}</p>
                  {p.featured && <Star size={12} className="text-amber-400 fill-amber-400" />}
                  {!p.active && <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">Inativo</span>}
                </div>
                <p className="font-display text-clara-rosa text-sm">{formatPrice(p.price)}</p>
                <p className="text-xs text-gray-400">Estoque: {p.stock} · {p.colors.length} cores</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setModal({ open: true, product: p })}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:border-clara-rosa text-gray-400 hover:text-clara-rosa transition-colors">
                  <Pencil size={15} />
                </button>
                <button onClick={() => deleteProduct(p.id, p.name)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:border-red-400 text-gray-400 hover:text-red-400 transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-card shadow-hover w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h2 className="font-display text-xl text-clara-rosa mb-4">
              {modal.product ? 'Editar produto' : 'Novo produto'}
            </h2>
            <ProductForm
              initial={modal.product}
              onClose={() => setModal({ open: false })}
            />
          </div>
        </div>
      )}
    </div>
  )
}
