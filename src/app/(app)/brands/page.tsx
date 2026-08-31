import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { Card, CardContent } from '@/components/ui/card'
import type { Brand, Media } from '@/payload-types'

export const dynamic = 'force-dynamic'

function getMediaUrl(media: number | Media | null | undefined): string | null {
  if (!media || typeof media === 'number') return null
  return (media as Media).url ?? null
}

export default async function BrandsPage() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const res = await payload.find({
    collection: 'brands',
    limit: 100,
    sort: 'name',
    depth: 1,
  })

  const brands = res.docs as Brand[]

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 md:px-8">
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-[#707072]" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-[#111111]">
          Home
        </Link>
        <span aria-hidden>/</span>
        <span className="font-medium text-[#111111]">Brands</span>
      </nav>

      <h1 className="text-[32px] font-medium leading-[1.2] text-[#111111]">Brands</h1>
      <p className="mt-1 text-[14px] font-medium text-[#707072]">{brands.length} brands</p>

      {brands.length === 0 ? (
        <div className="mt-8 rounded-[30px] bg-[#f5f5f5] p-12 text-center">
          {/* {colors.soft-cloud} #f5f5f5, {rounded.lg} 30px */}
          <p className="text-[16px] font-medium text-[#111111]">No brands yet</p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {brands.map((brand) => {
            const iconUrl = getMediaUrl(brand.icon as Media | number | null | undefined)
            return (
              <Link key={brand.id} href={`/brands/${brand.slug}`} className="group">
                <Card className="overflow-hidden rounded-[30px] border border-[#e5e5e5] p-0 hover:border-[#cacacb] transition-colors">
                  {/* icon+name {rounded.lg} 30px — stage {colors.soft-cloud} #f5f5f5 where icon sits */}
                  <div className="flex flex-col items-center gap-3 bg-[#f5f5f5] p-6 aspect-[4/3] justify-center">
                    {iconUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={iconUrl}
                        alt={brand.name}
                        className="size-16 rounded-full object-cover bg-white ring-1 ring-[#e5e5e5]"
                      />
                    ) : (
                      <div className="flex size-16 items-center justify-center rounded-full bg-white text-[20px] font-medium text-[#111111] ring-1 ring-[#e5e5e5]">
                        {brand.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-center text-[16px] font-medium leading-[1.5] text-[#111111] line-clamp-2">
                      {brand.name}
                    </span>
                  </div>
                  <CardContent className="p-3 text-center">
                    <span className="text-[12px] font-medium text-[#707072] group-hover:text-[#111111]">
                      View products →
                    </span>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
