import Link from "next/link";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";

import { CartBadge } from "@/components/layout/CartBadge";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { LogoutButton } from "@/components/layout/LogoutButton";
import { InitialsAvatar } from "@/components/ui/InitialsAvatar";
import { t } from "@/lib/t";
import type { User } from "@/payload-types";

export const NAV_LINKS = [
    { href: "/", label: "خانه" },
    { href: "/products", label: "محصولات" },
    { href: "/categories", label: "دسته‌ها" },
    { href: "/brands", label: "برندها" },
    { href: "/blog", label: "بلاگ" },
    { href: "/contact", label: "تماس" },
] as const;

type HeaderProps = {
    siteName: string;
    logoUrl: string | null;
    currentUser: User | null;
};

export function Header({ siteName, logoUrl, currentUser }: HeaderProps) {
    return (
        <header className="sticky top-0 z-50 border-b border-[#e5e5e5] bg-[#ffffff] text-[#111111] dark:border-[#39393b] dark:bg-[#111111] dark:text-white">
            <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                <Link href="/" className="flex items-center gap-3 shrink-0">
                    {logoUrl ? (
                        <Image src={logoUrl} alt={siteName} className="h-8 w-8 object-contain" width={32} height={32} />
                    ) : (
                        <InitialsAvatar name={siteName} size="sm" />
                    )}
                    <span className="text-[16px] font-medium leading-[1.75] tracking-[0] text-[#111111] dark:text-white">
                        {siteName}
                    </span>
                </Link>

                <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-[16px] font-medium leading-[1.75] text-[#111111] transition-colors hover:text-[#707072] dark:text-white dark:hover:text-[#9e9ea0]"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-2 sm:gap-3">
                    <Link
                        href="/cart"
                        aria-label="سبد خرید"
                        className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#f5f5f5] text-[#111111] transition-colors hover:bg-[#e5e5e5] dark:bg-[#39393b] dark:text-white dark:hover:bg-[#4b4b4d]"
                    >
                        <ShoppingBag className="h-5 w-5" />
                        <CartBadge />
                    </Link>

                    <ThemeToggle />

                    {currentUser ? (
                        <>
                            <Link
                                href="/account"
                                aria-label={t("header.account")}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#111111] text-[12px] font-medium text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-[#111111]"
                                data-od-id="header-avatar"
                            >
                                <InitialsAvatar
                                    name={`${currentUser.firstName ?? ""}${currentUser.lastName ?? ""}`}
                                    size="md"
                                />
                            </Link>
                            <LogoutButton />
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="hidden text-[14px] font-medium leading-[1.5] text-[#707072] hover:text-[#111111] dark:text-[#9e9ea0] dark:hover:text-white sm:inline-flex"
                            >
                                {t("header.login")}
                            </Link>
                            <Link
                                href="/register"
                                className="inline-flex h-9 items-center justify-center rounded-full bg-[#111111] px-5 text-[14px] font-medium leading-[1.5] text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-[#111111]"
                            >
                                {t("header.register")}
                            </Link>
                        </>
                    )}
                </div>
            </div>

            <div className="border-t border-[#f5f5f5] md:hidden dark:border-[#39393b]">
                <nav className="flex gap-4 overflow-x-auto px-4 py-2" aria-label="Primary mobile">
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="whitespace-nowrap text-[14px] font-medium leading-[1.5] text-[#111111] dark:text-white"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </header>
    );
}
