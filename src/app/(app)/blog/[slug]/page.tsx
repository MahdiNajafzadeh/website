import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Media, Post } from "@/payload-types";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PageContainer } from "@/components/layout/PageContainer";
import { t } from "@/lib/t";
import { getBaseUrl } from "@/lib/env";
import { getMediaUrl } from "@/lib/media";
import { formatDate } from "@/lib/dates";
import { getSiteName } from "@/lib/site-settings";
import { plainTextFromLexical } from "@/lib/posts";
import { getPayloadClient } from "@/lib/payload";

export const revalidate = 300;

async function fetchPost(slug: string): Promise<Post | null> {
	const payload = await getPayloadClient();
	const res = await payload.find({
		collection: "posts",
		where: {
			and: [{ slug: { equals: slug } }, { published: { equals: true } }],
		},
		depth: 2,
		limit: 1,
		overrideAccess: false,
	});
	const doc = res.docs[0] as Post | undefined;
	return doc ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
	const { slug } = await params;
	const post = await fetchPost(slug);
	if (!post) return {};

	const siteName = await getSiteName();
	const baseUrl = getBaseUrl();
	const canonical = `${baseUrl}/blog/${post.slug}`;

	const excerpt = post.excerpt?.trim() || plainTextFromLexical(post.content).slice(0, 160);
	const description = excerpt.slice(0, 160);
	const title = `${post.name} | ${siteName}`;

	const coverUrl = getMediaUrl(post.coverImage as Media | number | null | undefined);
	const ogImage = coverUrl ? (coverUrl.startsWith("http") ? coverUrl : `${baseUrl}${coverUrl}`) : undefined;
	const publishedTime = post.publishedAt ?? post.createdAt;
	const modifiedTime = post.updatedAt;

	return {
		title,
		description,
		alternates: { canonical },
		openGraph: {
			title,
			description,
			url: canonical,
			type: "article",
			publishedTime,
			modifiedTime,
			images: ogImage ? [{ url: ogImage, alt: post.name }] : undefined,
		},
		twitter: {
			card: ogImage ? "summary_large_image" : "summary",
			title,
			description,
			images: ogImage ? [ogImage] : undefined,
		},
		// Expose article tags explicitly for SSR HTML verification
		other: {
			...(publishedTime ? { "article:published_time": publishedTime } : {}),
			...(modifiedTime ? { "article:modified_time": modifiedTime } : {}),
		},
	};
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	const post = await fetchPost(slug);
	if (!post) notFound();

	const coverUrl = getMediaUrl(post.coverImage as Media | number | null | undefined);
	const coverAlt =
		(post.coverImage && typeof post.coverImage !== "number" ? (post.coverImage as Media).alt : null) ?? post.name;
	const date = formatDate(post.publishedAt ?? post.createdAt, { locale: "en-US", preset: "long" });
	const baseUrl = getBaseUrl();
	const canonical = `${baseUrl}/blog/${post.slug}`;

	return (
		<PageContainer>
			<Breadcrumbs
				crumbs={[
					{ href: "/", label: t("common.home") },
					{ href: "/blog", label: t("blog.title") },
					{ label: post.name },
				]}
				separatorKey="common.breadcrumbSeparator"
			/>

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
					{post.content ? <RichText data={post.content} /> : <p className="text-[#707072]">{t("blog.noContent")}</p>}
				</div>
			</article>
		</PageContainer>
	);
}
