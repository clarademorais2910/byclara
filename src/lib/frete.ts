// Consulta CEP via ViaCEP e calcula frete

export interface Endereco {
  cep: string
  logradouro: string
  bairro: string
  cidade: string
  estado: string
  valid: boolean
}

export interface OpcaoFrete {
  type: 'local' | 'pac' | 'sedex' | 'retirada'
  label: string
  price: number
  prazo: string
}

export async function buscarEndereco(cep: string): Promise<Endereco> {
  const cleaned = cep.replace(/\D/g, '')
  if (cleaned.length !== 8) throw new Error('CEP inválido')

  const res = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`)
  const data = await res.json()

  if (data.erro) throw new Error('CEP não encontrado')

  return {
    cep: data.cep,
    logradouro: data.logradouro || '',
    bairro: data.bairro || '',
    cidade: data.localidade,
    estado: data.uf,
    valid: true,
  }
}

export function isEntregaLocal(cidade: string, estado: string): boolean {
  const cidadeBase = process.env.FRETE_LOCAL_CIDADE || 'Itaberaí'
  const estadoBase = process.env.FRETE_LOCAL_ESTADO || 'GO'
  return (
    cidade.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '') ===
    cidadeBase.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '') &&
    estado.toUpperCase() === estadoBase.toUpperCase()
  )
}

export async function calcularFrete(
  cepDestino: string,
  pesoTotalGramas: number
): Promise<OpcaoFrete[]> {
  const opcoes: OpcaoFrete[] = []
  const token = process.env.MELHOR_ENVIO_TOKEN

  if (!token || token === 'PREENCHER_DEPOIS') {
    opcoes.push(
      { type: 'pac',   label: 'PAC — Correios',   price: 18.50, prazo: '6 a 10 dias úteis' },
      { type: 'sedex', label: 'SEDEX — Correios',  price: 32.00, prazo: '2 a 4 dias úteis' }
    )
    return opcoes
  }

  try {
    const res = await fetch('https://melhorenvio.com.br/api/v2/me/shipment/calculate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'byclara/1.0 (suporte@byclara.com)',
      },
      body: JSON.stringify({
        from: { postal_code: process.env.SHIPPING_ORIGIN_CEP || '76380000' },
        to:   { postal_code: cepDestino.replace(/\D/g, '') },
        package: {
          height: 5,
          width:  15,
          length: 15,
          weight: Math.max(0.1, (pesoTotalGramas + 30) / 1000),
        },
        services: '1,2',
      }),
    })
    const data = await res.json()

    for (const servico of data) {
      if (servico.error) continue
      opcoes.push({
        type:  servico.id === 1 ? 'pac' : 'sedex',
        label: `${servico.name} — ${servico.company.name}`,
        price: parseFloat(servico.price),
        prazo: `${servico.delivery_time} dias úteis`,
      })
    }
  } catch {
    opcoes.push(
      { type: 'pac',   label: 'PAC — Correios',  price: 18.50, prazo: '6 a 10 dias úteis' },
      { type: 'sedex', label: 'SEDEX — Correios', price: 32.00, prazo: '2 a 4 dias úteis' }
    )
  }

  return opcoes
}
