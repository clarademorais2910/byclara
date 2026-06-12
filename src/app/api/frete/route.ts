import { NextRequest, NextResponse } from 'next/server'
import { buscarEndereco, calcularFrete, isEntregaLocal } from '@/lib/frete'

export async function POST(req: NextRequest) {
  try {
    const { cep, pesoTotalGramas } = await req.json()

    const endereco = await buscarEndereco(cep)

    if (isEntregaLocal(endereco.cidade, endereco.estado)) {
      const precoLocal = parseFloat(process.env.FRETE_LOCAL_PRECO || '0')
      return NextResponse.json({
        endereco,
        opcoes: [{
          type: 'local',
          label: process.env.FRETE_LOCAL_LABEL || 'Entrega local (Itaberaí-GO)',
          price: precoLocal,
          prazo: 'Combinado com a vendedora',
        }],
      })
    }

    const opcoes = await calcularFrete(cep, pesoTotalGramas)

    return NextResponse.json({ endereco, opcoes })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro ao calcular frete'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
