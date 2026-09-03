import type { MetadataRoute } from "next";
export const dynamic = "force-dynamic";

function getBaseUrl(): string {
	const raw =
		process.env.NEXT_PUBLIC_SITE_URL ||
		process.env.NEXT_PUBLIC_SERVER_URL ||
		process.env.SITE_URL ||
		"https://example.com";
	return raw.replace(/\/$/, "");
}

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
