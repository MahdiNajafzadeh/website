import Link from "next/link";
import type { Metadata } from "next";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { getSiteSettings } from "@/lib/site-settings";
import { getPayloadClient } from "@/lib/payload";
import { t } from "@/lib/t";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSiteSettings();
    return {
        title: `${t("about.title")} | ${settings.name}`,
        description: t("about.subtitle", { siteName: settings.name }),
    };
}

async function fetchAbout(): Promise<PageAbout | null> {
    try {
        const payload = await getPayloadClient();
        const data = (await payload.findGlobal({ slug: "page-about", depth: 0 })) as unknown as PageAbout | null;
        return data ?? null;
    } catch {
        return null;
    }
}

export default async function AboutPage() {
    const settings = await getSiteSettings();
    return (
        settings && (
            <div className="mx-auto max-w-[1440px] px-4 py-8 md:px-8">
                <nav
                    className="mb-6 flex items-center gap-1.5 text-sm text-[#707072] dark:text-[#9e9ea0]"
                    aria-label="Breadcrumb"
                >
                    <Link href="/" className="hover:text-[#111111] dark:hover:text-white">
                        {t("common.home")}
                    </Link>
                    <span aria-hidden>{t("common.breadcrumbSeparator")}</span>
                    <span className="font-medium text-[#111111] dark:text-white">{t("about.breadcrumb")}</span>
                </nav>

                <h1 className="text-[32px] font-medium leading-[1.2] text-[#111111] dark:text-white">
                    {t("about.title")}
                </h1>
                <p className="mt-1 text-[14px] font-medium text-[#707072] dark:text-[#9e9ea0]">
                    {t("about.subtitle", { siteName: settings.name })}
                </p>

                {settings.about ? (
                    <article className="prose prose-neutral mt-8 max-w-none text-[16px] font-normal leading-[1.5] text-[#111111] prose-headings:font-medium prose-headings:text-[#111111] prose-a:text-[#111111] prose-a:underline prose-img:rounded-[18px] prose-img:bg-[#f5f5f5] dark:prose-invert dark:text-white">
                        <RichText data={settings.about} />
                    </article>
                ) : (
                    <div className="mt-8 rounded-[30px] bg-[#f5f5f5] p-12 text-center dark:bg-[#1a1a1a]">
                        <p className="text-[16px] font-medium leading-[1.5] text-[#111111] dark:text-white">
                            {t("about.emptyTitle")}
                        </p>
                        <p className="mt-1 text-[14px] font-medium leading-[1.5] text-[#707072] dark:text-[#9e9ea0]">
                            {t("about.emptyHint")}
                        </p>
                        <Link
                            href="/contact"
                            className="mt-4 inline-flex rounded-full bg-[#111111] px-6 py-2 text-[14px] font-medium text-white hover:bg-[#111111]/90 dark:bg-white dark:text-[#111111]"
                        >
                            {t("about.contactCta")}
                        </Link>
                    </div>
                )}
            </div>
        )
    );
}
