"use client";

import * as React from "react";

import { useTranslation } from "@/components/i18n/TranslationProvider";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

type Variant = "default" | "destructive";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: Variant;
    onConfirm: () => void | Promise<void>;
};

export const ConfirmDialog = ({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel,
    cancelLabel,
    variant = "default",
    onConfirm,
}: Props) => {
    const { t } = useTranslation();
    const [busy, setBusy] = React.useState(false);
    const resolvedConfirm = confirmLabel ?? t("common.confirm");
    const resolvedCancel = cancelLabel ?? t("common.cancel");

    const handleConfirm = async () => {
        if (busy) return;
        try {
            setBusy(true);
            await onConfirm();
        } finally {
            setBusy(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description ? <DialogDescription>{description}</DialogDescription> : null}
                </DialogHeader>
                <DialogFooter>
                    <DialogClose render={<Button variant="outline" disabled={busy} />}>{resolvedCancel}</DialogClose>
                    <Button
                        variant={variant === "destructive" ? "destructive" : "default"}
                        onClick={handleConfirm}
                        disabled={busy}
                    >
                        {busy ? t("common.busy") : resolvedConfirm}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
