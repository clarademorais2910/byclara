import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// In-memory rate limiter — resets on cold start, sufficient for a small shop
const attempts = new Map<string, { count: number; windowStart: number }>()
const WINDOW_MS   = 15 * 60 * 1000 // 15 minutes
const MAX_ATTEMPTS = 5

function getIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
}

function isRateLimited(ip: string): boolean {
  const now   = Date.now()
  const entry = attempts.get(ip)

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    attempts.set(ip, { count: 1, windowStart: now })
    return false
  }

  if (entry.count >= MAX_ATTEMPTS) return true
  entry.count++
  return false
}

function resetAttempts(ip: string) {
  attempts.delete(ip)
}

export async function POST(req: NextRequest) {
  const ip = getIp(req)

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Muitas tentativas. Aguarde 15 minutos.' },
      { status: 429 }
    )
  }

  const { password } = await req.json()

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 })
  }

  resetAttempts(ip)

  const cookieStore = await cookies()
  cookieStore.set('admin_token', process.env.ADMIN_PASSWORD!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  return NextResponse.json({ ok: true })
}
