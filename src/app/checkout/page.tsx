import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CheckoutForm from '@/components/checkout/CheckoutForm'

export default function CheckoutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-4 py-8">
        <h1 className="font-display text-3xl text-clara-rosa text-center mb-8">Finalizar pedido</h1>
        <CheckoutForm />
      </main>
      <Footer />
    </div>
  )
}
