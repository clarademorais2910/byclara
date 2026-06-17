'use client'
import { useState } from 'react'
import { Shuffle, Trash2, ShoppingBag, MessageCircle, Check, Plus, Minus } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import toast from 'react-hot-toast'

/* ─── types ─── */
type BeadType = 'round-sm' | 'round-lg' | 'star' | 'letter' | 'empty'
interface Bead { type: BeadType; color: string; letter?: string }
type Tool = BeadType | 'eraser'

/* ─── constants ─── */
const N = 24 // bead slots
const CX = 200, CY = 116, RX = 158, RY = 68

const PALETTE = [
  { hex: '#F9A8D4', name: 'Rosa'      }, { hex: '#EC4899', name: 'Pink'      },
  { hex: '#EF4444', name: 'Vermelho'  }, { hex: '#F97316', name: 'Laranja'   },
  { hex: '#FBBF24', name: 'Amarelo'   }, { hex: '#A3E635', name: 'Lima'      },
  { hex: '#4ADE80', name: 'Verde'     }, { hex: '#34D399', name: 'Turquesa'  },
  { hex: '#60A5FA', name: 'Azul'      }, { hex: '#818CF8', name: 'Lilás'     },
  { hex: '#C4B5FD', name: 'Lavanda'   }, { hex: '#F0ABFC', name: 'Orquídea'  },
  { hex: '#FDE68A', name: 'Champagne' }, { hex: '#D4A373', name: 'Caramelo'  },
  { hex: '#BAE6FD', name: 'Céu'       }, { hex: '#FBCFE8', name: 'Blush'     },
  { hex: '#C084FC', name: 'Roxo'      }, { hex: '#D1D5DB', name: 'Cinza'     },
  { hex: '#FFFFFF', name: 'Branco'    }, { hex: '#1C1917', name: 'Preto'     },
]

const SIZES = [
  { v: '14 cm', d: 'Infantil' }, { v: '15 cm', d: 'Fino'    },
  { v: '16 cm', d: 'Padrão'   }, { v: '17 cm', d: 'Médio'   },
  { v: '18 cm', d: 'Largo'    }, { v: '19 cm', d: 'Extra'   },
]

const LETTERS = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789♥★']

const TEMPLATES: { name: string; fn: () => Bead[] }[] = [
  { name: '🌈 Arco-íris', fn: () => {
    const cs = ['#EF4444','#F97316','#FBBF24','#4ADE80','#60A5FA','#818CF8']
    return Array.from({ length: N }, (_, i) => ({ type: 'round-sm', color: cs[i % cs.length] }))
  }},
  { name: '🌸 Pastel', fn: () => {
    const cs = ['#F9A8D4','#C4B5FD','#BAE6FD','#FBCFE8','#FDE68A','#D1FAE5']
    return Array.from({ length: N }, (_, i) => ({ type: 'round-sm', color: cs[i % cs.length] }))
  }},
  { name: '🖤 Preta e dourada', fn: () =>
    Array.from({ length: N }, (_, i) => ({ type: i % 4 === 2 ? 'star' as BeadType : 'round-sm' as BeadType, color: i % 4 === 2 ? '#FBBF24' : '#1C1917' }))
  },
]

/* ─── SVG helpers ─── */
function pos(i: number) {
  const a = (2 * Math.PI * i) / N - Math.PI / 2
  return { x: CX + RX * Math.cos(a), y: CY + RY * Math.sin(a) }
}
function star(cx: number, cy: number, or: number, ir: number) {
  return Array.from({ length: 10 }, (_, i) => {
    const a = (i * Math.PI) / 5 - Math.PI / 2
    const r = i % 2 === 0 ? or : ir
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`
  }).join(' ')
}
function dark(hex: string) {
  const [r, g, b] = [1,3,5].map(o => parseInt(hex.slice(o, o+2), 16))
  return (r*299 + g*587 + b*114) / 1000 < 145
}
const SORTED = Array.from({ length: N }, (_, i) => i).sort((a, b) => pos(a).y - pos(b).y)

/* ─── single bead renderer ─── */
function Bead({ bead, i, onClick }: { bead: Bead; i: number; onClick: () => void }) {
  const { x, y } = pos(i)

  if (bead.type === 'empty') return (
    <circle cx={x} cy={y} r={13} fill="#F3F4F6" stroke="#D1D5DB"
      strokeWidth="1.5" strokeDasharray="3 2" onClick={onClick} style={{ cursor: 'pointer' }} />
  )

  const isSm = bead.type === 'round-sm'
  const isLg = bead.type === 'round-lg'
  const r    = isLg ? 17 : isSm ? 11 : 13

  if (bead.type === 'star') return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      <polygon points={star(x, y, 15, 6.5)} fill={bead.color} stroke="rgba(0,0,0,0.12)" strokeWidth="0.8" />
      <polygon points={star(x - 1.5, y - 2, 5.5, 2.4)} fill="rgba(255,255,255,0.45)" />
    </g>
  )

  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      <circle cx={x} cy={y} r={r} fill={bead.color} stroke="rgba(0,0,0,0.10)" strokeWidth="1" />
      <circle cx={x - r*0.28} cy={y - r*0.32} r={r*0.27} fill="rgba(255,255,255,0.50)" />
      {bead.type === 'letter' && bead.letter && (
        <text x={x} y={y + 4.5} textAnchor="middle" fontSize="11"
          fontFamily="Arial, sans-serif" fontWeight="800"
          fill={dark(bead.color) ? '#FFFFFF' : '#1C1917'}>
          {bead.letter}
        </text>
      )}
    </g>
  )
}

/* ─── main component ─── */
const EMPTY = (): Bead => ({ type: 'empty', color: '#F9A8D4' })
const DEFAULT_BEADS = (): Bead[] => Array.from({ length: N }, EMPTY)

export default function BraceletBuilder() {
  const [beads,    setBeads]   = useState<Bead[]>(DEFAULT_BEADS)
  const [tool,     setTool]    = useState<Tool>('round-sm')
  const [color,    setColor]   = useState('#F9A8D4')
  const [letter,   setLetter]  = useState('A')
  const [nameInput,setName]    = useState('')
  const [size,     setSize]    = useState('16 cm')
  const [qty,      setQty]     = useState(1)
  const [added,    setAdded]   = useState(false)
  const addItem = useCartStore(s => s.addItem)

  /* ─── click bead ─── */
  function clickBead(i: number) {
    setBeads(bs => {
      const next = [...bs]
      if (tool === 'eraser') {
        next[i] = EMPTY()
      } else {
        next[i] = {
          type: tool as BeadType,
          color,
          letter: tool === 'letter' ? letter : undefined,
        }
      }
      return next
    })
  }

  /* ─── helpers ─── */
  function insertName() {
    if (!nameInput.trim()) return
    const letters = nameInput.toUpperCase().replace(/[^A-Z0-9♥★]/g, '').split('')
    setBeads(bs => {
      const next = [...bs]
      let slot = 0
      for (const l of letters) {
        while (slot < N && next[slot].type !== 'empty') slot++
        if (slot >= N) break
        next[slot] = { type: 'letter', color, letter: l }
        slot++
      }
      return next
    })
  }

  function randomize() {
    setBeads(Array.from({ length: N }, () => ({
      type: (['round-sm', 'round-sm', 'round-sm', 'round-lg', 'star'] as BeadType[])[Math.floor(Math.random() * 5)],
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)].hex,
    })))
  }

  /* ─── cart / WhatsApp ─── */
  function buildSummary() {
    const filled = beads.filter(b => b.type !== 'empty')
    const hexes  = [...new Set(filled.map(b => b.color))]
    const names  = hexes.map(h => PALETTE.find(p => p.hex === h)?.name ?? h)
    const letters = beads.filter(b => b.type === 'letter').map(b => b.letter).join('')
    return { filled: filled.length, hexes, names, letters }
  }

  function addToCart() {
    const { hexes, letters } = buildSummary()
    addItem({
      id: `custom-${Date.now()}`,
      productId: 'custom',
      name: letters ? `Pulseira "${letters}"` : 'Pulseira Personalizada',
      price: 39.90,
      image: '',
      weightGrams: 14,
      quantity: qty,
      personalizacao: {
        nomePersonalizado: letters || undefined,
        coresEscolhidas: hexes,
      },
    })
    setAdded(true)
    toast.success(qty > 1 ? `${qty} pulseiras adicionadas! 🌸` : 'Pulseira adicionada ao carrinho! 🌸')
    setTimeout(() => setAdded(false), 3000)
  }

  function openWhatsApp() {
    const { names, letters } = buildSummary()
    const typeMap: Record<string, string> = { 'round-sm':'bolinha P','round-lg':'bolinha G','star':'estrela','letter':'letra' }
    const types = [...new Set(beads.filter(b=>b.type!=='empty').map(b=>b.type))]
      .map(t => typeMap[t])
      .join(', ')
    const msg = [
      'Olá Clara! Montei minha pulseira personalizada:',
      `Tamanho: ${size}`,
      `Tipos: ${types}`,
      `Cores: ${names.join(', ')}`,
      letters ? `Nome: ${letters}` : null,
      qty > 1 ? `Quantidade: ${qty} unidades` : null,
      'Quero encomendar! 🌸',
    ].filter(Boolean).join('\n')
    window.open(`https://wa.me/5562996394315?text=${encodeURIComponent(msg)}`, '_blank')
  }

  /* ─── tab config ─── */
  const TABS: { key: Tool; label: string; emoji: string }[] = [
    { key: 'round-sm', label: 'Bolinha P', emoji: '🔵' },
    { key: 'round-lg', label: 'Bolinha G', emoji: '⬤'  },
    { key: 'star',     label: 'Estrela',   emoji: '⭐'  },
    { key: 'letter',   label: 'Letra',     emoji: '🔤'  },
    { key: 'eraser',   label: 'Apagar',    emoji: '🩹'  },
  ]

  const { filled, hexes } = buildSummary()
  const price = (39.90 * qty).toFixed(2).replace('.', ',')

  return (
    <div className="space-y-4">

      {/* ── SVG bracelet ── */}
      <div className="bg-white rounded-card shadow-card p-4">
        <svg viewBox="0 0 400 232" className="w-full max-w-sm mx-auto block select-none" style={{ touchAction: 'none' }}>
          <defs>
            <filter id="bs">
              <feDropShadow dx="0" dy="1.5" stdDeviation="1.8" floodOpacity="0.15" />
            </filter>
          </defs>
          {/* cord */}
          <ellipse cx={CX} cy={CY} rx={RX} ry={RY} fill="none" stroke="#C4A882" strokeWidth="5" />
          {/* beads back→front */}
          {SORTED.map(i => (
            <g key={i} filter="url(#bs)">
              <Bead bead={beads[i]} i={i} onClick={() => clickBead(i)} />
            </g>
          ))}
        </svg>

        {/* quick actions */}
        <div className="flex gap-2 justify-center mt-3 flex-wrap">
          {TEMPLATES.map(t => (
            <button key={t.name} onClick={() => setBeads(t.fn())}
              className="text-xs border border-gray-200 hover:border-clara-rosa text-gray-500 hover:text-clara-rosa px-3 py-1.5 rounded-xl transition-all">
              {t.name}
            </button>
          ))}
          <button onClick={randomize}
            className="flex items-center gap-1 text-xs border border-gray-200 hover:border-clara-rosa text-gray-500 hover:text-clara-rosa px-3 py-1.5 rounded-xl transition-all">
            <Shuffle size={11} /> Aleatório
          </button>
          <button onClick={() => setBeads(DEFAULT_BEADS())}
            className="flex items-center gap-1 text-xs border border-gray-200 hover:border-red-300 text-gray-400 hover:text-red-400 px-3 py-1.5 rounded-xl transition-all">
            <Trash2 size={11} /> Limpar
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-2">
          {filled}/{N} contas · clique para {tool === 'eraser' ? 'apagar' : 'colorir'}
        </p>
      </div>

      {/* ── bead type tabs ── */}
      <div className="bg-white rounded-card shadow-card p-4">
        <div className="flex gap-2 flex-wrap mb-4">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTool(t.key)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all border ${
                tool === t.key
                  ? t.key === 'eraser'
                    ? 'bg-red-50 border-red-300 text-red-600'
                    : 'bg-clara-rosa/10 border-clara-rosa text-clara-rosa'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}>
              <span>{t.emoji}</span> {t.label}
            </button>
          ))}
        </div>

        {tool !== 'eraser' && (
          <>
            {/* letter grid */}
            {tool === 'letter' && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Selecione a letra</p>
                <div className="grid grid-cols-9 gap-1.5 mb-3">
                  {LETTERS.map(l => (
                    <button key={l} onClick={() => setLetter(l)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all border ${
                        letter === l
                          ? 'bg-clara-rosa text-white border-clara-rosa scale-110'
                          : 'border-gray-200 text-gray-600 hover:border-clara-rosa'
                      }`}>
                      {l}
                    </button>
                  ))}
                </div>

                {/* auto-fill name */}
                <div className="flex gap-2">
                  <input
                    value={nameInput}
                    onChange={e => setName(e.target.value.slice(0, 12))}
                    onKeyDown={e => e.key === 'Enter' && insertName()}
                    placeholder="Inserir nome automático…"
                    className="flex-1 border-2 border-gray-200 focus:border-clara-rosa rounded-xl px-3 py-2 text-sm outline-none transition-colors"
                  />
                  <button onClick={insertName}
                    className="bg-clara-rosa text-white text-xs font-semibold px-3 py-2 rounded-xl hover:brightness-95 transition-all whitespace-nowrap">
                    Inserir
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">Clica "Inserir" para colocar as letras nas contas vazias</p>
              </div>
            )}

            {/* color palette */}
            <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
              {tool === 'letter' ? 'Cor da conta de letra' : 'Cor'}
            </p>
            <div className="grid grid-cols-10 gap-1.5">
              {PALETTE.map(p => (
                <button key={p.hex} title={p.name} onClick={() => setColor(p.hex)}
                  className={`w-7 h-7 rounded-full transition-all hover:scale-110 ${
                    color === p.hex ? 'ring-2 ring-offset-1 ring-clara-rosa scale-110 shadow' : 'ring-1 ring-black/10'
                  }`}
                  style={{ backgroundColor: p.hex }} />
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2.5">
              <div className="w-5 h-5 rounded-full ring-1 ring-black/10" style={{ backgroundColor: color }} />
              <p className="text-xs text-gray-500">
                <strong>{PALETTE.find(p => p.hex === color)?.name}</strong>
                {tool === 'letter' && <> · Letra: <strong>{letter}</strong></>}
                {' '}· clique nas contas para aplicar
              </p>
            </div>
          </>
        )}

        {tool === 'eraser' && (
          <p className="text-sm text-red-400 text-center py-4">
            🩹 Modo apagar ativo — clique em qualquer conta para removê-la
          </p>
        )}
      </div>

      {/* ── size + quantity ── */}
      <div className="bg-white rounded-card shadow-card p-4 space-y-4">

        <div>
          <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Tamanho da pulseira</p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {SIZES.map(s => (
              <button key={s.v} onClick={() => setSize(s.v)}
                className={`flex flex-col items-center py-2 px-1 rounded-xl border text-xs font-semibold transition-all ${
                  size === s.v
                    ? 'bg-clara-rosa/10 border-clara-rosa text-clara-rosa'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}>
                <span>{s.v}</span>
                <span className="font-normal text-gray-400">{s.d}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Quantidade</p>
          <div className="flex items-center gap-4">
            <button onClick={() => setQty(q => Math.max(1, q - 1))}
              className="w-9 h-9 rounded-full border-2 border-gray-200 hover:border-clara-rosa flex items-center justify-center transition-all">
              <Minus size={14} />
            </button>
            <span className="text-xl font-display text-clara-texto w-6 text-center">{qty}</span>
            <button onClick={() => setQty(q => Math.min(10, q + 1))}
              className="w-9 h-9 rounded-full border-2 border-gray-200 hover:border-clara-rosa flex items-center justify-center transition-all">
              <Plus size={14} />
            </button>
            <span className="text-sm text-gray-400">{qty > 1 ? `${qty} pulseiras` : '1 pulseira'}</span>
          </div>
        </div>
      </div>

      {/* ── summary ── */}
      {hexes.length > 0 && (
        <div className="bg-clara-fundo rounded-2xl px-4 py-3 flex items-center gap-3">
          <div className="flex gap-1 flex-wrap">
            {hexes.map(h => (
              <div key={h} className="w-4 h-4 rounded-full ring-1 ring-black/10" style={{ backgroundColor: h }} />
            ))}
          </div>
          <p className="text-xs text-gray-500 flex-1">
            {filled} contas · {hexes.length} cores · {size}
          </p>
          <p className="text-sm font-display text-clara-rosa font-semibold">
            R$&nbsp;{price}
          </p>
        </div>
      )}

      {/* ── CTAs ── */}
      <div className="flex flex-col sm:flex-row gap-3 pt-1">
        <button onClick={addToCart}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm shadow-md transition-all active:scale-95 ${
            added ? 'bg-green-500 text-white' : 'bg-clara-rosa text-white hover:brightness-95'
          }`}>
          {added
            ? <><Check size={16} /> {qty > 1 ? `${qty} adicionadas!` : 'Adicionada!'}</>
            : <><ShoppingBag size={16} /> Adicionar ao carrinho — R$&nbsp;{price}</>}
        </button>
        <button onClick={openWhatsApp}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm bg-green-500 hover:bg-green-600 text-white transition-colors active:scale-95">
          <MessageCircle size={16} /> Encomendar pelo WhatsApp
        </button>
      </div>

      <p className="text-center text-xs text-gray-400 pb-2">
        R$&nbsp;39,90 por unidade · produção artesanal em até 3 dias úteis
      </p>
    </div>
  )
}
