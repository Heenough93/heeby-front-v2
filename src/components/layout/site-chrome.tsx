"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { AccessControl } from "@/components/layout/access-control";
import { AnnouncementHost } from "@/components/feedback/announcement-host";
import { ToastViewport } from "@/components/feedback/toast-viewport";
import { GuestAccessNotice } from "@/components/layout/guest-access-notice";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useAccessStore, type AccessMode } from "@/stores/use-access-store";

type SiteChromeProps = {
  children: React.ReactNode;
};

const navItems = [
  {
    href: "/",
    label: "홈",
    description: "오늘 상태와 빠른 실행",
    access: ["guest", "member", "admin"]
  },
  {
    href: "/journals",
    label: "기록",
    description: "저장한 기록 다시 보기",
    access: ["member", "admin"]
  },
  {
    href: "/templates",
    label: "템플릿",
    description: "질문 구조 관리",
    access: ["member", "admin"]
  },
  {
    href: "/journals/new",
    label: "새 기록",
    description: "템플릿으로 바로 시작",
    access: ["member", "admin"]
  }
];

export function SiteChrome({ children }: SiteChromeProps) {
  const pathname = usePathname();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const accessMode = useAccessStore((state) => state.accessMode);
  const visibleNavItems = navItems.filter((item) =>
    item.access.includes(accessMode)
  );
  const canAccessCurrentPage =
    pathname === "/" || accessMode === "member" || accessMode === "admin";

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isMobileNavOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileNavOpen]);

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-40 border-b border-line/10 bg-paper/92 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-line/10 bg-surface text-xl transition hover:border-coral/35 hover:bg-soft lg:hidden"
              aria-label="메뉴 열기"
            >
              <span aria-hidden>☰</span>
            </button>

            <Link
              href="/"
              className="inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-line/10 bg-surface transition hover:border-coral/35 hover:bg-soft"
              aria-label="홈으로 이동"
            >
              <Image
                src="/images/me.png"
                alt="홈"
                width={48}
                height={48}
                className="h-full w-full object-cover"
              />
            </Link>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-coral">
                Heeby
              </p>
              <p className="mt-1 text-sm text-ink/62">
                템플릿 기반 개인 허브
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <AccessControl />
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          isMobileNavOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
      >
        <button
          type="button"
          className={cn(
            "absolute inset-0 bg-ink/35 transition-opacity duration-300 ease-out",
            isMobileNavOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setIsMobileNavOpen(false)}
          aria-label="메뉴 닫기"
        />

        <div
          className={cn(
            "absolute left-0 top-0 flex h-full w-[88vw] max-w-sm flex-col gap-5 overflow-y-auto border-r border-line/10 bg-paper px-5 py-5 shadow-card transition-transform duration-300 ease-out",
            isMobileNavOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-coral">
                Heeby
              </p>
              <p className="mt-1 text-sm text-ink/62">
                템플릿 기반 개인 허브
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsMobileNavOpen(false)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line/10 bg-surface text-lg transition hover:border-coral/35 hover:bg-soft"
              aria-label="메뉴 닫기"
            >
              <span aria-hidden>✕</span>
            </button>
          </div>

          <div className="md:hidden">
            <AccessControl />
          </div>

          <NavigationPanel
            pathname={pathname}
            visibleNavItems={visibleNavItems}
          />

          <AccessInfoPanel accessMode={accessMode} />

          {accessMode === "admin" ? <AdminInfoPanel /> : null}
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-7xl gap-8 px-5 py-8 md:px-8 md:py-10">
        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-[92px] grid gap-5">
            <NavigationPanel
              pathname={pathname}
              visibleNavItems={visibleNavItems}
            />
            <AccessInfoPanel accessMode={accessMode} />
            {accessMode === "admin" ? <AdminInfoPanel /> : null}
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          {canAccessCurrentPage ? children : <GuestAccessNotice />}
        </main>
      </div>

      <footer className="border-t border-line/10 bg-surface/88">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 md:grid-cols-[1.2fr_1fr] md:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-coral">
              Heeby
            </p>
            <p className="mt-3 max-w-xl text-sm leading-6 text-ink/62">
              © 2026 Heebyeong Park. All rights reserved.
            </p>
          </div>

          <div className="grid gap-3 text-sm text-ink/62">
            <p>주요 흐름: 템플릿 만들기, 기록 작성, 기록 다시 보기</p>
            <p>현재 버전: mock 기반 MVP</p>
          </div>
        </div>
      </footer>

      <AnnouncementHost />
      <ToastViewport />
    </div>
  );
}

type NavigationItem = (typeof navItems)[number];

type NavigationPanelProps = {
  pathname: string;
  visibleNavItems: NavigationItem[];
};

function NavigationPanel({
  pathname,
  visibleNavItems
}: NavigationPanelProps) {
  return (
    <section className="rounded-[28px] border border-line/10 bg-surface p-5 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-coral">
        Navigation
      </p>
      <nav className="mt-4 grid gap-2">
        {visibleNavItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === item.href
              : pathname === item.href ||
                (item.href !== "/journals/new" &&
                  pathname.startsWith(`${item.href}/`) &&
                  !pathname.startsWith("/journals/new"));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-[22px] border px-4 py-4 transition",
                isActive
                  ? "border-coral/35 bg-coral/10"
                  : "border-line/10 bg-paper hover:border-coral/30 hover:bg-soft"
              )}
            >
              <p className="text-sm font-semibold text-ink">{item.label}</p>
              <p className="mt-1 text-xs leading-5 text-ink/58">
                {item.description}
              </p>
            </Link>
          );
        })}
      </nav>
    </section>
  );
}

function AccessInfoPanel({ accessMode }: { accessMode: AccessMode }) {
  return (
    <section className="rounded-[28px] border border-line/10 bg-surface p-5 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-coral">
        Access
      </p>
      <div className="mt-4 grid gap-3 text-sm leading-6 text-ink/68">
        <p>
          현재 모드:
          {" "}
          <span className="font-semibold">{getAccessModeLabel(accessMode)}</span>
        </p>
        <p>{getAccessModeDescription(accessMode)}</p>
      </div>
    </section>
  );
}

function AdminInfoPanel() {
  return (
    <section className="rounded-[28px] border border-line/10 bg-surface p-5 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-coral">
        Admin
      </p>
      <div className="mt-4 grid gap-3 text-sm leading-6 text-ink/68">
        <p>실험 기능, 민감한 설정, 관리 도구를 분리해 붙일 자리입니다.</p>
        <p>지금 단계에서는 구조만 먼저 확보합니다.</p>
      </div>
    </section>
  );
}

function getAccessModeLabel(accessMode: AccessMode) {
  if (accessMode === "guest") {
    return "게스트";
  }

  if (accessMode === "admin") {
    return "어드민";
  }

  return "일반";
}

function getAccessModeDescription(accessMode: AccessMode) {
  if (accessMode === "guest") {
    return "서비스 소개와 홈 구조만 열고, 기록 및 템플릿 화면은 가립니다.";
  }

  if (accessMode === "admin") {
    return "일반 사용 흐름에 더해 운영성 기능과 실험용 화면을 추가로 노출합니다.";
  }

  return "기록, 템플릿, 홈 대시보드 등 기본 개인 사용 흐름을 모두 엽니다.";
}
