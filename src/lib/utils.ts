import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatPhone(phone: string): string {
  return phone.replace(/\D/g, '').replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
}
