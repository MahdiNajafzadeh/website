import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { requireRole } from '@/lib/auth-server'
import { formatDate } from '@/lib/format'
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
        title: t('employee.customers.metaTitle'),
    }
}

const roleKey = (role: string | null | undefined): 'admin' | 'employee' | 'customer' => {
    if (role === 'admin') return 'admin'
    if (role === 'employee') return 'employee'
    return 'customer'
}

export default async function EmployeeCustomersPage(props: { params: Params }) {
    const locale: Locale = ensureLocale((await props.params).locale)
    const { t } = getTranslator(locale)
    await requireRole(['employee', 'admin'], localeHref(locale, '/employee/customers'))
    const payload = await getPayload({ config })

    const users = await payload.find({
        collection: 'users',
        limit: 200,
        sort: '-createdAt',
        depth: 0,
    })

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="mb-6 text-3xl font-bold">{t('employee.customers.title')}</h1>

            {users.docs.length === 0 ? (
                <Card className="p-10 text-center text-muted-foreground">
                    {t('employee.customers.empty')}
                </Card>
            ) : (
                <div className="overflow-x-auto rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('employee.customers.table.name')}</TableHead>
                                <TableHead>{t('employee.customers.table.email')}</TableHead>
                                <TableHead>{t('employee.customers.table.phone')}</TableHead>
                                <TableHead>{t('employee.customers.table.role')}</TableHead>
                                <TableHead>{t('employee.customers.table.registeredAt')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.docs.map((u) => (
                                <TableRow key={u.id}>
                                    <TableCell className="font-medium">{u.name}</TableCell>
                                    <TableCell dir="ltr">{u.email}</TableCell>
                                    <TableCell dir="ltr">{u.phone ?? '—'}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                u.role === 'admin'
                                                    ? 'default'
                                                    : u.role === 'employee'
                                                      ? 'secondary'
                                                      : 'outline'
                                            }
                                        >
                                            {t(`layout.role.${roleKey(u.role)}`)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {formatDate(u.createdAt, locale)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    )
}
