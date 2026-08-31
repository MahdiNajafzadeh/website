import { getPayload } from 'payload'
export const dynamic = "force-dynamic"
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

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
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
  }
  return out.replace(/\s+/g, ' ').trim()
}

export async function GET() {
  const baseUrl = getBaseUrl()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const res = await payload.find({
    collection: 'posts',
    where: { published: { equals: true } },
    depth: 0,
    limit: 100,
    sort: '-publishedAt',
    pagination: false,
    overrideAccess: false,
  })

  const posts = res.docs as Post[]

  const itemsXml = posts
    .map((post) => {
      const link = `${baseUrl}/blog/${post.slug}`
      const title = escapeXml(post.name)
      const description = escapeXml(
        (post.excerpt?.trim() || plainTextFromLexical(post.content).slice(0, 300)).slice(0, 300),
      )
      const pubDate = post.publishedAt ?? post.createdAt
      const pubDateStr = pubDate ? new Date(pubDate).toUTCString() : new Date().toUTCString()
      const guid = link
      return `    <item>
      <title>${title}</title>
      <link>${link}</link>
      <guid>${guid}</guid>
      <description>${description}</description>
      <pubDate>${pubDateStr}</pubDate>
    </item>`
    })
    .join('\n')

  const siteTitle = 'Blog'
  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(siteTitle)}</title>
    <link>${baseUrl}/blog</link>
    <description>Latest articles</description>
${itemsXml}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': `public, s-maxage=${revalidate}, stale-while-revalidate`,
    },
  })
}
