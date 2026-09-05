import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { PaginatedView } from "@/components/ui/PaginatedView";
import { ProductCard } from "@/components/product/ProductCard";
import type { Brand, Category, Product } from "@/payload-types";
import { t } from "@/lib/t";
import { buildPageHref, parsePageParam } from "@/lib/url";
import { getPayloadClient } from "@/lib/payload";

export const dynamic = "force-dynamic";

type SearchParams = {
	q?: string;
	brand?: string;
	category?: string;
	page?: string;
};

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
	const sp = await searchParams;
	const q = sp.q?.trim() ?? "";
	const brandSlug = sp.brand?.trim() ?? "";
	const categorySlug = sp.category?.trim() ?? "";
	const page = parsePageParam(sp.page);
	const limit = 12;

	const payload = await getPayloadClient();

	let brandId: number | null = null;
	let brandNotFound = false;
	if (brandSlug) {
		const brandRes = await payload.find({
			collection: "brands",
			where: { slug: { equals: brandSlug } },
			limit: 1,
			depth: 0,
		});
		if (brandRes.docs[0]) brandId = (brandRes.docs[0] as Brand).id;
		else brandNotFound = true;
	}

	let categoryId: number | null = null;
	let categoryNotFound = false;
	if (categorySlug) {
		const catRes = await payload.find({
			collection: "categories",
			where: { slug: { equals: categorySlug } },
			limit: 1,
			depth: 0,
		});
		if (catRes.docs[0]) categoryId = (catRes.docs[0] as Category).id;
		else categoryNotFound = true;
	}

	const and: Record<string, unknown>[] = [{ visible: { equals: true } }];
	if (q) and.push({ name: { like: q } });
	if (brandNotFound) and.push({ brand: { equals: -1 } } as unknown as Record<string, unknown>);
	else if (brandId !== null) and.push({ brand: { equals: brandId } });
	if (categoryNotFound) and.push({ category: { equals: -1 } } as unknown as Record<string, unknown>);
	else if (categoryId !== null) and.push({ category: { equals: categoryId } });

	const where = and.length > 1 ? { and } : and[0];

	const [productsRes, brandsRes, categoriesRes] = await Promise.all([
		payload.find({
			collection: "products",
			where: where as never,
			depth: 1,
			limit,
			page,
			sort: "-createdAt",
			pagination: true,
		}),
		payload.find({ collection: "brands", limit: 100, sort: "name", depth: 1 }),
		payload.find({ collection: "categories", limit: 100, sort: "name", depth: 0 }),
	]);

	const products = productsRes.docs as Product[];
	const brands = brandsRes.docs as Brand[];
	const categories = categoriesRes.docs as Category[];
	const totalPages = productsRes.totalPages ?? 1;
	const activeFiltersCount = [q, brandSlug, categorySlug].filter(Boolean).length;
	const subtitle = `${t("common.countWithLabel", {
		count: productsRes.totalDocs.toLocaleString("fa-IR"),
		label: t("common.productsCount"),
	})}${
		activeFiltersCount > 0
			? t("products.filterSuffix", {
					count: activeFiltersCount.toLocaleString("fa-IR"),
					label: t("common.browse"),
				})
			: ""
	}`;

	return (
		<PageContainer>
			<Breadcrumbs
				crumbs={[{ href: "/", label: t("common.home") }, { label: t("products.title") }]}
				separatorKey="common.breadcrumbSeparatorSlash"
			/>

			<PageHeader title={t("products.title")} subtitle={subtitle} />

			<form action="/products" method="get" className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
				{brandSlug && <input type="hidden" name="brand" value={brandSlug} />}
				{categorySlug && <input type="hidden" name="category" value={categorySlug} />}
				<div className="flex flex-1 items-center gap-2">
					<input
						name="q"
						defaultValue={q}
						placeholder={t("products.searchPlaceholder")}
						className="h-10 w-full max-w-md rounded-[24px] bg-[#f5f5f5] px-4 text-[16px] font-normal text-[#111111] placeholder:text-[#707072] outline-none ring-1 ring-transparent focus:bg-white focus:ring-[#111111] dark:bg-[#39393b] dark:text-white dark:placeholder:text-[#9e9ea0] dark:focus:bg-[#1a1a1a]"
					/>
					<Button
						type="submit"
						className="rounded-full bg-[#111111] text-white hover:bg-[#111111]/90 dark:bg-white dark:text-[#111111] dark:hover:bg-[#e5e5e5]"
					>
						{t("products.searchAction")}
					</Button>
				</div>
				{(q || brandSlug || categorySlug) && (
					<Link
						href="/products"
						className="text-[14px] font-medium text-[#707072] underline hover:text-[#111111] dark:text-[#9e9ea0] dark:hover:text-white"
					>
						{t("products.clearAll")}
					</Link>
				)}
			</form>

			<div className="mb-3 flex flex-wrap items-center gap-2">
				<span className="mr-1 text-[14px] font-medium text-[#111111] dark:text-white">
					{t("products.brandsLabel")}
				</span>
				<Link
					href={buildPageHref(
						"/products",
						{ q, brand: brandSlug, category: categorySlug },
						{ brand: undefined, page: "1" },
					)}
					className={
						!brandSlug
							? "rounded-full bg-[#111111] px-4 py-1.5 text-[14px] font-medium text-white dark:bg-white dark:text-[#111111]"
							: "rounded-full bg-[#f5f5f5] px-4 py-1.5 text-[14px] font-medium text-[#111111] ring-1 ring-[#e5e5e5] hover:bg-[#e5e5e5] dark:bg-transparent dark:text-white dark:ring-[#39393b] dark:hover:bg-[#39393b]"
					}
				>
					{t("products.allBrands")}
				</Link>
				{brands.map((b) => {
					const isActive = b.slug === brandSlug;
					return (
						<Link
							key={b.id}
							href={buildPageHref(
								"/products",
								{ q, brand: brandSlug, category: categorySlug },
								{ brand: b.slug ?? "", page: "1" },
							)}
							className={
								isActive
									? "rounded-full bg-[#111111] px-4 py-1.5 text-[14px] font-medium text-white dark:bg-white dark:text-[#111111]"
									: "rounded-full bg-[#f5f5f5] px-4 py-1.5 text-[14px] font-medium text-[#111111] ring-1 ring-[#e5e5e5] hover:bg-[#e5e5e5] dark:bg-transparent dark:text-white dark:ring-[#39393b] dark:hover:bg-[#39393b]"
							}
						>
							{b.name}
						</Link>
					);
				})}
			</div>

			<div className="mb-6 flex flex-wrap items-center gap-2">
				<span className="mr-1 text-[14px] font-medium text-[#111111] dark:text-white">
					{t("products.categoriesLabel")}
				</span>
				<Link
					href={buildPageHref(
						"/products",
						{ q, brand: brandSlug, category: categorySlug },
						{ category: undefined, page: "1" },
					)}
					className={
						!categorySlug
							? "rounded-full bg-[#111111] px-4 py-1.5 text-[14px] font-medium text-white dark:bg-white dark:text-[#111111]"
							: "rounded-full bg-[#f5f5f5] px-4 py-1.5 text-[14px] font-medium text-[#111111] ring-1 ring-[#e5e5e5] hover:bg-[#e5e5e5] dark:bg-transparent dark:text-white dark:ring-[#39393b] dark:hover:bg-[#39393b]"
					}
				>
					{t("products.allCategories")}
				</Link>
				{categories.map((c) => {
					const isActive = c.slug === categorySlug;
					return (
						<Link
							key={c.id}
							href={buildPageHref(
								"/products",
								{ q, brand: brandSlug, category: categorySlug },
								{ category: c.slug ?? "", page: "1" },
							)}
							className={
								isActive
									? "rounded-full bg-[#111111] px-4 py-1.5 text-[14px] font-medium text-white dark:bg-white dark:text-[#111111]"
									: "rounded-full bg-[#f5f5f5] px-4 py-1.5 text-[14px] font-medium text-[#111111] ring-1 ring-[#e5e5e5] hover:bg-[#e5e5e5] dark:bg-transparent dark:text-white dark:ring-[#39393b] dark:hover:bg-[#39393b]"
							}
						>
							{c.name}
						</Link>
					);
				})}
			</div>

			{products.length === 0 ? (
				<EmptyState
					title={t("common.noProducts")}
					hint={t("common.noProductsHint")}
					actionLabel={t("common.viewAll")}
					actionHref="/products"
				/>
			) : (
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{products.map((product) => (
						<ProductCard key={product.id} product={product as never} showBrand />
					))}
				</div>
			)}

			<PaginatedView
				page={page}
				totalPages={totalPages}
				buildHref={(p) =>
					buildPageHref(
						"/products",
						{ q, brand: brandSlug, category: categorySlug, page: String(page) },
						{ page: String(p) },
					)
				}
				paginationLabel={{ templateKey: "products.pagination", count: productsRes.totalDocs }}
			/>
		</PageContainer>
	);
}
