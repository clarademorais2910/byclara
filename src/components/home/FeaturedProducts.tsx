import Link from 'next/link'
import ProductCard from '@/components/ui/ProductCard'
import { ArrowRight } from 'lucide-react'

interface Product {
  id: string
  name: string
  price: number
  images: string[]
  colors: string[]
  allow_custom_name: boolean
  featured: boolean
}

interface FeaturedProductsProps {
  products: Product[]
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  if (products.length === 0) {
    return (
      <section className="max-w-5xl mx-auto px-4 py-10">
        <h2 className="font-display text-2xl md:text-3xl text-clara-rosa mb-6">Em destaque</h2>
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-card shadow-soft">
          <p className="text-4xl mb-3">🌸</p>
          <p className="font-semibold text-clara-texto">Produtos a caminho!</p>
          <p className="text-sm text-gray-400 mt-1">Novidades chegando em breve</p>
        </div>
      </section>
    )
  }

  return (
    <section className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl md:text-3xl text-clara-rosa">Em destaque</h2>
        <Link href="/catalogo" className="flex items-center gap-1 text-sm font-semibold text-clara-rosa hover:gap-2 transition-all">
          Ver tudo <ArrowRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
        {products.map(p => (
          <ProductCard
            key={p.id}
            id={p.id}
            name={p.name}
            price={p.price}
            image={p.images?.[0] || ''}
            colors={p.colors}
            allowCustomName={p.allow_custom_name}
            featured={p.featured}
          />
        ))}
      </div>
    </section>
  )
}
