'use client'

import { Heart, Share2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { useWishlistStore } from '@/lib/wishlist-store'

type Props = {
  productId: number | string
  productName: string
}

export function ProductActions({ productId, productName }: Props) {
  const toggleItem = useWishlistStore((s) => s.toggleItem)
  const hasItem = useWishlistStore((s) => s.hasItem(String(productId)))
  const inWishlist = hasItem

  const handleWishlist = () => {
    const wasInWishlist = inWishlist
    toggleItem(String(productId))
    if (wasInWishlist) {
      toast.success('Removed from wishlist', { description: productName })
    } else {
      toast.success('Added to wishlist', { description: productName })
    }
  }

  const handleShare = async () => {
    const url =
      typeof window !== 'undefined' ? window.location.href : ''
    const title = productName

    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({ title, url })
        return
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return
        }
      }
    }

    try {
      if (
        typeof navigator !== 'undefined' &&
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === 'function'
      ) {
        await navigator.clipboard.writeText(url)
        toast.success('Link copied', { description: productName })
        return
      }
    } catch {
      // fall through to the failure toast below
    }

    toast.error('Could not share', {
      description: 'Copy the URL from the address bar manually.',
    })
  }

  return (
    <div className="flex items-center gap-2 pt-2">
      <Button
        variant="outline"
        className="flex-1 rounded-full border-[#cacacb] text-[#111111] hover:bg-[#f5f5f5]"
        type="button"
        onClick={handleWishlist}
        aria-pressed={inWishlist}
        aria-label={
          inWishlist ? `Remove ${productName} from wishlist` : `Add ${productName} to wishlist`
        }
      >
        <Heart
          className="size-4"
          fill={inWishlist ? 'currentColor' : 'none'}
          strokeWidth={inWishlist ? 2 : 1.75}
        />
        {inWishlist ? 'Wishlisted' : 'Wishlist'}
      </Button>
      <Button
        variant="outline"
        className="flex-1 rounded-full border-[#cacacb] text-[#111111] hover:bg-[#f5f5f5]"
        type="button"
        onClick={handleShare}
        aria-label={`Share ${productName}`}
      >
        <Share2 className="size-4" />
        Share
      </Button>
    </div>
  )
}
