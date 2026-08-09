import { MediaImage } from '@/components/MediaImage'
import { DEFAULT_LOCALE, type Locale } from '@/lib/locale'
import { firstChar } from '@/lib/first-char'
import type { Media as MediaType } from '@/payload-types'

type Size = 'sm' | 'md' | 'lg'

const SIZE_CLASS: Record<Size, string> = {
    sm: 'size-8 text-xs',
    md: 'size-12 text-sm',
    lg: 'size-16 text-base',
}

type Props = {
    icon: number | string | MediaType | null | undefined
    name: string
    size?: Size
    className?: string
    ariaLabel?: string
    locale?: Locale
}

export const SocialIcon = ({ icon, name, size = 'md', className, ariaLabel, locale }: Props) => {
    if (icon && typeof icon !== 'number' && typeof icon !== 'string') {
        return (
            <div
                className={`relative overflow-hidden rounded-full bg-muted ${SIZE_CLASS[size]} ${className ?? ''}`}
            >
                <MediaImage
                    media={icon}
                    alt={name}
                    fill
                    size="thumbnail"
                    className="object-contain"
                    locale={locale ?? DEFAULT_LOCALE}
                />
            </div>
        )
    }
    return (
        <div
            role="img"
            aria-label={ariaLabel ?? name}
            className={`flex items-center justify-center rounded-full bg-primary/10 font-bold text-primary ${SIZE_CLASS[size]} ${className ?? ''}`}
        >
            {firstChar(name)}
        </div>
    )
}
