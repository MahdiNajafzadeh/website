'use client'

import { useEffect, useState } from 'react'

type Props = {
    message: string
    actionLabel: string
    durationMs?: number
    onUndo: () => void
    onExpire: () => void
}

export const UndoToast = ({ message, actionLabel, durationMs = 5000, onUndo, onExpire }: Props) => {
    const [open, setOpen] = useState(true)

    useEffect(() => {
        const t = window.setTimeout(() => {
            setOpen(false)
            onExpire()
        }, durationMs)
        return () => window.clearTimeout(t)
    }, [durationMs, onExpire])

    if (!open) return null

    return (
        <div
            role="status"
            aria-live="polite"
            className="fixed inset-x-0 bottom-4 z-50 mx-auto flex w-fit max-w-[90vw] items-center gap-3 rounded-lg border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-lg"
        >
            <span>{message}</span>
            <button
                type="button"
                className="font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:rounded"
                onClick={() => {
                    onUndo()
                    setOpen(false)
                }}
            >
                {actionLabel}
            </button>
        </div>
    )
}
