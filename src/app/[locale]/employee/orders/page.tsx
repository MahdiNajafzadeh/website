import Link from 'next/link'

import { EmployeeOrdersTable } from '@/components/employee/EmployeeOrdersTable'
import { Button } from '@/components/ui/button'
import { requireRole } from '@/lib/auth-server'
import type { Locale } from '@/lib/locale'
import { ensureLocale, localeHref } from '@/lib/locale'
import { getTranslator } from '@/lib/i18n'
import { getPayload } from 'payload'
import config from '@payload-config'

type Params = Promise<{ locale: string }>
type SearchParams = Promise<{ status?: string; user?: string }>

export async function generateMetadata({ params }: { params: Params }) {
    const rawLocale = (await params).locale
    const locale: Locale = ensureLocale(rawLocale)
    const { t } = getTranslator(locale)
    return {
        title: t('employee.orders.metaTitle'),
    }
}

export default async function EmployeeOrdersPage(props: {
    searchParams: SearchParams
    params: Params
}) {
    const locale: Locale = ensureLocale((await props.params).locale)
    const { t } = getTranslator(locale)
    await requireRole(['employee', 'admin'], localeHref(locale, '/employee/orders'))
    const payload = await getPayload({ config })

    const params = await props.searchParams
    const where: { status?: { equals: string }; user?: { equals: string } } = {}
    if (params.status) where.status = { equals: params.status }
    if (params.user) where.user = { equals: params.user }

    const orders = await payload.find({
        collection: 'orders',
        where,
        limit: 100,
        sort: '-createdAt',
        depth: 2,
        locale,
    })

    let filteredCustomerName: string | null = null
    if (params.user) {
        try {
            const u = await payload.findByID({
                collection: 'users',
                id: params.user,
                depth: 0,
            })
            filteredCustomerName =
                [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || u.email
        } catch {
            filteredCustomerName = null
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="mb-6 text-3xl font-bold">{t('employee.orders.title')}</h1>

            {params.user ? (
                <div className="mb-4 flex flex-wrap items-center gap-2 rounded-md border bg-muted/40 p-3 text-sm">
                    <span>{t('employee.orders.filter.customer')}:</span>
                    <strong dir="ltr">{filteredCustomerName ?? `#${params.user}`}</strong>
                    <Button
                        variant="ghost"
                        size="sm"
                        render={<Link href={localeHref(locale, '/employee/customers')} />}
                    >
                        ← {t('employee.customers.title')}
                    </Button>
                </div>
            ) : null}

            <EmployeeOrdersTable
                orders={orders.docs}
                currentStatus={params.status}
                locale={locale}
            />
        </div>
    )
}
