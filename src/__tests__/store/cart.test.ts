import { describe, it, expect, beforeEach } from 'vitest'
import { useCartStore, type CartItem } from '@/store/cart'

const ITEM_A: CartItem = {
  id: 'prod-a',
  productId: 'prod-a',
  name: 'Pulseira Rosa',
  price: 25.00,
  image: '/img/rosa.jpg',
  weightGrams: 15,
  quantity: 1,
}

const ITEM_B: CartItem = {
  id: 'prod-b',
  productId: 'prod-b',
  name: 'Pulseira Azul',
  price: 30.00,
  image: '/img/azul.jpg',
  weightGrams: 18,
  quantity: 2,
}

beforeEach(() => {
  useCartStore.setState({ items: [] })
})

describe('addItem', () => {
  it('adiciona um item novo', () => {
    useCartStore.getState().addItem(ITEM_A)
    expect(useCartStore.getState().items).toHaveLength(1)
  })

  it('incrementa quantity se o item já existe', () => {
    useCartStore.getState().addItem(ITEM_A)
    useCartStore.getState().addItem({ ...ITEM_A, quantity: 2 })
    const { items } = useCartStore.getState()
    expect(items).toHaveLength(1)
    expect(items[0].quantity).toBe(3)
  })

  it('adiciona itens com id diferentes separadamente', () => {
    useCartStore.getState().addItem(ITEM_A)
    useCartStore.getState().addItem(ITEM_B)
    expect(useCartStore.getState().items).toHaveLength(2)
  })

  it('preserva a personalização do item', () => {
    const item: CartItem = {
      ...ITEM_A,
      personalizacao: { nomePersonalizado: 'Maria', coresEscolhidas: ['#ff0000'] },
    }
    useCartStore.getState().addItem(item)
    expect(useCartStore.getState().items[0].personalizacao?.nomePersonalizado).toBe('Maria')
  })
})

describe('removeItem', () => {
  it('remove item pelo id', () => {
    useCartStore.getState().addItem(ITEM_A)
    useCartStore.getState().removeItem(ITEM_A.id)
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('não faz nada para id inexistente', () => {
    useCartStore.getState().addItem(ITEM_A)
    useCartStore.getState().removeItem('nao-existe')
    expect(useCartStore.getState().items).toHaveLength(1)
  })

  it('remove só o item correto quando há múltiplos', () => {
    useCartStore.getState().addItem(ITEM_A)
    useCartStore.getState().addItem(ITEM_B)
    useCartStore.getState().removeItem(ITEM_A.id)
    const { items } = useCartStore.getState()
    expect(items).toHaveLength(1)
    expect(items[0].id).toBe(ITEM_B.id)
  })
})

describe('updateQty', () => {
  it('atualiza a quantidade', () => {
    useCartStore.getState().addItem(ITEM_A)
    useCartStore.getState().updateQty(ITEM_A.id, 5)
    expect(useCartStore.getState().items[0].quantity).toBe(5)
  })

  it('remove o item quando quantidade vai a 0', () => {
    useCartStore.getState().addItem(ITEM_A)
    useCartStore.getState().updateQty(ITEM_A.id, 0)
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('remove o item para quantidade negativa', () => {
    useCartStore.getState().addItem(ITEM_A)
    useCartStore.getState().updateQty(ITEM_A.id, -1)
    expect(useCartStore.getState().items).toHaveLength(0)
  })
})

describe('clearCart', () => {
  it('esvazia o carrinho', () => {
    useCartStore.getState().addItem(ITEM_A)
    useCartStore.getState().addItem(ITEM_B)
    useCartStore.getState().clearCart()
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('não falha em carrinho já vazio', () => {
    expect(() => useCartStore.getState().clearCart()).not.toThrow()
  })
})

describe('subtotal', () => {
  it('calcula subtotal correto', () => {
    useCartStore.getState().addItem(ITEM_A) // 25 * 1 = 25
    useCartStore.getState().addItem(ITEM_B) // 30 * 2 = 60
    expect(useCartStore.getState().subtotal()).toBe(85)
  })

  it('retorna 0 para carrinho vazio', () => {
    expect(useCartStore.getState().subtotal()).toBe(0)
  })
})

describe('totalItems', () => {
  it('soma todas as quantities', () => {
    useCartStore.getState().addItem(ITEM_A) // qty 1
    useCartStore.getState().addItem(ITEM_B) // qty 2
    expect(useCartStore.getState().totalItems()).toBe(3)
  })

  it('retorna 0 para carrinho vazio', () => {
    expect(useCartStore.getState().totalItems()).toBe(0)
  })
})

describe('totalWeight', () => {
  it('calcula peso total em gramas', () => {
    useCartStore.getState().addItem(ITEM_A) // 15g * 1 = 15
    useCartStore.getState().addItem(ITEM_B) // 18g * 2 = 36
    expect(useCartStore.getState().totalWeight()).toBe(51)
  })

  it('retorna 0 para carrinho vazio', () => {
    expect(useCartStore.getState().totalWeight()).toBe(0)
  })
})
