"use client";

import Link from "next/link";
import { useEffect } from "react";
import type { Announcement } from "@/stores/ui/use-announcement-store";

type AnnouncementModalProps = {
  announcement: Announcement | null;
  onClose: () => void;
  onHideForToday: () => void;
};

export function AnnouncementModal({
  announcement,
  onClose,
  onHideForToday
}: AnnouncementModalProps) {
  useEffect(() => {
    if (!announcement) {
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [announcement]);

  if (!announcement) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
      <button
        type="button"
        className="absolute inset-0 bg-ink/45"
        onClick={onClose}
        aria-label="공지 닫기"
      />

      <section className="relative w-full max-w-lg rounded-[32px] border border-line/10 bg-surface p-7 shadow-card md:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-coral">
          Announcement
        </p>
        <h2 className="mt-4 text-2xl font-bold md:text-3xl">
          {announcement.title}
        </h2>
        <p className="mt-4 text-sm leading-7 text-ink/68 md:text-base">
          {announcement.description}
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-end gap-3">
          {announcement.dismissMode === "hide-for-today" ? (
            <button
              type="button"
              onClick={onHideForToday}
              className="rounded-full border border-line/10 bg-paper px-4 py-3 text-sm font-semibold transition hover:border-coral/35 hover:bg-soft"
            >
              오늘 하루 보지 않기
            </button>
          ) : null}

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-line/10 bg-paper px-4 py-3 text-sm font-semibold transition hover:border-coral/35 hover:bg-soft"
          >
            닫기
          </button>

          {announcement.primaryActionLabel && announcement.primaryActionHref ? (
            <Link
              href={announcement.primaryActionHref}
              onClick={onClose}
              className="rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              {announcement.primaryActionLabel}
            </Link>
          ) : null}
        </div>
      </section>
    </div>
  );
}
