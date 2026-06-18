export const WHATSAPP = '5562996394315'

export function waUrl(msg: string): string {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`
}
