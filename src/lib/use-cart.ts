'use client'

import { useEffect, useState } from 'react'

import {
    cartCount,
    cartTotal,
    readCart,
    type CartItem,
} from '@/lib/cart'

export const useCart = () => {
    const [items, setItems] = useState<CartItem[]>([])

    useEffect(() => {
        setItems(readCart())
        const onChange = () => setItems(readCart())
        window.addEventListener('cart:change', onChange)
        window.addEventListener('storage', onChange)
        return () => {
            window.removeEventListener('cart:change', onChange)
            window.removeEventListener('storage', onChange)
        }
    }, [])

    return {
        items,
        count: cartCount(items),
        total: cartTotal(items),
    }
}