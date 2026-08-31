import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Brand, Category, Media, Product } from '@/payload-types'

export const dynamic = 'force-dynamic'

function getMediaUrl(media: number | Media | null | undefined): string | null {
  if (!media || typeof media === 'number') return null
  return (media as Media).url ?? null
}

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const catRes = await payload.find({
    collection: 'categories',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })

  const category = catRes.docs[0] as Category | undefined
  if (!category) notFound()

  // Products by category via relationship query — combined brand+category filter also verified via /products?brand=&category=
  const productsRes = await payload.find({
    collection: 'products',
    where: {
      and: [{ visible: { equals: true } }, { category: { equals: category.id } }],
    },
    depth: 1,
    limit: 24,
    sort: '-createdAt',
  })

  const products = productsRes.docs as Product[]

  // Fetch brands for filter pills context (optional but helps compose filters)
  const brandsRes = await payload.find({
    collection: 'brands',
    limit: 50,
    sort: 'name',
    depth: 0,
  })
  const brands = brandsRes.docs as Brand[]

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 md:px-8">
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-[#707072]" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-[#111111]">
          Home
        </Link>
        <span aria-hidden>/</span>
        <Link href="/products" className="hover:text-[#111111]">
          Products
        </Link>
        <span aria-hidden>/</span>
        <span className="font-medium text-[#111111]">{category.name}</span>
      </nav>

      {/* Header — category pill hero */}
      <div className="rounded-[30px] bg-[#f5f5f5] p-6">
        {/* {colors.soft-cloud} #f5f5f5, {rounded.lg} 30px */}
        <h1 className="text-[32px] font-medium leading-[1.2] text-[#111111]">{category.name}</h1>
        {category.description && <p className="mt-1 text-[14px] font-medium text-[#707072]">{category.description}</p>}
        <p className="mt-1 text-[12px] font-medium text-[#707072]">{productsRes.totalDocs} products in this category</p>
      </div>

      {/* Filter pills — pills use {colors.soft-cloud} #f5f5f5, {rounded.full} 9999px, {typography.caption-md} 14px/500 */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="text-[14px] font-medium text-[#111111] mr-1">Brands:</span>
        <Link
          href={`/products?category=${category.slug}`}
          className="rounded-full bg-[#111111] px-4 py-1.5 text-[14px] font-medium text-white"
        >
          All brands in {category.name}
        </Link>
        {brands.slice(0, 8).map((b) => (
          <Link
            key={b.id}
            href={`/products?brand=${b.slug}&category=${category.slug}`}
            className="rounded-full bg-[#f5f5f5] px-4 py-1.5 text-[14px] font-medium text-[#111111] ring-1 ring-[#e5e5e5] hover:bg-[#e5e5e5]"
            /* combined brand+category filter — verify composing */
          >
            {b.name}
          </Link>
        ))}
        <Link
          href="/products"
          className="rounded-full bg-white px-4 py-1.5 text-[14px] font-medium text-[#111111] ring-1 ring-[#cacacb] hover:bg-[#f5f5f5]"
        >
          All products
        </Link>
      </div>

      {/* Category pills row (other categories) */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Link
          href={`/products?category=${category.slug}`}
          className="rounded-full bg-[#111111] px-4 py-1.5 text-[14px] font-medium text-white"
        >
          {category.name} only
        </Link>
        <Link
          href="/products"
          className="rounded-full bg-[#f5f5f5] px-4 py-1.5 text-[14px] font-medium text-[#111111] ring-1 ring-[#e5e5e5] hover:bg-[#e5e5e5]"
        >
          Clear category
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="mt-8 rounded-[30px] bg-white p-12 text-center ring-1 ring-[#e5e5e5]">
          <p className="text-[16px] font-medium text-[#111111]">No products in this category</p>
          <p className="mt-1 text-[14px] font-medium text-[#707072]">Try another category or browse all.</p>
          <Link href="/products" className="mt-4 inline-flex rounded-full bg-[#111111] px-6 py-2 text-[14px] font-medium text-white">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const brand = product.brand as Brand | number | null | undefined
            const brandName = brand && typeof brand !== 'number' ? brand.name : null
            const showcase = getMediaUrl(product.showcaseImage as Media | number | null | undefined)
            const firstImage =
              product.images?.[0] && typeof product.images[0].image !== 'number'
                ? getMediaUrl(product.images[0].image as Media)
                : null
            const imageUrl = showcase ?? firstImage
            const price = product.price ?? 0
            const inventory = product.inventory ?? 0
            const isOutOfStock = inventory <= 0

            return (
              <Link key={product.id} href={`/products/${product.slug}`} className="group">
                <Card className="overflow-hidden rounded-[30px] border border-[#e5e5e5] bg-white p-0 gap-0">
                  <div className="aspect-square overflow-hidden bg-[#f5f5f5]">
                    {imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm text-[#707072]">No image</div>
                    )}
                  </div>
                  <CardContent className="p-4 flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5">
                      {isOutOfStock && (
                        <Badge variant="outline" className="rounded-full border-[#cacacb] bg-white text-[#707072] text-xs">
                          ناموجود
                        </Badge>
                      )}
                      <Badge variant="secondary" className="rounded-full bg-[#f5f5f5] text-[#111111] text-xs">
                        {category.name}
                      </Badge>
                    </div>
                    <h3 className="line-clamp-2 text-[16px] font-medium leading-[1.5] text-[#111111]">{product.name}</h3>
                    {brandName && <p className="text-[14px] font-medium text-[#707072]">{brandName}</p>}
                    <p className="text-[14px] font-medium text-[#111111]">{price === 0 ? 'Contact for price' : `${price.toLocaleString()} تومان`}</p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
