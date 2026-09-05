import type { Post } from "@/payload-types";

export function plainTextFromLexical(content: Post["content"]): string {
	if (!content || typeof content !== "object" || !("root" in content)) return "";
	const root = (content as { root: { children: Array<{ children?: Array<{ text?: string }> }> } }).root;
	if (!root?.children) return "";
	let out = "";
	for (const node of root.children) {
		const children = (node as { children?: Array<{ text?: string }> }).children ?? [];
		for (const child of children) {
			if (typeof child.text === "string") out += child.text + " ";
		}
		out += " ";
	}
	return out.replace(/\s+/g, " ").trim();
}