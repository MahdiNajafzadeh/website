import { Vazirmatn } from 'next/font/google'
import React from 'react'

import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import './styles.css'

const vazirmatn = Vazirmatn({
    subsets: ['arabic', 'latin'],
    display: 'swap',
    variable: '--font-vazirmatn',
})

export const metadata = {
    description: 'فروشگاه اینترنتی آبفارین — لوله و اتصالات',
    title: 'آبفارین',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
    const { children } = props

    return (
        <html lang="fa-IR" dir="rtl" className={vazirmatn.variable}>
            <body
                className={`${vazirmatn.className} flex min-h-screen flex-col bg-background text-foreground antialiased`}
            >
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
            </body>
        </html>
    )
}