/**
 * Validate a `redirect` query param so that we only ever navigate to a
 * locale-relative path on this site. Returns `/` if the value is missing,
 * malformed, or points off-site.
 */
export const sanitizeRedirect = (raw: string | undefined): string => {
    if (!raw) return '/'
    try {
        const decoded = decodeURIComponent(raw)
        if (!decoded.startsWith('/')) return '/'
        if (decoded.startsWith('//')) return '/'
        return decoded
    } catch {
        return '/'
    }
}
