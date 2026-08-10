'use client'

import { Check, Copy, Eye, EyeOff, MessageCircle } from 'lucide-react'
import { useState } from 'react'

import { useTranslation } from '@/components/i18n/TranslationProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const digitsOf = (s: string): string => s.replace(/\D+/g, '')
const waLink = (phone: string): string =>
    `https://wa.me/98${digitsOf(phone).replace(/^0+/, '')}`

type Props = {
    phone: string
    password: string | null
}

export const CustomerCredentialsRow = ({ phone, password }: Props) => {
    const { t } = useTranslation()
    const [reveal, setReveal] = useState(false)
    const [copiedKey, setCopiedKey] = useState<'phone' | 'password' | null>(null)

    const copy = async (value: string, key: 'phone' | 'password') => {
        try {
            await navigator.clipboard.writeText(value)
            setCopiedKey(key)
            window.setTimeout(() => setCopiedKey(null), 1500)
        } catch {
            // ignore
        }
    }

    return (
        <div className="flex flex-col gap-1" dir="ltr">
            <div className="flex items-center gap-1">
                <a
                    href={waLink(phone)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-primary hover:underline"
                    aria-label={t('employee.customers.table.openWhatsapp')}
                >
                    <MessageCircle className="size-4" />
                </a>
                <span>{phone}</span>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => copy(phone, 'phone')}
                    aria-label={t('employee.customers.table.copyPhone')}
                >
                    {copiedKey === 'phone' ? (
                        <Check className="size-4 text-green-600" />
                    ) : (
                        <Copy className="size-4" />
                    )}
                </Button>
                {copiedKey === 'phone' ? (
                    <span className="text-xs text-muted-foreground">
                        {t('employee.customers.table.copied')}
                    </span>
                ) : null}
            </div>
            {password !== null ? (
                <div className="mt-1 flex items-center gap-1">
                    <span className="text-xs text-muted-foreground" dir="rtl">
                        {t('employee.customers.table.initialPasswordLabel')}
                    </span>
                    <Input
                        dir="ltr"
                        readOnly
                        value={reveal ? password : '••••••••'}
                        className="h-7 w-32 text-xs"
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setReveal((v) => !v)}
                        aria-label={
                            reveal
                                ? t('employee.customers.table.hidePassword')
                                : t('employee.customers.table.showPassword')
                        }
                    >
                        {reveal ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => copy(password, 'password')}
                        aria-label={t('employee.customers.table.copyPassword')}
                    >
                        {copiedKey === 'password' ? (
                            <Check className="size-4 text-green-600" />
                        ) : (
                            <Copy className="size-4" />
                        )}
                    </Button>
                    {copiedKey === 'password' ? (
                        <span className="text-xs text-muted-foreground">
                            {t('employee.customers.table.copied')}
                        </span>
                    ) : null}
                </div>
            ) : null}
        </div>
    )
}
