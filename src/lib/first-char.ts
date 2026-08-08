export const firstChar = (s: string | null | undefined): string => {
    const t = (s ?? '').trim()
    if (!t) return '?'
    const arr = Array.from(t)
    return arr[0] ?? '?'
}