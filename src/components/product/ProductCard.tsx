import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { MediaImage } from '@/components/MediaImage'
import { formatPriceToman } from '@/lib/format'
import { mediaUrl } from '@/lib/media'
import type { Product } from '@/payload-types'

type Props = {
    product: Product
    priority?: boolean
}

export const ProductCard = ({ product, priority = false }: Props) => {
    const cover = product.images?.[0]?.image
    const imageUrl = mediaUrl(cover, 'card')
    const isLowStock = typeof product.stock === 'number' && product.stock <= 5
    const isOut = typeof product.stock === 'number' && product.stock === 0

    return (
        <Card className="group h-full overflow-hidden pt-0">
            <div className="relative aspect-square overflow-hidden bg-muted">
                {imageUrl ? (
                    <MediaImage
                        media={cover}
                        alt={product.name}
                        fill
                        size="card"
                        priority={priority}
                        className="object-cover transition-transform group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        بدون تصویر
                    </div>
                )}
                {product.featured ? (
                    <Badge className="absolute end-2 top-2">ویژه</Badge>
                ) : null}
                {isOut ? (
                    <Badge variant="destructive" className="absolute start-2 top-2">
                        ناموجود
                    </Badge>
                ) : isLowStock ? (
                    <Badge variant="secondary" className="absolute start-2 top-2">
                        موجودی محدود
                    </Badge>
                ) : null}
            </div>
            <CardContent className="flex flex-col gap-2 p-4">
                <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
                    {product.name}
                </h3>
                {product.brand && typeof product.brand !== 'number' ? (
                    <p className="text-xs text-muted-foreground">{product.brand.name}</p>
                ) : null}
                <div className="mt-auto flex items-center justify-between pt-1">
                    <span className="text-base font-bold">{formatPriceToman(product.price)}</span>
                </div>
            </CardContent>
        </Card>
    )
}