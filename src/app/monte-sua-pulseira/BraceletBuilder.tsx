'use client'
import { useState, useCallback } from 'react'
import { Shuffle, Trash2, ShoppingBag, MessageCircle, Check, PaintBucket } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import toast from 'react-hot-toast'

const BEAD_COUNT = 20
const CX = 200, CY = 118, RX = 152, RY = 66, BR = 15

const PALETTE = [
  { hex: '#F9A8D4', name: 'Rosa' },
  { hex: '#EC4899', name: 'Pink' },
  { hex: '#EF4444', name: 'Vermelho' },
  { hex: '#F97316', name: 'Laranja' },
  { hex: '#FBBF24', name: 'Amarelo' },
  { hex: '#A3E635', name: 'Lima' },
  { hex: '#4ADE80', name: 'Verde' },
  { hex: '#34D399', name: 'Turquesa' },
  { hex: '#60A5FA', name: 'Azul' },
  { hex: '#818CF8', name: 'Lilás' },
  { hex: '#C4B5FD', name: 'Lavanda' },
  { hex: '#F0ABFC', name: 'Orquídea' },
  { hex: '#FDE68A', name: 'Champagne' },
  { hex: '#D4A373', name: 'Caramelo' },
  { hex: '#BAE6FD', name: 'Céu' },
  { hex: '#FBCFE8', name: 'Blush' },
  { hex: '#D1D5DB', name: 'Cinza' },
  { hex: '#FFFFFF', name: 'Branco' },
]

const POSITIONS = Array.from({ length: BEAD_COUNT }, (_, i) => {
  const angle = (2 * Math.PI * i) / BEAD_COUNT - Math.PI / 2
  return { x: CX + RX * Math.cos(angle), y: CY + RY * Math.sin(angle) }
})

// Render back-to-front for pseudo-3D depth
const SORTED = Array.from({ length: BEAD_COUNT }, (_, i) => i)
  .sort((a, b) => POSITIONS[a].y - POSITIONS[b].y)

const DEFAULT = () => Array(BEAD_COUNT).fill('#F9A8D4')

export default function BraceletBuilder() {
  const [colors, setColors]   = useState<string[]>(DEFAULT)
  const [selected, setSelected] = useState('#F9A8D4')
  const [name, setName]       = useState('')
  const [added, setAdded]     = useState(false)
  const addItem = useCartStore(s => s.addItem)

  const paint = useCallback((i: number) => {
    setColors(c => c.map((col, idx) => idx === i ? selected : col))
  }, [selected])

  const fillAll  = () => setColors(Array(BEAD_COUNT).fill(selected))
  const clearAll = () => setColors(DEFAULT())
  const randomize = () =>
    setColors(Array.from({ length: BEAD_COUNT }, () =>
      PALETTE[Math.floor(Math.random() * PALETTE.length)].hex
    ))

  const colorNames = () =>
    [...new Set(colors)].map(hex => PALETTE.find(p => p.hex === hex)?.name ?? hex)

  const addToCart = () => {
    addItem({
      id: 'custom-' + Date.now(),
      productId: 'custom',
      name: name.trim() ? `Pulseira "${name.trim()}"` : 'Pulseira Personalizada',
      price: 39.90,
      image: '',
      weightGrams: 14,
      quantity: 1,
      personalizacao: {
        nomePersonalizado: name.trim() || undefined,
        coresEscolhidas: colorNames(),
      },
    })
    setAdded(true)
    toast.success('Pulseira adicionada ao carrinho! 🌸')
    setTimeout(() => setAdded(false), 3000)
  }

  const openWhatsApp = () => {
    const msg = [
      'Olá Clara! Montei minha pulseira personalizada:',
      `Cores: ${colorNames().join(', ')}`,
      name.trim() ? `Nome: ${name.trim()}` : null,
      'Quero encomendar! 🌸',
    ].filter(Boolean).join('\n')
    window.open(`https://wa.me/5562996394315?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const selectedName = PALETTE.find(p => p.hex === selected)?.name ?? ''

  return (
    <div className="space-y-4">

      {/* SVG bracelet */}
      <div className="bg-white rounded-card shadow-card p-4">
        <svg
          viewBox="0 0 400 236"
          className="w-full max-w-sm mx-auto block select-none"
          style={{ touchAction: 'none' }}
        >
          <defs>
            <filter id="bead-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodOpacity="0.18" />
            </filter>
          </defs>

          {/* Cord */}
          <ellipse
            cx={CX} cy={CY} rx={RX} ry={RY}
            fill="none" stroke="#C4A882" strokeWidth="5"
          />

          {/* Beads — back to front */}
          {SORTED.map(i => {
            const { x, y } = POSITIONS[i]
            return (
              <g key={i} onClick={() => paint(i)} style={{ cursor: 'pointer' }} filter="url(#bead-shadow)">
                <circle cx={x} cy={y} r={BR} fill={colors[i]} stroke="rgba(0,0,0,0.10)" strokeWidth="1" />
                {/* shine */}
                <circle cx={x - BR * 0.28} cy={y - BR * 0.32} r={BR * 0.26} fill="rgba(255,255,255,0.50)" />
              </g>
            )
          })}

          {/* Name tag */}
          {name.trim() && (
            <g>
              <rect
                x={CX - 44} y={CY - 14}
                width={88} height={28} rx={14}
                fill="white" stroke="#F9A8D4" strokeWidth="1.5"
              />
              <text
                x={CX} y={CY + 6}
                textAnchor="middle"
                fill="#1C1917" fontSize="11.5"
                fontFamily="Arial, sans-serif" fontWeight="700"
              >
                {name.trim().slice(0, 10)}
              </text>
            </g>
          )}
        </svg>

        {/* Quick actions */}
        <div className="flex gap-2 justify-center mt-3 flex-wrap">
          <button
            onClick={fillAll}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-clara-rosa border border-gray-200 hover:border-clara-rosa px-3 py-1.5 rounded-xl transition-all"
          >
            <PaintBucket size={11} /> Preencher tudo
          </button>
          <button
            onClick={randomize}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-clara-rosa border border-gray-200 hover:border-clara-rosa px-3 py-1.5 rounded-xl transition-all"
          >
            <Shuffle size={11} /> Aleatório
          </button>
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-400 border border-gray-200 hover:border-red-300 px-3 py-1.5 rounded-xl transition-all"
          >
            <Trash2 size={11} /> Limpar
          </button>
        </div>
      </div>

      {/* Palette */}
      <div className="bg-white rounded-card shadow-card p-4">
        <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide">
          Paleta de cores — clique numa conta para colorir
        </p>
        <div className="grid grid-cols-9 gap-2">
          {PALETTE.map(p => (
            <button
              key={p.hex}
              title={p.name}
              onClick={() => setSelected(p.hex)}
              className={`w-8 h-8 rounded-full transition-all hover:scale-110 ${
                selected === p.hex
                  ? 'ring-2 ring-offset-1 ring-clara-rosa scale-110 shadow-md'
                  : 'ring-1 ring-black/10'
              }`}
              style={{ backgroundColor: p.hex }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-3">
          <div
            className="w-5 h-5 rounded-full ring-1 ring-black/10 flex-shrink-0"
            style={{ backgroundColor: selected }}
          />
          <p className="text-xs text-gray-500">
            <strong>{selectedName}</strong> selecionada · clique nas contas para colorir
          </p>
        </div>
      </div>

      {/* Name input */}
      <div className="bg-white rounded-card shadow-card p-4">
        <label className="text-xs font-semibold text-gray-400 block mb-2 uppercase tracking-wide">
          Nome personalizado <span className="font-normal normal-case">(opcional)</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value.slice(0, 10))}
          placeholder="Ex: Ana, Amor, BFF…"
          className="w-full border-2 border-gray-200 focus:border-clara-rosa rounded-2xl px-4 py-2.5 text-sm outline-none transition-colors"
          maxLength={10}
        />
        <p className="text-xs text-gray-400 mt-1">{name.length}/10 caracteres · aparece no centro da pulseira</p>
      </div>

      {/* Summary */}
      {[...new Set(colors)].length > 1 && (
        <div className="bg-clara-fundo rounded-2xl px-4 py-3 flex items-center gap-3">
          <div className="flex gap-1 flex-wrap">
            {[...new Set(colors)].map(hex => (
              <div key={hex} className="w-4 h-4 rounded-full ring-1 ring-black/10" style={{ backgroundColor: hex }} />
            ))}
          </div>
          <p className="text-xs text-gray-500">
            {[...new Set(colors)].length} cores · {colorNames().join(', ')}
          </p>
        </div>
      )}

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3 pt-1">
        <button
          onClick={addToCart}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm shadow-md transition-all ${
            added
              ? 'bg-green-500 text-white'
              : 'bg-clara-rosa text-white hover:brightness-95 active:scale-95'
          }`}
        >
          {added
            ? <><Check size={16} /> Adicionado ao carrinho!</>
            : <><ShoppingBag size={16} /> Adicionar ao carrinho</>}
        </button>
        <button
          onClick={openWhatsApp}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm bg-green-500 hover:bg-green-600 text-white transition-colors active:scale-95"
        >
          <MessageCircle size={16} /> Encomendar pelo WhatsApp
        </button>
      </div>

      <p className="text-center text-xs text-gray-400 pb-2">
        Pulseira personalizada · R$&nbsp;39,90 · produção em até 3 dias úteis
      </p>
    </div>
  )
}
