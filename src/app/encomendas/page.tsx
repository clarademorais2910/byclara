import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { MessageCircle, Palette, Clock, Heart, CheckCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Encomendas — By Clara',
  description: 'Faça sua pulseira personalizada! Escolha as cores, adicione um nome e receba uma peça única feita com amor.',
}

const steps = [
  {
    icon: MessageCircle,
    title: 'Entre em contato',
    desc: 'Manda mensagem no WhatsApp contando o que você quer — cores, nome, estilo, quantidade.',
  },
  {
    icon: Palette,
    title: 'Escolha as cores',
    desc: 'Juntas vamos montar a combinação perfeita de miçangas para a sua pulseira.',
  },
  {
    icon: Heart,
    title: 'Feita com amor',
    desc: 'Cada pulseira é produzida artesanalmente. Prazo de até 3 dias úteis após o pagamento.',
  },
  {
    icon: CheckCircle,
    title: 'Entrega garantida',
    desc: 'Entrego em mãos em Itaberaí ou envio para todo o Brasil pelos Correios.',
  },
]

const options = [
  { emoji: '✏️', title: 'Nome personalizado', desc: 'Coloco o nome que você quiser na pulseira — seu nome, o da pessoa amada, uma palavra especial.' },
  { emoji: '🎨', title: 'Cores à escolha', desc: 'Escolha as cores das miçangas do jeito que quiser. Qualquer combinação é possível!' },
  { emoji: '📏', title: 'Tamanho ajustável', desc: 'Todas as pulseiras são ajustáveis e servem em diferentes tamanhos de pulso.' },
  { emoji: '🎁', title: 'Kit presente', desc: 'Monte um kit com 2, 3 ou mais pulseiras para dar de presente. Incluo embalagem especial!' },
]

export default function EncomendasPage() {
  const whatsapp = 'https://wa.me/5562996394315?text=Olá%20Clara!%20Quero%20fazer%20uma%20encomenda%20de%20pulseira%20personalizada%20🌸'

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">

        {/* Hero */}
        <section className="bg-gradient-to-br from-clara-rosa/10 to-clara-lavanda/10 py-14 px-4 text-center">
          <p className="text-4xl mb-4">🌸</p>
          <h1 className="font-display text-3xl md:text-4xl text-clara-rosa mb-3">
            Pulseira do jeito que você quer
          </h1>
          <p className="text-gray-500 max-w-md mx-auto text-sm leading-relaxed mb-8">
            Faço pulseiras de miçangas 100% personalizadas — nome, cores e estilo escolhidos por você.
            Cada peça é única e feita com muito carinho!
          </p>
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-7 py-3.5 rounded-2xl transition-colors shadow-md text-sm"
          >
            <MessageCircle size={18} />
            Fazer encomenda pelo WhatsApp
          </a>
        </section>

        {/* O que posso personalizar */}
        <section className="max-w-5xl mx-auto px-4 py-12">
          <h2 className="font-display text-2xl text-clara-rosa text-center mb-8">
            O que você pode personalizar?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {options.map(o => (
              <div key={o.title} className="bg-white rounded-card shadow-card p-5 flex gap-4 items-start">
                <span className="text-2xl">{o.emoji}</span>
                <div>
                  <h3 className="font-semibold text-clara-texto mb-1">{o.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{o.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Como funciona */}
        <section className="bg-white py-12 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-display text-2xl text-clara-rosa text-center mb-8">
              Como funciona?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {steps.map((step, i) => (
                <div key={step.title} className="flex flex-col items-center text-center gap-3 p-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-clara-rosa/10 flex items-center justify-center">
                      <step.icon size={26} className="text-clara-rosa" />
                    </div>
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-clara-rosa text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="font-semibold text-clara-texto text-sm">{step.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Prazo e preços */}
        <section className="max-w-5xl mx-auto px-4 py-12">
          <div className="bg-gradient-to-r from-clara-rosa/10 to-clara-lavanda/10 rounded-card p-8 flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Clock size={16} className="text-clara-rosa flex-shrink-0" />
                <span><strong>Prazo:</strong> até 3 dias úteis após pagamento via Pix</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-clara-rosa flex-shrink-0">💰</span>
                <span><strong>Preços:</strong> a partir de R$ 29,90 — depende da personalização</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-clara-rosa flex-shrink-0">📦</span>
                <span><strong>Frete grátis</strong> para Itaberaí/GO · Correios para o resto do Brasil</span>
              </div>
            </div>
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-2xl transition-colors shadow-md text-sm"
            >
              <MessageCircle size={16} />
              Falar com a Clara
            </a>
          </div>
        </section>

        {/* CTA catálogo */}
        <section className="max-w-5xl mx-auto px-4 pb-12 text-center">
          <p className="text-gray-400 text-sm mb-3">Prefere escolher um modelo pronto?</p>
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 border-2 border-clara-rosa text-clara-rosa font-semibold px-6 py-2.5 rounded-2xl hover:bg-clara-rosa/5 transition-all text-sm"
          >
            Ver catálogo
          </Link>
        </section>

      </main>

      <Footer />
    </div>
  )
}
