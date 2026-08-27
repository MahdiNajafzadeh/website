import Link from "next/link";

import { MediaImage } from "@/components/MediaImage";
import { HeaderActions } from "@/components/layout/HeaderActions";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth-server";
import type { Locale } from "@/lib/locale";
import { localeHref } from "@/lib/locale";
import { getTranslator } from "@/lib/i18n";
import { getSiteSettings } from "@/lib/site-settings";

type Props = {
    locale: Locale;
};

export const Header = async ({ locale }: Props) => {
    const [settings, user] = await Promise.all([getSiteSettings(locale), getCurrentUser()]);
    const { t } = getTranslator(locale);
    const siteName = settings?.siteName ?? t("layout.header.siteNameFallback");

    return (
        <header className="sticky top-0 z-40 border-b bg-background/90 pt-[env(safe-area-inset-top)] backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center gap-4 px-4">
                <Link href={localeHref(locale, "/")} className="flex items-center gap-2">
                    <MediaImage
                        media={settings?.logo}
                        alt={siteName}
                        width={36}
                        height={36}
                        className="size-9 rounded-md object-cover"
                        locale={locale}
                    />
                    <span className="text-lg font-bold">{siteName}</span>
                </Link>

                <nav className="ms-4 hidden items-center gap-1 md:flex">
                    <Button variant="ghost" size="sm" render={<Link href={localeHref(locale, "/products")} />}>
                        {t("layout.nav.products")}
                    </Button>
                    <Button variant="ghost" size="sm" render={<Link href={localeHref(locale, "/brands")} />}>
                        {t("layout.nav.brands")}
                    </Button>
                </nav>

                <div className="ms-auto">
                    <HeaderActions user={user} locale={locale} />
                </div>
            </div>
        </header>
    );
};
