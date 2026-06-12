import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ProductCard from '@/components/ui/ProductCard'

export const revalidate = 60

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
        <h1 className="font-display text-3xl text-clara-rosa mb-2">Catálogo</h1>
        <p className="text-sm text-gray-500 mb-6">
          {lista.length === 0 ? 'Nenhum produto disponível ainda' : `${lista.length} produto${lista.length !== 1 ? 's' : ''}`}
        </p>

        {lista.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-card shadow-soft">
            <p className="text-5xl mb-4">🌸</p>
            <p className="font-semibold text-clara-texto">Produtos chegando em breve!</p>
            <p className="text-sm text-gray-400 mt-1">Volte logo para ver as novidades</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
            {lista.map(p => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                price={p.price}
                image={p.images?.[0] ?? ''}
                colors={p.colors ?? []}
                allowCustomName={p.allow_custom_name}
                featured={p.featured}
              />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
