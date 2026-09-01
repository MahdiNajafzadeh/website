import Link from 'next/link'
import { getPayload } from 'payload'
import type { Metadata } from 'next'
import config from '@/payload.config'
import { Card, CardContent } from '@/components/ui/card'
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis,
} from '@/components/ui/pagination'
import type { Media, Post, SiteSetting } from '@/payload-types'

export const revalidate = 300

function getMediaUrl(media: number | Media | null | undefined): string | null {
    if (!media || typeof media === 'number') return null
    return (media as Media).url ?? null
}

function formatDate(dateString: string | null | undefined): string {
    if (!dateString) return ''
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    } catch {
        return dateString
    }
}

async function getSiteName(): Promise<string> {
    try {
        const payloadConfig = await config
        const payload = await getPayload({ config: payloadConfig })
        const data = (await payload.findGlobal({ slug: 'site-settings', depth: 1 })) as unknown as SiteSetting
        return data?.siteName?.en || data?.siteName?.fa || 'Store'
    } catch {
        return 'Store'
    }
}

export async function generateMetadata(): Promise<Metadata> {
    const siteName = await getSiteName()
    return {
        title: `Blog | ${siteName}`,
        description: `Read the latest articles from ${siteName}`,
    }
}

type SearchParams = {
    page?: string
}

function buildPageHref(page: number): string {
    if (page <= 1) return '/blog'
    return `/blog?page=${page}`
}

export default async function BlogPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>
}) {
    const sp = await searchParams
    const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1)
    const limit = 12

    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    const res = await payload.find({
        collection: 'posts',
        where: { published: { equals: true } },
        depth: 1,
        limit,
        page,
        sort: '-createdAt',
        pagination: true,
        overrideAccess: false,
    })

    const posts = res.docs as Post[]
    const totalPages = res.totalPages ?? 1
    const totalDocs = res.totalDocs ?? 0

    return (
        <div className="mx-auto max-w-[1440px] px-4 py-8 md:px-8">
            {/* Breadcrumb — {typography.caption-md} 14px/500, {colors.mute} #707072 */}
            <nav className="mb-6 flex items-center gap-1.5 text-sm text-[#707072]" aria-label="Breadcrumb">
                <Link href="/" className="hover:text-[#111111]">
                    Home
                </Link>
                <span aria-hidden>/</span>
                <span className="font-medium text-[#111111]">Blog</span>
            </nav>

            <h1
                className="text-[32px] font-medium leading-[1.2] text-[#111111]"
            /* {typography.heading-xl} 32px/500/1.2, {colors.ink} #111111 */
            >
                Blog
            </h1>
            <p className="mt-1 text-[14px] font-medium text-[#707072]">
                {/* {typography.caption-md} 14px/500, {colors.mute} #707072 */}
                {totalDocs} {totalDocs === 1 ? 'article' : 'articles'}
            </p>

            {posts.length === 0 ? (
                <div className="mt-8 rounded-[30px] bg-[#f5f5f5] p-12 text-center">
                    {/* Empty state — {colors.soft-cloud} #f5f5f5, {rounded.lg} 30px, {typography.body-md} */}
                    <p className="text-[16px] font-medium leading-[1.5] text-[#111111]">No articles yet</p>
                    <p className="mt-1 text-[14px] font-medium leading-[1.5] text-[#707072]">
                        Check back soon for new stories.
                    </p>
                    <Link
                        href="/"
                        className="mt-4 inline-flex rounded-full bg-[#111111] px-6 py-2 text-[14px] font-medium text-white hover:bg-[#111111]/90"
                    >
                        Back to home
                    </Link>
                </div>
            ) : (
                <>
                    {/* Grid — shadcn Card + beui card pattern — {colors.soft-cloud} stage, {rounded.lg} 30px */}
                    <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {posts.map((post) => {
                            const coverUrl = getMediaUrl(post.coverImage as Media | number | null | undefined)
                            const date = formatDate(post.publishedAt ?? post.createdAt)
                            return (
                                <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                                    <Card className="overflow-hidden rounded-[30px] border border-[#e5e5e5] bg-white p-0 gap-0 transition-colors hover:border-[#cacacb]">
                                        {/* coverImage stage — {colors.soft-cloud} #f5f5f5 */}
                                        <div className="aspect-[16/10] overflow-hidden bg-[#f5f5f5]">
                                            {coverUrl ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={coverUrl}
                                                    alt={post.name}
                                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-sm text-[#707072]">
                                                    No image
                                                </div>
                                            )}
                                        </div>
                                        <CardContent className="flex flex-col gap-1.5 p-4">
                                            <h2 className="line-clamp-2 text-[16px] font-medium leading-[1.5] text-[#111111]">
                                                {/* {typography.body-strong} 16px/500 */}
                                                {post.name}
                                            </h2>
                                            {post.excerpt ? (
                                                <p className="line-clamp-2 text-[14px] leading-[1.5] text-[#707072]">{post.excerpt}</p>
                                            ) : null}
                                            {date && <p className="text-[12px] font-medium text-[#707072]">{date}</p>}
                                        </CardContent>
                                    </Card>
                                </Link>
                            )
                        })}
                    </div>

                    {/* Pagination — shadcn Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-8">
                            <Pagination>
                                <PaginationContent>
                                    {page > 1 && (
                                        <PaginationItem>
                                            <PaginationPrevious href={buildPageHref(page - 1)} />
                                        </PaginationItem>
                                    )}
                                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                                        .filter((p) => {
                                            if (totalPages <= 7) return true
                                            if (p === 1 || p === totalPages) return true
                                            if (Math.abs(p - page) <= 1) return true
                                            if (page <= 3 && p <= 4) return true
                                            if (page >= totalPages - 2 && p >= totalPages - 3) return true
                                            return false
                                        })
                                        .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                                            const prev = arr[idx - 1]
                                            if (prev !== undefined && typeof p === 'number' && typeof prev === 'number' && p - prev > 1) {
                                                acc.push('ellipsis')
                                            }
                                            acc.push(p)
                                            return acc
                                        }, [])
                                        .map((p, idx) =>
                                            p === 'ellipsis' ? (
                                                <PaginationItem key={`e-${idx}`}>
                                                    <PaginationEllipsis />
                                                </PaginationItem>
                                            ) : (
                                                <PaginationItem key={p}>
                                                    <PaginationLink href={buildPageHref(p)} isActive={p === page}>
                                                        {p}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            ),
                                        )}
                                    {page < totalPages && (
                                        <PaginationItem>
                                            <PaginationNext href={buildPageHref(page + 1)} />
                                        </PaginationItem>
                                    )}
                                </PaginationContent>
                            </Pagination>
                            <p className="mt-3 text-center text-[12px] font-medium text-[#707072]">
                                Page {page} of {totalPages} · {totalDocs} articles
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
