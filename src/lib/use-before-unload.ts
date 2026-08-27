"use client";

import { useEffect } from "react";

export const useBeforeUnload = (when: boolean) => {
    useEffect(() => {
        if (!when) return;
        const handler = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = "";
        };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [when]);
};
