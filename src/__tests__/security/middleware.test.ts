import { describe, it, expect } from 'vitest'
import { middleware as proxy } from '@/middleware'
import type { NextRequest } from 'next/server'

function makeReq(pathname: string, token?: string): NextRequest {
  return {
    nextUrl: { pathname },
    cookies: {
      get: (name: string) =>
        name === 'admin_token' && token !== undefined ? { value: token } : undefined,
    },
    url: `https://clarabyclara.com.br${pathname}`,
  } as unknown as NextRequest
}

describe('proxy middleware — controle de acesso', () => {
  it('rota pública /catalogo passa sem token', () => {
    const res = proxy(makeReq('/catalogo'))
    expect(res.status).not.toBe(307)
    expect(res.headers.get('location')).toBeNull()
  })

  it('/admin (login) não é protegido pelo middleware', () => {
    const res = proxy(makeReq('/admin'))
    expect(res.headers.get('location')).toBeNull()
  })

  it('/admin/dashboard sem token redireciona para /admin', () => {
    const res = proxy(makeReq('/admin/dashboard'))
    expect(res.headers.get('location')).toContain('/admin')
  })

  it('/admin/dashboard com token errado redireciona', () => {
    const res = proxy(makeReq('/admin/dashboard', 'senha-errada'))
    expect(res.headers.get('location')).toContain('/admin')
  })

  it('/admin/dashboard com token correto passa', () => {
    const res = proxy(makeReq('/admin/dashboard', process.env.ADMIN_PASSWORD!))
    expect(res.headers.get('location')).toBeNull()
  })

  it('/admin/pedidos/123 com token correto passa', () => {
    const res = proxy(makeReq('/admin/pedidos/123', process.env.ADMIN_PASSWORD!))
    expect(res.headers.get('location')).toBeNull()
  })

  it('token vazio é rejeitado', () => {
    const res = proxy(makeReq('/admin/dashboard', ''))
    expect(res.headers.get('location')).toContain('/admin')
  })
})
