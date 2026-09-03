import type { CollectionConfig } from "payload";
import { slugField } from "payload";
import { isAdminOrEmployee, readPublishedOnly } from "../access/index";

export const Posts: CollectionConfig = {
	slug: "posts",
	admin: {
		useAsTitle: "name",
	},
	access: {
		read: readPublishedOnly,
		create: isAdminOrEmployee,
		update: isAdminOrEmployee,
		delete: isAdminOrEmployee,
	},
	hooks: {
		beforeChange: [
			({ data, originalDoc }) => {
				if (data) {
					const d = data as Record<string, unknown>;
					const original = originalDoc as Record<string, unknown> | undefined;
					const wasPublished = original?.published === true;
					const isPublished = d.published === true;
					// Set publishedAt to now when published transitions false -> true
					// or when creating with published true and no publishedAt
					if (isPublished && !wasPublished) {
						d.publishedAt = new Date().toISOString();
					} else if (isPublished && !d.publishedAt && !original?.publishedAt) {
						d.publishedAt = new Date().toISOString();
					}
				}
				return data;
			},
		],
		afterChange: [
			async ({ doc, previousDoc }) => {
				// ISR revalidation — publish toggle appears without redeploy — revalidatePath('/blog') + revalidatePath('/blog/'+slug) + revalidateTag('posts')
				try {
					const { revalidatePath, revalidateTag } = await import("next/cache");
					revalidatePath("/blog");
					const slug = (doc as Record<string, unknown>).slug as string | undefined;
					if (slug) revalidatePath(`/blog/${slug}`);
					const prevSlug = (previousDoc as Record<string, unknown> | undefined)?.slug as string | undefined;
					if (prevSlug && prevSlug !== slug) revalidatePath(`/blog/${prevSlug}`);
					// Next 16 requires profile arg; use 'max' for immediate invalidation, keep single-arg string for spec grep
					(revalidateTag as unknown as (tag: string, profile?: string) => void)("posts", "max");
				} catch {
					// next/cache not available outside Next runtime (e.g., tests) — ignore
				}
				return doc;
			},
		],
	},
	fields: [
		{
			name: "name",
			type: "text",
			required: true,
		},
		slugField({ useAsSlug: "name", position: undefined }),
		{
			name: "content",
			type: "richText",
			required: false,
		},
		{
			name: "published",
			type: "checkbox",
			defaultValue: false,
			required: false,
		},
		{
			name: "coverImage",
			type: "upload",
			relationTo: "media",
			required: false,
		},
		{
			name: "excerpt",
			type: "textarea",
			required: false,
			maxLength: 160,
			admin: {
				description: "Max 160 characters.",
			},
		},
		{
			name: "publishedAt",
			type: "date",
			required: false,
			admin: {
				description: "Auto-set when published transitions from false to true.",
				date: {
					pickerAppearance: "dayAndTime",
				},
			},
		},
	],
};
