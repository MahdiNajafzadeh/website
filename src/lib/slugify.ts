import type { Slugify } from "payload/shared";

const slugifyString = (input: string): string =>
    input
        .trim()
        .replace(/[^\w\s-]+/g, "")
        .replace(/[\s_-]+/g, "-")
        .toLowerCase();

export const localizedSlugify: Slugify = ({ valueToSlugify }) =>
    typeof valueToSlugify === "string" ? slugifyString(valueToSlugify) : undefined;
