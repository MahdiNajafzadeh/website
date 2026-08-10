'use client'

import { LogIn, LogOut, ShoppingCart, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { CartSheet } from '@/components/cart/CartSheet'
import { LocaleSwitcher } from '@/components/locale-switcher'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { useTranslation } from '@/components/i18n/TranslationProvider'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { SafeUser } from '@/lib/auth-server'
import type { Locale } from '@/lib/locale'
import { localeHref } from '@/lib/locale'
import { useCart } from '@/lib/use-cart'

type Props = {
    user: SafeUser | null
    locale: Locale
}

const roleKey = (role: SafeUser['role']): 'admin' | 'employee' | 'customer' => {
    if (role === 'admin') return 'admin'
    if (role === 'employee') return 'employee'
    return 'customer'
}

export const HeaderActions = ({ user, locale }: Props) => {
    const { t } = useTranslation()
    const { count } = useCart()
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [cartOpen, setCartOpen] = useState(false)
    const [loggingOut, setLoggingOut] = useState(false)

    const handleLogout = async () => {
        setOpen(false)
        setLoggingOut(true)
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
            })
        } catch {
            // ignore
        }
        setLoggingOut(false)
        router.refresh()
        router.push(localeHref(locale, '/'))
    }

    const go = (path: string) => () => {
        setOpen(false)
        router.push(localeHref(locale, path))
    }

    return (
        <div className="flex items-center gap-2">
            <LocaleSwitcher locale={locale} />
            <ThemeToggle />
            <CartSheet open={cartOpen} onOpenChange={setCartOpen} locale={locale} />
            <Button
                variant="ghost"
                size="icon"
                aria-label={t('layout.header.cart')}
                className="relative"
                onClick={() => setCartOpen(true)}
            >
                <ShoppingCart className="size-5" />
                {count > 0 ? (
                    <span className="absolute -top-1 -start-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                        {count}
                    </span>
                ) : null}
            </Button>

            {user ? (
                <DropdownMenu open={open} onOpenChange={setOpen}>
                    <DropdownMenuTrigger
                        render={
                            <Button
                                variant="ghost"
                                size="icon"
                                aria-label={t('layout.header.account')}
                            >
                                <User className="size-5" />
                            </Button>
                        }
                    />
                    <DropdownMenuContent align="end" className="w-48">
                        <div className="px-2 py-1.5 text-sm">
                            <p className="font-medium">
                                {[user.firstName, user.lastName].filter(Boolean).join(' ').trim() ||
                                    user.email}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {t(`layout.role.${roleKey(user.role)}`)}
                            </p>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={go('/account')}>
                            {t('layout.nav.account')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={go('/orders')}>
                            {t('layout.nav.orders')}
                        </DropdownMenuItem>
                        {user.role !== 'customer' ? (
                            <DropdownMenuItem onClick={go('/employee/dashboard')}>
                                {t('layout.nav.employee')}
                            </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} disabled={loggingOut}>
                            <LogOut className="size-4" />
                            {loggingOut
                                ? t('layout.header.loggingOut')
                                : t('layout.header.logout')}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <Button variant="ghost" size="sm" onClick={go('/login')}>
                    <LogIn className="size-4" />
                    {t('layout.nav.login')}
                </Button>
            )}
        </div>
    )
}
