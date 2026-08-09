'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { useTranslation } from '@/components/i18n/TranslationProvider'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { formatDate, formatOrderStatus, formatPriceToman } from '@/lib/format'
import type { Locale } from '@/lib/locale'
import { localeHref } from '@/lib/locale'
import type { Order } from '@/payload-types'

const STATUS_VALUES = [
    'pending',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
] as const

type StatusValue = (typeof STATUS_VALUES)[number]

const statusKey = (value: StatusValue): string => `employee.orders.status.${value}`

type Props = {
    orders: Order[]
    currentStatus?: string
    locale: Locale
}

export const EmployeeOrdersTable = ({ orders, currentStatus, locale }: Props) => {
    const router = useRouter()
    const { t } = useTranslation()
    const [updating, setUpdating] = useState<string | null>(null)

    const updateStatus = async (id: number | string, status: string) => {
        setUpdating(String(id))
        try {
            await fetch(`/api/orders/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ status }),
            })
            router.refresh()
        } finally {
            setUpdating(null)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
                <Button
                    variant={!currentStatus ? 'default' : 'outline'}
                    size="sm"
                    render={<Link href={localeHref(locale, '/employee/orders')} />}
                >
                    {t('employee.orders.filter.all')}
                </Button>
                {STATUS_VALUES.map((value) => (
                    <Button
                        key={value}
                        variant={currentStatus === value ? 'default' : 'outline'}
                        size="sm"
                        render={
                            <Link
                                href={`${localeHref(locale, '/employee/orders')}?status=${value}`}
                            />
                        }
                    >
                        {t(statusKey(value))}
                    </Button>
                ))}
            </div>

            {orders.length === 0 ? (
                <div className="rounded-md border p-10 text-center text-sm text-muted-foreground">
                    {t('employee.orders.empty')}
                </div>
            ) : (
                <div className="overflow-x-auto rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('employee.orders.table.id')}</TableHead>
                                <TableHead>{t('employee.orders.table.customer')}</TableHead>
                                <TableHead>{t('employee.orders.table.total')}</TableHead>
                                <TableHead>{t('employee.orders.table.status')}</TableHead>
                                <TableHead>{t('employee.orders.table.date')}</TableHead>
                                <TableHead>{t('employee.orders.table.changeStatus')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map((order) => {
                                const customer =
                                    order.user && typeof order.user !== 'number'
                                        ? order.user
                                        : null
                                return (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-medium">#{order.id}</TableCell>
                                        <TableCell>
                                            {customer
                                                ? `${customer.name} (${customer.email})`
                                                : `#${order.user}`}
                                        </TableCell>
                                        <TableCell>{formatPriceToman(order.total, locale)}</TableCell>
                                        <TableCell>
                                            <Badge>
                                                {formatOrderStatus(order.status, locale)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {formatDate(order.createdAt, locale)}
                                        </TableCell>
                                        <TableCell>
                                            <Select
                                                value={order.status ?? undefined}
                                                onValueChange={(v) => updateStatus(order.id, String(v))}
                                            >
                                                <SelectTrigger className="w-44">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {STATUS_VALUES.map((value) => (
                                                        <SelectItem
                                                            key={value}
                                                            value={value}
                                                        >
                                                            {t(statusKey(value))}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {updating === String(order.id) ? (
                                                <span className="ms-2 text-xs text-muted-foreground">
                                                    {t('employee.orders.table.saving')}
                                                </span>
                                            ) : null}
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
