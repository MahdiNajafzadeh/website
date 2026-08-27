import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MediaImage } from "@/components/MediaImage";
import { formatPriceToman } from "@/lib/format";
import type { Locale } from "@/lib/locale";
import { ensureLocale, localeHref } from "@/lib/locale";
import { getTranslator } from "@/lib/i18n";
import { localizedValue } from "@/lib/localized";
import { getPayload } from "payload";
import config from "@payload-config";
import type { Where } from "payload";

import { ProductCard } from "@/components/product/ProductCard";

type SearchParams = Promise<{
    brand?: string;
    category?: string;
    q?: string;
}>;

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }) {
    const rawLocale = (await params).locale;
    const locale: Locale = ensureLocale(rawLocale);
    const { t } = getTranslator(locale);
    return {
        title: t("product.list.metaTitle"),
        description: t("product.list.metaDescription"),
    };
}

export default async function ProductsPage(props: { searchParams: SearchParams; params: Params }) {
    const { brand, category, q } = await props.searchParams;
    const locale: Locale = ensureLocale((await props.params).locale);
    const { t } = getTranslator(locale);
    const payload = await getPayload({ config });

    const where: Where = {};
    if (brand) {
        where.brand = { equals: brand };
    }
    if (q) {
        where.name = { like: q };
    }
    if (category) {
        where.categories = { in: [category] };
    }

    const [products, brands, categories] = await Promise.all([
        payload.find({
            collection: "products",
            where,
            limit: 60,
            depth: 2,
            sort: "-createdAt",
            locale,
        }),
        payload.find({ collection: "brands", limit: 100, sort: "order", locale }),
        payload.find({ collection: "categories", limit: 100, locale }),
    ]);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">{t("product.list.title")}</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    {t("product.list.count", { count: products.totalDocs })}
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-[220px_1fr]">
                <aside className="space-y-4">
                    <Card className="p-4">
                        <h2 className="mb-3 text-sm font-semibold">{t("product.list.search.heading")}</h2>
                        <form className="flex gap-2">
                            <input
                                name="q"
                                defaultValue={q ?? ""}
                                placeholder={t("product.list.search.placeholder")}
                                className="h-9 w-full rounded-md border bg-background px-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                            />
                            <button
                                type="submit"
                                className="h-9 rounded-md bg-primary px-3 text-sm text-primary-foreground hover:bg-primary/80"
                            >
                                {t("product.list.search.submit")}
                            </button>
                        </form>
                    </Card>

                    {brands.docs.length > 0 ? (
                        <Card className="p-4">
                            <h2 className="mb-3 text-sm font-semibold">{t("product.list.brands.heading")}</h2>
                            <ul className="flex flex-col gap-1.5 text-sm">
                                <li>
                                    <Link
                                        href={localeHref(locale, "/products")}
                                        className={
                                            !brand
                                                ? "font-bold text-primary"
                                                : "text-muted-foreground hover:text-foreground"
                                        }
                                    >
                                        {t("product.list.brands.all")}
                                    </Link>
                                </li>
                                {brands.docs.map((b) => (
                                    <li key={b.id}>
                                        <Link
                                            href={localeHref(locale, `/products?brand=${b.id}`)}
                                            className={
                                                String(b.id) === brand
                                                    ? "font-bold text-primary"
                                                    : "text-muted-foreground hover:text-foreground"
                                            }
                                        >
                                            {localizedValue(b.name, locale)}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    ) : null}

                    {categories.docs.length > 0 ? (
                        <Card className="p-4">
                            <h2 className="mb-3 text-sm font-semibold">{t("product.list.categories.heading")}</h2>
                            <div className="flex flex-wrap gap-1.5">
                                {categories.docs.map((cat) => (
                                    <Link key={cat.id} href={localeHref(locale, `/products?category=${cat.id}`)}>
                                        <Badge variant={String(cat.id) === category ? "default" : "secondary"}>
                                            {localizedValue(cat.name, locale)}
                                        </Badge>
                                    </Link>
                                ))}
                            </div>
                        </Card>
                    ) : null}
                </aside>

                <section>
                    {products.docs.length === 0 ? (
                        <Card className="flex flex-col items-center gap-3 p-10 text-center">
                            <MediaImage
                                media={null}
                                alt={t("product.list.emptyImage")}
                                width={120}
                                height={120}
                                locale={locale}
                            />
                            <p className="text-muted-foreground">{t("product.list.empty")}</p>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                            {products.docs.map((p, i) => (
                                <Link key={p.id} href={localeHref(locale, `/products/${p.slug}`)}>
                                    <ProductCard product={p} locale={locale} priority={i < 3} />
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
