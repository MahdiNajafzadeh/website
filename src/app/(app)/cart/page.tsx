import Link from "next/link";

import { CartView } from "@/components/cart/CartView";
import { getPricingContext } from "@/lib/current-user";
import { t } from "@/lib/t";

export const metadata = {
	title: "Cart",
	description: "Review and update your cart items before checkout.",
};

export default async function CartPage() {
	const { partnerDiscount, customerType } = await getPricingContext();

	return (
		<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
			{/* {typography.heading-xl} 32px/500 */}
			<h1 className="text-[32px] font-medium leading-[1.2] text-[#111111] dark:text-white mb-2">
				{t("cart.title")}
			</h1>
			<p className="text-[14px] font-medium text-[#707072] dark:text-[#9e9ea0] mb-8">{t("cart.reviewHint")}</p>

			<CartView partnerDiscount={partnerDiscount} customerType={customerType} />

			<div className="mt-8 flex items-center justify-between">
				<Link
					href="/products"
					className="inline-flex h-12 items-center justify-center rounded-full border border-[#cacacb] bg-[#ffffff] px-8 text-[16px] font-medium text-[#111111] hover:bg-[#f5f5f5] dark:border-[#39393b] dark:bg-transparent dark:text-white dark:hover:bg-[#39393b]"
				>
					{t("cart.continueShopping")}
				</Link>
				<Link
					href="/checkout"
					className="inline-flex h-12 items-center justify-center rounded-full bg-[#111111] px-8 text-[16px] font-medium leading-[1.5] text-white hover:opacity-90 dark:bg-white dark:text-[#111111]"
				>
					{t("cart.checkout")}
				</Link>
			</div>
		</div>
	);
}
