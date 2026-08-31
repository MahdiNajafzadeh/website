import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination'
import type { Brand, Category, Media, Product } from '@/payload-types'

export const dynamic = 'force-dynamic'

type SearchParams = {
  q?: string
  brand?: string
  category?: string
  page?: string
}

function getMediaUrl(media: number | Media | null | undefined): string | null {
  if (!media || typeof media === 'number') return null
  return (media as Media).url ?? null
}

function buildPageHref(
  base: SearchParams & { page?: number | string },
  overrides: Partial<Record<string, string | undefined>>,
) {
  const params = new URLSearchParams()
  const merged: Record<string, string | undefined> = {
    q: base.q,
    brand: base.brand,
    category: base.category,
    page: base.page ? String(base.page) : undefined,
    ...overrides,
  }
  for (const [k, v] of Object.entries(merged)) {
    if (v && v !== '') params.set(k, v)
  }
  const qs = params.toString()
  return qs ? `/products?${qs}` : '/products'
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const q = sp.q?.trim() ?? ''
  const brandSlug = sp.brand?.trim() ?? ''
  const categorySlug = sp.category?.trim() ?? ''
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1)
  const limit = 12

  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  // Resolve brand/category slugs -> ids for relationship filter
  let brandId: number | null = null
  let brandNotFound = false
  if (brandSlug) {
    const brandRes = await payload.find({
      collection: 'brands',
      where: { slug: { equals: brandSlug } },
      limit: 1,
      depth: 0,
    })
    if (brandRes.docs[0]) brandId = (brandRes.docs[0] as Brand).id
    else brandNotFound = true
  }

  let categoryId: number | null = null
  let categoryNotFound = false
  if (categorySlug) {
    const catRes = await payload.find({
      collection: 'categories',
      where: { slug: { equals: categorySlug } },
      limit: 1,
      depth: 0,
    })
    if (catRes.docs[0]) categoryId = (catRes.docs[0] as Category).id
    else categoryNotFound = true
  }

  // Build where clause: visible only + compose q/brand/category
  // {colors.soft-cloud} stage (#f5f5f5), filters use {rounded.full} + {typography.caption-md}
  const and: Record<string, unknown>[] = [{ visible: { equals: true } }]

  if (q) {
    and.push({ name: { like: q } })
  }
  if (brandNotFound) {
    // Force empty result when brand slug unknown but filter requested
    and.push({ brand: { equals: -1 } } as unknown as Record<string, unknown>)
  } else if (brandId !== null) {
    and.push({ brand: { equals: brandId } })
  }
  if (categoryNotFound) {
    and.push({ category: { equals: -1 } } as unknown as Record<string, unknown>)
  } else if (categoryId !== null) {
    and.push({ category: { equals: categoryId } })
  }

  const where = and.length > 1 ? { and } : and[0]

  const [productsRes, brandsRes, categoriesRes] = await Promise.all([
    payload.find({
      collection: 'products',
      where: where as never,
      depth: 1,
      limit,
      page,
      sort: '-createdAt',
      pagination: true,
    }),
    payload.find({
      collection: 'brands',
      limit: 100,
      sort: 'name',
      depth: 1,
    }),
    payload.find({
      collection: 'categories',
      limit: 100,
      sort: 'name',
      depth: 0,
    }),
  ])

  const products = productsRes.docs as Product[]
  const brands = brandsRes.docs as Brand[]
  const categories = categoriesRes.docs as Category[]
  const totalPages = productsRes.totalPages ?? 1

  const activeFiltersCount = [q, brandSlug, categorySlug].filter(Boolean).length

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 md:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-[#707072] flex items-center gap-1.5" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-[#111111]">
          Home
        </Link>
        <span aria-hidden>/</span>
        <span className="text-[#111111] font-medium">Products</span>
      </nav>

      <h1
        className="text-[32px] font-medium leading-[1.2] text-[#111111] mb-2"
        /* {typography.heading-xl} 32px/500, {colors.ink} #111111 */
      >
        Products
      </h1>
      <p className="text-[14px] font-medium text-[#707072] mb-6">
        {productsRes.totalDocs} products {activeFiltersCount > 0 && `· ${activeFiltersCount} filter(s) active`}
      </p>

      {/* Search + active filter summary */}
      <form action="/products" method="get" className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* preserve brand/category when searching */}
        {brandSlug && <input type="hidden" name="brand" value={brandSlug} />}
        {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
        <div className="flex flex-1 items-center gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search products…"
            className="h-10 w-full max-w-md rounded-[24px] bg-[#f5f5f5] px-4 text-[16px] font-normal text-[#111111] placeholder:text-[#707072] outline-none ring-1 ring-transparent focus:bg-white focus:ring-[#111111]"
            /* {colors.soft-cloud} #f5f5f5, {rounded.md} 24px, {typography.body-md} */
          />
          <Button type="submit" className="rounded-full bg-[#111111] text-white hover:bg-[#111111]/90">
            Search
          </Button>
        </div>
        {(q || brandSlug || categorySlug) && (
          <Link
            href="/products"
            className="text-[14px] font-medium text-[#707072] underline hover:text-[#111111]"
          >
            Clear all
          </Link>
        )}
      </form>

      {/* Brand pills — {colors.soft-cloud} #f5f5f5, {rounded.full} 9999px, {typography.caption-md} 14px/500 */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-[14px] font-medium text-[#111111] mr-1">Brands:</span>
        <Link
          href={buildPageHref({ q, brand: brandSlug, category: categorySlug }, { brand: undefined, page: '1' })}
          className={
            !brandSlug
              ? 'rounded-full bg-[#111111] px-4 py-1.5 text-[14px] font-medium text-white'
              : 'rounded-full bg-[#f5f5f5] px-4 py-1.5 text-[14px] font-medium text-[#111111] ring-1 ring-[#e5e5e5] hover:bg-[#e5e5e5]'
          }
        >
          All
        </Link>
        {brands.map((b) => {
          const isActive = b.slug === brandSlug
          return (
            <Link
              key={b.id}
              href={buildPageHref({ q, brand: brandSlug, category: categorySlug }, { brand: b.slug ?? '', page: '1' })}
              className={
                isActive
                  ? 'rounded-full bg-[#111111] px-4 py-1.5 text-[14px] font-medium text-white'
                  : 'rounded-full bg-[#f5f5f5] px-4 py-1.5 text-[14px] font-medium text-[#111111] ring-1 ring-[#e5e5e5] hover:bg-[#e5e5e5]'
              }
            >
              {b.name}
            </Link>
          )
        })}
      </div>

      {/* Category pills — {colors.soft-cloud} #f5f5f5, {rounded.full} 9999px, {typography.caption-md} 14px/500 */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-[14px] font-medium text-[#111111] mr-1">Categories:</span>
        <Link
          href={buildPageHref({ q, brand: brandSlug, category: categorySlug }, { category: undefined, page: '1' })}
          className={
            !categorySlug
              ? 'rounded-full bg-[#111111] px-4 py-1.5 text-[14px] font-medium text-white'
              : 'rounded-full bg-[#f5f5f5] px-4 py-1.5 text-[14px] font-medium text-[#111111] ring-1 ring-[#e5e5e5] hover:bg-[#e5e5e5]'
          }
        >
          All
        </Link>
        {categories.map((c) => {
          const isActive = c.slug === categorySlug
          return (
            <Link
              key={c.id}
              href={buildPageHref(
                { q, brand: brandSlug, category: categorySlug },
                { category: c.slug ?? '', page: '1' },
              )}
              className={
                isActive
                  ? 'rounded-full bg-[#111111] px-4 py-1.5 text-[14px] font-medium text-white'
                  : 'rounded-full bg-[#f5f5f5] px-4 py-1.5 text-[14px] font-medium text-[#111111] ring-1 ring-[#e5e5e5] hover:bg-[#e5e5e5]'
              }
            >
              {c.name}
            </Link>
          )
        })}
      </div>

      {/* Grid — shadcn Card + beui gallery pattern — {colors.soft-cloud} stage, {rounded.lg} 30px, {typography.body-strong} */}
      {products.length === 0 ? (
        <div className="rounded-[30px] bg-[#f5f5f5] p-12 text-center">
          <p className="text-[16px] font-medium text-[#111111]">No products found</p>
          <p className="mt-1 text-[14px] font-medium text-[#707072]">Try adjusting filters or search.</p>
          <Link href="/products" className="mt-4 inline-flex rounded-full bg-[#111111] px-6 py-2 text-[14px] font-medium text-white">
            Browse all products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const brand = product.brand as Brand | number | null | undefined
            const category = product.category as Category | number | null | undefined
            const brandName = brand && typeof brand !== 'number' ? brand.name : null
            const categoryName = category && typeof category !== 'number' ? category.name : null
            const showcase = getMediaUrl(product.showcaseImage as Media | number | null | undefined)
            const firstImage =
              product.images?.[0] && typeof product.images[0].image !== 'number'
                ? getMediaUrl(product.images[0].image as Media)
                : null
            const imageUrl = showcase ?? firstImage
            const price = product.price ?? 0
            const inventory = product.inventory ?? 0
            const isOutOfStock = inventory <= 0
            const isLowStock = inventory > 0 && inventory <= 5

            return (
              <Link key={product.id} href={`/products/${product.slug}`} className="group">
                <Card className="overflow-hidden rounded-[30px] border border-[#e5e5e5] bg-white p-0 gap-0">
                  {/* image stage — {colors.soft-cloud} #f5f5f5 — beui gallery 1:1 */}
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
                      <div className="flex h-full w-full items-center justify-center text-[#707072] text-sm">
                        No image
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4 flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {isOutOfStock && (
                        <Badge
                          variant="outline"
                          className="rounded-full border-[#cacacb] bg-white text-[#707072] text-xs"
                          /* {colors.mute} #707072 */
                        >
                          ناموجود
                        </Badge>
                      )}
                      {isLowStock && !isOutOfStock && (
                        <Badge className="rounded-full bg-[#f5f5f5] text-[#111111] hover:bg-[#f5f5f5] text-xs">
                          Low stock
                        </Badge>
                      )}
                      {categoryName && (
                        <Badge variant="secondary" className="rounded-full bg-[#f5f5f5] text-[#111111] text-xs">
                          {categoryName}
                        </Badge>
                      )}
                    </div>
                    <h3 className="line-clamp-2 text-[16px] font-medium leading-[1.5] text-[#111111]">
                      {/* {typography.body-strong} 16px/500 */}
                      {product.name}
                    </h3>
                    {brandName && <p className="text-[14px] font-medium text-[#707072]">{brandName}</p>}
                    <p
                      className={
                        price === 0
                          ? 'text-[14px] font-medium text-[#707072]'
                          : 'text-[16px] font-medium text-[#111111]'
                      }
                    >
                      {price === 0 ? 'Contact for price' : `${price.toLocaleString()} تومان`}
                      {price > 0 && isOutOfStock && (
                        <span className="ml-2 text-xs text-[#707072]">— unavailable</span>
                      )}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}

      {/* Pagination — shadcn Pagination */}
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination>
            <PaginationContent>
              {page > 1 && (
                <PaginationItem>
                  <PaginationPrevious
                    href={buildPageHref({ q, brand: brandSlug, category: categorySlug, page: String(page) }, { page: String(page - 1) })}
                  />
                </PaginationItem>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  if (totalPages <= 7) return true
                  if (p === 1 || p === totalPages) return true
                  if (Math.abs(p - page) <= 1) return true
                  if (page <= 3 && p <= 4) return true
                  if (page >= totalPages - 2 && p >= totalPages - 3) return true
                  return false
                })
                .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                  const prev = arr[idx - 1]
                  if (prev !== undefined && typeof p === 'number' && typeof prev === 'number' && p - prev > 1) {
                    acc.push('ellipsis')
                  }
                  acc.push(p)
                  return acc
                }, [])
                .map((p, idx) =>
                  p === 'ellipsis' ? (
                    <PaginationItem key={`e-${idx}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={p}>
                      <PaginationLink
                        href={buildPageHref({ q, brand: brandSlug, category: categorySlug, page: String(page) }, { page: String(p) })}
                        isActive={p === page}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}
              {page < totalPages && (
                <PaginationItem>
                  <PaginationNext
                    href={buildPageHref({ q, brand: brandSlug, category: categorySlug, page: String(page) }, { page: String(page + 1) })}
                  />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
          <p className="mt-3 text-center text-[12px] font-medium text-[#707072]">
            Page {page} of {totalPages} · {productsRes.totalDocs} products
          </p>
        </div>
      )}
    </div>
  )
}
