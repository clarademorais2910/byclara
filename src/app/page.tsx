import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import BannerSlider from '@/components/home/BannerSlider'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import Link from 'next/link'
import { Sparkles, Package, Heart } from 'lucide-react'
import { WHATSAPP } from '@/lib/config'

export const revalidate = 300

async function getData() {
  const supabase = await createClient()

  const [{ data: banners }, { data: products }, { data: settings }] = await Promise.all([
    supabase.from('banners').select('*').eq('active', true).order('position'),
    supabase.from('products').select('*').eq('active', true).eq('featured', true).order('position').limit(8),
    supabase.from('settings').select('key,value').in('key', ['store_open']),
  ])

  const cfg: Record<string, string> = {}
  for (const s of settings ?? []) cfg[s.key] = s.value

  return { banners: banners ?? [], products: products ?? [], storeOpen: cfg.store_open !== 'false' }
}

export default async function Home() {
  const { banners, products, storeOpen } = await getData()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {!storeOpen && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 text-center">
          <p className="text-sm text-amber-700 font-semibold">
            🛑 A loja está temporariamente fechada — novas encomendas não estão sendo aceitas no momento.
            {' '}<a href={`https://wa.me/${WHATSAPP}?text=Ol%C3%A1!%20Vi%20que%20a%20loja%20est%C3%A1%20fechada.%20Quando%20volta?`} className="underline hover:text-amber-900" target="_blank" rel="noopener noreferrer">Fale comigo no WhatsApp</a>
          </p>
        </div>
      )}

      <main className="flex-1">
        {/* Banner */}
        <BannerSlider banners={banners} />

        {/* Produtos em destaque */}
        <FeaturedProducts products={products} />

        {/* Como funciona */}
        <section className="max-w-5xl mx-auto px-4 py-10">
          <h2 className="font-display text-2xl md:text-3xl text-clara-rosa text-center mb-8">
            Como funciona?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-card shadow-card p-6 flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-clara-rosa/10 flex items-center justify-center">
                <Sparkles size={28} className="text-clara-rosa" />
              </div>
              <h3 className="font-display text-clara-rosa text-lg">Escolha ou personalize</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Navegue pelo catálogo ou encomende a sua pulseira com as cores e o nome que quiser.
              </p>
            </div>

            <div className="bg-white rounded-card shadow-card p-6 flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-clara-amarelo/30 flex items-center justify-center">
                <Package size={28} className="text-amber-500" />
              </div>
              <h3 className="font-display text-clara-rosa text-lg">Pague via Pix</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Finalize o pedido e pague instantaneamente por Pix. Rápido e seguro!
              </p>
            </div>

            <div className="bg-white rounded-card shadow-card p-6 flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-clara-turquesa/30 flex items-center justify-center">
                <Heart size={28} className="text-emerald-500" />
              </div>
              <h3 className="font-display text-clara-rosa text-lg">Receba com amor</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Produzimos com carinho e enviamos para todo o Brasil — ou entregamos em Itaberaí!
              </p>
            </div>
          </div>
        </section>

        {/* CTA WhatsApp */}
        <section className="max-w-5xl mx-auto px-4 pb-10">
          <div className="bg-gradient-to-r from-clara-rosa to-clara-lavanda rounded-card p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <h2 className="font-display text-white text-2xl md:text-3xl">Ficou com dúvida?</h2>
              <p className="text-white/90 text-sm mt-1">Fala comigo pelo WhatsApp, respondo rapidinho! 💬</p>
            </div>
            <a
              href={`https://wa.me/${WHATSAPP}?text=Ol%C3%A1!%20Vim%20pelo%20site%20e%20quero%20saber%20mais!`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 bg-white text-clara-rosa font-semibold px-6 py-3 rounded-2xl hover:scale-105 transition-transform shadow-md text-sm"
            >
              Chamar no WhatsApp
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
