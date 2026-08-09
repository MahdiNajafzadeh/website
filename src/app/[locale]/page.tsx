import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { listActiveBrands, getSiteSettings } from '@/lib/site-settings'
import type { Locale } from '@/lib/locale'
import { ensureLocale, localeHref } from '@/lib/locale'
import { getTranslator } from '@/lib/i18n'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Product } from '@/payload-types'

import { MediaImage } from '@/components/MediaImage'
import { ProductCard } from '@/components/product/ProductCard'

type Params = Promise<{ locale: string }>

export default async function HomePage(props: { params: Params }) {
    const { locale: rawLocale } = await props.params
    const locale: Locale = ensureLocale(rawLocale)
    const { t } = getTranslator(locale)
    const payload = await getPayload({ config })

    const [settings, featured, brands] = await Promise.all([
        getSiteSettings(locale),
        payload.find({
            collection: 'products',
            where: { featured: { equals: true } },
            limit: 8,
            depth: 2,
            sort: '-createdAt',
            locale,
        }),
        listActiveBrands(locale, 8),
    ])
    const featuredDocs: Product[] = featured.docs as Product[]
    type Brand = (typeof brands)[number]

    const heroSlides = [
        {
            titleKey: 'home.hero.slide1.title',
            subtitleKey: 'home.hero.slide1.subtitle',
            ctaKey: 'home.hero.slide1.cta',
            href: '/products',
        },
        {
            titleKey: 'home.hero.slide2.title',
            subtitleKey: 'home.hero.slide2.subtitle',
            ctaKey: 'home.hero.slide2.cta',
            href: '/products',
        },
        {
            titleKey: 'home.hero.slide3.title',
            subtitleKey: 'home.hero.slide3.subtitle',
            ctaKey: 'home.hero.slide3.cta',
            href: '/contact',
        },
    ] as const

    return (
        <div className="flex flex-col gap-12 pb-12">
            <section className="container mx-auto px-4 pt-8">
                <div className="grid gap-4 md:grid-cols-3">
                    {heroSlides.map((slide, i) => (
                        <div
                            key={i}
                            className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 md:p-8"
                        >
                            <h2 className="text-xl font-bold leading-tight md:text-2xl">
                                {t(slide.titleKey)}
                            </h2>
                            <p className="mt-2 text-sm text-muted-foreground md:text-base">
                                {t(slide.subtitleKey)}
                            </p>
                            <Button className="mt-4" render={<Link href={localeHref(locale, slide.href)} />}>
                                {t(slide.ctaKey)}
                            </Button>
                        </div>
                    ))}
                </div>
            </section>

            {featured.docs.length > 0 ? (
                <section className="container mx-auto px-4">
                    <div className="mb-6 flex items-end justify-between">
                        <h2 className="text-2xl font-bold">{t('home.section.featured')}</h2>
                        <Link
                            href={localeHref(locale, '/products')}
                            className="text-sm text-muted-foreground hover:text-foreground"
                        >
                            {t('home.section.featured.viewAll')}
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                        {featuredDocs.map((p: Product, i: number) => (
                            <Link key={p.id} href={localeHref(locale, `/products/${p.slug}`)}>
                                <ProductCard product={p} locale={locale} priority={i < 4} />
                            </Link>
                        ))}
                    </div>
                </section>
            ) : null}

            {brands.length > 0 ? (
                <section className="container mx-auto px-4">
                    <div className="mb-6 flex items-end justify-between">
                        <h2 className="text-2xl font-bold">{t('home.section.brands')}</h2>
                        <Link
                            href={localeHref(locale, '/brands')}
                            className="text-sm text-muted-foreground hover:text-foreground"
                        >
                            {t('home.section.brands.viewAll')}
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                        {brands.map((brand: Brand) => (
                            <Link
                                key={brand.id}
                                href={localeHref(locale, `/brands/${brand.slug}`)}
                                className="flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                            >
                                {brand.logo ? (
                                    <div className="relative size-16 overflow-hidden rounded-full bg-muted">
                                        <MediaImage
                                            media={brand.logo}
                                            alt={brand.logo.alt ?? brand.name}
                                            fill
                                            size="thumbnail"
                                            className="object-contain"
                                            locale={locale}
                                        />
                                    </div>
                                ) : (
                                    <div className="flex size-16 items-center justify-center rounded-full bg-muted text-sm font-bold">
                                        {brand.name.charAt(0)}
                                    </div>
                                )}
                                <span className="text-sm font-medium">{brand.name}</span>
                            </Link>
                        ))}
                    </div>
                </section>
            ) : null}

            {!settings?.siteName && featured.docs.length === 0 && brands.length === 0 ? (
                <section className="container mx-auto px-4">
                    <div className="rounded-lg border border-dashed p-10 text-center">
                        <h2 className="text-xl font-semibold">{t('home.empty.title')}</h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {t('home.empty.body')}
                        </p>
                    </div>
                </section>
            ) : null}
        </div>
    )
}
