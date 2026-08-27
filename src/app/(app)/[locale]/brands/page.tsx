import Link from "next/link";

import { Card } from "@/components/ui/card";
import { MediaImage } from "@/components/MediaImage";
import type { Locale } from "@/lib/locale";
import { ensureLocale, localeHref } from "@/lib/locale";
import { getTranslator } from "@/lib/i18n";
import { localizedValue } from "@/lib/localized";
import { getPayload } from "payload";
import config from "@payload-config";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }) {
    const rawLocale = (await params).locale;
    const locale: Locale = ensureLocale(rawLocale);
    const { t } = getTranslator(locale);
    return {
        title: t("brand.list.metaTitle"),
        description: t("brand.list.metaDescription"),
    };
}

export default async function BrandsPage(props: { params: Params }) {
    const locale: Locale = ensureLocale((await props.params).locale);
    const { t } = getTranslator(locale);
    const payload = await getPayload({ config });
    const result = await payload.find({
        collection: "brands",
        limit: 200,
        sort: "order",
        depth: 1,
        locale,
    });

    const brands = result.docs.map((brand) => ({
        ...brand,
        name: localizedValue(brand.name, locale),
    }));

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">{t("brand.list.title")}</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    {t("brand.list.count", { count: result.totalDocs })}
                </p>
            </div>

            {brands.length === 0 ? (
                <Card className="p-10 text-center text-muted-foreground">{t("brand.list.empty")}</Card>
            ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {brands.map((brand) => (
                        <Link key={brand.id} href={localeHref(locale, `/brands/${brand.slug}`)} className="group">
                            <Card className="flex h-full flex-col items-center gap-3 p-6 transition-colors group-hover:border-primary/40">
                                {brand.logo ? (
                                    <div className="relative size-20 overflow-hidden rounded-md bg-muted">
                                        <MediaImage
                                            media={brand.logo}
                                            alt={
                                                typeof brand.logo !== "number" && brand.logo
                                                    ? brand.logo.alt
                                                    : brand.name
                                            }
                                            fill
                                            size="card"
                                            className="object-contain"
                                            locale={locale}
                                        />
                                    </div>
                                ) : (
                                    <div className="flex size-20 items-center justify-center rounded-md bg-muted text-2xl font-bold">
                                        {brand.name.charAt(0)}
                                    </div>
                                )}
                                <span className="text-center text-sm font-semibold">{brand.name}</span>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
