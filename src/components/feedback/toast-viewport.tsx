"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useToastStore } from "@/stores/use-toast-store";

const variantStyles = {
  success: "border-emerald-500/25 bg-emerald-500/10",
  error: "border-rose-500/25 bg-rose-500/10",
  info: "border-coral/25 bg-coral/10"
} as const;

export function ToastViewport() {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  useEffect(() => {
    if (toasts.length === 0) {
      return;
    }

    const timers = toasts.map((toast) =>
      window.setTimeout(() => removeToast(toast.id), 2600)
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [removeToast, toasts]);

  return (
    <div className="pointer-events-none fixed left-1/2 top-5 z-[60] flex w-[min(92vw,420px)] -translate-x-1/2 flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto rounded-[24px] border bg-surface p-4 shadow-card transition",
            variantStyles[toast.variant]
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
              <p className="text-sm font-semibold">{toast.title}</p>
              {toast.description ? (
                <p className="mt-2 text-sm leading-6 text-ink/66">
                  {toast.description}
                </p>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-line/10 bg-paper text-sm transition hover:border-coral/35 hover:bg-soft"
              aria-label="토스트 닫기"
            >
              <span aria-hidden>✕</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
