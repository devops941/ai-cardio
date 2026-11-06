"use client";

import * as React from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { t } from "@/lib/i18n";

export interface ConfirmDeleteDialogProps {
  /** Whether the dialog is open. */
  open: boolean;
  /** Called by Radix when the dialog should close (Escape key, overlay click). */
  onOpenChange: (open: boolean) => void;
  /** Bold heading shown at the top of the dialog. */
  title: string;
  /** Descriptive sentence explaining what will be deleted. Used as aria-describedby. */
  description: string;
  /** Label for the confirm/delete button. Defaults to the i18n "admin.delete" string. */
  confirmLabel?: string;
  /** Called only when the user clicks the confirm button. Run your delete logic here. */
  onConfirm: () => void;
}

/**
 * A controlled, accessible confirmation dialog for destructive deletions.
 * Uses AlertDialog primitives so the browser cannot block it and focus is
 * trapped correctly inside the modal while it is open.
 */
export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
}: ConfirmDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("admin.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onConfirm();
            }}
          >
            {confirmLabel ?? t("admin.delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
