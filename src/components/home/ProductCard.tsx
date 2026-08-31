import Link from 'next/link'
import type { Category, Media, Product } from '@/payload-types'

export interface ProductCardProps {
  product: Pick<Product, 'id' | 'name' | 'slug' | 'price' | 'inventory' | 'category' | 'images'> & {
    brand?: Product['brand']
  }
}

function getCategoryName(category: Product['category']): string | null {
  if (!category || typeof category === 'number') return null
  return (category as Category).name ?? null
}

function getImageUrl(images: Product['images']): string | null {
  if (!images || images.length === 0) return null
  const first = images[0]
  const media = first?.image
  if (!media || typeof media === 'number') return null
  return (media as Media).url ?? null
}

export function ProductCard({ product }: ProductCardProps) {
  const categoryName = getCategoryName(product.category)
  const imageUrl = getImageUrl(product.images)
  const price = product.price ?? 0
  const isContact = price === 0

  return (
    <Link href={`/products/${product.slug}`} className="lp-product">
      <div className="lp-product-img">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={product.name} loading="lazy" />
        ) : (
          <>
            <span>تصویر محصول</span>
            <span className="lp-ph-note">۱:۱ مربعی</span>
          </>
        )}
      </div>
      <div className="lp-product-info">
        {categoryName ? <span className="lp-product-cat">{categoryName}</span> : null}
        <span className="lp-product-name">{product.name}</span>
        <span className={`lp-product-price lp-num${isContact ? ' lp-contact' : ''}`}>
          {isContact ? 'تماس بگیرید' : `${price.toLocaleString('fa-IR')} تومان`}
        </span>
      </div>
    </Link>
  )
}