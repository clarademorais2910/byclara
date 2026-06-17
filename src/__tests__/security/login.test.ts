import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockCookieSet = vi.fn()

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({ set: mockCookieSet }),
}))

async function importRoute() {
  const mod = await import('@/app/api/admin/login/route')
  return mod.POST
}

function makeLoginReq(body: unknown): NextRequest {
  return new NextRequest('https://clarabyclara.com.br/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/admin/login — autenticação', () => {
  let POST: Awaited<ReturnType<typeof importRoute>>

  beforeEach(async () => {
    mockCookieSet.mockClear()
    POST = await importRoute()
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

  it('password muito longo retorna 401 (não vaza timing)', async () => {
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
