import { ShoppingBag } from 'lucide-react'
import Link from 'next/link'

import { CustomerCredentialsRow } from '@/components/employee/CustomerCredentialsRow'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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

    // ponytail: showHiddenFields so we can read `password` (Payload normally
    // strips it for non-self reads). We rely on requireRole to gate access.
    const users = await payload.find({
        collection: 'users',
        limit: 200,
        sort: '-createdAt',
        depth: 0,
        overrideAccess: true,
        showHiddenFields: true,
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
                                <TableHead>{t('employee.customers.table.phone')}</TableHead>
                                <TableHead>{t('employee.customers.table.address')}</TableHead>
                                <TableHead>{t('employee.customers.table.role')}</TableHead>
                                <TableHead>{t('employee.customers.table.registeredAt')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.docs.map((u) => {
                                const addr = u.addresses?.[0]
                                return (
                                    <TableRow key={u.id}>
                                        <TableCell className="font-medium">
                                            {[u.firstName, u.lastName]
                                                .filter(Boolean)
                                                .join(' ') || '—'}
                                        </TableCell>
                                        <TableCell>
                                            {u.phone ? (
                                                <CustomerCredentialsRow
                                                    phone={u.phone}
                                                    password={
                                                        u.firstLoginAt ? null : u.password ?? null
                                                    }
                                                />
                                            ) : (
                                                '—'
                                            )}
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            {addr ? (
                                                <div>
                                                    <div>{addr.fullName}</div>
                                                    <div className="text-muted-foreground">{addr.address}</div>
                                                    <div className="text-muted-foreground">
                                                        {addr.city}
                                                        {addr.province ? `، ${addr.province}` : ''}
                                                    </div>
                                                </div>
                                            ) : (
                                                '—'
                                            )}
                                        </TableCell>
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
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                render={
                                                    <Link
                                                        href={`${localeHref(locale, '/employee/orders')}?user=${u.id}`}
                                                    />
                                                }
                                            >
                                                <ShoppingBag className="size-4" />
                                                {t('employee.customers.table.viewOrders')}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    )
}
