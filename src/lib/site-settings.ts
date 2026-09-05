import { getPayload } from "payload";
import config from "@payload-config";

export async function getSiteSettings() {
	const payload = await getPayload({ config });
	return await payload.findGlobal({ slug: "site-settings" });
}
