import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { isEntregaLocal, buscarEndereco } from '@/lib/frete'

describe('isEntregaLocal', () => {
  it('retorna true para Itaberaí/GO com acento', () => {
    expect(isEntregaLocal('Itaberaí', 'GO')).toBe(true)
  })

  it('retorna true para Itaberai/GO sem acento', () => {
    expect(isEntregaLocal('Itaberai', 'GO')).toBe(true)
  })

  it('é case-insensitive', () => {
    expect(isEntregaLocal('ITABERAÍ', 'go')).toBe(true)
    expect(isEntregaLocal('itaberaí', 'GO')).toBe(true)
  })

  it('retorna false para cidade diferente no mesmo estado', () => {
    expect(isEntregaLocal('Goiânia', 'GO')).toBe(false)
  })

  it('retorna false para Itaberaí em outro estado', () => {
    expect(isEntregaLocal('Itaberaí', 'SP')).toBe(false)
  })

  it('retorna false para cidade vazia', () => {
    expect(isEntregaLocal('', 'GO')).toBe(false)
  })

  it('retorna false para estado vazio', () => {
    expect(isEntregaLocal('Itaberaí', '')).toBe(false)
  })
})

describe('buscarEndereco', () => {
  beforeEach(() => { vi.stubGlobal('fetch', vi.fn()) })
  afterEach(() => { vi.restoreAllMocks() })

  const mockFetch = (body: object) =>
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ json: async () => body })

  it('retorna endereço para CEP válido', async () => {
    mockFetch({
      cep: '76380-000',
      logradouro: 'Praça Getúlio Vargas',
      bairro: 'Centro',
      localidade: 'Itaberaí',
      uf: 'GO',
    })
    const addr = await buscarEndereco('76380000')
    expect(addr.cidade).toBe('Itaberaí')
    expect(addr.estado).toBe('GO')
    expect(addr.valid).toBe(true)
  })

  it('lança erro para CEP com menos de 8 dígitos', async () => {
    await expect(buscarEndereco('12345')).rejects.toThrow('CEP inválido')
  })

  it('lança erro para CEP com mais de 8 dígitos após limpeza', async () => {
    await expect(buscarEndereco('123456789')).rejects.toThrow('CEP inválido')
  })

  it('lança erro quando ViaCEP retorna erro: true', async () => {
    mockFetch({ erro: true })
    await expect(buscarEndereco('00000000')).rejects.toThrow('CEP não encontrado')
  })

  it('remove traço do CEP antes de consultar', async () => {
    mockFetch({ cep: '76380-000', logradouro: '', bairro: '', localidade: 'Itaberaí', uf: 'GO' })
    await buscarEndereco('76380-000')
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('76380000'))
    expect(fetch).not.toHaveBeenCalledWith(expect.stringContaining('76380-000'))
  })

  it('trata logradouro vazio sem erro', async () => {
    mockFetch({ cep: '76380-000', logradouro: '', bairro: '', localidade: 'Itaberaí', uf: 'GO' })
    const addr = await buscarEndereco('76380000')
    expect(addr.logradouro).toBe('')
  })
})
