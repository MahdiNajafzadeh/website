import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'

import config from '@payload-config'

export type CurrentUserShape = {
  id: number
  role?: string | null
  customerType?: 'regular' | 'partner' | null
  firstName?: string | null
  lastName?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
}

export async function getCurrentUser(): Promise<CurrentUserShape | null> {
  try {
    const hdrs = await getHeaders()
    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: hdrs })
    if (!user) return null
    return user as unknown as CurrentUserShape
  } catch {
    return null
  }
}