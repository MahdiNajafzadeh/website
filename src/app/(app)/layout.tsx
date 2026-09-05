import type React from "react";
import { getCurrentUserWithSettings } from "@/lib/current-user";
import { t } from "@/lib/t";

import "../globals.css";

import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getLogoUrl } from "@/lib/media";

export const dynamic = "force-dynamic";

export const metadata = {
	description: "A blank template using Payload in a Next.js app.",
	title: "Payload Blank Template",
};

export default async function RootLayout(props: { children: React.ReactNode }) {
	const { children } = props;
	const { user: currentUser, settings } = await getCurrentUserWithSettings();

	const siteName = settings ? settings.name : t("site.nameFallback");
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