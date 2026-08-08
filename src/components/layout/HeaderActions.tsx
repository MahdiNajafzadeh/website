'use client'

import { LogIn, LogOut, ShoppingCart, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { CartSheet } from '@/components/cart/CartSheet'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useCart } from '@/lib/use-cart'
import type { SafeUser } from '@/lib/auth-server'

type Props = {
    user: SafeUser | null
}

const roleLabel = (role: SafeUser['role']): string => {
    if (role === 'admin') return 'مدیر'
    if (role === 'employee') return 'کارمند'
    return 'مشتری'
}

export const HeaderActions = ({ user }: Props) => {
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
        router.push('/')
    }

    const go = (path: string) => () => {
        setOpen(false)
        router.push(path)
    }

    return (
        <div className="flex items-center gap-2">
            <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
            <Button
                variant="ghost"
                size="icon"
                aria-label="سبد خرید"
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
                            <Button variant="ghost" size="icon" aria-label="حساب کاربری">
                                <User className="size-5" />
                            </Button>
                        }
                    />
                    <DropdownMenuContent align="end" className="w-48">
                        <div className="px-2 py-1.5 text-sm">
                            <p className="font-medium">{user.name ?? user.email}</p>
                            <p className="text-xs text-muted-foreground">{roleLabel(user.role)}</p>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={go('/account')}>حساب کاربری</DropdownMenuItem>
                        <DropdownMenuItem onClick={go('/orders')}>سفارش‌ها</DropdownMenuItem>
                        {user.role !== 'customer' ? (
                            <DropdownMenuItem onClick={go('/employee/dashboard')}>
                                پنل کارمندی
                            </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} disabled={loggingOut}>
                            <LogOut className="size-4" />
                            {loggingOut ? 'در حال خروج...' : 'خروج'}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <Button variant="ghost" size="sm" onClick={go('/login')}>
                    <LogIn className="size-4" />
                    ورود
                </Button>
            )}
        </div>
    )
}