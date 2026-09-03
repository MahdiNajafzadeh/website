import Link from "next/link";
import { getPayload } from "payload";
import config from "@/payload.config";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
	PaginationEllipsis,
} from "@/components/ui/pagination";
import type { Brand, Category, Media, Product } from "@/payload-types";
import { t, tFmt } from "@/lib/t";

export const dynamic = "force-dynamic";

type SearchParams = {
	q?: string;
	brand?: string;
	category?: string;
	page?: string;
};

function getMediaUrl(media: number | Media | null | undefined): string | null {
	if (!media || typeof media === "number") return null;
	return (media as Media).url ?? null;
}

function buildPageHref(
	base: SearchParams & { page?: number | string },
	overrides: Partial<Record<string, string | undefined>>,
) {
	const params = new URLSearchParams();
	const merged: Record<string, string | undefined> = {
		q: base.q,
		brand: base.brand,
		category: base.category,
		page: base.page ? String(base.page) : undefined,
		...overrides,
	};
	for (const [k, v] of Object.entries(merged)) {
		if (v && v !== "") params.set(k, v);
	}
	const qs = params.toString();
	return qs ? `/products?${qs}` : "/products";
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
	const sp = await searchParams;
	const q = sp.q?.trim() ?? "";
	const brandSlug = sp.brand?.trim() ?? "";
	const categorySlug = sp.category?.trim() ?? "";
	const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
	const limit = 12;

	const payloadConfig = await config;
	const payload = await getPayload({ config: payloadConfig });

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

	return (
		<div className="mx-auto max-w-[1440px] px-4 py-8 md:px-8">
			<nav
				className="mb-6 flex items-center gap-1.5 text-sm text-[#707072] dark:text-[#9e9ea0]"
				aria-label="Breadcrumb"
			>
				<Link href="/" className="hover:text-[#111111] dark:hover:text-white">
					{t("common.home")}
				</Link>
				<span aria-hidden>/</span>
				<span className="font-medium text-[#111111] dark:text-white">{t("products.title")}</span>
			</nav>

			<h1 className="mb-2 text-[32px] font-medium leading-[1.2] text-[#111111] dark:text-white">
				{t("products.title")}
			</h1>
			<p className="mb-6 text-[14px] font-medium text-[#707072] dark:text-[#9e9ea0]">
				{productsRes.totalDocs.toLocaleString("fa-IR")} {t("common.productsCount")}
				{activeFiltersCount > 0 && ` · ${activeFiltersCount.toLocaleString("fa-IR")} ${t("common.browse")}`}
			</p>

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
				<div className="rounded-[30px] bg-[#f5f5f5] p-12 text-center dark:bg-[#1a1a1a]">
					<p className="text-[16px] font-medium text-[#111111] dark:text-white">{t("common.noProducts")}</p>
					<p className="mt-1 text-[14px] font-medium text-[#707072] dark:text-[#9e9ea0]">
						{t("common.noProductsHint")}
					</p>
					<Link
						href="/products"
						className="mt-4 inline-flex rounded-full bg-[#111111] px-6 py-2 text-[14px] font-medium text-white dark:bg-white dark:text-[#111111]"
					>
						{t("common.viewAll")}
					</Link>
				</div>
			) : (
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{products.map((product) => {
						const brand = product.brand as Brand | number | null | undefined;
						const category = product.category as Category | number | null | undefined;
						const brandName = brand && typeof brand !== "number" ? brand.name : null;
						const categoryName = category && typeof category !== "number" ? category.name : null;
						const showcase = getMediaUrl(product.showcaseImage as Media | number | null | undefined);
						const firstImage =
							product.images?.[0] && typeof product.images[0].image !== "number"
								? getMediaUrl(product.images[0].image as Media)
								: null;
						const imageUrl = showcase ?? firstImage;
						const price = product.price ?? 0;
						const inventory = product.inventory ?? 0;
						const isOutOfStock = inventory <= 0;
						const isLowStock = inventory > 0 && inventory <= 5;
						return (
							<Link key={product.id} href={`/products/${product.slug}`} className="group">
								<Card className="gap-0 overflow-hidden rounded-[30px] border border-[#e5e5e5] bg-white p-0 dark:border-[#39393b] dark:bg-[#1a1a1a]">
									<div className="aspect-square overflow-hidden bg-[#f5f5f5] dark:bg-[#111111]">
										{imageUrl ? (
											// eslint-disable-next-line @next/next/no-img-element
											<img
												src={imageUrl}
												alt={product.name}
												className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
												loading="lazy"
											/>
										) : (
											<div className="flex h-full w-full items-center justify-center text-sm text-[#707072] dark:text-[#9e9ea0]">
												{t("common.noImage")}
											</div>
										)}
									</div>
									<CardContent className="flex flex-col gap-1.5 p-4">
										<div className="flex flex-wrap items-center gap-1.5">
											{isOutOfStock && (
												<Badge
													variant="outline"
													className="rounded-full border-[#cacacb] bg-white text-xs text-[#707072] dark:border-[#39393b] dark:bg-transparent dark:text-[#9e9ea0]"
												>
													{t("common.outOfStock")}
												</Badge>
											)}
											{isLowStock && !isOutOfStock && (
												<Badge className="rounded-full bg-[#f5f5f5] text-xs text-[#111111] hover:bg-[#f5f5f5] dark:bg-[#39393b] dark:text-white">
													{t("common.lowStock")}
												</Badge>
											)}
											{categoryName && (
												<Badge
													variant="secondary"
													className="rounded-full bg-[#f5f5f5] text-xs text-[#111111] dark:bg-[#39393b] dark:text-white"
												>
													{categoryName}
												</Badge>
											)}
										</div>
										<h3 className="line-clamp-2 text-[16px] font-medium leading-[1.5] text-[#111111] dark:text-white">
											{product.name}
										</h3>
										{brandName && (
											<p className="text-[14px] font-medium text-[#707072] dark:text-[#9e9ea0]">
												{brandName}
											</p>
										)}
										<p
											className={
												price === 0
													? "text-[14px] font-medium text-[#707072] dark:text-[#9e9ea0]"
													: "text-[16px] font-medium text-[#111111] dark:text-white"
											}
										>
											{price === 0
												? t("common.contactForPrice")
												: `${price.toLocaleString("fa-IR")} ${t("common.toman")}`}
											{price > 0 && isOutOfStock && (
												<span className="ml-2 text-xs text-[#707072] dark:text-[#9e9ea0]">
													— {t("common.outOfStock")}
												</span>
											)}
										</p>
									</CardContent>
								</Card>
							</Link>
						);
					})}
				</div>
			)}

			{totalPages > 1 && (
				<div className="mt-8">
					<Pagination>
						<PaginationContent>
							{page > 1 && (
								<PaginationItem>
									<PaginationPrevious
										href={buildPageHref(
											{ q, brand: brandSlug, category: categorySlug, page: String(page) },
											{ page: String(page - 1) },
										)}
									/>
								</PaginationItem>
							)}
							{Array.from({ length: totalPages }, (_, i) => i + 1)
								.filter((p) => {
									if (totalPages <= 7) return true;
									if (p === 1 || p === totalPages) return true;
									if (Math.abs(p - page) <= 1) return true;
									if (page <= 3 && p <= 4) return true;
									if (page >= totalPages - 2 && p >= totalPages - 3) return true;
									return false;
								})
								.reduce<(number | "ellipsis")[]>((acc, p, idx, arr) => {
									const prev = arr[idx - 1];
									if (
										prev !== undefined &&
										typeof p === "number" &&
										typeof prev === "number" &&
										p - prev > 1
									)
										acc.push("ellipsis");
									acc.push(p);
									return acc;
								}, [])
								.map((p, idx) =>
									p === "ellipsis" ? (
										<PaginationItem key={`e-${idx}`}>
											<PaginationEllipsis />
										</PaginationItem>
									) : (
										<PaginationItem key={p}>
											<PaginationLink
												href={buildPageHref(
													{ q, brand: brandSlug, category: categorySlug, page: String(page) },
													{ page: String(p) },
												)}
												isActive={p === page}
											>
												{p}
											</PaginationLink>
										</PaginationItem>
									),
								)}
							{page < totalPages && (
								<PaginationItem>
									<PaginationNext
										href={buildPageHref(
											{ q, brand: brandSlug, category: categorySlug, page: String(page) },
											{ page: String(page + 1) },
										)}
									/>
								</PaginationItem>
							)}
						</PaginationContent>
					</Pagination>
					<p className="mt-3 text-center text-[12px] font-medium text-[#707072] dark:text-[#9e9ea0]">
						{tFmt("products.pagination", {
							page: page.toLocaleString("fa-IR"),
							totalPages: totalPages.toLocaleString("fa-IR"),
							count: productsRes.totalDocs.toLocaleString("fa-IR"),
						})}
					</p>
				</div>
			)}
		</div>
	);
}
