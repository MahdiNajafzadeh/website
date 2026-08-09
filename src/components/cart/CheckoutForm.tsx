'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

import { useTranslation } from '@/components/i18n/TranslationProvider'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { formatPriceToman } from '@/lib/format'
import { clearCart } from '@/lib/cart'
import type { Locale } from '@/lib/locale'
import { localeHref } from '@/lib/locale'
import { useCart } from '@/lib/use-cart'
import { useBeforeUnload } from '@/lib/use-before-unload'

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
    locale: Locale
}

export const CheckoutForm = ({ user, defaultAddress, locale }: Props) => {
    const router = useRouter()
    const { t } = useTranslation()
    const { items, total } = useCart()
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [dirty, setDirty] = useState(false)
    useBeforeUnload(dirty && !submitting && !success)

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (items.length === 0) {
            setError(t('cart.checkout.empty'))
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
                    data?.errors?.[0]?.message ?? data?.message ?? t('cart.checkout.errorFallback'),
                )
            }
            clearCart()
            setSuccess(true)
            window.setTimeout(() => router.push(localeHref(locale, '/orders')), 1500)
        } catch (e) {
            setError(e instanceof Error ? e.message : t('common.unknownError'))
        } finally {
            setSubmitting(false)
        }
    }

    if (success) {
        return (
            <Alert role="status" aria-live="polite">
                <CheckCircle2 className="size-4" aria-hidden="true" />
                <AlertTitle>{t('cart.checkout.successTitle')}</AlertTitle>
                <AlertDescription>{t('cart.checkout.successBody')}</AlertDescription>
            </Alert>
        )
    }

    return (
        <form onSubmit={onSubmit} className="grid gap-6 md:grid-cols-[1fr_320px]" onChange={() => setDirty(true)}>
            <Card>
                <CardHeader>
                    <CardTitle>{t('cart.checkout.shipping')}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2 sm:grid-cols-2">
                        <div className="grid gap-1.5">
                            <Label htmlFor="fullName">{t('cart.checkout.fullName')}</Label>
                            <Input
                                id="fullName"
                                name="fullName"
                                required
                                autoComplete="name"
                                defaultValue={defaultAddress?.fullName ?? user.name ?? ''}
                            />
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="phone">{t('cart.checkout.phone')}</Label>
                            <Input
                                id="phone"
                                name="phone"
                                required
                                type="tel"
                                inputMode="tel"
                                autoComplete="tel"
                                defaultValue={defaultAddress?.phone ?? user.phone ?? ''}
                            />
                        </div>
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor="address">{t('cart.checkout.address')}</Label>
                        <Textarea
                            id="address"
                            name="address"
                            required
                            rows={3}
                            autoComplete="street-address"
                            defaultValue={defaultAddress?.address ?? ''}
                        />
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                        <div className="grid gap-1.5">
                            <Label htmlFor="city">{t('cart.checkout.city')}</Label>
                            <Input
                                id="city"
                                name="city"
                                required
                                autoComplete="address-level2"
                                defaultValue={defaultAddress?.city ?? ''}
                            />
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="province">{t('cart.checkout.province')}</Label>
                            <Input
                                id="province"
                                name="province"
                                required
                                autoComplete="address-level1"
                                defaultValue={defaultAddress?.province ?? ''}
                            />
                        </div>
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor="notes">{t('cart.checkout.notes')}</Label>
                        <Textarea id="notes" name="notes" rows={2} />
                    </div>

                    {error ? (
                        <Alert role="alert" aria-live="assertive" variant="destructive">
                            <AlertCircle className="size-4" aria-hidden="true" />
                            <AlertTitle>{t('common.error')}</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    ) : null}
                </CardContent>
            </Card>

            <Card className="h-fit">
                <CardHeader>
                    <CardTitle>{t('cart.checkout.summary')}</CardTitle>
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
                                <span>{formatPriceToman(item.price * item.quantity, locale)}</span>
                            </li>
                        ))}
                    </ul>
                    <Separator className="my-3" />
                    <div className="flex items-center justify-between">
                        <span className="font-medium">{t('cart.checkout.total')}</span>
                        <span className="text-lg font-bold">{formatPriceToman(total, locale)}</span>
                    </div>
                    <Button type="submit" disabled={submitting || items.length === 0} className="mt-4 w-full">
                        {submitting ? t('cart.checkout.submitting') : t('cart.checkout.submit')}
                    </Button>
                </CardContent>
            </Card>
        </form>
    )
}
