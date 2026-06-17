'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingBag, Minus, Plus, Check } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import toast from 'react-hot-toast'

interface Props {
  product: {
    id: string
    name: string
    price: number
    images: string[]
    colors: string[]
    allow_custom_name: boolean
    custom_name_label: string
    weight_grams: number
    stock: number
  }
}

function generateId(productId: string, cores: string[], nome: string) {
  const parts = [productId]
  if (cores.length) parts.push(cores.join(','))
  if (nome) parts.push(nome)
  return parts.join('_')
}

export default function AddToCartSection({ product }: Props) {
  const [qty, setQty] = useState(1)
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [customName, setCustomName] = useState('')
  const addItem = useCartStore(s => s.addItem)
  const router = useRouter()

  function toggleColor(hex: string) {
    setSelectedColors(prev =>
      prev.includes(hex) ? prev.filter(c => c !== hex) : [...prev, hex]
    )
  }

  function handleAddToCart() {
    const id = generateId(product.id, selectedColors, customName)
    addItem({
      id,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] ?? '',
      weightGrams: product.weight_grams,
      quantity: qty,
      personalizacao: {
        coresEscolhidas: selectedColors.length ? selectedColors : undefined,
        nomePersonalizado: customName || undefined,
      },
    })
    toast.success('Adicionado ao carrinho! 🛍️')
  }

  function handleBuyNow() {
    handleAddToCart()
    router.push('/checkout')
  }

  return (
    <div className="space-y-5">
      {/* Cores */}
      {product.colors.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-clara-texto mb-2">
            Cores de miçangas{' '}
            <span className="text-gray-400 font-normal">(selecione uma ou mais)</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {product.colors.map(hex => (
              <button
                key={hex}
                onClick={() => toggleColor(hex)}
                className="relative w-9 h-9 rounded-full border-2 transition-all hover:scale-110"
                style={{
                  backgroundColor: hex,
                  borderColor: selectedColors.includes(hex) ? '#1C1917' : 'transparent',
                  boxShadow: selectedColors.includes(hex)
                    ? '0 0 0 3px white, 0 0 0 5px #1C1917'
                    : '0 2px 8px rgba(0,0,0,0.15)',
                }}
                title={hex}
              >
                {selectedColors.includes(hex) && (
                  <Check size={14} className="absolute inset-0 m-auto text-white drop-shadow" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Nome personalizado */}
      {product.allow_custom_name && (
        <div>
          <label className="text-sm font-semibold text-clara-texto block mb-1">
            {product.custom_name_label || 'Nome no bracelete'}{' '}
            <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
          <input
            type="text"
            maxLength={20}
            value={customName}
            onChange={e => setCustomName(e.target.value)}
            placeholder="Ex: Maria"
            className="w-full border-2 border-gray-200 focus:border-clara-rosa rounded-2xl px-4 py-2.5 text-sm font-body outline-none transition-colors"
          />
          <p className="text-xs text-gray-400 mt-1">{customName.length}/20 caracteres</p>
        </div>
      )}

      {/* Quantidade */}
      {product.stock > 0 && (
        <div>
          <p className="text-sm font-semibold text-clara-texto mb-2">Quantidade</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQty(q => Math.max(1, q - 1))}
              className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-clara-rosa transition-colors"
            >
              <Minus size={16} />
            </button>
            <span className="font-semibold text-lg w-6 text-center">{qty}</span>
            <button
              onClick={() => setQty(q => Math.min(product.stock, q + 1))}
              disabled={qty >= product.stock}
              className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-clara-rosa transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Botões */}
      <div className="flex flex-col gap-3 pt-2">
        {product.stock === 0 ? (
          <div className="w-full bg-gray-100 text-gray-400 font-semibold py-3.5 rounded-2xl text-center">
            Esgotado — fale pelo WhatsApp para encomendar
          </div>
        ) : (
          <>
            <button
              onClick={handleBuyNow}
              className="w-full bg-clara-rosa text-white font-semibold py-3.5 rounded-2xl hover:brightness-95 active:scale-95 transition-all shadow-soft"
            >
              Comprar agora
            </button>
            <button
              onClick={handleAddToCart}
              className="w-full flex items-center justify-center gap-2 border-2 border-clara-rosa text-clara-rosa font-semibold py-3 rounded-2xl hover:bg-clara-rosa/5 active:scale-95 transition-all"
            >
              <ShoppingBag size={18} />
              Adicionar ao carrinho
            </button>
          </>
        )}
      </div>
    </div>
  )
}
