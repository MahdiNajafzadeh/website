'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

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
import { formatPriceToman } from '@/lib/format'
import type { Order } from '@/payload-types'

const STATUS_OPTIONS = [
    { value: 'pending', label: 'در انتظار پرداخت' },
    { value: 'processing', label: 'در حال پردازش' },
    { value: 'shipped', label: 'ارسال شد' },
    { value: 'delivered', label: 'تحویل شد' },
    { value: 'cancelled', label: 'لغو شد' },
] as const

const STATUS_LABELS: Record<string, string> = Object.fromEntries(
    STATUS_OPTIONS.map((s) => [s.value, s.label]),
)

type Props = {
    orders: Order[]
    currentStatus?: string
}

export const EmployeeOrdersTable = ({ orders, currentStatus }: Props) => {
    const router = useRouter()
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
                <Button variant={!currentStatus ? 'default' : 'outline'} size="sm" render={<Link href="/employee/orders" />}>
                    همه
                </Button>
                {STATUS_OPTIONS.map((s) => (
                    <Button
                        key={s.value}
                        variant={currentStatus === s.value ? 'default' : 'outline'}
                        size="sm"
                        render={<Link href={`/employee/orders?status=${s.value}`} />}
                    >
                        {s.label}
                    </Button>
                ))}
            </div>

            {orders.length === 0 ? (
                <div className="rounded-md border p-10 text-center text-sm text-muted-foreground">
                    سفارشی یافت نشد.
                </div>
            ) : (
                <div className="overflow-x-auto rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>شماره</TableHead>
                                <TableHead>مشتری</TableHead>
                                <TableHead>مبلغ</TableHead>
                                <TableHead>وضعیت</TableHead>
                                <TableHead>تاریخ</TableHead>
                                <TableHead>تغییر وضعیت</TableHead>
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
                                        <TableCell>{formatPriceToman(order.total)}</TableCell>
                                        <TableCell>
                                            <Badge>
                                                {STATUS_LABELS[order.status ?? ''] ?? order.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {order.createdAt}
                                        </TableCell>
                                        <TableCell>
                                            <Select
                                                value={order.status ?? undefined}
                                                onValueChange={(v) => updateStatus(order.id, v)}
                                            >
                                                <SelectTrigger className="w-44">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {STATUS_OPTIONS.map((s) => (
                                                        <SelectItem
                                                            key={s.value}
                                                            value={s.value}
                                                        >
                                                            {s.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {updating === String(order.id) ? (
                                                <span className="ms-2 text-xs text-muted-foreground">
                                                    ذخیره...
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