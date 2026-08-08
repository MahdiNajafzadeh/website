import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { requireUser } from '@/lib/auth-server'
import { formatPriceToman } from '@/lib/format'
import { getPayload } from 'payload'
import config from '@payload-config'

const STATUS_LABELS: Record<string, string> = {
    pending: 'در انتظار پرداخت',
    processing: 'در حال پردازش',
    shipped: 'ارسال شد',
    delivered: 'تحویل شد',
    cancelled: 'لغو شد',
}

export const metadata = {
    title: 'سفارش‌های من | آبفارین',
}

export default async function OrdersPage() {
    const user = await requireUser()
    const payload = await getPayload({ config })

    const orders = await payload.find({
        collection: 'orders',
        where: { user: { equals: user.id } },
        limit: 100,
        sort: '-createdAt',
        depth: 2,
    })

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="mb-6 text-3xl font-bold">سفارش‌های من</h1>

            {orders.docs.length === 0 ? (
                <Card className="p-10 text-center text-muted-foreground">
                    هنوز سفارشی ثبت نکرده‌اید.{' '}
                    <Link href="/products" className="text-primary hover:underline">
                        مشاهده محصولات
                    </Link>
                </Card>
            ) : (
                <div className="space-y-4">
                    {orders.docs.map((order) => (
                        <Card key={order.id} className="p-4">
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <p className="text-sm font-semibold">سفارش #{order.id}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {order.createdAt}
                                    </p>
                                </div>
                                <Badge>{STATUS_LABELS[order.status ?? ''] ?? order.status}</Badge>
                            </div>
                            <ul className="space-y-1.5 text-sm">
                                {order.items?.map((item, i) => (
                                    <li
                                        key={i}
                                        className="flex items-center justify-between text-muted-foreground"
                                    >
                                        <span>
                                            {item.product &&
                                            typeof item.product !== 'number'
                                                ? item.product.name
                                                : `محصول #${item.product}`}{' '}
                                            × {item.quantity}
                                        </span>
                                        <span>
                                            {formatPriceToman((item.price ?? 0) * (item.quantity ?? 0))}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-3 flex items-center justify-between border-t pt-3 text-sm">
                                <span className="font-medium">جمع:</span>
                                <span className="font-bold">{formatPriceToman(order.total)}</span>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}