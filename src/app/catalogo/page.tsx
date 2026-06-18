import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CatalogoClient from '@/components/catalogo/CatalogoClient'
import { Suspense } from 'react'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Catálogo — By Clara',
  description: 'Pulseiras de miçangas artesanais e personalizadas. Escolha a sua ou encomende uma especial!',
}

export default async function CatalogoPage() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .order('position')

  const lista = products ?? []

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <h1 className="font-display text-3xl text-clara-rosa mb-6">Catálogo</h1>

        {lista.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-card shadow-soft">
            <p className="text-5xl mb-4">🌸</p>
            <p className="font-semibold text-clara-texto">Produtos chegando em breve!</p>
            <p className="text-sm text-gray-400 mt-1">Volte logo para ver as novidades</p>
          </div>
        ) : (
          <Suspense fallback={<div className="h-64 flex items-center justify-center text-gray-400 text-sm">Carregando…</div>}>
            <CatalogoClient products={lista} />
          </Suspense>
        )}
      </main>
      <Footer />
    </div>
  )
}
