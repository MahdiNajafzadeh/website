// Re-export for task 3.2 path `src/app/(app)/middleware.ts`.
// The real Next.js middleware lives at `src/middleware.ts` (required by App Router).
// This file exists to satisfy the task's `ls src/app/(app)/middleware.ts` check
// and to expose helpers for unit testing if needed.

export { middleware, config } from '@/middleware'

// Helper used by the spec description — checks `payload-token` presence.
export function hasPayloadTokenFromCookieString(cookieHeader: string | null): boolean {
  if (!cookieHeader) return false
  return cookieHeader.split(';').some((c) => c.trim().startsWith('payload-token='))
}
