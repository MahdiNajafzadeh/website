import { notFound } from 'next/navigation'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { MediaImage } from '@/components/MediaImage'
import { getCurrentUser } from '@/lib/auth-server'
import { formatPriceToman } from '@/lib/format'
import type { Locale } from '@/lib/locale'
import { ensureLocale, localeHref } from '@/lib/locale'
import { getTranslator } from '@/lib/i18n'
import { localizedValue } from '@/lib/localized'
import { getPayload } from 'payload'
import config from '@payload-config'

import { AddToCart } from '@/components/product/AddToCart'

type Params = Promise<{ slug: string; locale: string }>

export async function generateMetadata({ params }: { params: Params }) {
    const { slug, locale: rawLocale } = await params
    const locale: Locale = ensureLocale(rawLocale)
    const { t } = getTranslator(locale)
    const payload = await getPayload({ config })
    const result = await payload.find({
        collection: 'products',
        where: { slug: { equals: slug } },
        limit: 1,
        locale,
    })
    const product = result.docs[0]
    if (!product) return { title: t('product.detail.meta.notFound') }
    const localizedName = localizedValue(product.name, locale)
    const siteName = t('layout.header.siteNameFallback')
    return {
        title: `${localizedName} | ${siteName}`,
        description: `${localizedName} - ${formatPriceToman(product.price, locale)}`,
    }
}

export default async function ProductDetailPage({ params }: { params: Params }) {
    const { slug, locale: rawLocale } = await params
    const locale: Locale = ensureLocale(rawLocale)
    const { t } = getTranslator(locale)
    const payload = await getPayload({ config })
    const result = await payload.find({
        collection: 'products',
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 2,
        locale,
    })
    const product = result.docs[0]
    if (!product) notFound()

    const brand =
        product.brand && typeof product.brand !== 'number' ? product.brand : null
    const localizedName = localizedValue(product.name, locale)
    const localizedBrandName = brand ? localizedValue(brand.name, locale) : ''
    const images = (product.images ?? []).filter((i) => i.image)
    const isOut = typeof product.stock === 'number' && product.stock === 0

    // ponytail: server-side role check; no client session manager.
    const user = await getCurrentUser()
    const hidePrice = user?.role === 'customer'

    return (
        <div className="container mx-auto px-4 py-8">
            <Breadcrumb className="mb-4 text-sm text-muted-foreground">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink render={<Link href={localeHref(locale, '/')} />}>
                            {t('product.detail.breadcrumb.home')}
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink render={<Link href={localeHref(locale, '/products')} />}>
                            {t('product.detail.breadcrumb.products')}
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    {brand ? (
                        <>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink
                                    render={
                                        <Link
                                            href={localeHref(
                                                locale,
                                                `/brands/${brand.slug ?? brand.id}`,
                                            )}
                                        />
                                    }
                                    >
                                        {localizedBrandName}
                                    </BreadcrumbLink>
                            </BreadcrumbItem>
                        </>
                    ) : null}
                </BreadcrumbList>
            </Breadcrumb>

            <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-3">
                    {images.length > 0 ? (
                        <>
                            <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
                                <MediaImage
                                    media={images[0].image}
                                alt={localizedName}
                                fill
                                size="hero"
                                priority
                                className="object-cover"
                                locale={locale}
                                />
                            </div>
                            {images.length > 1 ? (
                                <div className="grid grid-cols-4 gap-2">
                                    {images.slice(1).map((img, i) => (
                                        <div
                                            key={i}
                                            className="relative aspect-square overflow-hidden rounded-md border bg-muted"
                                        >
                                            <MediaImage
                                                media={img.image}
                                                alt={img.caption ?? localizedName}
                                                fill
                                                size="card"
                                                loading="lazy"
                                                className="object-cover"
                                                locale={locale}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : null}
                        </>
                    ) : (
                        <div className="flex aspect-square w-full items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                            {t('product.detail.imageMissing')}
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            {product.featured ? <Badge>{t('product.detail.badge.featured')}</Badge> : null}
                            {isOut ? <Badge variant="destructive">{t('product.detail.badge.outOfStock')}</Badge> : null}
                        </div>
                        <h1 className="text-2xl font-bold leading-tight md:text-3xl">
                            {localizedName}
                        </h1>
                        {brand ? (
                            <Link
                                href={localeHref(locale, `/brands/${brand.slug}`)}
                                className="inline-block text-sm text-muted-foreground hover:text-foreground"
                            >
                                {t('product.detail.brandPrefix')}
                                {localizedBrandName}
                            </Link>
                        ) : null}
                    </div>

                    <div className="text-3xl font-bold">
                        {hidePrice ? (
                            <span className="text-base font-normal text-muted-foreground">
                                {t('product.price.callForPrice')}
                            </span>
                        ) : (
                            formatPriceToman(product.price, locale)
                        )}
                    </div>

                    <AddToCart product={product} locale={locale} disabled={isOut} />

                    <Separator />

                    {product.specifications ? (
                        <Card>
                            <CardContent className="p-4">
                                <h2 className="mb-3 text-sm font-semibold">{t('product.detail.specs.heading')}</h2>
                                <dl className="grid grid-cols-2 gap-y-2 text-sm">
                                    {product.specifications.size ? (
                                        <>
                                            <dt className="text-muted-foreground">{t('product.detail.specs.size')}</dt>
                                            <dd>{product.specifications.size}</dd>
                                        </>
                                    ) : null}
                                    {product.specifications.thickness ? (
                                        <>
                                            <dt className="text-muted-foreground">{t('product.detail.specs.thickness')}</dt>
                                            <dd>{product.specifications.thickness}</dd>
                                        </>
                                    ) : null}
                                    {product.specifications.weight ? (
                                        <>
                                            <dt className="text-muted-foreground">{t('product.detail.specs.weight')}</dt>
                                            <dd>{product.specifications.weight}</dd>
                                        </>
                                    ) : null}
                                    {product.specifications.application ? (
                                        <>
                                            <dt className="text-muted-foreground">{t('product.detail.specs.application')}</dt>
                                            <dd>{product.specifications.application}</dd>
                                        </>
                                    ) : null}
                                </dl>
                            </CardContent>
                        </Card>
                    ) : null}

                    {typeof product.stock === 'number' ? (
                        <p className="text-sm text-muted-foreground">
                            {t('product.detail.stockLine', { count: product.stock })}
                        </p>
                    ) : null}
                </div>
            </div>
        </div>
    )
}
