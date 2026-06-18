import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CheckoutForm from '@/components/checkout/CheckoutForm'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { WHATSAPP } from '@/lib/config'

async function isStoreOpen(): Promise<boolean> {
  const supabase = createAdminClient()
  const { data } = await supabase.from('settings').select('value').eq('key', 'store_open').single()
  return data?.value !== 'false'
}

export default async function CheckoutPage() {
  const storeOpen = await isStoreOpen()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-4 py-8">
        <h1 className="font-display text-3xl text-clara-rosa text-center mb-8">Finalizar pedido</h1>

        {storeOpen ? (
          <CheckoutForm />
        ) : (
          <div className="max-w-lg mx-auto bg-white rounded-card shadow-card p-8 text-center space-y-4">
            <p className="text-5xl">🛑</p>
            <h2 className="font-display text-2xl text-clara-rosa">Loja temporariamente fechada</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              No momento não estou aceitando novos pedidos pelo site.<br />
              Mas você pode me chamar no WhatsApp!
            </p>
            <a
              href={`https://wa.me/${WHATSAPP}?text=Ol%C3%A1!%20Quero%20fazer%20um%20pedido%20mas%20a%20loja%20est%C3%A1%20fechada.`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 text-white font-semibold px-6 py-3 rounded-2xl hover:bg-green-600 transition-colors"
            >
              Falar no WhatsApp
            </a>
            <div>
              <Link href="/catalogo" className="text-sm text-clara-rosa hover:underline">
                Ver catálogo →
              </Link>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
