import { notFound } from 'next/navigation'
import Link from 'next/link'

import { Card } from '@/components/ui/card'
import { MediaImage } from '@/components/MediaImage'
import { getPayload } from 'payload'
import config from '@payload-config'

import { ProductCard } from '@/components/product/ProductCard'

type Params = Promise<{ slug: string }>

export async function generateMetadata({ params }: { params: Params }) {
    const { slug } = await params
    const payload = await getPayload({ config })
    const result = await payload.find({
        collection: 'brands',
        where: { slug: { equals: slug } },
        limit: 1,
    })
    const brand = result.docs[0]
    if (!brand) return { title: 'برند یافت نشد' }
    return { title: `${brand.name} | آبفارین` }
}

export default async function BrandDetailPage({ params }: { params: Params }) {
    const { slug } = await params
    const payload = await getPayload({ config })

    const brandResult = await payload.find({
        collection: 'brands',
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 1,
    })
    const brand = brandResult.docs[0]
    if (!brand) notFound()

    const products = await payload.find({
        collection: 'products',
        where: { brand: { equals: brand.id } },
        limit: 100,
        depth: 2,
        sort: '-createdAt',
    })

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6 flex items-center gap-4">
                {brand.logo ? (
                    <div className="relative size-16 overflow-hidden rounded-md bg-muted">
                        <MediaImage
                            media={brand.logo}
                            alt={brand.logo.alt ?? brand.name}
                            fill
                            size="card"
                            className="object-contain"
                        />
                    </div>
                ) : null}
                <div>
                    <h1 className="text-3xl font-bold">{brand.name}</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {products.totalDocs} محصول
                    </p>
                </div>
            </div>

            <div className="mb-6 text-sm text-muted-foreground">
                <Link href="/" className="hover:text-foreground">
                    خانه
                </Link>
                <span className="mx-1">/</span>
                <Link href="/brands" className="hover:text-foreground">
                    برندها
                </Link>
                <span className="mx-1">/</span>
                <span>{brand.name}</span>
            </div>

            {products.docs.length === 0 ? (
                <Card className="p-10 text-center text-muted-foreground">
                    محصولی برای این برند ثبت نشده است.
                </Card>
            ) : (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {products.docs.map((p, i) => (
                        <Link key={p.id} href={`/products/${p.slug}`}>
                            <ProductCard product={p} priority={i < 4} />
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}