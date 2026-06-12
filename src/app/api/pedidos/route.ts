import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generatePixEMV, generateTxId } from '@/lib/pix'
import { sendNewOrderEmail } from '@/lib/email'
import QRCode from 'qrcode'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const supabase = createAdminClient()

    const txId  = generateTxId()
    const total = parseFloat(body.subtotal) + parseFloat(body.shipping_price)

    const pixString = generatePixEMV({
      key:          process.env.PIX_KEY!,
      keyType:      (process.env.PIX_KEY_TYPE || 'PHONE') as 'PHONE' | 'CPF' | 'EMAIL' | 'EVP',
      merchantName: process.env.PIX_MERCHANT_NAME || 'By Clara',
      merchantCity: process.env.PIX_MERCHANT_CITY || 'Itaberai',
      amount:       total,
      txId,
      description:  'Pedido By Clara',
    })

    const qrCodeBase64 = await QRCode.toDataURL(pixString, {
      width: 300, margin: 2,
      color: { dark: '#1C1917', light: '#FEFCE8' },
    })

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        customer_name:  body.customer_name,
        customer_phone: body.customer_phone,
        customer_email: body.customer_email || null,
        cep:            body.cep,
        logradouro:     body.logradouro,
        numero:         body.numero,
        complemento:    body.complemento || null,
        bairro:         body.bairro,
        cidade:         body.cidade,
        estado:         body.estado,
        shipping_type:  body.shipping_type,
        shipping_price: body.shipping_price,
        shipping_label: body.shipping_label,
        items:          body.items,
        subtotal:       body.subtotal,
        total,
        pix_txid:       txId,
        pix_expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        status:         'aguardando_pagamento',
      })
      .select()
      .single()

    if (error) throw error

    // Decrementar estoque
    for (const item of body.items) {
      const { data: product } = await supabase
        .from('products')
        .select('stock')
        .eq('id', item.productId)
        .single()

      if (product && product.stock > 0) {
        await supabase
          .from('products')
          .update({ stock: Math.max(0, product.stock - item.quantity) })
          .eq('id', item.productId)
      }
    }

    // Enviar e-mail de notificação (não bloqueia a resposta)
    sendNewOrderEmail({
      orderId:       order.id,
      customerName:  body.customer_name,
      customerPhone: body.customer_phone,
      customerEmail: body.customer_email,
      cidade:        body.cidade,
      estado:        body.estado,
      shippingLabel: body.shipping_label,
      items:         body.items,
      subtotal:      body.subtotal,
      shippingPrice: body.shipping_price,
      total,
    }).catch(err => console.error('Erro ao enviar e-mail:', err))

    return NextResponse.json({
      order,
      pix: {
        string:    pixString,
        qrCode:    qrCodeBase64,
        txId,
        total,
        expiresAt: order.pix_expires_at,
      },
    })
  } catch (error) {
    console.error('Erro ao criar pedido:', error)
    return NextResponse.json({ error: 'Erro ao criar pedido' }, { status: 500 })
  }
}
