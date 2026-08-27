"use client";

import { Check, Moon, Monitor, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { useTranslation } from "@/components/i18n/TranslationProvider";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ThemeOption = "light" | "dark" | "system";

const OPTIONS: ThemeOption[] = ["light", "dark", "system"];

export const ThemeToggle = () => {
    const { theme, resolvedTheme, setTheme } = useTheme();
    const { t } = useTranslation();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const active: ThemeOption = mounted ? ((theme as ThemeOption | undefined) ?? "system") : "system";

    const resolved = mounted ? resolvedTheme : undefined;

    const TriggerIcon = !mounted ? Monitor : active === "system" ? Monitor : resolved === "dark" ? Moon : Sun;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={
                    <Button variant="ghost" size="icon" aria-label={t("layout.theme.aria")}>
                        <TriggerIcon className="size-5" />
                    </Button>
                }
            />
            <DropdownMenuContent align="end" className="w-40">
                {OPTIONS.map((option) => (
                    <DropdownMenuItem
                        key={option}
                        onClick={() => setTheme(option)}
                        className="flex items-center justify-between"
                    >
                        <span>{t(`layout.theme.${option}`)}</span>
                        {option === active ? <Check className="size-4" /> : null}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
