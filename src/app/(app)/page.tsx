import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { listActiveBrands, getSiteSettings } from '@/lib/site-settings'
import { getPayload } from 'payload'
import config from '@payload-config'

import { MediaImage } from '@/components/MediaImage'
import { ProductCard } from '@/components/product/ProductCard'

const HERO_SLIDES = [
    {
        title: 'لوله و اتصالات با کیفیت',
        subtitle: 'نمایندگی رسمی برندهای معتبر ایران',
        cta: 'مشاهده محصولات',
        href: '/products',
    },
    {
        title: 'ارسال سریع به سراسر کشور',
        subtitle: 'سفارش خود را امروز ثبت کنید',
        cta: 'ثبت سفارش',
        href: '/products',
    },
    {
        title: 'مشاوره تخصصی',
        subtitle: 'تیم فنی ما آماده پاسخگویی به شماست',
        cta: 'تماس با ما',
        href: '/contact',
    },
]

export default async function HomePage() {
    const payload = await getPayload({ config })

    const [settings, featured, brands] = await Promise.all([
        getSiteSettings(),
        payload.find({
            collection: 'products',
            where: { featured: { equals: true } },
            limit: 8,
            depth: 2,
            sort: '-createdAt',
        }),
        listActiveBrands(8),
    ])

    return (
        <div className="flex flex-col gap-12 pb-12">
            <section className="container mx-auto px-4 pt-8">
                <div className="grid gap-4 md:grid-cols-3">
                    {HERO_SLIDES.map((slide, i) => (
                        <div
                            key={i}
                            className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 md:p-8"
                        >
                            <h2 className="text-xl font-bold leading-tight md:text-2xl">
                                {slide.title}
                            </h2>
                            <p className="mt-2 text-sm text-muted-foreground md:text-base">
                                {slide.subtitle}
                            </p>
                            <Button className="mt-4" render={<Link href={slide.href} />}>
                                {slide.cta}
                            </Button>
                        </div>
                    ))}
                </div>
            </section>

            {featured.docs.length > 0 ? (
                <section className="container mx-auto px-4">
                    <div className="mb-6 flex items-end justify-between">
                        <h2 className="text-2xl font-bold">محصولات ویژه</h2>
                        <Link
                            href="/products"
                            className="text-sm text-muted-foreground hover:text-foreground"
                        >
                            مشاهده همه ←
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                        {featured.docs.map((p, i) => (
                            <Link key={p.id} href={`/products/${p.slug}`}>
                                <ProductCard product={p} priority={i < 4} />
                            </Link>
                        ))}
                    </div>
                </section>
            ) : null}

            {brands.length > 0 ? (
                <section className="container mx-auto px-4">
                    <div className="mb-6 flex items-end justify-between">
                        <h2 className="text-2xl font-bold">برندها</h2>
                        <Link
                            href="/brands"
                            className="text-sm text-muted-foreground hover:text-foreground"
                        >
                            همه برندها ←
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                        {brands.map((brand) => (
                            <Link
                                key={brand.id}
                                href={`/brands/${brand.slug}`}
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
                        <h2 className="text-xl font-semibold">فروشگاه در حال راه‌اندازی است</h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            به زودی محصولات و برندها از طریق پنل مدیریت اضافه خواهند شد.
                        </p>
                    </div>
                </section>
            ) : null}
        </div>
    )
}