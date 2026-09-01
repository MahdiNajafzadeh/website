import Link from 'next/link'
import type { Category, Media, Product } from '@/payload-types'
import { t } from '@/lib/t'

export interface CategoryCardProps {
  category: Pick<Category, 'id' | 'name' | 'slug' | 'description'>
  count: number
  imageUrl?: string | null
}

function getFirstImageUrl(products?: { images?: Product['images'] }[]): string | null {
  if (!products) return null
  for (const p of products) {
    const first = p.images?.[0]
    if (!first || typeof first.image === 'number') continue
    const url = (first.image as Media).url
    if (url) return url
  }
  return null
}

export function CategoryCard({ category, count, imageUrl }: CategoryCardProps) {
  return (
    <Link
      href={`/products?category=${category.slug}`}
      className="group relative flex aspect-[4/3] overflow-hidden rounded-none border border-[#e5e5e5] bg-[#f5f5f5] dark:border-[#39393b] dark:bg-[#111111]"
      data-od-id="category-tile"
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={category.name} className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]" loading="lazy" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[#f5f5f5] dark:bg-[#1a1a1a]">
          <span className="text-[12px] font-medium text-[#9e9ea0]">{t('common.noImage')}</span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-transparent opacity-60 transition-opacity group-hover:opacity-70" aria-hidden />
      <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between gap-2">
        <span className="inline-flex max-w-[72%] items-center gap-2 rounded-full bg-white px-4 py-1.5 text-[14px] font-medium leading-none text-[#111111] dark:bg-[#111111] dark:text-white">
          <span className="truncate">{category.name}</span>
        </span>
        <span className="shrink-0 rounded-full bg-white/90 px-2.5 py-1 text-[12px] font-medium text-[#707072] backdrop-blur dark:bg-black/60 dark:text-white">
          {count.toLocaleString('fa-IR')} {t('common.productsCount')}
        </span>
      </div>
    </Link>
  )
}

export function getCategoryImageFallback(): null {
  return null
}
