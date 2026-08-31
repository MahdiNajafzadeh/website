import type { Metadata } from 'next'
import { getPayload } from 'payload'
import Link from 'next/link'

import config from '@/payload.config'
import type { Brand, Category, Media, Product, SiteSetting } from '@/payload-types'

import { SectionHead } from '@/components/home/SectionHead'
import { CategoryCard } from '@/components/home/CategoryCard'
import { ProductCard } from '@/components/home/ProductCard'
import { CatRow } from '@/components/home/CatRow'

export const metadata: Metadata = {
  title: 'فروشگاه · لوله، اتصالات فاضلاب و شیرآلات صنعتی',
  description:
    'لوله، اتصالات فاضلاب و شیرآلات صنعتی برای پیمانکاران و پروژه‌ها. مشاهده کاتالوگ و قیمت به تومان.',
}

const VISIBLE_TRUE = { visible: { equals: true } } as const

async function fetchHomeData() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const [productsRes, popularRes, categoriesRes, brandsRes, settings] = await Promise.all([
    payload.find({
      collection: 'products',
      where: VISIBLE_TRUE,
      sort: '-createdAt',
      limit: 4,
      depth: 1,
    }),
    payload.find({
      collection: 'products',
      where: VISIBLE_TRUE,
      sort: '-inventory',
      limit: 4,
      depth: 1,
    }),
    payload.find({ collection: 'categories', sort: 'name', limit: 100, depth: 0 }),
    payload.find({ collection: 'brands', sort: 'name', limit: 100, depth: 1 }),
    payload.findGlobal({ slug: 'site-settings', depth: 1 }),
  ])

  const categories = categoriesRes.docs as Category[]
  const brands = brandsRes.docs as Brand[]

  const [categoryCounts, brandCounts] = await Promise.all([
    Promise.all(
      categories.map((c) =>
        payload.count({
          collection: 'products',
          where: { visible: { equals: true }, category: { equals: c.id } },
        }),
      ),
    ),
    Promise.all(
      brands.map((b) =>
        payload.count({
          collection: 'products',
          where: { visible: { equals: true }, brand: { equals: b.id } },
        }),
      ),
    ),
  ])

  return {
    products: productsRes.docs as Product[],
    popular: popularRes.docs as Product[],
    categories,
    brands,
    categoryCounts: categoryCounts.map((r) => r.totalDocs),
    brandCounts: brandCounts.map((r) => r.totalDocs),
    settings: settings as unknown as SiteSetting | null,
  }
}

function getSiteName(settings: SiteSetting | null): string {
  return settings?.siteName?.fa || settings?.siteName?.en || 'فروشگاه'
}

export default async function HomePage() {
  const { products, popular, categories, brands, categoryCounts, brandCounts, settings } =
    await fetchHomeData()

  const siteName = getSiteName(settings)
  const logoUrl = getLogoUrl(settings?.logo)
  const totalInventory = popular.reduce((sum, p) => sum + (p.inventory ?? 0), 0)
  const showPopular = popular.length > 0 && totalInventory > 0

  return (
    <>
      <a className="lp-skip" href="#content">
        Skip to content
      </a>

      <main id="content">
        {/* ─── hero ─── */}
        <section className="lp-hero" data-od-id="hero" aria-labelledby="hero-title">
          <div className="lp-container">
            <div className="lp-hero-inner">
              <p className="lp-eyebrow lp-hero-eyebrow">Industrial supply · Tehran</p>
              <h1 className="lp-hero-title" id="hero-title">
                Pipes, fittings &amp; valves for contractors and project procurement.
              </h1>
              <p className="lp-hero-sub">
                Browse the catalog by category and check stock and pricing in تومان.
              </p>
              <div className="lp-hero-actions">
                <a className="lp-btn lp-btn-primary" href="#categories">
                  Browse catalog
                </a>
                <a className="lp-btn lp-btn-secondary" href="/register">
                  Create account
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ─── category navigation ─── */}
        {categories.length > 0 ? (
          <section
            className="lp-section"
            data-od-id="categories"
            id="categories"
            aria-labelledby="categories-h"
          >
            <div className="lp-container">
              <SectionHead
                eyebrow="Browse by category"
                title="What are you looking for?"
                titleId="categories-h"
                actionHref="#products"
                actionLabel="All products"
              />
              <div className="lp-categories-grid">
                {categories.slice(0, 3).map((category, i) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    count={categoryCounts[i] ?? 0}
                  />
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* ─── newly added ─── */}
        {products.length > 0 ? (
          <section
            className="lp-section"
            data-od-id="featured-products"
            id="products"
            aria-labelledby="featured-h"
            style={{ paddingTop: 'clamp(32px, 4vw, 48px)' }}
          >
            <div className="lp-container">
              <SectionHead
                eyebrow="Just landed"
                title="Newly added"
                titleId="featured-h"
                actionHref="/products"
                actionLabel="Shop all"
              />
              <div className="lp-grid-4">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* ─── most popular ─── */}
        {showPopular ? (
          <section
            className="lp-section"
            data-od-id="most-popular"
            id="popular"
            aria-labelledby="popular-h"
            style={{ paddingTop: 'clamp(32px, 4vw, 48px)' }}
          >
            <div className="lp-container">
              <SectionHead
                eyebrow="Most ordered"
                title="Popular with contractors"
                titleId="popular-h"
                actionHref="/products"
                actionLabel="See all"
              />
              <div className="lp-grid-4">
                {popular.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* ─── full category list ─── */}
        {categories.length > 0 ? (
          <section
            className="lp-section"
            data-od-id="category-list"
            id="category-list"
            aria-labelledby="catlist-h"
            style={{ paddingTop: 'clamp(32px, 4vw, 48px)' }}
          >
            <div className="lp-container">
              <SectionHead
                eyebrow="Full catalog"
                title="All categories"
                titleId="catlist-h"
                actionHref="/products"
                actionLabel="All products"
              />
              <div className="lp-cat-list">
                {categories.map((category, i) => (
                  <CatRow
                    key={category.id}
                    label={category.name}
                    description={category.description ?? null}
                    count={categoryCounts[i] ?? 0}
                    href={`/products?category=${category.slug}`}
                  />
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* ─── brands list ─── */}
        {brands.length > 0 ? (
          <section
            className="lp-section"
            data-od-id="brands-list"
            id="brands-list"
            aria-labelledby="brandlist-h"
            style={{ paddingTop: 'clamp(32px, 4vw, 48px)' }}
          >
            <div className="lp-container">
              <SectionHead
                eyebrow="Stocked brands"
                title="Brands we carry"
                titleId="brandlist-h"
                actionHref="/brands"
                actionLabel="All brands"
              />
              <div className="lp-cat-list">
                {brands.map((brand, i) => (
                  <CatRow
                    key={brand.id}
                    label={brand.name}
                    description={brand.description ?? null}
                    count={brandCounts[i] ?? 0}
                    href={`/brands/${brand.slug}`}
                  />
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <noscript>
          <p className="lp-meta lp-container" style={{ paddingBlock: 24 }}>
            {siteName} — {logoUrl ? null : 'Industrial supply catalog'}
          </p>
        </noscript>
      </main>
    </>
  )
}

function getLogoUrl(logo: SiteSetting['logo']): string | null {
  if (!logo) return null
  if (typeof logo === 'object' && 'url' in logo) {
    const media = logo as Media
    return media.url ?? null
  }
  return null
}