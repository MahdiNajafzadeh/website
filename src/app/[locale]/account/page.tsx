import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { requireUser } from '@/lib/auth-server'
import { formatDate, formatOrderStatus, formatPriceToman } from '@/lib/format'
import type { Locale } from '@/lib/locale'
import { ensureLocale, localeHref } from '@/lib/locale'
import { getTranslator } from '@/lib/i18n'
import { getPayload } from 'payload'
import config from '@payload-config'

type Params = Promise<{ locale: string }>

export async function generateMetadata({ params }: { params: Params }) {
    const rawLocale = (await params).locale
    const locale: Locale = ensureLocale(rawLocale)
    const { t } = getTranslator(locale)
    return {
        title: t('account.metaTitle'),
    }
}

const roleKey = (role: string | null | undefined): 'admin' | 'employee' | 'customer' => {
    if (role === 'admin') return 'admin'
    if (role === 'employee') return 'employee'
    return 'customer'
}

export default async function AccountPage(props: { params: Params }) {
    const locale: Locale = ensureLocale((await props.params).locale)
    const { t } = getTranslator(locale)
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
        locale,
    })

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="mb-6 text-3xl font-bold">{t('account.title')}</h1>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>{t('account.personalInfo')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('account.field.name')}</span>
                            <span>{me.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('account.field.email')}</span>
                            <span dir="ltr">{me.email}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('account.field.phone')}</span>
                            <span dir="ltr">{me.phone ?? '—'}</span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('account.field.role')}</span>
                            <span>{t(`layout.role.${roleKey(me.role)}`)}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>{t('account.recentOrders')}</CardTitle>
                        <Button variant="ghost" size="sm" render={<Link href={localeHref(locale, '/orders')} />}>
                            {t('account.recentOrders.viewAll')}
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {orders.docs.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                {t('account.recentOrders.empty')}
                            </p>
                        ) : (
                            <ul className="space-y-3">
                                {orders.docs.map((o) => (
                                    <li
                                        key={o.id}
                                        className="flex items-center justify-between rounded-md border p-3 text-sm"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {t('account.recentOrders.itemTitle', { id: o.id })}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDate(o.createdAt, locale)}
                                            </p>
                                        </div>
                                        <div className="text-end">
                                            <p className="font-bold">
                                                {formatPriceToman(o.total, locale)}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatOrderStatus(o.status, locale)}
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
