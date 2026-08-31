import Link from 'next/link'

export interface CatRowProps {
  label: string
  description?: string | null
  count: number
  href: string
}

export function CatRow({ label, description, count, href }: CatRowProps) {
  return (
    <Link href={href} className="lp-cat-row">
      <span className="lp-cat-mark" aria-hidden="true">
        {label.charAt(0).toUpperCase()}
      </span>
      <div className="lp-cat-info">
        <span className="lp-cat-name">{label}</span>
        {description ? <span className="lp-cat-desc">{description}</span> : null}
      </div>
      <span className="lp-cat-count">
        {count} {count === 1 ? 'product' : 'products'}
      </span>
      <span className="lp-cat-arrow" aria-hidden="true">
        →
      </span>
    </Link>
  )
}