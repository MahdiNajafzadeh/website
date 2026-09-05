import type React from "react";
import { getSiteSettings } from "@/lib/site-settings";
import { getCurrentUser } from "@/lib/current-user";

import "../globals.css";

import type { Media, SiteSetting } from "@/payload-types";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const dynamic = "force-dynamic";

export const metadata = {
    description: "A blank template using Payload in a Next.js app.",
    title: "Payload Blank Template",
};

function getLogoUrl(logo: SiteSetting["logo"]): string | null {
    if (!logo) return null;
    if (typeof logo === "object" && logo !== null && "url" in logo) {
        const media = logo as Media;
        return media.url ?? null;
    }
    return null;
}

export default async function RootLayout(props: { children: React.ReactNode }) {
    const { children } = props;
    const [settings, currentUser] = await Promise.all([getSiteSettings(), getCurrentUser()]);

    const siteName = settings ? settings.name : "فروشگاه";
    const logoUrl = getLogoUrl(settings?.logo);

    return (
        <html lang="fa" dir="rtl" suppressHydrationWarning>
            <body className="min-h-screen bg-background text-foreground antialiased">
                <Header siteName={siteName} logoUrl={logoUrl} currentUser={currentUser} />

                <main>{children}</main>

                <Footer
                    siteName={siteName}
                    phones={settings?.phones}
                    emails={settings?.emails}
                    addresses={settings?.addresses}
                    socialLinks={settings?.socialLinks}
                />

                <Toaster richColors closeButton />
            </body>
        </html>
    );
}
