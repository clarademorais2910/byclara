import { describe, it, expect } from 'vitest'
import { generatePixEMV, generateTxId, type PixPayload } from '@/lib/pix'

const BASE: PixPayload = {
  key:          '62999999999',
  keyType:      'PHONE',
  merchantName: 'By Clara',
  merchantCity: 'Itaberai',
  amount:       25.90,
  txId:         'byclara123',
}

describe('generatePixEMV', () => {
  it('começa com o campo de versão 000201', () => {
    expect(generatePixEMV(BASE)).toMatch(/^000201/)
  })

  it('termina com CRC de 4 caracteres hex maiúsculos', () => {
    const result = generatePixEMV(BASE)
    expect(result.slice(-4)).toMatch(/^[0-9A-F]{4}$/)
  })

  it('inclui o código de moeda BRL (986)', () => {
    expect(generatePixEMV(BASE)).toContain('5303986')
  })

  it('codifica o valor corretamente', () => {
    // field 54, length 05, value "25.90"
    expect(generatePixEMV(BASE)).toContain('540525.90')
  })

  it('prefixa chave PHONE com +55', () => {
    expect(generatePixEMV(BASE)).toContain('+5562999999999')
  })

  it('usa chave EMAIL sem alteração', () => {
    const result = generatePixEMV({ ...BASE, key: 'clara@email.com', keyType: 'EMAIL' })
    expect(result).toContain('clara@email.com')
    expect(result).not.toContain('+55')
  })

  it('trunca nome do comerciante em 25 caracteres', () => {
    const result = generatePixEMV({ ...BASE, merchantName: 'A'.repeat(30) })
    expect(result).toContain('A'.repeat(25))
    expect(result).not.toContain('A'.repeat(26))
  })

  it('trunca cidade em 15 caracteres', () => {
    const result = generatePixEMV({ ...BASE, merchantCity: 'B'.repeat(20) })
    expect(result).toContain('B'.repeat(15))
    expect(result).not.toContain('B'.repeat(16))
  })

  it('é determinístico — mesma entrada gera mesma saída', () => {
    expect(generatePixEMV(BASE)).toBe(generatePixEMV(BASE))
  })

  it('CRC muda se o conteúdo mudar', () => {
    const a = generatePixEMV(BASE)
    const b = generatePixEMV({ ...BASE, amount: 30.00 })
    expect(a.slice(-4)).not.toBe(b.slice(-4))
  })

  it('inclui o txId no campo 62', () => {
    expect(generatePixEMV(BASE)).toContain('byclara123')
  })

  it('inclui código de país BR', () => {
    expect(generatePixEMV(BASE)).toContain('5802BR')
  })
})

describe('generateTxId', () => {
  it('começa com o prefixo byclara', () => {
    expect(generateTxId()).toMatch(/^byclara/)
  })

  it('gera IDs com formato alfanumérico', () => {
    // Date.now().toString(36) pode colidir no mesmo ms — testamos só o formato
    const id = generateTxId()
    expect(id).toMatch(/^byclara[0-9a-z]+$/i)
  })

  it('não ultrapassa 25 caracteres (limite do campo txId)', () => {
    const id = generateTxId()
    expect(id.length).toBeLessThanOrEqual(25)
  })
})
