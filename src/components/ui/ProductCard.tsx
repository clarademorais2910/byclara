'use client'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag, Sparkles } from 'lucide-react'

interface ProductCardProps {
  id: string
  name: string
  price: number
  image: string
  colors?: string[]
  allowCustomName?: boolean
  featured?: boolean
}

export default function ProductCard({
  id, name, price, image, colors = [], allowCustomName, featured,
}: ProductCardProps) {
  return (
    <Link href={`/produto/${id}`}>
      <div className="group relative bg-white rounded-card shadow-card hover:shadow-hover transition-all duration-300 overflow-hidden cursor-pointer hover:-translate-y-1">

        {featured && (
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-clara-amarelo text-clara-texto text-xs font-semibold px-3 py-1 rounded-full">
            <Sparkles size={12} />
            Destaque
          </div>
        )}

        {allowCustomName && (
          <div className="absolute top-3 right-3 z-10 bg-clara-lavanda text-white text-xs font-semibold px-3 py-1 rounded-full">
            Personaliza!
          </div>
        )}

        <div className="relative w-full aspect-square overflow-hidden bg-gradient-to-br from-clara-rosa/10 to-clara-lavanda/10">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl">🌸</span>
            </div>
          )}
        </div>

        <div className="p-3 space-y-2">
          <h3 className="font-semibold text-sm text-clara-texto line-clamp-2 leading-snug">
            {name}
          </h3>

          {colors.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {colors.slice(0, 6).map(color => (
                <div
                  key={color}
                  className="w-4 h-4 rounded-full border border-white shadow-sm ring-1 ring-black/10"
                  style={{ backgroundColor: color }}
                />
              ))}
              {colors.length > 6 && (
                <span className="text-xs text-gray-400 self-center">+{colors.length - 6}</span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <span className="font-display text-clara-rosa text-lg">
              R$ {price.toFixed(2).replace('.', ',')}
            </span>
            <div className="w-8 h-8 flex items-center justify-center bg-clara-rosa/10 rounded-xl group-hover:bg-clara-rosa transition-colors">
              <ShoppingBag size={16} className="text-clara-rosa group-hover:text-white" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
