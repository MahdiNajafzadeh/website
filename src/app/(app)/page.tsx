import { redirect } from "next/navigation";

import { DEFAULT_LOCALE } from "@/lib/locale";

export default function RootIndex(): never {
    redirect(`/${DEFAULT_LOCALE}`);
}
