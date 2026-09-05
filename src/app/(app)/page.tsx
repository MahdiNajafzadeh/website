import type { Metadata } from "next";
import { getPayload } from "payload";
import Link from "next/link";

import config from "@/payload.config";
import type { Brand, Category, Media, Product, SiteSetting } from "@/payload-types";
import { getCurrentUser } from "@/lib/current-user";
import { t, tFmt } from "@/lib/t";

import { SectionHead } from "@/components/home/SectionHead";
import { CategoryCard } from "@/components/home/CategoryCard";
import { ProductCard } from "@/components/home/ProductCard";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
    title: "فروشگاه · لوله، اتصالات فاضلاب و شیرآلات صنعتی",
    description: "لوله، اتصالات فاضلاب و شیرآلات صنعتی برای پیمانکاران و پروژه‌ها. مشاهده کاتالوگ و قیمت به تومان.",
};

async function fetchHomeData() {
    const payloadConfig = await config;
    const payload = await getPayload({ config: payloadConfig });

    const [productsRes, popularRes, categoriesRes, brandsRes, settings] = await Promise.all([
        payload.find({
            collection: "products",
            where: { visible: { equals: true } },
            sort: "-createdAt",
            limit: 4,
            depth: 1,
        }),
        payload.find({
            collection: "products",
            where: { visible: { equals: true } },
            sort: "-inventory",
            limit: 3,
            depth: 1,
        }),
        payload.find({ collection: "categories", sort: "name", limit: 6, depth: 0 }),
        payload.find({ collection: "brands", sort: "name", limit: 12, depth: 1 }),
        payload.findGlobal({ slug: "site-settings", depth: 1 }),
    ]);

    const categories = categoriesRes.docs as Category[];
    const brands = brandsRes.docs as Brand[];

    const [categoryCounts, brandCounts] = await Promise.all([
        Promise.all(
            categories.map((c) =>
                payload.count({
                    collection: "products",
                    where: { visible: { equals: true }, category: { equals: c.id } },
                }),
            ),
        ),
        Promise.all(
            brands.map((b) =>
                payload.count({
                    collection: "products",
                    where: { visible: { equals: true }, brand: { equals: b.id } },
                }),
            ),
        ),
    ]);

    return {
        products: productsRes.docs as Product[],
        popular: popularRes.docs as Product[],
        productsTotal: productsRes.totalDocs,
        categories,
        brands,
        categoryCounts: categoryCounts.map((r) => r.totalDocs),
        brandCounts: brandCounts.map((r) => r.totalDocs),
        settings: settings as unknown as SiteSetting | null,
    };
}

function getLogoUrl(logo: SiteSetting["logo"]): string | null {
    if (!logo) return null;
    if (typeof logo === "object" && "url" in logo) {
        const media = logo as Media;
        return media.url ?? null;
    }
    return null;
}

function getPrimary<T extends { isPrimary?: boolean | null }>(arr: T[] | null | undefined): T | null {
    if (!arr || arr.length === 0) return null;
    return arr.find((i) => i.isPrimary) ?? arr[0] ?? null;
}

function getMediaUrl(media: number | Media | null | undefined): string | null {
    if (!media || typeof media === "number") return null;
    return (media as Media).url ?? null;
}

export default async function HomePage() {
    const [
        { products, popular, productsTotal, categories, brands, categoryCounts, brandCounts, settings },
        currentUser,
    ] = await Promise.all([fetchHomeData(), getCurrentUser()]);

    const siteName = settings.name;
    void getLogoUrl(settings?.logo);
    const totalInventory =
        popular.reduce((sum, p) => sum + (p.inventory ?? 0), 0) +
        products.reduce((sum, p) => sum + (p.inventory ?? 0), 0);
    const showPopular = popular.length > 0 && totalInventory > 0;
    const primaryPhone = getPrimary(
        settings?.phones as unknown as
        | { label?: string | null; number: string; isPrimary?: boolean | null }[]
        | null
        | undefined,
    );
    const partnerDiscount = settings?.partnerDiscount ?? 0;

    // Build category image map from fetched products (first product image per category)
    const categoryImageMap = new Map<number, string>();
    const allProductsForImage = [...products, ...popular];
    for (const p of allProductsForImage) {
        const cat = p.category;
        const catId = typeof cat === "number" ? cat : (cat as Category | null)?.id;
        if (!catId || categoryImageMap.has(catId)) continue;
        const url =
            getMediaUrl((p.images?.[0]?.image as Media | number | null | undefined) ?? null) ??
            getMediaUrl(p.showcaseImage as Media | number | null | undefined);
        if (url) categoryImageMap.set(catId, url);
    }

    return (
        <main id="content" className="bg-[#ffffff] dark:bg-[#111111]">
            {/* A — Campaign Hero */}
            <section
                className="relative overflow-hidden bg-[#f5f5f5] dark:bg-[#0a0a0a]"
                data-od-id="hero"
                aria-labelledby="hero-title"
            >
                {/* Full-bleed industrial photo — real photography via unsplash CDN, object-cover, no rounded */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1920&auto=format&fit=crop"
                    alt={t("home.hero.imageAlt")}
                    className="absolute inset-0 h-full w-full object-cover"
                    width={1920}
                    height={1080}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-black/5" aria-hidden />
                <div className="relative mx-auto flex max-w-[1440px] flex-col justify-end px-4 pb-10 pt-24 sm:px-6 sm:pb-14 sm:pt-28 lg:px-8 lg:pb-16 lg:pt-36">
                    <p className="max-w-fit rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.1em] text-white backdrop-blur dark:bg-white/10">
                        {t("home.hero.eyebrow")}
                    </p>
                    <h1
                        id="hero-title"
                        className="mt-4 max-w-[18ch] text-[clamp(36px,8vw,96px)] font-medium uppercase leading-[0.90] tracking-[-0.02em] text-white"
                        style={{
                            fontFamily:
                                '"Nike Futura ND", "Helvetica Now Display Medium", Helvetica, Arial, sans-serif',
                        }}
                    >
                        {t("home.hero.title")}
                    </h1>
                    <p className="mt-4 max-w-[52ch] text-[16px] font-medium leading-[1.5] text-white/90">
                        {t("home.hero.sub")}
                    </p>
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        <Link
                            href="#categories"
                            className="inline-flex h-12 items-center justify-center rounded-full bg-[#111111] px-8 text-[16px] font-medium text-white transition-colors hover:bg-[#707072] dark:bg-white dark:text-[#111111] dark:hover:bg-[#e5e5e5]"
                        >
                            {t("home.hero.ctaPrimary")}
                        </Link>
                        {!currentUser ? (
                            <Link
                                href="/register"
                                className="inline-flex h-12 items-center justify-center rounded-full border border-white/30 bg-white px-8 text-[14px] font-medium text-[#111111] hover:bg-white/90"
                            >
                                {t("home.hero.ctaSecondary")}
                            </Link>
                        ) : null}
                    </div>
                    <div className="mt-6 flex flex-wrap items-center gap-2 text-[12px] font-medium text-white/80">
                        <span className="rounded-full bg-white/15 px-3 py-1 backdrop-blur">
                            {productsTotal.toLocaleString("fa-IR")} {t("common.productsCount")}
                        </span>
                        <span className="rounded-full bg-white/15 px-3 py-1 backdrop-blur">
                            {categories.length.toLocaleString("fa-IR")} {t("home.proof.categoriesLabel")}
                        </span>
                    </div>
                </div>
            </section>

            {/* B — Utility Bar */}
            <div className="sticky top-14 z-40 border-y border-[#e5e5e5] bg-[#f5f5f5] dark:border-[#39393b] dark:bg-[#1a1a1a]">
                <div className="mx-auto flex max-w-[1440px] items-center gap-2 overflow-x-auto px-4 py-2 text-[12px] font-medium text-[#111111] dark:text-white sm:px-6 lg:px-8">
                    <span className="whitespace-nowrap rounded-full bg-white px-3 py-1 text-[#111111] dark:bg-[#39393b] dark:text-white">
                        ● {productsTotal.toLocaleString("fa-IR")} {t("home.utility.activeSkus")}
                    </span>
                    <span className="whitespace-nowrap rounded-full bg-white px-3 py-1 dark:bg-[#39393b]">
                        {t("home.utility.stock")}: {totalInventory.toLocaleString("fa-IR")}
                    </span>
                    {primaryPhone ? (
                        <a
                            href={`tel:${primaryPhone.number}`}
                            className="whitespace-nowrap rounded-full bg-white px-3 py-1 hover:bg-[#e5e5e5] dark:bg-[#39393b] dark:hover:bg-[#4b4b4d]"
                        >
                            {primaryPhone.number}
                        </a>
                    ) : null}
                    {partnerDiscount > 0 ? (
                        <span className="whitespace-nowrap rounded-full bg-[#111111] px-3 py-1 text-white dark:bg-white dark:text-[#111111]">
                            {tFmt("home.utility.partnerDiscount", { discount: partnerDiscount })}
                        </span>
                    ) : null}
                    <span className="ml-auto hidden whitespace-nowrap text-[#707072] dark:text-[#9e9ea0] sm:inline">
                        {" "}
                        {siteName}
                    </span>
                </div>
            </div>

            {/* C — New Drops */}
            {products.length > 0 ? (
                <section
                    className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8"
                    data-od-id="new-drops"
                    aria-labelledby="new-h"
                >
                    <SectionHead
                        eyebrow={t("home.new.eyebrow")}
                        title={t("home.new.title")}
                        titleId="new-h"
                        actionHref="/products"
                        actionLabel={t("home.new.action")}
                    />
                    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {products.map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                </section>
            ) : (
                <section className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8" data-od-id="new-drops-empty">
                    <Card className="rounded-none border border-dashed border-[#cacacb] bg-[#f5f5f5] p-0 dark:border-[#39393b] dark:bg-[#1a1a1a]">
                        <CardContent className="p-10 text-center">
                            <p className="text-[16px] font-medium text-[#111111] dark:text-white">
                                {t("common.noProducts")}
                            </p>
                            <p className="mt-1 text-[14px] font-medium text-[#707072] dark:text-[#9e9ea0]">
                                {t("common.noProductsHint")}
                            </p>
                            <Link
                                href="/products"
                                className="mt-4 inline-flex h-9 items-center justify-center rounded-full bg-[#111111] px-6 text-[14px] font-medium text-white dark:bg-white dark:text-[#111111]"
                            >
                                {t("common.viewAll")}
                            </Link>
                        </CardContent>
                    </Card>
                </section>
            )}

            {/* D — Category Tiles */}
            {categories.length > 0 ? (
                <section
                    id="categories"
                    className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8"
                    data-od-id="categories"
                    aria-labelledby="cat-h"
                >
                    <SectionHead
                        eyebrow={t("home.categories.eyebrow")}
                        title={t("home.categories.title")}
                        titleId="cat-h"
                        actionHref="/categories"
                        actionLabel={t("home.categories.action")}
                    />
                    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {categories.slice(0, 6).map((cat, i) => (
                            <CategoryCard
                                key={cat.id}
                                category={cat}
                                count={categoryCounts[i] ?? 0}
                                imageUrl={categoryImageMap.get(cat.id) ?? null}
                            />
                        ))}
                    </div>
                </section>
            ) : null}

            {/* E — Contractor's Pick */}
            {showPopular ? (
                <section
                    className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8"
                    data-od-id="contractor-pick"
                    aria-labelledby="popular-h"
                >
                    <SectionHead
                        eyebrow={t("home.popular.eyebrow")}
                        title={t("home.popular.title")}
                        titleId="popular-h"
                        actionHref="/products"
                        actionLabel={t("home.popular.action")}
                    />
                    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {popular.map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                </section>
            ) : null}

            {/* F — Proof / Spec Strip */}
            <section
                className="border-y border-[#e5e5e5] bg-[#f5f5f5] py-10 dark:border-[#39393b] dark:bg-[#1a1a1a]"
                data-od-id="proof-strip"
            >
                <div className="mx-auto grid max-w-[1440px] gap-8 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
                    <div className="space-y-2">
                        <p className="text-[48px] font-medium leading-none tracking-[-0.02em] text-[#111111] dark:text-white">
                            {categories.length.toLocaleString("fa-IR")}
                        </p>
                        <p className="text-[12px] font-medium uppercase tracking-wide text-[#707072] dark:text-[#9e9ea0]">
                            {t("home.proof.categoriesLabel")}
                        </p>
                        <p className="text-[14px] font-medium leading-[1.5] text-[#707072] dark:text-[#9e9ea0]">
                            {t("home.brands.title")}
                        </p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-[48px] font-medium leading-none tracking-[-0.02em] text-[#111111] dark:text-white">
                            {brands.length.toLocaleString("fa-IR")}
                        </p>
                        <p className="text-[12px] font-medium uppercase tracking-wide text-[#707072] dark:text-[#9e9ea0]">
                            {t("home.proof.brandsLabel")}
                        </p>
                        <p className="text-[14px] font-medium leading-[1.5] text-[#707072] dark:text-[#9e9ea0]">
                            {t("home.proof.brandsLabel")}
                        </p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-[48px] font-medium leading-none tracking-[-0.02em] text-[#111111] dark:text-white">
                            {totalInventory.toLocaleString("fa-IR")}
                        </p>
                        <p className="text-[12px] font-medium uppercase tracking-wide text-[#707072] dark:text-[#9e9ea0]">
                            {t("home.proof.stockLabel")}
                        </p>
                        <p className="text-[14px] font-medium leading-[1.5] text-[#111111] dark:text-white">
                            {partnerDiscount > 0
                                ? tFmt("home.proof.procedure", { discount: partnerDiscount })
                                : "قیمت صفر = استعلام. افزودن به سبد → بررسی → تایید → آماده‌سازی → تحویل."}
                        </p>
                        <Link
                            href="/about"
                            className="inline-flex text-[14px] font-medium text-[#111111] underline hover:text-[#707072] dark:text-white dark:hover:text-[#9e9ea0]"
                        >
                            {t("home.proof.howToOrder")} →
                        </Link>
                    </div>
                </div>
            </section>

            {/* G — Brand Pills */}
            {brands.length > 0 ? (
                <section
                    className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8"
                    data-od-id="brands"
                    aria-labelledby="brands-h"
                >
                    <SectionHead
                        eyebrow={t("home.brands.eyebrow")}
                        title={t("home.brands.title")}
                        titleId="brands-h"
                        actionHref="/brands"
                        actionLabel={t("home.brands.action")}
                    />
                    <div className="mt-6 flex flex-wrap gap-2">
                        <Link
                            href="/products"
                            className="rounded-full bg-[#111111] px-4 py-1.5 text-[14px] font-medium text-white dark:bg-white dark:text-[#111111]"
                        >
                            {t("common.all")}
                        </Link>
                        {brands.map((b, i) => (
                            <Link
                                key={b.id}
                                href={`/products?brand=${b.slug}`}
                                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-[14px] font-medium text-[#111111] ring-1 ring-[#e5e5e5] transition-colors hover:bg-[#f5f5f5] dark:bg-transparent dark:text-white dark:ring-[#39393b] dark:hover:bg-[#39393b]"
                            >
                                <span className="truncate max-w-[14ch]">{b.name}</span>
                                <span className="text-[12px] font-medium text-[#707072] dark:text-[#9e9ea0]">
                                    {(brandCounts[i] ?? 0).toLocaleString("fa-IR")}
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>
            ) : null}

            {/* G2 — Closing CTA Band */}
            <section className="bg-[#111111] py-12 text-white dark:bg-[#111111] md:py-16" data-od-id="cta-band">
                <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
                    <div className="max-w-[28ch]">
                        <h2
                            className="text-[clamp(28px,5vw,48px)] font-medium uppercase leading-[0.95] tracking-[-0.02em]"
                            style={{
                                fontFamily:
                                    '"Nike Futura ND", "Helvetica Now Display Medium", Helvetica, Arial, sans-serif',
                            }}
                        >
                            {t("home.ctaBand.title")}
                        </h2>
                        <p className="mt-3 text-[14px] font-medium leading-[1.5] text-white/80">
                            {t("home.ctaBand.sub")}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            href="/products"
                            className="inline-flex h-12 items-center justify-center rounded-full bg-white px-8 text-[16px] font-medium text-[#111111] hover:bg-[#e5e5e5]"
                        >
                            {t("home.ctaBand.primary")}
                        </Link>
                        <Link
                            href="/contact"
                            className="text-[14px] font-medium text-white/80 underline hover:text-white"
                        >
                            {t("home.ctaBand.secondary")} →
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
