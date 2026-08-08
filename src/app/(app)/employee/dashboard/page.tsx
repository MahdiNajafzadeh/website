import Link from 'next/link'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { requireRole } from '@/lib/auth-server'
import { formatPriceToman } from '@/lib/format'
import { getPayload } from 'payload'
import config from '@payload-config'

export const metadata = {
    title: 'پنل کارمندی | آبفارین',
}

export default async function EmployeeDashboardPage() {
    const me = await requireRole(['employee', 'admin'], '/employee/dashboard')
    const payload = await getPayload({ config })

    const [pending, processing, todayUsers, lowStock] = await Promise.all([
        payload.count({ collection: 'orders', where: { status: { equals: 'pending' } } }),
        payload.count({ collection: 'orders', where: { status: { equals: 'processing' } } }),
        payload.count({ collection: 'users' }),
        payload.find({
            collection: 'products',
            where: { stock: { less_than_equal: 5 } },
            limit: 10,
            sort: 'stock',
        }),
    ])

    const recentOrders = await payload.find({
        collection: 'orders',
        limit: 5,
        sort: '-createdAt',
        depth: 1,
    })

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="mb-2 text-3xl font-bold">پنل کارمندی</h1>
            <p className="mb-6 text-sm text-muted-foreground">سلام {me.name}، خلاصه‌ای از وضعیت فروشگاه:</p>

            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">سفارش‌های در انتظار</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{pending.totalDocs}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">در حال پردازش</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{processing.totalDocs}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">تعداد مشتریان</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{todayUsers.totalDocs}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">محصولات با موجودی کم</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{lowStock.totalDocs}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>آخرین سفارش‌ها</CardTitle>
                        <Link
                            href="/employee/orders"
                            className="text-xs text-muted-foreground hover:text-foreground"
                        >
                            مشاهده همه ←
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {recentOrders.docs.length === 0 ? (
                            <p className="text-sm text-muted-foreground">سفارشی ثبت نشده.</p>
                        ) : (
                            <ul className="space-y-2 text-sm">
                                {recentOrders.docs.map((o) => (
                                    <li
                                        key={o.id}
                                        className="flex items-center justify-between rounded-md border p-2"
                                    >
                                        <span>#{o.id}</span>
                                        <span>{formatPriceToman(o.total)}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {o.status}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>هشدار موجودی</CardTitle>
                        <Link
                            href="/employee/customers"
                            className="text-xs text-muted-foreground hover:text-foreground"
                        >
                            مدیریت مشتریان ←
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {lowStock.docs.length === 0 ? (
                            <p className="text-sm text-muted-foreground">همه محصولات موجودی کافی دارند.</p>
                        ) : (
                            <ul className="space-y-2 text-sm">
                                {lowStock.docs.map((p) => (
                                    <li
                                        key={p.id}
                                        className="flex items-center justify-between rounded-md border p-2"
                                    >
                                        <span className="line-clamp-1">{p.name}</span>
                                        <span className="text-xs text-destructive">
                                            موجودی: {p.stock}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}