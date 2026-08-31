import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import type { Metadata } from 'next'
import config from '@/payload.config'
import type { Media, Post, SiteSetting } from '@/payload-types'
import { RichText } from '@payloadcms/richtext-lexical/react'

export const revalidate = 300

function getBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_SERVER_URL ||
    process.env.SITE_URL ||
    'https://example.com'
  return raw.replace(/\/$/, '')
}

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

function plainTextFromLexical(content: Post['content']): string {
  if (!content || typeof content !== 'object' || !('root' in content)) return ''
  const root = (content as { root: { children: Array<{ children?: Array<{ text?: string }> }> } }).root
  if (!root?.children) return ''
  let out = ''
  for (const node of root.children) {
    const children = (node as { children?: Array<{ text?: string }> }).children ?? []
    for (const child of children) {
      if (typeof child.text === 'string') out += child.text + ' '
    }
    out += ' '
  }
  return out.replace(/\s+/g, ' ').trim()
}

async function fetchPost(slug: string): Promise<Post | null> {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const res = await payload.find({
    collection: 'posts',
    where: {
      and: [{ slug: { equals: slug } }, { published: { equals: true } }],
    },
    depth: 2,
    limit: 1,
    overrideAccess: false,
  })
  const doc = res.docs[0] as Post | undefined
  return doc ?? null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await fetchPost(slug)
  if (!post) return {}

  const siteName = await getSiteName()
  const baseUrl = getBaseUrl()
  const canonical = `${baseUrl}/blog/${post.slug}`

  const excerpt = post.excerpt?.trim() || plainTextFromLexical(post.content).slice(0, 160)
  const description = excerpt.slice(0, 160)
  const title = `${post.name} | ${siteName}`

  const coverUrl = getMediaUrl(post.coverImage as Media | number | null | undefined)
  const ogImage = coverUrl ? (coverUrl.startsWith('http') ? coverUrl : `${baseUrl}${coverUrl}`) : undefined
  const publishedTime = post.publishedAt ?? post.createdAt
  const modifiedTime = post.updatedAt

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'article',
      publishedTime,
      modifiedTime,
      images: ogImage ? [{ url: ogImage, alt: post.name }] : undefined,
    },
    twitter: {
      card: ogImage ? 'summary_large_image' : 'summary',
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
    // Expose article tags explicitly for SSR HTML verification
    other: {
      ...(publishedTime ? { 'article:published_time': publishedTime } : {}),
      ...(modifiedTime ? { 'article:modified_time': modifiedTime } : {}),
    },
  }
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await fetchPost(slug)
  if (!post) notFound()

  const coverUrl = getMediaUrl(post.coverImage as Media | number | null | undefined)
  const coverAlt =
    (post.coverImage && typeof post.coverImage !== 'number' ? (post.coverImage as Media).alt : null) ??
    post.name
  const date = formatDate(post.publishedAt ?? post.createdAt)
  const baseUrl = getBaseUrl()
  const canonical = `${baseUrl}/blog/${post.slug}`

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 md:px-8">
      {/* Breadcrumb — Home › Blog › {post.name} — {typography.caption-md} 14px/500 */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-[#707072]" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-[#111111]">
          Home
        </Link>
        <span aria-hidden>›</span>
        <Link href="/blog" className="hover:text-[#111111]">
          Blog
        </Link>
        <span aria-hidden>›</span>
        <span className="font-medium text-[#111111] line-clamp-1">{post.name}</span>
      </nav>

      {/* canonical link for SSR verification without JS — also covered by generateMetadata alternates */}
      <link rel="canonical" href={canonical} />

      <article>
        {/* Title — {typography.heading-xl} 32px/500, {colors.ink} #111111 */}
        <h1 className="text-[32px] font-medium leading-[1.2] text-[#111111]">{post.name}</h1>
        {date && <p className="mt-2 text-[14px] font-medium text-[#707072]">{date}</p>}

        {/* coverImage — {colors.soft-cloud} #f5f5f5 stage, {rounded.lg} 30px */}
        {coverUrl ? (
          <div className="mt-6 overflow-hidden rounded-[30px] bg-[#f5f5f5]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverUrl}
              alt={coverAlt}
              className="h-auto w-full object-cover"
              width={1200}
              height={675}
            />
          </div>
        ) : null}

        {/* RichText Lexical rendering — headings/lists/links/media with alt — {typography.body-md} 16px/400 */}
        <div className="prose prose-neutral mt-8 max-w-none text-[16px] font-normal leading-[1.5] text-[#111111] prose-headings:font-medium prose-headings:text-[#111111] prose-a:text-[#111111] prose-a:underline prose-img:rounded-[18px] prose-img:bg-[#f5f5f5] dark:prose-invert">
          {post.content ? (
            <RichText data={post.content} />
          ) : (
            <p className="text-[#707072]">No content.</p>
          )}
        </div>
      </article>
    </div>
  )
}
