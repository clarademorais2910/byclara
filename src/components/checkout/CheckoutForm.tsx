'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cart'
import { formatPrice } from '@/lib/utils'
import { MapPin, User, Truck, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

function formatPhone(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2)  return d.length ? `(${d}` : ''
  if (d.length <= 6)  return d.replace(/^(\d{2})(\d+)$/, '($1) $2')
  if (d.length <= 10) return d.replace(/^(\d{2})(\d{4})(\d+)$/, '($1) $2-$3')
  return d.replace(/^(\d{2})(\d{5})(\d{0,4})$/, '($1) $2-$3')
}

type Step = 'dados' | 'entrega' | 'revisar'

interface Endereco {
  logradouro: string
  bairro: string
  cidade: string
  estado: string
}

interface OpcaoFrete {
  type: string
  label: string
  price: number
  prazo: string
}

const STEPS = [
  { key: 'dados',   label: 'Seus dados', icon: User },
  { key: 'entrega', label: 'Entrega',    icon: MapPin },
  { key: 'revisar', label: 'Pagamento',  icon: Truck },
] as const

export default function CheckoutForm() {
  const router = useRouter()
  const { items, subtotal, totalWeight, clearCart } = useCartStore()
  const [step, setStep] = useState<Step>('dados')
  const [loading, setLoading] = useState(false)
  const submitted = useRef(false)

  // Step 1 — dados pessoais
  const [nome, setNome]       = useState('')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail]     = useState('')

  // Step 2 — endereço
  const [cep, setCep]               = useState('')
  const [endereco, setEndereco]     = useState<Endereco | null>(null)
  const [numero, setNumero]         = useState('')
  const [complemento, setComplemento] = useState('')
  const [cepLoading, setCepLoading] = useState(false)
  const [freteOpcoes, setFreteOpcoes] = useState<OpcaoFrete[]>([])
  const [freteSelecionado, setFreteSelecionado] = useState<OpcaoFrete | null>(null)

  useEffect(() => {
    if (items.length === 0 && !submitted.current) router.replace('/catalogo')
  }, [items.length, router])

  if (items.length === 0) return null

  async function buscarCep(value: string) {
    const cleaned = value.replace(/\D/g, '')
    setCep(cleaned)
    if (cleaned.length !== 8) return
    setCepLoading(true)
    try {
      const res = await fetch('/api/frete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cep: cleaned, pesoTotalGramas: totalWeight() }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setEndereco(data.endereco)
      setFreteOpcoes(data.opcoes)
      setFreteSelecionado(data.opcoes[0] ?? null)
    } catch {
      toast.error('CEP não encontrado')
      setEndereco(null)
      setFreteOpcoes([])
    } finally {
      setCepLoading(false)
    }
  }

  async function handleSubmit() {
    if (!endereco || !freteSelecionado) return
    setLoading(true)
    try {
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name:  nome,
          customer_phone: telefone,
          customer_email: email || null,
          cep,
          logradouro:    endereco.logradouro,
          numero,
          complemento,
          bairro:        endereco.bairro,
          cidade:        endereco.cidade,
          estado:        endereco.estado,
          shipping_type:  freteSelecionado.type,
          shipping_price: freteSelecionado.price,
          shipping_label: freteSelecionado.label,
          items: items.map(i => ({
            productId: i.productId,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            personalizacao: i.personalizacao,
          })),
          subtotal: subtotal(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      submitted.current = true
      clearCart()
      router.push(`/pedido/${data.order.id}`)
    } catch {
      toast.error('Erro ao criar pedido. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const total = subtotal() + (freteSelecionado?.price ?? 0)

  return (
    <div className="max-w-lg mx-auto">
      {/* Step indicator */}
      <div className="flex items-center mb-8">
        {STEPS.map((s, i) => {
          const isActive   = s.key === step
          const isDone     = STEPS.findIndex(x => x.key === step) > i
          return (
            <div key={s.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  isDone ? 'bg-clara-turquesa text-white' :
                  isActive ? 'bg-clara-rosa text-white' :
                  'bg-gray-200 text-gray-400'
                }`}>
                  {isDone ? '✓' : i + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${isActive ? 'text-clara-rosa' : 'text-gray-400'}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${isDone ? 'bg-clara-turquesa' : 'bg-gray-200'}`} />
              )}
            </div>
          )
        })}
      </div>

      {/* STEP 1: Dados */}
      {step === 'dados' && (
        <div className="bg-white rounded-card shadow-card p-6 space-y-4">
          <h2 className="font-display text-xl text-clara-rosa">Seus dados</h2>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Nome completo *</label>
            <input value={nome} onChange={e => setNome(e.target.value)}
              className="w-full border-2 border-gray-200 focus:border-clara-rosa rounded-2xl px-4 py-3 text-sm outline-none transition-colors"
              placeholder="Maria da Silva" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">WhatsApp *</label>
            <input value={telefone} onChange={e => setTelefone(formatPhone(e.target.value))}
              className="w-full border-2 border-gray-200 focus:border-clara-rosa rounded-2xl px-4 py-3 text-sm outline-none transition-colors"
              placeholder="(62) 99999-9999" type="tel" inputMode="numeric" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">E-mail (opcional)</label>
            <input value={email} onChange={e => setEmail(e.target.value)}
              className="w-full border-2 border-gray-200 focus:border-clara-rosa rounded-2xl px-4 py-3 text-sm outline-none transition-colors"
              placeholder="maria@email.com" type="email" />
          </div>
          <button
            disabled={!nome || !telefone}
            onClick={() => setStep('entrega')}
            className="w-full bg-clara-rosa text-white font-semibold py-3.5 rounded-2xl hover:brightness-95 disabled:opacity-40 transition-all"
          >
            Próximo
          </button>
        </div>
      )}

      {/* STEP 2: Endereço */}
      {step === 'entrega' && (
        <div className="bg-white rounded-card shadow-card p-6 space-y-4">
          <h2 className="font-display text-xl text-clara-rosa">Endereço de entrega</h2>

          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">CEP *</label>
            <div className="relative">
              <input
                value={cep.replace(/(\d{5})(\d)/, '$1-$2')}
                onChange={e => buscarCep(e.target.value)}
                className="w-full border-2 border-gray-200 focus:border-clara-rosa rounded-2xl px-4 py-3 text-sm outline-none transition-colors"
                placeholder="00000-000" maxLength={9}
              />
              {cepLoading && <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-clara-rosa" />}
            </div>
          </div>

          {endereco && (
            <>
              <div className="bg-clara-fundo rounded-2xl px-4 py-3 text-sm text-gray-600">
                {endereco.logradouro && <p>{endereco.logradouro}</p>}
                <p>{endereco.bairro} — {endereco.cidade}/{endereco.estado}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Número *</label>
                  <input value={numero} onChange={e => setNumero(e.target.value)}
                    className="w-full border-2 border-gray-200 focus:border-clara-rosa rounded-2xl px-4 py-3 text-sm outline-none transition-colors"
                    placeholder="123" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Complemento</label>
                  <input value={complemento} onChange={e => setComplemento(e.target.value)}
                    className="w-full border-2 border-gray-200 focus:border-clara-rosa rounded-2xl px-4 py-3 text-sm outline-none transition-colors"
                    placeholder="Apto, casa..." />
                </div>
              </div>

              {freteOpcoes.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2">Opção de entrega</p>
                  <div className="space-y-2">
                    {freteOpcoes.map(op => (
                      <button
                        key={op.type}
                        onClick={() => setFreteSelecionado(op)}
                        className={`w-full text-left border-2 rounded-2xl px-4 py-3 text-sm transition-colors ${
                          freteSelecionado?.type === op.type
                            ? 'border-clara-rosa bg-clara-rosa/5'
                            : 'border-gray-200 hover:border-clara-rosa/50'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold">{op.label}</p>
                            <p className="text-gray-400 text-xs">{op.prazo}</p>
                          </div>
                          <span className="font-display text-clara-rosa">
                            {op.price === 0 ? 'Grátis' : formatPrice(op.price)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <div className="flex gap-3">
            <button onClick={() => setStep('dados')} className="flex-1 border-2 border-gray-200 text-gray-500 font-semibold py-3 rounded-2xl hover:border-clara-rosa transition-all">
              Voltar
            </button>
            <button
              disabled={!endereco || !numero || !freteSelecionado}
              onClick={() => setStep('revisar')}
              className="flex-1 bg-clara-rosa text-white font-semibold py-3 rounded-2xl hover:brightness-95 disabled:opacity-40 transition-all"
            >
              Próximo
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Revisar */}
      {step === 'revisar' && endereco && freteSelecionado && (
        <div className="space-y-4">
          <div className="bg-white rounded-card shadow-card p-6 space-y-3">
            <h2 className="font-display text-xl text-clara-rosa">Revisar pedido</h2>

            <div className="text-sm space-y-1">
              <p className="font-semibold">{nome}</p>
              <p className="text-gray-500">{telefone}</p>
              {email && <p className="text-gray-500">{email}</p>}
              <p className="text-gray-500">{endereco.logradouro}, {numero}{complemento ? `, ${complemento}` : ''}</p>
              <p className="text-gray-500">{endereco.bairro} — {endereco.cidade}/{endereco.estado} — {cep.replace(/(\d{5})(\d)/, '$1-$2')}</p>
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
              {items.map(item => (
                <div key={item.id} className="flex justify-between">
                  <span className="text-gray-600 line-clamp-1 flex-1 pr-4">{item.name} ×{item.quantity}</span>
                  <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal())}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>{freteSelecionado.label}</span>
                <span>{freteSelecionado.price === 0 ? 'Grátis' : formatPrice(freteSelecionado.price)}</span>
              </div>
              <div className="flex justify-between font-semibold text-base pt-1">
                <span>Total</span>
                <span className="font-display text-clara-rosa text-xl">{formatPrice(total)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-card shadow-card p-5 text-sm text-center text-gray-500 space-y-1">
            <p className="font-semibold text-clara-texto">Pagamento via Pix</p>
            <p>Após confirmar, você receberá o QR Code para pagar.</p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep('entrega')} className="flex-1 border-2 border-gray-200 text-gray-500 font-semibold py-3 rounded-2xl hover:border-clara-rosa transition-all">
              Voltar
            </button>
            <button
              disabled={loading}
              onClick={handleSubmit}
              className="flex-1 bg-clara-rosa text-white font-semibold py-3 rounded-2xl hover:brightness-95 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 size={18} className="animate-spin" /> Criando...</> : 'Confirmar e pagar'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
