import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { MediaImage } from '@/components/MediaImage'
import { formatPriceToman } from '@/lib/format'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Where } from 'payload'

import { ProductCard } from '@/components/product/ProductCard'

type SearchParams = Promise<{
    brand?: string
    category?: string
    q?: string
}>

export const metadata = {
    title: 'محصولات | آبفارین',
    description: 'مرور محصولات فروشگاه آبفارین',
}

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
    const params = await searchParams
    const payload = await getPayload({ config })

    const where: Where = {}
    if (params.brand) {
        where.brand = { equals: params.brand }
    }
    if (params.q) {
        where.name = { like: params.q }
    }
    if (params.category) {
        where.categories = { in: [params.category] }
    }

    const [products, brands, categories] = await Promise.all([
        payload.find({
            collection: 'products',
            where,
            limit: 60,
            depth: 2,
            sort: '-createdAt',
        }),
        payload.find({ collection: 'brands', limit: 100, sort: 'order' }),
        payload.find({ collection: 'categories', limit: 100 }),
    ])

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">محصولات</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    {products.totalDocs} محصول یافت شد
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-[220px_1fr]">
                <aside className="space-y-4">
                    <Card className="p-4">
                        <h2 className="mb-3 text-sm font-semibold">جستجو</h2>
                        <form className="flex gap-2">
                            <input
                                name="q"
                                defaultValue={params.q ?? ''}
                                placeholder="نام محصول..."
                                className="h-9 w-full rounded-md border bg-background px-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                            />
                            <button
                                type="submit"
                                className="h-9 rounded-md bg-primary px-3 text-sm text-primary-foreground hover:bg-primary/80"
                            >
                                جستجو
                            </button>
                        </form>
                    </Card>

                    {brands.docs.length > 0 ? (
                        <Card className="p-4">
                            <h2 className="mb-3 text-sm font-semibold">برند</h2>
                            <ul className="flex flex-col gap-1.5 text-sm">
                                <li>
                                    <Link
                                        href="/products"
                                        className={
                                            !params.brand
                                                ? 'font-bold text-primary'
                                                : 'text-muted-foreground hover:text-foreground'
                                        }
                                    >
                                        همه برندها
                                    </Link>
                                </li>
                                {brands.docs.map((brand) => (
                                    <li key={brand.id}>
                                        <Link
                                            href={`/products?brand=${brand.id}`}
                                            className={
                                                String(brand.id) === params.brand
                                                    ? 'font-bold text-primary'
                                                    : 'text-muted-foreground hover:text-foreground'
                                            }
                                        >
                                            {brand.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    ) : null}

                    {categories.docs.length > 0 ? (
                        <Card className="p-4">
                            <h2 className="mb-3 text-sm font-semibold">دسته‌بندی</h2>
                            <div className="flex flex-wrap gap-1.5">
                                {categories.docs.map((cat) => (
                                    <Link key={cat.id} href={`/products?category=${cat.id}`}>
                                        <Badge
                                            variant={
                                                String(cat.id) === params.category
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                        >
                                            {cat.name}
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
                                alt="محصولی یافت نشد"
                                width={120}
                                height={120}
                            />
                            <p className="text-muted-foreground">محصولی با این فیلتر یافت نشد.</p>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                            {products.docs.map((p, i) => (
                                <Link key={p.id} href={`/products/${p.slug}`}>
                                    <ProductCard product={p} priority={i < 3} />
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}