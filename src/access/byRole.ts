import type { Access } from 'payload'

import type { User } from '@/payload-types'

type Role = User['role']

const role = (user: User | null | undefined): Role | undefined => user?.role

export const anyone: Access = () => true

export const authenticated: Access = ({ req: { user } }) => Boolean(user)

export const adminOnly: Access = ({ req: { user } }) => {
    const r = role(user as User | null)
    return r === 'admin'
}

export const employeeOrAdmin: Access = ({ req: { user } }) => {
    const r = role(user as User | null)
    return r === 'admin' || r === 'employee'
}

export const selfOnly: Access = ({ req: { user } }) => {
    if (!user) return false
    return { id: { equals: user.id } }
}

export const selfOrAdmin: Access = ({ req: { user } }) => {
    if (!user) return false
    if ((user as User).role === 'admin') return true
    return { id: { equals: user.id } }
}

export const ownerOrStaff: Access = ({ req: { user } }) => {
    if (!user) return false
    if ((user as User).role === 'admin') return true
    if ((user as User).role === 'employee') return true
    return { user: { equals: user.id } }
}