import { headers } from "next/headers";
import { getPayload } from "payload";
import config from "@payload-config";
import { getSiteSettings } from "@/lib/site-settings";
import type { CustomerType } from "@/lib/pricing";
import type { SiteSetting, User } from "@/payload-types";

export async function getCurrentUser() {
	const headerList = await headers();
	const payload = await getPayload({ config });
	const { user } = await payload.auth({ headers: headerList });
	return user as User | null;
}

export async function getCurrentUserWithSettings(): Promise<{
	user: User | null;
	settings: SiteSetting | null;
}> {
	const [user, settings] = await Promise.all([getCurrentUser(), getSiteSettings()]);
	return { user, settings: settings as SiteSetting | null };
}

export interface PricingContext {
	partnerDiscount: number;
	customerType: CustomerType;
}

export async function getPricingContext(): Promise<PricingContext> {
	const [settings, user] = await Promise.all([getSiteSettings(), getCurrentUser()]);
	return {
		partnerDiscount: settings?.partnerDiscount ?? 0,
		customerType: user?.customerType ?? "regular",
	};
}
