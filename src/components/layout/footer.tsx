import Link from "next/link";
import Image from "next/image";
import type { Media, SiteSetting } from "@/payload-types";
import { NAV_LINKS } from "@/components/layout/header";

type FooterProps = {
    siteName: string;
    phones?: SiteSetting["phones"];
    emails?: SiteSetting["emails"];
    addresses?: SiteSetting["addresses"];
    socialLinks?: SiteSetting["socialLinks"];
};

function sortByPrimary<T extends { isPrimary?: boolean | null }>(arr: T[] | null | undefined): T[] {
    if (!arr || arr.length === 0) return [];
    return [...arr].sort((a, b) => {
        if (a.isPrimary && !b.isPrimary) return -1;
        if (!a.isPrimary && b.isPrimary) return 1;
        return 0;
    });
}

export function Footer({ siteName, phones, emails, addresses, socialLinks }: FooterProps) {
    const sortedPhones = sortByPrimary(phones);
    const sortedEmails = sortByPrimary(emails);
    const sortedAddresses = sortByPrimary(addresses);
    const socials = socialLinks ?? [];

    return (
        <footer className="border-t border-[#cacacb] bg-[#ffffff] text-[#707072] dark:border-[#39393b] dark:bg-[#111111] dark:text-[#9e9ea0]">
            <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
                    {/* Phones column */}
                    <div className="space-y-4">
                        <h3 className="text-[14px] font-medium leading-[1.5] text-[#111111] dark:text-white">تلفن</h3>
                        {sortedPhones.length > 0 ? (
                            <ul className="space-y-3">
                                {sortedPhones.map((phone) => (
                                    <li key={phone.id ?? phone.number}>
                                        <p className="text-[12px] font-medium uppercase tracking-wide text-[#707072] dark:text-[#9e9ea0]">
                                            {phone.label || "تلفن"}
                                        </p>
                                        <a
                                            href={`tel:${phone.number}`}
                                            className="text-[14px] font-medium leading-[1.5] text-[#111111] hover:underline dark:text-white"
                                        >
                                            {phone.number}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-[14px] leading-[1.5]">شماره‌ای ثبت نشده</p>
                        )}
                    </div>

                    {/* Emails column */}
                    <div className="space-y-4">
                        <h3 className="text-[14px] font-medium leading-[1.5] text-[#111111] dark:text-white">ایمیل</h3>
                        {sortedEmails.length > 0 ? (
                            <ul className="space-y-3">
                                {sortedEmails.map((mail) => (
                                    <li key={mail.id ?? mail.email}>
                                        <p className="text-[12px] font-medium uppercase tracking-wide text-[#707072] dark:text-[#9e9ea0]">
                                            {mail.label || "ایمیل"}
                                        </p>
                                        <a
                                            href={`mailto:${mail.email}`}
                                            className="text-[14px] font-medium leading-[1.5] text-[#111111] hover:underline dark:text-white"
                                        >
                                            {mail.email}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-[14px] leading-[1.5]">ایمیلی ثبت نشده</p>
                        )}
                    </div>

                    {/* Addresses column */}
                    <div className="space-y-4">
                        <h3 className="text-[14px] font-medium leading-[1.5] text-[#111111] dark:text-white">آدرس</h3>
                        {sortedAddresses.length > 0 ? (
                            <ul className="space-y-3">
                                {sortedAddresses.map((addr) => (
                                    <li key={addr.id ?? addr.address}>
                                        <p className="text-[12px] font-medium uppercase tracking-wide text-[#707072] dark:text-[#9e9ea0]">
                                            {addr.label || "آدرس"}
                                        </p>
                                        <p className="text-[14px] leading-[1.5] text-[#111111] dark:text-white">
                                            {addr.address}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-[14px] leading-[1.5]">آدرسی ثبت نشده</p>
                        )}
                    </div>

                    {/* Access column */}
                    <div className="space-y-4">
                        <h3 className="text-[14px] font-medium leading-[1.5] text-[#111111] dark:text-white">دسترسی</h3>
                        <ul className="space-y-2">
                            {NAV_LINKS.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-[14px] font-medium leading-[1.5] hover:text-[#111111] hover:underline dark:hover:text-white"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                            <li>
                                <Link
                                    href="/cart"
                                    className="text-[14px] font-medium leading-[1.5] hover:text-[#111111] hover:underline dark:hover:text-white"
                                >
                                    سبد خرید
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Social column */}
                    <div className="space-y-4">
                        <h3 className="text-[14px] font-medium leading-[1.5] text-[#111111] dark:text-white">ما را دنبال کنید</h3>
                        {socials && socials.length > 0 ? (
                            <ul className="flex flex-wrap gap-3">
                                {socials.map((social) => {
                                    const iconUrl =
                                        social.icon && typeof social.icon === "object" && "url" in social.icon
                                            ? ((social.icon as Media).url ?? null)
                                            : null;
                                    return (
                                        <li key={social.id ?? social.url}>
                                            <a
                                                href={social.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label={social.name}
                                                title={social.description ?? social.name}
                                                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f5f5f5] text-[#111111] transition-colors hover:bg-[#e5e5e5] dark:bg-[#39393b] dark:text-white"
                                            >
                                                {iconUrl ? (
                                                    <Image
                                                        src={iconUrl}
                                                        alt={iconUrl}
                                                        className="h-5 w-5 object-contain"
                                                        width={20}
                                                        height={20}
                                                    />
                                                ) : (
                                                    <span className="text-[12px] font-medium">
                                                        {social.name.charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                            </a>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p className="text-[14px] leading-[1.5]">شبکه اجتماعی ثبت نشده</p>
                        )}
                    </div>
                </div>

                <div className="mt-8 border-t border-[#e5e5e5] pt-6 dark:border-[#39393b]">
                    <p className="text-center text-[12px] font-medium leading-[1.5] text-[#707072] dark:text-[#9e9ea0] sm:text-right">
                        © {new Date().getFullYear()} {siteName}. همه حقوق محفوظ است.
                    </p>
                </div>
            </div>
        </footer>
    );
}
