export function getPrimary<T extends { isPrimary?: boolean | null }>(arr: T[] | null | undefined): T | null {
	if (!arr || arr.length === 0) return null;
	return arr.find((i) => i.isPrimary) ?? arr[0] ?? null;
}

export function sortByPrimary<T extends { isPrimary?: boolean | null }>(arr: T[] | null | undefined): T[] {
	if (!arr || arr.length === 0) return [];
	return [...arr].sort((a, b) => {
		if (a.isPrimary && !b.isPrimary) return -1;
		if (!a.isPrimary && b.isPrimary) return 1;
		return 0;
	});
}
