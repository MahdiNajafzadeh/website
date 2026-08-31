import Link from 'next/link'
import type { Category } from '@/payload-types'

export interface CategoryCardProps {
  category: Pick<Category, 'id' | 'name' | 'slug' | 'description'>
  count: number
}

export function CategoryCard({ category, count }: CategoryCardProps) {
  const description = category.description ?? `${count} ${count === 1 ? 'product' : 'products'}`
  return (
    <Link href={`/products?category=${category.slug}`} className="lp-category-card">
      <span className="lp-category-mark" aria-hidden="true">
        {category.name.charAt(0).toUpperCase()}
      </span>
      <div>
        <div className="lp-category-name">{category.name}</div>
        <div className="lp-category-desc">{description}</div>
      </div>
      <div className="lp-category-meta">
        <span className="lp-meta">
          {count} {count === 1 ? 'product' : 'products'}
        </span>
        <span className="lp-category-arrow" aria-hidden="true">
          →
        </span>
      </div>
    </Link>
  )
}