import { notFound } from "next/navigation";
import Link from "next/link";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card } from "@/components/ui/card";
import { MediaImage } from "@/components/MediaImage";
import type { Locale } from "@/lib/locale";
import { ensureLocale, localeHref } from "@/lib/locale";
import { getTranslator } from "@/lib/i18n";
import { getPayload } from "payload";
import config from "@payload-config";

import { ProductCard } from "@/components/product/ProductCard";

type Params = Promise<{ slug: string; locale: string }>;

export async function generateMetadata({ params }: { params: Params }) {
    const { slug, locale: rawLocale } = await params;
    const locale: Locale = ensureLocale(rawLocale);
    const { t } = getTranslator(locale);
    const payload = await getPayload({ config });
    const result = await payload.find({
        collection: "brands",
        where: { slug: { equals: slug } },
        limit: 1,
        locale,
    });
    const brand = result.docs[0];
    if (!brand) return { title: t("brand.detail.metaNotFound") };
    const siteName = t("layout.header.siteNameFallback");
    return { title: `${brand.name} | ${siteName}` };
}

export default async function BrandDetailPage({ params }: { params: Params }) {
    const { slug, locale: rawLocale } = await params;
    const locale: Locale = ensureLocale(rawLocale);
    const { t } = getTranslator(locale);
    const payload = await getPayload({ config });

    const brandResult = await payload.find({
        collection: "brands",
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 1,
        locale,
    });
    const brand = brandResult.docs[0];
    if (!brand) notFound();

    const products = await payload.find({
        collection: "products",
        where: { brand: { equals: brand.id } },
        limit: 100,
        depth: 2,
        sort: "-createdAt",
        locale,
    });

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6 flex items-center gap-4">
                {brand.logo ? (
                    <div className="relative size-16 overflow-hidden rounded-md bg-muted">
                        <MediaImage
                            media={brand.logo}
                            alt={typeof brand.logo !== "number" && brand.logo ? brand.logo.alt : brand.name}
                            fill
                            size="card"
                            className="object-contain"
                            locale={locale}
                        />
                    </div>
                ) : null}
                <div>
                    <h1 className="text-3xl font-bold">{brand.name}</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {t("brand.detail.productCount", { count: products.totalDocs })}
                    </p>
                </div>
            </div>

            <Breadcrumb className="mb-6 text-sm text-muted-foreground">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink render={<Link href={localeHref(locale, "/")} />}>
                            {t("brand.detail.breadcrumb.home")}
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink render={<Link href={localeHref(locale, "/brands")} />}>
                            {t("brand.detail.breadcrumb.brands")}
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <span aria-current="page">{brand.name}</span>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {products.docs.length === 0 ? (
                <Card className="p-10 text-center text-muted-foreground">{t("brand.detail.empty")}</Card>
            ) : (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {products.docs.map((p, i) => (
                        <Link key={p.id} href={localeHref(locale, `/products/${p.slug}`)}>
                            <ProductCard product={p} locale={locale} priority={i < 4} />
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
