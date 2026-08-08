'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { formatPriceToman } from '@/lib/format'
import { clearCart } from '@/lib/cart'
import { useCart } from '@/lib/use-cart'

type AddressShape = {
    fullName?: string
    phone?: string
    address?: string
    city?: string
    province?: string
}

type Props = {
    user: { id: number | string; email: string; name?: string | null; phone?: string | null }
    defaultAddress?: AddressShape
}

export const CheckoutForm = ({ user, defaultAddress }: Props) => {
    const router = useRouter()
    const { items, total } = useCart()
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (items.length === 0) {
            setError('سبد خرید شما خالی است.')
            return
        }
        setSubmitting(true)
        setError(null)
        const formData = new FormData(event.currentTarget)

        const shippingAddress = {
            fullName: String(formData.get('fullName') ?? ''),
            phone: String(formData.get('phone') ?? ''),
            address: String(formData.get('address') ?? ''),
            city: String(formData.get('city') ?? ''),
            province: String(formData.get('province') ?? ''),
        }

        const payload = {
            user: user.id,
            items: items.map((i) => ({
                product: i.productId,
                quantity: i.quantity,
                price: i.price,
            })),
            total,
            status: 'pending',
            shippingAddress,
            notes: formData.get('notes') ? String(formData.get('notes')) : undefined,
        }

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload),
            })
            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                throw new Error(
                    data?.errors?.[0]?.message ?? data?.message ?? 'خطا در ثبت سفارش',
                )
            }
            clearCart()
            setSuccess(true)
            window.setTimeout(() => router.push('/orders'), 1500)
        } catch (e) {
            setError(e instanceof Error ? e.message : 'خطای ناشناخته')
        } finally {
            setSubmitting(false)
        }
    }

    if (success) {
        return (
            <Alert>
                <CheckCircle2 className="size-4" />
                <AlertTitle>سفارش ثبت شد</AlertTitle>
                <AlertDescription>
                    در حال انتقال به صفحه سفارش‌های شما...
                </AlertDescription>
            </Alert>
        )
    }

    return (
        <form onSubmit={onSubmit} className="grid gap-6 md:grid-cols-[1fr_320px]">
            <Card>
                <CardHeader>
                    <CardTitle>اطلاعات ارسال</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2 sm:grid-cols-2">
                        <div className="grid gap-1.5">
                            <Label htmlFor="fullName">نام و نام خانوادگی</Label>
                            <Input
                                id="fullName"
                                name="fullName"
                                required
                                defaultValue={defaultAddress?.fullName ?? user.name ?? ''}
                            />
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="phone">شماره تماس</Label>
                            <Input
                                id="phone"
                                name="phone"
                                required
                                type="tel"
                                defaultValue={defaultAddress?.phone ?? user.phone ?? ''}
                            />
                        </div>
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor="address">آدرس کامل</Label>
                        <Textarea
                            id="address"
                            name="address"
                            required
                            rows={3}
                            defaultValue={defaultAddress?.address ?? ''}
                        />
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                        <div className="grid gap-1.5">
                            <Label htmlFor="city">شهر</Label>
                            <Input
                                id="city"
                                name="city"
                                required
                                defaultValue={defaultAddress?.city ?? ''}
                            />
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="province">استان</Label>
                            <Input
                                id="province"
                                name="province"
                                required
                                defaultValue={defaultAddress?.province ?? ''}
                            />
                        </div>
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor="notes">یادداشت (اختیاری)</Label>
                        <Textarea id="notes" name="notes" rows={2} />
                    </div>

                    {error ? (
                        <Alert variant="destructive">
                            <AlertCircle className="size-4" />
                            <AlertTitle>خطا</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    ) : null}
                </CardContent>
            </Card>

            <Card className="h-fit">
                <CardHeader>
                    <CardTitle>خلاصه سفارش</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-1.5 text-sm">
                        {items.map((item) => (
                            <li
                                key={String(item.productId)}
                                className="flex justify-between gap-2 text-muted-foreground"
                            >
                                <span className="line-clamp-1">
                                    {item.name} × {item.quantity}
                                </span>
                                <span>{formatPriceToman(item.price * item.quantity)}</span>
                            </li>
                        ))}
                    </ul>
                    <Separator className="my-3" />
                    <div className="flex items-center justify-between">
                        <span className="font-medium">جمع کل:</span>
                        <span className="text-lg font-bold">{formatPriceToman(total)}</span>
                    </div>
                    <Button type="submit" disabled={submitting || items.length === 0} className="mt-4 w-full">
                        {submitting ? 'در حال ثبت...' : 'ثبت سفارش'}
                    </Button>
                </CardContent>
            </Card>
        </form>
    )
}