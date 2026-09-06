import Link from "next/link";
import type { Metadata } from "next";
import { t } from "@/lib/t";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { EmptyState } from "@/components/ui/EmptyState";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { PaginatedView } from "@/components/ui/PaginatedView";
import type { Media, Post } from "@/payload-types";
import { getMediaUrl } from "@/lib/media";
import { formatDate } from "@/lib/dates";
import { getSiteName } from "@/lib/site-settings";
import { buildPageHref, parsePageParam } from "@/lib/url";
import { getPayloadClient } from "@/lib/payload";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
	const siteName = await getSiteName();
	return {
		title: `${t("blog.title")} | ${siteName}`,
		description: t("blog.metaDescription", { siteName }),
	};
}

type SearchParams = {
	page?: string;
};

export default async function BlogPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
	const sp = await searchParams;
	const page = parsePageParam(sp.page);
	const limit = 12;

	const payload = await getPayloadClient();

	const res = await payload.find({
		collection: "posts",
		where: { published: { equals: true } },
		depth: 1,
		limit,
		page,
		sort: "-createdAt",
		pagination: true,
		overrideAccess: false,
	});

	const posts = res.docs as Post[];
	const totalPages = res.totalPages ?? 1;
	const totalDocs = res.totalDocs ?? 0;

	return (
		<PageContainer>
			<Breadcrumbs
				crumbs={[{ href: "/", label: t("common.home") }, { label: t("blog.title") }]}
				separatorKey="common.breadcrumbSeparatorSlash"
			/>

			<PageHeader
				title={t("blog.title")}
				count={totalDocs}
				countLabel={t(totalDocs === 1 ? "blog.articleSingular" : "blog.articlePlural")}
			/>

			{posts.length === 0 ? (
				<EmptyState
					title={t("blog.emptyTitle")}
					hint={t("blog.emptyHint")}
					actionLabel={t("blog.backToHome")}
					actionHref="/"
				/>
			) : (
				<>
					{/* Grid — shadcn Card + beui card pattern — {colors.soft-cloud} stage, {rounded.lg} 30px */}
					<div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
						{posts.map((post) => {
							const coverUrl = getMediaUrl(post.coverImage as Media | number | null | undefined);
							const date = formatDate(post.publishedAt ?? post.createdAt, {
								locale: "en-US",
								preset: "long",
							});
							return (
								<Link key={post.id} href={`/blog/${post.slug}`} className="group">
									<Card className="overflow-hidden rounded-[30px] border border-[#e5e5e5] bg-white p-0 gap-0 transition-colors hover:border-[#cacacb]">
										{/* coverImage stage — {colors.soft-cloud} #f5f5f5 */}
										<div className="aspect-[16/10] overflow-hidden bg-[#f5f5f5]">
											<ImageWithFallback
												src={coverUrl}
												alt={post.name}
												className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
											/>
										</div>
										<CardContent className="flex flex-col gap-1.5 p-4">
											<h2 className="line-clamp-2 text-[16px] font-medium leading-[1.5] text-[#111111]">
												{/* {typography.body-strong} 16px/500 */}
												{post.name}
											</h2>
											{post.excerpt ? (
												<p className="line-clamp-2 text-[14px] leading-[1.5] text-[#707072]">
													{post.excerpt}
												</p>
											) : null}
											{date && <p className="text-[12px] font-medium text-[#707072]">{date}</p>}
										</CardContent>
									</Card>
								</Link>
							);
						})}
					</div>

					<PaginatedView
						page={page}
						totalPages={totalPages}
						buildHref={(p) =>
							p === 1 ? "/blog" : buildPageHref("/blog", {}, { page: String(p) })
						}
						paginationLabel={{ templateKey: "blog.pagination", totalDocs }}
					/>
				</>
			)}
		</PageContainer>
	);
}
