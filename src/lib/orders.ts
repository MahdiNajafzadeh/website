import type { Order } from "@/payload-types";
import { t } from "@/lib/t";

export const STATUS_LABELS: Record<Order["status"], string> = {
	review: t("orders.status.review"),
	approved: t("orders.status.approved"),
	preparing: t("orders.status.preparing"),
	delivered: t("orders.status.delivered"),
	cancelled: t("orders.status.cancelled"),
};

export function statusTone(status: Order["status"]): { bg: string; text: string; border: string } {
	if (status === "cancelled") {
		return { bg: "bg-[#d30005]/10", text: "text-[#d30005]", border: "border-[#d30005]/20" };
	}
	if (status === "delivered" || status === "approved" || status === "preparing") {
		return { bg: "bg-[#007d48]/10", text: "text-[#007d48]", border: "border-[#007d48]/20" };
	}
	return { bg: "bg-[#f5f5f5]", text: "text-[#707072]", border: "border-[#cacacb]" };
}

export const STATUS_HISTORY: Order["status"][] = ["review", "approved", "preparing", "delivered"];