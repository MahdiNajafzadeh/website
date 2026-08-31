import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { AddToCartButton } from '@/components/product/AddToCartButton'
import { ProductActions } from '@/components/product/ProductActions'
import { Package, AlertTriangle } from 'lucide-react'
import type { Brand, Category, Media, Product } from '@/payload-types'

export const dynamic = 'force-dynamic'

function getMediaUrl(media: number | Media | null | undefined): string | null {
  if (!media || typeof media === 'number') return null
  return (media as Media).url ?? null
}

function formatPrice(price: number): string {
  return `${price.toLocaleString('en-US')} تومان`
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const res = await payload.find({
    collection: 'products',
    where: {
      and: [{ slug: { equals: slug } }, { visible: { equals: true } }],
    },
    depth: 2,
    limit: 1,
  })

  const product = res.docs[0] as Product | undefined
  if (!product) notFound()

  const brand = product.brand as Brand | number | null | undefined
  const brandObj = brand && typeof brand !== 'number' ? (brand as Brand) : null
  const category = product.category as Category | number | null | undefined
  const categoryObj = category && typeof category !== 'number' ? (category as Category) : null

  const showcaseUrl = getMediaUrl(product.showcaseImage as Media | number | null | undefined)
  const galleryUrls: string[] = (product.images ?? [])
    .map((row) => getMediaUrl(row.image as Media | number))
    .filter((u): u is string => Boolean(u))

  // Deduplicate showcase if also in gallery
  const allImages = showcaseUrl
    ? [showcaseUrl, ...galleryUrls.filter((u) => u !== showcaseUrl)]
    : galleryUrls

  const price = product.price ?? 0
  const inventory = product.inventory ?? 0
  const isOutOfStock = inventory <= 0
  const isLowStock = inventory > 0 && inventory <= 5
  const heroImage = allImages[0] ?? null

  // For AddToCartButton image fallback
  const cartImage = heroImage ?? undefined

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 md:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-[#707072]" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-[#111111]">
          Home
        </Link>
        <span aria-hidden>/</span>
        <Link href="/products" className="hover:text-[#111111]">
          Products
        </Link>
        <span aria-hidden>/</span>
        <span className="text-[#111111] font-medium line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Gallery — beui gallery pattern — stage {colors.soft-cloud} #f5f5f5 */}
        <div className="flex flex-col gap-3">
          <div className="overflow-hidden rounded-[30px] bg-[#f5f5f5] aspect-square flex items-center justify-center">
            {/* {rounded.lg} 30px, {colors.soft-cloud} #f5f5f5 */}
            {heroImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={heroImage}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="text-[#707072] text-sm flex flex-col items-center gap-2 py-12">
                <Package className="size-8 text-[#9e9ea0]" />
                No image
              </div>
            )}
          </div>

          {showcaseUrl && showcaseUrl !== heroImage && (
            <Card className="overflow-hidden rounded-[30px] border border-[#e5e5e5] p-0">
              <div className="aspect-[16/9] overflow-hidden bg-[#f5f5f5]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={showcaseUrl} alt={`${product.name} showcase`} className="h-full w-full object-cover" />
              </div>
              <CardContent className="p-3">
                <p className="text-[12px] font-medium text-[#707072]">Showcase</p>
              </CardContent>
            </Card>
          )}

          {allImages.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {allImages.map((url) => (
                <div
                  key={url}
                  className="overflow-hidden rounded-[18px] bg-[#f5f5f5] aspect-square ring-1 ring-[#e5e5e5]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`${product.name} gallery`} className="h-full w-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          )}

          {galleryUrls.length === 0 && !showcaseUrl && (
            <p className="text-[14px] font-medium text-[#707072] text-center py-2">No gallery images</p>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-4">
          {/* Title — {typography.heading-xl} 32px/500 */}
          <h1 className="text-[32px] font-medium leading-[1.2] text-[#111111]">{product.name}</h1>

          {/* Brand link + category pill */}
          <div className="flex flex-wrap items-center gap-2">
            {brandObj ? (
              <Link
                href={`/brands/${brandObj.slug}`}
                className="inline-flex items-center gap-2 rounded-full bg-[#f5f5f5] px-3 py-1.5 text-[14px] font-medium text-[#111111] ring-1 ring-[#e5e5e5] hover:bg-[#e5e5e5]"
              >
                {brandObj.icon && typeof brandObj.icon !== 'number' && (brandObj.icon as Media).url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={(brandObj.icon as Media).url!}
                    alt={brandObj.name}
                    className="size-5 rounded-full object-cover"
                  />
                ) : null}
                {brandObj.name}
              </Link>
            ) : (
              <span className="text-[14px] font-medium text-[#707072]">No brand</span>
            )}

            {categoryObj && (
              <Link
                href={`/categories/${categoryObj.slug}`}
                className="rounded-full bg-white px-3 py-1.5 text-[14px] font-medium text-[#111111] ring-1 ring-[#cacacb] hover:bg-[#f5f5f5]"
                /* pill — {rounded.full} 9999px, {typography.caption-md} 14px/500 */
              >
                {categoryObj.name}
              </Link>
            )}
          </div>

          {/* Price — {colors.sale} #d30005 handling + {colors.mute} strike */}
          <div className="flex items-baseline gap-3">
            {price === 0 ? (
              <span className="text-[24px] font-medium text-[#707072]">Contact for price</span>
            ) : (
              <>
                <span className="text-[24px] font-medium text-[#111111]">{formatPrice(price)}</span>
                {/* Sale handling placeholder: if product had salePrice, show discounted in {colors.sale} */}
                {/* Example: <span className="text-[24px] font-medium text-[#d30005]">{salePrice}</span> <span className="line-through text-[#707072]">{price}</span> */}
              </>
            )}
          </div>

          {/* Inventory badges — {colors.mute} #707072 / "ناموجود" , low-stock */}
          <div className="flex flex-wrap items-center gap-2">
            {isOutOfStock ? (
              <Badge
                variant="outline"
                className="rounded-full border-[#cacacb] bg-white px-3 py-1 text-[14px] font-medium text-[#707072]"
              >
                <Package className="size-3.5" />
                ناموجود
              </Badge>
            ) : (
              <Badge className="rounded-full bg-[#007d48] px-3 py-1 text-[14px] font-medium text-white hover:bg-[#007d48]">
                In stock · {inventory} available
              </Badge>
            )}
            {isLowStock && !isOutOfStock && (
              <Badge
                variant="outline"
                className="rounded-full border-[#d30005]/30 bg-[#d30005]/10 px-3 py-1 text-[14px] font-medium text-[#d30005]"
              >
                <AlertTriangle className="size-3.5" />
                Low stock — only {inventory} left
              </Badge>
            )}
          </div>

          {/* Add to cart — uses {component.button-primary} via AddToCartButton */}
          <div className="pt-2">
            <AddToCartButton
              product={{
                id: product.id,
                name: product.name,
                price,
                inventory,
                image: cartImage,
              }}
            />
            {isOutOfStock && (
              <p className="mt-2 text-[12px] font-medium text-[#707072]">This item is currently out of stock.</p>
            )}
          </div>

          {/* Wishlist / Share row */}
          <ProductActions productId={product.id} productName={product.name} />

          {/* Meta card */}
          <Card className="mt-2 rounded-[30px] border border-[#e5e5e5] bg-[#f5f5f5]">
            <CardContent className="p-4 flex flex-col gap-1.5">
              <p className="text-[14px] font-medium text-[#111111]">Product details</p>
              <div className="text-[14px] font-medium text-[#707072] flex flex-col gap-1">
                <span>SKU: {product.slug}</span>
                {brandObj && <span>Brand: {brandObj.name}</span>}
                {categoryObj && <span>Category: {categoryObj.name}</span>}
                <span>Inventory: {inventory}</span>
                <span>Visibility: {product.visible ? 'Visible' : 'Hidden'}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
