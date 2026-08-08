import { CartView } from '@/components/cart/CartView'

export const metadata = {
    title: 'سبد خرید | آبفارین',
}

export default function CartPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="mb-6 text-3xl font-bold">سبد خرید</h1>
            <CartView />
        </div>
    )
}