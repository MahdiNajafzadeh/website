import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { EmptyState } from "@/components/ui/EmptyState";
import { InitialsAvatar } from "@/components/ui/InitialsAvatar";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { PaginatedView } from "@/components/ui/PaginatedView";
import type { Category } from "@/payload-types";
import { t } from "@/lib/t";
import { getPayloadClient } from "@/lib/payload";
import { buildPageHref, parsePageParam } from "@/lib/url";

export const dynamic = "force-dynamic";

type SearchParams = {
	page?: string;
	q?: string;
};

export default async function CategoriesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
	const sp = await searchParams;
	const q = sp.q?.trim() ?? "";
	const page = parsePageParam(sp.page);
	const limit = 12;

	const payload = await getPayloadClient();

	const where: Record<string, unknown> | undefined = q ? { name: { like: q } } : undefined;

	const res = await payload.find({
		collection: "categories",
		where: where as never,
		sort: "name",
		limit,
		page,
		pagination: true,
		depth: 0,
	});

	const categories = res.docs as Category[];
	const totalPages = res.totalPages ?? 1;
	const totalDocs = res.totalDocs ?? categories.length;

	return (
		<PageContainer>
			<Breadcrumbs
				crumbs={[{ href: "/", label: t("common.home") }, { label: t("categories.title") }]}
				separatorKey="common.breadcrumbSeparatorSlash"
			/>

			<PageHeader title={t("categories.title")} count={totalDocs} countLabel={t("common.categories")} />

			<form action="/categories" method="get" className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
				<div className="flex flex-1 items-center gap-2">
					<input
						name="q"
						defaultValue={q}
						placeholder={t("categories.searchPlaceholder")}
						className="h-10 w-full max-w-md rounded-[24px] bg-[#f5f5f5] px-4 text-[16px] font-normal text-[#111111] placeholder:text-[#707072] outline-none ring-1 ring-transparent focus:bg-white focus:ring-[#111111] dark:bg-[#39393b] dark:text-white dark:placeholder:text-[#9e9ea0] dark:focus:bg-[#1a1a1a]"
					/>
					<button
						type="submit"
						className="inline-flex h-10 items-center justify-center rounded-full bg-[#111111] px-6 text-[14px] font-medium text-white hover:bg-[#111111]/90 dark:bg-white dark:text-[#111111] dark:hover:bg-[#e5e5e5]"
					>
						{t("products.searchAction")}
					</button>
				</div>
				{q && (
					<Link
						href="/categories"
						className="text-[14px] font-medium text-[#707072] underline hover:text-[#111111] dark:text-[#9e9ea0] dark:hover:text-white"
					>
						{t("products.clearAll")}
					</Link>
				)}
			</form>

			{categories.length === 0 ? (
				<EmptyState
					title={t("categories.noCategories")}
					hint={t("common.noProductsHint")}
					actionLabel={t("common.viewAll")}
					actionHref="/products"
				/>
			) : (
				<div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
					{categories.map((cat) => (
						<Link key={cat.id} href={`/products?category=${cat.slug}`} className="group">
							<Card className="overflow-hidden rounded-[30px] border border-[#e5e5e5] p-0 hover:border-[#cacacb] dark:border-[#39393b] dark:bg-[#1a1a1a] transition-colors">
								<div className="flex aspect-[4/3] flex-col items-center justify-center gap-3 bg-[#f5f5f5] p-6 dark:bg-[#111111]">
									<InitialsAvatar name={cat.name} size="lg" />
									<span className="line-clamp-2 text-center text-[16px] font-medium leading-[1.5] text-[#111111] dark:text-white">
										{cat.name}
									</span>
									{cat.description && (
										<span className="line-clamp-2 text-center text-[12px] font-medium text-[#707072] dark:text-[#9e9ea0]">
											{cat.description}
										</span>
									)}
								</div>
								<CardContent className="p-3 text-center">
									<span className="text-[12px] font-medium text-[#707072] group-hover:text-[#111111] dark:text-[#9e9ea0] dark:group-hover:text-white">
										{t("categories.viewProducts")}
									</span>
								</CardContent>
							</Card>
						</Link>
					))}
				</div>
			)}

			<PaginatedView
				page={page}
				totalPages={totalPages}
				buildHref={(p) =>
					buildPageHref("/categories", { q, page: String(page) }, { page: String(p) })
				}
				paginationLabel={{ templateKey: "categories.pagination", count: totalDocs }}
			/>
		</PageContainer>
	);
}
