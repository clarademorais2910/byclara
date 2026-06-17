import { vi, beforeEach } from 'vitest'

// localStorage available via jsdom — just clear between tests
beforeEach(() => {
  localStorage.clear()
})

// Default env vars used across tests
process.env.ADMIN_PASSWORD      = 'senha-teste-segura-123'
process.env.PIX_KEY             = '62999999999'
process.env.PIX_KEY_TYPE        = 'PHONE'
process.env.PIX_MERCHANT_NAME   = 'By Clara'
process.env.PIX_MERCHANT_CITY   = 'Itaberai'
process.env.FRETE_LOCAL_CIDADE  = 'Itaberaí'
process.env.FRETE_LOCAL_ESTADO  = 'GO'
process.env.RESEND_API_KEY      = 'PREENCHER_DEPOIS'

// Silence console.error in tests
vi.spyOn(console, 'error').mockImplementation(() => {})
