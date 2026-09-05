export function getBaseUrl(): string {
	const raw =
		process.env.NEXT_PUBLIC_SITE_URL ||
		process.env.NEXT_PUBLIC_SERVER_URL ||
		process.env.SITE_URL ||
		"https://example.com";
	return raw.replace(/\/$/, "");
}