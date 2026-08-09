import { EmployeeOrdersTable } from '@/components/employee/EmployeeOrdersTable'
import { requireRole } from '@/lib/auth-server'
import type { Locale } from '@/lib/locale'
import { ensureLocale, localeHref } from '@/lib/locale'
import { getTranslator } from '@/lib/i18n'
import { getPayload } from 'payload'
import config from '@payload-config'

type Params = Promise<{ locale: string }>
type SearchParams = Promise<{ status?: string }>

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
    const where = params.status
        ? ({ status: { equals: params.status } } as const)
        : ({} as Record<string, never>)
    const orders = await payload.find({
        collection: 'orders',
        where,
        limit: 100,
        sort: '-createdAt',
        depth: 2,
        locale,
    })

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="mb-6 text-3xl font-bold">{t('employee.orders.title')}</h1>
            <EmployeeOrdersTable orders={orders.docs} currentStatus={params.status} locale={locale} />
        </div>
    )
}
