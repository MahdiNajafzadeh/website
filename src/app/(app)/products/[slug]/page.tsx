import { notFound } from 'next/navigation'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { MediaImage } from '@/components/MediaImage'
import { formatPriceToman } from '@/lib/format'
import { getPayload } from 'payload'
import config from '@payload-config'

import { AddToCart } from '@/components/product/AddToCart'

type Params = Promise<{ slug: string }>

export async function generateMetadata({ params }: { params: Params }) {
    const { slug } = await params
    const payload = await getPayload({ config })
    const result = await payload.find({
        collection: 'products',
        where: { slug: { equals: slug } },
        limit: 1,
    })
    const product = result.docs[0]
    if (!product) return { title: 'محصول یافت نشد' }
    return {
        title: `${product.name} | آبفارین`,
        description: `${product.name} - ${formatPriceToman(product.price)}`,
    }
}

export default async function ProductDetailPage({ params }: { params: Params }) {
    const { slug } = await params
    const payload = await getPayload({ config })
    const result = await payload.find({
        collection: 'products',
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 2,
    })
    const product = result.docs[0]
    if (!product) notFound()

    const brand =
        product.brand && typeof product.brand !== 'number' ? product.brand : null
    const images = (product.images ?? []).filter((i) => i.image)
    const isOut = typeof product.stock === 'number' && product.stock === 0

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-4 text-sm text-muted-foreground">
                <Link href="/" className="hover:text-foreground">
                    خانه
                </Link>
                <span className="mx-1">/</span>
                <Link href="/products" className="hover:text-foreground">
                    محصولات
                </Link>
                {brand ? (
                    <>
                        <span className="mx-1">/</span>
                        <Link
                            href={`/brands/${brand.slug}`}
                            className="hover:text-foreground"
                        >
                            {brand.name}
                        </Link>
                    </>
                ) : null}
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-3">
                    {images.length > 0 ? (
                        <>
                            <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
                                <MediaImage
                                    media={images[0].image}
                                    alt={product.name}
                                    fill
                                    size="hero"
                                    priority
                                    className="object-cover"
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
                                                alt={img.caption ?? product.name}
                                                fill
                                                size="card"
                                                className="object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : null}
                        </>
                    ) : (
                        <div className="flex aspect-square w-full items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                            بدون تصویر
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            {product.featured ? <Badge>ویژه</Badge> : null}
                            {isOut ? <Badge variant="destructive">ناموجود</Badge> : null}
                        </div>
                        <h1 className="text-2xl font-bold leading-tight md:text-3xl">
                            {product.name}
                        </h1>
                        {brand ? (
                            <Link
                                href={`/brands/${brand.slug}`}
                                className="inline-block text-sm text-muted-foreground hover:text-foreground"
                            >
                                برند: {brand.name}
                            </Link>
                        ) : null}
                    </div>

                    <div className="text-3xl font-bold">{formatPriceToman(product.price)}</div>

                    <AddToCart product={product} disabled={isOut} />

                    <Separator />

                    {product.specifications ? (
                        <Card>
                            <CardContent className="p-4">
                                <h2 className="mb-3 text-sm font-semibold">مشخصات فنی</h2>
                                <dl className="grid grid-cols-2 gap-y-2 text-sm">
                                    {product.specifications.size ? (
                                        <>
                                            <dt className="text-muted-foreground">سایز:</dt>
                                            <dd>{product.specifications.size}</dd>
                                        </>
                                    ) : null}
                                    {product.specifications.thickness ? (
                                        <>
                                            <dt className="text-muted-foreground">ضخامت:</dt>
                                            <dd>{product.specifications.thickness}</dd>
                                        </>
                                    ) : null}
                                    {product.specifications.weight ? (
                                        <>
                                            <dt className="text-muted-foreground">وزن:</dt>
                                            <dd>{product.specifications.weight}</dd>
                                        </>
                                    ) : null}
                                    {product.specifications.application ? (
                                        <>
                                            <dt className="text-muted-foreground">کاربرد:</dt>
                                            <dd>{product.specifications.application}</dd>
                                        </>
                                    ) : null}
                                </dl>
                            </CardContent>
                        </Card>
                    ) : null}

                    {typeof product.stock === 'number' ? (
                        <p className="text-sm text-muted-foreground">
                            موجودی: {product.stock} عدد
                        </p>
                    ) : null}
                </div>
            </div>
        </div>
    )
}