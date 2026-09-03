import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Client-only persisted wishlist store.
 *
 * Holds the set of product ids a shopper has saved. Backed by `localStorage`
 * so membership survives page reloads in the same browser. No server-side
 * persistence in this version.
 *
 * @client The `useWishlistStore` hook MUST NOT be called from a React Server
 * Component — it relies on React context that only exists on the client. The
 * module itself can be imported from a Server Component without throwing, but
 * any read or write of the hook will.
 */
type WishlistState = {
	items: string[];
	addItem: (id: string) => void;
	removeItem: (id: string) => void;
	toggleItem: (id: string) => void;
	hasItem: (id: string) => boolean;
	clear: () => void;
};

export const useWishlistStore = create<WishlistState>()(
	persist(
		(set, get) => ({
			items: [],

			addItem: (id) =>
				set((state) => {
					if (state.items.includes(id)) return state;
					return { items: [...state.items, id] };
				}),

			removeItem: (id) =>
				set((state) => {
					if (!state.items.includes(id)) return state;
					return { items: state.items.filter((i) => i !== id) };
				}),

			toggleItem: (id) =>
				set((state) => {
					if (state.items.includes(id)) {
						return { items: state.items.filter((i) => i !== id) };
					}
					return { items: [...state.items, id] };
				}),

			hasItem: (id) => get().items.includes(id),

			clear: () => set({ items: [] }),
		}),
		{
			name: "wishlist-storage",
			storage: createJSONStorage(() => {
				if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
					return window.localStorage;
				}
				return undefined as unknown as Storage;
			}),
			partialize: (state) => ({ items: state.items }),
		},
	),
);

/** Selector helpers (non-hook derived helpers) */
export function isInWishlist(items: string[], id: string): boolean {
	return items.includes(id);
}

export function getWishlistCount(items: string[]): number {
	return items.length;
}
