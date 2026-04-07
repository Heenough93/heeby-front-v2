"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  canAccessFeature,
  canAccessPath
} from "@/features/access/lib/access-policy";
import { AccessControl } from "@/features/access/components/access-control";
import { AnnouncementHost } from "@/shared/components/feedback/announcement-host";
import { ToastViewport } from "@/shared/components/feedback/toast-viewport";
import { AccessGateNotice } from "@/features/access/components/access-gate-notice";
import { ThemeToggle } from "@/shared/components/layout/theme-toggle";
import {
  getAccessMode,
  useAccessStore
} from "@/features/access/store/access-store";

type SiteChromeProps = {
  children: React.ReactNode;
};

type NavigationItem = {
  href: string;
  label: string;
  feature: keyof typeof import("@/features/access/lib/access-policy").featurePolicies;
};

const navItems: NavigationItem[] = [
  {
    href: "/",
    label: "홈",
    feature: "home"
  },
  {
    href: "/journals",
    label: "기록",
    feature: "journalArchive"
  },
  {
    href: "/travel",
    label: "여행",
    feature: "travelArchive"
  },
  {
    href: "/routines",
    label: "루틴",
    feature: "routineArchive"
  },
  {
    href: "/stocks",
    label: "주식",
    feature: "stockArchive"
  },
  {
    href: "/templates",
    label: "템플릿",
    feature: "journalTemplateAdmin"
  }
] ;

export function SiteChrome({ children }: SiteChromeProps) {
  const pathname = usePathname();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const accessMode = useAccessStore(getAccessMode);
  const canAccessCurrentPage = canAccessPath(accessMode, pathname);
  const showContactButton = accessMode === "guest";
  const visibleNavItems = navItems.filter((item) =>
    canAccessFeature(accessMode, item.feature)
  );
  const headerNavItems = showContactButton
    ? [
        ...visibleNavItems.slice(0, 3),
        {
          href: "/contact",
          label: "문의",
          feature: "contact" as const
        },
        ...visibleNavItems.slice(3)
      ]
    : visibleNavItems;

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
              <p className="text-base font-bold uppercase tracking-[0.28em] text-coral md:text-2xl">
                Heeby
              </p>
            </div>
          </div>

          <div className="hidden min-w-0 flex-1 justify-center lg:flex">
            <HeaderNavigation
              pathname={pathname}
              visibleNavItems={headerNavItems}
            />
          </div>

          <div className="flex items-center gap-3">
            <AccessControl />
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
            "absolute left-0 top-0 flex h-full w-[76vw] max-w-[18rem] flex-col gap-5 overflow-y-auto border-r border-line/10 bg-paper px-5 py-5 shadow-card transition-transform duration-300 ease-out",
            isMobileNavOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-base font-bold uppercase tracking-[0.28em] text-coral md:text-lg">
                Heeby
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

          <NavigationPanel
            pathname={pathname}
            visibleNavItems={headerNavItems}
          />
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-5 py-8 md:px-8 md:py-10">
        <main className="min-w-0">
          {canAccessCurrentPage ? children : <AccessGateNotice />}
        </main>
      </div>

      <footer className="border-t border-line/10 bg-surface/88">
        <div className="mx-auto grid max-w-7xl justify-items-center gap-1 px-5 py-8 text-center md:px-8">
          <div>
            <p className="text-base font-bold uppercase tracking-[0.3em] text-coral md:text-xl">
              HEEBY
            </p>
          </div>
          <p className="text-sm leading-6 text-ink/62">
            © 2026 Heebyeong Park. All rights reserved.
          </p>
          <Link
            href="https://github.com/Heenough93"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line/10 bg-paper text-ink/68 transition hover:border-coral/30 hover:bg-soft hover:text-coral"
            aria-label="GitHub"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-5 w-5 fill-current"
            >
              <path d="M12 2C6.48 2 2 6.58 2 12.22c0 4.5 2.87 8.32 6.84 9.66.5.1.68-.22.68-.49 0-.24-.01-1.04-.01-1.89-2.78.62-3.37-1.2-3.37-1.2-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.36 1.12 2.93.86.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.09 0-1.13.39-2.05 1.03-2.77-.1-.26-.45-1.31.1-2.74 0 0 .84-.28 2.75 1.06A9.3 9.3 0 0 1 12 6.84c.85 0 1.7.12 2.5.35 1.9-1.34 2.74-1.06 2.74-1.06.55 1.43.2 2.48.1 2.74.64.72 1.03 1.64 1.03 2.77 0 3.96-2.34 4.82-4.57 5.08.36.32.68.94.68 1.9 0 1.38-.01 2.49-.01 2.83 0 .27.18.59.69.49A10.24 10.24 0 0 0 22 12.22C22 6.58 17.52 2 12 2Z" />
            </svg>
          </Link>
        </div>
      </footer>

      <AnnouncementHost />
      <ToastViewport />
    </div>
  );
}

type NavigationPanelProps = {
  pathname: string;
  visibleNavItems: NavigationItem[];
};

function HeaderNavigation({
  pathname,
  visibleNavItems
}: NavigationPanelProps) {
  const [isStockMenuOpen, setIsStockMenuOpen] = useState(
    pathname.startsWith("/stocks")
  );
  const stockMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (
          stockMenuRef.current &&
          !stockMenuRef.current.contains(event.target as Node)
      ) {
          setIsStockMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);


  return (
    <nav className="flex items-center gap-2">
      {visibleNavItems.map((item) => {
        if (item.href === "/stocks") {
          const isParentActive = pathname.startsWith("/stocks");

          return (
            <div key={item.href} className="relative" ref={stockMenuRef}>
              <button
                type="button"
                onClick={() => setIsStockMenuOpen((current) => !current)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition",
                  isParentActive
                    ? "border-coral/35 bg-coral/10 text-ink"
                    : "border-line/10 bg-surface text-ink hover:border-coral/30 hover:bg-soft"
                )}
              >
                <span>{item.label}</span>
                <span className="text-xs text-ink/50">
                  {isStockMenuOpen ? "−" : "+"}
                </span>
              </button>

              {isStockMenuOpen ? (
                <div className="absolute left-1/2 top-full z-30 mt-3 grid min-w-[12rem] -translate-x-1/2 gap-2 rounded-[24px] border border-line/10 bg-paper p-3 shadow-card">
                  <Link
                    href="/stocks/snapshots?scope=KR"
                    onClick={() => setIsStockMenuOpen(false)}
                    className={cn(
                      "rounded-[18px] border px-3 py-3 text-sm font-semibold transition",
                      pathname.startsWith("/stocks/snapshots")
                        ? "border-coral/35 bg-soft text-ink"
                        : "border-line/10 bg-surface text-ink hover:border-coral/30 hover:bg-soft"
                    )}
                  >
                    시총 스냅샷
                  </Link>

                  <Link
                    href="/stocks/trades"
                    onClick={() => setIsStockMenuOpen(false)}
                    className={cn(
                      "rounded-[18px] border px-3 py-3 text-sm font-semibold transition",
                      pathname.startsWith("/stocks/trades")
                        ? "border-coral/35 bg-soft text-ink"
                        : "border-line/10 bg-surface text-ink hover:border-coral/30 hover:bg-soft"
                    )}
                  >
                    매매일지
                  </Link>

                  <Link
                    href="/stocks/ipos"
                    onClick={() => setIsStockMenuOpen(false)}
                    className={cn(
                      "rounded-[18px] border px-3 py-3 text-sm font-semibold transition",
                      pathname.startsWith("/stocks/ipos")
                        ? "border-coral/35 bg-soft text-ink"
                        : "border-line/10 bg-surface text-ink hover:border-coral/30 hover:bg-soft"
                    )}
                  >
                    공모주
                  </Link>
                </div>
              ) : null}
            </div>
          );
        }

        const isActive =
          item.href === "/"
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-semibold transition",
              isActive
                ? "border-coral/35 bg-coral/10 text-ink"
                : "border-line/10 bg-surface text-ink hover:border-coral/30 hover:bg-soft"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function NavigationPanel({
  pathname,
  visibleNavItems
}: NavigationPanelProps) {
  const [isStockMenuOpen, setIsStockMenuOpen] = useState(
    pathname.startsWith("/stocks")
  );

  return (
    <section className="rounded-[28px] border border-line/10 bg-surface p-5 shadow-card">
      <nav className="grid gap-2">
        {visibleNavItems.map((item) => {
          if (item.href === "/stocks") {
            const isParentActive = pathname.startsWith("/stocks");

            return (
              <div
                key={item.href}
                className={cn(
                  "rounded-[22px] border transition",
                  isParentActive
                    ? "border-coral/35 bg-coral/10"
                    : "border-line/10 bg-paper"
                )}
              >
                <button
                  type="button"
                  onClick={() => setIsStockMenuOpen((current) => !current)}
                  className="flex w-full items-start justify-between gap-3 px-4 py-4 text-left"
                >
                  <div>
                    <p className="text-sm font-semibold text-ink">{item.label}</p>
                  </div>
                  <span className="text-sm text-ink/48">
                    {isStockMenuOpen ? "−" : "+"}
                  </span>
                </button>

                {isStockMenuOpen ? (
                  <div className="grid gap-2 border-t border-line/10 px-3 pb-3 pt-2">
                    <Link
                      href="/stocks/snapshots?scope=KR"
                      className={cn(
                        "rounded-[18px] border px-3 py-3 transition",
                        pathname.startsWith("/stocks/snapshots")
                          ? "border-coral/35 bg-paper"
                          : "border-line/10 bg-surface hover:border-coral/30 hover:bg-soft"
                      )}
                    >
                      <p className="text-sm font-semibold text-ink">시총 스냅샷</p>
                    </Link>

                    <Link
                      href="/stocks/trades"
                      className={cn(
                        "rounded-[18px] border px-3 py-3 transition",
                        pathname.startsWith("/stocks/trades")
                          ? "border-coral/35 bg-paper"
                          : "border-line/10 bg-surface hover:border-coral/30 hover:bg-soft"
                      )}
                    >
                      <p className="text-sm font-semibold text-ink">매매일지</p>
                    </Link>

                    <Link
                      href="/stocks/ipos"
                      className={cn(
                        "rounded-[18px] border px-3 py-3 transition",
                        pathname.startsWith("/stocks/ipos")
                          ? "border-coral/35 bg-paper"
                          : "border-line/10 bg-surface hover:border-coral/30 hover:bg-soft"
                      )}
                    >
                      <p className="text-sm font-semibold text-ink">공모주</p>
                    </Link>
                  </div>
                ) : null}
              </div>
            );
          }

          const isActive =
            item.href === "/"
              ? pathname === item.href
              : pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

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
            </Link>
          );
        })}
      </nav>
    </section>
  );
}
