import locale from '@/locale.json'

export type LocaleKey = keyof typeof locale

export function t(ref: LocaleKey): string {
  return locale[ref] as string
}

export function tFmt(ref: LocaleKey, vars: Record<string, string | number>): string {
  let out = locale[ref] as string
  for (const [k, v] of Object.entries(vars)) {
    out = out.replaceAll(`{${k}}`, String(v))
  }
  return out
}
