import type { MetadataRoute } from "next";
export const dynamic = "force-dynamic";
import { getBaseUrl } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
	const baseUrl = getBaseUrl();
	return {
		rules: [
			{
				userAgent: "*",
				allow: ["/", "/blog", "/blog/*"],
				disallow: ["/admin", "/api"],
			},
		],
		sitemap: `${baseUrl}/sitemap.xml`,
	};
}
