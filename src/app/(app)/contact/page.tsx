import Link from "next/link";
import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { getSiteSettings } from "@/lib/site-settings";
import type { Media } from "@/payload-types";
import { t } from "@/lib/t";
import Image from "next/image";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSiteSettings();
    const siteName = settings.name || "store";
    return { title: `${t("contact.title")} | ${siteName}`, description: `${t("contact.title")} — ${siteName}` };
}

function getMediaUrl(media: unknown): string | null {
    if (!media || typeof media !== "object") return null;
    return (media as Media).url ?? null;
}

export default async function ContactPage() {
    const settings = await getSiteSettings();
    if (!settings) return null;
    const siteName = settings.name;
    const hasAnyChannel = Boolean(
        settings.phones?.length ||
        settings.addresses?.length ||
        settings.emails?.length ||
        settings.socialLinks?.length,
    );
    const phones = settings.phones || [];
    const addresses = settings.addresses || [];
    const emails = settings.emails || [];
    const socialLinks = settings.socialLinks || [];
    return (
        <div className="mx-auto max-w-[1440px] px-4 py-8 md:px-8">
            <nav
                className="mb-6 flex items-center gap-1.5 text-sm text-[#707072] dark:text-[#9e9ea0]"
                aria-label="Breadcrumb"
            >
                <Link href="/" className="hover:text-[#111111] dark:hover:text-white">
                    {t("common.home")}
                </Link>
                <span aria-hidden>›</span>
                <span className="font-medium text-[#111111] dark:text-white">{t("contact.title")}</span>
            </nav>

            <h1 className="text-[32px] font-medium leading-[1.2] text-[#111111] dark:text-white">
                {t("contact.title")}
            </h1>
            <p className="mt-1 text-[14px] font-medium text-[#707072] dark:text-[#9e9ea0]">
                {t("contact.title")} — {siteName}
            </p>

            {!hasAnyChannel ? (
                <div className="mt-8 rounded-[30px] bg-[#f5f5f5] p-12 text-center dark:bg-[#1a1a1a]">
                    <p className="text-[16px] font-medium text-[#111111] dark:text-white">{t("contact.noPhone")}</p>
                    <p className="mt-1 text-[14px] font-medium text-[#707072] dark:text-[#9e9ea0]">
                        {t("contact.noSocial")}
                    </p>
                </div>
            ) : (
                <div className="mt-8 grid gap-6 md:grid-cols-2">
                    <Card className="rounded-[18px] border border-[#cacacb] bg-white dark:border-[#39393b] dark:bg-[#1a1a1a] p-0 gap-0">
                        <CardContent className="p-6">
                            {phones.length === 0 ? (
                                <p className="mt-3 text-[14px] font-medium text-[#707072] dark:text-[#9e9ea0]">
                                    {t("contact.noPhone")}
                                </p>
                            ) : (
                                <ul className="mt-4 space-y-3">
                                    {phones.map((p, idx) => (
                                        <li key={p.id ?? idx} className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="text-[12px] font-medium uppercase tracking-wide text-[#707072] dark:text-[#9e9ea0]">
                                                    {p.label || t("contact.phones")} {p.isPrimary ? " · Primary" : ""}
                                                </p>
                                                {p.number ? (
                                                    <a
                                                        href={`tel:${p.number.replace(/\s+/g, "")}`}
                                                        className="mt-0.5 inline-block text-[14px] font-medium text-[#111111] hover:underline dark:text-white"
                                                    >
                                                        {p.number}
                                                    </a>
                                                ) : (
                                                    <span className="mt-0.5 inline-block text-[14px] font-medium text-[#707072]">
                                                        —
                                                    </span>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="rounded-[18px] border border-[#cacacb] bg-white dark:border-[#39393b] dark:bg-[#1a1a1a] p-0 gap-0">
                        <CardContent className="p-6">
                            {emails.length === 0 ? (
                                <p className="mt-3 text-[14px] font-medium text-[#707072] dark:text-[#9e9ea0]">
                                    {t("contact.noEmail")}
                                </p>
                            ) : (
                                <ul className="mt-4 space-y-3">
                                    {emails.map((e, idx) => (
                                        <li key={e.id ?? idx}>
                                            <p className="text-[12px] font-medium uppercase tracking-wide text-[#707072] dark:text-[#9e9ea0]">
                                                {e.label || t("contact.emails")} {e.isPrimary ? " · Primary" : ""}
                                            </p>
                                            {e.email ? (
                                                <a
                                                    href={`mailto:${e.email}`}
                                                    className="mt-0.5 inline-block break-all text-[14px] font-medium text-[#111111] hover:underline dark:text-white"
                                                >
                                                    {e.email}
                                                </a>
                                            ) : (
                                                <span className="mt-0.5 inline-block text-[14px] font-medium text-[#707072]">
                                                    —
                                                </span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="rounded-[18px] border border-[#cacacb] bg-white dark:border-[#39393b] dark:bg-[#1a1a1a] p-0 gap-0">
                        <CardContent className="p-6">
                            {addresses.length === 0 ? (
                                <p className="mt-3 text-[14px] font-medium text-[#707072] dark:text-[#9e9ea0]">
                                    {t("contact.noAddress")}
                                </p>
                            ) : (
                                <ul className="mt-4 space-y-3">
                                    {addresses.map((a, idx) => (
                                        <li key={a.id ?? idx}>
                                            <p className="text-[12px] font-medium uppercase tracking-wide text-[#707072] dark:text-[#9e9ea0]">
                                                {a.label || t("contact.addresses")} {a.isPrimary ? " · Primary" : ""}
                                            </p>
                                            <p className="mt-0.5 whitespace-pre-line text-[14px] leading-[1.5] text-[#111111] dark:text-white">
                                                {a.address ?? "—"}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="rounded-[18px] border border-[#cacacb] bg-white dark:border-[#39393b] dark:bg-[#1a1a1a] p-0 gap-0">
                        <CardContent className="p-6">
                            <h2 className="text-[16px] font-medium text-[#111111] dark:text-white">
                                {t("contact.social")}
                            </h2>
                            {socialLinks.length === 0 ? (
                                <p className="mt-3 text-[14px] font-medium text-[#707072] dark:text-[#9e9ea0]">
                                    {t("contact.noSocial")}
                                </p>
                            ) : (
                                <ul className="mt-4 flex flex-wrap gap-3">
                                    {socialLinks.map((s, idx) => {
                                        const iconUrl = getMediaUrl(s.icon);
                                        return (
                                            <li key={s.id ?? idx}>
                                                <a
                                                    href={s.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    aria-label={s.name}
                                                    className="flex h-10 items-center gap-2 rounded-full bg-[#f5f5f5] dark:bg-[#39393b] px-3 text-[#111111] dark:text-white transition-colors hover:bg-[#e5e5e5]"
                                                >
                                                    {iconUrl ? (
                                                        <Image
                                                            src={iconUrl}
                                                            alt={`link icon - ${iconUrl}`}
                                                            className="h-5 w-5 object-contain"
                                                            width={20}
                                                            height={20}
                                                        />
                                                    ) : (
                                                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[12px] font-medium text-[#111111]">
                                                            {s.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    )}
                                                    <span className="text-[14px] font-medium">{s.name}</span>
                                                </a>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            <p className="mt-8 rounded-[18px] border border-[#e5e5e5] dark:border-[#39393b] bg-[#f5f5f5] dark:bg-[#1a1a1a] px-4 py-3 text-[14px] font-medium leading-[1.5] text-[#707072] dark:text-[#9e9ea0]">
                {siteName} — {t("contact.social")}
            </p>
        </div>
    );
}
