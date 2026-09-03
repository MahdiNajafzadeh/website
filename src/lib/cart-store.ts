import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CartItem = {
	id: string;
	name: string;
	price: number;
	image?: string;
	quantity: number;
	productId?: string;
};

type CartState = {
	items: CartItem[];
	lastRemoved: CartItem | null;
	addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
	updateQuantity: (id: string, quantity: number) => void;
	removeItem: (id: string) => void;
	undoRemove: () => void;
	clearCart: () => void;
	/** @deprecated alias for clearCart — used on checkout success */
	clearOnCheckout: () => void;
	getTotal: () => number;
	getCount: () => number;
};

export const useCartStore = create<CartState>()(
	persist(
		(set, get) => ({
			items: [],
			lastRemoved: null,

			addItem: (item) =>
				set((state) => {
					const qty = item.quantity ?? 1;
					const existing = state.items.find((i) => i.id === item.id);
					if (existing) {
						return {
							items: state.items.map((i) =>
								i.id === item.id ? { ...i, quantity: i.quantity + qty } : i,
							),
						};
					}
					const newItem: CartItem = {
						id: item.id,
						name: item.name,
						price: item.price,
						image: item.image,
						quantity: qty,
						productId: item.productId,
					};
					return { items: [...state.items, newItem] };
				}),

			updateQuantity: (id, quantity) =>
				set((state) => {
					if (quantity <= 0) {
						const target = state.items.find((i) => i.id === id) ?? null;
						return {
							items: state.items.filter((i) => i.id !== id),
							lastRemoved: target ?? state.lastRemoved,
						};
					}
					return {
						items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
					};
				}),

			removeItem: (id) =>
				set((state) => {
					const target = state.items.find((i) => i.id === id) ?? null;
					if (!target) return state;
					return {
						items: state.items.filter((i) => i.id !== id),
						lastRemoved: target,
					};
				}),

			undoRemove: () =>
				set((state) => {
					const { lastRemoved } = state;
					if (!lastRemoved) return state;
					const exists = state.items.some((i) => i.id === lastRemoved.id);
					if (exists) return { lastRemoved: null };
					return {
						items: [...state.items, lastRemoved],
						lastRemoved: null,
					};
				}),

			clearCart: () => set({ items: [], lastRemoved: null }),

			clearOnCheckout: () => set({ items: [], lastRemoved: null }),

			getTotal: () => {
				const { items } = get();
				return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
			},

			getCount: () => {
				const { items } = get();
				return items.reduce((sum, item) => sum + item.quantity, 0);
			},
		}),
		{
			name: "cart-storage",
			storage: createJSONStorage(() => {
				if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
					return window.localStorage;
				}
				// Return undefined on server / unsupported env — persist will no-op
				return undefined as unknown as Storage;
			}),
			partialize: (state) => ({ items: state.items, lastRemoved: state.lastRemoved }),
		},
	),
);

/** Selectors for convenience (non-hook derived helpers) */
export function getCartTotal(items: CartItem[]): number {
	return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

export function getCartCount(items: CartItem[]): number {
	return items.reduce((sum, i) => sum + i.quantity, 0);
}
