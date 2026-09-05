import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { EmptyState } from "@/components/ui/EmptyState";
import { InitialsAvatar } from "@/components/ui/InitialsAvatar";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProductCard } from "@/components/product/ProductCard";
import type { Brand, Media, Product } from "@/payload-types";
import { t } from "@/lib/t";
import { getMediaUrl } from "@/lib/media";
import { getPayloadClient } from "@/lib/payload";

export const dynamic = "force-dynamic";

export default async function BrandDetailPage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	const payload = await getPayloadClient();

	const brandRes = await payload.find({
		collection: "brands",
		where: { slug: { equals: slug } },
		limit: 1,
		depth: 1,
	});

	const brand = brandRes.docs[0] as Brand | undefined;
	if (!brand) notFound(); // 404 unknown slug

	const iconUrl = getMediaUrl(brand.icon as Media | number | null | undefined);

	// Detail shows products by brand via relationship query — verify brand-filter
	const productsRes = await payload.find({
		collection: "products",
		where: {
			and: [{ visible: { equals: true } }, { brand: { equals: brand.id } }],
		},
		depth: 1,
		limit: 24,
		sort: "-createdAt",
	});

	const products = productsRes.docs as Product[];

	return (
		<PageContainer>
			<Breadcrumbs
				crumbs={[
					{ href: "/", label: t("common.home") },
					{ href: "/brands", label: t("common.brands") },
					{ label: brand.name },
				]}
				separatorKey="common.breadcrumbSeparatorSlash"
			/>

			<div className="flex items-center gap-4 rounded-[30px] bg-[#f5f5f5] dark:bg-[#1a1a1a] p-6">
				{iconUrl ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img
						src={iconUrl}
						alt={brand.name}
						className="size-16 rounded-full object-cover bg-white ring-1 ring-[#e5e5e5]"
					/>
				) : (
					<InitialsAvatar name={brand.name} size="lg" />
				)}
				<div>
					<h1 className="text-[32px] font-medium leading-[1.2] text-[#111111] dark:text-white">
						{brand.name}
					</h1>
					{brand.description && (
						<p className="mt-1 text-[14px] font-medium text-[#707072] dark:text-[#9e9ea0]">
							{brand.description}
						</p>
					)}
					<p className="mt-1 text-[12px] font-medium text-[#707072] dark:text-[#9e9ea0]">
						{t("common.countWithLabel", {
							count: productsRes.totalDocs.toLocaleString("fa-IR"),
							label: t("common.productsCount"),
						})}
					</p>
				</div>
			</div>

			<div className="mt-6 flex flex-wrap gap-2">
				<Link
					href={`/products?brand=${brand.slug}`}
					className="rounded-full bg-[#111111] px-4 py-1.5 text-[14px] font-medium text-white hover:bg-[#111111]/90 dark:bg-white dark:text-[#111111]"
				>
					{t("common.countWithLabel", { count: t("common.productsCount"), label: brand.name })}
				</Link>
				<Link
					href="/brands"
					className="rounded-full bg-white px-4 py-1.5 text-[14px] font-medium text-[#111111] ring-1 ring-[#cacacb] hover:bg-[#f5f5f5] dark:bg-transparent dark:text-white dark:ring-[#39393b]"
				>
					{t("common.all")}
				</Link>
			</div>

			{products.length === 0 ? (
				<EmptyState
					variant="outline"
					title={t("common.noProducts")}
					hint={t("common.noProductsHint")}
					actionLabel={t("common.viewAll")}
					actionHref="/products"
				/>
			) : (
				<div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{products.map((product) => (
						<ProductCard key={product.id} product={product as never} showLowStock={false} />
					))}
				</div>
			)}
		</PageContainer>
	);
}
