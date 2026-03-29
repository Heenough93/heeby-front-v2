"use client";

import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { AnnouncementModal } from "@/shared/components/feedback/announcement-modal";
import { useAnnouncementStore } from "@/stores/ui/use-announcement-store";

const STORAGE_KEY = "heeby-announcement-dismissals";

export function AnnouncementHost() {
  const announcements = useAnnouncementStore((state) => state.announcements);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [hiddenTodayIds, setHiddenTodayIds] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as Record<string, string>;
      const today = dayjs().format("YYYY-MM-DD");
      const nextHiddenIds = Object.entries(parsed)
        .filter(([, value]) => value === today)
        .map(([key]) => key);

      setHiddenTodayIds(nextHiddenIds);
    } catch {
      setHiddenTodayIds([]);
    }
  }, []);

  const activeAnnouncement = useMemo(() => {
    if (!mounted) {
      return null;
    }

    return [...announcements]
      .filter(
        (announcement) =>
          announcement.isActive &&
          !dismissedIds.includes(announcement.id) &&
          !hiddenTodayIds.includes(announcement.id)
      )
      .sort((a, b) => b.priority - a.priority)[0] ?? null;
  }, [announcements, dismissedIds, hiddenTodayIds, mounted]);

  return (
    <AnnouncementModal
      announcement={activeAnnouncement}
      onClose={() => {
        if (!activeAnnouncement) {
          return;
        }

        setDismissedIds((current) => [...current, activeAnnouncement.id]);
      }}
      onHideForToday={() => {
        if (!activeAnnouncement) {
          return;
        }

        const today = dayjs().format("YYYY-MM-DD");
        const raw = window.localStorage.getItem(STORAGE_KEY);
        const parsed = raw ? (JSON.parse(raw) as Record<string, string>) : {};
        const next = {
          ...parsed,
          [activeAnnouncement.id]: today
        };

        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        setHiddenTodayIds((current) => [...current, activeAnnouncement.id]);
      }}
    />
  );
}
