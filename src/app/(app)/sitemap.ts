import type { MetadataRoute } from 'next'
export const dynamic = "force-dynamic"
import { getPayload } from 'payload'
import config from '@/payload.config'
import type { Post } from '@/payload-types'

export const revalidate = 300

function getBaseUrl(): string {
    const raw =
        process.env.NEXT_PUBLIC_SITE_URL ||
        process.env.NEXT_PUBLIC_SERVER_URL ||
        process.env.SITE_URL ||
        'https://example.com'
    return raw.replace(/\/$/, '')
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = getBaseUrl()
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    const res = await payload.find({
        collection: 'posts',
        where: { published: { equals: true } },
        depth: 0,
        limit: 1000,
        pagination: false,
        overrideAccess: false,
        sort: '-updatedAt',
    })

    const posts = res.docs as Post[]

    const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(post.createdAt),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }))

    // Include static blog listing and home
    const staticEntries: MetadataRoute.Sitemap = [
        {
            url: `${baseUrl}/`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/blog`,
            lastModified: posts[0]?.updatedAt ? new Date(posts[0].updatedAt) : new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
    ]

    return [...staticEntries, ...postEntries]
}
