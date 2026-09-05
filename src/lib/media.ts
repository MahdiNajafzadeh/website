import type { Media, Product, SiteSetting } from "@/payload-types";

export function getMediaUrl(media: number | Media | null | undefined): string | null {
	if (!media || typeof media === "number") return null;
	return (media as Media).url ?? null;
}

export function getLogoUrl(logo: SiteSetting["logo"]): string | null {
	if (!logo) return null;
	if (typeof logo === "object" && "url" in logo) {
		const media = logo as Media;
		return media.url ?? null;
	}
	return null;
}

export function getProductImageUrl(product: Pick<Product, "showcaseImage" | "images">): string | null {
	const showcase = getMediaUrl(product.showcaseImage as Media | number | null | undefined);
	if (showcase) return showcase;
	const first = product.images?.[0];
	if (!first || typeof first.image === "number") return null;
	return getMediaUrl(first.image as Media);
}
