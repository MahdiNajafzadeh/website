import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { requireUser } from '@/lib/auth-server'
import { formatPriceToman } from '@/lib/format'
import { getPayload } from 'payload'
import config from '@payload-config'

export const metadata = {
    title: 'حساب کاربری | آبفارین',
}

export default async function AccountPage() {
    const user = await requireUser()
    const payload = await getPayload({ config })

    const me = await payload.findByID({
        collection: 'users',
        id: user.id,
        depth: 0,
    })

    const orders = await payload.find({
        collection: 'orders',
        where: { user: { equals: user.id } },
        limit: 5,
        sort: '-createdAt',
        depth: 1,
    })

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="mb-6 text-3xl font-bold">حساب کاربری</h1>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>اطلاعات شخصی</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">نام:</span>
                            <span>{me.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">ایمیل:</span>
                            <span dir="ltr">{me.email}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">تلفن:</span>
                            <span dir="ltr">{me.phone ?? '—'}</span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">نقش:</span>
                            <span>
                                {me.role === 'admin'
                                    ? 'مدیر'
                                    : me.role === 'employee'
                                      ? 'کارمند'
                                      : 'مشتری'}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>سفارش‌های اخیر</CardTitle>
                        <Button variant="ghost" size="sm" render={<Link href="/orders" />}>
                            همه سفارش‌ها
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {orders.docs.length === 0 ? (
                            <p className="text-sm text-muted-foreground">هنوز سفارشی ثبت نکرده‌اید.</p>
                        ) : (
                            <ul className="space-y-3">
                                {orders.docs.map((o) => (
                                    <li
                                        key={o.id}
                                        className="flex items-center justify-between rounded-md border p-3 text-sm"
                                    >
                                        <div>
                                            <p className="font-medium">سفارش #{o.id}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {o.createdAt}
                                            </p>
                                        </div>
                                        <div className="text-end">
                                            <p className="font-bold">
                                                {formatPriceToman(o.total)}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {o.status}
                                            </p>
                                        </div>
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