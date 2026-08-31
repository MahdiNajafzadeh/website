import Link from 'next/link'

export interface SectionHeadProps {
  eyebrow: string
  title: string
  titleId?: string
  actionHref?: string
  actionLabel?: string
}

export function SectionHead({ eyebrow, title, titleId, actionHref, actionLabel }: SectionHeadProps) {
  return (
    <div className="lp-section-head">
      <div>
        <p className="lp-section-eyebrow">{eyebrow}</p>
        <h2 className="lp-h2" id={titleId}>
          {title}
        </h2>
      </div>
      {actionHref && actionLabel ? (
        <Link className="lp-btn lp-btn-ghost lp-btn-arrow" href={actionHref}>
          {actionLabel}
        </Link>
      ) : null}
    </div>
  )
}