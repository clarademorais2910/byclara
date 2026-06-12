'use client'
import { useState } from 'react'
import Image from 'next/image'

interface Props {
  images: string[]
  name: string
}

export default function ImageGallery({ images, name }: Props) {
  const [selected, setSelected] = useState(0)

  return (
    <div className="space-y-3">
      {/* Imagem principal */}
      <div className="relative w-full aspect-square rounded-card overflow-hidden bg-gradient-to-br from-clara-rosa/10 to-clara-lavanda/10">
        {images[selected] ? (
          <Image
            src={images[selected]}
            alt={name}
            fill
            className="object-cover transition-opacity duration-300"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-8xl">🌸</span>
          </div>
        )}
      </div>

      {/* Miniaturas */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`relative aspect-square rounded-xl overflow-hidden transition-all ${
                i === selected
                  ? 'ring-2 ring-clara-rosa ring-offset-2'
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              <Image src={img} alt={`${name} ${i + 1}`} fill className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
