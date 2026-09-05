import { CheckoutForm } from "@/components/cart/CheckoutForm";
import { requireUser } from "@/lib/auth-guard";
import { getPricingContext } from "@/lib/current-user";
import { t } from "@/lib/t";

export const metadata = {
	title: "Checkout",
	description: "Review your order and provide a shipping address.",
};

export default async function CheckoutPage() {
	const user = await requireUser("/checkout");
	const { partnerDiscount, customerType } = await getPricingContext();

	return (
		<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
			<h1 className="text-[32px] font-medium leading-[1.2] text-[#111111] dark:text-white mb-2">
				{t("checkout.title")}
			</h1>
			<p className="text-[14px] font-medium text-[#707072] dark:text-[#9e9ea0] mb-8">{t("checkout.hint")}</p>

			<CheckoutForm
				initialAddress={user.address ?? ""}
				customerId={user.id}
				partnerDiscount={partnerDiscount}
				customerType={customerType}
			/>
		</div>
	);
}
