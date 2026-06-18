import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import AddToCartSection from '@/components/produto/AddToCartSection'
import ImageGallery from '@/components/produto/ImageGallery'
import { ArrowLeft, Package, Clock, Share2 } from 'lucide-react'
import { cache } from 'react'

interface Props {
  params: Promise<{ id: string }>
}

const getProduct = cache(async (id: string) => {
  const supabase = await createClient()
  const { data } = await supabase.from('products').select('*').eq('id', id).eq('active', true).single()
  return data
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const p = await getProduct(id)

  if (!p) return { title: 'Produto não encontrado — By Clara' }

  return {
    title:       `${p.name} — By Clara`,
    description: p.description || `Pulseira artesanal ${p.name} feita com amor. Personalize a sua!`,
    openGraph: {
      title:       `${p.name} — By Clara`,
      description: p.description || 'Pulseira de miçangas artesanal e personalizada',
      images:      p.images?.[0] ? [p.images[0]] : [],
    },
  }
}

export default async function ProdutoPage({ params }: Props) {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) notFound()

  const shareUrl = `https://clarabyclara.com.br/produto/${id}`
  const shareText = encodeURIComponent(`Olha essa pulseira linda da By Clara! 🌸\n${shareUrl}`)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description ?? undefined,
    image: product.images ?? [],
    url: shareUrl,
    brand: { '@type': 'Brand', name: 'By Clara' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'BRL',
      price: product.price.toFixed(2),
      availability: product.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/PreOrder',
      seller: { '@type': 'Organization', name: 'By Clara' },
    },
  }

  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">

        <div className="flex items-center justify-between mb-6">
          <Link href="/catalogo" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-clara-rosa transition-colors">
            <ArrowLeft size={16} /> Voltar ao catálogo
          </Link>
          <a
            href={`https://wa.me/?text=${shareText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-green-500 transition-colors"
          >
            <Share2 size={15} /> Compartilhar
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ImageGallery images={product.images ?? []} name={product.name} />

          <div className="space-y-5">
            <div>
              <h1 className="font-display text-2xl md:text-3xl text-clara-texto leading-tight">{product.name}</h1>
              <p className="font-display text-3xl text-clara-rosa mt-2">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </p>
            </div>

            {product.description && (
              <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
            )}

            <div className="flex gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <Package size={14} className="text-clara-rosa" />
                {product.stock > 0 ? `${product.stock} disponíveis` : 'Sob encomenda'}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-clara-rosa" />
                Prazo: até 3 dias úteis
              </div>
            </div>

            <div className="border-t border-gray-100 pt-5">
              <AddToCartSection product={product} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
