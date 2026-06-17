'use client'
import { useCartStore } from '@/store/cart'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useState, useEffect } from 'react'

export default function CarrinhoPage() {
  const { items, removeItem, updateQty, subtotal } = useCartStore()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
          <div className="h-8 w-48 bg-gray-100 rounded-2xl animate-pulse mb-6" />
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="bg-white rounded-card shadow-card p-4 flex gap-4">
                <div className="w-20 h-20 rounded-xl bg-gray-100 animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center gap-4 px-4">
          <ShoppingBag size={64} className="text-clara-rosa/30" />
          <h1 className="font-display text-2xl text-clara-rosa">Carrinho vazio</h1>
          <p className="text-gray-400 text-sm">Adicione pulseiras lindas ao seu carrinho!</p>
          <Link href="/catalogo" className="bg-clara-rosa text-white font-semibold px-6 py-3 rounded-2xl hover:brightness-95 transition-all mt-2">
            Ver catálogo
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <h1 className="font-display text-3xl text-clara-rosa mb-6">Meu carrinho</h1>

        <div className="space-y-3 mb-6">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-card shadow-card p-4 flex gap-4">
              {/* Imagem */}
              <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-clara-rosa/10 to-clara-lavanda/10 flex-shrink-0">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">🌸</div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-clara-texto line-clamp-2">{item.name}</p>

                {item.personalizacao?.coresEscolhidas && item.personalizacao.coresEscolhidas.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {item.personalizacao.coresEscolhidas.map(c => (
                      <div key={c} className="w-3.5 h-3.5 rounded-full ring-1 ring-black/10" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                )}

                {item.personalizacao?.nomePersonalizado && (
                  <p className="text-xs text-gray-400 mt-0.5">Nome: {item.personalizacao.nomePersonalizado}</p>
                )}

                <p className="font-display text-clara-rosa mt-1">
                  {formatPrice(item.price * item.quantity)}
                </p>

                <div className="flex items-center gap-3 mt-2">
                  <button onClick={() => updateQty(item.id, item.quantity - 1)} className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:border-clara-rosa transition-colors">
                    <Minus size={12} />
                  </button>
                  <span className="text-sm font-semibold w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateQty(item.id, item.quantity + 1)} className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:border-clara-rosa transition-colors">
                    <Plus size={12} />
                  </button>
                  <button onClick={() => removeItem(item.id)} className="ml-auto text-gray-300 hover:text-red-400 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Resumo */}
        <div className="bg-white rounded-card shadow-card p-5 space-y-3">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal())}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-400">
            <span>Frete</span>
            <span>Calculado no checkout</span>
          </div>
          <div className="border-t border-gray-100 pt-3 flex justify-between font-semibold">
            <span>Total</span>
            <span className="font-display text-clara-rosa text-xl">{formatPrice(subtotal())}</span>
          </div>
          <Link href="/checkout" className="flex items-center justify-center gap-2 w-full bg-clara-rosa text-white font-semibold py-3.5 rounded-2xl hover:brightness-95 active:scale-95 transition-all shadow-soft mt-2">
            Finalizar pedido <ArrowRight size={18} />
          </Link>
          <Link href="/catalogo" className="block text-center text-sm text-gray-400 hover:text-clara-rosa transition-colors pt-1">
            Continuar comprando
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
