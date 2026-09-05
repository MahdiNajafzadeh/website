import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { InitialsAvatar } from "@/components/ui/InitialsAvatar";
import { ContactChannelList } from "@/components/contact/ContactChannelList";
import { getSiteSettings } from "@/lib/site-settings";
import { getMediaUrl } from "@/lib/media";
import { t } from "@/lib/t";
import Image from "next/image";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSiteSettings();
    const siteName = settings.name || "store";
    return { title: `${t("contact.title")} | ${siteName}`, description: `${t("contact.title")} — ${siteName}` };
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
        <PageContainer>
            <Breadcrumbs
                crumbs={[{ href: "/", label: t("common.home") }, { label: t("contact.title") }]}
                separatorKey="common.breadcrumbSeparator"
            />

            <PageHeader
                title={t("contact.title")}
                subtitle={t("contact.titleWithSite", { title: t("contact.title"), siteName })}
            />

            {!hasAnyChannel ? (
                <EmptyState title={t("contact.noPhone")} hint={t("contact.noSocial")} />
            ) : (
                <div className="mt-8 grid gap-6 md:grid-cols-2">
                    <ContactChannelList
                        channels={phones}
                        kind="phone"
                        noChannelLabel={t("contact.noPhone")}
                        defaultLabel={t("contact.phones")}
                        variant="card"
                    />

                    <ContactChannelList
                        channels={emails}
                        kind="email"
                        noChannelLabel={t("contact.noEmail")}
                        defaultLabel={t("contact.emails")}
                        variant="card"
                    />

                    <ContactChannelList
                        channels={addresses}
                        kind="address"
                        noChannelLabel={t("contact.noAddress")}
                        defaultLabel={t("contact.addresses")}
                        variant="card"
                    />

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
                                                        <InitialsAvatar name={s.name} size="xs" />
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
                {t("contact.titleWithSite", { title: siteName, siteName: t("contact.social") })}
            </p>
        </PageContainer>
    );
}
