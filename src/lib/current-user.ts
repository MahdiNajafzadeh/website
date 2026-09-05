import { headers } from "next/headers";
import { getPayload } from "payload";
import config from "@payload-config";

export async function getCurrentUser() {
	const headerList = await headers();
	const payload = await getPayload({ config });
	const { user } = await payload.auth({ headers: headerList });
	return user;
}
