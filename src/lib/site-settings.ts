import { getPayload } from "payload";
import config from "@payload-config";

export async function getSiteSettings() {
	const payload = await getPayload({ config });
	return await payload.findGlobal({ slug: "site-settings" });
}

export async function getSiteName(): Promise<string> {
	try {
		const settings = await getSiteSettings();
		return settings?.name ?? "Store";
	} catch {
		return "Store";
	}
}
