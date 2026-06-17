import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center py-16">
        <div className="relative mb-6">
          <p className="text-8xl select-none">🌸</p>
          <span className="absolute -top-2 -right-4 bg-clara-rosa text-white text-xs font-bold px-2 py-1 rounded-full shadow">
            404
          </span>
        </div>

        <h1 className="font-display text-3xl md:text-4xl text-clara-rosa mb-3">
          Essa página sumiu!
        </h1>
        <p className="text-gray-500 max-w-sm mb-2">
          Parece que essa página não existe mais ou o link está errado.
        </p>
        <p className="text-gray-400 text-sm mb-10">
          Mas tem muita coisa linda te esperando no catálogo 🛍️
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/catalogo"
            className="bg-clara-rosa text-white font-semibold px-6 py-3 rounded-2xl hover:brightness-95 transition-all shadow-md"
          >
            Ver catálogo
          </Link>
          <Link
            href="/"
            className="border-2 border-clara-rosa text-clara-rosa font-semibold px-6 py-3 rounded-2xl hover:bg-clara-rosa/5 transition-all"
          >
            Ir para a home
          </Link>
          <a
            href="https://wa.me/5562996394315?text=Olá!%20Preciso%20de%20ajuda%20no%20site."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-green-500 text-white font-semibold px-6 py-3 rounded-2xl hover:bg-green-600 transition-all"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.855L.057 23.453a.75.75 0 0 0 .918.918l5.598-1.475A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.686-.528-5.208-1.443l-.374-.223-3.868 1.018 1.018-3.868-.223-.374A9.952 9.952 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
            Falar no WhatsApp
          </a>
        </div>
      </main>
      <Footer />
    </div>
  )
}
