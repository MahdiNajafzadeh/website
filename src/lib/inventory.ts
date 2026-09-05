export const LOW_STOCK_THRESHOLD = 5;

export interface StockState {
	isOutOfStock: boolean;
	isLowStock: boolean;
	inventory: number;
}

export function getStockState(inventory: number | null | undefined): StockState {
	const inv = inventory ?? 0;
	return {
		isOutOfStock: inv <= 0,
		isLowStock: inv > 0 && inv <= LOW_STOCK_THRESHOLD,
		inventory: inv,
	};
}