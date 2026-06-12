// Gerador de QR Code Pix — padrão EMV (Banco Central do Brasil)
// Chave Pix via variável de ambiente

function formatEMV(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0')
  return `${id}${len}${value}`
}

function crc16(str: string): string {
  let crc = 0xFFFF
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1
    }
  }
  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0')
}

export interface PixPayload {
  key: string
  keyType: 'PHONE' | 'CPF' | 'EMAIL' | 'EVP'
  merchantName: string
  merchantCity: string
  amount: number
  txId: string
  description?: string
}

export function generatePixEMV(payload: PixPayload): string {
  const key = payload.keyType === 'PHONE'
    ? `+55${payload.key.replace(/\D/g, '')}`
    : payload.key

  const merchantAccountInfo = formatEMV('00', 'BR.GOV.BCB.PIX') +
    formatEMV('01', key) +
    (payload.description ? formatEMV('02', payload.description.slice(0, 72)) : '')

  const emv =
    formatEMV('00', '01') +
    formatEMV('26', merchantAccountInfo) +
    formatEMV('52', '0000') +
    formatEMV('53', '986') +
    formatEMV('54', payload.amount.toFixed(2)) +
    formatEMV('58', 'BR') +
    formatEMV('59', payload.merchantName.slice(0, 25)) +
    formatEMV('60', payload.merchantCity.slice(0, 15)) +
    formatEMV('62', formatEMV('05', payload.txId.slice(0, 25))) +
    '6304'

  return emv + crc16(emv)
}

export function generateTxId(): string {
  return 'byclara' + Date.now().toString(36).toUpperCase()
}
