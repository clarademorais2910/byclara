'use client'
import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Banner {
  id: string
  image_url: string
  title?: string
  subtitle?: string
  link?: string
}

interface BannerSliderProps {
  banners: Banner[]
}

// Banner padrão quando não há nenhum cadastrado
const DEFAULT_BANNERS = [
  {
    id: 'default-1',
    gradient: 'from-clara-rosa via-clara-lavanda to-clara-azul',
    title: 'Pulseiras feitas com amor ✨',
    subtitle: 'Miçangas artesanais e personalizadas',
    link: '/catalogo',
    cta: 'Ver catálogo',
  },
  {
    id: 'default-2',
    gradient: 'from-clara-amarelo via-clara-turquesa to-clara-azul',
    title: 'Personalize a sua! 🌸',
    subtitle: 'Escolha as cores e coloque seu nome',
    link: '/catalogo',
    cta: 'Encomendar',
  },
  {
    id: 'default-3',
    gradient: 'from-clara-coral via-clara-rosa to-clara-lavanda',
    title: 'Presente perfeito 🎁',
    subtitle: 'Para toda ocasião especial',
    link: '/catalogo',
    cta: 'Ver produtos',
  },
]

export default function BannerSlider({ banners }: BannerSliderProps) {
  const [current, setCurrent] = useState(0)
  const hasRealBanners = banners.length > 0
  const slides = hasRealBanners ? banners : DEFAULT_BANNERS
  const total = slides.length

  const next = useCallback(() => setCurrent(c => (c + 1) % total), [total])
  const prev = () => setCurrent(c => (c - 1 + total) % total)

  useEffect(() => {
    const timer = setInterval(next, 4000)
    return () => clearInterval(timer)
  }, [next])

  return (
    <div className="relative w-full overflow-hidden rounded-b-3xl" style={{ height: 'clamp(220px, 45vw, 420px)' }}>

      {/* Slides */}
      <div
        className="flex h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {hasRealBanners
          ? banners.map(b => (
            <div key={b.id} className="relative flex-shrink-0 w-full h-full">
              <Image src={b.image_url} alt={b.title || 'Banner'} fill className="object-cover" priority />
              {(b.title || b.subtitle) && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex flex-col justify-end p-6 md:p-10">
                  {b.title && <h2 className="font-display text-white text-2xl md:text-4xl drop-shadow">{b.title}</h2>}
                  {b.subtitle && <p className="font-body text-white/90 text-sm md:text-lg mt-1">{b.subtitle}</p>}
                  {b.link && (
                    <Link href={b.link} className="mt-4 self-start bg-white text-clara-rosa font-semibold px-5 py-2 rounded-2xl text-sm hover:bg-clara-rosa hover:text-white transition-colors">
                      Ver mais
                    </Link>
                  )}
                </div>
              )}
            </div>
          ))
          : DEFAULT_BANNERS.map(b => (
            <div key={b.id} className={`flex-shrink-0 w-full h-full bg-gradient-to-br ${b.gradient} flex flex-col items-center justify-center text-center px-6`}>
              <h2 className="font-display text-white text-2xl md:text-4xl drop-shadow-md">{b.title}</h2>
              <p className="font-body text-white/90 text-sm md:text-lg mt-2 max-w-md">{b.subtitle}</p>
              <Link href={b.link} className="mt-6 bg-white text-clara-rosa font-semibold px-6 py-3 rounded-2xl text-sm hover:scale-105 transition-transform shadow-md">
                {b.cta}
              </Link>
            </div>
          ))
        }
      </div>

      {/* Controles (só aparece com mais de 1 slide) */}
      {total > 1 && (
        <>
          <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/70 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-colors">
            <ChevronLeft size={18} />
          </button>
          <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/70 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-colors">
            <ChevronRight size={18} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === current ? 'w-6 h-2.5 bg-white' : 'w-2.5 h-2.5 bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
