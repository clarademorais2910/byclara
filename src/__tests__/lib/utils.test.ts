import { describe, it, expect } from 'vitest'
import { formatPrice, formatPhone } from '@/lib/utils'

describe('formatPrice', () => {
  it('formata zero', () => {
    expect(formatPrice(0)).toContain('0,00')
  })

  it('formata valor inteiro', () => {
    expect(formatPrice(25)).toContain('25,00')
  })

  it('formata centavos', () => {
    expect(formatPrice(25.90)).toContain('25,90')
  })

  it('formata milhares com ponto separador', () => {
    expect(formatPrice(1000)).toContain('1.000,00')
  })

  it('inclui símbolo do real', () => {
    expect(formatPrice(10)).toContain('R$')
  })

  it('arredonda terceiro decimal', () => {
    expect(formatPrice(1.999)).toContain('2,00')
  })
})

describe('formatPhone', () => {
  it('formata celular com 11 dígitos', () => {
    expect(formatPhone('62999999999')).toBe('(62) 99999-9999')
  })

  it('retorna dígitos sem formatação para número com 10 dígitos (função espera 11)', () => {
    // utils.formatPhone só reconhece o padrão de 11 dígitos (celular BR)
    expect(formatPhone('6233334444')).toBe('6233334444')
  })

  it('remove não-dígitos antes de formatar', () => {
    expect(formatPhone('(62) 99999-9999')).toBe('(62) 99999-9999')
  })

  it('retorna vazio para string vazia', () => {
    expect(formatPhone('')).toBe('')
  })

  it('retorna vazio para string só de letras', () => {
    expect(formatPhone('abcdef')).toBe('')
  })
})
