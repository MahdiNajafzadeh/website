'use client'

import { Check, Languages } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useTransition } from 'react'

import { useTranslation } from '@/components/i18n/TranslationProvider'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LOCALES, type Locale } from '@/lib/locale'
import { switchLocaleHref } from '@/lib/locale'

type Props = {
    locale: Locale
}

export const LocaleSwitcher = ({ locale }: Props) => {
    const pathname = usePathname()
    const [, startTransition] = useTransition()
    const { t } = useTranslation()

    const onSelect = (next: Locale) => {
        if (next === locale) return
        const href = switchLocaleHref(pathname, next)
        startTransition(() => {
            window.location.assign(href)
        })
    }

    const labelFor = (code: Locale) => {
        if (code === 'en') return t('layout.locale.english')
        return t('layout.locale.persian')
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={
                    <Button
                        variant="ghost"
                        size="sm"
                        aria-label={t('layout.locale.aria')}
                        className="gap-1.5"
                    >
                        <Languages className="size-4" />
                        <span>{labelFor(locale)}</span>
                    </Button>
                }
            />
            <DropdownMenuContent align="end" className="w-40">
                {LOCALES.map((code) => (
                    <DropdownMenuItem
                        key={code}
                        onClick={() => onSelect(code)}
                        className="flex items-center justify-between"
                    >
                        <span>{labelFor(code)}</span>
                        {code === locale ? <Check className="size-4" /> : null}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
