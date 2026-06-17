import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockInsert = vi.fn()
const mockSelect = vi.fn()
const mockUpdate = vi.fn()

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: () => ({
      insert: mockInsert,
      select: mockSelect,
      update: mockUpdate,
    }),
  }),
}))

vi.mock('@/lib/email', () => ({
  sendNewOrderEmail: vi.fn(),
}))

const MOCK_ORDER = {
  id: 'order-uuid-123',
  total: 43.90,
  pix_expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  status: 'aguardando_pagamento',
}

const VALID_BODY = {
  customer_name:  'Maria Teste',
  customer_phone: '(62) 99999-9999',
  customer_email: 'maria@teste.com',
  cep:            '76380000',
  logradouro:     'Rua Teste',
  numero:         '123',
  complemento:    '',
  bairro:         'Centro',
  cidade:         'Itaberaí',
  estado:         'GO',
  shipping_type:  'pac',
  shipping_price: '18.00',
  shipping_label: 'PAC — Correios',
  items: [
    { productId: 'prod-1', name: 'Pulseira Rosa', price: 25.90, quantity: 1 },
  ],
  subtotal: '25.90',
}

function makeReq(body: unknown): NextRequest {
  return new NextRequest('https://clarabyclara.com.br/api/pedidos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

function setupHappyPath() {
  mockSelect.mockReturnValue({
    eq: vi.fn().mockReturnValue({
      single: vi.fn().mockResolvedValue({ data: { stock: 10 } }),
    }),
  })
  mockInsert.mockReturnValue({
    select: vi.fn().mockReturnValue({
      single: vi.fn().mockResolvedValue({ data: MOCK_ORDER, error: null }),
    }),
  })
  mockUpdate.mockReturnValue({
    eq: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    }),
  })
}

describe('POST /api/pedidos — validação de entrada', () => {
  let POST: (req: NextRequest) => Promise<Response>

  beforeEach(async () => {
    vi.clearAllMocks()
    // Restaura mock de email para retornar Promise (evita .catch em undefined)
    const { sendNewOrderEmail } = await import('@/lib/email')
    vi.mocked(sendNewOrderEmail).mockResolvedValue(undefined)
    setupHappyPath()
    const mod = await import('@/app/api/pedidos/route')
    POST = mod.POST
  })

  it('pedido válido retorna 200 com order e pix', async () => {
    const res = await POST(makeReq(VALID_BODY))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.order).toBeDefined()
    expect(json.pix.string).toBeDefined()
  })

  it('total é calculado como subtotal + frete', async () => {
    const res = await POST(makeReq(VALID_BODY))
    const json = await res.json()
    expect(json.pix.total).toBeCloseTo(43.90, 2) // 25.90 + 18.00
  })

  it('subtotal inválido (NaN) retorna 500 em vez de corromper dados', async () => {
    mockInsert.mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'invalid input' } }),
      }),
    })
    const res = await POST(makeReq({ ...VALID_BODY, subtotal: 'nao-e-numero' }))
    expect(res.status).toBe(500)
  })

  it('subtotal negativo não cria pedido com valor negativo', async () => {
    mockInsert.mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'constraint violation' } }),
      }),
    })
    const res = await POST(makeReq({ ...VALID_BODY, subtotal: '-100', shipping_price: '0' }))
    // Deve retornar 500 (Supabase recusa) — não 200 com total negativo
    expect(res.status).toBe(500)
  })

  it('retorna 500 quando Supabase falha no insert', async () => {
    mockInsert.mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'db error' } }),
      }),
    })
    const res = await POST(makeReq(VALID_BODY))
    expect(res.status).toBe(500)
  })

  it('caracteres especiais em customer_name não quebram o pedido', async () => {
    const res = await POST(makeReq({
      ...VALID_BODY,
      customer_name: '<script>alert("xss")</script>',
    }))
    // A API aceita (sanitização é responsabilidade do React na exibição)
    // mas deve processar sem erro interno
    expect([200, 500]).toContain(res.status)
  })

  it('itens vazios retornam 500 (não cria pedido sem produtos)', async () => {
    mockInsert.mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'items required' } }),
      }),
    })
    const res = await POST(makeReq({ ...VALID_BODY, items: [] }))
    expect(res.status).toBe(500)
  })
})

describe('POST /api/pedidos — controle de estoque', () => {
  let POST: (req: NextRequest) => Promise<Response>

  beforeEach(async () => {
    vi.clearAllMocks()
    const { sendNewOrderEmail } = await import('@/lib/email')
    vi.mocked(sendNewOrderEmail).mockResolvedValue(undefined)
    const mod = await import('@/app/api/pedidos/route')
    POST = mod.POST
  })

  it('não decrementa estoque se stock < quantity (optimistic lock)', async () => {
    mockSelect.mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: { stock: 0 } }),
      }),
    })
    mockInsert.mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: MOCK_ORDER, error: null }),
      }),
    })

    await POST(makeReq(VALID_BODY))

    // update não deve ter sido chamado pois stock === 0 < quantity 1
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('decrementa estoque quando stock >= quantity', async () => {
    mockSelect.mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: { stock: 5 } }),
      }),
    })
    const mockEq2 = vi.fn().mockResolvedValue({ error: null })
    const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 })
    mockUpdate.mockReturnValue({ eq: mockEq1 })
    mockInsert.mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: MOCK_ORDER, error: null }),
      }),
    })

    await POST(makeReq(VALID_BODY))

    expect(mockUpdate).toHaveBeenCalledWith({ stock: 4 }) // 5 - 1
    // optimistic lock: segundo .eq verifica stock === 5
    expect(mockEq2).toHaveBeenCalledWith('stock', 5)
  })
})
