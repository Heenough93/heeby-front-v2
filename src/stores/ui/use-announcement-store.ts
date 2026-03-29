"use client";

import { nanoid } from "nanoid";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type AnnouncementDismissMode = "close-only" | "hide-for-today";

export type Announcement = {
  id: string;
  title: string;
  description: string;
  primaryActionLabel?: string;
  primaryActionHref?: string;
  dismissMode: AnnouncementDismissMode;
  isActive: boolean;
  priority: number;
};

export type AnnouncementDraft = Omit<Announcement, "id">;

type AnnouncementStore = {
  announcements: Announcement[];
  upsertAnnouncement: (announcement: Partial<Announcement> & AnnouncementDraft) => void;
  removeAnnouncement: (id: string) => void;
  resetAnnouncements: () => void;
};

export const defaultAnnouncements: Announcement[] = [
  {
    id: "welcome-announcement",
    title: "Heeby에 오신 것을 환영합니다",
    description:
      "기록은 템플릿으로 빠르게 시작하고, 홈에서는 여행과 주식 같은 생활 기능을 함께 연결할 수 있습니다.",
    primaryActionLabel: "새 기록 시작",
    primaryActionHref: "/journals/new",
    dismissMode: "hide-for-today",
    isActive: true,
    priority: 100
  }
];

export const useAnnouncementStore = create<AnnouncementStore>()(
  persist(
    (set) => ({
      announcements: defaultAnnouncements,
      upsertAnnouncement: (announcement) => {
        set((state) => {
          const nextAnnouncement: Announcement = {
            id: announcement.id ?? nanoid(),
            title: announcement.title.trim(),
            description: announcement.description.trim(),
            primaryActionLabel: announcement.primaryActionLabel?.trim() || "",
            primaryActionHref: announcement.primaryActionHref?.trim() || "",
            dismissMode: announcement.dismissMode,
            isActive: announcement.isActive,
            priority: announcement.priority
          };

          const exists = state.announcements.some(
            (item) => item.id === nextAnnouncement.id
          );

          return {
            announcements: exists
              ? state.announcements.map((item) =>
                  item.id === nextAnnouncement.id ? nextAnnouncement : item
                )
              : [...state.announcements, nextAnnouncement]
          };
        });
      },
      removeAnnouncement: (id) =>
        set((state) => ({
          announcements: state.announcements.filter((item) => item.id !== id)
        })),
      resetAnnouncements: () => set({ announcements: defaultAnnouncements })
    }),
    {
      name: "heeby-announcement-store",
      storage: createJSONStorage(() => localStorage)
    }
  )
);
