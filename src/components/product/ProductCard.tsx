import Link from "next/link";
import type { Category, Product } from "@/payload-types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { t } from "@/lib/t";
import { formatToman } from "@/lib/pricing";
import { getStockState } from "@/lib/inventory";
import { getProductImageUrl } from "@/lib/media";

export interface ProductCardProps {
	product: Pick<Product, "id" | "name" | "slug" | "price" | "inventory" | "category" | "images" | "showcaseImage"> & {
		brand?: Product["brand"];
	};
	showBrand?: boolean;
	showLowStock?: boolean;
}

function getCategoryName(category: Product["category"]): string | null {
	if (!category || typeof category === "number") return null;
	return (category as Category).name ?? null;
}

export function ProductCard({ product, showBrand = false, showLowStock = true }: ProductCardProps) {
	const categoryName = getCategoryName(product.category);
	const imageUrl = getProductImageUrl(product);
	const price = product.price ?? 0;
	const inventory = product.inventory ?? 0;
	const isContact = price === 0;
	const { isOutOfStock, isLowStock } = getStockState(inventory);
	const brandName =
		product.brand && typeof product.brand !== "number"
			? (product.brand as { name?: string }).name ?? null
			: null;

	return (
		<Link href={`/products/${product.slug}`} className="group" data-od-id="product-card">
			<Card className="overflow-hidden rounded-none border border-[#e5e5e5] bg-white p-0 shadow-none transition-none hover:border-[#cacacb] dark:border-[#39393b] dark:bg-[#1a1a1a] gap-0">
				<div className="aspect-square overflow-hidden bg-[#f5f5f5] dark:bg-[#111111]">
					{imageUrl ? (
						// eslint-disable-next-line @next/next/no-img-element
						<img
							src={imageUrl}
							alt={product.name}
							className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
							loading="lazy"
						/>
					) : (
						<div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-[#f5f5f5] px-4 text-center dark:bg-[#111111]">
							<span className="text-[14px] font-medium text-[#707072] dark:text-[#9e9ea0]">
								{t("common.noImage")}
							</span>
						</div>
					)}
				</div>
				<CardContent className="flex flex-col gap-1.5 p-4">
					<div className="flex flex-wrap items-center gap-1.5">
						{isOutOfStock && (
							<Badge
								variant="outline"
								className="rounded-full border border-[#cacacb] bg-white text-xs font-medium text-[#707072] dark:border-[#39393b] dark:bg-transparent dark:text-[#9e9ea0]"
							>
								{t("common.outOfStock")}
							</Badge>
						)}
						{showLowStock && isLowStock && !isOutOfStock && (
							<Badge className="rounded-full bg-[#f5f5f5] px-2.5 py-0.5 text-xs font-medium text-[#111111] hover:bg-[#f5f5f5] dark:bg-[#39393b] dark:text-white">
								{t("common.lowStock")}
							</Badge>
						)}
						{categoryName && (
							<Badge
								variant="secondary"
								className="rounded-full bg-[#f5f5f5] text-xs font-medium text-[#707072] dark:bg-[#39393b] dark:text-[#9e9ea0]"
							>
								{categoryName}
							</Badge>
						)}
					</div>
					<h3 className="line-clamp-2 text-[16px] font-medium leading-[1.5] text-[#111111] dark:text-white">
						{product.name}
					</h3>
					{showBrand && brandName ? (
						<p className="text-[14px] font-medium text-[#707072] dark:text-[#9e9ea0]">{brandName}</p>
					) : null}
					<p
						className={`text-[14px] font-medium leading-[1.5] ${isContact ? "text-[#707072] dark:text-[#9e9ea0]" : "text-[#111111] dark:text-white"}`}
					>
						{isContact ? t("common.contactForPrice") : formatToman(price)}
					</p>
				</CardContent>
			</Card>
		</Link>
	);
}