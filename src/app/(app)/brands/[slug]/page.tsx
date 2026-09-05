import Link from "next/link";
import { notFound } from "next/navigation";
import { getPayload } from "payload";
import config from "@/payload.config";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Brand, Category, Media, Product } from "@/payload-types";
import { t } from "@/lib/t";

export const dynamic = "force-dynamic";

function getMediaUrl(media: number | Media | null | undefined): string | null {
	if (!media || typeof media === "number") return null;
	return (media as Media).url ?? null;
}

export default async function BrandDetailPage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	const payloadConfig = await config;
	const payload = await getPayload({ config: payloadConfig });

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
		<div className="mx-auto max-w-[1440px] px-4 py-8 md:px-8">
			<nav
				className="mb-6 flex items-center gap-1.5 text-sm text-[#707072] dark:text-[#9e9ea0]"
				aria-label="Breadcrumb"
			>
				<Link href="/" className="hover:text-[#111111] dark:hover:text-white">
					{t("common.home")}
				</Link>
				<span aria-hidden>{t("common.breadcrumbSeparatorSlash")}</span>
				<Link href="/brands" className="hover:text-[#111111] dark:hover:text-white">
					{t("common.brands")}
				</Link>
				<span aria-hidden>{t("common.breadcrumbSeparatorSlash")}</span>
				<span className="font-medium text-[#111111] dark:text-white">{brand.name}</span>
			</nav>

			<div className="flex items-center gap-4 rounded-[30px] bg-[#f5f5f5] dark:bg-[#1a1a1a] p-6">
				{iconUrl ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img
						src={iconUrl}
						alt={brand.name}
						className="size-16 rounded-full object-cover bg-white ring-1 ring-[#e5e5e5]"
					/>
				) : (
					<div className="flex size-16 items-center justify-center rounded-full bg-white text-[20px] font-medium text-[#111111] ring-1 ring-[#e5e5e5]">
						{brand.name.charAt(0).toUpperCase()}
					</div>
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
				<div className="mt-8 rounded-[30px] bg-white p-12 text-center ring-1 ring-[#e5e5e5] dark:bg-[#1a1a1a] dark:ring-[#39393b]">
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
				<div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{products.map((product) => {
						const category = product.category as Category | number | null | undefined;
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

						return (
							<Link key={product.id} href={`/products/${product.slug}`} className="group">
								<Card className="overflow-hidden rounded-[30px] border border-[#e5e5e5] bg-white dark:border-[#39393b] dark:bg-[#1a1a1a] p-0 gap-0">
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
										<div className="flex items-center gap-1.5">
											{isOutOfStock && (
												<Badge
													variant="outline"
													className="rounded-full border-[#cacacb] bg-white text-xs text-[#707072] dark:border-[#39393b] dark:bg-transparent dark:text-[#9e9ea0]"
												>
													{t("common.outOfStock")}
												</Badge>
											)}
											{categoryName && (
												<Badge
													variant="secondary"
													className="rounded-full bg-[#f5f5f5] dark:bg-[#39393b] dark:text-white text-xs text-[#111111]"
												>
													{categoryName}
												</Badge>
											)}
										</div>
										<h3 className="line-clamp-2 text-[16px] font-medium leading-[1.5] text-[#111111] dark:text-white">
											{product.name}
										</h3>
										<p className="text-[14px] font-medium text-[#111111] dark:text-white">
											{price === 0
												? t("common.contactForPrice")
												: `${price.toLocaleString("fa-IR")} ${t("common.toman")}`}
										</p>
									</CardContent>
								</Card>
							</Link>
						);
					})}
				</div>
			)}
		</div>
	);
}
