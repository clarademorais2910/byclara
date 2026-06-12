import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItemPersonalizacao {
  coresEscolhidas?: string[]
  nomePersonalizado?: string
}

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  image: string
  weightGrams: number
  quantity: number
  personalizacao?: CartItemPersonalizacao
}

interface CartStore {
  items: CartItem[]
  addItem:     (item: CartItem) => void
  removeItem:  (id: string) => void
  updateQty:   (id: string, quantity: number) => void
  clearCart:   () => void
  subtotal:    () => number
  totalItems:  () => number
  totalWeight: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const existing = get().items.find(i => i.id === item.id)
        if (existing) {
          set(s => ({
            items: s.items.map(i =>
              i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
            )
          }))
        } else {
          set(s => ({ items: [...s.items, item] }))
        }
      },

      removeItem: (id) =>
        set(s => ({ items: s.items.filter(i => i.id !== id) })),

      updateQty: (id, quantity) =>
        set(s => ({
          items: quantity <= 0
            ? s.items.filter(i => i.id !== id)
            : s.items.map(i => i.id === id ? { ...i, quantity } : i)
        })),

      clearCart: () => set({ items: [] }),

      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      totalItems: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalWeight: () =>
        get().items.reduce((sum, i) => sum + i.weightGrams * i.quantity, 0),
    }),
    { name: 'byclara-cart' }
  )
)
