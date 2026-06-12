import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import AddToCartSection from '@/components/produto/AddToCartSection'
import { ArrowLeft, Package, Clock } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ProdutoPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('active', true)
    .single()

  if (!product) notFound()

  const images: string[] = product.images ?? []

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">

        <Link href="/catalogo" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-clara-rosa transition-colors mb-6">
          <ArrowLeft size={16} />
          Voltar ao catálogo
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Imagens */}
          <div className="space-y-3">
            <div className="relative w-full aspect-square rounded-card overflow-hidden bg-gradient-to-br from-clara-rosa/10 to-clara-lavanda/10">
              {images[0] ? (
                <Image
                  src={images[0]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-8xl">🌸</span>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.slice(1).map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-clara-fundo">
                    <Image src={img} alt={`${product.name} ${i + 2}`} fill className="object-cover" sizes="80px" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info + compra */}
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
