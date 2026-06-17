'use client'
import { useState, useEffect } from 'react'
import { Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import QRCode from 'qrcode'

interface Props {
  pixString: string
  total: number
  expiresAt: string
}

export default function PixPayment({ pixString, total, expiresAt }: Props) {
  const [copied, setCopied] = useState(false)
  const [qrCode, setQrCode] = useState('')

  useEffect(() => {
    QRCode.toDataURL(pixString, {
      width: 300, margin: 2,
      color: { dark: '#1C1917', light: '#FEFCE8' },
    }).then(setQrCode)
  }, [pixString])

  async function copyPix() {
    await navigator.clipboard.writeText(pixString)
    setCopied(true)
    toast.success('Código Pix copiado!')
    setTimeout(() => setCopied(false), 3000)
  }

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

      {/* QR Code */}
      <div className="flex justify-center">
        <div className="border-4 border-clara-rosa/20 rounded-2xl p-3 inline-block min-h-[208px] flex items-center justify-center">
          {qrCode
            ? <img src={qrCode} alt="QR Code Pix" width={200} height={200} className="rounded-xl" />
            : <div className="w-[200px] h-[200px] bg-gray-100 rounded-xl animate-pulse" />
          }
        </div>
      </div>

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

      <p className="text-xs text-gray-400">
        Válido até {new Date(expiresAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
      </p>
    </div>
  )
}
