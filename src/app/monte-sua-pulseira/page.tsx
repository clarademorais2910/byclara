import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import BraceletBuilder from './BraceletBuilder'

export const metadata: Metadata = {
  title: 'Monte sua Pulseira — By Clara',
  description: 'Crie sua pulseira de miçangas do jeito que você quer! Escolha as cores, adicione um nome e receba sua peça única feita à mão.',
}

export default function MonteSuaPulseira() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-8">
        <div className="text-center mb-7">
          <p className="text-4xl mb-3">🌸</p>
          <h1 className="font-display text-3xl text-clara-rosa">Monte sua pulseira</h1>
          <p className="text-sm text-gray-500 mt-1.5 max-w-xs mx-auto leading-relaxed">
            Escolha as cores das contas, adicione seu nome e crie uma peça única feita à mão para você!
          </p>
        </div>
        <BraceletBuilder />
      </main>
      <Footer />
    </div>
  )
}
