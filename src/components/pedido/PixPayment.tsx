'use client'
import { useState, useEffect } from 'react'
import { Copy, Check, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import QRCode from 'qrcode'

interface Props {
  pixString: string
  total: number
  expiresAt: string
}

function formatTimeLeft(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000))
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}

export default function PixPayment({ pixString, total, expiresAt }: Props) {
  const [copied, setCopied]   = useState(false)
  const [qrCode, setQrCode]   = useState('')
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [expired, setExpired]  = useState(false)

  useEffect(() => {
    QRCode.toDataURL(pixString, {
      width: 300, margin: 2,
      color: { dark: '#1C1917', light: '#FEFCE8' },
    }).then(setQrCode)
  }, [pixString])

  useEffect(() => {
    const expiry = new Date(expiresAt).getTime()

    function tick() {
      const remaining = expiry - Date.now()
      if (remaining <= 0) {
        setExpired(true)
        setTimeLeft(0)
      } else {
        setTimeLeft(remaining)
      }
    }

    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [expiresAt])

  async function copyPix() {
    await navigator.clipboard.writeText(pixString)
    setCopied(true)
    toast.success('Código Pix copiado!')
    setTimeout(() => setCopied(false), 3000)
  }

  const isUrgent = timeLeft !== null && timeLeft < 5 * 60 * 1000 && !expired

  const whatsapp = `https://wa.me/5562996394315?text=Olá!%20Meu%20código%20Pix%20expirou%20e%20preciso%20de%20um%20novo.`

  return (
    <div className="bg-white rounded-card shadow-card p-6 text-center space-y-4">
      <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto">
        <svg viewBox="0 0 24 24" className="w-8 h-8 text-green-500" fill="currentColor">
          <path d="M11.354 17.354l-5-5 1.06-1.06 3.94 3.939 7.94-7.94 1.06 1.061z"/>
        </svg>
      </div>
      <div>
        <h2 className="font-display text-xl text-clara-rosa">Pedido criado!</h2>
        <p className="text-sm text-gray-500 mt-1">Pague via Pix para confirmar</p>
      </div>

      <div className="bg-clara-fundo rounded-2xl p-4">
        <p className="text-xs text-gray-400 mb-1">Valor a pagar</p>
        <p className="font-display text-3xl text-clara-rosa">
          R$ {total.toFixed(2).replace('.', ',')}
        </p>
      </div>

      {expired ? (
        <div className="space-y-3 py-4">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto">
            <Clock size={28} className="text-red-400" />
          </div>
          <p className="font-semibold text-red-500">PIX expirado</p>
          <p className="text-sm text-gray-500">O código Pix não é mais válido.</p>
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-500 text-white font-semibold px-5 py-2.5 rounded-2xl hover:bg-green-600 transition-colors text-sm"
          >
            Pedir novo código via WhatsApp
          </a>
        </div>
      ) : (
        <>
          {/* QR Code */}
          <div className="flex justify-center">
            <div className={`border-4 rounded-2xl p-3 inline-block min-h-[208px] flex items-center justify-center transition-colors ${
              isUrgent ? 'border-red-300' : 'border-clara-rosa/20'
            }`}>
              {qrCode
                ? <img src={qrCode} alt="QR Code Pix" width={200} height={200} className="rounded-xl" />
                : <div className="w-[200px] h-[200px] bg-gray-100 rounded-xl animate-pulse" />
              }
            </div>
          </div>

          {/* Countdown */}
          {timeLeft !== null && (
            <div className={`flex items-center justify-center gap-1.5 text-xs font-semibold ${
              isUrgent ? 'text-red-500' : 'text-gray-400'
            }`}>
              <Clock size={12} />
              <span>Expira em {formatTimeLeft(timeLeft)}</span>
            </div>
          )}

          {/* Copia e cola */}
          <div>
            <p className="text-xs text-gray-400 mb-2">Ou copie o código Pix</p>
            <div className="flex gap-2">
              <code className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-600 text-left overflow-hidden overflow-ellipsis whitespace-nowrap">
                {pixString}
              </code>
              <button
                onClick={copyPix}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                  copied ? 'bg-green-500 text-white' : 'bg-clara-rosa text-white hover:brightness-95'
                }`}
              >
                {copied ? <><Check size={14} /> Copiado</> : <><Copy size={14} /> Copiar</>}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
