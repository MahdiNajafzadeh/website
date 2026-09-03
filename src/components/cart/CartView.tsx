"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/cart-store";
import { getPrice, type CustomerType } from "@/lib/pricing";
import { t, tFmt } from "@/lib/t";

type Props = {
	partnerDiscount?: number;
	customerType?: CustomerType;
};

function formatToman(n: number): string {
	return `${Math.round(n).toLocaleString("fa-IR")} ${t("common.toman")}`;
}

export function CartView({ partnerDiscount = 0, customerType = "regular" }: Props) {
	const [mounted, setMounted] = useState(false);
	const items = useCartStore((s) => s.items);
	const updateQuantity = useCartStore((s) => s.updateQuantity);
	const removeItem = useCartStore((s) => s.removeItem);
	const undoRemove = useCartStore((s) => s.undoRemove);

	useEffect(() => setMounted(true), []);

	if (!mounted) {
		return (
			<div className="rounded-[18px] bg-[#f5f5f5] p-8 text-center text-[14px] font-medium text-[#707072] dark:bg-[#1a1a1a] dark:text-[#9e9ea0]">
				{t("cart.loading")}
			</div>
		);
	}

	if (items.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center gap-3 rounded-[18px] bg-[#f5f5f5] py-16 text-center dark:bg-[#1a1a1a]">
				<div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ffffff] dark:bg-[#111111]">
					<ShoppingBag className="h-7 w-7 text-[#9e9ea0]" />
				</div>
				<p className="text-[16px] font-medium text-[#111111] dark:text-white">{t("cart.empty")}</p>
				<p className="text-[14px] font-medium text-[#707072] dark:text-[#9e9ea0]">{t("cart.emptyHint")}</p>
				<Link
					href="/products"
					className="mt-2 inline-flex h-10 items-center justify-center rounded-full bg-[#111111] px-6 text-[14px] font-medium text-white hover:opacity-90 dark:bg-white dark:text-[#111111]"
				>
					{t("cart.browseProducts")}
				</Link>
			</div>
		);
	}

	const priced = items.map((item) => {
		const discounted = getPrice({ price: item.price }, customerType, partnerDiscount);
		const hasDiscount = discounted !== item.price && customerType === "partner" && partnerDiscount > 0;
		return { ...item, discounted, hasDiscount };
	});

	const grandTotal = priced.reduce((sum, i) => sum + i.discounted * i.quantity, 0);

	const handleRemove = (id: string, name: string) => {
		removeItem(id);
		toast(tFmt("cart.removed", { name }), {
			duration: 3000,
			action: { label: t("cart.undo"), onClick: () => undoRemove() },
		});
	};

	return (
		<div className="grid gap-8 md:grid-cols-[1fr_320px]">
			<ul className="divide-y divide-[#e5e5e5] rounded-[18px] border border-[#cacacb] bg-[#ffffff] dark:divide-[#39393b] dark:border-[#39393b] dark:bg-[#1a1a1a]">
				{priced.map((item) => (
					<li key={item.id} className="flex gap-4 p-4">
						<div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[18px] bg-[#f5f5f5] dark:bg-[#111111]">
							{item.image ? (
								// eslint-disable-next-line @next/next/no-img-element
								<img src={item.image} alt={item.name} className="h-full w-full object-cover" />
							) : (
								<ShoppingBag className="h-6 w-6 text-[#9e9ea0]" />
							)}
						</div>

						<div className="flex min-w-0 flex-1 flex-col gap-2">
							<Link
								href={item.productId ? `/products/${item.productId}` : "#"}
								className="line-clamp-2 text-[16px] font-medium leading-[1.5] text-[#111111] hover:underline dark:text-white"
							>
								{item.name}
							</Link>
							<div className="flex flex-wrap items-center gap-3">
								{item.hasDiscount ? (
									<>
										<span className="text-[16px] font-medium text-[#d30005]">
											{formatToman(item.discounted)}
										</span>
										<span className="text-[14px] font-medium text-[#707072] line-through dark:text-[#9e9ea0]">
											{formatToman(item.price)}
										</span>
									</>
								) : (
									<span className="text-[16px] font-medium text-[#111111] dark:text-white">
										{formatToman(item.price)}
									</span>
								)}
								<span className="text-[12px] text-[#707072] dark:text-[#9e9ea0]">
									× {item.quantity.toLocaleString("fa-IR")}
								</span>
							</div>

							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="icon-sm"
									aria-label={`${t("cart.total")} - ${item.name}`}
									className="h-8 w-8 rounded-full border-[#cacacb] dark:border-[#39393b]"
									onClick={() => updateQuantity(item.id, item.quantity - 1)}
								>
									<Minus className="h-4 w-4" />
								</Button>
								<span className="w-10 text-center text-[16px] font-medium text-[#111111] dark:text-white">
									{item.quantity.toLocaleString("fa-IR")}
								</span>
								<Button
									variant="outline"
									size="icon-sm"
									aria-label={`${t("cart.total")} + ${item.name}`}
									className="h-8 w-8 rounded-full border-[#cacacb] dark:border-[#39393b]"
									onClick={() => updateQuantity(item.id, item.quantity + 1)}
								>
									<Plus className="h-4 w-4" />
								</Button>
								<Button
									variant="ghost"
									size="icon-sm"
									aria-label={`${t("cart.undo")} ${item.name}`}
									className="ml-auto h-8 w-8 rounded-full text-[#d30005] hover:bg-[#d30005]/10"
									onClick={() => handleRemove(item.id, item.name)}
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</div>
						</div>

						<div className="flex flex-col items-end gap-1">
							<span className="text-[16px] font-medium text-[#111111] dark:text-white">
								{formatToman(item.discounted * item.quantity)}
							</span>
							<span className="text-[12px] text-[#707072] dark:text-[#9e9ea0]">{t("cart.subtotal")}</span>
						</div>
					</li>
				))}
			</ul>

			<aside className="h-fit space-y-4 rounded-[18px] border border-[#cacacb] bg-[#ffffff] p-6 dark:border-[#39393b] dark:bg-[#1a1a1a]">
				<h2 className="text-[16px] font-medium text-[#111111] dark:text-white">{t("cart.orderSummary")}</h2>
				<div className="space-y-2 border-y border-[#e5e5e5] py-3 dark:border-[#39393b]">
					{priced.map((item) => (
						<div key={item.id} className="flex items-center justify-between text-[14px]">
							<span className="max-w-[180px] truncate text-[#707072] dark:text-[#9e9ea0]">
								{item.name} × {item.quantity.toLocaleString("fa-IR")}
							</span>
							<span className="font-medium text-[#111111] dark:text-white">
								{formatToman(item.discounted * item.quantity)}
							</span>
						</div>
					))}
				</div>
				<div className="flex items-center justify-between">
					<span className="text-[16px] font-medium text-[#111111] dark:text-white">{t("cart.total")}</span>
					<span className="text-[16px] font-medium text-[#111111] dark:text-white">
						{formatToman(grandTotal)}
					</span>
				</div>
				{customerType === "partner" && partnerDiscount > 0 && (
					<p className="text-[12px] font-medium text-[#007d48]">
						{tFmt("cart.partnerDiscountApplied", { discount: partnerDiscount })}
					</p>
				)}
			</aside>
		</div>
	);
}
