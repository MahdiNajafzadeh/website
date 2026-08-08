export const formatPrice = (amount: number): string => {
    return new Intl.NumberFormat('fa-IR').format(amount)
}

export const formatPriceToman = (amount: number): string => {
    return `${formatPrice(amount)} تومان`
}