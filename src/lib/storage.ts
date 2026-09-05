import { createJSONStorage } from "zustand/middleware";

function getLocalStorage(): Storage | undefined {
	if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
		return window.localStorage;
	}
	return undefined;
}

export const ssrSafeLocalStorage = createJSONStorage(() => {
	const ls = getLocalStorage();
	return ls as unknown as Storage;
});

export function safeGetLocalStorage(key: string): string | null {
	const ls = getLocalStorage();
	if (!ls) return null;
	try {
		return ls.getItem(key);
	} catch {
		return null;
	}
}

export function safeSetLocalStorage(key: string, value: string): void {
	const ls = getLocalStorage();
	if (!ls) return;
	try {
		ls.setItem(key, value);
	} catch {
		// ignore quota / privacy errors
	}
}