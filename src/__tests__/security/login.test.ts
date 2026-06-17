import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockCookieSet = vi.fn()

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({ set: mockCookieSet }),
}))

function makeLoginReq(body: unknown): NextRequest {
  return new NextRequest('https://clarabyclara.com.br/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/admin/login — autenticação', () => {
  let POST: (req: NextRequest) => Promise<Response>

  beforeEach(async () => {
    mockCookieSet.mockClear()
    vi.resetModules()
    const mod = await import('@/app/api/admin/login/route')
    POST = mod.POST
  })

  it('senha correta retorna 200 e define cookie httpOnly', async () => {
    const res = await POST(makeLoginReq({ password: process.env.ADMIN_PASSWORD }))
    expect(res.status).toBe(200)
    expect(mockCookieSet).toHaveBeenCalledWith(
      'admin_token',
      process.env.ADMIN_PASSWORD,
      expect.objectContaining({ httpOnly: true })
    )
  })

  it('senha errada retorna 401', async () => {
    const res = await POST(makeLoginReq({ password: 'tentativa-errada' }))
    expect(res.status).toBe(401)
    expect(mockCookieSet).not.toHaveBeenCalled()
  })

  it('campo password ausente retorna 401', async () => {
    const res = await POST(makeLoginReq({}))
    expect(res.status).toBe(401)
  })

  it('password vazio retorna 401', async () => {
    const res = await POST(makeLoginReq({ password: '' }))
    expect(res.status).toBe(401)
  })

  it('payload com campos extras ainda funciona', async () => {
    const res = await POST(makeLoginReq({
      password: process.env.ADMIN_PASSWORD,
      extra: 'campo-injetado',
      admin: true,
    }))
    expect(res.status).toBe(200)
  })

  it('password muito longo retorna 401', async () => {
    const res = await POST(makeLoginReq({ password: 'a'.repeat(10_000) }))
    expect(res.status).toBe(401)
  })

  it('cookie é configurado com sameSite strict', async () => {
    await POST(makeLoginReq({ password: process.env.ADMIN_PASSWORD }))
    expect(mockCookieSet).toHaveBeenCalledWith(
      'admin_token',
      expect.any(String),
      expect.objectContaining({ sameSite: 'strict' })
    )
  })
})

describe('POST /api/admin/login — rate limiting', () => {
  let POST: (req: NextRequest) => Promise<Response>

  // Cada describe usa resetModules para obter uma instância limpa do Map
  beforeEach(async () => {
    mockCookieSet.mockClear()
    vi.resetModules()
    const mod = await import('@/app/api/admin/login/route')
    POST = mod.POST
  })

  it('bloqueia com 429 após 5 tentativas erradas do mesmo IP', async () => {
    const req = () => {
      const r = makeLoginReq({ password: 'errada' })
      // Simula mesmo IP via header x-forwarded-for
      return new NextRequest(r, {
        headers: { ...Object.fromEntries(r.headers), 'x-forwarded-for': '1.2.3.4' },
      })
    }

    for (let i = 0; i < 5; i++) await POST(req())

    const res = await POST(req())
    expect(res.status).toBe(429)
  })

  it('login com senha correta reseta o contador de tentativas', async () => {
    const makeReqWithIp = (body: unknown) => {
      const r = makeLoginReq(body)
      return new NextRequest(r, {
        headers: { ...Object.fromEntries(r.headers), 'x-forwarded-for': '5.6.7.8' },
      })
    }

    // 4 tentativas erradas
    for (let i = 0; i < 4; i++) await POST(makeReqWithIp({ password: 'errada' }))

    // Login com sucesso reseta o contador
    await POST(makeReqWithIp({ password: process.env.ADMIN_PASSWORD }))

    // Mais 4 tentativas erradas devem funcionar (contador foi zerado)
    for (let i = 0; i < 4; i++) {
      const res = await POST(makeReqWithIp({ password: 'errada' }))
      expect(res.status).toBe(401) // ainda 401, não 429
    }
  })

  it('IPs diferentes têm contadores independentes', async () => {
    const makeReqWithIp = (ip: string) => {
      const r = makeLoginReq({ password: 'errada' })
      return new NextRequest(r, {
        headers: { ...Object.fromEntries(r.headers), 'x-forwarded-for': ip },
      })
    }

    // Esgota IP 10.0.0.1
    for (let i = 0; i < 5; i++) await POST(makeReqWithIp('10.0.0.1'))
    expect((await POST(makeReqWithIp('10.0.0.1'))).status).toBe(429)

    // IP 10.0.0.2 ainda está livre
    expect((await POST(makeReqWithIp('10.0.0.2'))).status).toBe(401)
  })
})
