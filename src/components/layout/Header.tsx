import Link from 'next/link'

import { MediaImage } from '@/components/MediaImage'
import { HeaderActions } from '@/components/layout/HeaderActions'
import { Button } from '@/components/ui/button'
import { getCurrentUser } from '@/lib/auth-server'
import { getSiteSettings } from '@/lib/site-settings'

export const Header = async () => {
    const [settings, user] = await Promise.all([getSiteSettings(), getCurrentUser()])

    return (
        <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center gap-4 px-4">
                <Link href="/" className="flex items-center gap-2">
                    <MediaImage
                        media={settings?.logo}
                        alt={settings?.siteName ?? 'آبفارین'}
                        width={36}
                        height={36}
                        className="size-9 rounded-md object-cover"
                    />
                    <span className="text-lg font-bold">{settings?.siteName ?? 'آبفارین'}</span>
                </Link>

                <nav className="ms-4 hidden items-center gap-1 md:flex">
                    <Button variant="ghost" size="sm" render={<Link href="/products" />}>
                        محصولات
                    </Button>
                    <Button variant="ghost" size="sm" render={<Link href="/brands" />}>
                        برندها
                    </Button>
                </nav>

                <div className="ms-auto">
                    <HeaderActions user={user} />
                </div>
            </div>
        </header>
    )
}