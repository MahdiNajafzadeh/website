import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { MediaImage } from '@/components/MediaImage'
import { formatPriceToman } from '@/lib/format'
import type { Locale } from '@/lib/locale'
import { getTranslator } from '@/lib/i18n'
import { localizedValue } from '@/lib/localized'
import { mediaUrl } from '@/lib/media'
import type { Product } from '@/payload-types'

type Props = {
    product: Product
    locale: Locale
    priority?: boolean
}

export const ProductCard = ({ product, locale, priority = false }: Props) => {
    const { t } = getTranslator(locale)
    const cover = product.images?.[0]?.image
    const imageUrl = mediaUrl(cover, 'card')
    const isLowStock = typeof product.stock === 'number' && product.stock <= 5
    const isOut = typeof product.stock === 'number' && product.stock === 0
    const name = localizedValue(product.name, locale)
    const brandName =
        product.brand && typeof product.brand !== 'number'
            ? localizedValue(product.brand.name, locale)
            : ''

    return (
        <Card className="group h-full overflow-hidden pt-0">
            <div className="relative aspect-square overflow-hidden bg-muted">
                {imageUrl ? (
                    <MediaImage
                        media={cover}
                        alt={name}
                        fill
                        size="card"
                        priority={priority}
                        className="object-cover transition-transform motion-reduce:transition-none motion-reduce:group-hover:scale-100 group-hover:scale-105"
                        locale={locale}
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        {t('product.card.imageMissing')}
                    </div>
                )}
                {product.featured ? (
                    <Badge className="absolute end-2 top-2">{t('product.card.featured')}</Badge>
                ) : null}
                {isOut ? (
                    <Badge variant="destructive" className="absolute start-2 top-2">
                        {t('product.card.outOfStock')}
                    </Badge>
                ) : isLowStock ? (
                    <Badge variant="secondary" className="absolute start-2 top-2">
                        {t('product.card.lowStock')}
                    </Badge>
                ) : null}
            </div>
            <CardContent className="flex flex-col gap-2 p-4">
                <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
                    {name}
                </h3>
                {brandName ? (
                    <p className="text-xs text-muted-foreground">{brandName}</p>
                ) : null}
                <div className="mt-auto flex items-center justify-between pt-1">
                    <span className="text-base font-bold">{formatPriceToman(product.price, locale)}</span>
                </div>
            </CardContent>
        </Card>
    )
}
