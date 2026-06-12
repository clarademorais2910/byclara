import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <p className="text-8xl mb-6">🌸</p>
        <h1 className="font-display text-4xl text-clara-rosa mb-2">Ops!</h1>
        <p className="text-gray-500 mb-8">Esta página não existe ou foi removida.</p>
        <div className="flex gap-3">
          <Link href="/" className="bg-clara-rosa text-white font-semibold px-6 py-3 rounded-2xl hover:brightness-95 transition-all">
            Ir para a home
          </Link>
          <Link href="/catalogo" className="border-2 border-clara-rosa text-clara-rosa font-semibold px-6 py-3 rounded-2xl hover:bg-clara-rosa/5 transition-all">
            Ver catálogo
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
