import type { Media as MediaType } from "@/payload-types";

export const mediaUrl = (
    media: number | string | MediaType | null | undefined,
    size?: "thumbnail" | "card" | "hero",
): string | null => {
    if (!media || typeof media === "number" || typeof media === "string") return null;
    const m = media as MediaType;
    if (size && m.sizes && typeof m.sizes === "object") {
        const sized = m.sizes[size as keyof typeof m.sizes] as { url?: string } | undefined;
        if (sized?.url) return sized.url;
    }
    return m.url ?? null;
};

export const mediaAlt = (media: number | string | MediaType | null | undefined): string => {
    if (!media || typeof media === "number" || typeof media === "string") return "";
    return (media as MediaType).alt ?? "";
};
