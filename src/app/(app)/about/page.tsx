import Link from 'next/link'
import { getPayload } from 'payload'
import type { Metadata } from 'next'
import config from '@/payload.config'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { getSiteSettings, deriveName } from '@/lib/site-settings'
import type { PageAbout } from '@/payload-types'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const siteName = deriveName(settings)
  return {
    title: `About Us | ${siteName}`,
    description: `Learn more about ${siteName}.`,
  }
}

async function fetchAbout(): Promise<PageAbout | null> {
  try {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })
    const data = (await payload.findGlobal({
      slug: 'page-about',
      depth: 0,
    })) as unknown as PageAbout | null
    return data ?? null
  } catch {
    return null
  }
}

export default async function AboutPage() {
  const [settings, about] = await Promise.all([getSiteSettings(), fetchAbout()])
  const siteName = deriveName(settings)
  const content = about?.content ?? null

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 md:px-8">
      {/* Breadcrumb — Home › About Us — {typography.caption-md} 14px/500, {colors.mute} #707072 */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-[#707072]" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-[#111111]">
          Home
        </Link>
        <span aria-hidden>›</span>
        <span className="font-medium text-[#111111]">About Us</span>
      </nav>

      {/* Title — {typography.heading-xl} 32px/500, {colors.ink} #111111 */}
      <h1 className="text-[32px] font-medium leading-[1.2] text-[#111111]">About Us</h1>
      <p className="mt-1 text-[14px] font-medium text-[#707072]">
        The story behind {siteName}.
      </p>

      {content ? (
        // Lexical RichText — {typography.body-md} 16px/400, {colors.ink}
        <article className="prose prose-neutral mt-8 max-w-none text-[16px] font-normal leading-[1.5] text-[#111111] prose-headings:font-medium prose-headings:text-[#111111] prose-a:text-[#111111] prose-a:underline prose-img:rounded-[18px] prose-img:bg-[#f5f5f5] dark:prose-invert">
          <RichText data={content} />
        </article>
      ) : (
        <div className="mt-8 rounded-[30px] bg-[#f5f5f5] p-12 text-center">
          {/* Empty state — {colors.soft-cloud} #f5f5f5, {rounded.lg} 30px, {colors.mute} copy */}
          <p className="text-[16px] font-medium leading-[1.5] text-[#111111]">No content yet</p>
          <p className="mt-1 text-[14px] font-medium leading-[1.5] text-[#707072]">
            Check back soon — we&apos;re writing our story.
          </p>
          <Link
            href="/contact"
            className="mt-4 inline-flex rounded-full bg-[#111111] px-6 py-2 text-[14px] font-medium text-white hover:bg-[#111111]/90"
          >
            Contact us
          </Link>
        </div>
      )}
    </div>
  )
}
