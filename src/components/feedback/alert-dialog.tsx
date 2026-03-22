"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";

type AlertDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "danger";
  onConfirm: () => void;
  onClose: () => void;
};

export function AlertDialog({
  open,
  title,
  description,
  confirmLabel = "확인",
  cancelLabel = "취소",
  variant = "default",
  onConfirm,
  onClose
}: AlertDialogProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
      <button
        type="button"
        className="absolute inset-0 bg-ink/40"
        onClick={onClose}
        aria-label="대화상자 닫기"
      />

      <div className="relative w-full max-w-md rounded-[28px] border border-line/10 bg-surface p-6 shadow-card md:p-7">
        <p className="text-xl font-bold">{title}</p>
        <p className="mt-3 text-sm leading-6 text-ink/66">{description}</p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-line/10 bg-paper px-4 py-2 text-sm font-semibold transition hover:border-coral/35 hover:bg-soft"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90",
              variant === "danger" ? "bg-rose-500" : "bg-coral"
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
