import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import PixPayment from '@/components/pedido/PixPayment'
import { generatePixEMV } from '@/lib/pix'
import { Package, MapPin, Truck } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import { WHATSAPP } from '@/lib/config'

interface Props {
  params: Promise<{ id: string }>
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  aguardando_pagamento: { label: 'Aguardando pagamento', color: 'text-amber-500' },
  pagamento_confirmado: { label: 'Pagamento confirmado',  color: 'text-blue-500'  },
  em_producao:          { label: 'Em produção',           color: 'text-purple-500' },
  enviado:              { label: 'Enviado',                color: 'text-cyan-500'  },
  entregue:             { label: 'Entregue',               color: 'text-green-500' },
  cancelado:            { label: 'Cancelado',              color: 'text-red-500'   },
}

export default async function PedidoPage({ params }: Props) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (!order) notFound()

  const pixString = order.status === 'aguardando_pagamento'
    ? generatePixEMV({
        key:          process.env.PIX_KEY!,
        keyType:      (process.env.PIX_KEY_TYPE || 'PHONE') as 'PHONE' | 'CPF' | 'EMAIL' | 'EVP',
        merchantName: process.env.PIX_MERCHANT_NAME || 'By Clara',
        merchantCity: process.env.PIX_MERCHANT_CITY || 'Itaberai',
        amount:       order.total,
        txId:         order.pix_txid,
        description:  'Pedido By Clara',
      })
    : ''

  const status = STATUS_LABELS[order.status] ?? { label: order.status, color: 'text-gray-500' }
  const whatsapp = `https://wa.me/${WHATSAPP}?text=Ol%C3%A1!%20Acabei%20de%20fazer%20o%20pedido%20%23${id.slice(0, 8).toUpperCase()}%20e%20j%C3%A1%20realizei%20o%20pagamento!`

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-8 space-y-4">

        <h1 className="font-display text-3xl text-clara-rosa text-center">
          {order.status === 'aguardando_pagamento' ? 'Pedido recebido!' : 'Pedido confirmado!'}
        </h1>
        <p className="text-center text-xs text-gray-400">
          #{id.slice(0, 8).toUpperCase()}
        </p>

        {/* Status */}
        <div className="bg-white rounded-card shadow-card px-5 py-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-600">Status</span>
          <span className={`text-sm font-bold ${status.color}`}>{status.label}</span>
        </div>

        {/* Pix (mostrar só se aguardando pagamento) */}
        {order.status === 'aguardando_pagamento' && (
          <PixPayment
            pixString={pixString}
            total={order.total}
            expiresAt={order.pix_expires_at}
            orderId={order.id}
          />
        )}

        {/* Itens */}
        <div className="bg-white rounded-card shadow-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Package size={16} className="text-clara-rosa" />
            <h2 className="font-semibold text-sm">Itens do pedido</h2>
          </div>
          <div className="space-y-2 text-sm">
            {(order.items as any[]).map((item: any, i: number) => (
              <div key={i} className="flex justify-between text-gray-600">
                <span className="line-clamp-1 flex-1 pr-4">{item.name} ×{item.quantity}</span>
                <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="border-t pt-2 mt-2 space-y-1">
              <div className="flex justify-between text-gray-500">
                <span>Frete ({order.shipping_label})</span>
                <span>{order.shipping_price === 0 ? 'Grátis' : formatPrice(order.shipping_price)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total pago</span>
                <span className="font-display text-clara-rosa">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Endereço */}
        <div className="bg-white rounded-card shadow-card p-5 text-sm text-gray-600 space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={16} className="text-clara-rosa" />
            <h2 className="font-semibold">Entrega</h2>
          </div>
          <p>{order.logradouro}, {order.numero}{order.complemento ? `, ${order.complemento}` : ''}</p>
          <p>{order.bairro} — {order.cidade}/{order.estado}</p>
          <div className="flex items-center gap-1.5 text-gray-400 text-xs mt-2">
            <Truck size={12} /> {order.shipping_label}
          </div>
        </div>

        {/* Avisar no WhatsApp */}
        {order.status === 'aguardando_pagamento' && (
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-green-500 text-white font-semibold py-3.5 rounded-2xl hover:bg-green-600 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Avisar que paguei no WhatsApp
          </a>
        )}

        <Link href="/" className="block text-center text-sm text-gray-400 hover:text-clara-rosa transition-colors pt-2">
          Voltar à loja
        </Link>
      </main>
      <Footer />
    </div>
  )
}
