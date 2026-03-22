import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import meImage from "@/../docs-internal/me.png";

type SiteChromeProps = {
  children: React.ReactNode;
};

const navItems = [
  { href: "/journals", label: "기록" },
  { href: "/templates", label: "템플릿" },
  { href: "/journals/new", label: "새 기록" }
];

export function SiteChrome({ children }: SiteChromeProps) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="border-b border-line/10 bg-paper/92 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5 md:px-8">
          <nav className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="inline-flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-line/10 bg-surface transition hover:border-coral/35 hover:bg-soft"
              aria-label="홈으로 이동"
            >
              <Image
                src={meImage}
                alt="홈"
                className="h-full w-full object-cover"
              />
            </Link>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full border border-line/10 bg-surface px-5 py-3 text-sm font-medium text-ink/80 transition",
                  "hover:border-coral/35 hover:bg-soft"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <ThemeToggle />
        </div>
      </header>

      <main className="px-6 py-8 md:px-8 md:py-10">{children}</main>

      <footer className="border-t border-line/10 bg-surface/88">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 py-8 md:grid-cols-[1.2fr_1fr] md:px-8">
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
    </div>
  );
}
