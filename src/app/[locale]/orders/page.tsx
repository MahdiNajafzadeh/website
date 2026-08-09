import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { requireUser } from '@/lib/auth-server'
import { formatDate, formatOrderStatus, formatPriceToman } from '@/lib/format'
import type { Locale } from '@/lib/locale'
import { ensureLocale, localeHref } from '@/lib/locale'
import { getTranslator } from '@/lib/i18n'
import { localizedValue } from '@/lib/localized'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const rawLocale = (await params).locale
    const locale: Locale = ensureLocale(rawLocale)
    const { t } = getTranslator(locale)
    return {
        title: t('orders.metaTitle'),
    }
}

type Params = Promise<{ locale: string }>

export default async function OrdersPage(props: { params: Params }) {
    const locale: Locale = ensureLocale((await props.params).locale)
    const { t } = getTranslator(locale)
    const user = await requireUser()
    const payload = await getPayload({ config })

    const orders = await payload.find({
        collection: 'orders',
        where: { user: { equals: user.id } },
        limit: 100,
        sort: '-createdAt',
        depth: 2,
        locale,
    })

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="mb-6 text-3xl font-bold">{t('orders.title')}</h1>

            {orders.docs.length === 0 ? (
                <Card className="p-10 text-center text-muted-foreground">
                    {t('orders.empty')}{' '}
                    <Link
                        href={localeHref(locale, '/products')}
                        className="text-primary hover:underline"
                    >
                        {t('orders.empty.browse')}
                    </Link>
                </Card>
            ) : (
                <div className="space-y-4">
                    {orders.docs.map((order) => (
                        <Card key={order.id} className="p-4">
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <p className="text-sm font-semibold">
                                        {t('orders.itemTitle', { id: order.id })}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDate(order.createdAt, locale)}
                                    </p>
                                </div>
                                <Badge>
                                    {formatOrderStatus(order.status, locale)}
                                </Badge>
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
                                                ? localizedValue(item.product.name, locale)
                                                : t('orders.productFallback', { id: String(item.product) })}{' '}
                                            × {item.quantity}
                                        </span>
                                        <span>
                                            {formatPriceToman((item.price ?? 0) * (item.quantity ?? 0), locale)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-3 flex items-center justify-between border-t pt-3 text-sm">
                                <span className="font-medium">{t('orders.itemTotal')}</span>
                                <span className="font-bold">{formatPriceToman(order.total, locale)}</span>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
