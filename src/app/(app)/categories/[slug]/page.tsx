import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProductCard } from "@/components/product/ProductCard";
import type { Brand, Category, Product } from "@/payload-types";
import { t } from "@/lib/t";
import { getPayloadClient } from "@/lib/payload";

export const dynamic = "force-dynamic";

export default async function CategoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	const payload = await getPayloadClient();

	const catRes = await payload.find({
		collection: "categories",
		where: { slug: { equals: slug } },
		limit: 1,
		depth: 0,
	});

	const category = catRes.docs[0] as Category | undefined;
	if (!category) notFound();

	// Products by category via relationship query — combined brand+category filter also verified via /products?brand=&category=
	const productsRes = await payload.find({
		collection: "products",
		where: {
			and: [{ visible: { equals: true } }, { category: { equals: category.id } }],
		},
		depth: 1,
		limit: 24,
		sort: "-createdAt",
	});

	const products = productsRes.docs as Product[];

	// Fetch brands for filter pills context (optional but helps compose filters)
	const brandsRes = await payload.find({
		collection: "brands",
		limit: 50,
		sort: "name",
		depth: 0,
	});
	const brands = brandsRes.docs as Brand[];

	return (
		<PageContainer>
			<Breadcrumbs
				crumbs={[
					{ href: "/", label: t("common.home") },
					{ href: "/products", label: t("common.products") },
					{ label: category.name },
				]}
				separatorKey="common.breadcrumbSeparatorSlash"
			/>

			<div className="rounded-[30px] bg-[#f5f5f5] dark:bg-[#1a1a1a] p-6">
				<h1 className="text-[32px] font-medium leading-[1.2] text-[#111111] dark:text-white">
					{category.name}
				</h1>
				{category.description && (
					<p className="mt-1 text-[14px] font-medium text-[#707072] dark:text-[#9e9ea0]">
						{category.description}
					</p>
				)}
				<p className="mt-1 text-[12px] font-medium text-[#707072] dark:text-[#9e9ea0]">
					{t("common.countWithLabel", {
						count: productsRes.totalDocs.toLocaleString("fa-IR"),
						label: t("common.productsCount"),
					})}
				</p>
			</div>

			{/* Filter pills — pills use {colors.soft-cloud} #f5f5f5, {rounded.full} 9999px, {typography.caption-md} 14px/500 */}
			<div className="mt-6 flex flex-wrap items-center gap-2">
				<span className="text-[14px] font-medium text-[#111111] mr-1">{t("categories.brandsLabel")}</span>
				<Link
					href={`/products?category=${category.slug}`}
					className="rounded-full bg-[#111111] px-4 py-1.5 text-[14px] font-medium text-white"
				>
					{t("categories.allBrandsIn", { name: category.name })}
				</Link>
				{brands.slice(0, 8).map((b) => (
					<Link
						key={b.id}
						href={`/products?brand=${b.slug}&category=${category.slug}`}
						className="rounded-full bg-[#f5f5f5] px-4 py-1.5 text-[14px] font-medium text-[#111111] ring-1 ring-[#e5e5e5] hover:bg-[#e5e5e5]"
						/* combined brand+category filter — verify composing */
					>
						{b.name}
					</Link>
				))}
				<Link
					href="/products"
					className="rounded-full bg-white px-4 py-1.5 text-[14px] font-medium text-[#111111] ring-1 ring-[#cacacb] hover:bg-[#f5f5f5]"
				>
					{t("categories.allProducts")}
				</Link>
			</div>

			{/* Category pills row (other categories) */}
			<div className="mt-3 flex flex-wrap items-center gap-2">
				<Link
					href={`/products?category=${category.slug}`}
					className="rounded-full bg-[#111111] px-4 py-1.5 text-[14px] font-medium text-white"
				>
					{t("categories.categoryOnly", { name: category.name })}
				</Link>
				<Link
					href="/products"
					className="rounded-full bg-[#f5f5f5] px-4 py-1.5 text-[14px] font-medium text-[#111111] ring-1 ring-[#e5e5e5] hover:bg-[#e5e5e5]"
				>
					{t("categories.clearCategory")}
				</Link>
			</div>

			{products.length === 0 ? (
				<EmptyState
					variant="outline"
					title={t("common.noProducts")}
					hint={t("common.noProductsHint")}
					actionLabel={t("common.browseProducts")}
					actionHref="/products"
				/>
			) : (
				<div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{products.map((product) => (
						<ProductCard key={product.id} product={product as never} showBrand showLowStock={false} />
					))}
				</div>
			)}
		</PageContainer>
	);
}
