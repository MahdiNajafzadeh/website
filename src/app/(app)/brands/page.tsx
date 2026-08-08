import Link from 'next/link'

import { Card } from '@/components/ui/card'
import { MediaImage } from '@/components/MediaImage'
import { getPayload } from 'payload'
import config from '@payload-config'

export const metadata = {
    title: 'برندها | آبفارین',
    description: 'لیست برندهای نمایندگی آبفارین',
}

export default async function BrandsPage() {
    const payload = await getPayload({ config })
    const result = await payload.find({
        collection: 'brands',
        limit: 200,
        sort: 'order',
        depth: 1,
    })

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">برندها</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    {result.totalDocs} برند
                </p>
            </div>

            {result.docs.length === 0 ? (
                <Card className="p-10 text-center text-muted-foreground">
                  برندی ثبت نشده است.
                </Card>
            ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {result.docs.map((brand) => (
                        <Link
                            key={brand.id}
                            href={`/brands/${brand.slug}`}
                            className="group"
                        >
                            <Card className="flex h-full flex-col items-center gap-3 p-6 transition-colors group-hover:border-primary/40">
                                {brand.logo ? (
                                    <div className="relative size-20 overflow-hidden rounded-md bg-muted">
                                        <MediaImage
                                            media={brand.logo}
                                            alt={brand.logo.alt ?? brand.name}
                                            fill
                                            size="card"
                                            className="object-contain"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex size-20 items-center justify-center rounded-md bg-muted text-2xl font-bold">
                                        {brand.name.charAt(0)}
                                    </div>
                                )}
                                <span className="text-center text-sm font-semibold">
                                    {brand.name}
                                </span>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}