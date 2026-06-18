'use client'
import { useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import ProductCard from '@/components/ui/ProductCard'

interface Product {
  id: string
  name: string
  price: number
  images: string[]
  colors: string[]
  allow_custom_name: boolean
  featured: boolean
}

type Filtro = 'todos' | 'destaque' | 'personaliza'
type Ordem  = 'posicao' | 'menor' | 'maior'

export default function CatalogoClient({ products }: { products: Product[] }) {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const busca  = searchParams.get('q')  ?? ''
  const filtro = (searchParams.get('f') ?? 'todos') as Filtro
  const ordem  = (searchParams.get('o') ?? 'posicao') as Ordem

  function update(key: string, value: string) {
    const p = new URLSearchParams(searchParams.toString())
    if (value === '' || value === 'todos' || value === 'posicao') p.delete(key)
    else p.set(key, value)
    router.replace(`/catalogo${p.size ? `?${p}` : ''}`, { scroll: false })
  }

  const lista = useMemo(() => {
    let result = [...products]
    if (busca.trim()) {
      const q = busca.toLowerCase()
      result = result.filter(p => p.name.toLowerCase().includes(q))
    }
    if (filtro === 'destaque')    result = result.filter(p => p.featured)
    if (filtro === 'personaliza') result = result.filter(p => p.allow_custom_name)
    if (ordem === 'menor') result.sort((a, b) => a.price - b.price)
    if (ordem === 'maior') result.sort((a, b) => b.price - a.price)
    return result
  }, [products, busca, filtro, ordem])

  return (
    <div>
      {/* Busca e filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={busca}
            onChange={e => update('q', e.target.value)}
            placeholder="Buscar pulseira..."
            className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-200 focus:border-clara-rosa rounded-2xl text-sm outline-none transition-colors"
          />
        </div>

        <div className="flex gap-2">
          {(['todos', 'destaque', 'personaliza'] as Filtro[]).map(f => (
            <button key={f} onClick={() => update('f', f)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                filtro === f ? 'bg-clara-rosa text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-clara-rosa'
              }`}>
              {f === 'todos' ? 'Todos' : f === 'destaque' ? '⭐ Destaque' : '✏️ Personaliza'}
            </button>
          ))}
        </div>

        <select value={ordem} onChange={e => update('o', e.target.value)}
          className="border-2 border-gray-200 focus:border-clara-rosa rounded-2xl px-3 py-2 text-sm outline-none bg-white">
          <option value="posicao">Ordenar</option>
          <option value="menor">Menor preço</option>
          <option value="maior">Maior preço</option>
        </select>
      </div>

      {/* Contador */}
      <p className="text-sm text-gray-400 mb-4">
        {lista.length} produto{lista.length !== 1 ? 's' : ''}
        {busca && ` para "${busca}"`}
      </p>

      {/* Grid */}
      {lista.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-card shadow-soft">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-semibold text-clara-texto">Nenhum produto encontrado</p>
          <button onClick={() => { update('q', ''); update('f', 'todos') }}
            className="text-sm text-clara-rosa mt-2 hover:underline">
            Limpar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
          {lista.map(p => (
            <ProductCard key={p.id} id={p.id} name={p.name} price={p.price}
              image={p.images?.[0] ?? ''} colors={p.colors ?? []}
              allowCustomName={p.allow_custom_name} featured={p.featured} />
          ))}
        </div>
      )}
    </div>
  )
}
