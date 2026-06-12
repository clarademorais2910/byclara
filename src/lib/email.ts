import { Resend } from 'resend'
import { formatPrice } from './utils'

const resend = new Resend(process.env.RESEND_API_KEY)

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

export async function sendNewOrderEmail(order: OrderEmailData) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'PREENCHER_DEPOIS') {
    console.log('RESEND_API_KEY não configurado — e-mail não enviado')
    return
  }

  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px solid #f3f3f3;">
        <strong>${item.name}</strong> ×${item.quantity}
        ${item.personalizacao?.nomePersonalizado ? `<br><small>Nome: ${item.personalizacao.nomePersonalizado}</small>` : ''}
      </td>
      <td style="padding: 8px 0; border-bottom: 1px solid #f3f3f3; text-align: right;">
        ${formatPrice(item.price * item.quantity)}
      </td>
    </tr>
  `).join('')

  const adminUrl = `https://clarabyclara.com.br/admin/pedidos/${order.orderId}`

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
          <p style="margin: 4px 0;"><strong>${order.customerName}</strong></p>
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
            <a href="${adminUrl}"
              style="background: #F9A8D4; color: white; padding: 12px 28px; border-radius: 16px; text-decoration: none; font-weight: bold; display: inline-block;">
              Ver pedido no admin →
            </a>
          </div>
        </div>
      </div>
    `,
  })
}
