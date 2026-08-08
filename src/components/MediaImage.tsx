import Image from 'next/image'

import { mediaAlt, mediaUrl } from '@/lib/media'
import type { Media as MediaType } from '@/payload-types'

type Props = {
    media: number | string | MediaType | null | undefined
    alt?: string
    fill?: boolean
    width?: number
    height?: number
    className?: string
    size?: 'thumbnail' | 'card' | 'hero'
    priority?: boolean
}

export const MediaImage = ({
    media,
    alt,
    fill = false,
    width = 600,
    height = 600,
    className,
    size,
    priority = false,
}: Props) => {
    const url = mediaUrl(media, size)
    if (!url) {
        return (
            <div
                className={`flex items-center justify-center bg-muted text-muted-foreground ${className ?? ''}`}
                style={fill ? undefined : { width, height }}
            >
                <span className="text-sm">بدون تصویر</span>
            </div>
        )
    }
    return (
        <Image
            src={url}
            alt={alt ?? mediaAlt(media)}
            fill={fill}
            width={fill ? undefined : width}
            height={fill ? undefined : height}
            className={className}
            priority={priority}
        />
    )
}