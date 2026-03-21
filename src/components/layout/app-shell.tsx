import Link from "next/link";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: React.ReactNode;
  title: string;
  description: string;
  actions?: React.ReactNode;
};

const navItems = [
  { href: "/", label: "홈" },
  { href: "/journals", label: "기록" },
  { href: "/templates", label: "템플릿" },
  { href: "/journals/new", label: "새 기록" }
];

export function AppShell({
  children,
  title,
  description,
  actions
}: AppShellProps) {
  return (
    <main className="min-h-screen bg-paper px-6 py-8 text-ink md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-6 rounded-[30px] bg-white p-6 shadow-card md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-moss">
                Heeby
              </p>
              <h1 className="text-3xl font-bold md:text-4xl">{title}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/70 md:text-base">
                {description}
              </p>
            </div>
            {actions ? <div className="shrink-0">{actions}</div> : null}
          </div>

          <nav className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full border border-ink/10 bg-paper px-4 py-2 text-sm font-medium text-ink/80 transition",
                  "hover:border-ink/20 hover:bg-sand/60"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>

        {children}
      </div>
    </main>
  );
}
