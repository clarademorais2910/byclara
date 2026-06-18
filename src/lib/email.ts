import { Resend } from 'resend'
import { formatPrice } from './utils'
import { WHATSAPP } from './config'

interface OrderItem {
  name: string
  quantity: number
  price: number
  personalizacao?: {
    nomePersonalizado?: string
    coresEscolhidas?: string[]
  }
}

interface OrderEmailData {
  orderId: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  cidade: string
  estado: string
  shippingLabel: string
  items: OrderItem[]
  subtotal: number
  shippingPrice: number
  total: number
}

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'PREENCHER_DEPOIS') return null
  return new Resend(process.env.RESEND_API_KEY)
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function buildItemsHtml(items: OrderItem[]): string {
  return items.map(item => `
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px solid #f3f3f3;">
        <strong>${esc(item.name)}</strong> ×${item.quantity}
        ${item.personalizacao?.nomePersonalizado ? `<br><small>Nome: ${esc(item.personalizacao.nomePersonalizado)}</small>` : ''}
      </td>
      <td style="padding: 8px 0; border-bottom: 1px solid #f3f3f3; text-align: right;">
        ${formatPrice(item.price * item.quantity)}
      </td>
    </tr>
  `).join('')
}

export async function sendNewOrderEmail(order: OrderEmailData) {
  const resend = getResend()
  if (!resend) {
    console.log('RESEND_API_KEY não configurado — e-mail não enviado')
    return
  }

  const itemsHtml = buildItemsHtml(order.items)
  const adminUrl  = `https://clarabyclara.com.br/admin/pedidos/${order.orderId}`

  await resend.emails.send({
    from: 'By Clara <noreply@clarabyclara.com.br>',
    to:   ['clarademorais2910@gmail.com'],
    subject: `🛍️ Novo pedido — ${order.customerName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1C1917;">
        <div style="background: linear-gradient(135deg, #F9A8D4, #C4B5FD); padding: 24px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">By Clara</h1>
          <p style="color: white; margin: 8px 0 0; opacity: 0.9;">Novo pedido recebido! 🎉</p>
        </div>
        <div style="background: white; padding: 24px; border-radius: 0 0 16px 16px; border: 1px solid #f0f0f0;">
          <h2 style="color: #F9A8D4; margin-top: 0;">Cliente</h2>
          <p style="margin: 4px 0;"><strong>${esc(order.customerName)}</strong></p>
          <p style="margin: 4px 0; color: #666;">${order.customerPhone}</p>
          ${order.customerEmail ? `<p style="margin: 4px 0; color: #666;">${order.customerEmail}</p>` : ''}
          <p style="margin: 4px 0; color: #666;">${order.cidade}/${order.estado}</p>
          <h2 style="color: #F9A8D4;">Itens do pedido</h2>
          <table style="width: 100%; border-collapse: collapse;">
            ${itemsHtml}
            <tr>
              <td style="padding: 8px 0; color: #666;">Frete (${order.shippingLabel})</td>
              <td style="padding: 8px 0; text-align: right; color: #666;">
                ${order.shippingPrice === 0 ? 'Grátis' : formatPrice(order.shippingPrice)}
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0; font-size: 18px;"><strong>Total</strong></td>
              <td style="padding: 12px 0; text-align: right; font-size: 20px; color: #F9A8D4;">
                <strong>${formatPrice(order.total)}</strong>
              </td>
            </tr>
          </table>
          <div style="text-align: center; margin-top: 24px;">
            <a href="${adminUrl}" style="background: #F9A8D4; color: white; padding: 12px 28px; border-radius: 16px; text-decoration: none; font-weight: bold; display: inline-block;">
              Ver pedido no admin →
            </a>
          </div>
        </div>
      </div>
    `,
  })
}

export async function sendOrderConfirmationEmail(order: OrderEmailData) {
  if (!order.customerEmail) return

  const resend = getResend()
  if (!resend) return

  const itemsHtml  = buildItemsHtml(order.items)
  const orderUrl   = `https://clarabyclara.com.br/pedido/${order.orderId}`
  const whatsappUrl = `https://wa.me/${WHATSAPP}?text=Olá!%20Fiz%20o%20pedido%20%23${order.orderId.slice(0, 8).toUpperCase()}%20e%20tenho%20uma%20dúvida.`
  const shortId    = order.orderId.slice(0, 8).toUpperCase()

  await resend.emails.send({
    from: 'By Clara <noreply@clarabyclara.com.br>',
    to:   [order.customerEmail],
    subject: `Pedido #${shortId} recebido! Pague via Pix para confirmar 💕`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1C1917;">
        <div style="background: linear-gradient(135deg, #F9A8D4, #C4B5FD); padding: 24px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">By Clara</h1>
          <p style="color: white; margin: 8px 0 0; opacity: 0.9;">Seu pedido foi recebido! 🌸</p>
        </div>
        <div style="background: white; padding: 24px; border-radius: 0 0 16px 16px; border: 1px solid #f0f0f0;">
          <p style="margin: 0 0 16px;">Olá, <strong>${esc(order.customerName)}</strong>! 😊</p>
          <p style="color: #666; margin: 0 0 20px;">
            Recebemos seu pedido <strong>#${shortId}</strong>. Assim que o pagamento Pix for confirmado, começamos a produzir com muito carinho!
          </p>

          <h2 style="color: #F9A8D4; margin: 0 0 12px;">Itens do seu pedido</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 8px;">
            ${itemsHtml}
            <tr>
              <td style="padding: 8px 0; color: #666;">Frete (${order.shippingLabel})</td>
              <td style="padding: 8px 0; text-align: right; color: #666;">
                ${order.shippingPrice === 0 ? 'Grátis' : formatPrice(order.shippingPrice)}
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0; font-size: 18px;"><strong>Total a pagar</strong></td>
              <td style="padding: 12px 0; text-align: right; font-size: 20px; color: #F9A8D4;">
                <strong>${formatPrice(order.total)}</strong>
              </td>
            </tr>
          </table>

          <div style="background: #FFF7ED; border-radius: 12px; padding: 16px; margin: 20px 0; text-align: center;">
            <p style="margin: 0 0 12px; font-weight: bold; color: #92400E;">💳 Como pagar via Pix</p>
            <p style="margin: 0 0 12px; color: #78350F; font-size: 14px;">
              Acesse a página do seu pedido para ver o QR Code e o código Pix. O código é válido por 30 minutos.
            </p>
            <a href="${orderUrl}" style="background: #F9A8D4; color: white; padding: 12px 28px; border-radius: 16px; text-decoration: none; font-weight: bold; display: inline-block;">
              Ver QR Code e pagar →
            </a>
          </div>

          <p style="color: #666; font-size: 13px; margin: 16px 0 0;">
            Dúvidas? Fala comigo pelo WhatsApp 💬
          </p>
          <a href="${whatsappUrl}" style="color: #22C55E; font-weight: bold; font-size: 13px;">
            Chamar no WhatsApp →
          </a>
        </div>
      </div>
    `,
  })
}
