"use client";

import { ThemeProvider as NextThemeProvider, type ThemeProviderProps } from "next-themes";

export const ThemeProvider = (props: ThemeProviderProps) => {
    return <NextThemeProvider {...props} />;
};
