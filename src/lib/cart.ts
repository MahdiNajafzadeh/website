export type CartItem = {
    productId: number | string
    slug: string
    name: string
    price: number
    image?: string | null
    quantity: number
}

const STORAGE_KEY = 'abafarin.cart.v1'

const isBrowser = () => typeof window !== 'undefined'

export const readCart = (): CartItem[] => {
    if (!isBrowser()) return []
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        if (!raw) return []
        const parsed = JSON.parse(raw) as CartItem[]
        return Array.isArray(parsed) ? parsed : []
    } catch {
        return []
    }
}

export const writeCart = (items: CartItem[]): void => {
    if (!isBrowser()) return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    window.dispatchEvent(new CustomEvent('cart:change'))
}

export const addToCart = (item: Omit<CartItem, 'quantity'> & { quantity?: number }): CartItem[] => {
    const items = readCart()
    const existing = items.find((i) => i.productId === item.productId)
    const quantity = item.quantity ?? 1
    let next: CartItem[]
    if (existing) {
        next = items.map((i) =>
            i.productId === item.productId ? { ...i, quantity: i.quantity + quantity } : i,
        )
    } else {
        next = [...items, { ...item, quantity }]
    }
    writeCart(next)
    return next
}

export const updateQuantity = (productId: CartItem['productId'], quantity: number): CartItem[] => {
    const items = readCart()
    const next =
        quantity <= 0
            ? items.filter((i) => i.productId !== productId)
            : items.map((i) => (i.productId === productId ? { ...i, quantity } : i))
    writeCart(next)
    return next
}

export const removeFromCart = (productId: CartItem['productId']): CartItem[] => {
    const next = readCart().filter((i) => i.productId !== productId)
    writeCart(next)
    return next
}

export const clearCart = (): void => {
    writeCart([])
}

export const cartTotal = (items: CartItem[]): number =>
    items.reduce((sum, i) => sum + i.price * i.quantity, 0)

export const cartCount = (items: CartItem[]): number =>
    items.reduce((sum, i) => sum + i.quantity, 0)