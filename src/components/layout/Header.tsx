'use client'
import Link from 'next/link'
import { ShoppingBag, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCartStore } from '@/store/cart'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const totalItems = useCartStore(s => s.totalItems())

  useEffect(() => { setMounted(true) }, [])

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-clara-rosa/20 shadow-soft">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="font-display text-2xl text-clara-rosa leading-none">
          By Clara
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-clara-texto">
          <Link href="/catalogo" className="hover:text-clara-rosa transition-colors">
            Catálogo
          </Link>
          <Link href="/encomendas" className="hover:text-clara-rosa transition-colors">
            Encomendas
          </Link>
        </nav>

        {/* Ações */}
        <div className="flex items-center gap-3">
          <Link href="/carrinho" className="relative p-2 rounded-2xl hover:bg-clara-rosa/10 transition-colors">
            <ShoppingBag size={22} className="text-clara-texto" />
            {mounted && totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-clara-rosa text-white text-xs font-bold rounded-full">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </Link>

          {/* Hambúrguer mobile */}
          <button
            className="md:hidden p-2 rounded-2xl hover:bg-clara-rosa/10 transition-colors"
            onClick={() => setMenuOpen(v => !v)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-clara-rosa/20 px-4 py-4 flex flex-col gap-4">
          <Link href="/catalogo" className="font-semibold text-clara-texto hover:text-clara-rosa" onClick={() => setMenuOpen(false)}>
            Catálogo
          </Link>
          <Link href="/encomendas" className="font-semibold text-clara-texto hover:text-clara-rosa" onClick={() => setMenuOpen(false)}>
            Encomendas
          </Link>
        </div>
      )}
    </header>
  )
}
